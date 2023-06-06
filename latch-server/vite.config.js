import {splitVendorChunkPlugin, defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    sourcemap: true,
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
