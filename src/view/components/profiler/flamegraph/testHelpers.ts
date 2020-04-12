import { ID, DevNodeType, Tree } from "../../../store/types";
import { ProfilerNode, CommitData } from "../data/commits";
import { sortTimeline } from "./FlamegraphStore";

/**
 * Parse a visual flamegraph DSL into a `ProfilerNode` tree. Each
 * character represents a timing of 10ms, including the component
 * names.
 *
 * Usage example:
 *
 * ```js
 * flames`
 *   App **************
 *    Foo ****  Bar **
 *     Bob **
 * `
 * ```
 */
export function flames(
	literals: TemplateStringsArray,
	...placeholders: string[]
) {
	let res =
		placeholders.reduce((acc, x, i) => acc + x + literals[i], "") +
		literals[literals.length - 1];

	// Delete first newline if any
	res = res.replace(/^(\r\n|\r|\n)/, "");

	// Treat spaces of the first line as indentation
	const match = res.match(/^(\s+)/);
	const indent = match ? match[0].length : 0;

	const lines = res
		.split(/(\r\n|\r|\n)/)
		.map(line => line.slice(indent))
		.filter(Boolean);

	const nodes: ProfilerNode[] = [];
	const nameMap = new Map<string, ProfilerNode>();

	let id = 1;

	let lastSiblingsNodes: ProfilerNode[] = [];

	// Iterate backwards, so that all children are known
	for (let i = lines.length - 1; i >= 0; i--) {
		const line = lines[i];
		const siblings = line.match(/\s+\w+\s\*+/g) || [line];

		const lineNodes: ProfilerNode[] = [];

		// Iterate backwards to ensure correct ordering
		for (let j = siblings.length - 1; j >= 0; j--) {
			const sib = siblings[j];
			const match = sib.match(/^(\s+)/);

			const indent = match ? match[0].length : 0;
			let startTime = indent;

			// Add previous sibling lengths
			for (let k = 0; k < j; k++) {
				startTime += siblings[k].length;
			}

			const nameMatch = sib.match(/(\w+)/);
			const name = nameMatch ? nameMatch[0] : "Unknown";

			const duration = sib.length - indent;

			const node: ProfilerNode = {
				depth: i,
				key: "",
				parent: 0,
				type:
					name[0].toUpperCase() === name[0]
						? DevNodeType.FunctionComponent
						: DevNodeType.Element,
				startTime,
				endTime: startTime + duration,
				treeStartTime: startTime,
				treeEndTime: startTime + duration,
				duration,
				selfDuration: duration,
				children: [],
				id: id++,
				name,
			};

			lastSiblingsNodes.forEach(child => {
				if (
					node.startTime <= child.startTime &&
					node.endTime > child.startTime
				) {
					node.children.push(child.id);
				}
			});

			nodes.push(node);
			lineNodes.push(node);

			// Throw if name is not unique and was already used
			if (nameMap.has(node.name)) {
				throw new Error(
					`Node names must be unique. Found duplicate "${node.name}."`,
				);
			}

			nameMap.set(node.name, node);
		}

		lastSiblingsNodes = lineNodes.reverse();
	}

	nodes.sort(sortTimeline);

	// Rebuild ids based on sort order
	const ids = new Map<number, number>();
	nodes.forEach((node, i) => ids.set(node.id, i + 1));

	const idMap = new Map<ID, ProfilerNode>();
	nodes.forEach(node => {
		node.id = ids.get(node.id)!;
		node.children = node.children.map(childId => ids.get(childId)!);
		idMap.set(node.id, node);
	});

	// Add self durations (basically: duration - child durations)
	nodes.forEach(node => {
		const childDurations = node.children.reduce((acc, id) => {
			return acc + idMap.get(id)!.duration;
		}, 0);

		if (childDurations > node.duration) {
			throw new Error(
				`Child durations was longer than of parent "${node.name}"`,
			);
		}

		node.selfDuration = node.duration - childDurations;

		// Update parent pointer
		node.children.forEach(childId => (idMap.get(childId)!.parent = node.id));
	});

	// Convert units to 10ms
	nodes.forEach(node => {
		node.startTime = node.startTime * 10;
		node.endTime = node.endTime * 10;
		node.treeStartTime = node.treeStartTime * 10;
		node.treeEndTime = node.treeEndTime * 10;
		node.duration = node.duration * 10;
		node.selfDuration = node.selfDuration * 10;
	});

	// Create commit out of tree
	const commit: CommitData = {
		rootId: 1,
		commitRootId: 1,
		duration: nodes.length > 0 ? nodes[0].duration : 0,
		maxDepth: Math.max(0, ...nodes.map(x => x.depth)),
		maxSelfDuration: Math.max(0, ...nodes.map(x => x.selfDuration)),
		nodes: idMap,
	};

	return {
		commit,
		idMap,
		nodes,
		byName: (name: string) => nameMap.get(name),
		byId: (id: ID) => idMap.get(id),
	};
}

export function byName(tree: Tree, name: string) {
	return Array.from(tree.values()).find(x => x.name === name);
}
