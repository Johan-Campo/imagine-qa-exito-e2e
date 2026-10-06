import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config.ts';

export default defineConfig({
  ...baseConfig,
  testDir: './tests/specs',
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'reports/sample-run', open: 'never' }]],
  use: { ...baseConfig.use, trace: 'off' },
  outputDir: 'test-results/sample',
});
