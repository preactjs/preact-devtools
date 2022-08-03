import { Plugin } from "vite";

export function componentLinks(): Plugin {
	const OPEN_IN_EDITOR = "/__open_in_editor";
	return {
		name: "component-links",
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				if (req.url?.startsWith(OPEN_IN_EDITOR)) {
					console.log(req.url);
					next();
				} else {
					next();
				}
			});
		},
	};
}
