# Mini-Project 2 submission checklist

Student: Nguyen Ngoc Bao Trung — 23IT.B236. Submission date: 13/10/2026.

- Public source repository: https://github.com/bbaotrungg/Mini-Project-2
- Technical report: `Mini-Project-2_Technical-Report_Nguyen-Ngoc-Bao-Trung_23IT.B236.pdf` (four A4 pages).
- Setup instructions: repository root README and `study-room/README.md`.
- Validation: typecheck, lint and ten tests pass; logs in `evidence/`.
- Live demo / APK link: omitted at the student's request.
- Optional video: not supplied.
- Outstanding mandatory evidence: replace the four clearly labelled browser-preview screenshots with emulator or physical-device screenshots. Current images must not be represented as Android/iOS captures.
- Native reminder delivery and 60fps performance have not been measured. The report records these limits.

The supplied instructions say “3 Deliverables” but explicitly enumerate only the GitHub repository and report; the report template also contains a demo link. No third item or hosted demo has been invented. The local source ZIP is included as a convenient backup.

To rebuild the report, run `node submission/tools/build-report.cjs` from the repository root after installing the app dependencies. This uses installed Google Chrome and the app's Playwright dependency. Screenshot replacement also requires updating the evidence captions and environment description to match the real device.
