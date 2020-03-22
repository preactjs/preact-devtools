import { createHook } from "../../adapter/hook";
import { createPort } from "../../adapter/adapter/port";

(window as any).__PREACT_DEVTOOLS__ = createHook(createPort(window));
