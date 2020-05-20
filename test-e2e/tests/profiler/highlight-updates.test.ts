import { newTestPage, click } from "../../test-utils";
import { closePage } from "pentf/browser_utils";

export const description = "highlight updates";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "todo");
	await page.waitForSelector("button");

	// await closePage(page);
}
