// Configuration
const REFRESH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DATA_SOURCES = {
  portfolio: './api/data.json',
  experiments: './api/data.json'
};

function byId(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

function ensureBackgroundCircles() {
  let group = launcher.querySelector('#vo-circle-group');
  if (!group) {
    group = document.createElement('div');
    group.id = 'vo-circle-group';
    group.className = 'vo-circle-group';
  }
  const classes = ['vo-circle-small','vo-circle-medium','vo-circle-large','vo-circle-xlarge','vo-circle-xxlarge'];
  const children = [];
  for (const cls of classes) {
    let el = group.querySelector(`.${cls}`);
    if (!el) {
      el = document.createElement('div');
      el.className = `vo-bg-circle ${cls}`;
    }
    children.push(el);
  }
  group.replaceChildren(...children);
  return group;
}

function openLauncher() {
  viewport.classList.add('hidden');
  launcher.classList.remove('hidden');
  content.classList.remove('drawer-open');
  drawer.setAttribute('aria-hidden', 'true');
  frame.src = '';
  const circleGroup = ensureBackgroundCircles();
  launcher.replaceChildren(circleGroup, logo);
  addLeftButtons();
}

function openPortfolio(project) {
  const { url, title, details } = project;
  byId('app-name').textContent = title || 'Portfolio';
  drawerContent.innerHTML = details || '';
  frame.src = url;
  launcher.classList.add('hidden');
  viewport.classList.remove('hidden');

  const failNoticeId = 'vo-load-fail';
  let cleared = false;
  const showFail = () => {
    if (cleared) return;
    let notice = document.getElementById(failNoticeId);
    if (!notice) {
      notice = document.createElement('div');
      notice.id = failNoticeId;
      notice.className = 'vo-fail';
      notice.innerHTML = `<div style="display:grid;gap:8px;text-align:center">
          <div style="font-weight:600">This site may block embedding in an app</div>
          <a href="${url}" target="_blank" rel="noopener" class="vo-cta" style="justify-self:center">Open in browser</a>
        </div>`;
      viewport.appendChild(notice);
    }
  };
  const timer = window.setTimeout(showFail, 3000);
  frame.addEventListener('load', () => {
    cleared = true;
    window.clearTimeout(timer);
    const existing = document.getElementById(failNoticeId);
    if (existing) existing.remove();
  }, { once: true });
}

function getThumbnail(item) {
  if (item.image) return item.image;
  const link = item.link || item.url || '';
  if (!link) return '';
  try {
    const u = new URL(link);
    return `https://www.google.com/s2/favicons?sz=256&domain=${u.hostname}`;
  } catch { return ''; }
}

function toggleDrawer() {
  const isOpen = content.classList.toggle('drawer-open');
  drawer.setAttribute('aria-hidden', String(!isOpen));
}

function storageKey(name) { return `vo.cache.${name}`; }
function isStale(entryTs, maxAgeMs) { return !entryTs || (Date.now() - entryTs) > maxAgeMs; }

async function fetchWithWeeklyCache(name, url, maxAgeMs) {
  const isLocalDataFile = typeof url === 'string' && (url.startsWith('/api/') || url.startsWith('api/'));
  const resolvedUrl = isLocalDataFile ? `${url.startsWith('/') ? url : '/' + url}?v=${Date.now()}` : url;
  if (isLocalDataFile) {
    const res = await fetch(resolvedUrl, { cache: 'no-store' });
    return await res.json();
  }
  const key = storageKey(name);
  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (cached && !isStale(cached.ts, maxAgeMs)) return cached.data;
  } catch {}
  const res = await fetch(resolvedUrl, { cache: 'no-store' });
  const data = await res.json();
  localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  return data;
}

function renderGallery(items) {
  const grid = document.createElement('div');
  grid.className = 'vo-gallery-grid';
  for (const item of items) {
    const card = document.createElement('button');
    card.className = 'vo-card';
    const thumb = getThumbnail(item) || item.thumbnail || '';
    card.innerHTML = `
        <div class="vo-card-thumb" style="background-image:url('${thumb}')">
          <div class="vo-card-overlay">
            <button class="vo-cta" data-action="launch">${item.type === 'Client Work' ? 'View Work' : 'Launch Experiment'}</button>
            <button class="vo-cta secondary" data-action="overview">${item.type === 'Client Work' ? 'Case Study' : 'Overview'}</button>
          </div>
        </div>
        <div class="vo-card-meta">
          <div class="vo-card-title">${item.title || 'Untitled'}</div>
          <div class="vo-card-sub">${item.type === 'Client Work' ? (item.industry || '') : (item.author || '')}</div>
          <div class="vo-card-desc">${item.description || ''}</div>
        </div>`;
    card.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      const action = actionEl ? actionEl.getAttribute('data-action') : 'launch';
      if (action === 'overview') {
        drawerContent.innerHTML = item.details || '';
        content.classList.add('drawer-open');
        drawer.setAttribute('aria-hidden', 'false');
      } else {
        openPortfolio({ url: item.link || item.url, title: item.title, details: item.details });
      }
    });
    grid.appendChild(card);
  }
  return grid;
}

