import { h } from "preact";
import { Actions } from "../../Actions";
import s from "../../sidebar/Sidebar.css";
import { useStore, useObserver } from "../../../store/react-bindings";
import { ComponentName } from "../../ComponentName";

export function SidebarHeader() {
	const store = useStore();
	const selected = useObserver(() => store.profiler.selectedNode.$);

	return (
		<Actions class={s.actions}>
			<ComponentName>{selected && selected.name}</ComponentName>
		</Actions>
	);
}
