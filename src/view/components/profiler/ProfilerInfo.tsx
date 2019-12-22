import { h } from "preact";
import { useStore, useObserver } from "../../store/react-bindings";
import s from "./ProfilerInfo.css";
import { RecordBtn } from "./TimelineBar";
import { useCallback } from "preact/hooks";

export function ProfilerInfo() {
	const store = useStore();
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const commits = useObserver(() => store.profiler.commits.$);

	const onClick = useCallback(() => {
		store.profiler.isRecording.$ = !store.profiler.isRecording.$;
	}, [store]);

	if (isRecording) {
		return (
			<div class={s.root}>
				<p class={s.title}>Profiling in progress...</p>
				<p class={s.descr}>
					Click the record button{" "}
					<span class={s.inlineBtn}>
						<RecordBtn isRecording={isRecording} onRecord={onClick} />
					</span>{" "}
					to stop recording.
				</p>
			</div>
		);
	} else if (commits.length === 0) {
		return (
			<div class={s.root}>
				<p class={s.title}>No profiling data collected</p>
				<p class={s.descr}>
					Click the record button{" "}
					<span class={s.inlineBtn}>
						<RecordBtn isRecording={isRecording} onRecord={onClick} />
					</span>{" "}
					to start recording.
				</p>
			</div>
		);
	}

	return null;
}
