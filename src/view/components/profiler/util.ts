export function formatTime(time: number) {
	return time < 0.1 ? "<0.1ms" : `${time}ms`;
}
