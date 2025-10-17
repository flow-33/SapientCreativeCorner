import './styles.css';

import { REFRESH_INTERVAL_MS, DATA_SOURCES } from './vo-config';

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

function ensureBackgroundCircles(): HTMLElement {
  let group = launcher.querySelector<HTMLElement>('#vo-circle-group');
  if (!group) {
    group = document.createElement('div');
    group.id = 'vo-circle-group';
    group.className = 'vo-circle-group';
  }
  const classes = ['vo-circle-small','vo-circle-medium','vo-circle-large','vo-circle-xlarge','vo-circle-xxlarge'];
  const children: HTMLElement[] = [];
  for (const cls of classes) {
    let el = group.querySelector<HTMLElement>(`.${cls}`);
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

function openPortfolio(project: { url: string; title?: string; details?: string }) {
  const { url, title, details } = project;
  byId<HTMLDivElement>('app-name').textContent = title || 'Portfolio';
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

function getThumbnail(item: any): string {
  if (item.image) return item.image as string;
  const link = (item.link || item.url || '') as string;
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

function storageKey(name: string) { return `vo.cache.${name}`; }
function isStale(entryTs: number, maxAgeMs: number) { return !entryTs || (Date.now() - entryTs) > maxAgeMs; }

async function fetchWithWeeklyCache<T>(name: string, url: string, maxAgeMs: number): Promise<T> {
  const isLocalDataFile = typeof url === 'string' && (url.startsWith('/data/') || url.startsWith('data/') || url.startsWith('/api/') || url.startsWith('api/'));
  const resolvedUrl = isLocalDataFile ? `${url.startsWith('/') ? url : '/' + url}?v=${Date.now()}` : url;
  console.log(`Fetching from: ${resolvedUrl}`);
  if (isLocalDataFile) {
    const res = await fetch(resolvedUrl, { cache: 'no-store' });
    console.log('API response status:', res.status);
    return await res.json();
  }
  const key = storageKey(name);
  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (cached && !isStale(cached.ts, maxAgeMs)) return cached.data as T;
  } catch {}
  const res = await fetch(resolvedUrl, { cache: 'no-store' });
  const data = await res.json();
  localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  return data as T;
}

function renderGallery(items: any[]) {
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
      const actionEl = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
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

async function showCollection(kind: 'portfolio' | 'experiments') {
  console.log(`Loading ${kind} from:`, DATA_SOURCES[kind]);
  const data = await fetchWithWeeklyCache<any>(kind, DATA_SOURCES[kind], REFRESH_INTERVAL_MS);
  console.log('Loaded data:', data);
  let items: any[] = data.items || [];
  console.log('Items before filter:', items.length);
  if (items.length && items[0].type) {
    items = items.filter((it) => (kind === 'portfolio' ? it.type === 'Client Work' : it.type === 'Experiment'));
  }
  console.log('Items after filter:', items.length);
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
  console.log('Adding left buttons...');
  const buttons = document.createElement('div');
  buttons.className = 'vo-left-buttons';
  buttons.innerHTML = `
      <button class="vo-circle" data-collection="portfolio"><span>Portfolio</span></button>
      <button class="vo-circle alt" data-collection="experiments"><span>Experiments</span></button>
    `;
  launcher.appendChild(buttons);
  console.log('Left buttons added:', buttons);
  launcher.addEventListener('click', (e) => {
    console.log('Launcher clicked:', e.target);
    console.log('Event target tagName:', (e.target as HTMLElement).tagName);
    console.log('Event target className:', (e.target as HTMLElement).className);
    const b = (e.target as HTMLElement).closest('[data-collection]') as HTMLElement | null;
    console.log('Found button:', b, 'Collection:', b?.getAttribute('data-collection'));
    if (!b) {
      console.log('No button found, checking all data-collection elements:');
      const allButtons = launcher.querySelectorAll('[data-collection]');
      console.log('All buttons found:', allButtons.length, allButtons);
      return;
    }
    showCollection(b.getAttribute('data-collection') as 'portfolio' | 'experiments');
  });
}

// Build static structure via TS rather than static HTML to keep one codepath
const appRoot = document.getElementById('app')!;
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

const launcher = byId<HTMLElement>('launcher');
const viewport = byId<HTMLElement>('app-viewport');
const btnExit = byId<HTMLButtonElement>('btn-exit-app');
const btnToggleDrawer = byId<HTMLButtonElement>('btn-toggle-drawer');
const content = document.querySelector('.vo-content') as HTMLElement;
const drawer = byId<HTMLElement>('drawer');
const frame = byId<HTMLIFrameElement>('portfolio-frame');
const drawerContent = byId<HTMLDivElement>('drawer-content');
const logo = byId<HTMLImageElement>('cc-logo');

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

  type Ctl = { input: HTMLInputElement; out: HTMLOutputElement; varName: string };
  const controls: Ctl[] = [
    { input: panel.querySelector('#ctl-bright') as HTMLInputElement, out: panel.querySelector('#out-bright') as HTMLOutputElement, varName: '--vo-brightness' },
    { input: panel.querySelector('#ctl-base') as HTMLInputElement, out: panel.querySelector('#out-base') as HTMLOutputElement, varName: '--vo-base-scale' },
    { input: panel.querySelector('#ctl-opacity') as HTMLInputElement, out: panel.querySelector('#out-opacity') as HTMLOutputElement, varName: '--vo-circle-opacity' },
    { input: panel.querySelector('#ctl-noise') as HTMLInputElement, out: panel.querySelector('#out-noise') as HTMLOutputElement, varName: '--vo-noise' },
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

// Debug: Check if elements exist
console.log('Background circles:', document.querySelectorAll('.vo-bg-circle').length);
console.log('Controls panel:', document.querySelector('.vo-controls'));
console.log('Circle group:', document.querySelector('#vo-circle-group'));
