// Leonida Legend — GTA VI trophy guide & tracker.
// Loads app/data/trophies.json (the official 55, with our own guides and
// named sources), renders the checklist, and keeps earned ticks in
// localStorage with export/import. No network at run time: the only
// request is the relative fetch of data/trophies.json, a file under app/.

const STORAGE_KEY = 'gta6-trophy-guide-earned-v1';

// Source codes used in trophies.json, expanded here into the names and
// links the reader sees beside each guide. A null url means the source
// is named, not linked (no URL invented for it).
const SOURCES = {
  powerpyx: {
    name: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
    url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
  },
  psnprofiles: { name: 'PSNProfiles trophy list', url: null },
  exophase: { name: 'Exophase trophy list', url: null },
  truetrophies: { name: 'TrueTrophies trophy list', url: null },
  leonida: {
    name: 'Leonida Interactive — GTA 6 Trophies and Achievements',
    url: 'https://leonidainteractive.com/wiki/guides/trophies-achievements/',
  },
};

const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  side: 'Side mission',
  platinum: 'Platinum',
};

const ROADMAP_LABELS = {
  1: 'Roadmap 1',
  2: 'Roadmap 2',
  3: 'Roadmap 3',
  4: 'Platinum',
};

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

const listEl = document.getElementById('checklist');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const sortEl = document.getElementById('sort');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hide-earned');
const resultCountEl = document.getElementById('result-count');
const progressTextEl = document.getElementById('progress-text');
const progressFillEl = document.getElementById('progress-fill');
const progressBarEl = document.getElementById('progress-bar');
const gradeBreakdownEl = document.getElementById('grade-breakdown');
const miniProgressEl = document.getElementById('mini-progress');

const params = new URLSearchParams(location.search);

let trophies = [];
let earned = new Set(loadEarned());
let activeKind = params.get('kind') ?? 'all';

function loadEarned() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function trophyById(id) {
  return trophies.find((t) => t.id === id);
}

function isHiddenBySpoiler(trophy) {
  return spoilerEl.checked && trophy.kind === 'story' && !earned.has(trophy.id);
}

