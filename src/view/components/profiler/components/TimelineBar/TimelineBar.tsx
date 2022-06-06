import { h } from "preact";
import { Actions, ActionSeparator } from "../../../Actions";
import { CommitTimeline } from "../CommitTimeline/CommitTimeline";
import { IconBtn } from "../../../IconBtn";
import { useStore, useObserver } from "../../../../store/react-bindings";
import { RecordIcon, NotInterested, Refresh } from "../../../icons";
import s from "../../../elements/TreeBar.module.css";
import { useCallback } from "preact/hooks";
import { FlameGraphMode } from "../../flamegraph/FlameGraphMode";
import { getCommitInitalSelectNodeId, resetProfiler } from "../../data/commits";

export function TimelineBar() {
	const store = useStore();
	const commits = useObserver(() => store.profiler.commits.$);
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const isSupported = useObserver(() => store.profiler.isSupported.$);
	const selectedCommit = useObserver(() => store.profiler.activeCommitIdx.$);
	const stats = useObserver(() => {
		return {
			max: Math.max(16, ...store.profiler.commits.$.map(x => x.duration)),
			min: Math.max(
				0,
				Math.min(...store.profiler.commits.$.map(x => x.duration)),
			),
		};
	});

	const onCommitChange = useCallback(
		(n: number) => {
			const {
				activeCommitIdx,
				selectedNodeId,
				activeCommit,
				flamegraphType,
			} = store.profiler;

			activeCommitIdx.$ = n;
			const commit = activeCommit.$;
			if (!commit) return;

			selectedNodeId.$ = getCommitInitalSelectNodeId(commit, flamegraphType.$);
		},
		[store],
	);

	const onReloadAndProfile = useCallback(() => {
		store.profiler.isRecording.$ = true;
		store.emit("reload-and-profile", {
			captureRenderReasons: store.profiler.captureRenderReasons.$,
		});
	}, []);

	const onReset = useCallback(() => {
		resetProfiler(store.profiler);
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
					items={commits.map(commit => {
						const percent =
							((commit.duration - stats.min) * 100) /
							(stats.max - stats.min || 0.1);
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
		} else {
			store.emit("stop-profiling", null);
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
