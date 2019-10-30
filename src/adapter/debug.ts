import { MsgTypes } from "./events";
import { parseTable, flushTable } from "./string-table";
import { Elements } from "./10/renderer";
import { ID } from "../view/store/types";

export interface ParsedMsg {
	rootId: number;
	mounts: Array<{ id: ID; key: string; name: string; parentId: ID }>;
	unmounts: ID[];
	reorders: Array<{ id: ID; children: ID[] }>;
	timings: Array<{ id: ID; duration: number }>;
}

export function parseCommitMessage(data: number[]): ParsedMsg {
	const rootId = data[0] || -1;

	// String table
	let i = 1;
	const len = data[i++];
	const strings = parseTable(data.slice(1, len + 2));
	let mounts: any[] = [];
	let unmounts: any[] = [];
	let timings: any[] = [];
	let reorders: any[] = [];

	i = len > 0 ? len + 2 : i;

	for (; i < data.length; i++) {
		switch (data[i]) {
			case MsgTypes.ADD_VNODE: {
				const id = data[i + 1];
				const name = strings[data[i + 5] - 1];
				const parentId = data[i + 3];
				const key = data[i + 6] > 0 ? strings[i + 6 - 1] : "";
				mounts.push({ id, name, key, parentId });
				i += 6;
				break;
			}
			case MsgTypes.UPDATE_VNODE_TIMINGS:
				timings.push({ id: data[i + 1], duration: data[i + 2] });
				i += 2;
				break;
			case MsgTypes.REMOVE_VNODE: {
				const unmountLen = data[i + 1];
				i += 2;
				const len = i + unmountLen;
				for (; i < len; i++) {
					unmounts.push(data[i]);
				}
				break;
			}
			case MsgTypes.REORDER_CHILDREN: {
				reorders.push({
					id: data[i + 1],
					children: data.slice(i + 3, i + 3 + data[i + 2]),
				});
				i += 2 + data[i + 2];
				break;
			}
		}
	}

	return {
		rootId,
		mounts,
		unmounts,
		timings,
		reorders,
	};
}

export function formatForTest(msg: ParsedMsg) {
	let out = [];
	out.push("rootId: " + msg.rootId);
	msg.mounts.forEach(m => {
		const key = m.key ? "#" + m.key : "";
		out.push(`Add ${m.id} <${m.name}${key}> to parent ${m.parentId}`);
	});
	msg.timings.forEach(t => {
		out.push(`Update timings ${t.id}`);
	});
	msg.reorders.forEach(r => {
		out.push(`Reorder ${r.id} [${r.children.join(", ")}]`);
	});
	msg.unmounts.forEach(u => {
		out.push(`Unmount ${u}`);
	});

	return out;
}

export function toSnapshot(data: number[]) {
	const parsed = parseCommitMessage(data);
	return formatForTest(parsed);
}

export function fromSnapshot(events: string[]): number[] {
	const out: number[] = [];
	let operations: number[] = [];
	let strings: string[] = [];
	let unmounts: number[] = [];

	if (/^rootId\:/.test(events[0])) {
		const id = +events[0].slice(events[0].indexOf(":") + 1);
		out.push(id);
		operations.push(MsgTypes.ADD_ROOT, id);
	} else {
		throw new Error("rootId must be first event");
	}

	for (let i = 1; i < events.length; i++) {
		const ev = events[i];
		if (/^Add/.test(ev)) {
			const m = ev.match(/Add\s+(\d+)\s+<([#]?\w+)>\s+to\sparent\s(\d+)/);
			if (m) {
				operations.push(
					MsgTypes.ADD_VNODE,
					+m[1],
					m[2][0] !== m[2][0].toLowerCase()
						? Elements.FUNCTION_COMPONENT
						: Elements.HTML_ELEMENT,
					+m[3],
					9999,
					strings.push(m[2]),
					-1,
				);
			} else {
				throw new Error("no match: " + ev);
			}
		} else if (/^Update\stimings/.test(ev)) {
			const m = ev.match(/Update\stimings\s(\d+)\s+duration\s+(\d+)/);
			if (m) {
				const id = +m[1];
				const duration = +m[2];
				operations.push(MsgTypes.UPDATE_VNODE_TIMINGS, id, duration);
			} else {
				throw new Error("no match: " + ev);
			}
		} else if (/^Remove/.test(ev)) {
			const m = ev.match(/Remove\s+(\d+)/);
			if (m) {
				const id = +m[1];
				unmounts.push(id);
			} else {
				throw new Error("no match: " + ev);
			}
		}
	}

	out.push(...flushTable(new Map(strings.map((x, i) => [x, i]))));
	if (unmounts.length > 0) {
		out.push(MsgTypes.REMOVE_VNODE, unmounts.length, ...unmounts);
	}
	out.push(...operations);

	return out;
}

export function printCommit(data: number[]) {
	console.group("commit", data);
	try {
		console.log("root id: ", data[0]);
		let i = 1;

		// String table
		const len = data[i++];
		const strings = [];
		if (len > 0) {
			for (; i < len + 1; i++) {
				const strLen = data[i];
				const start = i + 1;
				const end = i + strLen + 1;
				const str = String.fromCodePoint(...data.slice(start, end));
				strings.push(str);
				i += strLen;
			}
			i += 2;
			console.log("strings: ", strings);
		} else {
			console.log("strings: none");
		}

		for (; i < data.length; i++) {
			switch (data[i]) {
				case MsgTypes.ADD_VNODE: {
					const id = data[i + 1];
					const name = strings[data[i + 5] - 1];
					const key = data[i + 6] > 0 ? ` key="${strings[i + 6 - 1]}" ` : "";
					const parentId = data[i + 3];
					console.log(
						`Add %c${id} %c<${name}${key}>%c to parent %c${parentId}`,
						"color: yellow",
						"color: violet",
						"color: inherit",
						"color: green",
					);
					i += 6;
					break;
				}
				case MsgTypes.REMOVE_VNODE: {
					const unmounts = data[i + 1];
					i += 2;
					const len = i + unmounts;
					console.log(`total unmounts: ${unmounts}`);
					for (; i < len; i++) {
						console.log(`  Remove: %c${data[i]}`, "color: red");
					}
					break;
				}
				case MsgTypes.REORDER_CHILDREN: {
					break;
				}
			}
		}
	} catch (err) {
		console.error(err);
	}
	console.groupEnd();
}
