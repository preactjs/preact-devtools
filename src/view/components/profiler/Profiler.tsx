import { h } from "preact";
import { Store } from "../../store/types";
import { CommitTimeline } from "./CommitTimeline";

export interface Props {
	store: Store;
}

export function Profiler(props: Props) {
	return (
		<div>
			<h1>Profiler</h1>
			<CommitTimeline items={[20, 80, 10, 10]} />
		</div>
	);
}
