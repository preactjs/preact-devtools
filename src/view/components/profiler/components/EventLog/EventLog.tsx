import { h, ComponentChildren, Fragment } from "preact";
import { useCallback } from "preact/hooks";
import { useObserver, useStore } from "../../../../store/react-bindings";
import { ID } from "../../../../store/types";
import { SidebarPanel } from "../../../sidebar/SidebarPanel";
import { CommitData } from "../../data/commits";
import { formatTime } from "../../util";
import { getReasonName } from "../RenderReasons";
import s from "./EventLog.module.css";

export function EventLog() {
	const store = useStore();

	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const selectedId = useObserver(() => store.profiler.selectedNodeId.$);
	const activeCommitIdx = useObserver(() => store.profiler.activeCommitIdx.$);
	const reasons = useObserver(() => store.profiler.renderReasons.$);
	const commits = useObserver(() => store.profiler.commits.$);
	const data = useObserver(() => {
		const selectedId = store.profiler.selectedNodeId.$;
		return store.profiler.commits.$.reduce<
			{ index: number; commit: CommitData }[]
		>((acc, commit, i) => {
			if (commit.rendered.has(selectedId)) {
				acc.push({
					index: i,
					commit,
				});
			}
			return acc;
		}, []);
	});

	const onCommitChange = useCallback(
		(n: number) => {
			const { activeCommitIdx, selectedNodeId, activeCommit } = store.profiler;

			activeCommitIdx.$ = n;

			if (activeCommit.$ && !activeCommit.$.nodes.has(selectedNodeId.$)) {
				selectedNodeId.$ = activeCommit.$.rootId;
			}
		},
		[store],
	);

	const onSelect = useCallback(
		(id: number) => {
			store.profiler.selectedNodeId.$ = id;
			store.selection.selectById(id);
		},
		[store],
	);

	if (isRecording || commits.length === 0 || data.length === 0) {
		return null;
	}

	console.log(data);

	return (
		<SidebarPanel title="Event Log">
			<EventTimeline>
				{data.map(item => {
					const { duration, commitRootId, rendered, nodes } = item.commit;
					const didRender = rendered.has(selectedId);
					if (!didRender) return null;

					const reasonMap = reasons.get(commitRootId);
					const rootReason = reasonMap ? reasonMap.get(commitRootId) : null;
					const selectedReason = reasonMap ? reasonMap.get(selectedId) : null;

					return (
						<>
							<EventTimelineItem
								key={item.index}
								kind="primary"
								onClick={() => onCommitChange(item.index)}
								selected={activeCommitIdx === item.index}
								title={
									<>
										Commit #{item.index + 1} <Timing value={duration} />
									</>
								}
							/>
							<EventTimelineItem
								kind="secondary"
								onClick={() => onSelect(commitRootId)}
							>
								<ComponentName name={nodes.get(commitRootId)!.name} />{" "}
								{rootReason ? getReasonName(rootReason.type) : ""}
							</EventTimelineItem>
							{commitRootId !== selectedId && (
								<EventTimelineItem
									kind="secondary"
									onClick={() => onSelect(selectedId)}
								>
									<ComponentName name={nodes.get(selectedId)!.name} />{" "}
									{selectedReason ? getReasonName(selectedReason.type) : ""}
								</EventTimelineItem>
							)}
						</>
					);
				})}
			</EventTimeline>
		</SidebarPanel>
	);
}

export function EventTimeline({ children }: { children?: ComponentChildren }) {
	return <ul class={s.eventTimeline}>{children}</ul>;
}

export interface EventTimelineItemProps {
	kind: "primary" | "secondary" | "empty";
	children?: ComponentChildren;
	title?: ComponentChildren;
	onClick?: () => void;
	selected?: boolean;
}

export function EventTimelineItem({
	kind,
	children,
	selected,
	title,
	onClick,
}: EventTimelineItemProps) {
	return (
		<li class={s.eventListItem}>
			<button
				type="button"
				class={s.eventItem}
				onClick={onClick}
				data-kind={kind}
				data-selected={selected}
			>
				<span class={s.content}>
					{title && <span class={s.title}>{title}</span>}
					{children}
				</span>
			</button>
		</li>
	);
}

export function ComponentName({ name }: { name: string }) {
	return <span class={s.componentName}>{name}</span>;
}

export function Timing({ value }: { value: number }) {
	return <span class={s.timing}>{formatTime(value)}</span>;
}
