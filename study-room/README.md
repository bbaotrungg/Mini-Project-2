# VKU Study Spaces — Mini-Project 2

A small React Native + Expo + TypeScript study-room booking app. Start a student session, find a space, reserve two hours, and open your QR booking pass. No account setup is needed for the classroom demo.

## Run the app

Requirements: Node.js 22.13 or newer and an Expo Go version compatible with SDK 57.

```powershell
cd "E:\Mini Project 2\study-room"
npm.cmd install
npm.cmd start
```

Scan the terminal QR code in Expo Go on a phone connected to the same Wi-Fi. Use `npm.cmd run web` for a browser preview. On Windows, `.cmd` avoids PowerShell's script execution-policy restriction.

The app starts in **local demo mode** without an environment file. This mode saves reservations on one device and updates all screens immediately. For real-time availability between students, enable the included shared server below.

## Enable shared, real-time bookings

1. In a second terminal, run `npm.cmd run server` from this folder.
2. Copy `.env.example` to `.env`. Set `EXPO_PUBLIC_BOOKING_SERVER_URL` to `http://YOUR_COMPUTER_LAN_IP:3001`. Use `ipconfig` to find your Wi-Fi IPv4 address. Physical phones cannot use `localhost`; Android emulators can use `http://10.0.2.2:3001`.
3. Restart Expo with `npm.cmd start -- --clear` and open the app on two devices on the same network. Allow the server port through your local firewall if necessary.
4. Reserve the same room/date/slot. The other device immediately receives the reservation and disables the slot. Even simultaneous requests result in only one successful booking.

The server uses Socket.IO broadcasts and performs conflict validation, insertion, disk persistence, and publication synchronously. It stores reservations in `server/data/bookings.json` and restores them after restart. Booking actions are disabled while disconnected or awaiting a fresh snapshot; reconnection refreshes availability. Local and shared modes use separate AsyncStorage keys.

This is a **single-process classroom server** with name-based demo sessions, not authenticated campus access. It accepts client-provided session IDs and broadcasts demo reservation data. Use on a trusted development network. Real deployment needs verified student authentication, protected API/QR validation, and a database transaction or unique constraint for multiple server instances. QR passes identify reservations; the app demonstrates self check-in rather than a staff scanner.

## Requirements covered

| Requirement | Implementation |
| --- | --- |
| Room discovery | Eight sample rooms, photos, building/floor, capacities, and time-based Available Now / Occupied badges |
| Combined filters | Instant search, buildings A/B/C/V, minimum capacity of every integer from 2–20, and all four equipment options; equipment selections use AND matching |
| Efficient scrolling | FlatList, React.memo room cards, stable callbacks and keys, fixed row measurements, small rendering batches, and a bounded render window |
| Time selection | Seven campus dates and four two-hour slots: 07:30–09:30, 09:30–11:30, 13:00–15:00, 15:00–17:00 |
| Conflict prevention | Disabled booked/past slots, final validation on submit, authoritative shared-server check, and reconnect synchronization |
| Booking pass | UUID reservation identifier, QR modal, and interactive check-in with a 15-minute opening window |
| Zustand | Dedicated `useBookingStore` for student session, all reservations, filters, booking, cancellation, and check-in |
| Persistence | Zustand persist + `@react-native-async-storage/async-storage`; startup waits for hydration |
| Local notifications | `expo-notifications`, permissions, Android channel, alert scheduled 15 minutes before the slot, reminder removal on cancellation/check-in, and tap-to-open pass |
| Navigation | Expo Router stacks and tabs, built on React Navigation, as required by this project's AGENTS.md |

Times are anchored to `Asia/Ho_Chi_Minh` (GMT+7), including reminders. A session booked less than 15 minutes before its start has no past-due reminder. Permission denial, scheduling failure, and web preview limitations appear in My Bookings; booking still succeeds. Shared-mode cancellation from another device removes stale OS reminders when this device next receives a snapshot while the app is running.

## Notifications and phone validation

Local reminders are native Android/iOS features. Browser previews show the pass and booking flow but do not schedule notifications.

Local reminders also work in compatible Expo Go versions. This app isolates local APIs in `src/services/localNotifications.ts`: SDK 57's main `expo-notifications` entry point eagerly loads remote push registration, which throws in Android Expo Go. The adapter imports local modules directly and preserves permission requests, scheduling, cancellation, and notification-tap handling. Its regression tests inspect the installed Android module graph. Recheck these SDK-specific paths when upgrading Expo; avoid importing the package entry point elsewhere in app code. [Expo's notification documentation](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/) distinguishes Expo Go's local notification support from remote push support.

After updating the app, stop Metro with Ctrl+C, run `npm.cmd start -- --clear` from `E:\Mini Project 2`, and scan the new QR code to discard the cached bundle.

For reliable device testing, you can also create an installable preview build from the `study-room` folder:

```powershell
npx.cmd eas-cli@latest build --platform android --profile preview
```

EAS prompts for Expo login and project linking. No cloud build has been submitted by this project. The development profile additionally requires installing `expo-dev-client` using `npx.cmd expo install expo-dev-client` before building.

On a physical phone:

1. Book a future slot more than 15 minutes away and allow notifications. Check the “Reminder set” label.
2. Background the app. At start minus 15 minutes, confirm the alert and tap it to open the pass.
3. Check in during the allowed window; confirm the checked-in state survives an app restart.
4. Cancel a future booking and verify that its slot becomes selectable and its scheduled reminder is removed.
5. Repeat with notifications denied and with the shared server disconnected; verify the explanatory messages.

60fps is a performance target, **not a measured guarantee**. The list optimizations are implemented. Verify scrolling in a release build on the target phone using React Native's performance tools. Avoid using browser or development-mode results as proof of native 60fps.

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npx.cmd expo-doctor
npx.cmd expo export --platform web
npm.cmd run test:browser
```

The browser test uses an installed Google Chrome via Playwright. It verifies session entry, combined capacity/equipment filtering, reservation, disabled booked slots, QR modal, persistence after reload, and cancellation. `npm test` covers dates/timezones, conflicts, past slots, occupancy boundaries, check-in windows, combined filters, a two-client booking race, ownership, server restore, and disk failure.

Device notification delivery and native scrolling still require the physical-phone checks above. Dependency audit currently reports advisories in the Expo/React Native dependency tree; Expo Doctor and SDK compatibility checks pass. Do not run `npm audit fix --force`, which proposes incompatible SDK downgrades; review upstream updates before production deployment.

## Source guide

- `src/app/`: session gate, Discover, room detail, My Bookings, and My Session.
- `src/store/useBookingStore.ts`: global state and persistence.
- `src/core.ts`: shared time, filtering, conflict, occupancy, and check-in rules.
- `src/services/`: shared server connection and local reminders.
- `src/components/`: memoized room card and QR pass modal.
- `server/`: shared booking server with local JSON persistence.
- `tests/`: booking rule, server integration, and browser acceptance tests.

Room inventory is sample data. Bundled Unsplash images illustrate spaces and are not photographs of actual VKU rooms. The original source URLs are recorded in `src/data/rooms.ts`; bundled assets work offline. Adjust that inventory and `src/data/photos.ts` for your campus.
