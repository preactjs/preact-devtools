import { h, render } from "preact";
import { useState } from "preact/hooks";
import { Highlighter } from "../view/components/Highlighter";
import { ElementProps } from "../view/components/ElementProps";
import { Iframer } from "./Iframer";
import d from "../view/components/Devtools.css";

export function TodoList() {
	const [todos, setTodos] = useState(["asd", "asdf"]);
	const [dark, setDark] = useState(false);
	const [v, setV] = useState("");

	return (
		<div class={dark ? "dark" : "light"}>
			<div style="padding: 5rem" class={d.root}>
				<div style="display: flex; flex-direction: column;">
					<button onClick={() => setDark(!dark)}>Toggle Theme</button>
					<form
						onSubmit={e => {
							e.preventDefault();
							setV("");
							setTodos([...todos, v]);
						}}
					>
						<input
							type="text"
							placeholder="todo item"
							onInput={e => setV(e.target.value)}
							value={v}
						/>
					</form>
					<p>Tasks</p>
					<ul>
						{todos.map(x => {
							return <li key={x}>{x}</li>;
						})}
					</ul>

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
					<h3>ElementProps</h3>
					<p>non-editable</p>
					<ElementProps
						data={{
							foo: "bar",
							bob: null,
							bazly: 123,
							baz: true,
						}}
					/>
					<p>editable</p>
					<div style="width: 20rem; outline: 1px solid red">
						<ElementProps
							editable
							data={{
								foo: "bar",
								longvalue: "asdji asdj asijd lksaj dlask kajdaklsj dklsabar",
								bob: null,
								bazly: 123,
								baz: true,
								arr: [1, 2, 3],
								obj: { foo: "bar" },
								set: new Set([1, 2, 3]),
								map: new Map([[1, "a"], [2, "b"]]),
								bar: {
									type: "function",
									name: "foobar",
								},
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export function renderExample(dom) {
	render(<TodoList />, dom);
}
