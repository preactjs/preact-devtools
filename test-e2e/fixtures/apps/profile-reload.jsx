{
	const app = document.getElementById("app");

	const iframe = document.createElement("iframe");
	iframe.id = "test-case";
	iframe.src = "/iframe.html";

	app.appendChild(iframe);
}
