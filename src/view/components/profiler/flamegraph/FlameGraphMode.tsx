import { Fragment, h } from "preact";
import { IconTab } from "../components/Tabs/Tabs.tsx";
import { useStore } from "../../../store/react-bindings.ts";
import { useCallback } from "preact/hooks";
import {
	FlamegraphType,
	getCommitInitalSelectNodeId,
} from "../data/commits.ts";
import { Icon } from "../../icons.tsx";

export function FlameGraphMode() {
	const store = useStore();
	const type = store.profiler.flamegraphType.value;
	const disabled = !store.profiler.isSupported.value;

	const onClick = useCallback((value: string) => {
		const profiler = store.profiler;
		profiler.flamegraphType.value = value as any;
		profiler.selectedNodeId.value = profiler.activeCommit.value
			? getCommitInitalSelectNodeId(
				profiler.activeCommit.value,
				profiler.flamegraphType.value,
			)
			: -1;
	}, []);

	return (
		<Fragment>
			<IconTab
				name="flamegraph_mode"
				icon={<Icon icon="fire-icon" />}
				value={FlamegraphType.FLAMEGRAPH}
				checked={type === FlamegraphType.FLAMEGRAPH}
				onClick={onClick}
				disabled={disabled}
			>
				Flamegraph
			</IconTab>
			<IconTab
				name="flamegraph_mode"
				icon={<Icon icon="sort-icon" />}
				value={FlamegraphType.RANKED}
				checked={type === FlamegraphType.RANKED}
				onClick={onClick}
				disabled={disabled}
			>
				Ranked
			</IconTab>
		</Fragment>
	);
}
