// Configuration for Flow Web App
// Weekly refresh interval in milliseconds (7 days)
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const REFRESH_INTERVAL_MS = 7 * ONE_DAY_MS;

// Data sources - using API endpoints
export const DATA_SOURCES = {
  portfolio: 'api/portfolio.json',
  experiments: 'api/experiments.json',
  knowledge: 'api/knowledge.json',
};

// Also expose a global for non-bundled access in app.js
// This allows using <script type="module" src="app-config.js"> in app.html
if (typeof window !== 'undefined') {
  window.__VO_CFG__ = { REFRESH_INTERVAL_MS, DATA_SOURCES };
}
