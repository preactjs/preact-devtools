export function babelPluginCssModules({ types: t }) {
	return {
		visitor: {
			ImportDeclaration(path) {
				if (!t.isStringLiteral(path.node.source)) return;
				const source = path.node.source.value;
				if (!/\.module\.css$/.test(source)) return;
				const specifier = path.node.specifiers[0];
				if (!t.isImportDefaultSpecifier(specifier)) return;

				const name = specifier.local.name;

				path.replaceWith(t.importDeclaration([], t.StringLiteral(source)));
				path.insertAfter(
					t.ImportDeclaration(
						[t.importNamespaceSpecifier(t.identifier(name))],
						t.StringLiteral(source.replace(".module.", ".module-virtual.")),
					),
				);
			},
		},
	};
}
