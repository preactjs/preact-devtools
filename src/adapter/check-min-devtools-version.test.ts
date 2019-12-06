import checkMinDevtoolsVersion from "./check-min-devtools-version";
import { expect } from "chai";

describe("checkMinDevtoolsVersion", () => {
	it("should allow never major versions", () => {
		expect(checkMinDevtoolsVersion("2.0.0", "1.2.3", "")).to.equal(true);
	});

	it("should allow never minor versions", () => {
		expect(checkMinDevtoolsVersion("1.3.0", "1.2.3", "")).to.equal(true);
	});

	it("should allow never patch versions", () => {
		expect(checkMinDevtoolsVersion("1.2.4", "1.2.3", "")).to.equal(true);
	});

	it("should allow equal versions", () => {
		expect(checkMinDevtoolsVersion("1.2.3", "1.2.3", "")).to.equal(true);
	});

	it("should not allow older major versions", () => {
		expect(checkMinDevtoolsVersion("1.2.3", "2.0.0", "")).to.equal(false);
	});

	it("should not allowed older minor versions", () => {
		expect(checkMinDevtoolsVersion("1.2.3", "1.3.0", "")).to.equal(false);
	});

	it("should allow never patch versions", () => {
		expect(checkMinDevtoolsVersion("1.2.3", "1.2.4", "")).to.equal(false);
	});
});
