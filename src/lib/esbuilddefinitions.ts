// Flag for development mode, enables debugging features
export const inDev = process.env.dev as unknown as boolean;

// The browser we are building for
export const currentBrowser = process.env.browser as string;
// assert(["chrome", "firefox"].includes(currentBrowser));

// The current version of the extension, should match package & manifest
export const version = process.env.version as string;

// The short hash of the most recent git commit
export const hash = process.env.hash as string;

// TODO: Add git dirty/clean state const

// The time at which this code is compiled
export const buildTime = process.env.buildTime as string;

// The domain name permissions that this extension requires
// In the matcher format, e.g. *://www.google.com/*
export const hostPermissions = process.env
	.hostPermissions as unknown as string[];

// The domain name permissions that this extension requires
// In URL format, e.g. www.google.com
export const hostPermissionUrls = process.env
	.hostPermissionUrls as unknown as string[];
