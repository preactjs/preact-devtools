import { h } from "preact";
import { useStore, useObserver } from "../../../../store/react-bindings";
import s from "./ProfilerInfo.module.css";
import { RecordBtn } from "../TimelineBar/TimelineBar";

export function ProfilerInfo() {
	const store = useStore();
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const isSupported = useObserver(() => store.profiler.isSupported.$);
	const commits = useObserver(() => store.profiler.commits.$);

	if (!isSupported) {
		return (
			<div class={s.root} data-testid="profiler-info">
				<p class={s.title}>Profiling is not supported</p>
				<p class={s.descr}>
					Please upgrade Preact to a version that supports it (&gt;=10.3.0).
				</p>
			</div>
		);
	} else if (isRecording) {
		return (
			<div class={s.root} data-testid="profiler-info">
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
			<div class={s.root} data-testid="profiler-info">
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
