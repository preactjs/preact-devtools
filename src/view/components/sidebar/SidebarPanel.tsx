import { h, ComponentChildren } from "preact";
import { IconBtn } from "../IconBtn";
import { FileCopy } from "../icons";

export interface Props {
	title: string;
	onCopy?: () => void;
	children?: ComponentChildren;
	testId?: string;
}

export function SidebarPanel(props: Props) {
	return (
		<div class="sidebar-panel" data-testid={props.testId}>
			<header class="sidebar-panel-header">
				<h3 class="sidebar-panel-title">{props.title}</h3>
				{props.onCopy && props.children != null && (
					<IconBtn onClick={props.onCopy} title={`Copy ${props.title}`}>
						<FileCopy />
					</IconBtn>
				)}
			</header>
			<div class="sidebar-panel-content">{props.children}</div>
		</div>
	);
}

export function Empty(props: { children?: any }) {
	return <span class="sidebar-panel-placeholder">{props.children}</span>;
}
