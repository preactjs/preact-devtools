import { html } from "../vendor/htm";

function DeepNest(props: any) {
	return html`
		<div>${props.children}</div>
	`;
}

export function ShallowTree() {
	return html`
		<${DeepNest}>
			<${DeepNest}>shallow<//>
		<//>
	`;
}

export function DeepTree() {
	return html`
		<${DeepNest}>
			<${DeepNest}>
				<${DeepNest}>
					<${DeepNest}>
						<${DeepNest}>
							<${DeepNest}>
								<${DeepNest}>
									<${DeepNest}>
										<${DeepNest}>
											<${DeepNest}>
												<${DeepNest}>
													<${DeepNest}>
														<${DeepNest}>
															<${DeepNest}>
																<${DeepNest}>
																	<${DeepNest}>
																		<${DeepNest}>
																			<${DeepNest}>
																				<${DeepNest}>
																					<${DeepNest}>
																						<${DeepNest}>
																							<${DeepNest}>
																								<${DeepNest}>
																									<${DeepNest}>
																										<${DeepNest}>
																											<${DeepNest}>
																												<${DeepNest}>
																													<${DeepNest}>
																														deep
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
	`;
}
