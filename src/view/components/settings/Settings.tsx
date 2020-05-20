import { h } from "preact";
import { useStore, useObserver } from "../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { Theme } from "../../store/types";
import { RadioBar } from "../RadioBar";
import s from "./Settings.css";
import { Checkbox } from "../Checkbox/Checkbox";
import { Message } from "../Message/Message";

export function Settings() {
	const store = useStore();
	const theme = useObserver(() => store.theme.$);
	const renderReasons = useObserver(
		() => store.profiler.captureRenderReasons.$,
	);
	const highlightUpdates = useObserver(() => store.profiler.highlightUpdates.$);
	const debugMode = useObserver(() => store.debugMode.$);

	const setTheme = useCallback((v: Theme) => (store.theme.$ = v), []);

	return (
		<div class={s.root}>
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
					<p class={s.description}>
						Visualize updates by highlighting each component that updated in the
						page.
					</p>
				</div>
				<Checkbox
					checked={renderReasons}
					onChange={() => store.profiler.setRenderReasonCapture(!renderReasons)}
					testId="toggle-render-reason"
				>
					Capture render reasons
				</Checkbox>
				<div class={s.message}>
					<Message type="info">
						All props, state, and hooks of the current node will be compared to
						the previous node to determine what changed between renders. Timings
						may be less accurate because of that.
					</Message>
				</div>

				<h2>Common</h2>
				<label class={s.label}>Theme:</label>
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
				<Checkbox
					checked={debugMode}
					onChange={() => (store.debugMode.$ = !store.debugMode.$)}
					testId="toggle-debug-mode"
				>
					Toggle debug mode
				</Checkbox>
			</form>
		</div>
	);
}
