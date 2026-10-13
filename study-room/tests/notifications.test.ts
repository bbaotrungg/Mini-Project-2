import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

// Test actual installed runtime imports, including Android-specific modules.
// This catches SDK patches that reintroduce push auto-registration into locals.
function imports(code: string, file: string) {
  const js = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext }, fileName: file }).outputText;
  const ast = ts.createSourceFile(file, js, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
  const result: string[] = [];
  for (const statement of ast.statements) {
    if ((ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) result.push(statement.moduleSpecifier.text);
  }
  return result;
}

test('local notification runtime graph does not load Expo Go remote push registration', () => {
  const root = resolve('node_modules/expo-notifications/build');
  const adapter = resolve('src/services/localNotifications.ts');
  const visited = new Set<string>();
  function visit(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    assert.doesNotMatch(relative(root, file), /(?:DevicePushTokenAutoRegistration|TokenEmitter|warnOfExpoGoPushUsage|get(?:Expo|Device)PushTokenAsync|^index\.js$)/);
    for (const specifier of imports(readFileSync(file, 'utf8'), file)) {
      let base: string;
      if (specifier.startsWith('expo-notifications/build/')) base = join(root, specifier.slice('expo-notifications/build/'.length));
      else if (specifier.startsWith('.')) base = resolve(dirname(file), specifier);
      else { assert.notEqual(specifier, 'expo-notifications', 'Avoid the package entry point.'); continue; }
      const resolved = [`${base}.android.js`, `${base}.native.js`, `${base}.js`].find(existsSync);
      assert.ok(resolved, `Cannot resolve ${specifier} from ${file}`);
      visit(resolved);
    }
  }
  visit(adapter);
  assert.ok([...visited].some(file => file.endsWith('scheduleNotificationAsync.js')), 'Local scheduling remains included.');
  assert.ok([...visited].some(file => file.endsWith('setNotificationChannelAsync.android.js')), 'Android channel implementation remains included.');
});

test('app code uses the local notification adapter instead of the crashing package entry point', () => {
  function inspect(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) inspect(file);
      else if (/\.tsx?$/.test(file)) assert.ok(!imports(readFileSync(file, 'utf8'), file).includes('expo-notifications'), `Unsafe notification import in ${file}`);
    }
  }
  inspect(resolve('src'));
});
