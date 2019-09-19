import { h, ComponentChildren, Fragment } from "preact";
import { useState } from "preact/hooks";
import s from "./Modal.css";
import { useStore, useObserver } from "../store";
import { IconBtn } from "./IconBtn";
import { Close } from "./icons";
import { valoo } from "../valoo";

export function createModalState() {
	const active = valoo<string>("");

	return {
		active,
		open: (modal: string) => active(modal),
		close: () => active(""),
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
	const filters = useObserver(() => store.filter.filters(), [
		store.filter.filters,
	]);

	return (
		<div>
			<Modal onClose={props.onClose}>
				<form>
					<p>Hide components where...</p>
					{filters.length === 0 && (
						<p class={s.empty}>No filters have been added.</p>
					)}
					{filters.map(f => {
						return (
							<FilterRow
								type={f.type}
								value={f.value}
								enabled={f.enabled}
								setType={v => store.filter.setType(f, v as any)}
								setValue={v => store.filter.setValue(f, v)}
								setEnabled={v => store.filter.setEnabled(f, v)}
								onRemove={() => store.filter.remove(f)}
							/>
						);
					})}
					<button class={s.addFilter} type="button" onClick={store.filter.add}>
						Add filter
					</button>
				</form>
			</Modal>
		</div>
	);
}

export interface FilterRowProps {
	type: string;
	value: string;
	enabled: boolean;
	setValue(value: string): void;
	setType(value: string): void;
	setEnabled(value: boolean): void;
	onRemove(): void;
}

export function FilterRow({
	type,
	value,
	enabled,
	setType,
	setValue,
	setEnabled,
	onRemove,
}: FilterRowProps) {
	return (
		<div class={s.filterRow}>
			<input
				type="checkbox"
				class={s.check}
				checked={enabled}
				onInput={e => setEnabled((e.target as any).checked)}
			/>
			<select
				name="type"
				value={type}
				onInput={e => setType((e.target as any).value)}
			>
				<option value="type">Type</option>
				<option value="name">Name</option>
			</select>
			<span class={s.operator}>{type === "type" ? "equals" : "matches"}</span>
			<div class={s.valueWrapper}>
				{type === "type" && (
					<select
						name="filtertype"
						value={value}
						onInput={e => setValue((e.target as any).value)}
					>
						<option value="dom">DOM</option>
						<option value="fragment">Fragment</option>
					</select>
				)}
				{type === "name" && (
					<input
						type="text"
						value={value}
						onInput={e => setValue((e.target as any).value)}
						class={s.regInput}
						placeholder="Regular Expression"
					/>
				)}
			</div>
			<div class={s.filterRemove}>
				<IconBtn onClick={onRemove}>
					<Close />
				</IconBtn>
			</div>
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
	const active = useObserver(() => store.modal.active(), [store.modal.active]);
	return (
		<Fragment>
			{active === "settings" && <SettingsModal onClose={store.modal.close} />}
			<ModalBackdrop active={active !== ""} onClick={store.modal.close} />
		</Fragment>
	);
}
