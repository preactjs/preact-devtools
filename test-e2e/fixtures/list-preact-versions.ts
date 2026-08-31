import { Plugin } from "vite";
import { getPreactVersions } from "./utils.ts";
import path from "path";

/**
 * Load all available Preact versions and expose them via
 * a virtual module. Used for the version select.
 */
export function listPreactVersions(): Plugin {
	const virtual = "@preact-list-versions";

	return {
		name: "preact:list-versions",
		resolveId(id) {
			if (virtual === id) {
				return id;
			}
		},
		load(id) {
			if (virtual === id) {
				const items = getPreactVersions(
					path.join(import.meta.dirname, "vendor", "preact"),
				);
				return `export const preactVersions = [
          ${items.map(x => '"' + x + '"').join(",\n")}
        ]`;
			}
		},
	};
}
