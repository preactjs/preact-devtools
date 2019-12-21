import { createProfilerStore } from "./ProfilerStore";

export function applyProfilerEvents(
	store: ReturnType<typeof createProfilerStore>,
	event: "profiling-commit",
	data: number[],
) {}
