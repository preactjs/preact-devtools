import { h } from "preact";
import { useStore, useObserver } from "../../../../store/react-bindings";
import s from "./ProfilerInfo.css";
import { RecordBtn } from "../TimelineBar/TimelineBar";

export function ProfilerInfo() {
	const store = useStore();
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const commits = useObserver(() => store.profiler.commits.$);

	if (isRecording) {
		return (
			<div class={s.root}>
				<p class={s.title}>Profiling in progress...</p>
				<p class={s.descr}>
					Click the record button{" "}
					<span class={s.inlineBtn}>
						<RecordBtn />
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
						<RecordBtn />
					</span>{" "}
					to start recording.
				</p>
			</div>
		);
	}

	return null;
}
