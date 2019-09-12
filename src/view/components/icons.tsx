import { h } from "preact";

export type Size = "s" | "m" | "l";

const sizes: Record<Size, string> = {
	s: "1rem",
	m: "2rem",
	l: "4rem",
};

export interface Props {
	size?: Size;
}

export function Undo({ size = "s" }: Props) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			style={`width: ${sizes[size]}; height: ${sizes[size]}`}
		>
			<path
				d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function SettingsIcon({ size = "s" }: Props) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			style={`width: ${sizes[size]}; height: ${sizes[size]}`}
		>
			<path fill="none" d="M0 0h24v24H0V0z" />
			<path
				d="M19.14 12.936c.036-.3.06-.612.06-.936s-.024-.636-.072-.936l2.028-1.584a.496.496 0 0 0 .12-.612l-1.92-3.324c-.12-.216-.372-.288-.588-.216l-2.388.96a7.03 7.03 0 0 0-1.62-.936l-.36-2.544a.479.479 0 0 0-.48-.408h-3.84a.467.467 0 0 0-.468.408l-.36 2.544a7.219 7.219 0 0 0-1.62.936l-2.388-.96a.475.475 0 0 0-.588.216l-1.92 3.324a.465.465 0 0 0 .12.612l2.028 1.584c-.048.3-.084.624-.084.936s.024.636.072.936L2.844 14.52a.496.496 0 0 0-.12.612l1.92 3.324c.12.216.372.288.588.216l2.388-.96a7.03 7.03 0 0 0 1.62.936l.36 2.544c.048.24.24.408.48.408h3.84c.24 0 .444-.168.468-.408l.36-2.544a7.219 7.219 0 0 0 1.62-.936l2.388.96c.216.084.468 0 .588-.216l1.92-3.324a.465.465 0 0 0-.12-.612l-2.004-1.584zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function BugIcon({ size = "s" }: Props) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			style={`width: ${sizes[size]}; height: ${sizes[size]}`}
		>
			<path
				d="M20 8h-2.81a5.985 5.985 0 0 0-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"
				fill="currentColor"
			/>
		</svg>
	);
}
