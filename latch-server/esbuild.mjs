import {build} from 'esbuild';

build({
  entryPoints: ['src/index.ts'],
  bundle: process.env.NODE_ENV === 'production',
  platform: 'node',
  target: 'node20',
  outfile:
    process.env.NODE_ENV === 'production' ? 'build/index.js' : 'dist/index.js',
  loader: {
    '.node': 'file',
  },
  format: 'cjs',
}).catch(() => process.exit(1));