function matchesFilters(trophy) {
  if (activeKind === 'missable' && !trophy.missable) return false;
  if (activeKind === 'online') return false; // GTA 6 lists no online trophies.
  if (activeKind !== 'all' && activeKind !== 'missable' && trophy.kind !== activeKind) return false;
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(trophy.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function sortTrophies(list) {
  const sorted = [...list];
  if (sortEl.value === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortEl.value === 'grade') {
    sorted.sort(
      (a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id,
    );
  } else {
    // Roadmap order: the platinum first, then the road to it by stage.
    const stage = (t) => (t.roadmap === 4 ? 0 : t.roadmap);
    sorted.sort((a, b) => stage(a) - stage(b) || a.id - b.id);
  }
  return sorted;
}

function sourceNodes(codes) {
  const frag = document.createDocumentFragment();
  codes.forEach((code, i) => {
    if (i > 0) frag.append(document.createTextNode(' · '));
    const src = SOURCES[code];
    if (!src) {
      frag.append(document.createTextNode(code));
      return;
    }
    if (src.url) {
      const a = document.createElement('a');
      a.href = src.url;
      a.textContent = src.name;
      a.rel = 'noopener';
      frag.append(a);
    } else {
      frag.append(document.createTextNode(src.name));
    }
  });
  return frag;
}

function buildCard(trophy) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = String(trophy.id);
  if (earned.has(trophy.id)) card.classList.add('earned');
  if (trophy.missable) card.classList.add('missable-card');

  const spoilerHidden = isHiddenBySpoiler(trophy);

  const head = document.createElement('div');
  head.className = 'card-head';

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'earn-box';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.id);
    else earned.delete(trophy.id);
    saveEarned();
    render();
  });
  head.append(box);

  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${trophy.grade}`;
  badge.textContent = trophy.grade;
  head.append(badge);

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = spoilerHidden ? 'Hidden story trophy' : trophy.name;
  head.append(title);

  const tags = document.createElement('span');
  tags.className = 'tags';
  const tagTexts = [KIND_LABELS[trophy.kind] ?? trophy.kind, ROADMAP_LABELS[trophy.roadmap]];
  if (trophy.hidden) tagTexts.push('Hidden on PSN');
  if (trophy.missable) tagTexts.push('Missable');
  tags.textContent = [...new Set(tagTexts)].join(' · ');
  head.append(tags);

  card.append(head);

  const desc = document.createElement('p');
  desc.className = 'official';
  desc.textContent = spoilerHidden
    ? '“Hidden until earned — the spoiler setting is on.”'
    : `“${trophy.description}”`;
  card.append(desc);

  if (trophy.count && !spoilerHidden) {
    const count = document.createElement('p');
    count.className = 'count';
    count.textContent = `Count: ${trophy.count}`;
    card.append(count);
  }

  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = spoilerHidden
    ? 'Guide hidden until earned (spoiler setting). Earn this trophy to reveal its guide.'
    : trophy.guide;
  card.append(guide);

  if (!spoilerHidden) {
    const src = document.createElement('p');
    src.className = 'sources';
    src.append(document.createTextNode('Sources: '));
    src.append(sourceNodes(trophy.sources));
    card.append(src);
  }

  return card;
}

function renderProgress() {
  const total = trophies.length;
  const count = earned.size;
  progressTextEl.textContent = `${count} of ${total} earned`;
  miniProgressEl.textContent = `${count}/${total} earned`;
  progressFillEl.style.width = total ? `${(count / total) * 100}%` : '0%';
  progressBarEl.setAttribute('aria-valuenow', String(count));
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return `${got}/${all} ${g}`;
  });
  gradeBreakdownEl.textContent = byGrade.join(' · ');
}

function render() {
  renderProgress();
  const visible = sortTrophies(trophies.filter(matchesFilters));
  listEl.replaceChildren();
  if (visible.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent =
      activeKind === 'online'
        ? 'GTA 6 has no online trophies — all 55 are single-player. (PowerPyx, Push Square)'
        : 'No trophies match these filters. Try clearing the search or choosing another kind.';
    listEl.append(empty);
  } else {
    for (const trophy of visible) listEl.append(buildCard(trophy));
  }
  resultCountEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
}

function exportProgress() {
  const payload = {
    app: 'gta6-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
  );
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  const valid = ids.filter((n) => Number.isInteger(n) && trophyById(n));
  if (valid.length === 0 && ids.length > 0) throw new Error('no known trophy ids');
  earned = new Set(valid);
  saveEarned();
  render();
}

function applyInitialState() {
  // Deep links for screenshots and sharing: ?kind=missable&spoiler=on&q=…
  if (params.get('grade')) gradeEl.value = params.get('grade');
  if (params.get('sort')) sortEl.value = params.get('sort');
  if (params.get('spoiler') === 'on') spoilerEl.checked = true;
  if (params.get('hideEarned') === 'on') hideEarnedEl.checked = true;
  if (params.get('q')) searchEl.value = params.get('q');
  document.querySelectorAll('#kind-chips .chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.kind === activeKind);
  });
}

async function init() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  trophies = doc.trophies ?? doc;
  applyInitialState();

  document.querySelectorAll('#kind-chips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      activeKind = chip.dataset.kind;
      document.querySelectorAll('#kind-chips .chip').forEach((c) => {
        c.classList.toggle('active', c === chip);
      });
      render();
    });
  });
  searchEl.addEventListener('input', render);
  gradeEl.addEventListener('change', render);
  sortEl.addEventListener('change', render);
  spoilerEl.addEventListener('change', render);
  hideEarnedEl.addEventListener('change', render);

  document.getElementById('export').addEventListener('click', exportProgress);
  document.getElementById('import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      await importProgress(file);
    } catch {
      alert('That file is not a trophy progress export from this guide.');
    }
    event.target.value = '';
  });
  document.getElementById('reset').addEventListener('click', () => {
    if (confirm('Clear all earned ticks? Export first if you want a backup.')) {
      earned = new Set();
      saveEarned();
      render();
    }
  });

  render();
}

init();
