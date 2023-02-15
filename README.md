# ![](./images/icons/icon_28.png) Custom Bang Search

[![Firefox Add-On version](https://img.shields.io/amo/v/custombangsearch?colorA=35383d)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)
[![Firefox Add-On rating](https://img.shields.io/amo/rating/custombangsearch?colorA=35383d)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)
[![Firefox Add-On user count](https://img.shields.io/amo/users/custombangsearch?colorA=35383d)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)
[![Chrome extension version](https://img.shields.io/chrome-web-store/v/oobpkmpnffeacpnfbbepbdlhbfdejhpg?colorA=35383d)](https://chrome.google.com/webstore/detail/custom-bang-search/oobpkmpnffeacpnfbbepbdlhbfdejhpg?hl=en)
[![Chrome extension rating](https://img.shields.io/chrome-web-store/rating/oobpkmpnffeacpnfbbepbdlhbfdejhpg?colorA=35383d)](https://chrome.google.com/webstore/detail/custom-bang-search/oobpkmpnffeacpnfbbepbdlhbfdejhpg?hl=en)
[![Chrome extension user count](https://img.shields.io/chrome-web-store/users/oobpkmpnffeacpnfbbepbdlhbfdejhpg?colorA=35383d)](https://chrome.google.com/webstore/detail/custom-bang-search/oobpkmpnffeacpnfbbepbdlhbfdejhpg?hl=en)

[![Firefox Add-On link](./images/firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)
[![Chrome Web Store link](./images/chrome.png)](https://chrome.google.com/webstore/detail/custom-bang-search/oobpkmpnffeacpnfbbepbdlhbfdejhpg?hl=en)

A browser extension to use custom DuckDuckGo-like bangs directly from the address bar.

// TODO: Some level of support for using the DDG bangs.

## Demo

TODO: New, good demo. Video and basic explainer image.

## Supported Search Engines

[These search engines are tested and officially supported](./docs/supported-engines.md).

## Bangs

Go to the options page to start creating custom bangs (see demo above / info below).

Use `%s` in the URL to show where you want your query to be inserted, take a look at the default bangs if you need some help understanding how to format things.

_Some of the default URLs including Amazon, Ebay, and Etsy are UK URLs, so change those if you need to!_

## Options UI

TODO: Much better options UI, will require brand new instruction (or none at all?)

## How the extension works

On Firefox, CBS uses the `WebRequestBlocking` API to intercept requests to the supported search engines, and if a bang is found, blocks the request and redirects the user to the chosen URL with the query inserted.

On Chrome, CBS uses the `tabs` API to watch for when a tab URL updates, does a similar search for bangs, and then updates the tab location.

We use different methods per browser, because `WebRequestBlocking` is faster and more efficient, but [Google's depracation](https://developer.chrome.com/docs/extensions/mv3/mv3-migration/#when-use-blocking-webrequest) of said API in manifest V3 means it can't be used in Chrome.

This unfortunatley means there's some slight differences in behaviour, and each browser has [its own list of supported search engines that work with CBS](./docs/supported-engines.md).

## Development

### Building

```bash
git clone https://github.com/psidex/CustomBangSearch.git
cd CustomBangSearch
npm install
npm run build-firefox OR build-firefox-release OR build-chrome OR build-chrome-release
```

This produces a `build` directory containing the compiled JavaScript, and a zip file in the root of the project that can be uploaded to the browser web extension stores.

Non "release" builds (i.e. dev builds) are not minified, can contain debugging calls such as `console.log`, and also contain some development tools loaded into the popup &| options windows.

### Details

A custom script, `bob.mjs`, is used to build and package the extension. This was created just to speed up the build process and make testing much easier.

esbuild is used to compile the TypeScript to JavaScript, the tsc compiler is listed as a dependency but this is just used for type checking / linting.

The manifest files link to the compiled build made by esbuild, not the TS files, so make sure they are built before you build the extension package.

## Credits

- Icon created by [apien on Flaticon](https://www.flaticon.com/free-icon/exclamation-mark_4194667)
- [DuckDuckGo bangs](https://duckduckgo.com/bang)
- [!Bang Quick Search](https://addons.mozilla.org/en-US/firefox/addon/bang-quick-search/)
