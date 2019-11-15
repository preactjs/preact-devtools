const archiver = require("archiver");
const fs = require("fs");

const browser = process.env.BROWSER === "chrome" ? "chrome" : "firefox";

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
archive.directory("dist/firefox", false);
archive.finalize();
