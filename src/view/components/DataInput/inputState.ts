import { valoo, watch, Observable } from "../../valoo";
import { parseValue, genPreview } from "./parseValue";

export function createInputStore(value: Observable<any>) {
	// Local state
	const focus = valoo<boolean>(false);
	/**
	 * We copy the input value into a local variable when the user enters
	 * an invalid value. This is done so that view stays consistent. The
	 * invalid value will be dropped when the component unmounts.
	 */
	const local = valoo<any>(undefined);

	// Derived state
	const valid = watch(() => {
		try {
			parseValue(local.$ !== undefined ? local.$ : value.$);
			return true;
		} catch (err) {
			return false;
		}
	});

	const actualValue = watch(() => {
		if (local.$ === undefined) {
			return genPreview(value.$);
		}
		if (valid.$ && !focus.$) {
			return genPreview(parseValue(local.$));
		}

		return local.$;
	});

	const valueType = watch(() => {
		const v = value.$;
		let type: string = typeof v;
		if (v === null) {
			type = "null";
		} else if (type === "object") {
			if (Array.isArray(v)) {
				type = "array";
			} else if (
				Object.keys(v).length === 2 &&
				v.name != null &&
				v.type != null
			) {
				return v.type;
			}
		}
		return type;
	});

	const asCheckbox = watch(() => valueType.$ === "boolean");
	const showReset = watch(() => {
		if (local.$ !== undefined) {
			try {
				return local.$ !== value.$;
			} catch (err) {
				return true;
			}
		}
		return false;
	});

	// Event handlers
	const onInput = (raw: string) => {
		local.$ = raw;
	};

	const onConfirm = () => {
		if (valid.$) {
			value.$ = parseValue(local.$);
		}
	};

	const onFocus = () => {
		focus.$ = true;
		local.$ = value.$;
	};

	const onBlur = () => {
		focus.$ = false;
		local.$ = undefined;
	};

	const onReset = () => {
		local.$ = value.$;
	};

	// Only for number field
	const onIncrement = () => {
		try {
			const parsed = parseValue(local.$);
			if (typeof parsed === "number") {
				local.$ = String(parsed + 1);
			}
			// eslint-disable-next-line no-empty
		} catch (err) {}
	};

	// Only for number field
	const onDecrement = () => {
		try {
			const parsed = parseValue(local.$);
			if (typeof parsed === "number") {
				local.$ = String(parsed - 1);
			}
			// eslint-disable-next-line no-empty
		} catch (err) {}
	};

	const onClear = () => {
		local.$ = undefined;
	};

	return {
		onConfirm,
		onFocus,
		onBlur,
		onIncrement,
		onDecrement,
		onReset,
		onClear,
		onInput,
		asCheckbox,
		showReset,
		actualValue,
		focus,
		valid,
		valueType,
	};
}
