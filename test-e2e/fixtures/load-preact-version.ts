import { Plugin } from "vite";
import fs from "fs";
import path from "path";
import * as tar from "tar";

/**
 * Load versioned preact module. Will unpack npm's tarball
 * on demand.
 */
export function loadPreactVersion(): Plugin {
	const pending = new Map<string, Array<() => void>>();
	const cache = new Map<string, any>();

	const versionReg = /preact@([^/]+)/;
	const tarDir = path.join(__dirname, "vendor", "preact");
	const cacheDir = path.join(tarDir, ".cache");

	return {
		name: "preact:version-resolver",
		enforce: "pre",
		resolveId(id) {
			const match = id.match(versionReg);
			if (match) {
				return id;
			}
		},
		async load(id) {
			const match = id.match(versionReg);
			if (match) {
				const version = match[1].replace(/_/g, ".");

				if (cache.has(id)) {
					return cache.get(id);
				} else if (version === "git") {
					const versionDir = path.join(process.cwd(), "..", "preact");
					const pkg = JSON.parse(
						fs.readFileSync(path.join(versionDir, "package.json"), "utf-8"),
					);
					const modName = id
						.replace("@git", "")
						.replace(/^preact$/, ".")
						.replace(/^preact\//, "./");
					const entry = pkg.exports[modName].import;

					const code = fs.readFileSync(path.join(versionDir, entry), "utf-8");
					const map = fs.readFileSync(
						path.join(versionDir, entry + ".map"),
						"utf-8",
					);

					return {
						code: code.replace(
							/["']preact/g,
							`"preact@${version.replace(/\./g, "_")}`,
						),
						map,
					};
				} else {
					const versionDir = path.join(cacheDir, version);
					// Check if someone is already resolving
					const inProgress = pending.get(version);
					if (inProgress) {
						return new Promise(r => {
							inProgress.push(() => r(cache.get(version)!));
						});
					}

					// Check for tarball or folder
					const tarball = path.join(tarDir, `preact-${version}.tgz`);
					const folder = path.join(tarDir, `preact-${version}`);
					if (fs.existsSync(tarball)) {
						if (!fs.existsSync(versionDir)) {
							fs.mkdirSync(versionDir, { recursive: true });
						}

						await tar.extract({
							file: tarball,
							cwd: versionDir,
							strip: 1,
						});

						let importee = id.replace(/@[^/]+/, "");

						const mappings = {
							"11.x": {
								preact: "dist/preact.mjs",
								"preact/compat": "compat/dist/compat.mjs",
								"preact/hooks": "hooks/dist/hooks.mjs",
								"preact/debug": "debug/dist/debug.mjs",
								"preact/devtools": "devtools/dist/devtools.mjs",
							},
							"10.x": {
								preact: "dist/preact.module.js",
								"preact/compat": "compat/dist/compat.module.js",
								"preact/hooks": "hooks/dist/hooks.module.js",
								"preact/debug": "debug/dist/debug.module.js",
								"preact/devtools": "devtools/dist/devtools.module.js",
							},
						};

						importee = version.startsWith("11")
							? mappings["11.x"][importee]
							: mappings["10.x"][importee];

						const code = fs.readFileSync(
							path.join(versionDir, importee),
							"utf-8",
						);
						const map = fs.readFileSync(
							path.join(versionDir, importee + ".map"),
							"utf-8",
						);
						const out = {
							code: code.replace(
								/["']preact/g,
								`"preact@${version.replace(/\./g, "_")}`,
							),
							map,
						};

						cache.set(id, out);

						const fns = pending.get(version) || [];
						await Promise.all(fns.map(fn => fn()));
						return out;
					} else if (fs.existsSync(folder)) {
						let importee = id.replace(/@[^/]+/, "");
						if (importee === "preact") {
							importee = "dist/preact.mjs";
						} else if (importee === "preact/compat") {
							importee = "compat/dist/compat.mjs";
						} else if (importee === "preact/hooks") {
							importee = "hooks/dist/hooks.mjs";
						} else if (importee === "preact/debug") {
							importee = "debug/dist/debug.mjs";
						} else if (importee === "preact/devtools") {
							importee = "devtools/dist/devtools.mjs";
						}

						const code = fs.readFileSync(path.join(folder, importee), "utf-8");
						const map = fs.readFileSync(
							path.join(folder, importee + ".map"),
							"utf-8",
						);
						const out = {
							code: code.replace(
								/(["'])preact/g,
								(_, quot) => `${quot}preact@${version.replace(/\./g, "_")}`,
							),
							map,
						};

						cache.set(id, out);

						const fns = pending.get(version) || [];
						await Promise.all(fns.map(fn => fn()));
						return out;
					}
				}
				throw new Error(`Preact not found ${id}`);
			}
		},
	};
}
