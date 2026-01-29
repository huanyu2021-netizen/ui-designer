import { defineConfig } from '@rslib/core';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { getSharedConfig } from '../../rsbuild.config'

export default defineConfig({
  source: {
    entry: {
      index: ['./src/index.ts'],
    }
  },
  lib: [
    {
      format: 'esm',
      output: {
        target: 'web',
        sourceMap: true,
      },
      dts: true,
    },

  ],
  plugins: [
    pluginModuleFederation(
      {
        name: 'uci',
        shared: {
          ...getSharedConfig(),
        },
      },
      {},
    ),
  ],
});
