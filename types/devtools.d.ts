declare module "preact-devtools" {
	import { Options } from "preact";

	export function attach(
		options: Options,
		createRenderer: (hook: any) => any,
	): {
		store: any;
		destroy: () => void;
	};

	export function renderDevtools(
		store: any,
		container: Element | Document | ShadowRoot | DocumentFragment,
	): void;
}

declare module "preact-devtools/dist/preact-devtools.css" {}
