import { h } from "preact";
import { useState } from "preact/hooks";
import { Actions } from "./Actions";
import { IconBtn } from "./IconBtn";

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
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 3.733 3.921"
					height="14.82"
					width="14.109"
				>
					<path
						d="M2.456.423c-.172.17-.34.438-.585.437-.243-.001-.41-.271-.58-.443L.829.682c.062.234.21.514.087.724-.123.21-.44.22-.673.281L.24 2.22c.294.053.517-.036.671.288.154.324-.03.49-.093.723l.46.268c.171-.17.23-.419.584-.437.353-.018.43.273.58.443l.462-.265c-.062-.234-.21-.513-.087-.724.123-.21.44-.22.673-.281l.003-.532c-.233-.064-.55-.076-.671-.288-.12-.211.03-.49.093-.723zm-.327 1.09c.252.142.338.459.193.706a.53.53 0 0 1-.718.19.513.513 0 0 1-.193-.707.53.53 0 0 1 .718-.19z"
						fill="none"
						stroke="currentColor"
						stroke-width=".235"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-dashoffset="8.791"
					/>
				</svg>
			</IconBtn>
		</Actions>
	);
}
