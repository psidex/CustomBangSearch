# Custom Bang Search

[![Mozilla Add-on](https://img.shields.io/amo/v/custombangsearch)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)
[![Mozilla Add-on](https://img.shields.io/amo/users/custombangsearch)](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)

[Install from the add-on page](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/)

A Firefox add-on that allows you to use custom bangs (e.g. !a for searching Amazon) inside the search bar 

[Demo video](https://youtu.be/q41XyWYLEUM)

Currently only works if you have Google, Bing, or DuckDuckGo set as your browsers search engine.

## Options page

- Go to the extensions options page to change the bangs and where they go
- Click on any cell in the table to edit it; the bang is what goes after the ! (e.g. !m) and the url is where it takes you
- Use '%s' to show where the search query should be inserted (see the defaults for example)
- Cells with no text in will be highlighted red and will be removed upon saving
- No changes will be made unless you click the save button, this includes importing and resetting to defaults
- Bangs are case-sensitive, so you can have 'm' and 'M'

## How it works

When you type a query in the search bar, your browser makes a request to your browsers set search engine. This extension
intercepts that request, and if the query matches a bang (e.g. `!m new york`) it will tell the browser to go the url set
to that bang with the given query, instead of your original search.

This has the side effect of working if you type a bang into the actual search engine as well.

## Credit

- [DuckDuckGo bangs](https://duckduckgo.com/bang)
- [!Bang Quick Search](https://addons.mozilla.org/en-US/firefox/addon/bang-quick-search/)
- [Water.css](https://github.com/kognise/water.css)
- [Feather Icons](https://github.com/feathericons/feather)
- [W3Schools How To Snackbar / Toast](https://www.w3schools.com/howto/howto_js_snackbar.asp)
