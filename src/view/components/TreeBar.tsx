import { h } from "preact";
import { useState } from "preact/hooks";
import { Actions, ActionSeparator } from "./Actions";
import { IconBtn } from "./IconBtn";
import {
	SettingsIcon,
	Picker,
	KeyboardDown,
	KeyboardUp,
	Close,
	Search,
} from "./icons";
import { useStore, useObserver } from "../store";
import s from "./TreeBar.css";

export function TreeBar() {
	const [settings, setSettings] = useState(false);
	const store = useStore();
	const isPicking = useObserver(() => store.isPicking.$);
	const value = useObserver(() => store.search.value.$);
	const count = useObserver(() => store.search.count.$);
	const selected = useObserver(() => store.search.selected.$);
	const activeModal = useObserver(() => store.modal.active.$);
	return (
		<Actions>
			<IconBtn
				active={isPicking}
				title="Pick a Component from the page"
				onClick={() => {
					if (!isPicking) store.actions.startPickElement();
					else store.actions.stopPickElement();
				}}
			>
				<Picker />
			</IconBtn>
			<ActionSeparator />
			<div class={s.searchContainer}>
				<Search size="xs" />
				<input
					class={s.search}
					type="text"
					placeholder="Search"
					value={value}
					onInput={e => store.search.onChange((e.target as any).value)}
				/>
				{value !== "" && (
					<div class={s.searchCounter}>
						{count > 0 ? selected + 1 : 0} | {count}
					</div>
				)}
			</div>
			<ActionSeparator />
			<IconBtn onClick={store.search.selectNext}>
				<KeyboardDown />
			</IconBtn>
			<IconBtn onClick={store.search.selectPrev}>
				<KeyboardUp />
			</IconBtn>
			<IconBtn onClick={store.search.reset}>
				<Close />
			</IconBtn>
			<ActionSeparator />
			<IconBtn
				active={activeModal === "settings"}
				title="Settings"
				onClick={() => store.modal.open("settings")}
			>
				<SettingsIcon size="s" />
			</IconBtn>
		</Actions>
	);
}
