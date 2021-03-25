import { Plugin } from "babel-plugin-helpers";

export const rewriteImportPlugin: Plugin<{ version: string }> = (
	{ types: t },
	options,
) => {
	const toRewrite = new Set([
		"preact",
		"preact/hooks",
		"preact/compat",
		"preact/debug",
		"preact/devtools",
	]);
	return {
		name: "preact-rewrite-import",
		visitor: {
			ImportDeclaration(path) {
				const source = path.node.source.value;
				if (toRewrite.has(source)) {
					const clone = t.cloneNode(path.node, true);
					clone.source = t.stringLiteral(
						source.replace("preact", `preact@${options.version}`),
					);
					path.replaceWith(clone);
				}
			},
		},
	};
};

export const addImport: Plugin<{ imports: string[] }> = (
	{ template },
	options,
) => {
	return {
		name: "add-import",
		visitor: {
			Program: {
				exit(path) {
					options.imports.forEach(n => {
						path.unshiftContainer("body", template.ast`${n}`);
					});
				},
			},
		},
	};
};
