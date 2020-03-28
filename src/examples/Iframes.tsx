// @ts-ignore
import { Fragment } from "./vendor/preact-10";
import { Iframer } from "./Iframer";
import { html } from "./vendor/htm";
import { Highlighter } from "../view/components/Highlighter";

const spacing = {
	paddingBottom: 12,
	paddingTop: 12,
	paddingLeft: 12,
	paddingRight: 12,
	marginBottom: 5,
	marginTop: 5,
	marginLeft: 5,
	marginRight: 5,
	borderBottom: 5,
	borderTop: 5,
	borderLeft: 5,
	borderRight: 5,
};

export function Iframes() {
	return html`
		<${Fragment}>
			<h3>Highlighter</h3>
			<div class="grid">
				<div>
					<p>center</p>
					<${Iframer} height=${300}>
						<${Highlighter}
							bounds=${{}}
							top=${20}
							left=${20}
							label=${"FooBarBob"}
							height=${200}
							width=${200}
							...${spacing}
						/>
					<//>
				</div>
				<div>
					<p>left</p>
					<${Iframer} height=${300}>
						<${Highlighter}
							bounds=${{
								left: true,
							}}
							top=${20}
							left=${-50}
							label=${"FooBarBob"}
							height=${200}
							width=${200}
							...${spacing}
						/>
					<//>
				</div>
				<div>
					<p>right</p>
					<${Iframer} height=${300}>
						<${Highlighter}
							bounds=${{
								right: true,
							}}
							top=${20}
							left=${150}
							label=${"FooBarBob"}
							height=${200}
							width=${200}
							...${spacing}
						/>
					<//>
				</div>
				<div>
					<p>top</p>
					<${Iframer} height=${300}>
						<${Highlighter}
							bounds=${{
								top: true,
							}}
							top=${-250}
							left=${20}
							label=${"FooBarBob"}
							height=${200}
							width=${200}
							...${spacing}
						/>
					<//>
				</div>
				<div>
					<p>bottom</p>
					<${Iframer} height=${300}>
						<${Highlighter}
							bounds=${{
								bottom: true,
							}}
							top=${150}
							left=${20}
							label=${"FooBarBob"}
							height=${200}
							width=${200}
							...${spacing}
						/>
					<//>
				</div>
			</div>
		<//>
	`;
}
