import { valoo, watch, Observable } from "../../valoo";
import { parseValue, displayCollection, valueToHuman } from "./parseValue";

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
			if (local.$ !== undefined) {
				parseValue(local.$);
			} else {
				valueToHuman(value.$);
			}
			return true;
		} catch (err) {
			return false;
		}
	});

	const actualValue = watch(() => {
		return local.$ === undefined ? displayCollection(value.$) : local.$;
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
				return local.$ !== valueToHuman(value.$);
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
		local.$ = valueToHuman(value.$);
	};

	const onBlur = () => {
		focus.$ = false;
	};

	const onReset = () => {
		try {
			const parsed = valueToHuman(value.$);
			local.$ = parsed;
		} catch (err) {}
	};

	// Only for number field
	const onIncrement = () => {
		try {
			const parsed = parseValue(local.$);
			if (typeof parsed === "number") {
				local.$ = String(parsed + 1);
			}
		} catch (err) {}
	};

	// Only for number field
	const onDecrement = () => {
		try {
			const parsed = parseValue(local.$);
			if (typeof parsed === "number") {
				local.$ = String(parsed - 1);
			}
		} catch (err) {}
	};

	return {
		onConfirm,
		onFocus,
		onBlur,
		onIncrement,
		onDecrement,
		onReset,
		onInput,
		asCheckbox,
		showReset,
		actualValue,
		focus,
		valid,
		valueType,
	};
}
