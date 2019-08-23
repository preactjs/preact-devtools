// Make fallback text readable in dark mode
if ((chrome.devtools.panels as any).themeName === "dark") {
	document.documentElement.style.setProperty("--color-text", "#aaa");
}
