import { h } from "preact";
import { useState } from "preact/hooks";
import s from "./ThemeSwitcher.css";

export function ThemeSwitcher() {
	const [theme, setTheme] = useState<"light" | "dark">(
		document.body.classList.contains("light") ? "light" : "dark",
	);

	const onChange = (next: "light" | "dark") => {
		const remove = next === "light" ? "dark" : "light";
		document.body.classList.remove(remove);
		document.body.classList.add(next);
		setTheme(next);
	};

	return (
		<div class={s.root}>
			<label class={s.label}>
				<input
					type="radio"
					name="theme"
					value="light"
					onChange={() => onChange("light")}
					checked={theme === "light"}
				/>
				Light
			</label>
			<label class={s.label}>
				<input
					type="radio"
					name="theme"
					value="dark"
					onChange={() => onChange("dark")}
					checked={theme === "dark"}
				/>
				Dark
			</label>
		</div>
	);
}
