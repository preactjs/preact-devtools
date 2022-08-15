import { h, Fragment } from "preact";
import { AppCtx, EmitCtx, WindowCtx } from "../store/react-bindings";
import { Store, Panel } from "../store/types";
import { Elements } from "./elements/Elements";
import { Profiler } from "./profiler/components/Profiler";
import { SmallTab, SmallTabGroup } from "./profiler/components/Tabs/Tabs";
import "./devtools.css";
import s from "./Devtools.module.css";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Settings } from "./settings/Settings";
import { StatsPanel } from "./stats/StatsPanel";
import { SignalsPage } from "./signals/SignalsPage";

export function DevTools(props: { store: Store; window: Window }) {
	const panel = props.store.activePanel.$;

	const showElements = panel === Panel.ELEMENTS;
	const showProfiler = panel === Panel.PROFILER;
	const showSettings = panel === Panel.SETTINGS;
	const showSignals = panel === Panel.SIGNALS;
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
										onClick={() => (props.store.activePanel.$ = Panel.ELEMENTS)}
										checked={showElements}
										name="root-panel"
										value={Panel.ELEMENTS}
									>
										Elements
									</SmallTab>
									<SmallTab
										onClick={() => (props.store.activePanel.$ = Panel.SIGNALS)}
										checked={showSignals}
										name="root-panel"
										value={Panel.SIGNALS}
									>
										Signals
									</SmallTab>
									<SmallTab
										onClick={() => (props.store.activePanel.$ = Panel.PROFILER)}
										checked={showProfiler}
										name="root-panel"
										value={Panel.PROFILER}
									>
										Profiler
									</SmallTab>
									<SmallTab
										onClick={() =>
											(props.store.activePanel.$ = Panel.STATISTICS)
										}
										checked={showStats}
										name="root-panel"
										value={Panel.STATISTICS}
									>
										Statistics
									</SmallTab>
									<SmallTab
										onClick={() => (props.store.activePanel.$ = Panel.SETTINGS)}
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
							{showSignals && <SignalsPage />}
							{showSettings && <Settings />}
						</div>
					</Fragment>
				</AppCtx.Provider>
			</EmitCtx.Provider>
		</WindowCtx.Provider>
	);
}
