import { h, Fragment } from "preact";
import s from "./ComponentName.css";

export function ComponentName(props: { children: any }) {
	return (
		<span class={s.title}>
			{props.children ? (
				<Fragment>
					<span class={s.nameCh}>&lt;</span>
					{props.children}
					<span class={s.nameCh}>&gt;</span>
				</Fragment>
			) : (
				"-"
			)}
		</span>
	);
}
