import { h, ComponentChildren, Fragment } from "preact";
import s from "./Modal.css";
import { useStore, useObserver } from "../store/react-bindings";
import { IconBtn } from "./IconBtn";
import { Close } from "./icons";
import { valoo } from "../valoo";
import { RadioBar } from "./RadioBar";
import { Theme } from "../store/types";
import { useCallback } from "preact/hooks";

export function createModalState() {
	const active = valoo<string>("");

	return {
		active,
		open: (modal: string) => (active.$ = modal),
		close: () => (active.$ = ""),
	};
}

export interface Props {
	onClose: () => void;
	children: ComponentChildren;
}
export function Modal(props: Props) {
	return (
		<div class={s.modal}>
			<div class={s.closeBtn}>
				<IconBtn onClick={props.onClose}>
					<Close />
				</IconBtn>
			</div>
			{props.children}
		</div>
	);
}

export interface SettingsModalProps {
	onClose: () => void;
}

export function SettingsModal(props: SettingsModalProps) {
	const store = useStore();
	const theme = useObserver(() => store.theme.$);

	const setTheme = useCallback((v: Theme) => (store.theme.$ = v), []);

	return (
		<div>
			<Modal onClose={props.onClose}>
				<form>
					<p>Theme:</p>
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
				</form>
			</Modal>
		</div>
	);
}

export interface BackdropProps {
	active: boolean;
	onClick: () => void;
}

export function ModalBackdrop(props: BackdropProps) {
	return (
		<div
			class={`${s.backdrop} ${props.active ? s.backdropActive : ""}`}
			onClick={props.onClick}
		/>
	);
}

export function ModalRenderer() {
	const store = useStore();
	const active = useObserver(() => store.modal.active.$);
	return (
		<Fragment>
			{active === "settings" && <SettingsModal onClose={store.modal.close} />}
			<ModalBackdrop active={active !== ""} onClick={store.modal.close} />
		</Fragment>
	);
}
