/* eslint-disable prefer-destructuring */
// We have to not destructure so esbuild can inline constants correctly.

export const dev = <boolean> <unknown> process.env.dev;
export const currentBrowser = <string> process.env.browser;
export const version = <string> process.env.version;
export const hash = <string> process.env.hash;
export const searchEngineUrls = <string[]> <unknown> process.env.searchEngineUrls;
export const buildTime = <string> process.env.buildTime;
