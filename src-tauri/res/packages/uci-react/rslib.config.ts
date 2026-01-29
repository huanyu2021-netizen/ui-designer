import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: ['./src/index.tsx'],
    },
  },
  lib: [
    {
      format: 'esm',
      output: {
        target: 'web',
        sourceMap: true,
        injectStyles: true
      },
      dts: true,
    },
  ],
  plugins: [
    pluginReact(),
    pluginLess(),
  ],
});