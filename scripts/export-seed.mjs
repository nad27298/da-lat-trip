import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { seed } from '../js/data/seed.js';
import { validateBackup } from '../js/data/schema.js';

const output = resolve(process.argv[2] || 'data/trip-plan.json');
const collections = ['activities', 'places', 'restaurants', 'notes'];
const backup = validateBackup({ schemaVersion: 1, ...Object.fromEntries(collections.map((name) => [name, seed[name]])) });
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(backup, null, 2) + '\n');
console.log(`Đã xuất JSON hợp lệ: ${output}`);
console.log(collections.map((name) => `${name}: ${backup[name].length}`).join(' · '));
