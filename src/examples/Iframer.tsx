import { h, ComponentChildren, Fragment } from "preact";
import { createPortal } from "preact/compat";
import { useRef, useEffect, useState, useMemo } from "preact/hooks";

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
		return (
			<iframe ref={ref} {...rest}>
				{container &&
					createPortal(
						<Fragment>
							{styles.map(sheet => (
								<style>{sheet}</style>
							))}
							{children as any}
						</Fragment>,
						container,
					)}
			</iframe>
		);
	}, [styles]);
}
