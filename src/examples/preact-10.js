import { h, render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { ElementProps } from "../view/components/sidebar/ElementProps";
import { Sidebar } from "../view/components/sidebar/Sidebar";
import d from "../view/components/Devtools.css";
import { IconBtn } from "../view/components/IconBtn";
import { Picker } from "../view/components/icons";
import { TreeBar } from "../view/components/TreeBar";
import { ModalBackdrop, SettingsModal } from "../view/components/Modals";
import { createStore } from "../view/store";
import { AppCtx, useObserver } from "../view/store/react-bindings";
import { applyOperations } from "../adapter/events";
import { fromSnapshot } from "../adapter/debug";
import { TreeView } from "../view/components/TreeView";
import { RadioBar } from "../view/components/RadioBar";
import { TodoList } from "./TodoList";
import { treeStore } from "./treeStore";
import { createPropsStore } from "../view/store/props";
import { Iframes } from "./Iframes";
import { LegacyContext } from "./legacyContext";
import { Stateful } from "./state";
import { DeepTree, ShallowTree } from "./DeepTree";

function Headline(props) {
	return <h3>{props.title}</h3>;
}

const tstore = treeStore();

const pStore = createPropsStore(tstore.inspectData, data => data.props, d => d);

export function StyleGuide() {
	const [showModal, setShowModal] = useState(
		!!localStorage.getItem("show-modal"),
	);

	const propList = useObserver(() =>
		pStore.list.$.map(x => pStore.tree.$.get(x)),
	);
	const pInitial = useObserver(() => pStore.initialTree.$);
	const pCollapsed = useObserver(() => pStore.collapser.collapsed.$);

	const [store] = useState(createStore());

	useEffect(() => {
		store.theme.$ = localStorage.getItem("theme");
	}, []);

	const theme = useObserver(() => store.theme.$);

	return (
		<div class={theme === "auto" ? "dark" : theme}>
			<div style="padding: 5rem" class={d.theme}>
				<div style="display: flex; flex-direction: column;">
					<h2>Todo List</h2>
					<TodoList />
					<h2>Styleguide</h2>

					<h3>RadioBar</h3>
					<RadioBar
						name="foo"
						value={theme}
						onChange={v => {
							store.theme.$ = v;
							localStorage.setItem("theme", v);
						}}
						items={[
							{ label: "Auto", value: "auto" },
							{ label: "Light", value: "light" },
							{ label: "Dark", value: "dark" },
						]}
					/>
					<h3>Legacy Context</h3>
					<LegacyContext />
					<h3>State</h3>
					<Stateful />

					<h3>Sidebar</h3>
					{/* <AppCtx.Provider value={tstore}>
						<Sidebar />
					</AppCtx.Provider> */}
					<h3>ElementProps</h3>
					{/* <p>non-editable</p>
					<ElementProps
						editable={false}
						items={propList}
						collapsed={pCollapsed}
						onCollapse={pStore.collapser.toggle}
						initial={pInitial}
					/>
					<p>editable</p>
					<div style="width: 20rem; outline: 1px solid red">
						<ElementProps
							editable
							items={propList}
							collapsed={pCollapsed}
							onCollapse={pStore.collapser.toggle}
							initial={pInitial}
						/>
					</div> */}
					<h2>Icon Btns</h2>
					{/* <IconBtn onClick={() => console.log("click")}>
						<Picker />
					</IconBtn>
					<IconBtn active>
						<Picker />
					</IconBtn>
					<h2>Modals</h2>
					<button
						onClick={() => {
							const next = !showModal;
							setShowModal(next);
							localStorage.setItem("show-modal", next + "");
						}}
					>
						show modal
					</button>
					<AppCtx.Provider value={store}>
						{showModal && (
							<SettingsModal
								onClose={() => {
									setShowModal(false);
									localStorage.removeItem("show-modal");
								}}
							/>
						)}
					</AppCtx.Provider>
					<ModalBackdrop
						active={showModal}
						onClick={() => {
							setShowModal(false);
							localStorage.removeItem("show-modal");
						}}
					/>
					<Headline title="foobar" /> */}
					<h2>TreeBar</h2>
					<div style="border: 1px solid #555">
						{/* <AppCtx.Provider value={tstore}>
							<TreeBar />
						</AppCtx.Provider> */}
					</div>
					<h2>TreeView</h2>
					<button
						onClick={() => {
							const event2 = fromSnapshot(["rootId: 1", "Remove 4"]);
							applyOperations(tstore, event2);
						}}
					>
						remove
					</button>
					<br />
					<div>
						<div style="height: 20rem; overflow: auto;">
							{/* <AppCtx.Provider value={tstore}>
								<TreeView />
							</AppCtx.Provider> */}
						</div>
					</div>
					<br />
					<br />
					<div>
						<div style="height: overflow: auto;">
							{/* <AppCtx.Provider value={tstore}>
								<TreeView />
							</AppCtx.Provider> */}
						</div>
					</div>
					<p>Empty tree view</p>
					{/* <AppCtx.Provider value={store}>
						<TreeView />
					</AppCtx.Provider> */}
					<h3>ShallowTree</h3>
					<ShallowTree />
					<h3>Deeply nested</h3>
					{/* <DeepTree /> */}
					{/* <Iframes /> */}
				</div>
			</div>
		</div>
	);
}

export function renderExample(dom) {
	render(<StyleGuide />, dom);
}
