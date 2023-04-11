# Supported Search Engines

If you want a search engine added, please [raise an issue](template).

Feel free to submit a PR if you want to add one yourself, or if you have fixed a broken engine.

Symbol | Meaning
---|---
✅ | Fully working
🟡 | Working with some problems
❌ | Does not work - currently unsupported

## Chrome & Firefox

Search Engine | Supported | Notes
---|---|---
google.com | ✅ |
bing.com | ✅ |
duckduckgo.com | ✅ |
search.brave.com | ✅ |
metager.org | ✅ |
mojeek.com | ✅ |
searx.tiekoetter.com | ✅ |
startpage.com | ✅ |
ecosia.org | ✅ |
searx.be | ✅ |
qwant.com | ❌ | Because it GETs https://api.qwant.com/v3/search/web?q= in the background, not in `main_frame`. Even if we did catch it, redirecting that doesn't redirect the actual page the user is loading.
