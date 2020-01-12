import { h } from "preact";
import { Actions, ActionSeparator } from "../../../Actions";
import { CommitTimeline } from "../CommitTimeline/CommitTimeline";
import { IconBtn } from "../../../IconBtn";
import { useStore, useObserver } from "../../../../store/react-bindings";
import { RecordIcon, NotInterested } from "../../../icons";
import s from "../../../elements/TreeBar.css";
import { useCallback } from "preact/hooks";
import { FlameGraphMode } from "../../flamegraph/FlameGraphMode";
import { resetProfiler } from "../../data/commits";

export function TimelineBar() {
	const store = useStore();
	const commits = useObserver(() => store.profiler.commits.$);
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const isSupported = useObserver(() => store.profiler.isSupported.$);
	const selectedCommit = useObserver(() => store.profiler.activeCommitIdx.$);
	const maxDuration = useObserver(() => {
		return Math.max(0, ...store.profiler.commits.$.map(x => x.duration));
	});

	const onCommitChange = useCallback(
		(n: number) => {
			store.profiler.activeCommitIdx.$ = n;
		},
		[store],
	);

	const onReset = useCallback(() => {
		resetProfiler(store.profiler);
	}, [store]);

	return (
		<Actions>
			<div class={s.btnWrapper}>
				<RecordBtn />
			</div>
			<div class={s.btnWrapper}>
				<IconBtn
					title="Clear profiling data"
					disabled={!isSupported || commits.length === 0 || isRecording}
					onClick={onReset}
				>
					<NotInterested size="s" />
				</IconBtn>
			</div>
			<ActionSeparator />
			<FlameGraphMode />
			<ActionSeparator />
			{isSupported && !isRecording && (
				<CommitTimeline
					items={commits.map(x => {
						const root = x.nodes.get(x.commitRootId);
						const percent = Math.max(
							0,
							(100 / (maxDuration || 1)) *
								(root ? root.treeEndTime - root.treeStartTime : 0),
						);
						return percent;
					})}
					selected={selectedCommit}
					onChange={onCommitChange}
				/>
			)}
		</Actions>
	);
}

export function RecordBtn() {
	const store = useStore();
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const isSupported = useObserver(() => store.profiler.isSupported.$);

	const onClick = useCallback(() => {
		store.profiler.isRecording.$ = !store.profiler.isRecording.$;
	}, [store]);

	return (
		<IconBtn
			title={!isRecording ? "Start Recording" : "Stop Recording"}
			color={
				isSupported
					? isRecording
						? "var(--color-record-active)"
						: "var(--color-selected-bg)"
					: "var(--color-disabled)"
			}
			onClick={onClick}
			disabled={!isSupported}
		>
			<RecordIcon size="s" />
		</IconBtn>
	);
}
