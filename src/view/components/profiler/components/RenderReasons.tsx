import { h } from "preact";
import { SidebarPanel } from "../../sidebar/SidebarPanel";
import { useStore, useObserver } from "../../../store/react-bindings";
import { RenderReason } from "../../../../adapter/10/renderer/renderReasons";
import s from "./RenderReason.css";

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
		default:
			return "Unknown reason";
	}
}

export function RenderReasons() {
	const store = useStore();
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const commits = useObserver(() => store.profiler.commits.$);
	const reason = useObserver(() => store.profiler.activeReason.$);

	if (commits.length === 0 || isRecording) {
		return null;
	}

	const hasReasons = reason !== null && reason.items && reason.items.length > 0;

	return (
		<SidebarPanel title="Render reasons" empty="Did not render">
			{reason !== null ? (
				<p class={s.reason}>
					{getReasonName(reason.type)}
					{hasReasons ? ": " : " "}
					{hasReasons && <b>{reason!.items!.join(", ")}</b>}
				</p>
			) : null}
		</SidebarPanel>
	);
}
