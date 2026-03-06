import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
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
})
