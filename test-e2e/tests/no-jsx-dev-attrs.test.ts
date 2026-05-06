import { expect, test } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Devtools UI should not render JSX development props as HTML attributes", async ({
	page,
}) => {
	const { devtools } = await gotoTest(page, "counter");

	const count = await devtools.locator("[__source], [__self]").count();
	expect(count).toBe(0);
});
