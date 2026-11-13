# Fork Changes: Live TV and Hidden Apps

This fork is based on the complete Arn0 source archive supplied by the user (`arn0-tv-main.zip`). All original files and assets are retained; the fork-specific changes are documented below.

## Live TV as an app tile

- The Tizen app ID is `org.tizen.tv-viewer`.
- `Apps.curated()` creates a synthetic app entry if `getAppsInfo()` does not return the TV viewer.
- `homeEntries()` appends Live TV to the end of the Apps on Home list by default, unless the user has explicitly removed it.
- `setHomeItems()` persists removal and re-addition through `tvViewerRemoved`.
- The previous separate Live TV special tile is removed. The tile has `kind: 'app'` and uses the regular, reorderable app list.
- Activating the app ID `org.tizen.tv-viewer` calls `Inputs.openViewer()`.
- `brands.js` uses the `livetv` brand; `src/img/marks/livetv.svg` is the new logo. `scripts/build-marks.mjs` generates the colourised tile SVG during the build.

## Hidden Apps

- `Apps.allSorted(apps, showEverything, includeHidden)` has the additional `includeHidden` argument.
- `toItem()` passes `app.show === false` to the UI as `hidden`.
- **Settings → Apps on Home** calls `Apps.allSorted(Home.apps(), true, true)` and therefore offers all launchable apps, including apps with `show: false`.
- The editor marks these entries with **Hidden**.
- The regular All apps view keeps its previous filtering behaviour.

## Persistence and compatibility

- `tvViewerRemoved` is stored in `Prefs` and restored when preferences are loaded.
- The existing app order is retained; Live TV is appended to the end by default on the first run of this fork.
- The package ID `Arn0Lnchr0.Launcher` and the native files under `native/` remain unchanged.

## Tests

`npm test` checks the synthetic Live TV tile, its ID/label/brand, hidden-app filtering, and the presence of the TV viewer in the extended Apps on Home picker.
