import { Plugin } from "vite";
import path from "path";
import fs from "fs";

/**
 * Get all available fixtures and expose them via a virtual
 * module. This is used for the fixture drop down
 */
export function listFixtures(): Plugin {
	const virtual = "@fixtures";
	return {
		name: "preact:fixtures",
		resolveId(id) {
			if (id === virtual) {
				return id;
			}
		},
		load(id) {
			if (id === virtual) {
				const dir = path.join(__dirname, "apps");
				const items = fs
					.readdirSync(dir)
					.map(x => path.basename(x, path.extname(x)))
					.sort((a, b) => a.localeCompare(b));
				return `export const fixtures = [
          ${items.map(x => '"' + x + '"').join(",\n")}  
        ]`;
			}
		},
	};
}
