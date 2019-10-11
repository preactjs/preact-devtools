import { h, Component } from "preact";

class Child extends Component {
	render() {
		return <div>Context value: {this.context.foo}</div>;
	}
}

class Parent extends Component {
	getChildContext() {
		return { foo: "bar" };
	}

	render() {
		return <Child />;
	}
}

export function LegacyContext() {
	return <Parent />;
}
