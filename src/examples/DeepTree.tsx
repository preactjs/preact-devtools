import { h } from "preact";

function DeepNest(props: any) {
	return <div>{props.children}</div>;
}

export function ShallowTree() {
	return (
		<DeepNest>
			{/* asd */}
			<DeepNest>shallow</DeepNest>
		</DeepNest>
	);
}

export function DeepTree() {
	return (
		<DeepNest>
			<DeepNest>
				<DeepNest>
					<DeepNest>
						<DeepNest>
							<DeepNest>
								<DeepNest>
									<DeepNest>
										<DeepNest>
											<DeepNest>
												<DeepNest>
													<DeepNest>
														<DeepNest>
															<DeepNest>
																<DeepNest>
																	<DeepNest>
																		<DeepNest>
																			<DeepNest>
																				<DeepNest>
																					<DeepNest>
																						<DeepNest>
																							<DeepNest>
																								<DeepNest>
																									<DeepNest>
																										<DeepNest>
																											<DeepNest>
																												<DeepNest>
																													<DeepNest>
																														deep
																													</DeepNest>
																												</DeepNest>
																											</DeepNest>
																										</DeepNest>
																									</DeepNest>
																								</DeepNest>
																							</DeepNest>
																						</DeepNest>
																					</DeepNest>
																				</DeepNest>
																			</DeepNest>
																		</DeepNest>
																	</DeepNest>
																</DeepNest>
															</DeepNest>
														</DeepNest>
													</DeepNest>
												</DeepNest>
											</DeepNest>
										</DeepNest>
									</DeepNest>
								</DeepNest>
							</DeepNest>
						</DeepNest>
					</DeepNest>
				</DeepNest>
			</DeepNest>
		</DeepNest>
	);
}
