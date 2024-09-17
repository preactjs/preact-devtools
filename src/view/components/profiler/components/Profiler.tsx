import { h } from "preact";
import s from "../../Devtools.module.css";
import { ThemeSwitcher } from "../../ThemeSwitcher.tsx";
import { TimelineBar } from "./TimelineBar/TimelineBar.tsx";
import { FlameGraph } from "../flamegraph/FlameGraph.tsx";
import { SidebarHeader } from "./SidebarHeader.tsx";
import { RenderedAt } from "./RenderedAt/RenderedAt.tsx";
import { ProfilerInfo } from "./ProfilerInfo/ProfilerInfo.tsx";
import { CommitInfo } from "./CommitInfo/CommitInfo.tsx";
import { RenderReasons } from "./RenderReasons.tsx";
import { DebugProfilerInfo } from "./CommitInfo/DebugInfo.tsx";
import { DebugNodeNav } from "./RenderedAt/DebugNodeNav.tsx";
import { useStore } from "../../../store/react-bindings.ts";
import { SidebarLayout } from "../../SidebarLayout.tsx";
import { Message, MessageBtn } from "../../Message/Message.tsx";

export function Profiler() {
	const store = useStore();
	const showDebug = store.debugMode.value;
	const statsRecording = store.stats.isRecording.value;

	return (
		<SidebarLayout>
			<ThemeSwitcher />
			<div class={s.componentActions}>
				<TimelineBar />
			</div>
			<div class={`${s.components} flamegraph-wrapper`}>
				<ProfilerInfo />
				<FlameGraph />
			</div>
			<div class={s.sidebarActions}>
				<SidebarHeader />
			</div>
			<div class={s.sidebar}>
				{statsRecording && (
					<div class="profiler-sidebar-panel">
						<Message type="info">
							Stats recording is enabled. Timings may be less accurate.
							<MessageBtn
								onClick={() => {
									store.stats.isRecording.value = false;
								}}
								testId="disable-stats-recording"
							>
								Disable
							</MessageBtn>
						</Message>
					</div>
				)}
				<RenderReasons />
				<RenderedAt />
				<CommitInfo />
				{showDebug && <DebugProfilerInfo />}
				{showDebug && <DebugNodeNav />}
			</div>
		</SidebarLayout>
	);
}
