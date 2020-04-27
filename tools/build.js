/* eslint-disable @typescript-eslint/no-var-requires,no-console */
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

const browser = process.env.BROWSER;

// Manually bundle injection code to make sure it runs before everything else
const dist = path.join(__dirname, "..", "dist", browser);
const source = path.join(dist, "installHook.js");
const target = path.join(dist, "content-script.js");
const hook = fs
	.readFileSync(source, "utf8")
	.replace(/^\(function \(\) \{/g, "function install() {")
	.replace(/\}\(\)\);[\s\n]*$/g, "}");

let targetFile = fs
	.readFileSync(target, "utf8")
	.replace(/^\(function \(\) \{/g, "")
	.replace(/\}\(\)\);[\s\n]*$/g, "")
	.replace(/"use\sstrict";/g, "")
	.replace(/['"]CODE_TO_INJECT['"]/g, "installHook.toString()");

targetFile = `;(function () {
	"use strict";

	let installHook = ${hook}

	${targetFile}
}());`;
fs.writeFileSync(target, targetFile);

// Now that we inlined installHook.js we can delete it
fs.unlinkSync(source);

// Rename injected css file so users understand where it's coming from.
fs.renameSync(
	path.join(dist, "installHook.css"),
	path.join(dist, "preact-devtools-page.css"),
);

// Package extension
const output = fs.createWriteStream(__dirname + `/../dist/${browser}.zip`);
const archive = archiver("zip", { zlib: { level: 9 } });

archive.on("warning", err => {
	if (err.code === "ENOENT") {
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
