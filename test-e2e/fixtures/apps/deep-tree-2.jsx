import { Fragment, h, render } from "preact";

const css = "border: 1px solid peachpuff; padding: 1rem;";

let i = 0;
function ChildItemName({ children }) {
	return (
		<div key={i++} style={css}>
			{children}
		</div>
	);
}

function Foo() {
	return (
		<h1 id="select-me" data-testid="select-me">
			select me
		</h1>
	);
}

function Bar() {
	return (
		<h1 id="bar" data-testid="bar">
			BAR
		</h1>
	);
}

function Bar2() {
	return (
		<h1 id="bar2" data-testid="bar2">
			BAR 2
		</h1>
	);
}

function App() {
	return (
		<Fragment>
			<ChildItemName>
				<Bar />
				<ChildItemName>
					<ChildItemName>
						<ChildItemName>
							<Bar2 />
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
													<Foo />
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
		</Fragment>
	);
}

render(<App />, document.getElementById("app"));

// eslint-disable-next-line no-console
document.addEventListener("click", (e) => console.log(e), true);
