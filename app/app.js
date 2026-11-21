// GTA VI Trophy Guide tracker: dense checklist, filters, spoiler guard, detail guides.
// Progress lives only in this browser (localStorage); export/import moves it as JSON.
// The app loads one local file, data/trophies.json, and makes no network request.
const KEY = 'gta6-trophy-guide-a';
const KEEN = 'https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/';
const BOOM = 'https://www.gtaboom.com/every-gta-6-trophy-and-achievement-at-launch-and-how-to-unlock-them-fc5f';

const $ = (id) => document.getElementById(id);
const rowsEl = $('rows'), detailEl = $('detail');
const params = new URLSearchParams(location.search);

let earned = new Set();
try { earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { earned = new Set(); }
earned = new Set([...earned].filter((n) => typeof n === 'string'));

const doc = await (await fetch('data/trophies.json')).json();
const list = doc.trophies;
const byName = new Map(list.map((t) => [t.name, t]));
const SOURCES = doc.sources ?? [
  { name: 'KeenGamer', url: KEEN },
  { name: 'GTA BOOM', url: BOOM },
];

function save() { localStorage.setItem(KEY, JSON.stringify([...earned])); }

function isSpoiled(t) {
  // Spoiler guard: story and hidden trophies stay masked until earned.
  return !$('spoiler').checked || earned.has(t.name) || (!t.hidden && t.category !== 'story');
}

function shortGuide(t) {
  if (!isSpoiled(t)) return 'Hidden trophy — earn it to reveal the guide.';
  return t.guide.length > 140 ? t.guide.slice(0, 137) + '…' : t.guide;
}

function flags(t) {
  const out = [];
  if (t.missable) out.push(['miss', '⚠ MISSABLE']);
  if (t.hidden) out.push(['hidden', 'HIDDEN']);
  if (/still unconfirmed/i.test(t.guide)) out.push(['unconf', 'METHOD UNCONFIRMED']);
  return out;
}

function visible() {
  const q = $('search').value.trim().toLowerCase();
  const grade = $('grade').value, cat = $('category').value, status = $('status').value;
  return list.filter((t) => {
    if (q && !t.name.toLowerCase().includes(q)) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (cat !== 'all' && t.category !== cat) return false;
    if (status === 'earned' && !earned.has(t.name)) return false;
    if (status === 'locked' && earned.has(t.name)) return false;
    if ($('missableOnly').checked && !t.missable) return false;
    if ($('hiddenOnly').checked && !t.hidden) return false;
    return true;
  });
}

function showDetail(t) {
  const revealed = isSpoiled(t);
  const other = SOURCES.filter((s) => s.name !== t.source);
  detailEl.hidden = false;
  detailEl.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = revealed ? t.name + ' ' : '??? Hidden trophy ';
  const g = document.createElement('span');
  g.className = 'grade ' + t.grade;
  g.textContent = t.grade.toUpperCase();
  h.append(g);
  const desc = document.createElement('p');
  desc.innerHTML = '<strong>Official description:</strong> ';
  desc.append(document.createTextNode(revealed ? t.description : 'Hidden until earned.'));
  const guide = document.createElement('p');
  guide.innerHTML = '<strong>Guide:</strong> ';
  guide.append(document.createTextNode(revealed ? t.guide : 'Spoiler guard is on — earn this trophy to reveal its guide.'));
  const meta = document.createElement('p');
  meta.textContent = 'Category: ' + t.category + ' · ' + (t.missable ? 'MISSABLE — see the warning at the top of the page. ' : '') + (t.hidden ? 'Hidden trophy. ' : '');
  const srcs = document.createElement('p');
  srcs.className = 'srcs';
  srcs.innerHTML = '<strong>Sources:</strong> ';
  const main = document.createElement('a');
  main.href = t.source === 'GTA BOOM' ? BOOM : KEEN;
  main.textContent = t.source + ' — ' + (t.source === 'GTA BOOM' ? 'gta6-trophy-guide-01 (GTA BOOM)' : 'gta-6-trophy-guide-platinum-roadmap (KeenGamer)');
  srcs.append(main, document.createTextNode(' · also: '));
  for (const s of other) {
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    srcs.append(a);
  }
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close guide';
  close.addEventListener('click', () => { detailEl.hidden = true; detailEl.innerHTML = ''; });
  detailEl.append(h, desc, guide, meta, srcs, close);
}

function render() {
  const shown = visible();
  rowsEl.replaceChildren();
  for (const t of shown) {
    const tr = document.createElement('tr');
    if (earned.has(t.name)) tr.classList.add('earned');
    const revealed = isSpoiled(t);
    const tdBox = document.createElement('td');
    tdBox.className = 'c-earned';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'tick';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      save(); render();
    });
    tdBox.append(box);
    const tdName = document.createElement('td');
    const nm = document.createElement('div');
    nm.className = 'tname' + (revealed ? '' : ' spoiled');
    nm.textContent = revealed ? t.name : '??? Hidden trophy';
    const ds = document.createElement('div');
    ds.className = 'tdesc';
    ds.textContent = revealed ? t.description : 'Spoiler guard: name and description hidden until earned.';
    tdName.append(nm, ds);
    const fl = document.createElement('div');
    fl.className = 'flags';
    for (const [cls, txt] of flags(t)) {
      const s = document.createElement('span');
      s.className = 'flag ' + cls;
      s.textContent = txt;
      fl.append(s);
    }
    tdName.append(fl);
    const tdGrade = document.createElement('td');
    const gs = document.createElement('span');
    gs.className = 'grade ' + t.grade;
    gs.textContent = t.grade;
    tdGrade.append(gs);
    const tdCat = document.createElement('td');
    tdCat.textContent = t.category;
    const tdGuide = document.createElement('td');
    const gd = document.createElement('div');
    gd.className = 'guide-short';
    gd.textContent = shortGuide(t);
    const sc = document.createElement('div');
    sc.className = 'tdesc';
    sc.textContent = 'Source: ' + t.source;
    tdGuide.append(gd, sc);
    tr.append(tdBox, tdName, tdGrade, tdCat, tdGuide);
    tr.addEventListener('click', () => showDetail(t));
    rowsEl.append(tr);
  }
  const pct = Math.round((earned.size / list.length) * 100);
  $('earnedCount').textContent = earned.size;
  $('barFill').style.width = pct + '%';
  $('progressText').textContent = earned.size + ' of ' + list.length + ' earned · ' + pct + '%';
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((gr) => {
    const total = list.filter((t) => t.grade === gr).length;
    const got = list.filter((t) => t.grade === gr && earned.has(t.name)).length;
    return got + '/' + total + ' ' + gr;
  }).join(' · ');
  $('gradeCounts').textContent = counts + ' · ' + list.filter((t) => t.hidden).length + ' hidden · 1 missable';
  $('showing').textContent = 'Showing ' + shown.length + ' of ' + list.length + ' trophies'
    + ($('spoiler').checked ? ' · spoiler guard ON (story / hidden trophies masked until earned)' : ' · spoiler guard OFF');
  window.__shotReady = true;
}

$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'GTA VI', earned: [...earned] }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    const next = new Set((names ?? []).filter((n) => byName.has(n)));
    earned = next;
    save(); render();
  } catch { alert('That file is not valid trophy progress JSON.'); }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set(); save(); render();
});
for (const id of ['search', 'grade', 'category', 'status', 'missableOnly', 'hiddenOnly', 'spoiler']) {
  $(id).addEventListener('input', render);
  $(id).addEventListener('change', render);
}

// Screenshot / deep-link parameters: ?grade=silver, ?category=…, ?spoilers=off,
// ?detail=<trophy id> opens that trophy's guide, ?view=roadmap scrolls to the roadmap.
if (params.get('grade')) $('grade').value = params.get('grade');
if (params.get('category')) $('category').value = params.get('category');
if (params.get('spoilers') === 'off') $('spoiler').checked = false;
if (params.get('q')) $('search').value = params.get('q');
render();
const detailId = Number(params.get('detail'));
if (detailId) {
  const t = list.find((x) => x.id === detailId);
  if (t) {
    showDetail(t);
    detailEl.scrollIntoView({ block: 'start' });
  }
} else if (params.get('view') === 'roadmap') {
  $('roadmap').scrollIntoView({ block: 'start' });
}
