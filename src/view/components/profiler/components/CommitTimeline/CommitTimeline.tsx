import { h } from "preact";
import { useState, useCallback } from "preact/hooks";
import { ArrowBack, ArrowForward } from "../../../icons";
import s from "./CommitTimeline.css";
import { getGradient } from "../../data/gradient";

export interface CommitTimelineProps {
	selected: number;
	items: number[];
	onChange: (i: number) => void;
}

export function CommitTimeline(props: CommitTimelineProps) {
	const { items, onChange, selected } = props;

	const onPrev = useCallback(() => {
		const next = selected - 1;
		onChange(next < 0 ? items.length - 1 : next);
	}, [selected]);

	const onNext = useCallback(() => {
		const next = selected + 1;
		onChange(next > items.length - 1 ? 0 : next);
	}, [selected]);

	if (items.length === 0) {
		return null;
	}

	return (
		<div class={s.root}>
			<div class={s.legend}>
				{selected + 1} / {items.length}
			</div>
			<button onClick={onPrev} class={s.navBtn} data-e2e="prev-commit">
				<ArrowBack />
			</button>
			<div class={s.items}>
				{items.map((x, i) => {
					return (
						<CommitItem
							key={x}
							onClick={() => onChange(i)}
							selected={i === selected}
							percent={x}
						/>
					);
				})}
			</div>
			<button onClick={onNext} class={s.navBtn} data-e2e="next-commit">
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
	const { percent } = props;
	const top = 100 - Math.max(20, Math.min(98, percent));
	const color = getGradient(percent / 100);

	return (
		<div
			data-e2e="commit-item"
			class={s.item}
			data-selected={props.selected}
			data-weight={color}
			onClick={props.onClick}
		>
			<div class={s.itemInner} style={`top: ${top}%`} />
		</div>
	);
}
