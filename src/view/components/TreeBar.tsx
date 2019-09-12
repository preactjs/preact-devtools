import { h } from "preact";
import { useState } from "preact/hooks";
import { Actions } from "./Actions";
import { IconBtn } from "./IconBtn";
import { SettingsIcon } from "./icons";

export function TreeBar() {
	const [inspect, setInspect] = useState(false);
	const [settings, setSettings] = useState(false);
	return (
		<Actions>
			<IconBtn
				data-active={inspect}
				title="Inspect Element"
				onClick={() => setInspect(!inspect)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 4.233 4.233"
				>
					<g stroke="currentColor">
						<path
							d="M3.969 3.292V.794a.528.528 0 0 0-.53-.53H.795a.528.528 0 0 0-.53.53V3.44c0 .293.237.529.53.529h2.532"
							opacity=".893"
							fill="none"
							stroke-linejoin="round"
							stroke-dashoffset="8.791"
							stroke-width=".26458"
						/>
						<path
							d="M1.323 1.323l.873 2.037L3.36 2.196z"
							stroke-width=".291"
							stroke-linecap="round"
							stroke-linejoin="round"
							fill="currentColor"
						/>
						<path d="M2.87 2.87L3.93 3.93" fill="none" stroke-width=".265" />
					</g>
				</svg>
			</IconBtn>
			<div style="width: 100%">foo</div>
			<IconBtn
				data-active={settings}
				title="Settings"
				onClick={() => setSettings(!settings)}
			>
				<SettingsIcon size="s" />
			</IconBtn>
		</Actions>
	);
}
