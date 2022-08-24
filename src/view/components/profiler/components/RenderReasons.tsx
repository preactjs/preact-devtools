import { h } from "preact";
import { SidebarPanel, Empty } from "../../sidebar/SidebarPanel";
import { useStore } from "../../../store/react-bindings";
import { RenderReason } from "../../../../adapter/shared/renderReasons";
import { Message, MessageBtn } from "../../Message/Message";
import { startProfiling } from "../data/commits";

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
	const isRecording = store.profiler.isRecording.value;
	const commits = store.profiler.commits.value;
	const reason = store.profiler.activeReason.value;
	const commit = store.profiler.activeCommit.value;
	const selected = store.profiler.selectedNode.value;
	const isSupported = store.profiler.supportsRenderReasons.value;
	const captureReason = store.profiler.captureRenderReasons.value;

	if (commits.length === 0 || isRecording) {
		return null;
	}

	const hasReasons = reason !== null && reason.items && reason.items.length > 0;

	const rendered =
		!captureReason && commit && selected && commit.rendered.has(selected.id);

	return (
		<SidebarPanel title="Render reasons">
			<div data-testid="render-reasons">
				{reason !== null ? (
					<dl class="render-reason">
						<dt class="render-reason-name">
							{getReasonName(reason.type)}
							{hasReasons ? ":" : ""}
						</dt>
						<dd class="render-reason-value">
							{hasReasons && reason!.items!.join(", ")}
						</dd>
					</dl>
				) : (
					<Empty>{rendered ? "-" : "Did not render"}</Empty>
				)}
			</div>
			<div class="render-reason-message">
				{isSupported ? (
					<Message type={captureReason ? "info" : "warning"}>
						{captureReason
							? "Timings may be less accurate. "
							: "Capturing disabled. "}
						<MessageBtn
							onClick={() => {
								const value = !captureReason;
								store.profiler.setRenderReasonCapture(value);
								startProfiling(store.profiler);
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
