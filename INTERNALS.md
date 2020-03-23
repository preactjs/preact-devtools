# Preact Devtools internals

> This document aims to give a short overview to get you started quickly.

## Components

```txt
                                   +------------------+
                                   | Popup (icon bar) |
                                   +--------+---------+
                                            |
+------+    +----------------+    +---------+---------+
| Page +--->+ content-script +<-->+ background-script |
+------+    +----------------+    +---------+---------+
                                            |
                                    +-------+--------+
                                    | devtools panel |
                                    +----------------+
```

The entrypoint for the devtools extension is the extension manifest. The manifest for the Chrome
browser can be found at `src/shells/chrome/manifest.json`. The one for firefox at
`src/shells/firefox/manifest.json`.

Based on the manifest the browser then launches the `src/shells/shared/background.ts` script as
a background script (`background-script` in the diagram above). There will only ever be one
`background-script` active per extension. Before the page is loaded `src/shells/content-script.ts`
will be injected. At the time of injection no DOM (not even `<head>`) will be present. The
content script injects the `window.__PREACT_DEVTOOLS__` which the running Preact application will attach
to if there is any present.

If a Preact app attaches itself to `__PREACT_DEVTOOLS__` the `content-script` will send an `init`
event through `background.ts` to `src/shells/shared/panel/panel.ts` which in turn will create the
"Preact" tab in the devtools ui. This panel hosts the extension UI.
