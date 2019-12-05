import { createHook } from "../../adapter/hook";
import { createBridge } from "../../adapter/bridge";

(window as any).__PREACT_DEVTOOLS__ = createHook(createBridge(window));
