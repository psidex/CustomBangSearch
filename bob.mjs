/*
 * bob (the builder) .mjs
 *
 * Conditionally compiles the extension for either Chrome or Firefox.
 *
 * Required to deal with the fact that I want to build Chromium and Firefox versions,
 * but their respective APIs are becoming increasingly divergent, especially with the
 * move to manifest V3.
 *
 * Outputs the built extension files to ./build, and then optionally zips the build
 * files and/or the source code and places said zips in the current directory, named
 * with the version and browser.
 *
 */

/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

import { parseArgs } from "node:util";
import assert from "node:assert";

import { execa } from "execa";
import { Listr } from "listr2";
import fs from "fs-extra";
import * as esbuild from "esbuild";

const manifestShared = JSON.parse(
	fs.readFileSync("./manifest.shared.json", "utf8"),
);
const manifestChrome = JSON.parse(
	fs.readFileSync("./manifest.chrome.json", "utf8"),
);
const manifestFirefox = JSON.parse(
	fs.readFileSync("./manifest.firefox.json", "utf8"),
);
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const extensionVersion = packageJson.version;
assert(
	extensionVersion === manifestShared.version,
	"package.json and manifest.shared versions match",
);

// FIXME: Probably use path library instead of string manipulation?

// Files and directories to copy to the build directory.
const buildFiles = [
	"./images",
	"./src/optionsui/options.css",
	"./src/optionsui/options.html",
	"./src/popup/popup.css",
	"./src/popup/popup.html",
	"./package.json",
	"./README.md",
	"./LICENSE",
];

// Source files & dirs, specifically for a reviewer.
const sourceFiles = [
	"./docs",
	"./images",
	"./src",
	"./bob.mjs",
	"./LICENSE",
	"./manifest.chrome.json",
	"./manifest.firefox.json",
	"./manifest.shared.json",
	"./package.json",
	"./README.md",
	"./tsconfig.json",
];

const buildPath = "./build";

const {
	values: { browser, dev, buildzip, sourcezip },
} = parseArgs({
	strict: true,
	options: {
		// chrome or firefox
		browser: {
			type: "string",
			short: "b",
		},
		// dev mode = set dev=true in code, also don't minify, skip linting, etc.
		dev: {
			type: "boolean",
			short: "d",
			default: false,
		},
		// outputs build zip ready for submission
		buildzip: {
			type: "boolean",
			short: "z",
			default: false,
		},
		// outputs source zip
		sourcezip: {
			type: "boolean",
			short: "s",
			default: false,
		},
	},
});
assert(browser === "chrome" || browser === "firefox", "browser is valid");

if (dev) {
	console.log(
		`🔨 Building for ${browser} (dev enabled, skipping some steps...)`,
	);
} else {
	console.log(`🔨 Building for ${browser}`);
}

const tasks = new Listr([
	{
		title: "Check build requirements",
		task: () =>
			new Listr(
				[
					{
						title: "7zip",
						task: () => execa("7z", ["i"]),
					},
					{
						title: "git",
						task: () => execa("git", ["--version"]),
					},
				],
				{ concurrent: true },
			),
	},
	{
		title: "Run lint",
		skip: () => dev,
		task: () => execa("npm", ["run", "lint"]),
	},
	{
		title: "Run tsc -noEmit",
		skip: () => dev,
		task: () => execa("npm", ["run", "tsc-noemit"]),
	},
	{
		title: "Setup build directory",
		task: () =>
			new Listr([
				{
					title: "rm",
					skip: async () => !(await fs.existsSync(buildPath)),
					task: () => fs.rm(buildPath, { recursive: true }),
				},
				{
					title: "mkdir",
					task: () => fs.mkdir(buildPath),
				},
			]),
	},
	{
		title: "Get Git info",
		task: async (ctx) => {
			const { stdout } = await execa("git", ["rev-parse", "HEAD"]);
			ctx.gitHeadShortHash = stdout.slice(0, 7);
		},
	},
	{
		// Do this before running esbuild so we can insert the correct host URLs.
		title: "Merge manifests",
		task: (ctx) => {
			ctx.manifest = browser === "chrome" ? manifestChrome : manifestFirefox;

			// Object merge isn't deep, so manually merge permission stuff.
			const mergedPermissions = [
				...manifestShared.permissions,
				...ctx.manifest.permissions,
			];

			// Overwrite shared settings with browser based values.
			ctx.manifest = {
				...manifestShared,
				...ctx.manifest,
			};

			ctx.manifest.permissions = mergedPermissions;
		},
	},
	{
		title: "Convert host permissions to URLs",
		task: (ctx) => {
			// This is something ChatGPT came up with!
			// This description may not be 100% accurate:
			// ^\*?:?\/\/ Matches the beginning of the URL (including an optional protocol).
			// (?:\*\.)? Matches an optional *. subdomain wildcard.
			// ([^/]+) Captures the hostname; any sequence of characters that is not a forward slash.
			// (?:\/|$) Matches the end of the URL (either a forward slash or the end of the string).
			ctx.hostPermissionUrls = ctx.manifest.host_permissions.map(
				(permission) => {
					const match = permission.match(/^\*?:?\/\/(?:\*\.)?([^/]+)(?:\/|$)/);
					return match ? match[1] : null;
				},
			);
		},
	},
	{
		title: "Run esbuild",
		task: (ctx) => {
			const scriptPaths = [
				"./src/background/main.ts",
				"./src/optionsui/options.tsx",
				"./src/popup/popup.tsx",
			];
			const opts = {
				entryPoints: scriptPaths,
				outdir: `${buildPath}/src`,
				bundle: true,
				logLevel: "error",
				platform: "browser",
				define: {
					"process.env.browser": `'${browser}'`,
					"process.env.dev": `${dev}`,
					"process.env.version": `'${extensionVersion}'`,
					"process.env.hash": `'${ctx.gitHeadShortHash}'`,
					"process.env.buildTime": JSON.stringify(new Date()),
					"process.env.hostPermissions": JSON.stringify(
						ctx.manifest.host_permissions,
					),
					"process.env.hostPermissionUrls": JSON.stringify(
						ctx.hostPermissionUrls,
					),
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
		title: "Copy static files",
		task: async () => {
			const copies = [];
			for (const path of buildFiles) {
				copies.push(fs.copy(path, path.replace("./", `${buildPath}/`)));
			}
			return Promise.all(copies);
		},
	},
	{
		title: "Write manifest",
		task: (ctx) => {
			const manifestString = JSON.stringify(ctx.manifest, null, 2);
			return fs.writeFile(`${buildPath}/manifest.json`, manifestString);
		},
	},
	{
		title: "Create build zip file",
		skip: () => !buildzip,
		task: (ctx) => {
			const zipName = `custombangsearch-${browser}-${extensionVersion}-${ctx.gitHeadShortHash}.zip`;
			return execa("7z", ["a", `-tzip ${zipName}`, `${buildPath}/*`], {
				shell: true,
			});
		},
	},
	{
		title: "Create source zip file",
		skip: () => !sourcezip,
		task: (ctx) => {
			const zipName = `custombangsearch-${browser}-${extensionVersion}-${ctx.gitHeadShortHash}-source.zip`;
			return execa(
				"7z",
				["a", `-tzip ${zipName}`, `${sourceFiles.join(" ")}`],
				{ shell: true },
			);
		},
	},
]);

tasks.run().catch((err) => {
	console.error(err);
});
