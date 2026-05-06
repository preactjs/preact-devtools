import { expect } from "vitest";
import {
	nextOperationV3State,
	OPERATION_PROTOCOL_V3,
	readOperationV3,
	validateOperationV3,
} from "./v3";

describe("operation v3 protocol", () => {
	it("accepts an initial snapshot-style operation", () => {
		const envelope = readOperationV3([
			OPERATION_PROTOCOL_V3,
			10,
			1,
			0,
			0,
			1,
			42,
			0,
		]);

		expect(validateOperationV3(null, envelope)).to.deep.equal({ ok: true });
		expect(nextOperationV3State(envelope)).to.deep.equal({
			epoch: 1,
			commitSeq: 0,
			treeVersion: 1,
		});
	});

	it("rejects skipped commits", () => {
		const envelope = readOperationV3([
			OPERATION_PROTOCOL_V3,
			10,
			1,
			3,
			1,
			2,
			42,
			0,
		]);

		expect(
			validateOperationV3({ epoch: 1, commitSeq: 1, treeVersion: 1 }, envelope),
		).to.deep.equal({ ok: false, reason: "sequence" });
	});

	it("rejects stale base tree versions", () => {
		const envelope = readOperationV3([
			OPERATION_PROTOCOL_V3,
			10,
			1,
			2,
			4,
			5,
			42,
			0,
		]);

		expect(
			validateOperationV3({ epoch: 1, commitSeq: 1, treeVersion: 3 }, envelope),
		).to.deep.equal({ ok: false, reason: "version" });
	});
});
