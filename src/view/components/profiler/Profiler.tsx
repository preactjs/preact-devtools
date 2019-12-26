import { h, Fragment } from "preact";
import s from "../Devtools.css";
import s2 from "./Profiler.css";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { ModalRenderer } from "../Modals";
import { TimelineBar } from "./TimelineBar";
import { FlameGraph } from "./flamegraph/FlameGraph";
import { SidebarHeader } from "./SidebarHeader";
import { RenderedAt } from "./RenderedAt";
import { ProfilerInfo } from "./ProfilerInfo";
import { CommitInfo } from "./CommitInfo";
import { RenderReasons } from "./RenderReasons";

export function Profiler() {
	return (
		<Fragment>
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
				<RenderReasons />
				<RenderedAt />
				<CommitInfo />
			</div>
			<ModalRenderer />
		</Fragment>
	);
}
