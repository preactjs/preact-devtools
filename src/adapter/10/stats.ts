import { DevNodeType } from "../../view/store/types";
import { VNode } from "preact";
import { RendererConfig10, getDevtoolsType } from "./renderer";
import { DiffType, Stats } from "../shared/stats";

export function getDiffType(child: VNode, prev: DiffType) {
	if (prev !== DiffType.MIXED) {
		if (child.key != null) {
			return prev === DiffType.UNKNOWN || prev === DiffType.KEYED
				? DiffType.KEYED
				: DiffType.MIXED;
		} else {
			return prev === DiffType.UNKNOWN || prev === DiffType.UNKEYED
				? DiffType.UNKEYED
				: DiffType.MIXED;
		}
	}
	return prev;
}

export function recordComponentStats(
	config: RendererConfig10,
	stats: Stats,
	vnode: VNode,
	children: Array<VNode | null | undefined>,
) {
	const childrenLen = children.length;
	const type = vnode.type;
	if (typeof type === "function") {
		if (type.prototype && type.prototype.render) {
			stats.classComponents.total++;
			stats.classComponents.children.push(childrenLen);
		} else {
			if (type === config.Fragment) {
				stats.fragments.total++;
				stats.fragments.children.push(childrenLen);
			}

			stats.functionComponents.total++;
			stats.functionComponents.children.push(childrenLen);
		}
	} else if (type !== null) {
		stats.elements.total++;
		stats.elements.children.push(childrenLen);
	} else {
		stats.text++;
	}

	const devType = getDevtoolsType(vnode);
	switch (devType) {
		case DevNodeType.ForwardRef:
			stats.forwardRef.total++;
			stats.forwardRef.children.push(childrenLen);
			break;
		case DevNodeType.Memo:
			stats.memo.total++;
			stats.memo.children.push(childrenLen);
			break;
		case DevNodeType.Suspense:
			stats.suspense.total++;
			stats.suspense.children.push(childrenLen);
			break;
	}

	if (childrenLen === 1) {
		const child = children[0];
		if (child != null) {
			if (typeof child.type === "function") {
				if (child.type.prototype && child.type.prototype.render) {
					stats.singleChildType.classComponents++;
				} else {
					if (child.type === config.Fragment) {
						stats.singleChildType.fragments++;
					} else {
						const childType = getDevtoolsType(child);
						switch (childType) {
							case DevNodeType.ForwardRef:
								stats.singleChildType.forwardRef++;
								break;
							case DevNodeType.Memo:
								stats.singleChildType.memo++;
								break;
							case DevNodeType.Suspense:
								stats.singleChildType.suspense++;
								break;
						}
					}
					stats.singleChildType.functionComponents++;
				}
			} else if (child.type !== null) {
				stats.singleChildType.elements++;
			} else {
				stats.singleChildType.text++;
			}
		}
	}
}
