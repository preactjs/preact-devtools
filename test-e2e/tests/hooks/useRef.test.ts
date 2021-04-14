import {
	clickAndWaitForHooks,
	newTestPage,
	waitForProp,
} from "../../test-utils";
import { assertNotSelector } from "pentf/browser_utils";

export const description = "Inspect useRef hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks");

	// State update
	await clickAndWaitForHooks(devtools, "RefComponent");
	await waitForProp(devtools, "useRef", "0");

	// Should not be collapsable
	await assertNotSelector(devtools, '[data-testid="props-row"] > button');

	// Should not be editable
	await assertNotSelector(devtools, '[data-testid="prop-value"] input');
}
