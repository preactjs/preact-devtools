# Preact Devtools

Browser extension that allows you to inspect a Preact component hierarchy,
including props and state.

**Requires Preact >=10.1.0**

![Screenshot of Preact devtools](media/preact-chrome-light.png)

## Usage

Firstly, we need to import `preact/debug` somewhere to initialize the connection
to the extension. Make sure that this import is **the first** import in your
whole app.

```javascript
// Must be the first import
import "preact/debug";

// Or if you just want the devtools bridge (~240B) without other
// debug code (useful for production sites)
import "preact/devtools";
```

Then, download the Preact Devtools extension for your browser:

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/preact-devtools/)
- [Chrome](https://chrome.google.com/webstore/detail/preact-developer-tools/ilcajpmogmhpliinlbcdebhbcanbghmd)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/hdkhobcafnfejjieimdkmjaiihkjpmhk)

## Contributing

**NOTE:** This repo currently uses a mix of yarn and npm.

To set up a local dev environment, clone this repo and use
[yarn](https://yarnpkg.com/getting-started/install) to install dependencies:

```bash
git clone https://github.com/preactjs/preact-devtools.git
cd preact-devtools
yarn install
```

### Development

Preact Devtools aims to maintain compatibility with all Preact releases
since 10.1.0. For testing purposes, the dev server needs at least one
Preact release package in the `test-e2e/fixtures/vendor/preact` directory.

To download a full set of Preact release packages, run:

```bash
node tools/fetch-preact-versions.mjs
```

Then:

- Use `npm run dev` to start a demo page
- Use `npm run watch` to rebuild all extensions on any code changes

### Linting & testing

To run the linter:

```bash
yarn lint
```

To run the unit tests:

```bash
yarn test
```

To run browser tests, first ensure that Playwright is installed:

```bash
npx playwright install
```

then:

- `npm run test:e2e:10` to run browser tests with Preact 10
- `npm run test:e2e:11` to run browser tests with Preact 11
- `npm run test:e2e:git` to run browser tests with a local checkout of Preact

### Building

- Use `npm run build:firefox` or `npm run build:chrome` to create a release build

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

## For extension reviewers

These commands will build the extension and load it into a browser with a temporary profile. The browser will automatically navigate to [preactjs.com](https://preactjs.com). There you can test the extension.

Chrome:

1. Execute `npm run run:chrome`
2. Click on `Preact` tab in devtools

Firefox:

1. Exectue `npm run run:firefox`
2. Open devtools + click on `Preact` tab in devtools
