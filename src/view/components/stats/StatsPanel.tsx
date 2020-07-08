import { h } from "preact";
import { useObserver, useStore } from "../../store/react-bindings";
import s from "./StatsPanel.css";
import { SingleLayout } from "../SidebarLayout";
import { ParsedStats } from "../../../adapter/10/stats";

function parseChildrenMap(data: Map<number, number>): Children {
	const children: Children = [0, 0, 0, 0, 0];

	data.forEach((v, k) => {
		if (k >= 4) k = 4;
		children[k] += v;
	});

	return children;
}

export function StatsPanel() {
	const store = useStore();
	const stats = useObserver(() => store.stats.$);

	return (
		<SingleLayout>
			<div class={s.root}>
				<div class={s.intro}>
					<p>Combined statistics of currently active trees.</p>
				</div>
				{stats !== null ? <StatsData stats={stats} /> : <p>No stats</p>}
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
	count: Children;
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
				{props.total > 0 ? count[0] : "-"}
			</td>
			<td class={s.alignRight} data-testid={testId + "-1"}>
				{props.total > 0 ? count[1] : "-"}
			</td>
			<td class={s.alignRight} data-testid={testId + "-2"}>
				{props.total > 0 ? count[2] : "-"}
			</td>
			<td class={s.alignRight} data-testid={testId + "-3"}>
				{props.total > 0 ? count[3] : "-"}
			</td>
			<td class={s.alignRight} data-testid={testId + "-n"}>
				{props.total > 0 ? count[4] : "-"}
			</td>
		</tr>
	);
}

export function StatsData({ stats }: { stats: ParsedStats }) {
	console.log("stats", stats);
	return (
		<div class={s.cards}>
			<div class={s.card}>
				<h2 class={s.heading}>VNode Type</h2>

				<table class={s.table} data-testid="vnode-stats">
					<thead>
						<ChildHeadings />
					</thead>
					<tbody>
						<tr>
							<td>Root</td>
							<td class={s.alignRight} data-testid="root-count">
								{stats.roots}
							</td>
						</tr>
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
							label="Element"
							testId="element"
							total={stats.elements.total}
							count={parseChildrenMap(stats.elements.children)}
						/>

						<ChildRow
							label="Text"
							testId="text"
							total={stats.text}
							count={[0, 0, 0, 0, 0]}
						/>
					</tbody>
				</table>
			</div>

			<div class={s.card}>
				<h2 class={s.heading}>Diff Type</h2>

				<table class={s.table} data-testid="diff-type">
					<thead>
						<ChildHeadings />
					</thead>
					<tbody>
						<ChildRow
							label="keyed"
							total={stats.keyedTotal}
							count={parseChildrenMap(stats.keyed)}
						/>
						<ChildRow
							label="unkeyed"
							total={stats.unkeyedTotal}
							count={parseChildrenMap(stats.unkeyed)}
						/>
						<ChildRow
							label="mixed"
							total={stats.mixedTotal}
							count={parseChildrenMap(stats.mixed)}
						/>
					</tbody>
				</table>
			</div>

			<div class={s.card}>
				<h2 class={s.heading}>Operation Type</h2>

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
		</div>
	);
}
