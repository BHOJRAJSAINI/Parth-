# GPS Map Camera

React + TypeScript + Capacitor app that captures photos and permanently burns GPS coordinates, address, date/time and accuracy onto the saved image. **No login or registration anywhere.** Footer: *Powered by Parth Karoli*.

## Setup

```bash
npm install
cp .env.example .env        # optional, only for cloud backup
npm run dev                 # web / PWA in browser (HTTPS or localhost needed for camera + GPS)
```

### Android
```bash
npx cap add android
npm run cap:sync
npx cap open android        # build APK/AAB from Android Studio (Build > Generate Signed Bundle / APK)
```
Add to `android/app/src/main/AndroidManifest.xml` (inside `<manifest>`):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```
No background-location permission is requested.

### iOS
```bash
npx cap add ios && npm run cap:sync && npx cap open ios
```
Add `NSCameraUsageDescription` and `NSLocationWhenInUseUsageDescription` to `Info.plist`.

### Icons
Place `icon-192.png` and `icon-512.png` in `public/` (PWA + launcher). Use `@capacitor/assets` for native icons.

### Vercel
Import the repo; `vercel.json` is already configured (build `npm run build`, output `dist`). Add the two `VITE_SUPABASE_*` variables if using backup.

## Environment variables
| Name | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (optional) |
| `VITE_SUPABASE_ANON_KEY` | Public anon key only. **Never** put the service-role key in this app. |

## Optional cloud backup (still no login)
1. Create a Supabase project, enable **Anonymous Sign-Ins** (silent device identity).
2. Run `supabase/schema.sql` (tables, private bucket, RLS so each device sees only its own data).
3. Set env vars, rebuild, then turn on **Settings → Cloud backup**.

## Architecture notes
- **Camera**: live preview via `getUserMedia` inside the Capacitor WebView (needed for the live GPS overlay and zoom/torch/tap-focus where the device supports them), with `@capacitor/camera` system-camera fallback. Torch/zoom/focus depend on device and WebView support.
- **GPS**: `@capacitor/geolocation`, read only while camera/map is open. Missing data is never invented; a no-GPS capture is marked "Location not verified".
- **Watermark**: drawn on a canvas and exported as JPEG (permanent). Original saved separately.
- **Storage**: SQLite (`@capacitor-community/sqlite`) + Filesystem on native. In a plain browser/PWA a localStorage + IndexedDB fallback is used (smaller, less durable; documented limitation).
- **Offline**: capture, watermark, gallery work offline; address resolves later; uploads queue in `sync_queue` and retry (max 5) when online.
- **Map**: Leaflet + OpenStreetMap tiles (tiles need internet; markers still list offline).
- **Reverse geocoding**: OpenStreetMap Nominatim (public service, light use only; use your own provider for heavy traffic).
- "Save to device" writes to `Documents/GPSMapCamera/` on Android (not the Photos app gallery).

## Known limitations
- GPS metadata and timestamps are device-reported, not proof of authenticity.
- Editing project/remarks afterwards does not re-render text already burned into the image.
- Web build cannot use native SQLite/filesystem.

## Test checklist (run on a real Android device)
1. Fresh install opens directly on Home (no login).
2. Camera permission deny → error panel + Retry/system camera; allow → preview.
3. Location deny/allow; airplane mode on → capture still works, address "pending", later resolves online.
4. Capture → review → Save; open saved image in Gallery and confirm overlay values match the Map screen.
5. Rear/front switch, flash, zoom, tap-focus, grid, aspect ratios.
6. Min accuracy setting blocks capture until accuracy is good (or "Capture anyway").
7. Gallery: search, each filter, original vs watermarked, share, WhatsApp, copy coords, edit, delete, multi-delete.
8. Map: current / all / today, marker tap preview.
9. PDF report: daily/weekly/monthly/range/category/project, download and share.
10. Settings persist after app restart; dark mode.
11. Cloud backup (if enabled): airplane mode capture → reconnect → status turns uploaded; no duplicates.
12. "Powered by Parth Karoli" visible on Home, Gallery, Map, Settings, About, PDF.
