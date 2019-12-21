import { h } from "preact";
import { useState, useCallback } from "preact/hooks";
import { ArrowBack, ArrowForward } from "../icons";
import s from "./CommitTimeline.css";

export interface CommitTimelineProps {
	selected: number;
	items: number[];
	onChange: (i: number) => void;
}

export function CommitTimeline(props: CommitTimelineProps) {
	const { items, onChange, selected } = props;

	const onPrev = useCallback(() => {
		onChange(Math.max(selected - 1, 0));
	}, [selected]);

	const onNext = useCallback(() => {
		onChange(Math.min(selected + 1, items.length - 1));
	}, [selected]);

	if (items.length === 0) {
		return null;
	}

	return (
		<div class={s.root}>
			<div class={s.legend}>
				{selected + 1} / {items.length}
			</div>
			<button
				onClick={onPrev}
				disabled={selected <= 0}
				class={s.navBtn}
				data-e2e="prev-commit"
			>
				<ArrowBack />
			</button>
			<div class={s.items}>
				{items.map((x, i) => (
					<CommitItem
						key={x}
						onClick={() => onChange(i)}
						selected={i === selected}
						percent={x}
					/>
				))}
			</div>
			<button
				onClick={onNext}
				disabled={selected >= items.length - 1}
				class={s.navBtn}
				data-e2e="next-commit"
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
	const { percent } = props;
	const weight = percent > 25 ? 2 : percent > 50 ? 3 : percent > 75 ? 4 : 1;
	const top = Math.max(20, percent);

	return (
		<div
			data-e2e="commit-item"
			class={s.item}
			data-selected={props.selected}
			onClick={props.onClick}
		>
			<div
				class={s.itemInner}
				data-weight={weight}
				style={`top: calc(100% - ${top}%)`}
			/>
		</div>
	);
}
