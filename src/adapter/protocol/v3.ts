export const OPERATION_PROTOCOL_V3 = 3;

export const enum OperationV3Header {
	ProtocolVersion = 0,
	RendererId = 1,
	Epoch = 2,
	CommitSeq = 3,
	BaseTreeVersion = 4,
	NextTreeVersion = 5,
	RootId = 6,
	StringTableLength = 7,
	PayloadStart = 8,
}

export interface OperationV3Meta {
	rendererId: number;
	epoch: number;
	commitSeq: number;
	baseTreeVersion: number;
	nextTreeVersion: number;
}

export interface OperationV3Envelope {
	protocolVersion: number;
	rendererId: number;
	epoch: number;
	commitSeq: number;
	baseTreeVersion: number;
	nextTreeVersion: number;
	rootId: number;
	data: number[];
}

export interface OperationV3State {
	epoch: number;
	commitSeq: number;
	treeVersion: number;
}

export type OperationV3Validation =
	| { ok: true }
	| { ok: false; reason: "protocol" | "epoch" | "sequence" | "version" };

export function readOperationV3(data: number[]): OperationV3Envelope {
	return {
		protocolVersion: data[OperationV3Header.ProtocolVersion],
		rendererId: data[OperationV3Header.RendererId],
		epoch: data[OperationV3Header.Epoch],
		commitSeq: data[OperationV3Header.CommitSeq],
		baseTreeVersion: data[OperationV3Header.BaseTreeVersion],
		nextTreeVersion: data[OperationV3Header.NextTreeVersion],
		rootId: data[OperationV3Header.RootId],
		data,
	};
}

export function wrapOperationV3(meta: OperationV3Meta, payload: number[]) {
	return [
		OPERATION_PROTOCOL_V3,
		meta.rendererId,
		meta.epoch,
		meta.commitSeq,
		meta.baseTreeVersion,
		meta.nextTreeVersion,
		payload[0],
		payload[1],
		...payload,
	];
}

export function wrapEmptySnapshotV3(meta: OperationV3Meta) {
	return [
		OPERATION_PROTOCOL_V3,
		meta.rendererId,
		meta.epoch,
		meta.commitSeq,
		meta.baseTreeVersion,
		meta.nextTreeVersion,
		-1,
		0,
	];
}

export function validateOperationV3(
	state: OperationV3State | null,
	envelope: OperationV3Envelope,
): OperationV3Validation {
	if (envelope.protocolVersion !== OPERATION_PROTOCOL_V3) {
		return { ok: false, reason: "protocol" };
	}

	if (state === null) {
		return envelope.baseTreeVersion === 0
			? { ok: true }
			: { ok: false, reason: "version" };
	}

	if (envelope.epoch !== state.epoch) {
		return { ok: false, reason: "epoch" };
	}

	if (envelope.commitSeq !== state.commitSeq + 1) {
		return { ok: false, reason: "sequence" };
	}

	if (envelope.baseTreeVersion !== state.treeVersion) {
		return { ok: false, reason: "version" };
	}

	return { ok: true };
}

export function nextOperationV3State(
	envelope: OperationV3Envelope,
): OperationV3State {
	return {
		epoch: envelope.epoch,
		commitSeq: envelope.commitSeq,
		treeVersion: envelope.nextTreeVersion,
	};
}
