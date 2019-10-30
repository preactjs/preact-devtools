# Preact Devtools

- Use `npm run dev` to start a demo page
- Use `npm run watch` to rebuild all extensions on any code changes

Chrome:

1. Go to extensions page
2. Enable developer mode
3. Click "Load unpacked"
4. Select `dist/chrome/` folder

Firefox:

1. Go to addons page
2. Click the settings icon
3. Select "Debug addons"
4. Click "Load temporary addon"
5. Select the `manifest.json` in `dist/firefox/`

## Embedding devtools directly into a page

`preact-devtools` supports an inline build target, where the devtools
can be embedded into any page without any restrictions like rendering
it into `iframe`s. Don't forget to include the css file too.

```js
import "preact-devtools/dist/preact-devtools.css";
import { attach, createRenderer, renderDevtools } from "preact-devtools";
import { options } from "preact";

// Instantiate devtools backend and attach it to preact
// - store -> The backing store for the devtools
// - destroy -> unlisten and restore previous `preact.options`
const { store, destroy } = attach(options, createRenderer);

// Render the actual devtools into the specified DOM node
renderDevtools(store, document.getElementById("devtools"));
```
