import { h } from "preact";
import { useState } from "preact/hooks";

export function TodoList() {
	const [todos, setTodos] = useState<string[]>(["asd", "asdf"]);
	const [v, setV] = useState("");

	return (
		<div>
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
					onInput={e => setV((e.target as any).value)}
					value={v}
				/>
			</form>
			<p>Tasks</p>
			<ul>
				{todos.map(x => {
					return (
						<TodoItem
							key={x}
							text={x}
							onRemove={() => {
								const idx = todos.indexOf(x);
								if (idx > -1) todos.splice(idx, 1);
								setTodos([...todos]);
							}}
						/>
					);
				})}
			</ul>
		</div>
	);
}

export function TodoItem(props: { text: string; onRemove: () => void }) {
	return (
		<li>
			{props.text} - &nbsp; <button onClick={props.onRemove}>remove</button>
		</li>
	);
}
