const archiver = require("archiver");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

const browser = process.env.BROWSER;

// Manually bundle injection code to make sure it runs before everything else
const source = path.join(__dirname, "..", "dist", browser, "installHook.js");
const target = path.join(__dirname, "..", "dist", browser, "initClient.js");
const hook = fs
	.readFileSync(source, "utf8")
	.replace(/\(function \(\) \{/g, "function install() {")
	.replace(/\}\(\)\);/g, "}");

let targetFile = fs
	.readFileSync(target, "utf8")
	.replace(/\(function \(\) \{/g, "")
	.replace(/\}\(\)\);/g, "")
	.replace(/\}\(\)\);/g, "")
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
