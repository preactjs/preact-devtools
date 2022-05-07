const assert = require("assert");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");

let version = "";
function updateVersion(json, kind) {
	let [, major, minor, patch, rest] = json.version.match(
		/^(\d+)\.(\d+)\.(\d+)(.*)$/,
	);

	switch (kind) {
		case "major":
			major = Number(major) + 1;
			break;
		case "minor":
			minor = Number(minor) + 1;
			break;
		case "patch":
			patch = Number(patch) + 1;
			break;
	}

	json.version = `${major}.${minor}.${patch}${rest}`;
	version = json.version;
}

function format(file) {
	child_process.execSync(`./node_modules/.bin/prettier --write ${file}`);
}

const shellPath = path.join(__dirname, "..", "src", "shells");
function updateManifest(name, kind) {
	assert(/edge|chrome|firefox/.test(name), "Unknown browser");

	const file = path.join(shellPath, name, "manifest.json");
	const json = JSON.parse(fs.readFileSync(file, "utf-8"));
	updateVersion(json, kind);

	fs.writeFileSync(file, JSON.stringify(json, null, "\t"), "utf-8");
	format(file);
}

function updatePkgJson(kind) {
	const file = path.join(__dirname, "..", "package.json");
	const json = JSON.parse(fs.readFileSync(file, "utf-8"));
	updateVersion(json, kind);

	fs.writeFileSync(file, JSON.stringify(json, null, "\t"), "utf-8");
	format(file);
}

const [kind] = process.argv.slice(2);

assert(/major|minor|patch/.test(kind), "Unknown version increase");

const r = child_process.execSync("git status --porcelain");
assert(r.toString() === "", `Working directory is dirty^`);

updateManifest("edge", kind);
updateManifest("chrome", kind);
updateManifest("firefox", kind);
updatePkgJson(kind);

child_process.execSync(`git add package.json src/`);
child_process.execSync(`git commit -m "Release ${version}"`);
child_process.execSync(`git tag "v${version}"`);
