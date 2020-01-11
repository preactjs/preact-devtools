import { h, ComponentChild } from "preact";
import s from "./Tabs.css";
import { useCallback } from "preact/hooks";

export interface TabProps {
	children: ComponentChild;
	value: string;
	name: string;
	checked: boolean;
	onClick: (v: string) => void;
}

export function SmallTab(props: TabProps) {
	const onClick = useCallback(() => {
		props.onClick(props.value);
	}, [props]);

	return (
		<label class={s.root}>
			<input
				class={s.input}
				type="radio"
				name={props.name}
				value={props.value}
				checked={props.checked}
				onClick={onClick}
			/>
			<span class={s.label}>{props.children}</span>
		</label>
	);
}

export function SmallTabGroup(props: {
	children: ComponentChild;
	class?: string;
}) {
	return <div class={`${s.group} ${props.class || ""}`}>{props.children}</div>;
}

export interface IconTabProps extends TabProps {
	icon: ComponentChild;
}

export function IconTab(props: IconTabProps) {
	const onClick = useCallback(() => {
		props.onClick(props.value);
	}, [props]);

	return (
		<label class={s.iconRoot}>
			<input
				class={s.input}
				type="radio"
				name={props.name}
				value={props.value}
				checked={props.checked}
				onClick={onClick}
			/>
			<span class={s.iconInner}>
				{props.icon}
				<span class={s.iconLabel}>{props.children}</span>
			</span>
		</label>
	);
}
