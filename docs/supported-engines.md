# Supported Search Engines

If you want a search engine added, please [raise an issue](template).

Feel free to submit a PR if you want to add one yourself, or fix a currently broken engine.

Symbol | Meaning
---|---
✅ | Fully working
🟡 | Working with some problems
❌ | Does not work

TODO: Remove broken urls from individual manifests, have way of combining urls when manifests are combined (maybe perms as well?)
TODO: Check if DDG / Brave search bangs overwrite ours, and if they do, add notes

## Chrome

Search Engine | Supported | Notes
---|---|---
google.com | ✅ |
bing.com | ✅ |
duckduckgo.com | ✅ |
qwant.com | ✅ | Weird behaviour if you "go back" to the search results page
startpage.com | ❌ | Searches don't change the URL which this extension uses to detect the query (possibly due to the search happening in a background POST)
ecosia.org | 🟡 | Multi-URL redirects cause duplicate new tabs
search.brave.com | ✅ |
metager.org | ✅ |
mojeek.com | ✅ |
searx.tiekoetter.com | ✅ |
searx.be | ❌ | Same reason as startpage.com

## Firefox

Search Engine | Supported | Notes
---|---|---
google.com | ✅ |
bing.com | ✅ |
duckduckgo.com | ✅ |
qwant.com | ❌ | Because it GETs https://api.qwant.com/v3/search/web?q= in the background, works if you then refresh the page
startpage.com | ✅ |
ecosia.org | ✅ |
search.brave.com | ✅ |
metager.org | ✅ |
mojeek.com | ✅ |
searx.tiekoetter.com | ✅ |
searx.be | ✅ |
