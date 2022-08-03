import { Fragment, h } from "preact";
import { Icon } from "../icons";
import { SidebarPanel } from "./SidebarPanel";

export interface Props {
	onCopy: () => void;
	value: string;
}

export function LinkProviderPanel() {
	return (
		<div class="action-btn-area">
			<button class="action-btn">
				<Icon icon="edit" />
				open editor
			</button>
			<a class="action-btn" href="#">
				<Icon icon="external" />
				open story
			</a>
		</div>
	);
}
