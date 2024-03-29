import { h, render } from "preact";

function ListItem(props) {
	return <li>{props.children}</li>;
}
function NoKey(props) {
	return <li>{props.children}</li>;
}

function Keys() {
	return (
		<div style="padding: 2rem;">
			<ul>
				<ListItem key="ABC">abc</ListItem>
				<ListItem key="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789">long key</ListItem>
				<NoKey>no key</NoKey>
			</ul>
		</div>
	);
}

render(<Keys />, document.getElementById("app"));
