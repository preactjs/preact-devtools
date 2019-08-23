console.log("hello");

chrome.devtools.panels.create("Preact", "", "panel.html", function(panel) {
	console.log("created");
	// code invoked on panel creation

	if ((chrome.devtools.panels as any).themeName === "dark") {
		document.documentElement.style.setProperty("--color-text", "pink");
	}
});
