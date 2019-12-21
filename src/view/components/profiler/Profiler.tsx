import { h } from "preact";
import { Store } from "../../store/types";
import s from "../Devtools.css";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { AppCtx } from "../../store/react-bindings";
import { ModalRenderer } from "../Modals";
import { TimelineBar } from "./TimelineBar";

export interface Props {
	store: Store;
}

export function Profiler(props: Props) {
	return (
		<AppCtx.Provider value={props.store}>
			<div class={`${s.root} ${s.theme}`}>
				<ThemeSwitcher />
				<div class={s.componentActions}>
					<TimelineBar />
				</div>
				<div class={s.components}>
					<h1>Profiler</h1>
				</div>
				<div class={s.sidebarActions}>sidebarActions</div>
				<div class={s.sidebar}>sidebar</div>
				<ModalRenderer />
			</div>
		</AppCtx.Provider>
	);
}
