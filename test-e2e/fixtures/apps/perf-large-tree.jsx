import { Fragment, h, render } from "preact";
import { useMemo, useState } from "preact/hooks";

const SIZES = [1000, 5000, 10000, 25000, 50000];
const BRANCHING = 8;

function buildChildren(count) {
	const children = Array.from({ length: count }, () => []);
	for (let id = 1; id < count; id++) {
		children[Math.floor((id - 1) / BRANCHING)].push(id);
	}
	return children;
}

function LargeTreeNode({ id, childrenById, tick }) {
	const children = childrenById[id];
	return (
		<Fragment>
			{id === 0 && (
				<span data-testid="perf-root-marker">root {tick % 1000}</span>
			)}
			{children.map(childId => (
				<LargeTreeNode
					key={childId}
					id={childId}
					childrenById={childrenById}
					tick={tick}
				/>
			))}
		</Fragment>
	);
}

function App() {
	const [size, setSize] = useState(1000);
	const [tick, setTick] = useState(0);

	const childrenById = useMemo(() => buildChildren(size), [size]);

	return (
		<div class="perf-fixture">
			<header class="perf-controls">
				<strong>Large tree fixture</strong>
				<div>
					{SIZES.map(value => (
						<button
							key={value}
							type="button"
							data-testid={`perf-size-${value}`}
							data-active={size === value}
							onClick={() => setSize(value)}
						>
							{value.toLocaleString()}
						</button>
					))}
					<button
						type="button"
						data-testid="perf-update"
						onClick={() => setTick(tick + 1)}
					>
						Update
					</button>
				</div>
				<output data-testid="perf-status">
					{size.toLocaleString()} nodes, update {tick}
				</output>
			</header>
			<LargeTreeNode id={0} childrenById={childrenById} tick={tick} />
		</div>
	);
}

render(<App />, document.getElementById("app"));
