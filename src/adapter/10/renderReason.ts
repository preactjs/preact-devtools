import { ID } from "../../view/store/types";
import { PreactBindings, SharedVNode } from "../shared/bindings";
import { getVNodeId, IdMappingState } from "../shared/idMapper";
import {
	createReason,
	getChangedKeys,
	RenderReason,
	RenderReasonData,
} from "../shared/renderReasons";

/**
 * Detect why a VNode updated.
 */
export function getRenderReasonPost<T extends SharedVNode>(
	ids: IdMappingState<T>,
	bindings: PreactBindings,
	selfDurations: Map<ID, number>,
	old: T | null,
	next: T | null,
): RenderReasonData | null {
	if (old === null) {
		return next !== null ? createReason(RenderReason.MOUNT, null) : null;
	} else if (next === null) {
		return null;
	}
	// Components
	else if (typeof old.type === "function" && old.type === next.type) {
		const c = bindings.getComponent(next);
		if (c !== null) {
			// Check hooks
			const hooks = bindings.getStatefulHooks(next);

			if (hooks !== null) {
				for (let i = 0; i < hooks.length; i++) {
					if (
						bindings.isUseReducerOrState(hooks[i]) &&
						hooks[i]._oldValue !== bindings.getStatefulHookValue(hooks[i])
					) {
						return createReason(RenderReason.HOOKS_CHANGED, null);
					}
				}
			}

			// Check state
			const prevState = (c as any)._prevState;
			if (prevState != null && prevState !== c.state) {
				return createReason(
					RenderReason.STATE_CHANGED,
					getChangedKeys(prevState, c.state),
				);
			} else if (
				prevState === undefined &&
				c.state !== undefined &&
				Object.keys(c.state).length > 0
			) {
				return createReason(RenderReason.STATE_CHANGED, null);
			}
		}
	}

	// Check props
	if (old.props !== next.props) {
		const propsChanged = getChangedKeys(old.props, next.props);
		if (propsChanged.length > 0) {
			return createReason(RenderReason.PROPS_CHANGED, propsChanged);
		}
	}

	const parent = bindings.getVNodeParent(next) as T;
	if (parent != null) {
		const nextId = getVNodeId(ids, next);
		if (parent != null && selfDurations.has(nextId)) {
			return createReason(RenderReason.PARENT_UPDATE, null);
		}
	}

	return createReason(RenderReason.FORCE_UPDATE, null);
}
