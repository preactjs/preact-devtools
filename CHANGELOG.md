# Changelog

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
