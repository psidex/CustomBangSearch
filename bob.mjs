/*
* bob (the builder) .mjs
*
* Conditionally compiles the extension for either Chrome or Firefox.
*
* Required to deal with the fact that I want to build Chromium and Firefox versions,
* but their respective APIs are becoming increasingly divergent, especially with the
* move to manifest V3.
*
* Outputs the built extension files to ./build, and then zips this and places the zip
* in the current directory, named with the version and browser.
*
*/

/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

import { parseArgs } from 'node:util';
import { execSync } from 'node:child_process';
import assert from 'node:assert';

import fs from 'fs-extra';
import * as esbuild from 'esbuild';

const manifestShared = JSON.parse(fs.readFileSync('./manifest.shared.json', 'utf8'));
const manifestChrome = JSON.parse(fs.readFileSync('./manifest.chrome.json', 'utf8'));
const manifestFirefox = JSON.parse(fs.readFileSync('./manifest.firefox.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const extensionVersion = packageJson.version;
assert(extensionVersion === manifestShared.version, 'package.json and manifest.shared versions match');

// Files and directories to copy to the build directory.
// TODO: All paths should use path library instead of string manipulation.
const toCopy = [
  './images',
  './src/optionsui/options.css',
  './src/optionsui/options.html',
  './src/popup/popup.css',
  './src/popup/popup.html',
  './package.json',
  './README.md',
  './LICENSE',
];

const buildPath = './build';

const {
  values: { browser, dev },
} = parseArgs({
  strict: true,
  options: {
    browser: {
      type: 'string',
      short: 'b',
    },
    dev: {
      type: 'boolean',
      short: 'd',
      default: false,
    },
  },
});
assert(browser === 'chrome' || browser === 'firefox', 'browser is valid');

function runOrExit(cmd, silent = false) {
  let out;
  try {
    out = execSync(cmd).toString().trim();
    if (out !== '' && !silent) {
      console.log(out);
    }
  } catch (err) {
    console.log(err.stdout.toString().trim());
    process.exit(1);
  }
  return out;
}

// Make sure that binary dependencies exist.
runOrExit('7z i', true);
runOrExit('git --version', true);

if (dev) {
  console.log('* Building development version');
} else {
  console.log('* Building release version');
}

console.log('\nRunning typescript lint...');
runOrExit('npm run tsc-lint');

if (!dev) {
  console.log('\nRunning tests...');
  // runOrExit('npm run test');
}

console.log('\nMaking build directory...');
if (fs.existsSync(buildPath)) {
  console.log('Deleting previous build...');
  fs.rmSync(buildPath, { recursive: true });
}
fs.mkdirSync(buildPath);

console.log('\nGetting git hash...');
const gitHeadShortHash = runOrExit('git rev-parse HEAD').slice(0, 7);

console.log('\nMerging manifests...');
// Do this merge before running esbuild so we can insert the correct URLs.
let manifest = browser === 'chrome' ? manifestChrome : manifestFirefox;

// Object merge isn't deep, so manually merge permission stuff.
const mergedHostPermissions = [...manifestShared.host_permissions, ...manifest.host_permissions];
const mergedPermissions = [...manifestShared.permissions, ...manifest.permissions];
// Overwrite shared settings with browser based values.
manifest = {
  ...manifestShared,
  ...manifest,
};
manifest.host_permissions = mergedHostPermissions;
manifest.permissions = mergedPermissions;

const scriptPaths = ['./src/background/main.ts', './src/optionsui/options.tsx', './src/popup/popup.tsx'];
const opts = {
  entryPoints: scriptPaths,
  outdir: `${buildPath}/src`,
  bundle: true,
  logLevel: 'info',
  platform: 'browser',
  define: {
    'process.env.browser': `'${browser}'`,
    'process.env.dev': `'${dev}'`,
    'process.env.version': `'${extensionVersion}'`,
    'process.env.hash': `'${gitHeadShortHash}'`,
    'process.env.searchEngineUrls': JSON.stringify(mergedHostPermissions),
    'process.env.buildTime': JSON.stringify(new Date()),
  },
};

let additions = {};
if (!dev) {
  additions = {
    minify: true,
  };
}

console.log('\nRunning esbuild...');
esbuild.buildSync({
  ...opts,
  ...additions,
});

console.log('\nCopying static files...');
for (const path of toCopy) {
  console.log(`  ${path}`);
  fs.copySync(path, path.replace('./', `${buildPath}/`));
}

console.log('\nWriting manifest...');
const manifestString = JSON.stringify(manifest, null, 2);
fs.writeFileSync(`${buildPath}/manifest.json`, manifestString);

// TODO: If release, zip file for the reviewer that contains all source and build script, etc.
//       Maybe only make below zip on release? or have a flag for it?

const zipName = `custombangsearch-${browser}-${extensionVersion}-${gitHeadShortHash}.zip`;
console.log('\nZipping files...');
runOrExit(`7z a -tzip ${zipName} ${buildPath}/*`);

console.log('\nDone!');
