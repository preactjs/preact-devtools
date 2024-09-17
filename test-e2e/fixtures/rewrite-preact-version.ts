import { Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import { transformSync } from "@babel/core";
import transformJsx from "@babel/plugin-transform-react-jsx";
import { addImport, rewriteImportPlugin } from "./babel.ts";
import { URL } from "node:url";

/**
 * Rewrite imports to preact to versioned preact imports.
 */
export function rewritePreactVersion(): Plugin {
	const PROTOCOL = "relative://";
	const PREFIX = "@fixture:";

	let preactVersion = "";

	return {
		name: "preact:version",
		enforce: "pre",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const url = new URL(
					req.originalUrl ?? req.url ?? "",
					"https://localhost",
				);
				const version = url.searchParams.get("preact");
				if (version) {
					preactVersion = version.replace(/\./g, "_");
				}

				next();
			});
		},
		resolveId(id) {
			const url = new URL(id, PROTOCOL);
			const version = url.searchParams.get("preact");
			if (version) {
				return `@fixture:${id}`;
			}

			if (id === `@preact/signals@${preactVersion}`) {
				return `@fixture-signals:${preactVersion}`;
			}
		},
		load(id) {
			if (id.startsWith(PREFIX)) {
				const newId = id.slice(PREFIX.length, id.indexOf("?"));
				const filePath = path.join(__dirname, newId);
				return fs.readFileSync(filePath, "utf-8");
			} else if (id.startsWith("@fixture-signals")) {
				const filePath = path.join(
					__dirname,
					"..",
					"..",
					"node_modules",
					"@preact",
					"signals",
					"dist",
					"signals.module.js",
				);
				return fs.readFileSync(filePath, "utf-8");
			}
		},
		transform(code, id) {
			if (id.startsWith("@fixture-signals")) {
				const res = transformSync(code, {
					plugins: [[rewriteImportPlugin, { version: preactVersion }]],
				})!;
				return {
					code: res.code,
					map: res.map,
				};
			}

			if (!id.startsWith("@fixture:")) return;

			const url = new URL(id, PROTOCOL);
			const version = url.searchParams.get("preact");
			if (version) {
				const normalized = version.replace(/\./g, "_");
				const res = transformSync(code, {
					plugins: [
						[
							transformJsx,
							{
								pragma: "h",
								pragmaFrag: "Fragment",
								runtime: "classic",
							},
						],
						[
							addImport,
							// Not sure why this is applied _after_ the
							// next plugin
							{ imports: [`import "preact@${normalized}/devtools"`] },
						],
						[rewriteImportPlugin, { version: normalized }],
					],
				})!;

				return {
					code: res.code,
					map: res.map,
				};
			}
		},
	};
}
