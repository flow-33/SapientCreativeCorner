# Virtual OS (working name)

A desktop Electron shell that launches microsites as apps. Phase 1 is keyboard/mouse on the host; Phase 2 adds phone control via QR.

## Develop

```bash
npm start
```

- Esc or H: return to launcher
- D: toggle details drawer when viewing an item

## Structure
- `src/index.js`: main process; opens full-screen on external display when present
- `src/index.html`, `src/index.css`, `src/renderer.js`: UI and interactions
- `src/data/*.json`: data sources for collections
- `src/config.js`: weekly refresh and data source URLs

## Data refresh
- Items are fetched from local JSON by default and cached in `localStorage` for 7 days
- After 7 days, the data is refetched
- Later, switch `DATA_SOURCES` in `src/config.js` to GitHub-hosted JSON

## Build installers
```bash
npm run make
```
- Run on macOS to get `.dmg/.zip`
- Run on Windows (or CI Windows runner) to get `.exe/.msi`

## Next
- Phone controller via local WebSocket + QR in TV window
- mDNS discovery and optional session PIN
