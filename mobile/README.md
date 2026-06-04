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

## Notes

- Shared business logic is imported from `../src/shared-core`.
- API base URL defaults to `https://cu-bus.online/api/v1/functions`.
- Override it with `EXPO_PUBLIC_BASE_URL` when testing against another backend.
- Optional Sentry setup uses `EXPO_PUBLIC_SENTRY_DSN`.
- The web target uses Expo Router plus React Native Web, so most `mobile/src` UI can be shared directly across iOS, Android, and browser.
