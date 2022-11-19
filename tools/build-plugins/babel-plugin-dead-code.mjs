export function babelPluginDeadCode({ types: t }) {
	return {
		visitor: {
			IfStatement: {
				exit(path) {
					if (
						(t.isBooleanLiteral(path.node.test) &&
							path.node.test.value === false) ||
						(t.isBlockStatement(path.node.consequent) &&
							path.node.consequent.body.length === 0)
					) {
						path.remove();
					}
				},
			},
		},
	};
}
