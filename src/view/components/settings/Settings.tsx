import { h } from "preact";
import { useStore, useObserver } from "../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { Theme } from "../../store/types";
import { RadioBar } from "../RadioBar";
import s from "./Settings.css";

export function Settings() {
	const store = useStore();
	const theme = useObserver(() => store.theme.$);

	const setTheme = useCallback((v: Theme) => (store.theme.$ = v), []);

	return (
		<div class={s.root}>
			<form>
				<label class={s.label}>Theme:</label>
				<RadioBar
					name="theme"
					value={theme}
					onChange={setTheme}
					items={[
						{ label: "Auto", value: "auto" },
						{ label: "Light", value: "light" },
						{ label: "Dark", value: "dark" },
					]}
				/>
			</form>
		</div>
	);
}
