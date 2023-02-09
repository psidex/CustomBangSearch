# ![](./images/icons/icon_28.png) Custom Bang Search

[![Firefox Add-On version](https://img.shields.io/amo/v/custombangsearch?colorA=35383d)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)
[![Firefox Add-On rating](https://img.shields.io/amo/rating/custombangsearch?colorA=35383d)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)
[![Firefox Add-On user count](https://img.shields.io/amo/users/custombangsearch?colorA=35383d)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)
[![Chrome extension version](https://img.shields.io/chrome-web-store/v/oobpkmpnffeacpnfbbepbdlhbfdejhpg?colorA=35383d)](https://chrome.google.com/webstore/detail/custom-bang-search/oobpkmpnffeacpnfbbepbdlhbfdejhpg?hl=en)
[![Chrome extension rating](https://img.shields.io/chrome-web-store/rating/oobpkmpnffeacpnfbbepbdlhbfdejhpg?colorA=35383d)](https://chrome.google.com/webstore/detail/custom-bang-search/oobpkmpnffeacpnfbbepbdlhbfdejhpg?hl=en)
[![Chrome extension user count](https://img.shields.io/chrome-web-store/users/oobpkmpnffeacpnfbbepbdlhbfdejhpg?colorA=35383d)](https://chrome.google.com/webstore/detail/custom-bang-search/oobpkmpnffeacpnfbbepbdlhbfdejhpg?hl=en)

[![Firefox Add-On link](./images/firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)
[![Chrome Web Store link](./images/chrome.png)](https://chrome.google.com/webstore/detail/custom-bang-search/oobpkmpnffeacpnfbbepbdlhbfdejhpg?hl=en)

A browser extension to use custom DuckDuckGo-like bangs directly from the address bar

## Demo

TODO: New, good demo. Video and basic explainer image.

## Supported Search Engines

[These search engines are tested and officially supported](./docs/supported-engines.md)

## Options UI

TODO: Much better options UI, will require brand new instruction (or none at all?)

### Defaults

Take a look at the default bangs if you need some help understanding how to write the URLs.

_Some of the default URLs including Amazon, Ebay, and Etsy are UK URLs, so change those if you need to!_

## How it works

TODO: This might need updating since manifest v3?

When you type a query in the search bar, your browser makes a request to your
browsers set search engine. This extension intercepts that request, and if the
query matches a bang (e.g. `!m new york`) it will tell the browser to go the url
set to that bang with the given query, instead of your original search.

This has the side effect of working if you type a bang into the actual search engine as well.

## Development

### Building

```bash
git clone https://github.com/psidex/CustomBangSearch.git
cd CustomBangSearch
npm install
```

### Details

TODO: Update once done

The only things actually required to build this extension from source to
something that is installable in your browser are `react`, `react-dom`,
`nanoid`, `react-hot-toast`, and `esbuild`.

`web-ext` is used to generate the extension package but it _can_ be done by
hand.

Everything in `devDependencies` is purely for linting, and `typescript` and
`webextension-polyfill` are purely used for type checking, they aren't required
by `esbuild`.

`manifest.json` links to the compiled build made by `esbuild.config.js`, not the
TS file. In a similar fashion, `options.html` links to the build not the TSX
files, so make sure they are built before you build the extension package.

## Credits

- Icon created by [apien on Flaticon](https://www.flaticon.com/free-icon/exclamation-mark_4194667)
- [DuckDuckGo bangs](https://duckduckgo.com/bang)
- [!Bang Quick Search](https://addons.mozilla.org/en-US/firefox/addon/bang-quick-search/)
