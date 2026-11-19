import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { seed } from '../js/data/seed.js';
import { validateBackup } from '../js/data/schema.js';

const store = new Map();
globalThis.localStorage = {
  getItem(key) {
    return store.get(key) ?? null;
  },
  setItem(key, value) {
    store.set(key, value);
  }
};
globalThis.window = { addEventListener() {} };
const { localAdapter, seedBackup } = await import('../js/storage/local.js');
const backup = seedBackup();
assert.equal(validateBackup(backup).activities.length, seed.activities.length);
assert.equal(seed.days.length, 4);
assert(seed.activities.some((item) => item.dayId === 'day-3' && item.placeId === 'cau-dat'));
assert(seed.activities.some((item) => item.dayId === 'day-4' && item.start === '14:30' && item.type === 'transport'));
const changed = [];
const repo = localAdapter((data) => changed.push(data), () => {});
const first = repo.data.activities[0];
await repo.save('activities', { ...first, start: '14:35' }, first.revision);
assert.equal(repo.data.activities[0].start, '14:35');
await assert.rejects(repo.save('activities', first, first.revision));
const reloaded = localAdapter(() => {}, () => {});
assert.equal(reloaded.data.activities[0].start, '14:35');
const place = { ...seed.places[0], id: 'test-place', revision: 1, name: '<img src=x onerror=alert(1)>' };
await repo.save('places', place, 0);
const activity = { ...first, id: 'test-activity', placeId: place.id, dayId: 'day-4', revision: 1 };
await repo.save('activities', activity, 0);
assert.equal(repo.data.activities.find((item) => item.id === activity.id).dayId, 'day-4');
const exported = JSON.parse(JSON.stringify(await repo.exportData()));
await repo.resetLocal();
assert(!repo.data.places.some((item) => item.id === place.id));
await repo.importData(exported);
assert(repo.data.places.some((item) => item.id === place.id));
await repo.remove('activities', activity.id, 1);
assert(!repo.data.activities.some((item) => item.id === activity.id));
const invalid = structuredClone(exported);
invalid.activities[0].unexpected = true;
assert.throws(() => validateBackup(invalid));
const dangling = structuredClone(exported);
dangling.activities[0].placeId = 'missing-id';
assert.throws(() => validateBackup(dangling));
const duplicate = structuredClone(exported);
duplicate.places.push(duplicate.places[0]);
assert.throws(() => validateBackup(duplicate));
const previous = JSON.stringify(repo.data);
const originalSet = localStorage.setItem;
localStorage.setItem = () => {
  throw new Error('QuotaExceededError');
};
await assert.rejects(repo.save('activities', { ...repo.data.activities[0], start: '15:00' }, repo.data.activities[0].revision));
assert.equal(JSON.stringify(repo.data), previous);
localStorage.setItem = originalSet;
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (!/^https?:/.test(match[1])) {
    assert(existsSync(new URL('../' + match[1], import.meta.url)), `Missing HTML path: ${match[1]}`);
  }
}
function checkImports(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      checkImports(new URL(entry.name + '/', directory));
    } else if (entry.name.endsWith('.js')) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/(?:from\s+|import\s*\()\s*["'](\.[^"']+)["']/g)) {
        assert(existsSync(new URL(match[1], file)), `Missing JS import: ${match[1]}`);
      }
    }
  }
}
checkImports(new URL('../js/', import.meta.url));
console.log(`PASS: ${seed.activities.length} activities, ${seed.places.length} places, ${seed.restaurants.length} restaurants; local CRUD, revisions, refresh, JSON, invalid schema, quota failure, relative paths.`);
