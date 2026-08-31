# CU Bus App Store Listing

Prepared for the CU Bus native iOS release. Replace the bracketed owner details before publishing.

## App Information

| Field | Recommended value |
| --- | --- |
| App name | `CU Bus` |
| Bundle ID | `com.cubus.app` |
| Version | `1.0.11` |
| Primary category | `Travel` |
| Secondary category | `Navigation` (optional) |
| Price | `Free` |
| Age rating | `4+`, if the questionnaire answers remain free of objectionable content |
| Copyright | `© 2026 Anson Cheng` or the account owner's legal copyright name |
| Primary language | `English` |
| Additional localization | `Chinese (Traditional)` |

The app name, subtitle, promotional text, description, and keywords should be entered as separate English and Traditional Chinese localizations in App Store Connect.

## English (U.S.)

### Name

```text
CU Bus
```

### Subtitle

```text
CUHK bus routes, stops & times
```

### Promotional Text

```text
Plan trips across CUHK with route search, nearby stops, live bus information and clear route maps.
```

### Description

```text
CU Bus is an independent companion for navigating school bus services at The Chinese University of Hong Kong (CUHK).

Find your way across campus:

- Search from building to building or stop to stop.
- Compare available school bus routes and transfer options.
- Check scheduled departure times, estimated journey times, and waiting times.
- View live service information and bus locations when data is available.
- Use your location to find a nearby bus stop.
- Open a route map and follow the journey stop by stop.
- Save a personal permit card for quick reference.
- Switch between English and Traditional Chinese.

The permit card is a creative, unofficial display. It is not issued, endorsed, or accepted by CUHK and cannot be used as a boarding pass, identity document, or proof of permission. Check official CUHK notices and show the required official identification when boarding.

Bus times, service status, estimates, and community-reported information may change. Do not rely on the app alone for urgent travel decisions. Network access is required for the latest data; cached information may be available when connectivity is limited.

CU Bus is not affiliated with or endorsed by The Chinese University of Hong Kong.
```

### Keywords

```text
CUHK,bus,school bus,route,shuttle,station,timetable,campus,transit
```

### What's New

```text
Improved stability and refreshed the CU Bus experience, including route search, nearby stops, live information, route maps, and permit display.
```

## Traditional Chinese

### 名稱

```text
CU Bus
```

### 副標題

```text
中大校巴路線、站點及時間
```

### 宣傳文字

```text
在中大校園搜尋路線、查看附近車站及校巴即時資訊。
```

### 描述

```text
CU Bus 是一個由獨立開發者製作、協助查閱香港中文大學（中大）校巴資訊的應用程式。

輕鬆規劃校園行程：

- 搜尋建築物之間或車站之間的路線。
- 比較可用的校巴路線及轉車方案。
- 查看預定開出時間、預計車程及等候時間。
- 在有相關數據時查看校巴即時服務資訊及位置。
- 使用目前位置尋找附近的校巴站。
- 開啟路線圖，逐站查看行程。
- 儲存個人化校巴證卡片以便快速查閱。
- 支援繁體中文及英文切換。

校巴證卡片只是創作及非官方的顯示內容，並非由中大發出、認可或接受，不能用作乘車證、身份證明或乘車資格證明。乘搭校巴時，請以中大官方公告為準，並出示所需的正式身份證明文件。

校巴時間、服務狀態、預計時間及學生回報的資訊可能會變更。遇到緊急行程時，請勿單獨依賴本應用程式。取得最新資訊需要網絡連線；網絡不穩定時可能仍可查看已快取的資料。

CU Bus 與香港中文大學沒有附屬、代表或獲其認可的關係。
```

### 關鍵字

```text
香港中文大學,校巴路線,校巴車站,校巴時間表,校園交通,轉堂校巴,穿梭校巴
```

### 更新內容

```text
改善穩定性，並更新路線搜尋、附近車站、即時資訊、路線圖及校巴證顯示功能。
```

## URLs

| App Store field | Value or action |
| --- | --- |
| Marketing URL | `https://cu-bus.online/` |
| Privacy Policy URL | `https://cu-bus.online/pages/privacy/` |
| Support URL | Create a public support page first, for example `https://cu-bus.online/pages/support/` |

