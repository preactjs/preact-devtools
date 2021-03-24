const { h, render } = preact;

const Child = () => null;

function App() {
	return html` <div>Element</div> `;
}

render(
	h(App, {
		blob: new Blob(),
		obj: { type: "foo", props: null },
		obj2: {
			foobarA: 1,
			foobarB: 1,
			foobarC: 1,
			foobarD: 1,
			foobarE: 1,
			foobarF: 1,
			foobarG: 1,
			foobarH: 1,
		},
		arr: [
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			8,
			9,
			10,
			11,
			12,
			13,
			14,
			15,
			16,
			17,
			18,
			19,
			20,
			21,
			22,
			23,
			24,
			25,
			26,
			27,
			28,
			29,
			30,
			31,
			32,
			33,
			34,
			35,
			36,
			37,
			38,
			39,
		],
		vnode: h("div", { class: "bar" }),
		vnode2: h(Child, null),
	}),
	document.getElementById("app"),
);
