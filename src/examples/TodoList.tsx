import { h } from "preact";
import { useState } from "preact/hooks";

function shuffle<T = any>(arr: T[]): T[] {
	let i = arr.length;

	// While there remain elements to shuffle...
	while (0 !== i) {
		// Pick a remaining element...
		let rand = Math.floor(Math.random() * i);
		i -= 1;

		// And swap it with the current element.
		let tmp = arr[i];
		arr[i] = arr[rand];
		arr[rand] = tmp;
	}

	return arr;
}

export function TodoList() {
	const [todos, setTodos] = useState<string[]>([
		"asd",
		"asdf",
		"foo",
		"bob",
		"rr",
	]);
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
			<button onClick={() => setTodos([...shuffle(todos)])}>Randomize</button>
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
