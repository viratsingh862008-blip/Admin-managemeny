import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/components/Flipbook.tsx', 'utf8');
assert.match(source, /Blob \| string \| null/);
assert.match(source, /typeof file === 'string'/);
assert.match(source, /getDocument\(/);
assert.match(source, /onUpload\?:/);
assert.match(source, /downloadUrl/);
console.log('flipbook remote source contract: 3/3 checks passed');