import { Plugin } from "babel-plugin-helpers";
import { type PluginObject } from "@babel/core"

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

	const version = options?.version;
	if (version === undefined) {
		throw new Error("Missing version option to preact version plugin")
	}

	return {
		name: "preact-rewrite-import",
		visitor: {
			ImportDeclaration(path) {
				const source = path.node.source.value;
				if (toRewrite.has(source)) {
					const clone = t.cloneNode(path.node, true);
					clone.source = t.stringLiteral(
						source.replace("preact", `preact@${version}`),
					);
					path.replaceWith(clone);
				} else if (source === "@preact/signals") {
					const clone = t.cloneNode(path.node, true);
					clone.source = t.stringLiteral(
						source.replace(
							"@preact/signals",
							`@preact/signals@${version}`,
						),
					);
					path.replaceWith(clone);
				}
			},
		},
	} as PluginObject;
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
						// Parse the import string as source directly. Using
						// `template.ast`${n}`` would create a placeholder
						// whose substitution must be an AST node, not raw
						// code — which Babel 8 rejects.
						const ast = template.ast(n);
						if (Array.isArray(ast)) {
							for (let i = ast.length - 1; i >= 0; i--) {
								path.unshiftContainer("body", ast[i]);
							}
						} else {
							path.unshiftContainer("body", ast);
						}
					});
				},
			},
		},
	};
};
