import { h } from "preact";
import { Actions, ActionSeparator } from "../Actions";
import { CommitTimeline } from "./CommitTimeline";
import { IconBtn } from "../IconBtn";
import { useStore, useObserver } from "../../store/react-bindings";
import { SettingsIcon, RecordIcon, NotInterested } from "../icons";
import s from "../TreeBar.css";
import { useCallback } from "preact/hooks";
import { FlameGraphMode } from "./flamegraph/FlameGraphMode";
import { resetProfiler } from "../../store/commits";

export function TimelineBar() {
	const store = useStore();
	const commits = useObserver(() => store.profiler2.commits.$);
	const activeModal = useObserver(() => store.modal.active.$);
	const isRecording = useObserver(() => store.profiler2.isRecording.$);
	const selectedCommit = useObserver(() => store.profiler2.activeCommitIdx.$);
	const maxDuration = useObserver(() => {
		return Math.max(0, ...store.profiler2.commits.$.map(x => x.duration));
	});

	const onCommitChange = useCallback(
		(n: number) => {
			store.profiler2.activeCommitIdx.$ = n;
		},
		[store],
	);

	const onReset = useCallback(() => {
		resetProfiler(store.profiler2);
	}, [store]);

	return (
		<Actions>
			<div class={s.btnWrapper}>
				<RecordBtn />
			</div>
			<div class={s.btnWrapper}>
				<IconBtn
					title="Clear profiling data"
					disabled={commits.length === 0 || isRecording}
					onClick={onReset}
				>
					<NotInterested size="s" />
				</IconBtn>
			</div>
			<ActionSeparator />
			<FlameGraphMode />
			<ActionSeparator />
			<div style="width: 100%" />
			<div class={s.btnWrapper}>
				<IconBtn
					active={activeModal === "settings"}
					title="Settings"
					disabled={isRecording}
					onClick={() => store.modal.open("settings")}
				>
					<SettingsIcon size="s" />
				</IconBtn>
			</div>
			{!isRecording && commits.length > 0 && <ActionSeparator />}
			{!isRecording && (
				<CommitTimeline
					items={commits.map(x => {
						const root = x.nodes.get(x.rootId);
						const percent = Math.max(
							0,
							(100 / (maxDuration || 1)) * (root ? root.duration : 0),
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
	const isRecording = useObserver(() => store.profiler2.isRecording.$);

	const onClick = useCallback(() => {
		store.profiler2.isRecording.$ = !store.profiler2.isRecording.$;
	}, [store]);

	return (
		<IconBtn
			title={!isRecording ? "Start Recording" : "Stop Recording"}
			color={
				isRecording ? "var(--color-record-active)" : "var(--color-selected-bg)"
			}
			onClick={onClick}
		>
			<RecordIcon size="s" />
		</IconBtn>
	);
}
