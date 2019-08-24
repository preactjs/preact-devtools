chrome.devtools.panels.create("Preact", "", "panel.html", function(panel) {
	if ((chrome.devtools.panels as any).themeName === "dark") {
		document.body.classList.add("dark");
	}
});
