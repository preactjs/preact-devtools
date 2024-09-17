// Note: This file will be inlined into `content-script.ts`
// when building the extension.

import { createHook } from "../../adapter/hook.ts";
import { createPortForHook } from "../../adapter/adapter/port.ts";

(window as any).__PREACT_DEVTOOLS__ = createHook(createPortForHook(window));
