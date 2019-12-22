import { h, Fragment } from "preact";
import { IconTab } from "./Tabs";
import { SortIcon, FireIcon } from "../icons";
import { DisplayType } from "./data/ProfilerStore";
import { useStore, useObserver } from "../../store/react-bindings";
import { useCallback } from "preact/hooks";

export function FlameGraphMode() {
	const store = useStore();
	const type = useObserver(() => store.profiler.displayType.$);

	const onClick = useCallback((value: string) => {
		store.profiler.displayType.$ = value as any;
	}, []);

	return (
		<Fragment>
			<IconTab
				name="flamegraph_mode"
				icon={<FireIcon />}
				value={DisplayType.FLAMEGRAPH}
				checked={type === DisplayType.FLAMEGRAPH}
				onClick={onClick}
			>
				Flamegraph
			</IconTab>
			<IconTab
				name="flamegraph_mode"
				icon={<SortIcon />}
				value={DisplayType.RANKED}
				checked={type === DisplayType.RANKED}
				onClick={onClick}
			>
				Ranked
			</IconTab>
		</Fragment>
	);
}
