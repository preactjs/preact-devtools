# Changelog

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
