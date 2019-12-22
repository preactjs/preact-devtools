import { h } from "preact";
import { Store } from "../../store/types";
import s from "../Devtools.css";
import s2 from "./Profiler.css";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { AppCtx } from "../../store/react-bindings";
import { ModalRenderer } from "../Modals";
import { TimelineBar } from "./TimelineBar";
import { FlameGraph } from "./FlameGraph";
import { SidebarHeader } from "./SidebarHeader";
import { RenderedAt } from "./RenderedAt";
import { ProfilerInfo } from "./ProfilerInfo";
import { CommitInfo } from "./CommitInfo";

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
				<div class={`${s.components} ${s2.flamegraphWrapper}`}>
					<ProfilerInfo />
					<FlameGraph />
				</div>
				<div class={s.sidebarActions}>
					<SidebarHeader />
				</div>
				<div class={s.sidebar}>
					<RenderedAt />
					<CommitInfo />
				</div>
				<ModalRenderer />
			</div>
		</AppCtx.Provider>
	);
}
