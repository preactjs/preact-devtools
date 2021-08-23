import {
	clickAndWaitForHooks,
	newTestPage,
	waitForProp,
} from "../../test-utils";
import { assertNotSelector } from "pentf/browser_utils";

export const description = "Inspect useRef hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "use-ref-element");

	// State update
	await clickAndWaitForHooks(devtools, "App");
	await waitForProp(devtools, "useRef", "<input />");

	// Should not be collapsable
	await assertNotSelector(devtools, '[data-testid="props-row"] > button');

	// Should not be editable
	await assertNotSelector(devtools, '[data-testid="prop-value"] input');
}