The current privacy page describes the website, cookies, ads, IP logs, and web input. Before submission, update it to also describe the native app's foreground location use, locally stored permit fields, route and realtime event logs, and Sentry diagnostics. Do not use a placeholder support URL in App Store Connect. The support page must contain a real contact method, such as `[SUPPORT_EMAIL]`, plus the existing problem-report form if desired.

## App Review Notes

```text
No account or login is required.

The app has four main areas:

1. Realtime: choose a CUHK bus stop to view current service information. Pull down to refresh, and tap a bus row to view its stop-by-stop route.
2. Route Search: select an origin and destination from the suggestions, then review route, transfer, waiting-time, and journey information. Tap a result to open its route map.
3. Permit: enter fictional sample details, such as "App Reviewer", "1234567890", "TEST", and "06/2026", then tap Save to view the two permit-card layouts. These cards are deliberately unofficial creative displays and cannot be used for boarding or identification.
4. Settings: switch language, change route-search preferences, refresh or clear local data, and open the campus bus map.

Foreground location permission is requested only when the user uses nearby-stop or locate controls. Location is not used for background tracking. The app can be tested without granting location permission by selecting stops manually.

The app requires network access for the latest timetable and realtime data. No test account or password is needed.
```

## Screenshot Plan

Use fictional permit details only. Do not show a real student's name, SID, or other personal information in screenshots.

1. Realtime screen: `Live CUHK bus information at the stop you choose.`
2. Route search screen: `Plan a trip between CUHK buildings and bus stops.`
3. Route map sheet: `Follow every stop on the selected bus route.`
4. Nearby-stop selection: `Find the nearest bus stop when you need it.`
5. Permit screen: `Keep an unofficial permit reference card on your phone.`

The final screenshot set should show the current native UI, not old web/PWA screens. If iPad support is enabled in the submitted build, provide a separately tested iPad screenshot set as well.

## App Privacy Checklist

This is a conservative starting point based on the current source. Confirm it against the production Sentry project, backend retention policy, and the exact build before publishing the answers.

### Likely data to review

- `Location`: Precise Location may be used for app functionality when the user asks for the nearest stop. The coordinates are used locally to resolve a nearby station; confirm that no location is sent through diagnostics before marking it as not collected.
- `Contact Info > Name`: The permit form asks for a name and stores it locally for the permit-card display. If the value never leaves the device, confirm whether it qualifies for Apple's on-device-only exception.
- `Search History`: Route searches send origin, destination, departure preference, language, and time to the service for usage analysis and service planning.
- `Usage Data`: Realtime station selections and route-search activity are logged by the service. Declare Product Interaction or Other Usage Data if retained.
- `Diagnostics`: The native app initializes Sentry for crash, performance, and diagnostic reporting. Review the Sentry data settings and declare the relevant diagnostic types.

### Do not copy blindly from the old listing

The existing listing includes advertising data, but the native app source does not include a native advertising SDK. Remove that declaration unless advertising data is actually collected by the submitted native build or by a web experience included in the app. Also verify whether the old location and contact-info declarations still match this release.

### Privacy policy draft points

The public policy should explain, in plain language:

- No account or login is required.
- Foreground location is requested only for nearby-stop lookup and is not used for background tracking.
- Permit name, SID, major, and expiry are stored locally to render the user's permit card and can be removed with Clear Local Data.
- Route-search and realtime selections may be sent to the service with language and timestamps to improve service planning and usage statistics.
- Sentry may receive crash, performance, and technical diagnostic data.
- The app does not sell user data.
- How users can ask questions or request deletion of server-side logs, using the support contact shown on the support page.

Have the owner review this wording and the retention periods before publishing it as a legal privacy policy.

## Submission Checklist

- Upload a new archive built with the supported released Xcode and iOS SDK, not the older beta-built or unsigned validation archive.
- Select the correct `com.cubus.app` App Store Connect record and increment the build number.
- Upload the archive through Organizer > Distribute App > App Store Connect > Upload.
- Confirm the uploaded build's version and build number in App Store Connect before selecting it for the release.
- Complete screenshots, age rating, export compliance, content rights, and app privacy.
- Test the production build with location denied, location allowed, no network, and a fresh install.
- Confirm the support URL and privacy URL load in Safari without login.
- Replace `[SUPPORT_EMAIL]`, the copyright placeholder if needed, and any other bracketed values.

## Sources

- Apple App Information: https://developer.apple.com/help/app-store-connect/reference/app-information/app-information
- Apple Platform Version Information: https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information
- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
