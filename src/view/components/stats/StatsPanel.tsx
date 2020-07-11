import { h, Fragment } from "preact";
import { useObserver, useStore } from "../../store/react-bindings";
import s from "./StatsPanel.css";
import s2 from "../profiler/components/ProfilerInfo/ProfilerInfo.css";
import { SingleLayout } from "../SidebarLayout";
import { ParsedStats } from "../../../adapter/10/stats";
import { Actions } from "../Actions";
import { IconBtn } from "../IconBtn";
import { RecordIcon, Refresh, NotInterested } from "../icons";
import { useCallback } from "preact/hooks";

function parseChildrenMap(data: Map<number, number>): Children {
	const children: Children = [0, 0, 0, 0, 0];

	data.forEach((v, k) => {
		if (k >= 4) k = 4;
		children[k] += v;
	});

	return children;
}

export function StatsRecordBtn() {
	const store = useStore();
	const isRecording = useObserver(() => store.stats.isRecording.$);

	const onClick = useCallback(() => {
		const { isRecording } = store.stats;
		const v = !isRecording.$;
		isRecording.$ = v;

		if (v) {
			store.emit("start-stats-recording", null);
		} else {
			store.emit("stop-stats-recording", null);
		}
	}, [store]);

	return (
		<IconBtn
			title={!isRecording ? "Start Recording" : "Stop Recording"}
			color={
				isRecording ? "var(--color-record-active)" : "var(--color-selected-bg)"
			}
			onClick={onClick}
			testId="record-btn"
		>
			<RecordIcon size="s" />
		</IconBtn>
	);
}

export function StatsPanel() {
	const store = useStore();
	const stats = useObserver(() => store.stats.data.$);
	const isRecording = useObserver(() => store.stats.isRecording.$);
	const onReloadAndRecordStats = useCallback(() => {
		store.stats.isRecording.$ = true;
		store.emit("reload-and-record-stats", null);
	}, []);
	const onReset = useCallback(() => {
		store.stats.data.$ = null;
		store.stats.isRecording.$ = false;
	}, [store]);

	return (
		<SingleLayout>
			<div class={s.actions}>
				<Actions>
					<div class={s.btnWrapper}>
						<StatsRecordBtn />
					</div>
					<div class={s.btnWrapper}>
						<IconBtn
							title="Reload and profile"
							disabled={isRecording}
							testId="reload-and-record-stats-btn"
							onClick={onReloadAndRecordStats}
						>
							<Refresh size="s" />
						</IconBtn>
					</div>
					<div class={s.btnWrapper}>
						<IconBtn
							title="Clear profiling data"
							disabled={stats === null || isRecording}
							onClick={onReset}
						>
							<NotInterested size="s" />
						</IconBtn>
					</div>
				</Actions>
			</div>
			<div class={s.content}>
				{stats !== null ? (
					<StatsData stats={stats} />
				) : (
					<div class={s2.root} data-testid="stats-info">
						<p class={s2.title}>No statistic data collected</p>
						<p class={s2.descr}>
							Click the record button{" "}
							<span class={s2.inlineBtn}>
								<StatsRecordBtn />
							</span>{" "}
							to start recording.
						</p>
					</div>
				)}
			</div>
		</SingleLayout>
	);
}

export type Children = [number, number, number, number, number];

export function ChildHeadings() {
	return (
		<tr>
			<th>Type</th>
			<th>Total</th>
			<th>0 Ch.</th>
			<th>1 Ch.</th>
			<th>2 Ch.</th>
			<th>3 Ch.</th>
			<th>n Ch.</th>
		</tr>
	);
}

export function ChildRow(props: {
	label: string;
	total: number;
	count?: Children;
	testId?: string;
}) {
	const { label, total, count, testId = "unknown" } = props;
	return (
		<tr>
			<td>{label}</td>
			<td class={s.alignRight} data-testid={testId + "-total"}>
				{total}
			</td>
			<td class={s.alignRight} data-testid={testId + "-0"}>
				{count ? count[0] : "-"}
			</td>
			<td class={s.alignRight} data-testid={testId + "-1"}>
				{count ? count[1] : "-"}
			</td>
			<td class={s.alignRight} data-testid={testId + "-2"}>
				{count ? count[2] : "-"}
			</td>
			<td class={s.alignRight} data-testid={testId + "-3"}>
				{count ? count[3] : "-"}
			</td>
			<td class={s.alignRight} data-testid={testId + "-n"}>
				{count ? count[4] : "-"}
			</td>
		</tr>
	);
}

