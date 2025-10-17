// Configuration for Virtual OS
// Weekly refresh interval in milliseconds (7 days)
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const REFRESH_INTERVAL_MS = 7 * ONE_DAY_MS;

// Data sources (can later be switched to GitHub-hosted URLs)
export const DATA_SOURCES = {
  portfolio: 'data/portfolio.json',
  experiments: 'data/experiments.json',
};

// Also expose a global for non-bundled access in renderer
// This allows using <script type="module" src="config.js"> in index.html
if (typeof window !== 'undefined') {
  window.__VO_CFG__ = { REFRESH_INTERVAL_MS, DATA_SOURCES };
}



