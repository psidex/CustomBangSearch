const esbuild = require('esbuild');

if (process.argv.includes('-o')) {
  esbuild.build({
    entryPoints: ['./options/options.tsx'],
    outfile: './options/build.js',
    bundle: true,
    minify: true,
    logLevel: 'info',
    platform: 'browser',
  }).catch(() => process.exit(1));
}

if (process.argv.includes('-m')) {
  esbuild.build({
    entryPoints: ['./main.ts'],
    outfile: './main_build.js',
    bundle: true,
    minify: true,
    logLevel: 'info',
    platform: 'browser',
  }).catch(() => process.exit(1));
}