async function showCollection(kind) {
  const data = await fetchWithWeeklyCache(kind, DATA_SOURCES[kind], REFRESH_INTERVAL_MS);
  let items = data.items || [];
  if (items.length && items[0].type) {
    items = items.filter((it) => (kind === 'portfolio' ? it.type === 'Client Work' : it.type === 'Experiment'));
  }
  launcher.replaceChildren();
  const back = document.createElement('button');
  back.className = 'vo-back';
  back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg><span>Home</span>';
  back.addEventListener('click', openLauncher);
  launcher.appendChild(back);
  const header = document.createElement('div');
  header.className = 'vo-collection-header';
  header.textContent = kind === 'portfolio' ? 'Portfolio' : 'Experiments';
  launcher.appendChild(header);
  launcher.appendChild(renderGallery(items));
}

function addLeftButtons() {
  const buttons = document.createElement('div');
  buttons.className = 'vo-left-buttons';
  buttons.innerHTML = `
      <button class="vo-circle" data-collection="portfolio"><span>Portfolio</span></button>
      <button class="vo-circle alt" data-collection="experiments"><span>Experiments</span></button>
    `;
  launcher.appendChild(buttons);
  launcher.addEventListener('click', (e) => {
    const b = e.target.closest('[data-collection]');
    if (!b) return;
    showCollection(b.getAttribute('data-collection'));
  });
}

// Build static structure
const appRoot = document.getElementById('app');
appRoot.innerHTML = `
  <main class="vo-main">
    <section id="launcher" class="vo-launcher" role="list">
      <div id="vo-circle-group" class="vo-circle-group">
        <div class="vo-bg-circle vo-circle-small"></div>
        <div class="vo-bg-circle vo-circle-medium"></div>
        <div class="vo-bg-circle vo-circle-large"></div>
        <div class="vo-bg-circle vo-circle-xlarge"></div>
        <div class="vo-bg-circle vo-circle-xxlarge"></div>
        <div class="vo-noise"></div>
      </div>
      <img id="cc-logo" class="vo-logo" src="./assets/CCLogo.svg" alt="Creative Corner logo" />
    </section>
    <section id="app-viewport" class="vo-viewport hidden" aria-live="polite">
      <div class="vo-appbar">
        <div id="app-name" class="vo-appname">Portfolio</div>
        <div class="vo-appbar-actions">
          <button id="btn-toggle-drawer" class="vo-button">Details</button>
          <button id="btn-exit-app" class="vo-button">Exit</button>
        </div>
      </div>
      <div class="vo-content">
        <iframe id="portfolio-frame" title="Portfolio" class="vo-frame" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-pointer-lock allow-downloads allow-top-navigation-by-user-activation"></iframe>
        <aside id="drawer" class="vo-drawer" aria-hidden="true">
          <div class="vo-drawer-header">About this project</div>
          <div id="drawer-content" class="vo-drawer-content"></div>
        </aside>
      </div>
    </section>
  </main>
  <div class="vo-version" aria-label="Version">v0.1.1</div>
`;

const launcher = byId('launcher');
const viewport = byId('app-viewport');
const btnExit = byId('btn-exit-app');
const btnToggleDrawer = byId('btn-toggle-drawer');
const content = document.querySelector('.vo-content');
const drawer = byId('drawer');
const frame = byId('portfolio-frame');
const drawerContent = byId('drawer-content');
const logo = byId('cc-logo');

btnExit.addEventListener('click', openLauncher);
btnToggleDrawer.addEventListener('click', toggleDrawer);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || (e.key.toLowerCase() === 'h' && !e.metaKey)) {
    openLauncher();
  } else if (e.key.toLowerCase() === 'd') {
    if (!viewport.classList.contains('hidden')) toggleDrawer();
  }
});

openLauncher();
addLeftButtons();

// Design controls for background waves
function createControls() {
  const panel = document.createElement('div');
  panel.className = 'vo-controls';
  panel.innerHTML = `
    <h4>Background Waves</h4>
    <div class="row"><label>Brightness</label><input id="ctl-bright" type="range" min="0" max="2" step="0.01" value="1"><output id="out-bright">1.00</output></div>
    <div class="row"><label>Base</label><input id="ctl-base" type="range" min="0" max="2" step="0.01" value="1"><output id="out-base">1.00</output></div>
    <div class="row"><label>Opacity</label><input id="ctl-opacity" type="range" min="0" max="1" step="0.01" value="1"><output id="out-opacity">1.00</output></div>
    <div class="row"><label>Noise</label><input id="ctl-noise" type="range" min="0" max="0.2" step="0.005" value="0.03"><output id="out-noise">0.03</output></div>
  `;
  document.body.appendChild(panel);

  const controls = [
    { input: panel.querySelector('#ctl-bright'), out: panel.querySelector('#out-bright'), varName: '--vo-brightness' },
    { input: panel.querySelector('#ctl-base'), out: panel.querySelector('#out-base'), varName: '--vo-base-scale' },
    { input: panel.querySelector('#ctl-opacity'), out: panel.querySelector('#out-opacity'), varName: '--vo-circle-opacity' },
    { input: panel.querySelector('#ctl-noise'), out: panel.querySelector('#out-noise'), varName: '--vo-noise' },
  ];

  const rootStyle = document.documentElement.style;
  for (const { input, out, varName } of controls) {
    const apply = () => {
      const val = Number(input.value);
      rootStyle.setProperty(varName, String(val));
      out.value = val.toFixed(2);
    };
    input.addEventListener('input', apply);
    apply();
  }
}

createControls(); // Show controls