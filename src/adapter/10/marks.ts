// Here we use the "User Timing API" to collect samples for the
// native profiling tools of browsers. These timings will show
// up in the "Timing" category.

const markName = (s: string) => `⚛ ${s}`;

export function recordMark(s: string) {
	performance.mark(markName(s));
}

export function endMark(nodeName: string) {
	const name = markName(nodeName);
	const start = `${name}_diff`;
	const end = `${name}_diffed`;
	if (performance.getEntriesByName(start).length > 0) {
		performance.mark(end);
		performance.measure(name, start, end);
	}
	performance.clearMarks(start);
	performance.clearMarks(end);
	performance.clearMeasures(name);
}
