import { h } from "preact";
import { useRef } from "preact/hooks";
import { useStore } from "../../store/react-bindings";
import { useVirtualizedList } from "../elements/VirtualizedList";
import s from "./RenderTracker.module.css";

export function RenderTrackerTable() {
	const store = useStore();
	const ref = useRef<HTMLTableSectionElement>(null);

	console.log(store.profiler.renderTracked.value);

	const { children, containerHeight } = useVirtualizedList<any>({
		minBufferCount: 10,
		rowHeight: 16,
		container: ref,
		items: [],
		renderRow: (row, _, top) => {
			return <div key={row.id}>{id}</div>;
		},
	});

	return (
		<div class={s.stretch}>
			<div class={s.stretchInner}>
				<table class={s.table}>
					<tbody ref={ref} style={`height: ${containerHeight}px`}>
						{children}
						<tr>
							<td class={s.timeWrapper}>
								<span class={s.time}>0.2ms</span>
							</td>
							<td class={s.timeWrapper}>
								<span class={s.time}>0.2ms</span>
							</td>
							<td>Foo</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
