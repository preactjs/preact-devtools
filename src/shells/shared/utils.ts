export function inject(codeOrSrc: string, mode: "script" | "code" = "code") {
	const s = document.createElement("script");
	// This runs before `<head>` is available
	const target = document.head || document.documentElement;
	if (mode === "code") s.textContent = codeOrSrc;
	else s.src = codeOrSrc;
	target.appendChild(s);
	s.remove();
}

export function injectStyles(href: string) {
	const s = document.createElement("link");
	s.rel = "stylesheet";
	s.href = href;
	document.head.appendChild(s);
}
