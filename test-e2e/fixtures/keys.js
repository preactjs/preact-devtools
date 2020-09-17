const { h, render } = preact;

function ListItem(props) {
	return html`<li>${props.children}</li>`;
}
function NoKey(props) {
	return html`<li>${props.children}</li>`;
}

function Keys() {
	return html`
		<div style="padding: 2rem;">
			<ul>
				<${ListItem} key="ABC">abc<//>
				<${ListItem} key="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789">long key<//>
				<${NoKey}>no key<//>
			</ul>
		</div>
	`;
}

render(h(Keys), document.getElementById("app"));
