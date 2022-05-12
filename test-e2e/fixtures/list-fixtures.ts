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
		configureServer(_server) {
			// Restart the server whenever a fixture file changes.
			// We currently don't have HMR as the whole fixture needs
			// to be reloaded anyway for devtools to start with a clean
			// state.
			const server = _server;
			server.watcher.add("test-e2e/fixtures/apps/**/*");
			server.watcher.on("all", (ev, p) => {
				if (p.includes("test-e2e/fixtures/apps")) {
					server.restart();
				}
			});
		},

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
