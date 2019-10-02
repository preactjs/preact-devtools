import { h, ComponentChildren, Fragment } from "preact";

export type Size = keyof typeof sizes;

const sizes: Record<string, string> = {
	xs: ".8rem",
	s: "1rem",
	m: "2rem",
	l: "4rem",
};

export interface Props {
	size?: Size;
}

export function createSvgIcon(size: Size, children: ComponentChildren) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			style={`width: ${sizes[size]}; height: ${sizes[size]}`}
		>
			{children}
		</svg>
	);
}

export function Undo({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
			fill="currentColor"
		/>,
	);
}

export function Eye({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
			fill="currentColor"
		/>,
	);
}

export function AddCircle({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
			fill="currentColor"
		/>,
	);
}

export function SettingsIcon({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M19.14 12.936c.036-.3.06-.612.06-.936s-.024-.636-.072-.936l2.028-1.584a.496.496 0 0 0 .12-.612l-1.92-3.324c-.12-.216-.372-.288-.588-.216l-2.388.96a7.03 7.03 0 0 0-1.62-.936l-.36-2.544a.479.479 0 0 0-.48-.408h-3.84a.467.467 0 0 0-.468.408l-.36 2.544a7.219 7.219 0 0 0-1.62.936l-2.388-.96a.475.475 0 0 0-.588.216l-1.92 3.324a.465.465 0 0 0 .12.612l2.028 1.584c-.048.3-.084.624-.084.936s.024.636.072.936L2.844 14.52a.496.496 0 0 0-.12.612l1.92 3.324c.12.216.372.288.588.216l2.388-.96a7.03 7.03 0 0 0 1.62.936l.36 2.544c.048.24.24.408.48.408h3.84c.24 0 .444-.168.468-.408l.36-2.544a7.219 7.219 0 0 0 1.62-.936l2.388.96c.216.084.468 0 .588-.216l1.92-3.324a.465.465 0 0 0-.12-.612l-2.004-1.584zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
			fill="currentColor"
		/>,
	);
}

export function BugIcon({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M20 8h-2.81a5.985 5.985 0 0 0-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"
			fill="currentColor"
		/>,
	);
}

export function Remove({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"
			fill="currentColor"
		/>,
	);
}

export function Refresh({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
			fill="currentColor"
		/>,
	);
}

export function Picker() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 4.233 4.233"
		>
			<g stroke="currentColor">
				<path
					d="M3.969 3.292V.794a.528.528 0 0 0-.53-.53H.795a.528.528 0 0 0-.53.53V3.44c0 .293.237.529.53.529h2.532"
					opacity=".893"
					fill="none"
					stroke-linejoin="round"
					stroke-dashoffset="8.791"
					stroke-width=".26458"
				/>
				<path
					d="M1.323 1.323l.873 2.037L3.36 2.196z"
					stroke-width=".291"
					stroke-linecap="round"
					stroke-linejoin="round"
					fill="currentColor"
				/>
				<path d="M2.87 2.87L3.93 3.93" fill="none" stroke-width=".265" />
			</g>
		</svg>
	);
}

export function KeyboardDown({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
			fill="currentColor"
		/>,
	);
}

export function KeyboardUp({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"
			fill="currentColor"
		/>,
	);
}

export function Close({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
			fill="currentColor"
		/>,
	);
}

export function Search({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
			fill="currentColor"
		/>,
	);
}

export function CheckboxChecked({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<path
			d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
			fill="currentColor"
		/>,
	);
}

export function CheckboxUnChecked({ size = "s" }: Props) {
	return createSvgIcon(
		size,
		<Fragment>
			<path
				d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
				fill="currentColor"
			/>
			<path d="M0 0h24v24H0z" fill="none" />
		</Fragment>,
	);
}
