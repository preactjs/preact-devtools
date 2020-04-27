import { newTestPage, click } from "../../test-utils";
import { closePage } from "pentf/browser_utils";

export const description = "Reload and immediately start profiling";
// Reloading the whole page breaks our current test setup, and
// I don't know of a way to patch `window.location.reload` on the fly.
export const skip = () => true;

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "profile-reload", {
		preact: "next",
	});

	const iframe = 'iframe[src="/iframe.html"]';

	await page.waitForSelector(iframe);

	await click(devtools, '[name="root-panel"][value="PROFILER"]');

	const btn = '[data-testid="reload-and-profile-btn"]';
	await click(devtools, btn);

	await page.waitForSelector(iframe);

	await page.$eval(iframe, el => {
		const btn = (el as HTMLIFrameElement).contentWindow!.document.querySelector(
			"button",
		)!;
		btn.click();
		btn.click();
	});

	await closePage(page);
}
