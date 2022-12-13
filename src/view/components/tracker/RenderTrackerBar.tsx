import { h } from "preact";
import { Actions, ActionSeparator } from "../Actions";
import { RecordBtn } from "../profiler/components/TimelineBar/TimelineBar";
import s from "../elements/TreeBar.module.css";
import { IconBtn } from "../IconBtn";
import { useStore } from "../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { startProfiling, resetProfiler } from "../profiler/data/commits";
import { Icon } from "../icons";

export function RenderTrackerBar() {
	const store = useStore();
	const commits = store.profiler.commits.value;
	const isRecording = store.profiler.isRecording.value;
	const isSupported = store.profiler.isSupported.value;

	const onReloadAndProfile = useCallback(() => {
		startProfiling(store.profiler);
		store.emit("reload-and-profile", {
			captureRenderReasons: store.profiler.captureRenderReasons.value,
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
					<Icon icon="refresh" />
				</IconBtn>
			</div>
			<div class={s.btnWrapper}>
				<IconBtn
					title="Clear profiling data"
					disabled={!isSupported || commits.length === 0 || isRecording}
					onClick={onReset}
				>
					<Icon icon="not-interested" />
				</IconBtn>
			</div>
			<ActionSeparator />
		</Actions>
	);
}
