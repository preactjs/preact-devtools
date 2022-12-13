import { h } from "preact";
import s from "./RenderTracker.module.css";

export function RenderTrackerFooter() {
	return (
		<div class={s.footer}>
			<div></div>
			<div>
				<p class={s.footerSection}>mounts: x</p>
				<p class={s.footerSection}>updates: x</p>
				<p class={s.footerSection}>unmounts: x</p>
			</div>
		</div>
	);
}
