import { h } from "preact";
import { Observable } from "../../../signals";
import { SidebarPanel } from "../SidebarPanel";

export interface SignalPanelProps {
	uncollapsed: Observable<string[]>;
	items: any;
}

export function SignalPanel(props: SignalPanelProps) {
	const uncollapsed = props.uncollapsed.$;

	return (
		<SidebarPanel title="Signals" testId="signals">
			signals
		</SidebarPanel>
	);
}
