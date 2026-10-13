# Mini-Project 2 — VKU Study Spaces

React Native + Expo + TypeScript app for campus study-room reservations.

**Course:** Cross-Platform Mobile App Development (VKU)

**Student:** Nguyen Ngoc Bao Trung — 23IT.B236

**Submission:** Sole student, 100% contribution — 13/10/2026

## Setup

Install Node.js 22.13 or newer and Expo Go compatible with Expo SDK 57.

```bash
git clone https://github.com/bbaotrungg/Mini-Project-2.git
cd Mini-Project-2
npm install
npm start
```

Scan the terminal QR code in Expo Go. The computer and phone must be on the same Wi-Fi. On Windows PowerShell, use `npm.cmd` in place of `npm` if script execution is restricted. Commands can run from the repository root; the app source lives in `study-room`.

```bash
npm run web         # Browser preview
npm run server      # Optional shared booking server
npm run typecheck
npm run lint
npm test
```

If Expo Go has a cached bundle, stop Metro and run `npm start -- --clear` before scanning again. The app imports only local notification modules to avoid SDK 57's Android Expo Go remote-push startup error.

## Features

- Room photos, building/floor, capacity and current occupancy status.
- Instant search and combined building, capacity (2–20) and equipment filters.
- Seven-day selector with four discrete two-hour slots and disabled booked/past slots.
- UUID booking pass, QR modal, self check-in and cancellation.
- Zustand session, booking and filter state persisted with AsyncStorage.
- Local check-in reminders 15 minutes before a session, with explicit permission and scheduling feedback.
- Memoized room cards and FlatList rendering optimizations.
- Shared Socket.IO server that prevents simultaneous duplicate reservations and broadcasts updates.

## Enable real-time availability across devices

The default local demo saves reservations on one device. To enable shared booking:

1. Run `npm run server` in a second terminal.
2. Copy `study-room/.env.example` to `study-room/.env`.
3. Set `EXPO_PUBLIC_BOOKING_SERVER_URL=http://YOUR_COMPUTER_LAN_IP:3001`.
4. Restart Expo with `npm start -- --clear` and open the app on two devices.

Physical phones need the computer's LAN IP, not `localhost`. The server stores reservations in its ignored local data folder. Shared booking is disabled while disconnected or awaiting synchronization. All slot times use Vietnam campus time (GMT+7).

## Submission materials

- [Short technical report — 4-page PDF](submission/Mini-Project-2_Technical-Report_Nguyen-Ngoc-Bao-Trung_23IT.B236.pdf)
- [Editable report source](submission/report.html)
- [Annotated evidence screenshots](submission/screenshots)
- [Saved validation results](submission/evidence/validation.json)
- [Full app setup, architecture and device testing guide](study-room/README.md)

No live demo or video is provided, as requested by the student. Current report screenshots are accurately labelled browser previews. The assessment template's emulator/physical-device screenshots still need to replace them before a fully compliant submission.

## Validation and scope

Typecheck, lint and all 10 automated tests pass. The tests cover time and filter rules, notification-import regression, two-client booking conflicts, cancellation, ownership, server restoration and failed persistence. The browser acceptance flow verifies filtering, booking, QR pass, saved state and cancellation. Android/iOS/web bundling and Expo Doctor were also checked during development.

The student confirmed the app works in Expo Go. Actual device reminder delivery and native 60fps scrolling still need measurement; browser screenshots cannot establish either. The sample inventory, name-based student session, self check-in and single-process server are classroom demonstrations.

## Structure

```text
study-room/src/app/          Screens and navigation
study-room/src/components/   Room cards and QR pass
study-room/src/store/        Zustand and persistence
study-room/src/services/     Real-time connection and local reminders
study-room/src/core.ts       Shared booking/time/filter rules
study-room/server/           Shared booking server
study-room/tests/            Rules, integration and browser tests
submission/                 Report, screenshots and evidence
```
