import { Renderer } from "../renderer";
import { Internal, OptionsV11 } from "./shapes-v11";

export function setupOptionsV11(
	options: OptionsV11,
	renderer: Renderer<Internal>,
) {
	//

	const oldCommit = options._commit;

	options._commit = internal => {
		renderer.onCommit(internal);
		if (oldCommit) oldCommit(internal);
	};
}
