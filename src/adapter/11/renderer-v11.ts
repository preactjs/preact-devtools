import { ID } from "../../view/store/types";
import { ReconcilerHost } from "../reconciler";
import { Internal } from "./shapes-v11";

const internalToId = new WeakMap<Internal, ID>();

const reconciler: ReconcilerHost<Internal> = {
	createId(internal) {
		internalToId.set(internal, -1); // FIXME
		return -1; // FIXME
	},
	hasId(internal) {
		return internalToId.has(internal);
	},
	getId(internal) {
		return internalToId.get(internal) || -1;
	},
	removeId(internal) {
		internalToId.delete(internal);
	},
	updateId(internal) {},

	getChildren(internal) {
		return internal._children;
	},
	getStartTime(internal) {
		return 0; // FIXME
	},
	getEndTime(internal) {
		return 0; // FIXME
	},
	shouldFilter(internal, filters) {
		return false;
	},

	getKey(internal) {
		return internal.key || null;
	},
};
