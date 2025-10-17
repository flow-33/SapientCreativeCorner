# Flow Static Site

This directory contains the static site files for the Flow project, designed to be deployed to GitHub Pages.

## Structure

```
src/site/
├── index.html          # Main demo page
├── app.html           # Full web app (Electron app port)
├── app.css            # App styling
├── app.js             # App functionality
├── app-config.js      # App configuration
├── assets/            # Images and assets
│   ├── CCLogo.png
│   └── creative-corner-bg.png
├── api/               # API endpoints
│   ├── data.json      # Combined data endpoint
│   ├── portfolio.json # Portfolio data
│   ├── experiments.json # Experiments data
│   └── knowledge.json # Knowledge base data
└── README.md          # This file
```

## Features

- **Demo HTML Page**: Interactive showcase of the Flow project data
- **Full Web App**: Complete port of the Electron app to web (`app.html`)
- **API Endpoints**: JSON data accessible via `/api/*.json` endpoints
- **Responsive Design**: Mobile-first approach with clean, modern UI
- **GitHub Pages Ready**: Configured for automatic deployment

## API Endpoints

- `/api/data.json` - Combined data from all sources
- `/api/portfolio.json` - Portfolio items
- `/api/experiments.json` - Creative experiments
- `/api/knowledge.json` - Knowledge base items

## Local Development

1. Build the site:
   ```bash
   npm run build-site
   ```

2. Serve locally:
   ```bash
   npm run serve-site
   ```

3. Visit `http://localhost:8000` to view the site

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch via the GitHub Actions workflow in `.github/workflows/deploy.yml`.

## Customization

- Edit `index.html` to modify the demo page
- Update JSON files in the `api/` directory to change data
- Modify the GitHub Actions workflow for different deployment settings
