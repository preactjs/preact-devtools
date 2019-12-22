import { h } from "preact";
import { Actions, ActionSeparator } from "../Actions";
import { CommitTimeline } from "./CommitTimeline";
import { IconBtn } from "../IconBtn";
import { useStore, useObserver } from "../../store/react-bindings";
import { SettingsIcon, RecordIcon, NotInterested } from "../icons";
import s from "../TreeBar.css";
import { useCallback } from "preact/hooks";
import { FlameGraphMode } from "./FlameGraphMode";

export function TimelineBar() {
	const store = useStore();
	const commits = useObserver(() => store.profiler.commits.$);
	const activeModal = useObserver(() => store.modal.active.$);
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const selectedCommit = useObserver(() => store.profiler.selected.$);
	const maxDuration = useObserver(() => store.profiler.slowestCommit.$);

	const onRecord = useCallback(() => {
		store.profiler.isRecording.$ = !store.profiler.isRecording.$;
	}, [store]);

	const onCommitChange = useCallback(
		(n: number) => {
			store.profiler.selected.$ = n;
		},
		[store],
	);

	return (
		<Actions>
			<div class={s.btnWrapper}>
				<RecordBtn onRecord={onRecord} isRecording={isRecording} />
			</div>
			<div class={s.btnWrapper}>
				<IconBtn
					title="Clear profiling data"
					disabled={commits.length === 0 || isRecording}
					onClick={store.profiler.clear}
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
			{commits.length > 0 && <ActionSeparator />}
			<CommitTimeline
				items={commits.map(x => {
					const percent = Math.max(
						0,
						(100 / maxDuration) * (x.length > 0 ? x[0].duration : 0),
					);
					return percent;
				})}
				selected={selectedCommit}
				onChange={onCommitChange}
			/>
		</Actions>
	);
}

export function RecordBtn(props: {
	isRecording?: boolean;
	onRecord: () => void;
}) {
	return (
		<IconBtn
			title={!props.isRecording ? "Start Recording" : "Stop Recording"}
			color={
				props.isRecording
					? "var(--color-record-active)"
					: "var(--color-selected-bg)"
			}
			onClick={props.onRecord}
		>
			<RecordIcon size="s" />
		</IconBtn>
	);
}
