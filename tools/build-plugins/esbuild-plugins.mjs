import * as babel from "@babel/core";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import * as parcelCss from "@parcel/css";
import * as fsExtra from "fs-extra";
import * as kl from "kolorist";
import archiver from "archiver";
import { babelPluginCssModules } from "./babel-plugin-css-module.mjs";
import child_process from "child_process";
import { babelPluginDeadCode } from "./babel-plugin-dead-code.mjs";

/**
 * @param {Record<string, string>} mapping
 * @returns {import("esbuild").Plugin}
 */
export function aliasPlugin(mapping) {
	return {
		name: "alias-plugin",
		setup(build) {
			build.onResolve({ filter: /[^.]*/ }, args => {
				for (const k in mapping) {
					if (args.path.startsWith(k)) {
						let target = mapping[k];
						if (!path.isAbsolute(target)) {
							target = path.join(process.cwd(), target);
						}
						return { path: target };
					}
				}
			});
		},
	};
}

/**
 * @param {Record<string, string>} mapping
 * @returns {import("esbuild").Plugin}
 */
export function copyPlugin(mapping) {
	return {
		name: "copy-plugin",
		setup(build) {
			build.onStart(async () => {
				for (const k in mapping) {
					try {
						await fs.access(k);
					} catch (err) {
						// eslint-disable-next-line no-console
						console.warn(kl.yellow("Skipping: " + k));
						continue;
					}

					let target = mapping[k];
					let targetDir = path.dirname(target);
					if (path.extname(target) === "") {
						targetDir = target;
						target = path.join(target, path.basename(k));
					}

					await fs.mkdir(targetDir, { recursive: true });
					await fsExtra.copy(k, target, { recursive: true });
				}
			});
		},
	};
}

/**
 * @param {Record<string, string>} mapping
 * @returns {import("esbuild").Plugin}
 */
export function renamePlugin(mapping) {
	return {
		name: "rename-plugin",
		setup(build) {
			build.onEnd(async args => {
				if (args.errors.length) return;

				for (const k in mapping) {
					await fsExtra.move(k, mapping[k], { overwrite: true });
				}
			});
		},
	};
}

/**
 * @param {string} svgPath
 * @param {string[]} files
 * @returns {import("esbuild").Plugin}
 */
export function spritePlugin(svgPath, files) {
	return {
		name: "sprite-plugin",
		setup(build) {
			build.onEnd(async args => {
				if (args.errors.length) return;

				const svg = await fs.readFile(svgPath, "utf-8");

				await Promise.all(
					files.map(async file => {
						const html = await fs.readFile(file, "utf-8");
						const res = html.replace(
							/<body>/,
							"<body>\n\t\t" + svg.split("\n").join("\n\t\t") + "\n",
						);
						await fs.writeFile(file, res, "utf-8");
					}),
				);
			});
		},
	};
}

/**
 * @param {string} dir
 * @returns {import("esbuild").Plugin}
 */
