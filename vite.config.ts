import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.ts'],
          browser: {
            enabled: true,
            provider: playwright({
              launchOptions: {
                args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
              },
            }),
            instances: [{ browser: 'chromium', headless: true }],
          },
        },
      },
      {
        test: {
          name: 'node',
          include: ['src/**/*.test.ts'],
          exclude: ['src/**/*.browser.test.ts'],
        },
      },
    ],
  },
})
