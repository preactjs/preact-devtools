// @ts-ignore
import { h, ComponentChildren, Fragment } from "./vendor/preact-10";
// @ts-ignore
import { createPortal } from "./vendor/preact-10/compat";
// @ts-ignore
import { useRef, useEffect, useState, useMemo } from "./vendor/preact-10/hooks";
import { html } from "./vendor/htm";

export interface Props {
	children: ComponentChildren;
	width?: number;
	height?: number;
	class?: string;
}

export function Iframer({ children, ...rest }: Props) {
	const ref = useRef<HTMLIFrameElement | null>(null);
	const [styles, updateStyles] = useState<string[]>([]);
	useEffect(() => {
		const css = Array.from(document.head.querySelectorAll("style")).map(
			sheet => sheet.textContent!,
		);

		updateStyles(css);
	}, [ref.current]);

	const container = ref.current ? ref.current!.contentDocument!.body : null;
	if (container) {
		container.style.overflow = "hidden";
		container.style.background = "none";
	}

	return useMemo(() => {
		return html`
			<iframe ref=${ref} ...${rest}>
				${container &&
					createPortal(
						html`
							<${Fragment}>
								${styles.map(
									(sheet: any) =>
										html`
											<style>
												${sheet}
											</style>
										`,
								)}
								${children as any}
							<//>
						`,
						container,
					)}
			</iframe>
		`;
	}, [styles]);
}
