/* eslint-disable prefer-destructuring */
// We have to not destructure so esbuild can inline constants correctly.

export const dev = process.env.dev as unknown as boolean;
export const currentBrowser = process.env.browser as string;
export const version = process.env.version as string;
export const hash = process.env.hash as string;
export const buildTime = process.env.buildTime as string;

// In the matcher format, e.g. *://www.google.com/*
export const hostPermissions = process.env.hostPermissions as unknown as string[];
// In URL format, e.g. www.google.com
export const hostPermissionUrls = process.env.hostPermissionUrls as unknown as string[];
