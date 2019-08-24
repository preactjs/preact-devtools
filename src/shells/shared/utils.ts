export function inject(code: string) {
	const s = document.createElement("script");
	s.textContent = code;
	// This runs before `<head>` is available
	document.documentElement.appendChild(s);
	s.remove();
}
