import { Fragment, h } from "preact";
import { AppCtx, EmitCtx, WindowCtx } from "../store/react-bindings.ts";
import { Panel, Store } from "../store/types.ts";
import { Elements } from "./elements/Elements.tsx";
import { Profiler } from "./profiler/components/Profiler.tsx";
import { SmallTab, SmallTabGroup } from "./profiler/components/Tabs/Tabs.tsx";
import "./devtools.css";
import s from "./Devtools.module.css";
import { ThemeSwitcher } from "./ThemeSwitcher.tsx";
import { Settings } from "./settings/Settings.tsx";
import { StatsPanel } from "./stats/StatsPanel.tsx";

export function DevTools(props: { store: Store; window: Window }) {
	const panel = props.store.activePanel.value;

	const showElements = panel === Panel.ELEMENTS;
	const showProfiler = panel === Panel.PROFILER;
	const showSettings = panel === Panel.SETTINGS;
	const showStats = panel === Panel.STATISTICS;

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
										onClick={() => (props.store.activePanel.value =
											Panel.ELEMENTS)}
										checked={showElements}
										name="root-panel"
										value={Panel.ELEMENTS}
									>
										Elements
									</SmallTab>
									<SmallTab
										onClick={() => (props.store.activePanel.value =
											Panel.PROFILER)}
										checked={showProfiler}
										name="root-panel"
										value={Panel.PROFILER}
									>
										Profiler
									</SmallTab>
									<SmallTab
										onClick={() => (props.store.activePanel.value =
											Panel.STATISTICS)}
										checked={showStats}
										name="root-panel"
										value={Panel.STATISTICS}
									>
										Statistics
									</SmallTab>
									<SmallTab
										onClick={() => (props.store.activePanel.value =
											Panel.SETTINGS)}
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
							{showStats && <StatsPanel />}
							{showSettings && <Settings />}
						</div>
					</Fragment>
				</AppCtx.Provider>
			</EmitCtx.Provider>
		</WindowCtx.Provider>
	);
}
