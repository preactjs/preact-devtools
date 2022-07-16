export const css = (s: TemplateStringsArray) => s[0];

export class PreactElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}
}
