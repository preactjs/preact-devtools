import { RenderReasonMap } from "../../../../adapter/shared/renderReasons";
import { DevNodeType, ID } from "../../../store/types";

export interface ProfilerNodeShared {
	id: ID;
	name: string;
	hocs: string[] | null;
	type: DevNodeType;
}

export type ProfilerNode = {
	id: ID;
	parent: ID;
	children: ID[];
};

export interface ProfilerCommit {
	start: number;
	selfDurations: Map<ID, number>;
	/**
	 * Time a vnode took to render including its children
	 */
	renderedDurations: Map<ID, number>;
	rendered: Set<ID>;
	reasons: RenderReasonMap;
	firstId: ID;
	rootId: ID;
	nodes: Map<ID, ProfilerNode>;
}
