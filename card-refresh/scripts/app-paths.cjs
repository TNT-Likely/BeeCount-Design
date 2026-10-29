'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const designRoot = path.resolve(__dirname, '../..');
const appRoot = path.resolve(process.env.BEECOUNT_APP_ROOT || path.join(designRoot, '../BeeCount'));
const pubspec = path.join(appRoot, 'pubspec.yaml');
if (!fs.existsSync(pubspec) || !/^name:\s*beecount\s*$/m.test(fs.readFileSync(pubspec, 'utf8'))) {
  throw new Error('Set BEECOUNT_APP_ROOT to the BeeCount App checkout (pubspec.yaml name: beecount).');
}
const inputs = new Set();
function appPath(...parts) {
  const result = path.resolve(appRoot, ...parts);
  if (result !== appRoot && !result.startsWith(appRoot + path.sep)) throw new Error('App path escapes checkout: ' + parts.join('/'));
  const relative = path.relative(appRoot, result);
  if (/^(lib|assets|test|tool)\//.test(relative)) inputs.add(result);
  return result;
}
// HTML geometry exports are candidates for App review, never silent writes into App tests.
function contractCandidate(name) {
  const target = path.join(designRoot, 'card-refresh/qa/contract-candidates', path.basename(name));
  fs.mkdirSync(path.dirname(target), {recursive: true});
  return target;
}
process.on('exit', () => {
  const output = process.env.BEECOUNT_RECORD_APP_INPUTS;
  if (!output) return;
  const result = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : {};
  function record(file) {
    if (!fs.existsSync(file)) return;
    if (fs.statSync(file).isDirectory()) { for (const name of fs.readdirSync(file)) record(path.join(file, name)); return; }
    result[path.relative(appRoot, file).split(path.sep).join('/')] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }
  for (const file of inputs) record(file);
  fs.mkdirSync(path.dirname(path.resolve(output)), {recursive: true});
  fs.writeFileSync(output, JSON.stringify(Object.fromEntries(Object.entries(result).sort()), null, 2) + '\n');
});
module.exports = {appRoot, appPath, contractCandidate};
