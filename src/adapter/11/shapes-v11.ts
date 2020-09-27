export interface VNode {
	type: null | string | any;
	props: Props | string;
	key: string | number | null;
	/** @private */
	id: number;
	/** @private */
	constructor: undefined;
	// The next two are inject by babel's development flag.
	// They are only used for devtools
	__source?: string;
	__self?: string;
}

export enum InternalFlags {
	TEXT_NODE = 1,
	ELEMENT_NODE = 1 << 1,
	CLASS_NODE = 1 << 2,
	FUNCTION_NODE = 1 << 3,
	FRAGMENT_NODE = 1 << 4,

	COMPONENT_NODE = CLASS_NODE | FUNCTION_NODE | FRAGMENT_NODE,
}

export type Children = VNode | VNode[] | Children[] | null;

export interface Props {
	[key: string]: any;
	children?: Children | null;
}

export enum RenderMode {}

export interface Component<P = Props, S = any, C = any> {
	props: P;
	state: S;
	render(props: P, state: S, context: C): Children;

	/** @private */
	_internal: Internal;
	/** @private */
	_renderer: {
		render(internal: Internal, vnode: VNode, mode: RenderMode): void;
	};
}

export interface Internal {
	type: string | any;
	/** The props object for Elements/Components, and the string contents for Text */
	props: Props | string;

	key: any;
	ref: any;

	_children: Internal[];
	_parentInternal: Internal;
	_next: Internal;
	/** A mapping of children internal nodes keyed by keys */
	// _keyedChildren: Map<string, number[]>;

	/** most recent vnode ID */
	_vnodeId: number;

	/** associated DOM element for the VNode or its nearest realized descendant */
	_dom: Element | Text | Node;
	/** DOM parentNode */
	_parent: Node;
	/** the next DOM sibling Node */
	_sibling: Node;
	/** When hydrating, this is an Array of Nodes to hydrate */
	// _hydrateCandidates: (Element | Text)[];

	/** an associated component instance */
	_component: Component;
	/** The origin type of the associated component */
	_flags: InternalFlags;
	_currentOffset: number;
}

export interface OptionsV11 {
	_commit(internal: Internal): void;
}
