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

	const setTheme = useCallback((v: Theme) => (store.theme.$ = v), []);

	return (
		<div class={s.root}>
			<form>
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
				<h2>Profiler</h2>
				<Checkbox
					checked={renderReasons}
					onChange={() => store.profiler.setRenderReasonCapture(!renderReasons)}
					testId="toggle-render-reason"
				>
					Capture render reasons
				</Checkbox>
				<div class={s.message}>
					<Message type="info">Timings will be less accurate</Message>
				</div>
			</form>
		</div>
	);
}
