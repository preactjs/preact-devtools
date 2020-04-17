import { h, Fragment } from "preact";
import { useObserver, useStore } from "../../store/react-bindings";
import { PropsPanel } from "./inspect/PropsPanel";
import { serializeProps } from "./inspect/serializeProps";

export function Sidebar() {
	const store = useStore();
	const inspect = useObserver(() => store.inspectData.$);
	const { props: propData, state, context } = store.sidebar;
	const { emit } = store;

	return (
		<Fragment>
			<PropsPanel
				label="Props"
				items={propData.items}
				uncollapsed={propData.uncollapsed}
				onChange={(value, path) =>
					emit("update-prop", { id: inspect!.id, path, value })
				}
				onCopy={() => inspect && emit("copy", serializeProps(inspect.props))}
				canAddNew
			/>
			{inspect && inspect.state !== null && (
				<PropsPanel
					label="State"
					items={state.items}
					uncollapsed={state.uncollapsed}
					onChange={(value, path) =>
						emit("update-state", { id: inspect!.id, path, value })
					}
					onCopy={() => inspect && emit("copy", serializeProps(inspect.state))}
				/>
			)}
			{inspect && inspect.context !== null && (
				<PropsPanel
					label="Context"
					items={context.items}
					uncollapsed={context.uncollapsed}
					onChange={(value, path) =>
						emit("update-context", { id: inspect!.id, path, value })
					}
					onCopy={() =>
						inspect && emit("copy", serializeProps(inspect.context))
					}
				/>
			)}
		</Fragment>
	);
}
