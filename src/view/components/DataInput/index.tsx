import { h } from "preact";
import s from "./DataInput.css";
import { useCallback, useRef, useState, useMemo } from "preact/hooks";
import { Undo } from "../icons";
import {
	parseValue,
	isStringifiedVNode,
	displayCollection,
	valueToHuman,
} from "./parseValue";
import { focusNext } from "../../../adapter/dom";

export interface InputProps {
	value: any;
	initialValue: any;
	class?: string;
	onChange: (value: any) => void;
}

export function DataInput({
	value,
	onChange,
	initialValue,
	...props
}: InputProps) {
	const hasCheck = typeof value === "boolean";
	const initial = valueToHuman(initialValue);
	const [focus, setFocus] = useState(false);
	const [v, set] = useState(initial);
	const [valid, setValid] = useState(true);
	const ref = useRef<HTMLInputElement>();
	const lastValue = useRef<any>(undefined);

	if (ref.current) {
		ref.current.setCustomValidity(valid ? "" : "Invalid input");
	}

	const onCommit = useCallback((value: any) => {
		try {
			const parsed = typeof value === "string" ? parseValue(value) : value;
			onChange(parsed);
			setValid(true);
		} catch (err) {
			setValid(false);
		}
	}, []);

	let inputVal = useMemo(() => {
		if (value !== lastValue.current) {
			lastValue.current = value;
			return "" + valueToHuman(value);
		}
		return "" + v;
	}, [v, value]);

	if (!focus) {
		inputVal = displayCollection(value);
	}

	let type: string = typeof value;
	if (value === null) type = "null";
	else if (type === "object" && Array.isArray(value)) type = "array";
	else if (isStringifiedVNode(initial)) {
		type = "vnode";
	} else if (initial.endsWith("()")) {
		type = "function";
	}

	const onKeyDown = useCallback(
		(e: KeyboardEvent) => {
			try {
				if (e.key === "Enter" && !e.shiftKey) {
					focusNext(e.target as any);
					e.preventDefault();
				} else {
					if (typeof parseValue(v) === "number") {
						let next;
						switch (e.key) {
							case "ArrowUp":
								next = "" + (+v + 1);
								break;
							case "ArrowDown":
								next = "" + (+v - 1);
								break;
						}

						if (next !== undefined) {
							set(next);
							onCommit(next);
						}
					}
				}
			} catch (e) {}
		},
		[type, v],
	);

	return (
		<div class={s.valueWrapper}>
			{hasCheck && !focus && (
				<input
					class={s.check}
					type="checkbox"
					checked={v === "true"}
					onInput={e => {
						const value = "" + (e.target as any).checked;
						set(value);
						onCommit(value);
					}}
				/>
			)}
			<div class={`${s.innerWrapper} ${hasCheck ? s.withCheck : ""}`}>
				<input
					type="text"
					ref={ref}
					class={`${s.valueInput} ${props.class || ""} ${focus ? s.focus : ""}`}
					value={inputVal}
					onFocus={() => setFocus(true)}
					onBlur={() => setFocus(false)}
					onKeyDown={onKeyDown}
					onInput={e => {
						const next = (e.target as any).value;
						set(next);
						onCommit(next);
					}}
					data-type={type}
				/>
				<button
					class={`${s.undoBtn} ${v !== initial ? s.showUndoBtn : ""}`}
					type="button"
					onClick={() => {
						setFocus(true);
						if (ref.current) ref.current.focus();
						set(initial);
						onChange(initial);
					}}
				>
					<Undo size="s" />
				</button>
			</div>
		</div>
	);
}

export function getEventValue(ev: any) {
	return ev.currentTarget!.checked || ev.currentTarget.value;
}
