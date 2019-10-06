import { h, ComponentChildren, Fragment } from "preact";
import s from "./Modal.css";
import { useStore, useObserver } from "../store/react-bindings";
import { IconBtn } from "./IconBtn";
import { Close } from "./icons";
import { valoo } from "../valoo";

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
	const filters = useObserver(() => store.filter.filters.$);

	return (
		<div>
			<Modal
				onClose={() => {
					// store.filter.submit();
					props.onClose();
				}}
			>
				<form>
					<p>Hide components where...</p>
					{filters.length === 0 && (
						<p class={s.empty}>No filters have been added.</p>
					)}
					<table>
						<tbody></tbody>
					</table>
					<button class={s.addFilter} type="button" onClick={store.filter.add}>
						Add filter
					</button>
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
