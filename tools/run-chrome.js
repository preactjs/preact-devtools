const { newPage } = require("pentf/browser_utils");
const path = require("path");

async function main() {
	const page = await newPage(
		{
			headless: false,
			devtools: true,
			moduleType: "commonjs",
			extensions: [path.join(__dirname, "..", "dist", "chrome")],
		},
		["--user-data-dir=./profiles/chrome"],
	);

	// Reset emulation
	await page._client.send("Emulation.clearDeviceMetricsOverride");

	await page.goto("https://preactjs.com");
}

main();
