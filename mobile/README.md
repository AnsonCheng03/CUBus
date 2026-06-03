# CU Bus Native App

## Install

```bash
npm install
```

## Run

```bash
npm run start
npm run ios
npm run android
```

## Notes

- Shared business logic is imported from `../src/shared-core`.
- API base URL defaults to `https://cu-bus.online/api/v1/functions`.
- Override it with `EXPO_PUBLIC_BASE_URL` when testing against another backend.
- Optional Sentry setup uses `EXPO_PUBLIC_SENTRY_DSN`.
