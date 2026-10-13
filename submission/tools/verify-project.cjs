const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const directory = path.resolve(__dirname, '../evidence');
fs.mkdirSync(directory, { recursive: true });
const commands = { typecheck: 'npm.cmd run typecheck', lint: 'npm.cmd run lint', tests: 'npm.cmd test' };
const results = {};
for (const [name, command] of Object.entries(commands)) {
  try {
    const log = execSync(command, { cwd: path.resolve(__dirname, '../../study-room'), encoding: 'utf8', stdio: 'pipe' });
    fs.writeFileSync(path.join(directory, `${name}.txt`), log.trimEnd() + '\n');
    results[name] = { command, status: 'passed' };
  } catch (error) {
    fs.writeFileSync(path.join(directory, `${name}.txt`), String(error.stdout ?? '') + String(error.stderr ?? ''));
    results[name] = { command, status: 'failed' };
    process.exitCode = 1;
  }
}
fs.writeFileSync(path.join(directory, 'validation.json'), JSON.stringify({ recordedAt: new Date().toISOString(), results }, null, 2));
console.log(JSON.stringify(results, null, 2));
