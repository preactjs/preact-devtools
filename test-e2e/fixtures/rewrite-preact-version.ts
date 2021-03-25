import { Plugin } from "vite";
import fs from "fs";
import path from "path";
import { transformSync } from "@babel/core";
import transformJsx from "@babel/plugin-transform-react-jsx";
import { addImport, rewriteImportPlugin } from "./babel";

/**
 * Rewrite imports to preact to versioned preact imports.
 */
export function rewritePreactVersion(): Plugin {
	const PROTOCOL = "relative://";
	const PREFIX = "@fixture:";

	return {
		name: "preact:version",
		enforce: "pre",
		resolveId(id) {
			const url = new URL(id, PROTOCOL);
			const version = url.searchParams.get("preact");
			if (version) {
				return `@fixture:${id}`;
			}
		},
		load(id) {
			if (id.startsWith(PREFIX)) {
				const newId = id.slice(PREFIX.length, id.indexOf("?"));
				const filePath = path.join(__dirname, newId);
				return fs.readFileSync(filePath, "utf-8");
			}
		},
		transform(code, id) {
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
				});

				return {
					code: res.code,
					map: res.map,
				};
			}
		},
	};
}
