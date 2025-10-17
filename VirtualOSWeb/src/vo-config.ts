const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const REFRESH_INTERVAL_MS = 7 * ONE_DAY_MS;

export const DATA_SOURCES: Record<'portfolio' | 'experiments', string> = {
  portfolio: '/data/portfolio.json',
  experiments: '/data/experiments.json',
};


