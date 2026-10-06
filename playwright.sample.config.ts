import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config.ts';

// Run of the scored scenarios that produces the committed sample report. Traces stay off here:
// they weigh 50 to 60 MB per test on this site. Add `--trace on` to a local run to get them.
export default defineConfig({
  ...baseConfig,
  testDir: './tests/specs',
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'reports/sample-run', open: 'never' }]],
  use: { ...baseConfig.use, trace: 'off' },
  // Must live outside the HTML report folder, which the reporter clears. Ignored by Git.
  outputDir: 'test-results/sample',
});
