# Installation on Arch Linux

This guide is for the complete Arn0 Live TV / Hidden Apps fork. The ZIP already contains the full source code and the original assets. **Installation does not clone a Git repository or download additional source code.** Apps2Samsung is used separately as the signing and installation tool.

## 1. Extract the ZIP archive

Place `arn0-tv-live-tv-hidden-apps-full.zip` in `~/Downloads`, then run:

```bash
mkdir -p "$HOME/src/arn0-tv-live-tv-hidden-apps"
unzip "$HOME/Downloads/arn0-tv-live-tv-hidden-apps-full.zip" \
  -d "$HOME/src/arn0-tv-live-tv-hidden-apps"
cd "$HOME/src/arn0-tv-live-tv-hidden-apps/arn0-tv-main"
```

The directory contains the complete supplied Arn0 source tree, including `src/`, `native/`, `scripts/`, `docs/`, images, fonts, and license files.

## 2. Install build tools

Arn0 requires Node.js 20 or newer and the system `zip` utility:

```bash
sudo pacman -S --needed nodejs npm zip unzip
node --version
npm --version
```

Make sure `node --version` reports Node.js 20 or newer. The project does not require external npm packages; running `npm install` is not necessary.

## 3. Run the tests

```bash
npm test
```

The final line should be:

```text
Live TV / Hidden Apps tests passed.
```

The tests check that:

- `org.tizen.tv-viewer` is created as an app tile when Tizen does not report it through `getAppsInfo()`.
- The tile is named `Live TV` and uses the dedicated `livetv` brand.
- Hidden apps with `show: false` are included in the extended app picker and marked as hidden.
- Live TV is also available in the app picker so it can be added again.

## 4. Build the Tizen WGT package

```bash
npm run build
```

The generated file is:

```text
dist/arn0-launcher.wgt
```

The build generates the colourised Live TV tile graphic at `src/img/tiles/livetv.svg` from the source SVG at `src/img/marks/livetv.svg`.

## 5. Install Apps2Samsung on Arch Linux

Official project:

<https://github.com/Apps2Samsung/Apps2Samsung>

Official releases:

<https://github.com/Apps2Samsung/Apps2Samsung/releases>

### Install from the AUR

Using an installed AUR helper such as `yay`:

```bash
yay -S apps2samsung
```

Then launch Apps2Samsung from the KDE application menu.

### Alternative: official AppImage

Download the Linux AppImage from the official Releases page. Then run:

```bash
APPIMAGE="$(find "$HOME/Downloads" -maxdepth 1 -type f -name 'Apps2Samsung*.AppImage' -print -quit)"
test -n "$APPIMAGE" || { echo "No Apps2Samsung AppImage found in ~/Downloads."; exit 1; }
chmod +x "$APPIMAGE"
"$APPIMAGE"
```

## 6. Install the WGT with Apps2Samsung

1. Enable Developer Mode on the Samsung TV.
2. Enter the Arch PC's current LAN IP address as the Host PC IP.
3. Make sure the PC can reach the TV and Apps2Samsung can discover it.
4. Start Apps2Samsung and connect to the TV.
5. Open the local package installation / **Custom WGT/TPK** file picker.
6. Select `dist/arn0-launcher.wgt`.
7. Sign and install the package with the appropriate certificate profile.
8. Launch Arn0 on the TV and verify the new features.

Apps2Samsung is an external tool. It is not embedded in Arn0, and the project does not launch it automatically.

### Certificates and updates

Apps2Samsung supports a Tizen SDK certificate issued by its own certificate authority, so a Samsung account is not required for that certificate option. It also supports Samsung certificate profiles. For an **update**, the selected certificate must match the certificate used for the Arn0 package already installed on the TV.

- If the existing Arn0 installation was signed with a Tizen SDK certificate, use the same profile for the update.
- If it was signed with a different certificate, use that same profile again.
- In case of an **Author-Certificate-Mismatch**, do not uninstall the app prematurely. Uninstalling may delete Arn0 settings stored in the TV's `localStorage`. Restore the original signing profile first.

The WGT file in `dist/` is unsigned. Apps2Samsung handles signing and installation. Apps2Samsung documents support for custom `.wgt` files and the Tizen SDK certificate option in its own repository: <https://github.com/Apps2Samsung/Apps2Samsung>.

## 7. Use Live TV and Hidden Apps

### Live TV

- Live TV is shown in the top apps row by default.
- It is a regular Arn0 app tile with the Tizen ID `org.tizen.tv-viewer` and a dedicated TV/play logo.
- In **Settings → Apps on Home**, it appears in the left-hand **On Home** column.
- Open the tile's menu, choose **Move**, then change its position with Up/Down.
- Choose **Remove from Home** to remove it. It can later be added again from **Add apps** on the right.
- Activating the tile starts the native viewer through Arn0's `Inputs.openViewer()` function.

Whether the native TV viewer actually starts depends on whether the TV's Tizen firmware provides and allows launching `org.tizen.tv-viewer`.

### Hidden Apps

- Under **Settings → Apps on Home → Add apps**, installed applications with `show: false` are also listed.
- They are marked with the **Hidden** label.
- Press OK to add an app to the left-hand **On Home** list. From there, it can be moved or removed.

The **Hidden** label comes from the Tizen app metadata field `show`. It does not mean that every listed application has a usable user interface. Samsung system services may refuse to launch or may run without a visible interface.

## 8. Updates and the Home button

- The Arn0 package ID remains `Arn0Lnchr0.Launcher`; this is an update to the launcher, not a separate app.
- The existing Home-button redirection is not modified by the changes in this fork.
- When updating, use the same signing certificate and install in place whenever possible.
- Do not uninstall the app merely to work around a signing error.

The native Home/startup helpers under `native/` are not modified by this fork and are not run automatically. For this separate, higher-risk feature, continue to follow the instructions in [`docs/setup-tv.md`](docs/setup-tv.md).

The upstream documentation lists a Q70B running Tizen 6.5 and firmware `T-PTMDEUC-1720.7` as its tested reference device. It does not claim compatibility with other TV models. The UI features added here have not been hardware-verified on every Tizen model.
