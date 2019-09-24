import { Observable, valoo } from "../valoo";
import { DevNode } from ".";

export function createSearchStore(items: Observable<Map<number, DevNode>>) {
	const value = valoo("");
	const selected = valoo(0);
	const regex = valoo<RegExp | null>(null);
	const match = valoo<number[]>([]);
	const count = valoo(0);

	const reset = () => (value.$ = "");
	const onChange = (s: string) => {
		value.$ = s;

		match.$ = [];

		if (s === "") {
			regex.$ = null;
			count.$ = 0;
			selected.$ = 0;
			return;
		}

		const reg = createRegex(s);
		regex.$ = reg;

		let ids: number[] = [];
		items.$.forEach(node => {
			if (reg.test(node.name)) {
				ids.push(node.id);
			}
		});

		if (ids.length > 0) {
			selected.$ = 0;
		}
		count.$ = ids.length;
		match.$ = ids;
	};

	function go(n: number) {
		if (n < 0) n = match.$.length - 1;
		else if (n > match.$.length - 1) n = 0;
		selected.$ = n;
	}

	const selectNext = () => go(selected.$ + 1);
	const selectPrev = () => go(selected.$ - 1);

	return {
		selected,
		count,
		value,
		match,
		reset,
		onChange,
		selectNext,
		selectPrev,
	};
}

export function createRegex(s: string): RegExp {
	if (s[0] === "/") {
		throw new Error("Regex not supported yet");
	}
	// TODO: Escaping
	return new RegExp(s, "i");
}
