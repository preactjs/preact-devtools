const fs = require("fs");
const path = require("path");
const { rollup } = require("rollup");

const dist = path.join(__dirname, "../dist");
const bundlePath = path.join(dist, "inline/bundle.module.js");
fs.writeFileSync(
	bundlePath,
	`
export * from "./renderer";
export * from "./setup";
`,
	"utf8",
);

async function build() {
	const bundle = await rollup({
		input: bundlePath,
		external: ["preact"],
	});

	await bundle.write({
		file: path.join(dist, "preact-devtools.module.js"),
		sourcemap: true,
		format: "esm",
	});

	await bundle.write({
		file: path.join(dist, "preact-devtools.js"),
		sourcemap: true,
		format: "cjs",
	});
}

build();