export function StatsData({ stats }: { stats: ParsedStats }) {
	return (
		<Fragment>
			<div class={s.intro}>
				<p>
					Help us make Preact even faster by sharing these statistics over at{" "}
					<a href="#" rel="noopener noreferrrer">
						this GitHub thread
					</a>
					.
				</p>
			</div>
			<div class={s.cards}>
				<div class={s.card}>
					<h2 class={s.heading}>Operations</h2>

					<table class={s.table} data-testid="operation-type">
						<thead>
							<tr>
								<th>Type</th>
								<th>Total</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>mount</td>
								<td class={s.alignRight}>{stats.mounts}</td>
							</tr>
							<tr>
								<td>update</td>
								<td class={s.alignRight}>{stats.updates}</td>
							</tr>
							<tr>
								<td>unmount</td>
								<td class={s.alignRight}>{stats.unmounts}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class={s.card}>
					<h2 class={s.heading}>Reconciler</h2>

					<table class={s.table} data-testid="diff-type">
						<thead>
							<ChildHeadings />
						</thead>
						<tbody>
							<ChildRow
								label="keyed"
								total={stats.keyed.total}
								count={parseChildrenMap(stats.keyed.children)}
							/>
							<ChildRow
								label="unkeyed"
								total={stats.unkeyed.total}
								count={parseChildrenMap(stats.unkeyed.children)}
							/>
							<ChildRow
								label="mixed"
								total={stats.mixed.total}
								count={parseChildrenMap(stats.mixed.children)}
							/>
						</tbody>
					</table>
				</div>

				<div class={s.card}>
					<h2 class={s.heading}>Render Frequency</h2>

					<table class={s.table} data-testid="vnode-stats">
						<thead>
							<ChildHeadings />
						</thead>
						<tbody>
							<ChildRow
								label="Root"
								testId="root"
								total={stats.roots.total}
								count={parseChildrenMap(stats.roots.children)}
							/>
							<ChildRow
								label="Class Component"
								testId="class-component"
								total={stats.classComponents.total}
								count={parseChildrenMap(stats.classComponents.children)}
							/>
							<ChildRow
								label="Function Component"
								testId="function-component"
								total={stats.functionComponents.total}
								count={parseChildrenMap(stats.functionComponents.children)}
							/>
							<ChildRow
								label="Fragment"
								testId="fragment"
								total={stats.fragments.total}
								count={parseChildrenMap(stats.fragments.children)}
							/>
							<ChildRow
								label="forwardRef"
								testId="forwardref"
								total={stats.forwardRef.total}
								count={parseChildrenMap(stats.forwardRef.children)}
							/>
							<ChildRow
								label="Memo"
								testId="memo"
								total={stats.memo.total}
								count={parseChildrenMap(stats.memo.children)}
							/>
							<ChildRow
								label="Suspense"
								testId="suspense"
								total={stats.suspense.total}
								count={parseChildrenMap(stats.suspense.children)}
							/>
							<ChildRow
								label="Element"
								testId="element"
								total={stats.elements.total}
								count={parseChildrenMap(stats.elements.children)}
							/>

							<ChildRow label="Text" testId="text" total={stats.text} />
						</tbody>
					</table>
				</div>

				<div class={s.card}>
					<h2 class={s.heading}>Single Child Type</h2>

					<table class={s.table} data-testid="sing-child-type">
						<thead>
							<tr>
								<th>Type</th>
								<th>Total</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Root</td>
								<td>{stats.singleChildType.roots}</td>
							</tr>
							<tr>
								<td>Class Component</td>
								<td>{stats.singleChildType.classComponents}</td>
							</tr>
							<tr>
								<td>Function Component</td>
								<td>{stats.singleChildType.functionComponents}</td>
							</tr>
							<tr>
								<td>Fragment Component</td>
								<td>{stats.singleChildType.fragments}</td>
							</tr>
							<tr>
								<td>forwardRef</td>
								<td>{stats.singleChildType.forwardRef}</td>
							</tr>
							<tr>
								<td>Memo</td>
								<td>{stats.singleChildType.memo}</td>
							</tr>
							<tr>
								<td>Suspense</td>
								<td>{stats.singleChildType.suspense}</td>
							</tr>
							<tr>
								<td>Element</td>
								<td>{stats.singleChildType.elements}</td>
							</tr>
							<tr>
								<td>Text</td>
								<td>{stats.singleChildType.text}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</Fragment>
	);
}
