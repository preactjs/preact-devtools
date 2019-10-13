import { ObjPath } from "../../view/components/sidebar/ElementProps";

export function inject(codeOrSrc: string, mode: "script" | "code" = "code") {
	const s = document.createElement("script");
	// This runs before `<head>` is available
	const target = document.head || document.documentElement;
	if (mode === "code") s.textContent = codeOrSrc;
	else s.src = codeOrSrc;
	target.appendChild(s);
	s.remove();
}

export function injectStyles(href: string) {
	const s = document.createElement("link");
	s.rel = "stylesheet";
	s.href = href;
	document.head.appendChild(s);
}

/**
 * Deeply mutate a property by walking down an array of property keys
 */
export function setIn(obj: Record<string, any>, path: ObjPath, value: any) {
	let last = path.pop();
	let parent = path.reduce((acc, attr) => (acc ? acc[attr] : null), obj);
	if (parent && last) {
		parent[last] = value;
	}
}

export function debounce<T extends any[]>(
	callback: (...args: T) => void,
	wait: number,
) {
	let timeout: any = null;
	return (...args: T) => {
		const next = () => callback(...args);
		clearTimeout(timeout);
		timeout = setTimeout(next, wait);
	};
}
