# CU Bus Native App

## Install

```bash
npm install
```

## Run

```bash
npm run start
npm run web
npm run ios
npm run android
```

## Build For Web

```bash
npm run build:web
```

## Test Layers

```bash
npm run test
npm run test:unit
npm run test:shared-core
npm run test:e2e:web
npm run test:e2e:android
npm run test:e2e:ios
```

Notes:

- `test:unit` keeps the current Jest screen/component coverage.
- `test:shared-core` runs the lightweight Vitest suite for `src/shared-core/**/*.test.ts`.
- `test:e2e:web` runs Playwright smoke checks against Expo Web.
- Native E2E uses Appium plus WebdriverIO and expects a built or installed app:
  - Android env: `E2E_ANDROID_APP_PATH` or installed package `com.cubus.app`
  - iOS env: `E2E_IOS_APP_PATH` or installed bundle id `com.cubus.app`
- Native test mode is enabled at build/start time with `EXPO_PUBLIC_E2E_MODE=1`.
- Optional seeded scenarios:
  - `EXPO_PUBLIC_E2E_SCENARIO=default`
  - `EXPO_PUBLIC_E2E_SCENARIO=route-search`
  - `EXPO_PUBLIC_E2E_SCENARIO=permit-saved`

## Native Release Builds

Local native release builds keep Sentry upload enabled.

Before running any of these commands, export `SENTRY_AUTH_TOKEN` in the same shell:

```bash
export SENTRY_AUTH_TOKEN=your_token_here
```

Build commands:

```bash
npm run mobile:build:apk
npm run mobile:build:aab
npm run mobile:build:ios-archive
npm run mobile:build:ipa
```

Notes:

- `mobile:build:ios-archive` and `mobile:build:ipa` require Xcode/archive signing to inherit the same shell environment.
- `mobile:build:ipa` expects `mobile/ios/ExportOptions.plist` to exist.

## Notes

- Shared business logic is imported from `../src/shared-core`.
- API base URL defaults to `https://cu-bus.online/api/v1/functions`.
- Override it with `EXPO_PUBLIC_BASE_URL` when testing against another backend.
- Sentry is enabled by default in `mobile/src/lib/sentry.ts`.
- Override the DSN with `EXPO_PUBLIC_SENTRY_DSN` if needed.
- The web target uses Expo Router plus React Native Web, so most `mobile/src` UI can be shared directly across iOS, Android, and browser.
