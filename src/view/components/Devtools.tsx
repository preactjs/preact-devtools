import { h, Fragment } from "preact";
import { AppCtx, EmitCtx, WindowCtx } from "../store/react-bindings";
import { Store } from "../store/types";
import { Elements } from "./elements/Elements";
import { Profiler } from "./profiler/components/Profiler";
import { useState } from "preact/hooks";
import { SmallTab, SmallTabGroup } from "./profiler/components/Tabs/Tabs";
import s from "./Devtools.css";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Settings } from "./settings/Settings";

export enum Panel {
	ELEMENTS = "ELEMENTS",
	PROFILER = "PROFILER",
	SETTINGS = "SETTINGS",
}

export function DevTools(props: { store: Store; window: Window }) {
	const [panel, setPanel] = useState<Panel>(Panel.ELEMENTS);

	const showElements = panel === Panel.ELEMENTS;
	const showProfiler = panel === Panel.PROFILER;
	const showSettings = panel === Panel.SETTINGS;

	return (
		<WindowCtx.Provider value={props.window}>
			<EmitCtx.Provider value={props.store.emit}>
				<AppCtx.Provider value={props.store}>
					<Fragment>
						<div class={`${s.theme} ${s.root}`}>
							<ThemeSwitcher />
							<SmallTabGroup class={s.switcher}>
								<div class={s.switcherInner}>
									<SmallTab
										onClick={setPanel as any}
										checked={showElements}
										name="root-panel"
										value={Panel.ELEMENTS}
									>
										Elements
									</SmallTab>
									<SmallTab
										onClick={setPanel as any}
										checked={showProfiler}
										name="root-panel"
										value={Panel.PROFILER}
									>
										Profiler
									</SmallTab>
									<SmallTab
										onClick={setPanel as any}
										checked={showSettings}
										name="root-panel"
										value={Panel.SETTINGS}
									>
										Settings
									</SmallTab>
								</div>
								<a
									class={s.bugLink}
									href="https://github.com/preactjs/preact-devtools/issues"
									target="_blank"
									rel="noopener noreferrer"
								>
									Report bug
								</a>
							</SmallTabGroup>
							{showElements && <Elements />}
							{showProfiler && <Profiler />}
							{showSettings && <Settings />}
						</div>
					</Fragment>
				</AppCtx.Provider>
			</EmitCtx.Provider>
		</WindowCtx.Provider>
	);
}
