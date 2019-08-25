// Make fallback text readable in dark mode
if ((chrome.devtools.panels as any).themeName === "dark") {
	document.body.classList.add("dark");
}
