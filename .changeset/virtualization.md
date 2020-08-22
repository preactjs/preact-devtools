---
"preact-devtools": patch
---

Improve Tree view performance by using virtualization. This way the Tree view stays smooth, regardless of how many components are rendered of the page. This was tested with 7.000 components in a real world app.
