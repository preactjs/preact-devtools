const { render } = preact;

const css = "border: 1px solid peachpuff; padding: 1rem;";

function ChildItemName({ children }) {
	return html`<div style=${css}>${children}</div>`;
}

function App() {
	return html`
		<${ChildItemName}>
			<${ChildItemName}>
				<${ChildItemName}>
					<${ChildItemName}>
						<${ChildItemName}>
							<${ChildItemName}>
								<${ChildItemName}>
									<${ChildItemName}>
										<${ChildItemName}>
											<${ChildItemName}>
												<${ChildItemName}>
													<${ChildItemName}>
														<${ChildItemName}>
															<${ChildItemName}>
																<${ChildItemName}>
																	<${ChildItemName}>
																		<${ChildItemName}>Deep<//>
																	<//>
																<//>
															<//>
														<//>
													<//>
												<//>
											<//>
										<//>
									<//>
								<//>
							<//>
						<//>
					<//>
				<//>
			<//>
		<//>
		<${ChildItemName}>
			<${ChildItemName}>
				<${ChildItemName}>
					<${ChildItemName}>
						<${ChildItemName}>
							<${ChildItemName}>
								<${ChildItemName}>
									<${ChildItemName}>
										<${ChildItemName}>Deep<//>
									<//>
								<//>
							<//>
						<//>
					<//>
				<//>
			<//>
		<//>
	`;
}

render(html`<${App} />`, document.getElementById("app"));

document.addEventListener("click", e => console.log(e), true);
