# Custom Bang Search

TODO: Update this README. TODO: Close Issue and add to README / help about using
" :: " to sep multi urls

TODO: In packagejson make each tsc -noEmit call specific to thing built, not
just everything

TODO: Does web-ext build add defaults.json and other surplus files to the zip?

[![add-on version](https://img.shields.io/amo/v/custombangsearch?colorA=35383d)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)
[![add-on users](https://img.shields.io/amo/users/custombangsearch?colorA=35383d)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)
[![buymeacoffee donate link](https://img.shields.io/badge/Donate-Beer-FFDD00.svg?style=flat&colorA=35383d)](https://www.buymeacoffee.com/psidex)

[Install from the add-on page](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)

A Firefox add-on that allows you to use custom bangs (e.g. !a for searching
Amazon) inside the search bar

[Demo video](https://youtu.be/q41XyWYLEUM)

Currently only works if you have Google, Bing, DuckDuckGo, or Qwant set as your
browsers search engine.

## Options page

_The Amazon, Ebay, and Etsy defaults are UK URLs so change those if you need
to!_

- Go to the extensions options page to change the bangs and where they go
- Click on any cell in the table to edit it; the bang is what goes after the !
  (e.g. !m) and the url is where it takes you
- Use '%s' to show where the search query should be inserted (see the defaults
  for example)
- Cells with no text in will be highlighted red and will be removed upon saving
- No changes will be made unless you click the save button, this includes
  importing and resetting to defaults
- Bangs are case-sensitive, so you can have 'm' and 'M'

## How it works

When you type a query in the search bar, your browser makes a request to your
browsers set search engine. This extension intercepts that request, and if the
query matches a bang (e.g. `!m new york`) it will tell the browser to go the url
set to that bang with the given query, instead of your original search.

This has the side effect of working if you type a bang into the actual search
engine as well.

## Development

```bash
git clone https://github.com/psidex/CustomBangSearch.git
cd CustomBangSearch
yarn install
yarn buildall
# You should now have a directory called "web-ext-artifacts" that contains the built extension
```

### Details

The only things actually required to build this extension from source to
something that is installable in your browser are `react`, `react-dom`,
`nanoid`, and `esbuild`.

`web-ext` is used to generate the extension package but it _can_ be done by
hand.

Everything in `devDependencies` is purely for linting, and `typescript` and
`webextension-polyfill` are purely used for type checking, they aren't required
by `esbuild`.

`manifest.json` links to the compiled build made by `esbuild.config.js`, not the
TS file. In a similar fashion, `options.html` links to the build not the TSX
files, so make sure they are built before you build the extension package.

## Credit

- [DuckDuckGo bangs](https://duckduckgo.com/bang)
- [!Bang Quick Search](https://addons.mozilla.org/en-US/firefox/addon/bang-quick-search/)
- [Water.css](https://github.com/kognise/water.css)
- [Feather Icons](https://github.com/feathericons/feather)
- [W3Schools How To Snackbar / Toast](https://www.w3schools.com/howto/howto_js_snackbar.asp)
