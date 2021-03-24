import { h } from "preact";
import s from "./App.module.css";
import { ThemeSwitcher } from "../ThemeSwitcher/ThemeSwitcher";
import { Content, stories } from "../Content/Content";
import { useState } from "preact/hooks";

export function App() {
	const [active, setActive] = useState("");
	return (
		<div class={s.root}>
			<header class={s.header}>
				<ThemeSwitcher />
			</header>
			<aside class={s.sidebar}>
				<h2>Test cases</h2>
				<nav>
					<ul class={s.menu}>
						{Object.keys(stories)
							.sort()
							.map(tc => {
								const depth = (tc.match(/\//g) || []).length;
								return (
									<li key={tc} class={s.menuItem} data-indent={depth}>
										<a href={"/#" + tc} onClick={() => setActive(tc)}>
											{tc}
										</a>
									</li>
								);
							})}
					</ul>
				</nav>
			</aside>
			<main class={s.main}>
				<Content key={active} />
			</main>
		</div>
	);
}
