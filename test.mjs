// Oyun mantığı testi: index.html'i sahte DOM ile çalıştırır. `node test.mjs`
import fs from 'fs';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const el = () => ({ style: {}, dataset: {}, textContent: '', className: '', onclick: null, children: [],
                    classList: { s: new Set(), add(c) { this.s.add(c); }, remove(c) { this.s.delete(c); },
                                 contains(c) { return this.s.has(c); } },
                    appendChild(c) { this.children.push(c); } });
const board = el(), sizeSel = el(), hud = el(), win = el();
Object.defineProperty(board, 'innerHTML',
  { set() { this.children.length = 0; }, get() { return ''; } });
sizeSel.value = '4x5';
const ids = { board, size: sizeSel, hud, win, restart: el() };
const doc = { getElementById: id => ids[id] || console.error('bilinmeyen id: ' + id), createElement: el };

new Function('document', 'console', code)(doc, console);

const assert = (ok, msg) => { if (!ok) { console.error('✗', msg); process.exit(1); } console.log('✓', msg); };
const cards = () => board.children;
const moves = () => +hud.textContent.match(/\d+/)[0];
const groups = (only) => Object.values(cards().reduce((a, c) => ((a[c.dataset.fruit] = a[c.dataset.fruit] || []).push(c), a), {}))
  .filter(g => only !== 'unmatched' || !g[0].classList.contains('done'));
const pair = (only) => groups(only)[0];

assert(cards().length === 20, '4x5 = 20 kart kuruldu');

pair('unmatched').forEach(c => c.onclick());
assert(cards().filter(c => c.classList.contains('done')).length === 2, 'aynı iki meyve eşleşti (done)');
assert(moves() === 1, 'hamle sayacı arttı: ' + hud.textContent);

const [x] = pair('unmatched'), [y] = groups('unmatched')[1];
x.onclick(); y.onclick();
assert(x.classList.contains('up') && y.classList.contains('up'), 'farklı iki meyve açık kaldı');
assert(!x.classList.contains('done'), 'eşleşmeyen kart kapanmadı sayılmadı');
await new Promise(r => setTimeout(r, 900));
assert(!x.classList.contains('up') && x.textContent === '🍃', 'eşleşmeyen kart 750ms sonra kapandı');

const done = cards().find(c => c.classList.contains('done'));
const m = moves();
done.onclick(); done.onclick();
assert(moves() === m && done.textContent === done.dataset.fruit, 'eşleşmiş karta dokunmak hamle saymıyor');

let guard = 0;
while (cards().some(c => !c.classList.contains('done')) && guard++ < 40) pair('unmatched').forEach(c => c.onclick());
assert(win.className === 'show', 'tüm çiftler bulununca tebrik ekranı: ' + win.textContent);

sizeSel.value = '6x6';
sizeSel.onchange();
assert(cards().length === 36 && board.style.gridTemplateColumns === 'repeat(6, 1fr)', '6x6 = 36 kart, 6 kolon');
assert(groups().every(g => g.length === 2), 'her meyveden tam 2 kart');
console.log('\nHepsi geçti.');
process.exit(0);
