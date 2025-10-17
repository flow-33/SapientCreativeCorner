# Creative Corner Navigation Extension

A Chrome extension that provides floating navigation buttons when you navigate away from the Creative Corner site, allowing you to easily return to where you left off.

## Features

- **Floating Navigation Buttons**: Transparent, modern glass-morphism design buttons in the bottom-left corner
- **Smart Detection**: Only appears when navigating away from Creative Corner or localhost
- **Back Button**: Returns to the exact page you were on (portfolio list, experiments list, etc.)
- **Home Button**: Always takes you to the Creative Corner home page
- **Responsive Design**: Works on both desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support

## Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download the Extension**
   - Clone or download this repository
   - Navigate to the `chrome_ext` folder

2. **Open Chrome Extensions Page**
   - Open Chrome browser
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `chrome_ext` folder
   - The extension should now appear in your extensions list

4. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Creative Corner Navigation" and click the pin icon

### Method 2: Install from Chrome Web Store (Coming Soon)

*This extension will be available on the Chrome Web Store in the future.*

## Usage

### How It Works

1. **Navigate to Creative Corner**
   - Go to https://flow-33.github.io/SapientCreativeCorner/
   - Browse the portfolio or experiments sections

2. **Click on an Experiment/Portfolio Item**
   - Click any experiment or portfolio item that opens an external website
   - The floating navigation buttons will automatically appear

3. **Use the Navigation Buttons**
   - **Back Button** (blue): Returns to the exact Creative Corner page you were on
   - **Home Button** (green): Always goes to the Creative Corner home page

### Button Behavior

- **Only appears on external sites**: Buttons never show on Creative Corner or localhost
- **Persistent across page refreshes**: Buttons remain visible when you refresh the external page
- **Smart memory**: Remembers which specific page you came from (portfolio list vs experiments list)
- **Auto-cleanup**: Navigation state is cleared when you close the tab or return to Creative Corner

## Technical Details

### Permissions

The extension requires the following permissions:
- `tabs`: To track navigation between tabs
- `storage`: To remember navigation state
- `webNavigation`: To detect when you navigate away from Creative Corner

### Privacy

- **No data collection**: The extension doesn't collect or store any personal data
- **Local storage only**: Navigation state is stored locally in your browser
- **No external requests**: All functionality works offline

### Browser Compatibility

- Chrome 88+ (Manifest V3 support required)
- Chromium-based browsers (Edge, Brave, etc.)

## Development

### File Structure

```
chrome_ext/
├── manifest.json      # Extension configuration
├── background.js      # Service worker for navigation tracking
├── content.js         # Content script for button injection
├── styles.css         # Button styling
└── README.md          # This file
```

### Building from Source

1. Clone the repository
2. Navigate to the `chrome_ext` directory
3. Load the extension in Chrome as described in the installation section

### Testing

1. Load the extension in Chrome
2. Navigate to https://flow-33.github.io/SapientCreativeCorner/
3. Click on an experiment or portfolio item
4. Verify floating buttons appear on the external site
5. Test both back and home button functionality

## Troubleshooting

### Buttons Not Appearing

1. **Check if you came from Creative Corner**: Buttons only appear when navigating away from the site
2. **Refresh the page**: Sometimes the content script needs a moment to load
3. **Check extension permissions**: Ensure the extension has the required permissions
4. **Disable other extensions**: Some extensions might interfere with content script injection

### Buttons Not Working

1. **Check console for errors**: Open Developer Tools (F12) and check the Console tab
2. **Reload the extension**: Go to `chrome://extensions/` and click the reload button
3. **Check if Creative Corner is accessible**: Ensure you can reach the site normally

### Performance Issues

1. **Clear extension data**: Go to `chrome://extensions/` → Details → Storage → Clear
2. **Restart Chrome**: Close all Chrome windows and restart
3. **Check for conflicts**: Disable other extensions temporarily

## Support

If you encounter any issues:

1. Check this README for troubleshooting steps
2. Open an issue on the GitHub repository
3. Include details about your Chrome version and any error messages

## License

MIT License - see LICENSE file for details.

## Version History

### v1.0.0
- Initial release
- Floating back and home buttons
- Smart navigation detection
- Glass-morphism design
- Responsive layout
