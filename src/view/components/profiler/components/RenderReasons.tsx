import { h } from "preact";
import { SidebarPanel, Empty } from "../../sidebar/SidebarPanel";
import { useStore, useObserver } from "../../../store/react-bindings";
import { RenderReason } from "../../../../adapter/shared/renderReasons";
import s from "./RenderReason.module.css";
import { Message, MessageBtn } from "../../Message/Message";

function getReasonName(reason: RenderReason) {
	switch (reason) {
		case RenderReason.HOOKS_CHANGED:
			return "Hooks changed";
		case RenderReason.MOUNT:
			return "Component mounted";
		case RenderReason.PARENT_UPDATE:
			return "Parent updated";
		case RenderReason.PROPS_CHANGED:
			return "Props changed";
		case RenderReason.STATE_CHANGED:
			return "State changed";
		case RenderReason.FORCE_UPDATE:
			return "Force update";
		default:
			return "Unknown reason";
	}
}

export function RenderReasons() {
	const store = useStore();
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	// FIXME
	return null;
	const commits = useObserver(() => store.profiler.commits.$);
	const reason = useObserver(() => store.profiler.activeReason.$);
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const selected = useObserver(() => store.profiler.selectedNode.$);
	const isSupported = useObserver(() => store.profiler.supportsRenderReasons.$);
	const captureReason = useObserver(
		() => store.profiler.captureRenderReasons.$,
	);

	if (commits.length === 0 || isRecording) {
		return null;
	}

	const hasReasons = reason !== null && reason.items && reason.items.length > 0;

	let rendered = false;
	if (!captureReason && commit) {
		const root = commit.nodes.get(commit.commitRootId);
		if (
			root &&
			selected
			// FIXME: Get another way to detect if the node rendered
		) {
			rendered = true;
		}
	}

	return (
		<SidebarPanel title="Render reasons">
			<div data-testid="render-reasons">
				{reason !== null ? (
					<dl class={s.reason}>
						<dt class={s.reasonName}>
							{getReasonName(reason.type)}
							{hasReasons ? ":" : ""}
						</dt>
						<dd class={s.reasonValue}>
							{hasReasons && reason!.items!.join(", ")}
						</dd>
					</dl>
				) : (
					<Empty>{rendered ? "-" : "Did not render"}</Empty>
				)}
			</div>
			<div class={s.message}>
				{isSupported ? (
					<Message type={captureReason ? "info" : "warning"}>
						{captureReason
							? "Timings may be less accurate. "
							: "Capturing disabled. "}
						<MessageBtn
							onClick={() => {
								const value = !captureReason;
								store.profiler.setRenderReasonCapture(value);
								store.profiler.isRecording.$ = true;
								store.emit("start-profiling", {
									captureRenderReasons: value,
								});
							}}
							testId="toggle-render-reason"
						>
							{captureReason ? "Disable" : "Enable"}
						</MessageBtn>
					</Message>
				) : (
					<Message type="warning">
						Upgrade to Preact &gt;=10.4.1 to fully enable this feature.
					</Message>
				)}
			</div>
		</SidebarPanel>
	);
}
