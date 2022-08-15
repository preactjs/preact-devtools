import { h } from "preact";
import { useStore } from "../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { Theme } from "../../store/types";
import { RadioBar } from "../RadioBar";
import { Checkbox } from "../Checkbox/Checkbox";
import { Message } from "../Message/Message";
import { PageLayout } from "../SidebarLayout";

export function Settings() {
	const store = useStore();
	const theme = store.theme.$;
	const renderReasons = store.profiler.captureRenderReasons.$;

	const highlightUpdates = store.profiler.highlightUpdates.$;
	const debugMode = store.debugMode.$;

	const setTheme = useCallback((v: Theme) => (store.theme.$ = v), []);

	return (
		<PageLayout>
			<div class="settings-tab">
				<form>
					<Checkbox
						checked={highlightUpdates}
						onChange={() => {
							const value = !store.profiler.highlightUpdates.$;
							store.profiler.highlightUpdates.$ = value;
							store.notify(
								value ? "start-highlight-updates" : "stop-highlight-updates",
								null,
							);
						}}
						testId="toggle-highlight-updates"
					>
						Highlight updates
					</Checkbox>
					<div>
						<p class="settings-tab-description">
							Visualize updates by highlighting each component that updated in
							the page.
						</p>
					</div>
					<Checkbox
						checked={renderReasons}
						onChange={() =>
							store.profiler.setRenderReasonCapture(!renderReasons)
						}
						testId="toggle-render-reason"
					>
						Capture render reasons
					</Checkbox>
					<div class="settings-tab-message">
						<Message type="info">
							All props, state, and hooks of the current node will be compared
							to the previous node to determine what changed between renders.
							Timings may be less accurate because of that.
						</Message>
					</div>

					<label class="settings-tab-label">Theme:</label>
					<RadioBar
						name="theme"
						value={theme}
						onChange={setTheme}
						items={[
							{ label: "Auto", value: "auto" },
							{ label: "Light", value: "light" },
							{ label: "Dark", value: "dark" },
						]}
					/>

					<h2>Experimental</h2>

					<div class="settings-tab-checkbox">
						<Checkbox
							checked={debugMode}
							onChange={() => (store.debugMode.$ = !store.debugMode.$)}
							testId="toggle-debug-mode"
						>
							Toggle debug mode
						</Checkbox>
					</div>
				</form>
			</div>
		</PageLayout>
	);
}
