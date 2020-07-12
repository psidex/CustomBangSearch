# CustomBangSearch

[Install from the add-on page](https://addons.mozilla.org/en-US/firefox/addon/custombangsearch/) (waiting for approval)

A Firefox add-on that allows you to use custom bangs (e.g. !a for searching Amazon) inside the search bar 

[Demo video](https://youtu.be/q41XyWYLEUM)

Go to the extensions options page to change the bangs and where they go (the query is appended to the given url).

Currently only works if you have Google, Bing, or DuckDuckGo set as your browsers search engine.

## How it works

When you type a query in the search bar, your browser makes a request to your browsers set search engine. This extension
intercepts that request, and if the query matches a bang (e.g. !m new york) it will tell the browser to go the url set
to that bang with the given query.

## Credit

- [duckduckgo bangs](https://duckduckgo.com/bang)
- [bang-quick-search](https://addons.mozilla.org/en-US/firefox/addon/bang-quick-search/)
- Options table css edited from [divtable](https://divtable.com/table-styler/)
