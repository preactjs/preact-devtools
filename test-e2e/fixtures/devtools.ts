import { setupInlineDevtools } from "../../src/shells/inline/index";

const container = document.getElementById("app")!;
setupInlineDevtools(container, window);
