# Preact Devtools

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
