import { MsgTypes } from "./events";

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
				}
			}
		}
	} catch (err) {
		console.error(err);
	}
	console.groupEnd();
}
