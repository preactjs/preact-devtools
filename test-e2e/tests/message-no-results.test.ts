import { newTestPage } from "../test-utils";
import { waitForTestId } from "pentf/browser_utils";

export const description = "Display filter no match message";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "message-no-results");
	await waitForTestId(devtools, "msg-no-results");
}
