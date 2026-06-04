const fs = require('fs');
const path = require('path');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
const files = walk('src').filter(f => f.endsWith('.vue'));
const helperNames = ['computed','ref','reactive','watch','watchEffect','onMounted','onUnmounted','onBeforeMount','onBeforeUnmount','provide','inject','toRefs','readonly','shallowRef','toRef','nextTick','defineProps','defineEmits'];
const problems = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const scriptMatch = text.match(/<script[^>]*setup[^>]*>([\s\S]*?)<\/script>/i);
  if (!scriptMatch) continue;
  const script = scriptMatch[1];
  const imports = new Set();
  for (const match of script.matchAll(/import\s+\{([^}]+)\}\s+from\s+['\"]vue['\"]/g)) {
    match[1].split(',').map(i => i.trim()).forEach(i => imports.add(i));
  }
  const used = new Set();
  for (const name of helperNames) {
    const re = new RegExp('\\b' + name + '\\b', 'g');
    if (re.test(script)) used.add(name);
  }
  const missing = [...used].filter(name => name !== 'defineProps' && name !== 'defineEmits' && !imports.has(name));
  if (missing.length) {
    problems.push({ file, missing, imports: [...imports].sort(), used: [...used].sort() });
  }
}
if (!problems.length) {
  console.log('OK');
} else {
  for (const p of problems) {
    console.log(p.file);
    console.log('  used:', p.used.join(', '));
    console.log('  imports:', p.imports.join(', '));
    console.log('  missing:', p.missing.join(', '));
  }
}
