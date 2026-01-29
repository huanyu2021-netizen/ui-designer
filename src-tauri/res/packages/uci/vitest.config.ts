import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';
import path from 'path';

const config = mergeConfig(baseConfig, defineConfig({
  test: {
    // 其他 test 配置
  }
}));

// 手动覆盖（防止 mergeConfig 合并数组）
config.test.setupFiles = [path.resolve(__dirname, '../../vitest.setup.ts')];

export default config;