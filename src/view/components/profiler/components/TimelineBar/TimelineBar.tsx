import { h } from "preact";
import { Actions, ActionSeparator } from "../../../Actions";
import { CommitTimeline } from "../CommitTimeline/CommitTimeline";
import { IconBtn } from "../../../IconBtn";
import { useStore, useObserver } from "../../../../store/react-bindings";
import { RecordIcon, NotInterested, Refresh } from "../../../icons";
import s from "../../../elements/TreeBar.module.css";
import { useCallback } from "preact/hooks";
import { FlameGraphMode } from "../../flamegraph/FlameGraphMode";
import { resetProfiler } from "../../data/commits";
import { ProfilerCommit } from "../../data/profiler2";

export function getCommitDuration({ rendered, selfDurations }: ProfilerCommit) {
	return Array.from(rendered).reduce((acc, id) => {
		return acc + selfDurations.get(id)!;
	}, 0);
}

export function TimelineBar() {
	const store = useStore();
	const { durations, max, min } = useObserver(() => {
		const commits = store.profiler.commits.$;
		const durations = commits.map(commit => getCommitDuration(commit));

		return {
			durations,
			max: Math.max(16, ...durations),
			min: Math.max(0, Math.min(...durations)),
		};
	});
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const isSupported = useObserver(() => store.profiler.isSupported.$);
	const selectedCommit = useObserver(() => store.profiler.activeCommitIdx.$);

	const onCommitChange = useCallback(
		(n: number) => {
			store.profiler.activeCommitIdx.$ = n;
		},
		[store],
	);

	const onReloadAndProfile = useCallback(() => {
		const profiler = store.profiler;

		resetProfiler(profiler);
		profiler.isRecording.$ = true;
		profiler.currentSelfDurations.clear();
		store.emit("reload-and-profile", {
			captureRenderReasons: store.profiler.captureRenderReasons.$,
		});
	}, []);

	const onReset = useCallback(() => {
		const profiler = store.profiler;

		resetProfiler(profiler);
		store.emit("stop-profiling", null);
	}, [store]);

	return (
		<Actions>
			<div class={s.btnWrapper}>
				<RecordBtn />
			</div>
			<div class={s.btnWrapper}>
				<IconBtn
					title="Reload and profile"
					disabled={!isSupported || isRecording}
					testId="reload-and-profile-btn"
					onClick={onReloadAndProfile}
				>
					<Refresh size="s" />
				</IconBtn>
			</div>
			<div class={s.btnWrapper}>
				<IconBtn
					title="Clear profiling data"
					disabled={!isSupported || durations.length === 0 || isRecording}
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
					items={durations.map(duration => {
						const percent = ((duration - min) * 100) / (max - min || 0.05);
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
		const { isRecording, captureRenderReasons } = store.profiler;
		const v = !isRecording.$;
		isRecording.$ = v;

		if (v) {
			store.emit("start-profiling", {
				captureRenderReasons: captureRenderReasons.$,
			});
		}
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
			testId="record-btn"
		>
			<RecordIcon size="s" />
		</IconBtn>
	);
}
