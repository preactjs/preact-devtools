import { h } from "preact";
import { useState, useCallback } from "preact/hooks";
import { ArrowBack, ArrowForward } from "../icons";
import s from "./CommitTimeline.css";

export function CommitTimeline() {
	const [items] = useState([20, 80, 10, 10]);
	const [selected, setSelected] = useState(0);

	const onPrev = useCallback(() => {
		setSelected(Math.max(selected - 1, 0));
	}, [selected]);

	const onNext = useCallback(() => {
		setSelected(Math.min(selected + 1, items.length - 1));
	}, [selected]);

	if (items.length === 0) {
		return null;
	}

	return (
		<div class={s.root}>
			Timeline
			<button onClick={onPrev} disabled={selected <= 0} class={s.navBtn}>
				<ArrowBack />
			</button>
			<div class={s.items}>
				{items.map((x, i) => (
					<CommitItem
						key={x}
						onClick={() => setSelected(i)}
						selected={i === selected}
						percent={x}
					/>
				))}
			</div>
			<button
				onClick={onNext}
				disabled={selected >= items.length - 1}
				class={s.navBtn}
			>
				<ArrowForward />
			</button>
		</div>
	);
}

export interface CommitItem {
	percent: number;
	onClick: () => void;
	selected?: boolean;
}

export function CommitItem(props: CommitItem) {
	return (
		<div class={s.item} data-selected={props.selected} onClick={props.onClick}>
			<div class={s.itemInner} style={`top: calc(100% - ${props.percent}%)`} />
		</div>
	);
}
