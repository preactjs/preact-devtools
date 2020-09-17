import { h } from "preact";
import { SidebarPanel } from "./SidebarPanel";
import s from "./KeyPanel.css";

export interface Props {
	onCopy: () => void;
	value: string;
}

export function KeyPanel(props: Props) {
	return (
		<SidebarPanel title="Key" testId="key-panel" onCopy={props.onCopy}>
			<span class={s.key} data-testid="vnode-key">
				{props.value}
			</span>
		</SidebarPanel>
	);
}
