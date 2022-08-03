import { h } from "preact";
import { Icon } from "../icons";

export interface LinkProviderPanelProps {
	storyUrl?: string;
	canOpenEditor?: boolean;
}

export function LinkProviderPanel({
	storyUrl,
	canOpenEditor,
}: LinkProviderPanelProps) {
	if (!storyUrl && !canOpenEditor) {
		return null;
	}

	return (
		<div class="action-btn-area">
			{canOpenEditor && (
				<button class="action-btn">
					<Icon icon="edit" />
					open in editor
				</button>
			)}
			{storyUrl && (
				<a class="action-btn" href={storyUrl}>
					<Icon icon="external" />
					open story
				</a>
			)}
		</div>
	);
}
