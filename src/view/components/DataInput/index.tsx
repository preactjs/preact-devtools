import { h } from "preact";
import s from "./DataInput.css";
import { useCallback, useRef, useMemo, useState } from "preact/hooks";
import { Undo } from "../icons";
import { parseValue } from "./parseValue";

export interface InputProps {
	name: string;
	value: any;
	class?: string;
	placeholder?: string;
	showReset?: boolean;
	onChange: (value: any) => void;
	onCommit: (value: any) => void;
	onReset: (value: any) => void;
}

export function DataInput({
	value,
	onChange,
	name,
	onCommit,
	onReset,
	showReset,
	...props
}: InputProps) {
	const valid = useMemo(() => {
		try {
			parseValue(value);
			return true;
		} catch (err) {
			return false;
		}
	}, [value]);

	const type = useMemo(() => {
		try {
			const parsed = parseValue(value);
			if (parsed === null) return "null";
			else if (Array.isArray(parsed)) return "array";
			return typeof parsed;
		} catch (err) {
			return "undefined";
		}
	}, [value]);

	const ref = useRef<HTMLInputElement>();

	useMemo(() => {
		if (ref.current) {
			ref.current.setCustomValidity(valid ? "" : "Invalid input value");
		}
	}, [ref.current, valid]);

	const onKeyUp = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Enter") {
				onCommit(value);
			} else {
				const parsed = parseValue(value);
				if (typeof parsed === "number") {
					if (e.key === "ArrowUp") {
						onChange(String(parsed + 1));
					} else if (e.key === "ArrowDown") {
						onChange(String(parsed - 1));
					}
				}
			}
		},
		[onChange, value, onCommit],
	);

	const onInput = useCallback(
		(e: Event) => {
			onChange((e.target as any).value);
		},
		[onChange],
	);

	const onCheckboxChange = useCallback(
		(e: Event) => {
			onChange((e.target as any).checked);
		},
		[onChange],
	);

	return (
		<div class={s.valueWrapper}>
			{typeof value === "boolean" && !focus && (
				<input
					class={s.check}
					type="checkbox"
					checked={value}
					onInput={onCheckboxChange}
				/>
			)}
			<div
				class={`${s.innerWrapper} ${
					typeof value === "boolean" ? s.withCheck : ""
				}`}
			>
				<input
					type="text"
					ref={ref}
					class={`${s.valueInput} ${props.class || ""} ${focus ? s.focus : ""}`}
					value={value === undefined ? "" : value}
					onKeyUp={onKeyUp}
					onInput={onInput}
					placeholder={props.placeholder}
					data-type={type}
					name={name}
				/>
				<button
					class={`${s.undoBtn} ${showReset ? s.showUndoBtn : ""}`}
					type="button"
					onClick={onReset}
				>
					<Undo size="s" />
				</button>
			</div>
		</div>
	);
}
