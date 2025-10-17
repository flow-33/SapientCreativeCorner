(() => {
  // Config is exposed on window by app-config.js module
  async function loadConfig() { return window.__VO_CFG__; }
  const launcher = document.getElementById('launcher');
  const viewport = document.getElementById('app-viewport');
  const btnExit = document.getElementById('btn-exit-app');
  const btnToggleDrawer = document.getElementById('btn-toggle-drawer');
  const content = document.querySelector('.vo-content');
  const drawer = document.getElementById('drawer');
  const frame = document.getElementById('portfolio-frame');
  const drawerContent = document.getElementById('drawer-content');
  const logo = document.getElementById('cc-logo');

  function openLauncher() {
    viewport.classList.add('hidden');
    launcher.classList.remove('hidden');
    // Reset drawer
    content.classList.remove('drawer-open');
    drawer.setAttribute('aria-hidden', 'true');
    frame.src = '';
    // Rebuild launcher content: keep logo and add buttons, but preserve animated background
    if (logo && logo.parentElement !== launcher) {
      launcher.appendChild(logo);
    }
    
    // Remove only interactive elements, keep animated background
    const interactiveElements = launcher.querySelectorAll('.vo-left-buttons, .vo-gallery-grid, .vo-collection-header, .vo-back');
    interactiveElements.forEach(el => el.remove());
    
    // Ensure logo is at the top
    if (logo.parentElement !== launcher) {
      launcher.appendChild(logo);
    } else {
      launcher.insertBefore(logo, launcher.firstChild);
    }
    
    addLeftButtons();
  }

  function openPortfolio(project) {
    const { url, title, details } = project;
    document.getElementById('app-name').textContent = title || 'Portfolio';
    drawerContent.innerHTML = details || '';
    frame.src = url;
    launcher.classList.add('hidden');
    viewport.classList.remove('hidden');

    // Fallback notice if a site blocks iframing (e.g., X-Frame-Options/CSP)
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
    const timer = setTimeout(showFail, 3000);
    frame.addEventListener('load', () => {
      cleared = true;
      clearTimeout(timer);
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

  // Demo data for now; replace with real portfolio entries later
  const defaultProject = {
    title: 'Flow Portfolio',
    url: 'https://flow-33.github.io/SapientCreativeCorner/',
    details: '<p><strong>Role:</strong> Design & Development</p><p><strong>Team:</strong> Flow Team</p><p><strong>Notes:</strong> This is the main Flow portfolio showcasing creative experiments and client work.</p>',
  };

  launcher.addEventListener('click', (e) => {
    const tile = e.target.closest('[data-app]');
    if (!tile) return;
    const app = tile.getAttribute('data-app');
    if (app === 'portfolio') {
      openPortfolio(defaultProject);
    }
  });

  btnExit.addEventListener('click', openLauncher);
  btnToggleDrawer.addEventListener('click', toggleDrawer);

  // Basic keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || (e.key.toLowerCase() === 'h' && !e.metaKey)) {
      openLauncher();
    } else if (e.key.toLowerCase() === 'd') {
      if (!viewport.classList.contains('hidden')) toggleDrawer();
    }
  });

  function storageKey(name) { return `vo.cache.${name}`; }
  function isStale(entryTs, maxAgeMs) { return !entryTs || (Date.now() - entryTs) > maxAgeMs; }

  async function fetchWithWeeklyCache(name, url, maxAgeMs) {
    // For local JSON inside api/, bypass cache to reflect immediate edits
    const isLocalDataFile = typeof url === 'string' && url.startsWith('api/');
    if (isLocalDataFile) {
      const res = await fetch(`${url}?v=${Date.now()}`, { cache: 'no-store' });
      return await res.json();
    }
    const key = storageKey(name);
    try {
      const cached = JSON.parse(localStorage.getItem(key) || 'null');
      if (cached && !isStale(cached.ts, maxAgeMs)) return cached.data;
    } catch {}
    const res = await fetch(url, { cache: 'no-store' });
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
          // Open details drawer only
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
    const { REFRESH_INTERVAL_MS, DATA_SOURCES } = await loadConfig();
    const data = await fetchWithWeeklyCache(kind, DATA_SOURCES[kind], REFRESH_INTERVAL_MS);
    let items = data.items || [];
    // If the file is a unified knowledge base shape, filter by type; otherwise use as-is
    if (items.length && items[0].type) {
      items = items.filter((it) => (kind === 'portfolio' ? it.type === 'Client Work' : it.type === 'Experiment'));
    }
    // Reuse viewport drawer and iframe; replace launcher with gallery, but preserve animated background
    const interactiveElements = launcher.querySelectorAll('.vo-left-buttons, .vo-gallery-grid, .vo-collection-header, .vo-back');
    interactiveElements.forEach(el => el.remove());
    
    // Back home control
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

  // Wire launcher buttons (now three: portfolio, experiments, and knowledge)
  function addLeftButtons() {
    const buttons = document.createElement('div');
    buttons.className = 'vo-left-buttons';
    buttons.innerHTML = `
      <button class="vo-circle" data-collection="portfolio"><span>Portfolio</span></button>
      <button class="vo-circle alt" data-collection="experiments"><span>Experiments</span></button>
      <button class="vo-circle" data-collection="knowledge"><span>Knowledge</span></button>
    `;
    launcher.appendChild(buttons);
    launcher.addEventListener('click', (e) => {
      const b = e.target.closest('[data-collection]');
      if (!b) return;
      showCollection(b.getAttribute('data-collection'));
    });
  }

  // Create animated background (only once)
  function createAnimatedBackground() {
    const launcher = document.getElementById('launcher');
    
    // Check if background already exists
    if (launcher.querySelector('.vo-bg-circle')) {
      return;
    }
    
    // Create animated circles
    const circles = [
      { class: 'vo-circle-small', delay: 0 },
      { class: 'vo-circle-medium', delay: 0.3 },
      { class: 'vo-circle-large', delay: 0.6 },
      { class: 'vo-circle-xlarge', delay: 0.9 },
      { class: 'vo-circle-xxlarge', delay: 1.2 }
    ];
    
    circles.forEach(circle => {
      const circleEl = document.createElement('div');
      circleEl.className = `vo-bg-circle ${circle.class}`;
      circleEl.style.animationDelay = `${circle.delay}s`;
      launcher.appendChild(circleEl);
    });
    
    // Add noise overlay
    const noise = document.createElement('div');
    noise.className = 'vo-noise';
    launcher.appendChild(noise);
  }

  // Create animation controls
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

  // Start at launcher
  openLauncher();
  addLeftButtons();
  createAnimatedBackground();
  createControls(); // Uncomment this line to show controls
})();
