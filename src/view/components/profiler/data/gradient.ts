export const gradient = [
	"var(--color-profiler-gradient-0)",
	"var(--color-profiler-gradient-1)",
	"var(--color-profiler-gradient-2)",
	"var(--color-profiler-gradient-3)",
	"var(--color-profiler-gradient-4)",
	"var(--color-profiler-gradient-5)",
	"var(--color-profiler-gradient-6)",
	"var(--color-profiler-gradient-7)",
	"var(--color-profiler-gradient-8)",
	"var(--color-profiler-gradient-9)",
];

export function getGradient(n: number) {
	const max = gradient.length - 1;
	let i = 0;
	if (!isNaN(n)) {
		if (!isFinite(n)) {
			i = max;
		} else {
			i = Math.max(0, Math.min(max, n)) * max;
		}
	}

	return gradient[Math.round(i)];
}
