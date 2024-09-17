import { Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";

// WARNING: Also update build.js
export function injectSvgSpritePlugin(): Plugin {
	return {
		name: "inject-svg-sprite",
		transformIndexHtml(html) {
			if (/\.\/devtools\.ts/.test(html)) {
				const filePath = path.join(
					__dirname,
					"..",
					"..",
					"src",
					"view",
					"sprite.svg",
				);
				const svg = fs.readFileSync(filePath, "utf-8");

				const res = html.replace(
					/<body>/,
					"<body>\n\t\t" + svg.split("\n").join("\n\t\t") + "\n",
				);

				return res;
			}
		},
	};
}
