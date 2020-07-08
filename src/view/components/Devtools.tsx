import { h, Fragment } from "preact";
import {
	AppCtx,
	EmitCtx,
	WindowCtx,
	useObserver,
} from "../store/react-bindings";
import { Store, Panel } from "../store/types";
import { Elements } from "./elements/Elements";
import { Profiler } from "./profiler/components/Profiler";
import { SmallTab, SmallTabGroup } from "./profiler/components/Tabs/Tabs";
import s from "./Devtools.css";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Settings } from "./settings/Settings";
import { StatsPanel } from "./stats/StatsPanel";

export function DevTools(props: { store: Store; window: Window }) {
	const panel = useObserver(() => props.store.activePanel.$);

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
										onClick={() => (props.store.activePanel.$ = Panel.ELEMENTS)}
										checked={showElements}
										name="root-panel"
										value={Panel.ELEMENTS}
									>
										Elements
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
							{showSettings && <Settings />}
						</div>
					</Fragment>
				</AppCtx.Provider>
			</EmitCtx.Provider>
		</WindowCtx.Provider>
	);
}
