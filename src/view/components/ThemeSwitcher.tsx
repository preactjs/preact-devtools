import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { useStore } from "../store/react-bindings";

export function ThemeSwitcher() {
	const store = useStore();
	let theme = store.theme.value;
	if (theme === "auto") {
		theme = matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}

	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (ref.current) {
			// When rendered inside a shadow root the theme class must live
			// inside that tree, otherwise `.dark .theme` never matches.
			const target =
				ref.current.closest<HTMLElement>("[data-devtools-theme-root]") ||
				ref.current.ownerDocument!.body;
			target.classList.remove("auto", "light", "dark");
			target.classList.add(theme);
		}
	}, [theme, ref.current]);

	return <div ref={ref} style="display: none" />;
}
