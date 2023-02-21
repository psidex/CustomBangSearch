/* eslint-disable prefer-destructuring */
// We have to not destructure so esbuild can inline constants correctly.

export const dev = process.env.dev as unknown as boolean;
export const currentBrowser = process.env.browser as string;
export const version = process.env.version as string;
export const hash = process.env.hash as string;
export const searchEngineUrls = process.env.searchEngineUrls as unknown as string[];
export const buildTime = process.env.buildTime as string;

// TODO: add this to esbuild setup, maybe change name, then use!
// export const hostsWatched = process.env.hostsWatched as unknown as string[];
