import { defineConfig, Plugin } from "vite";
import preact from "@preact/preset-vite";
import fs from "fs";
import path from "path";

function preactVersionPlugin(): Plugin {
	const versionReg = /preact@\d/;
	return {
		name: "preact:version",
		resolveId(id) {
			if (versionReg.test(id)) {
				return id;
			}
		},
		load(id) {
			if (versionReg.test(id)) {
				const version = id.match(/preact@([^/]+)/);
				console.log(version);
				return `export const foo = 42`;
			}
		},
	};
}

function preactListVersionPlugin(): Plugin {
	const virtual = "@preact-list-versions";
	return {
		name: "preact:version-list",
		resolveId(id) {
			if (virtual === id) {
				return id;
			}
		},
		load(id) {
			if (virtual === id) {
				const dir = path.join(__dirname, "vendor", "preact");
				const items = fs
					.readdirSync(dir)
					.map(name => {
						if (name.endsWith(".tgz")) {
							name = name.slice(0, -".tgz".length);
						}

						if (name.startsWith("preact-")) {
							name = name.slice("preact-".length);
						}

						return name;
					})
					.sort((a, b) => {
						const semA = a.split(".").map(n => +n);
						const semB = b.split(".").map(n => +n);

						// If one is non-semver
						if (semA.length === 1 && semB.length > 1) {
							return 1;
						} else if (semA.length > 1 && semB.length === 1) {
							return -1;
						} else if (semA.length === 1 && semB.length === 1) {
							return a.localeCompare(b);
						}

						if (semA[0] < semB[0]) {
							return -1;
						} else if (semB[0] < semA[0]) {
							return 1;
						} else if (semA[1] < semB[1]) {
							return -1;
						} else if (semB[1] < semA[1]) {
							return 1;
						} else if (semA[2] < semB[2]) {
							return -1;
						} else if (semB[2] < semA[2]) {
							return 1;
						}

						return 0;
					});

				return `export const preactVersions = [
          ${items.map(x => '"' + x + '"').join(",\n")}
        ]`;
			}
		},
	};
}

function listTestCases(): Plugin {
	const virtual = "@test-cases";
	return {
		name: "preact:test-cases",
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

				return `export const testCases = [
          ${items.map(x => '"' + x + '"').join(",\n")}  
        ]`;
			}
		},
	};
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		preact(),
		preactListVersionPlugin(),
		preactVersionPlugin(),
		listTestCases(),
		{
			name: "preact:no-jsx-inject",
			config() {
				return {
					esbuild: {
						jsxFactory: "h",
						jsxFragment: "Fragment",
						jsxInject: "",
					},
				};
			},
		},
	],
});
