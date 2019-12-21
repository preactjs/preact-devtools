import { valoo } from "../../valoo";
import { EmitFn } from "../../../adapter/hook";

export function createProfilerStore(emit: EmitFn) {
	const commits = valoo([20, 80, 10, 10]);
	const selected = valoo(0);
	const isRecording = valoo(false);

	isRecording.on(v => emit(v ? "start-profiling" : "stop-profiling", null));

	const clear = () => {
		commits.$ = [];
		selected.$ = 0;
		isRecording.$ = false;
		emit("clear-profiling", null);
	};

	return {
		clear,
		commits,
		selected,
		isRecording,
	};
}
