import {splitVendorChunkPlugin, defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    sourcemap: true,
    minify: false,
  },
  plugins: [
    splitVendorChunkPlugin(),
    react({
      babel: {
        plugins: ['babel-plugin-macros', 'babel-plugin-relay'],
      },
    }),
  ],
});
