import { h, Fragment } from "preact";
import { IconTab } from "../components/Tabs/Tabs";
import { SortIcon, FireIcon } from "../../icons";
import { useStore, useObserver } from "../../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { FlamegraphType } from "../data/commits";

export function FlameGraphMode() {
	const store = useStore();
	const type = useObserver(() => store.profiler.flamegraphType.$);
	const disabled = useObserver(() => !store.profiler.isSupported.$);

	const onClick = useCallback((value: string) => {
		store.profiler.flamegraphType.$ = value as any;
	}, []);

	return (
		<Fragment>
			<IconTab
				name="flamegraph_mode"
				icon={<FireIcon />}
				value={FlamegraphType.FLAMEGRAPH}
				checked={type === FlamegraphType.FLAMEGRAPH}
				onClick={onClick}
				disabled={disabled}
			>
				Flamegraph
			</IconTab>
			<IconTab
				name="flamegraph_mode"
				icon={<SortIcon />}
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
