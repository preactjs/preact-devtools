import { h, Fragment, render } from "preact";

const css = "border: 1px solid peachpuff; padding: 1rem;";

function ChildItemName({ children }) {
	return <div style={css}>{children}</div>;
}

function App() {
	return (
		<Fragment>
			<ChildItemName>
				<ChildItemName>
					<ChildItemName>
						<ChildItemName>
							<ChildItemName>
								<ChildItemName>
									<ChildItemName>
										<ChildItemName>
											<ChildItemName>
												<ChildItemName>
													<ChildItemName>
														<ChildItemName>
															<ChildItemName>
																<ChildItemName>
																	<ChildItemName>
																		<ChildItemName>
																			<ChildItemName>Deep</ChildItemName>
																		</ChildItemName>
																	</ChildItemName>
																</ChildItemName>
															</ChildItemName>
														</ChildItemName>
													</ChildItemName>
												</ChildItemName>
											</ChildItemName>
										</ChildItemName>
									</ChildItemName>
								</ChildItemName>
							</ChildItemName>
						</ChildItemName>
					</ChildItemName>
				</ChildItemName>
			</ChildItemName>
			<ChildItemName>
				<ChildItemName>
					<ChildItemName>
						<ChildItemName>
							<ChildItemName>
								<ChildItemName>
									<ChildItemName>
										<ChildItemName>
											<ChildItemName>Deep</ChildItemName>
										</ChildItemName>
									</ChildItemName>
								</ChildItemName>
							</ChildItemName>
						</ChildItemName>
					</ChildItemName>
				</ChildItemName>
			</ChildItemName>
		</Fragment>
	);
}

render(<App />, document.getElementById("app"));

// eslint-disable-next-line no-console
document.addEventListener("click", e => console.log(e), true);
