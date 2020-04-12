import { VNode } from "preact";
import {
	getComponent,
	getComponentHooks,
	getStatefulHooks,
	getDisplayName,
	getStatefulHookValue,
} from "../vnode";
import { RendererConfig10 } from "../renderer";

export const enum RenderReason {
	MOUNT = "mount",
	PARENT_UPDATE = "parent_update",
	PROPS_CHANGED = "props_changed",
	STATE_CHANGED = "state_changed",
	HOOKS_CHANGED = "hooks_changed",
}

export interface RenderReasonData {
	type: RenderReason;
	items: string[] | null;
}

function createReason(
	type: RenderReason,
	items: null | string[],
): RenderReasonData {
	return { type, items };
}

/**
 * Get all keys that have differnt values in two objects. Does a
 * shallow comparison.
 */
export function getChangedKeys(
	a: Record<string, any>,
	b: Record<string, any>,
): string[] {
	const changed: string[] = [];
	let key;
	for (key in a) {
		if (!(key in b) || a[key] !== b[key]) {
			changed.push(key);
		}
	}
	for (key in b) {
		if (!(key in a)) {
			changed.push(key);
		}
	}

	return changed;
}

/**
 * Detect why a VNode updated.
 */
export function getRenderReason(
	old: VNode | null,
	next: VNode | null,
	config: RendererConfig10,
): RenderReasonData | null {
	if (old === null) {
		return next !== null ? createReason(RenderReason.MOUNT, null) : null;
	} else if (old === next || next === null) {
		return null;
	}
	// Components
	else if (typeof old.type === "function" && old.type === next.type) {
		const oldComponent = getComponent(old);
		const nextComponent = getComponent(next);
		if (oldComponent !== null && nextComponent !== null) {
			// Check state
			if (oldComponent.state !== nextComponent.state) {
				return createReason(
					RenderReason.STATE_CHANGED,
					getChangedKeys(oldComponent.state, nextComponent.state),
				);
			}

			// Check hooks
			const oldHooks = getComponentHooks(oldComponent);
			const nextHooks = getComponentHooks(nextComponent);
			if (oldHooks !== null && nextHooks !== null) {
				const oldStates = getStatefulHooks(oldHooks);
				const nextStates = getStatefulHooks(nextHooks);

				if (oldStates.length === nextStates.length) {
					for (let i = 0; i < oldStates.length; i++) {
						if (
							getStatefulHookValue(oldStates[i]) !==
							getStatefulHookValue(nextStates[i])
						) {
							return createReason(RenderReason.HOOKS_CHANGED, null);
						}
					}
				} else {
					// TODO: Move this to debug
					console.error(
						"Number of hooks changed for: " + getDisplayName(next, config),
					);
				}
			}
		}
	}

	// Check props
	if (old.props !== next.props) {
		return createReason(
			RenderReason.PROPS_CHANGED,
			getChangedKeys(old.props, next.props),
		);
	}

	return createReason(RenderReason.PARENT_UPDATE, null);
}
