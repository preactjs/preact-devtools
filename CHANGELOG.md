# Changelog

## 1.2.1

### Patch Changes

- [`8dc36a4`](https://github.com/preactjs/preact-devtools/commit/8dc36a46abc3736cc079358c7756d34461d55952) [#267](https://github.com/preactjs/preact-devtools/pull/267) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Fix Fragments not being filtered with Preact versions other than the devtools was built with

## 1.2.0

### Minor Changes

- [`92d7801`](https://github.com/preactjs/preact-devtools/commit/92d78014d228cf0024ec393aae9feae56af02ba0) [#255](https://github.com/preactjs/preact-devtools/pull/255) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Add support for filtering HOC-Components

### Patch Changes

- [#259](https://github.com/preactjs/preact-devtools/pull/259) Thanks [@bz2](https://github.com/bz2)! - Add `.editorconfig` to match prettier config.
- [#250](https://github.com/preactjs/preact-devtools/pull/250) Thanks [@bz2](https://github.com/bz2)! - Fix TypeError dom is null in updateHighlight.

- [#258](https://github.com/preactjs/preact-devtools/pull/265) Thanks [@bz2](https://github.com/bz2)! - Refine types on vnode utility functions.

- [`8f361f3`](https://github.com/preactjs/preact-devtools/commit/8f361f384904bf900ebf248213db12314c4c03e8) [#265](https://github.com/preactjs/preact-devtools/pull/265) Thanks [@bz2](https://github.com/bz2) and [@marvinhagemeister](https://github.com/marvinhagemeister)! - Fix Suspense nodes not being detected.

* [`d1581c7`](https://github.com/preactjs/preact-devtools/commit/d1581c71c00a2cf5fac95b1a38a9e12f6c3d0ec2) [#253](https://github.com/preactjs/preact-devtools/pull/253) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Elements panel: Fix key value hard to read in light theme

- [`3fb4d2a`](https://github.com/preactjs/preact-devtools/commit/3fb4d2a238dda1ad2eb35f7a2ee444c3f53fd6d0) [#252](https://github.com/preactjs/preact-devtools/pull/252) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Display Component key in the sidebar

* [`72b7964`](https://github.com/preactjs/preact-devtools/commit/72b796461191805c56e756e7b9061fb87c48a46b) [#257](https://github.com/preactjs/preact-devtools/pull/257) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Fix horizontal sidebar scroll on low depth elements

- [`6e79d7b`](https://github.com/preactjs/preact-devtools/commit/6e79d7b0733f2284b0dd22d96c375f1134530e1c) [#266](https://github.com/preactjs/preact-devtools/pull/266) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Add support for suspending Suspense components

* [`53b3e20`](https://github.com/preactjs/preact-devtools/commit/53b3e202bcd248ca6ef6c58006d063eb5cae0905) [#261](https://github.com/preactjs/preact-devtools/pull/261) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Upgrade dependencies

- [`aac0914`](https://github.com/preactjs/preact-devtools/commit/aac0914a2b3a0183ef64c7d8e494747a65975e3f) [#262](https://github.com/preactjs/preact-devtools/pull/262) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Remove vendored "hook" Preact version

## 1.1.2

### Patch Changes

- [`f292f4c`](https://github.com/preactjs/preact-devtools/commit/f292f4caf70a63dd13486fd3baec087b53c825ee) [#247](https://github.com/preactjs/preact-devtools/pull/247) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Save component filters in browser settings and restore them upon opening the devtools panel

* [`081c8e3`](https://github.com/preactjs/preact-devtools/commit/081c8e330829927a5e9b0574d9cf1b47f6e60606) [#243](https://github.com/preactjs/preact-devtools/pull/243) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Fix inconsistent wrong size in name input

- [`5489540`](https://github.com/preactjs/preact-devtools/commit/548954063ad539195d40536b668de2945b00927b) [#244](https://github.com/preactjs/preact-devtools/pull/244) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Use more robust `Text` node checks

## 1.1.1

### Patch Changes

- [`6e5ebba`](https://github.com/preactjs/preact-devtools/commit/6e5ebba9c29c04eded51e92996baf82e0de207c9) [#238](https://github.com/preactjs/preact-devtools/pull/238) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Align font-sizes with native browser devtools and fix component name "pushing" sidebar layout.

* [`74e7edc`](https://github.com/preactjs/preact-devtools/commit/74e7edc6a77234abcb8ae4be5aa469362d899210) [#242](https://github.com/preactjs/preact-devtools/pull/242) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Improve Tree view performance by using virtualization. This way the Tree view stays smooth, regardless of how many components are rendered of the page. This was tested with 7.000 components in a real world app.

## 1.1.0

- Add new "Statistics" tab to collect renderer statistics (#230, thanks @marvinhagemeister)

## 1.0.1

Bug Fixes:

- Fix error on highlighting text node (#226, thanks @marvinhagemeister)

## 1.0.0

Bug Fixes:

- Change default connection message to be more clear (#223, thanks @marvinhagemeister)
- Fix `undefined` component with prefresh (#222, thanks @marvinhagemeister)
- Fix `options._hook` arguments not forwarded (#221, thanks @marvinhagemeister)
- Improve Commit-Timeline display (#219, thanks @marvinhagemeister)
- Fix incorrect highlight offset with margins (#218, thanks @marvinhagemeister)

Maintenance:

- Upgrade all dependencies (#220, thanks @marvinhagemeister)
- Fix actions workflow not updating version (#214, thanks @marvinhagemeister)

## 0.7.0

This release is packed with features! The star of the show is the "highlight updates" option in the settings page, which when enabled will visualise updates via on overlay on top of the page.

Features:

- Add support for view source (#210, thanks @marvinhagemeister)
- Add proper support for debugging iframes (#209, thanks @marvinhagemeister)
- Sync selection (#206, thanks @marvinhagemeister)
- Add support for highlight updates (#202, #204, #205, #208, thanks @marvinhagemeister)
- Profiler: Highlight nodes in DOM if present (#199, thanks @marvinhagemeister)

Bug Fixes:

- Fix profiler nodes getting lost due to mutations (#200, thanks @marvinhagemeister)

Maintenance:

- Sidebar cleanup (#211, thanks @marvinhagemeister)
- Restructure settings page (#203, #212 thanks @marvinhagemeister)
- Modernize e2e tests (#201, thanks @marvinhagemeister)
- Action docs (#198, thanks @marvinhagemeister)

## 0.6.2

This release completes the Profiler rewrite. The flamegraph can now display memoized trees and displays timings in a lot more polished way.

- Fix symbol values not supported (#196, thanks @marvinhagemeister)
- Make debug views toggle-able via setting (#195, thanks @marvinhagemeister)
- Profiler: Add support for displaying memoized children (#194, thanks @marvinhagemeister)
- Debug panels (#192, thanks @marvinhagemeister)
- Profiler refactor Part 2 (#191, thanks @marvinhagemeister)
- Fix trying to set popup on closed tab (#189, thanks @marvinhagemeister)

## 0.6.1

This release contains no new features and all time was spent on polishing the existing ones and a bit of housekeeping. Most notably the Profiler will be a lot faster on weak GPUs (like the one in my Dell XPS 13 laptop).

- Profiler refactor Part 1 (#187, thanks @marvinhagemeister)
- Add support for custom persistent user profiles (#186, thanks @marvinhagemeister)
- Fix report bug link not working (#185, thanks @marvinhagemeister)
- Work around chrome monospace bug (#184, thanks @marvinhagemeister)
- Only show selftime in ranked Flamegraph (#183, thanks @marvinhagemeister)
- Fix lint-staged config + update pentf (#182, thanks @marvinhagemeister)
- Make flame graph animations less demanding on GPU (#180, thanks @marvinhagemeister)
- Refactor DataInput (#179, thanks @marvinhagemeister)
- Make generated bundles easier to review (#178, thanks @marvinhagemeister)
- Profiler: Mark unrelated nodes visually (#177, thanks @marvinhagemeister)
- Fix window resize event never triggered (#176, thanks @marvinhagemeister)

## 0.6.0

This release hardens the recently introduced hooks inspection and fixes several edge cases. Apart from that it's now possible to properly debug Preact applications that are rendered inside an `iframe`. The highlight overlay will adapt to the `iframe`'s position accordingly :tada:

Despite this being mostly a maintenance release, there is one new feature: "Reload and profile". This allows to capture the very first render of any application and inspect the render performance!

Features:

- Sync (only user) selection Profiler -> Elements (#174, thanks @marvinhagemeister)
- Add support for reload and profile (#172, thanks @marvinhagemeister)

Bug Fixes:

- Fix wrong highlight position if rendered in iframe (#171, thanks @marvinhagemeister)
- Fix hooks parsing error when value is shortened (#167, thanks @marvinhagemeister)
- Fix possible exception in hooks parsing code (#166, thanks @marvinhagemeister)
- Fix tree item not scrolling into view in search (#165, thanks @marvinhagemeister)

Maintenance:

- Always enable no-console linting rule (#173, thanks @marvinhagemeister)
- Make e2e tests more resilient (#170, thanks @marvinhagemeister)
- Upgrade all dependencies (#163, thanks @marvinhagemeister)

## 0.5.0

This release finally brings support for hooks inspection to preact devtools! It allows you to fully debug all hooks of a component, including custom ones. This is big for me as it took me a few tries to get it right. If you find any issues with it, please reach out!

Apart from that there have been some minor visual changes to improve readability.

- Make complex hook values collapsable (#160, thanks @marvinhagemeister)
- Use better color hierarchy in sidebar (#159, thanks @marvinhagemeister)
- Minor design improvements (#158, thanks @marvinhagemeister)
- Add support for hooks (#143, thanks @marvinhagemeister)
- Limit key length display (#154, thanks @marvinhagemeister)

Maintenance:

- Extract parsing logic from sidebar components (#156, thanks @marvinhagemeister)
- Refactor SidebarPanel empty message handling (#155, thanks @marvinhagemeister)

## 0.4.0

This release improves a lot of little UX interactions and contains a lot of house cleaning in preparation for hooks inspection.

We couldn't resist adding a major feature too as it turned out to be easier to implement than initially assumed. The profiler is now able to inspect why a node rendered! The full support for this feature required a change in Preact. But don't worry we'll cut a new release over there in the coming days!

Features:

- Profiler: Display why a node rendered (#138, thanks @marvinhagemeister)

Bug Fixes:

- Fix elements only clickable on text (#150, thanks @marvinhagemeister)
- Fix toggle alignment (#149, thanks @AlexMunoz)
- Fix highlight stuck on scroll (#147, thanks @marvinhagemeister)
- Fix only first DOM element highlighted on Fragments (#146, thanks @marvinhagemeister)
- Minor wording change (#142, thanks @marvinhagemeister)
- Fix undefined display in input (#139, thanks @marvinhagemeister)
- Improve contrast on component name (#135, thanks @marvinhagemeister)
- Fix invisible `undefined` prop value in preview (#134, thanks @marvinhagemeister)
- Make design more consistent across browsers (#133, thanks @marvinhagemeister)

Maintenance:

- Minor props parser refactoring (#145, thanks @marvinhagemeister)
- Enhance test for multiple property changes (#140, thanks @marvinhagemeister)
- Only delete relevant files in build commands (#137, thanks @marvinhagemeister)
- Add eslint config (#136, thanks @marvinhagemeister)
- Upgrade all dependencies (#132, thanks @marvinhagemeister)

## 0.3.0

This release brings a few new features and many usability improvements. Thanks to everyone who reported bugs and helped make preact-devtools even more awesome!

Features:

- Add support for User Timing API (#129, thanks @marvinhagemeister)
- Improve value preview (#125, thanks @marvinhagemeister)
- Add firefox run command (#123, thanks @marvinhagemeister)
- Add support for context `displayName` (#119, thanks @marvinhagemeister)
- Only display nodes of the current commit in ranked view (#115, thanks @marvinhagemeister)

Bug Fixes:

- Fix sidebar collapsing on user input (#128, thanks @marvinhagemeister)
- Add collapse test (#127, thanks @marvinhagemeister)
- Revert to use purple as element color (#126, thanks @marvinhagemeister)
- Maintenance (#124, thanks @marvinhagemeister)
- Fix updates mutating existing vnode properties (#121, thanks @marvinhagemeister)
- Remove debug logs from e2e tests (#120, thanks @marvinhagemeister)
- Fix objects wrongly detected as vnodes (#117, thanks @marvinhagemeister)
- Minor design improvements (#113, thanks @marvinhagemeister)
- Fix mixed font size in props panel (#112, thanks @marvinhagemeister)

## 0.2.1

With the introduction of a proper end-to-end (e2e) testing framework, we managed to quickly find and fix many bugs related to the element picker or highlighting of nodes on the inspected page :tada:

The extension is pretty stable by now and we expect to cut a proper 1.0.0 release in the not so distant future.

- Minor design tweaks to element search input (#109, thanks @marvinhagemeister)
- Refactor inspection to be less error prone (#108, thanks @marvinhagemeister)
- Fix inspect highlight not working on preactjs.com (#107, thanks @marvinhagemeister)
- E2E test framework improvements (#106, thanks @marvinhagemeister)
- Fix incorrect padding in filter dropdown (#105, thanks @marvinhagemeister)
- Add test case for multiple roots (#103, thanks @marvinhagemeister)
- Fix inspect picker not working anymore (#102, thanks @marvinhagemeister)
- Fix highlight flickering (#101, thanks @marvinhagemeister)
- Add proper end to end test setup (#100, thanks @marvinhagemeister)
- Minor design improvements (#99, thanks @marvinhagemeister)
- Port examples to htm (#98, thanks @marvinhagemeister)

## 0.2.0

With this release the whole message passing between the extension and the page was rewritten from scratch. It's more robust now and rebuilds state whenever they are re-opened on the same page.

The filters also received a nice upgrade with an improved UX :tada:

- Fix filters not working (#95, thanks @marvinhagemeister)
- Fix devtools losing state when re-opening them (#94, thanks @marvinhagemeister)
- Renderer refactor (#93, thanks @marvinhagemeister)
- Add preact/devtools to usage section in README (#92, thanks @marvinhagemeister)
- Refactor extension connection handling (#90, thanks @marvinhagemeister)
- Upgrade dependencies (#89, thanks @marvinhagemeister)

## 0.1.4

- Only inject devtools CSS when Preact was detected (#87, thanks @marvinhagemeister)
- Fix race condition when injecting devtools hook (#86, thanks @marvinhagemeister)

## 0.1.3

- Fix infinite loop on circular references in props (#80, thanks @marvinhagemeister)
- Add default font (#81, thanks @marvinhagemeister)

## 0.1.2

- Fix wrong reordering offset (#71, thanks @marvinhagemeister)
- Fix inspect context not serializing functions (#70, thanks @marvinhagemeister)

## 0.1.1

- Fix indent growing larger than maximum (#65, thanks @marvinhagemeister)
- Remove border around new prop (#64, thanks @marvinhagemeister)
- Adapt indentation based on available screen space (#25, thanks @marvinhagemeister)
- Remove special internal jsx props (#63, thanks @marvinhagemeister)
- Set fallback component name (#62, thanks @marvinhagemeister)

## 0.1.0

The main new feature is a dedicated panel to profile Preect applications.

- Reduce logging noise (#59, thanks @marvinhagemeister)
- Only inject hook into html page (#58, thanks @marvinhagemeister)
- Disable Profiler if renderer has no support for it (#57, thanks @marvinhagemeister)
- Refactor Profiler backend (#55, thanks @marvinhagemeister)
- Add Profiler Panel (#56, thanks @marvinhagemeister)

## 0.0.6

- Minor UI polishing (#50, thanks @marvinhagemeister)
- Fix jumpy page on highlighting due to scrollbar (#49, thanks @marvinhagemeister)
- Don't expand complex objects in sidebar by default (#48, thanks @marvinhagemeister)
- Fix stale useObserver value (#47, thanks @marvinhagemeister)
- Fix checkbox value converted to a string (#46, thanks @marvinhagemeister)
- Multi renderer fixes (#45, thanks @marvinhagemeister)
- Minor improvements (#29, thanks @sventschui)
- Allow multiple instances of devtools at the same time (#44, thanks @marvinhagemeister)
- Add usage guide to README.md (#43, thanks @sean0x42)
- Fix Chrome extension link in README (#41, thanks @yu-kgr)

## 0.0.5

- Make sure that all injected code is wrapped in an `iife`, thanks to @ForsakenHarmony for spotting this :tada:

## 0.0.4

- Fix new value UI doing nothing (#28)
- Fix stale value when resetting it (#27)
- Don't animate scroll in tree view (#26)

## 0.0.3

- Usability improvements + Design tweaks
- Upgrade dependencies and to Preact 10.0.5
- Extract Preact X specific renderer code from `Adapter`
- Fix stale mask value in props inputs
- Fix several issues with props serialization

## 0.0.2

- Initial pre pre pre release
