# Preact Devtools internals

> This document aims to give a short overview to get you started quickly.

## Components

```
                                   +------------------+
                                   | Panel (icon bar) |
                                   +--------+---------+
                                            |
+------+    +----------------+    +---------+---------+
| Page +--->+ content-script +--->+ background-script |
+------+    +----------------+    +---------+---------+
   |                                        |
   |          +------------+        +-------+--------+
   |--------->+ initClient +        | devtools panel |
              +------------+        +----------------+
```

The entrypoint for the devtools extension is the extension manifest. The manifest for the Chrome
browser can be found at `src/shells/chrome/manifest.json`. The one for firefox at
`src/shells/firefox/manifest.json`.

Based on the manifest the browser then launches the `src/shells/shared/background.ts` script as
a background script (`background-script` in the diagram above) as well as the
`src/shells/shared/initClient.ts` script as a content script.

The `background.ts` script listens for connections from the devtools panel. Once the devtools panel
is connected it injects the `src/shells/shared/content-script.ts` script as a content script
(`content-script` in the diagram above) and waits until this script is connected too. Once both the
devtools panel as well as the `content-script.ts` are connected to the background script, it will
setup message forwarding between these two. This is needed since the devtools panel can not directly
communicate with scripts injected as content scripts. The `content-script.ts` then sets up message
forwarding between the page and the background script.

As mentioned the browser runs the `initClient.ts` as a content script for each tab. This script
injects the `src/shells/shared/installHook.ts` script into each tab by creating a `<script>`
element. This script will run in the context of the tab it was injected into. There it will install
the `window.__PREACT_DEVTOOLS__` object where preact registers itself by calling
`window.__PREACT_DEVTOOLS__.attachPreact(...)`.
