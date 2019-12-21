import { h } from "preact";
import { Actions } from "../Actions";
import s from "../sidebar/Sidebar.css";
import { useStore, useObserver } from "../../store/react-bindings";

export interface ProfilerSidebarHeader {
	title?: string;
}

export function SidebarHeader(props: ProfilerSidebarHeader) {
	const store = useStore();
	const selected = useObserver(() => store.profiler.selectedNodeData.$);

	return (
		<Actions class={s.actions}>
			<span class={s.title}>{selected ? selected.name : "-"}</span>
		</Actions>
	);
}
