import { h, Fragment } from "preact";
import { AppCtx, EmitCtx } from "../store/react-bindings";
import { Store } from "../store/types";
import { Elements } from "./elements/Elements";
import { Profiler } from "./profiler/Profiler";
import { useState } from "preact/hooks";
import { SmallTab, SmallTabGroup } from "./profiler/Tabs";
import s from "./Devtools.css";
import { ThemeSwitcher } from "./ThemeSwitcher";

export enum Panel {
	ELEMENTS = "ELEMENTS",
	PROFILER = "PROFILER",
}

export function DevTools(props: { store: Store }) {
	const [panel, setPanel] = useState<Panel>(Panel.ELEMENTS);

	const showElements = panel === Panel.ELEMENTS;
	const showProfiler = panel === Panel.PROFILER;

	return (
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
							</div>
							<a
								class={s.bugLink}
								href="https://github.com/preactjs/preact-devtools/issues"
							>
								Report bug
							</a>
						</SmallTabGroup>
						{showElements && <Elements />}
						{showProfiler && <Profiler />}
					</div>
				</Fragment>
			</AppCtx.Provider>
		</EmitCtx.Provider>
	);
}
