import { Observable, valoo } from "../valoo";
import { DevNode, useStore, useObserver, ID } from ".";
import escapeRegex from "escape-string-regexp";

export function createSearchStore(
	items: Observable<Map<ID, DevNode>>,
	list: Observable<ID[]>,
) {
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
		list.$.forEach(id => {
			let node = items.$.get(id);
			if (node && reg.test(node.name)) {
				ids.push(id);
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
		regex,
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
		s = s.slice(1);
		if (s[s.length - 1] === "/") {
			s = s.slice(0, -1);
		}
		try {
			return new RegExp(s, "i");
		} catch (err) {
			return new RegExp("");
		}
	}
	return new RegExp(`(${escapeRegex(s)})`, "i");
}

export function useSearch() {
	let { search: s } = useStore();
	let match = useObserver(() => s.match.$);
	let value = useObserver(() => s.value.$);
	let marked = useObserver(() => s.selected.$);
	let regex = useObserver(() => s.regex.$);
	let count = useObserver(() => s.count.$);
	let selected = useObserver(() => s.selected.$);
	let selectedId = useObserver(() => s.match.$[s.selected.$]);
	return {
		count,
		selected,
		selectedId,
		marked,
		regex,
		match,
		goNext: s.selectNext,
		goPrev: s.selectPrev,
		value,
	};
}