export function inlineHookPlugin(dir) {
	return {
		name: "inline-hook-plugin",
		setup(build) {
			build.onEnd(async args => {
				if (args.errors.length) return;

				const source = path.join(dir, "installHook.js");
				const target = path.join(dir, "content-script.js");
				const hook = (await fs.readFile(source, "utf8"))
					.replace(/^\(function \(\) \{/g, "function install() {")
					.replace(/\}\(\)\);[\s\n]*$/g, "}");

				let targetFile = (await fs.readFile(target, "utf8"))
					.replace(/^\(function \(\) \{/g, "")
					.replace(/\}\(\)\);[\s\n]*$/g, "")
					.replace(/"use\sstrict";/g, "")
					.replace(/['"]CODE_TO_INJECT['"]/g, "installHook.toString()");

				targetFile = `;(function () {
	"use strict";

	let installHook = function install() {
		${hook}
	};

	${targetFile}
}());`;
				await fs.writeFile(target, targetFile, "utf-8");

				// Now that we inlined installHook.js we can delete it
				await fs.unlink(source);
			});
		},
	};
}

/**
 * @param {string} dir
 * @param {string} browser
 * @param {boolean} debug
 * @returns {import("esbuild").Plugin}
 */
export function archivePlugin(dir, browser, debug) {
	return {
		name: "archive-plugin",
		setup(build) {
			build.onEnd(async args => {
				if (args.errors.length) return;

				// Package extension
				const output = fsSync.createWriteStream(
					path.join(dir, `${browser}${debug ? "-debug" : ""}.zip`),
				);
				const archive = archiver("zip", { zlib: { level: 9 } });

				archive.on("warning", err => {
					if (err.code === "ENOENT") {
						// eslint-disable-next-line no-console
						console.log(err);
					} else {
						throw err;
					}
				});

				archive.on("error", err => {
					throw err;
				});

				archive.pipe(output);
				archive.directory(`dist/${browser}`, false);
				archive.finalize();
			});
		},
	};
}

/**
 * @returns {import("esbuild").Plugin}
 */
export function gitSourcePlugin() {
	return {
		name: "git-source-plugin",
		setup(build) {
			build.onEnd(async () => {
				child_process.execSync(
					"git archive --format zip --output dist/source-code.zip main",
				);
			});
		},
	};
}

/**
 * @returns {import("esbuild").Plugin}
 */
export function cssModules() {
	function transform(filename, code) {
		const result = parcelCss.transform({
			filename,
			code,
			cssModules: true,
			sourceMap: false,
		});

		let jsCode = "";
		for (const k in result.exports) {
			const css = result.exports[k].name;
			jsCode += `export const ${k} = "${css}";\n`;
		}

		let css = result.code.toString("utf-8");

		// Fix CSS grid areas treated as local
		css = css
			.replaceAll(/grid-area:\s+_?[^_]+_(.*?);$/gm, (m, g) => {
				return `grid-area: ${g};`;
			})
			.replaceAll(/\s["][^"']+_([^"']+)["]/g, (m, g) => {
				return `"${g}"`;
			});

		return { css, js: jsCode };
	}

	return {
		name: "css-modules-plugin",
		setup(build) {
			build.onResolve({ filter: /\.module-virtual\.css$/ }, async args => {
				return {
					path: path.join(args.resolveDir, args.path),
				};
			});

			build.onLoad({ filter: /\.module-virtual\.css$/ }, async args => {
				const file = args.path.replace("module-virtual", "module");
				const contents = await fs.readFile(file);
				const result = transform(file, contents);

				return {
					contents: result.js,
					loader: "js",
				};
			});

			build.onLoad({ filter: /\.module\.css$/ }, async args => {
				const contents = await fs.readFile(args.path);
				const result = transform(args.path, contents);

				return {
					contents: result.css,
					loader: "css",
				};
			});
		},
	};
}

/**
 * @param {Record<string, string>} define
 * @returns {import("esbuild").Plugin}
 */
export function babelPlugin(define) {
	const pending = new Map();
	const cache = new Map();

	return {
		name: "babel-plugin",
		setup(build) {
			build.onLoad({ filter: /content-script\.ts$/ }, async args => {
				const contents = await fs.readFile(args.path, "utf-8");
				const result = await babel.transformAsync(contents, {
					babelrc: false,
					filename: args.path,
					sourceMaps: false,
					sourceType: "module",
					plugins: [
						["@babel/plugin-syntax-typescript", { isTSX: true }],
						["babel-plugin-transform-define", define],
						babelPluginDeadCode,
					],
				});

				return {
					contents: result.code,
					resolveDir: path.dirname(args.path),
					loader: "tsx",
				};
			});

			build.onLoad({ filter: /\.tsx$/ }, async args => {
				const contents = await fs.readFile(args.path, "utf-8");
				// Using a cache is crucial as babel is 30x slower than esbuild
				const cached = cache.get(args.path);
				if (cached && cached.input === contents) {
					return {
						contents: cached.result,
						resolveDir: path.dirname(args.path),
						loader: "ts",
					};
				}

				let result = contents;

				// Check if somebody already requested the current file. If they
				// did than we push a listener instead of doing a duplicate
				// transform of the same file. This is crucial for build perf.
				if (!pending.has(args.path)) {
					pending.set(args.path, []);

					const tmp = await babel.transformAsync(result, {
						babelrc: false,
						filename: args.path,
						sourceMaps: false,
						sourceType: "module",
						plugins: [
							["@babel/plugin-syntax-typescript", { isTSX: true }],
							babelPluginCssModules,
							babelPluginDeadCode,
							[
								"babel-plugin-transform-jsx-to-htm",
								{
									tag: "$$html",
									import: {
										module: "htm/preact",
										export: "html",
									},
								},
							],
						],
					});

					result = tmp.code || result;
					cache.set(args.path, { input: contents, result });

					// Fire all pending listeners that are waiting on the same
					// file transformation
					const waited = pending.get(args.path);
					pending.delete(args.path);
					waited.forEach(fn => fn());
				} else {
					// Subscribe to the existing transformation completion call
					await new Promise(r => {
						pending.get(args.path).push(r);
					});
					result = cache.get(args.path).result;
				}

				return {
					contents: result,
					resolveDir: path.dirname(args.path),
					loader: "tsx",
				};
			});
		},
	};
}
