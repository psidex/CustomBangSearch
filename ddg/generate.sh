#!/bin/bash

if ! command -v wget >/dev/null 2>&1; then
  echo "Error: wget is not installed" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is not installed" >&2
  exit 1
fi

set -ex

wget https://duckduckgo.com/bang.js -O ddg.json

function writeTopNBangs() {
  local count=$1
  cat ./ddg.json |
    jq -s ".[] | sort_by(.r) | reverse | .[:$count] | { version: 6, bangs: [ .[] | {keyword: .t, alias: null, defaultUrl: \"\", urls: [ .u ], dontEncodeQuery: false } ] }" |
    sed -r 's/\{\{\{s\}\}\}/\%s/g' \
      >ddg-top-"$count".json
}

writeTopNBangs 10
writeTopNBangs 25
writeTopNBangs 50
writeTopNBangs 100
writeTopNBangs 150
writeTopNBangs 200
writeTopNBangs 250

rm ddg.json

echo -e "\nDone!\n"
