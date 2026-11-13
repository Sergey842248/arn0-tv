import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { resolve } from 'node:path';

const appSource = await readFile(resolve('src/js/apps.js'), 'utf8');
const brandMap = {
  livetv: { key: 'livetv', bg: '#071c2c', fg: '#fff', mark: 'livetv' }
};
function findBrand(value) {
  if (typeof value === 'string') return brandMap[value] || null;
  const text = (value.name || '') + ' ' + (value.id || '');
  if (/org\.tizen\.tv-viewer|live\s*tv/i.test(text)) return brandMap.livetv;
  return null;
}
const sandbox = { window: {}, findBrand, Promise, setTimeout, clearTimeout };
vm.runInNewContext(appSource, sandbox);
const Apps = sandbox.window.Apps;
const tvId = 'org.tizen.tv-viewer';

const curated = Apps.curated([], { apps: [{ id: tvId, label: 'Live TV', brand: 'livetv' }] });
assert.equal(curated.length, 1, 'Live TV should be synthesised when Tizen does not list it');
assert.equal(curated[0].id, tvId);
assert.equal(curated[0].kind, 'app', 'Live TV must be a normal app item');
assert.equal(curated[0].label, 'Live TV');
assert.equal(curated[0].brand.key, 'livetv');

const installed = [
  { id: 'visible.app', name: 'Visible app', show: true },
  { id: 'hidden.app', name: 'Hidden system app', show: false }
];
const normal = Apps.allSorted(installed, true);
assert.equal(normal.some(app => app.id === 'hidden.app'), false, 'hidden app should remain filtered by default');
const withHidden = Apps.allSorted(installed, true, true);
const hidden = withHidden.find(app => app.id === 'hidden.app');
assert.ok(hidden, 'hidden app should be available in the editor');
assert.equal(hidden.hidden, true, 'hidden app should be marked for the editor');
assert.ok(withHidden.some(app => app.id === tvId), 'Live TV should be addable from the editor');


const homeSource = await readFile(resolve('src/js/home.js'), 'utf8');
const settingsSource = await readFile(resolve('src/js/settings.js'), 'utf8');
const prefsSource = await readFile(resolve('src/js/prefs.js'), 'utf8');
assert.match(homeSource, /prefs\.tvViewerRemoved/,
  'explicit Live TV removal should be persisted');
assert.match(homeSource, /item\.id === Apps\.TV_VIEWER_APP/,
  'the normal app activation path should route Live TV to the native viewer');
assert.doesNotMatch(homeSource, /kind: 'tv-viewer'/,
  'the old separate tv-viewer tile type must not remain');
assert.match(settingsSource, /Apps\.allSorted\(Home\.apps\(\), true, true\)/,
  'Apps on Home should request hidden applications');
assert.match(settingsSource, /item\.hidden \? ' · Hidden'/,
  'the editor should identify hidden applications');
assert.match(prefsSource, /tvViewerRemoved: false/,
  'the removal flag must have a persisted default');

console.log('Live TV / Hidden Apps tests passed.');
