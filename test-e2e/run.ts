import { main } from "pentf";

// eslint-disable-next-line no-console
console.log('Be sure to run "yarn dev" in another shell');

main({
	rootDir: __dirname,
	testsGlob: "{**/,}*.test.ts",
	description: "Test my cool application",
});
