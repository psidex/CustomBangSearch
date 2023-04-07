# DuckDuckGo Bangs

## Ready To Use

This directory contains these files, extracted from DuckDuckGo's bang list, which you can download and then import into your custombangsearch settings:

file | rough storage quota usage (8192 bytes)
---|---
[ddg-top-10.json](./ddg-top-10.json) | 595 bytes (~7.3%)
[ddg-top-25.json](./ddg-top-25.json) | 1317 bytes (~16.1%)
[ddg-top-50.json](./ddg-top-50.json) | 2315 bytes (~28.3%)
[ddg-top-100.json](./ddg-top-100.json) | 4027 bytes (~49.2%)
[ddg-top-150.json](./ddg-top-150.json) | 5636 bytes (~68.8%)
[ddg-top-200.json](./ddg-top-200.json) | 7498 bytes (~91.5%)
[ddg-top-220.json](./ddg-top-220.json) | 8140 bytes (~99.4%)

The actual amount of storage used will vary depending on your other bangs, as a compression algorithm is used to make the data as small as possible.

## Create Your Own

Also in this directory exists `get.sh` which will download all of the DDG bangs to a single json file.

The `generate.sh` script was used to generate the above files, feel free to copy and edit it to do what you want!
