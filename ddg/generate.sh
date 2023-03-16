#!/bin/bash

# List all, sorted, with the usage count in the object:
# cat ./ddg.json \
#   | jq -s '.[] | sort_by(.r) | reverse | [ .[] | {bang: .t, usage: .r, urls: [ .u ] } ]' \
#   | sed -r 's/\{\{\{s\}\}\}/\%s/g' \
#   > ddg-sorted.json

function writeTopNBangs() {
  local count=$1
  cat ./ddg.json |
    jq -s ".[] | sort_by(.r) | reverse | .[:$count] | { version: 3, bangs: [ .[] | {bang: .t, urls: [ .u ] } ] }" |
    sed -r 's/\{\{\{s\}\}\}/\%s/g' \
      >ddg-top-"$count".json
}

# Quota is usually 8192 bytes.
writeTopNBangs 10  #  595 bytes ( 7.3% of quota)
writeTopNBangs 25  # 1317 bytes (16.1% of quota)
writeTopNBangs 50  # 2315 bytes (28.3% of quota)
writeTopNBangs 100 # 4027 bytes (49.2% of quota)
writeTopNBangs 150 # 5636 bytes (68.8% of quota)
writeTopNBangs 200 # 7498 bytes (91.5% of quota)
writeTopNBangs 220 # 8140 bytes (99.4% of quota)
