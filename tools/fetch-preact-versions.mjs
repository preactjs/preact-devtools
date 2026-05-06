import * as util from "util";
import fs from "fs";
import { glob } from "fs/promises";
import path from "path";
import * as kl from "kolorist";
import { pipeline } from "stream";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const streamPipeline = util.promisify(pipeline);

/* eslint-disable no-console */

/**
 * @typedef {{versions: Record<string, {dist: {tarball: string}}>, "dist-tags": Record<string, string>}} NPMResponse
 */

const root = path.join(__dirname, "..");
const versionReg = /\b(?:10|11)\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?\b/g;

function sortVersions(a, b) {
	const [releaseA, prereleaseA] = a.split("-");
	const [releaseB, prereleaseB] = b.split("-");
	const semverA = releaseA.split(".").map(Number);
	const semverB = releaseB.split(".").map(Number);

	for (const i of [0, 1, 2]) {
		const diff = semverA[i] - semverB[i];
		if (diff !== 0) return diff;
	}

	if (!prereleaseA && prereleaseB) return 1;
	if (prereleaseA && !prereleaseB) return -1;
	if (!prereleaseA && !prereleaseB) return 0;

	const partsA = prereleaseA.split(".");
	const partsB = prereleaseB.split(".");
	for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
		if (partsA[i] === undefined) return -1;
		if (partsB[i] === undefined) return 1;

		const numA = /^\d+$/.test(partsA[i]);
		const numB = /^\d+$/.test(partsB[i]);
		if (numA && numB && +partsA[i] !== +partsB[i]) {
			return +partsA[i] - +partsB[i];
		}
		if (numA !== numB) return numA ? -1 : 1;
		if (partsA[i] !== partsB[i]) return partsA[i] < partsB[i] ? -1 : 1;
	}

	return 0;
}

(async () => {
	const res = await fetch("https://registry.npmjs.org/preact");

	/** @type {NPMResponse} */
	const json = await res.json();

	const publishedVersions = Object.keys(json.versions);
	const versionsToFetch = new Set([json["dist-tags"].latest]);

	for await (const file of glob("test-e2e/tests/**/*.test.ts", { cwd: root })) {
		const text = fs
			.readFileSync(path.join(root, file), "utf8")
			.replace(/\/\*[\s\S]*?\*\//g, "")
			.replace(/\/\/.*/g, "");
		text.match(versionReg)?.forEach(version => versionsToFetch.add(version));
	}

	const pkg = fs.readFileSync(path.join(root, "package.json"), "utf8");
	pkg.replace(/PREACT_VERSION=(\d+)/g, (_, major) => {
		const matching = publishedVersions.filter(v => v.startsWith(`${major}.`));
		const stable = matching.filter(v => !v.includes("-"));
		versionsToFetch.add(
			(stable.length ? stable : matching).sort(sortVersions).at(-1),
		);
		return "";
	});

	const extras = process.argv.slice(2);
	if (process.env.PREACT_VERSION?.match(versionReg)) {
		extras.push(process.env.PREACT_VERSION);
	}

	for (const arg of extras) {
		const version = arg.replace(/^preact@/, "").replace(/^v/, "");
		if (!json.versions[version])
			throw new Error(`Unknown preact version "${arg}"`);
		versionsToFetch.add(version);
	}

	for (const version of [...versionsToFetch].sort(sortVersions)) {
		const tarball = json.versions[version].dist.tarball;
		const tgz = path.basename(tarball);
		const dest = path.join(
			__dirname,
			"..",
			"test-e2e",
			"fixtures",
			"vendor",
			"preact",
			tgz,
		);
		const prettyDest = path.relative(path.join(process.cwd()), dest);

		if (!fs.existsSync(dest)) {
			console.log(`Fetching ${kl.cyan(prettyDest)}...`);

			fs.mkdirSync(path.dirname(dest), { recursive: true });

			const res = await fetch(tarball);
			const out = fs.createWriteStream(dest);
			await streamPipeline(res.body, out);
		}
	}
})();
