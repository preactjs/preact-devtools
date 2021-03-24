import htm from "htm";
const { render, h } = preact;
const { useState } = preactHooks;

const html = htm.bind(h);

function TodoItem(props) {
	return html`
		<li style="padding: 0.5rem 1rem;">
			<span>${props.children} - </span>
			<button onClick=${props.onClick}>delete</button>
		</li>
	`;
}
function Counter() {
	const [v, set] = useState(0);

	return html`
		<div style="padding: 2rem;">
			<p>counter: ${v}</p>
			<button type="button" onClick=${() => set(v + 1)}>Increment</button>
		</div>
	`;
}

function TodoList() {
	const [todos, setTodos] = useState(["foo", "bar"]);
	const [value, setValue] = useState("");

	return html`
		<form
			style="padding: 2rem;"
			onSubmit=${e => {
				e.preventDefault();
				if (value) {
					setTodos([...todos, value]);
					setValue("");
				}
			}}
		>
			<input
				type="text"
				value=${value}
				onChange=${e => setValue(e.target.value)}
			/>
			<button type="submit">submit</button>
			<ul>
				${todos.map(
					(item, i) =>
						html`<${TodoItem}
							key="${item}"
							onClick=${() => {
								const next = todos.slice();
								next.splice(i, 1);
								setTodos(next);
							}}
							>${item}<//
						>`,
				)}
			</ul>
			<${Counter} />
		</form>
	`;
}

render(html`<${TodoList} />`, document.getElementById("app"));
