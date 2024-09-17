import * as util from "node:util";
import fs from "node:fs";
import path from "node:path";
import * as kl from "kolorist";
import { pipeline } from "node:stream";

const __dirname = import.meta.dirname;
const streamPipeline = util.promisify(pipeline);

/* eslint-disable no-console */

/**
 * @typedef {{time: Record<string, string>, versions: Record<string, {dist: {tarball: string}}>}} NPMResponse
 */

(async () => {
	const res = await fetch("https://registry.npmjs.org/preact");

	/** @type {NPMResponse} */
	const json = await res.json();

	const versions = Object.keys(json.time).reduce((acc, version) => {
		if (/modified|created/.test(version)) {
			return acc;
		}

		const semver = version.split(".");
		if (+semver[0] < 10 || (+semver[0] === 10 && +semver[1] < 1)) {
			return acc;
		}

		acc.push(version);
		return acc;
	}, []);

	for (const version of versions) {
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
