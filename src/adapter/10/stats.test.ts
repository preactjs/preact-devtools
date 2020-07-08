import { Stats, stats2ops, parseStats } from "./stats";
import { strict as assert } from "assert";

describe.only("stats ops", () => {
	it("should serialize stats to props and back", () => {
		const stats: Stats = {
			roots: 0,
			functionComponents: 1,
			classComponents: 2,
			fragments: 3,
			elements: 4,
			text: 5,
			keyed: 6,
			keyedChildrenCount: [2, 2, 4, 4, 6, 6],
			unkeyed: 7,
			unkeyedChildrenCount: [2, 2, 4, 4, 6, 6, 8],
			mixed: 8,
			mixedChildrenCount: [2, 2, 4, 4, 6, 6, 8, 8],
			mounts: 9,
			updates: 10,
			unmounts: 11,
		};
		const actual = parseStats(stats2ops(1, stats).slice(1));

		assert.deepEqual(actual, {
			roots: 0,
			functionComponents: 1,
			classComponents: 2,
			fragments: 3,
			elements: 4,
			text: 5,
			keyedTotal: 6,
			keyed: new Map([
				[2, 2],
				[4, 2],
				[6, 2],
			]),
			unkeyedTotal: 7,
			unkeyed: new Map([
				[2, 2],
				[4, 2],
				[6, 2],
				[8, 1],
			]),
			mixedTotal: 8,
			mixed: new Map([
				[2, 2],
				[4, 2],
				[6, 2],
				[8, 2],
			]),
			mounts: 9,
			updates: 10,
			unmounts: 11,
		});
	});
});
