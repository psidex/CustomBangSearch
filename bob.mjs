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
import assert from 'node:assert';

import { execa } from 'execa';
import { Listr } from 'listr2';
import fs from 'fs-extra';
import * as esbuild from 'esbuild';

const manifestShared = JSON.parse(fs.readFileSync('./manifest.shared.json', 'utf8'));
const manifestChrome = JSON.parse(fs.readFileSync('./manifest.chrome.json', 'utf8'));
const manifestFirefox = JSON.parse(fs.readFileSync('./manifest.firefox.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const extensionVersion = packageJson.version;
assert(extensionVersion === manifestShared.version, 'package.json and manifest.shared versions match');

// FIXME: Probably use path library instead of string manipulation?

// Files and directories to copy to the build directory.
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

// Files & dirs for a reviewer.
const sourceFilesForReview = [
  './docs',
  './images',
  './src',
  './bob.mjs',
  './LICENSE',
  './manifest.chrome.json',
  './manifest.firefox.json',
  './manifest.shared.json',
  './package.json',
  './README.md',
  'tsconfig.json',
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

if (dev) {
  console.log('🔨 Building development version, skipping some steps...');
} else {
  console.log('🔨 Building release version');
}
console.log();

const tasks = new Listr([
  {
    title: 'Check build requirements',
    task: () => new Listr([
      {
        title: '7zip',
        task: () => execa('7z', ['i']),
      },
      {
        title: 'git',
        task: () => execa('git', ['--version']),
      },
    ], { concurrent: true }),
  },
  {
    title: 'Run lint',
    skip: () => dev,
    task: () => execa('npm', ['run', 'lint']),
  },
  {
    title: 'Run tsc-lint',
    skip: () => dev,
    task: () => execa('npm', ['run', 'tsc-lint']),
  },
  {
    title: 'Run tests',
    skip: () => true, // TODO: Testing!
    task: () => execa('npm', ['run', 'test']),
  },
  {
    title: 'Setup build directory',
    task: () => new Listr([
      {
        title: 'rm',
        skip: async () => !await fs.existsSync(buildPath),
        task: () => fs.rm(buildPath, { recursive: true }),
      },
      {
        title: 'mkdir',
        task: () => fs.mkdir(buildPath),
      },
    ]),
  },
  {
    title: 'Get Git info',
    task: async (ctx) => {
      const { stdout } = await execa('git', ['rev-parse', 'HEAD']);
      ctx.gitHeadShortHash = stdout.slice(0, 7);
    },
  },
  {
    title: 'Merge manifests',
    task: (ctx) => {
      // Do this merge before running esbuild so we can insert the correct URLs.
      ctx.manifest = browser === 'chrome' ? manifestChrome : manifestFirefox;

      // Object merge isn't deep, so manually merge permission stuff.
      ctx.mergedHostPermissions = [
        ...manifestShared.host_permissions, ...ctx.manifest.host_permissions];
      const mergedPermissions = [...manifestShared.permissions, ...ctx.manifest.permissions];
      // Overwrite shared settings with browser based values.
      ctx.manifest = {
        ...manifestShared,
        ...ctx.manifest,
      };
      ctx.manifest.host_permissions = ctx.mergedHostPermissions;
      ctx.manifest.permissions = mergedPermissions;
    },
  },
  {
    title: 'Convert host permissions to URLs',
    task: (ctx) => {
      // This is something ChatGPT came up with!
      // This description may not be 100% accurate:
      // ^\*?:?\/\/ Matches the beginning of the URL (including an optional protocol).
      // (?:\*\.)? Matches an optional *. subdomain wildcard.
      // ([^/]+) Captures the hostname; any sequence of characters that is not a forward slash.
      // (?:\/|$) Matches the end of the URL (either a forward slash or the end of the string).
      ctx.hostPermissionUrls = ctx.manifest.host_permissions.map((permission) => {
        const match = permission.match(/^\*?:?\/\/(?:\*\.)?([^/]+)(?:\/|$)/);
        return match ? match[1] : null;
      });
    },
  },
  {
    title: 'Run esbuild',
    task: (ctx) => {
      const scriptPaths = ['./src/background/main.ts', './src/optionsui/options.tsx', './src/popup/popup.tsx'];
      const opts = {
        entryPoints: scriptPaths,
        outdir: `${buildPath}/src`,
        bundle: true,
        logLevel: 'error',
        platform: 'browser',
        define: {
          'process.env.browser': `'${browser}'`,
          'process.env.dev': `'${dev}'`,
          'process.env.version': `'${extensionVersion}'`,
          'process.env.hash': `'${ctx.gitHeadShortHash}'`,
          'process.env.buildTime': JSON.stringify(new Date()),
          'process.env.hostPermissions': JSON.stringify(ctx.mergedHostPermissions),
          'process.env.hostPermissionUrls': JSON.stringify(ctx.hostPermissionUrls),
        },
      };

      let additions = {};
      if (!dev) {
        additions = {
          minify: true,
        };
      }

      return esbuild.build({
        ...opts,
        ...additions,
      });
    },
  },
  {
    title: 'Copy static files',
    task: async () => {
      const copies = [];
      for (const path of toCopy) {
        copies.push(fs.copy(path, path.replace('./', `${buildPath}/`)));
      }
      return Promise.all(copies);
    },
  },
  {
    title: 'Write manifest',
    task: (ctx) => {
      const manifestString = JSON.stringify(ctx.manifest, null, 2);
      return fs.writeFile(`${buildPath}/manifest.json`, manifestString);
    },
  },
  {
    title: 'Create zip file',
    skip: () => dev,
    task: (ctx) => {
      const zipName = `custombangsearch-${browser}-${extensionVersion}-${ctx.gitHeadShortHash}.zip`;
      return execa('7z', ['a', `-tzip ${zipName}`, `${buildPath}/*`], { shell: true });
    },
  },
  {
    title: 'Create source zip file for review',
    skip: () => dev,
    task: (ctx) => {
      const zipName = `custombangsearch-${browser}-${extensionVersion}-${ctx.gitHeadShortHash}-source.zip`;
      return execa('7z', ['a', `-tzip ${zipName}`, `${sourceFilesForReview.join(' ')}`], { shell: true });
    },
  },
]);

tasks.run().catch((err) => {
  console.error(err);
});
