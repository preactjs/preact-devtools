import { h } from "preact";
import { useState } from "preact/hooks";
import { Actions, ActionSeparator } from "./Actions";
import { IconBtn } from "./IconBtn";
import { SettingsIcon, Picker } from "./icons";
import { useStore, useObserver } from "../store";

export function TreeBar() {
	const [settings, setSettings] = useState(false);
	const store = useStore();
	const isPicking = useObserver(() => store.isPicking(), [store.isPicking]);
	return (
		<Actions>
			<IconBtn
				active={isPicking}
				title="Pick a Component from the page"
				onClick={() => {
					if (!isPicking) store.actions.startPickElement();
					else store.actions.stopPickElement();
				}}
			>
				<Picker />
			</IconBtn>
			<ActionSeparator />
			<div style="width: 100%">foo</div>
			<ActionSeparator />
			<IconBtn
				active={settings}
				title="Settings"
				onClick={() => setSettings(!settings)}
			>
				<SettingsIcon size="s" />
			</IconBtn>
		</Actions>
	);
}
