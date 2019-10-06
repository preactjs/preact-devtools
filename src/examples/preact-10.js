import { h, render } from "preact";
import { useState } from "preact/hooks";
import { ElementProps } from "../view/components/ElementProps";
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
import { TodoList } from "./TodoList";
import { treeStore, inspect } from "./treeStore";
import { createPropsStore } from "../view/store/props";
import { Iframer } from "./Iframer";
import { Highlighter } from "../view/components/Highlighter";

function Headline(props) {
	return <h3>{props.title}</h3>;
}

const tstore = treeStore();

const pStore = createPropsStore(
	tstore.inspectData,
	tstore.selection.selected,
	() => (tstore.inspectData.$ = inspect),
);

export function StyleGuide() {
	const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
	const [showModal, setShowModal] = useState(
		!!localStorage.getItem("show-modal"),
	);

	const propList = useObserver(() =>
		pStore.list.$.map(x => pStore.tree.$.get(x)),
	);
	const pCollapsed = useObserver(() => pStore.collapser.collapsed.$);

	const [store] = useState(createStore());

	return (
		<div class={dark ? "dark" : "light"}>
			<div style="padding: 5rem" class={d.root}>
				<div style="display: flex; flex-direction: column;">
					<button
						onClick={() => {
							localStorage.setItem("theme", !dark ? "dark" : "light");
							setDark(!dark);
						}}
					>
						Toggle Theme
					</button>
					<h2>Todo List</h2>
					<TodoList />
					<h2>Styleguide</h2>
					<h3>Highlighter</h3>
					<div class="grid">
						<div>
							<p>center</p>
							<Iframer height={300}>
								<Highlighter
									bounds={{}}
									top={20}
									left={20}
									label={"FooBarBob"}
									height={200}
									width={200}
									padding={[12, 10, 20, 20]}
									margin={[16, 16, 16, 16]}
									border={[5, 5, 5, 5]}
								/>
							</Iframer>
						</div>
						<div>
							<p>left</p>
							<Iframer height={300}>
								<Highlighter
									bounds={{
										left: true,
									}}
									top={20}
									left={-50}
									label={"FooBarBob"}
									height={200}
									width={200}
									padding={[12, 10, 20, 20]}
									margin={[16, 16, 16, 16]}
									border={[5, 5, 5, 5]}
								/>
							</Iframer>
						</div>
						<div>
							<p>right</p>
							<Iframer height={300}>
								<Highlighter
									bounds={{
										right: true,
									}}
									top={20}
									left={150}
									label={"FooBarBob"}
									height={200}
									width={200}
									padding={[12, 10, 20, 20]}
									margin={[16, 16, 16, 16]}
									border={[5, 5, 5, 5]}
								/>
							</Iframer>
						</div>
						<div>
							<p>top</p>
							<Iframer height={300}>
								<Highlighter
									bounds={{
										top: true,
									}}
									top={-250}
									left={20}
									label={"FooBarBob"}
									height={200}
									width={200}
									padding={[12, 10, 20, 20]}
									margin={[16, 16, 16, 16]}
									border={[5, 5, 5, 5]}
								/>
							</Iframer>
						</div>
						<div>
							<p>bottom</p>
							<Iframer height={300}>
								<Highlighter
									bounds={{
										bottom: true,
									}}
									top={150}
									left={20}
									label={"FooBarBob"}
									height={200}
									width={200}
									padding={[12, 10, 20, 20]}
									margin={[16, 16, 16, 16]}
									border={[5, 5, 5, 5]}
								/>
							</Iframer>
						</div>
					</div>
					<h3>Sidebar</h3>
					<AppCtx.Provider value={tstore}>
						<Sidebar />
					</AppCtx.Provider>
					<h3>ElementProps</h3>
					<p>non-editable</p>
					<ElementProps
						editable={false}
						items={propList}
						collapsed={pCollapsed}
						onCollapse={pStore.collapser.toggle}
					/>
					<p>editable</p>
					<div style="width: 20rem; outline: 1px solid red">
						<ElementProps
							editable
							items={propList}
							collapsed={pCollapsed}
							onCollapse={pStore.collapser.toggle}
						/>
					</div>
					<h2>Icon Btns</h2>
					<IconBtn onClick={() => console.log("click")}>
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
					<Headline title="foobar" />
					<h2>TreeBar</h2>
					<div style="border: 1px solid #555">
						<AppCtx.Provider value={tstore}>
							<TreeBar />
						</AppCtx.Provider>
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
							<AppCtx.Provider value={tstore}>
								<TreeView />
							</AppCtx.Provider>
						</div>
					</div>
					<p>Empty tree view</p>
					<AppCtx.Provider value={store}>
						<TreeView />
					</AppCtx.Provider>
				</div>
			</div>
		</div>
	);
}

export function renderExample(dom) {
	render(<StyleGuide />, dom);
}
