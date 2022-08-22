import { main } from "pentf";
import child_process from "child_process";
import path from "path";
import fetch from "node-fetch";
import { waitFor } from "pentf/assert_utils";

(async () => {
	let child: child_process.ChildProcess;
	const output: string[] = [];

	try {
		await fetch("http://localhost:8100", {});
	} catch (err: any) {
		if (/ECONNREFUSED/.test(err.message)) {
			// eslint-disable-next-line no-console
			console.log(`No server running at http://localhost:8100/ Starting...`);
			// eslint-disable-next-line no-console
			console.log(`(You can start a dev server via "npm run dev")`);
			child = child_process.spawn("npm", ["run", "dev:serve"], {
				cwd: path.join(__dirname, ".."),
				stdio: "pipe",
			});
			child.stdout!.on("data", data => output.push(data.toString()));
			child.stderr!.on("data", data => output.push(data.toString()));

			try {
				await waitFor(() => output.some(line => /ready in/.test(line)), {
					timeout: 2000,
				});
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log(output);
				throw err;
			}

			// eslint-disable-next-line no-console
			console.log(`Server is ready, starting tests now!`);
		} else {
			throw err;
		}
	}

	main({
		rootDir: __dirname,
		testsGlob: "{**/,}*.test.ts",
		description: "Test my cool application",
	});
})();
