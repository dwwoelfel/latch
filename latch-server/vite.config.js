import {splitVendorChunkPlugin, defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    splitVendorChunkPlugin(),
    react({
      babel: {
        plugins: ['babel-plugin-macros', 'babel-plugin-relay'],
      },
    }),
  ],
});
