import { h, render } from "./preact.module";
import { useState } from "./hooks.module";
import { Highlighter } from "../view/components/Highlighter";
import { ElementProps } from "../view/components/ElementProps";
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
					<Highlighter
						top={200}
						left={200}
						label={"FooBarBob"}
						height={200}
						width={200}
						padding={[12, 10, 20, 20]}
						margin={[16, 16, 16, 16]}
						border={[5, 5, 5, 5]}
					/>
					<h3>ElementProps</h3>
					<p>non-editable</p>
					<ElementProps
						data={{
							foo: "bar",
							bob: null,
							bazly: 123,
						}}
					/>
					<p>editable</p>
					<div style="width: 20rem; outline: 1px solid red">
						<ElementProps
							editable
							path={[]}
							data={{
								foo: "bar",
								longvalue: "asdji asdj asijd lksaj dlask kajdaklsj dklsabar",
								bob: null,
								bazly: 123,
								baz: true,
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
