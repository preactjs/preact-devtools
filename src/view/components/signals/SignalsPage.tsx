import { h } from "preact";
import { Actions } from "../Actions";
import s from "../Devtools.module.css";
import { SidebarLayout } from "../SidebarLayout";
import { ThemeSwitcher } from "../ThemeSwitcher";

export function SignalsPage() {
	return (
		<SidebarLayout>
			<ThemeSwitcher />
			<div class={s.componentActions}>
				<Actions>asdf</Actions>
			</div>
			<div class={s.components}>
				<p>SIGNALS</p>
			</div>
			<div class={s.sidebarActions}>
				<Actions>asdf</Actions>
			</div>
			<div class={s.sidebar}>
				<p>SIDEBAR</p>
			</div>
		</SidebarLayout>
	);
}
