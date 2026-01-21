# Cortana Dashboard - Claude Project Documentation

## Project Overview
A beautiful, static dashboard inspired by Halo's Cortana AI with Catppuccin theming. Built with vanilla HTML, CSS (Tailwind), and JavaScript - no build process required.

## Tech Stack
- **HTML5** - Semantic markup
- **Tailwind CSS** (CDN) - Utility-first styling
- **Vanilla JavaScript** - No frameworks
- **Lucide Icons** (CDN) - Icon library
- **Catppuccin Theme** - Mocha (dark) and Latte (light) color palettes

## Project Structure
```
cortana/
├── index.html          # Main dashboard page with all markup and styles
├── app.js             # JavaScript for rendering, interactions, and updates
├── data.json          # App links and quick links data
├── cortana-bg.png     # Cortana holographic background image (5% opacity)
├── README.md          # User-facing documentation
└── CLAUDE.md          # This file - Claude project context
```

## Key Features

### 1. Catppuccin Theming
- **Dark Mode (Mocha)**: Default theme with deep blues and purples
- **Light Mode (Latte)**: Alternative theme with lighter colors
- **Color Variables**: CSS custom properties for easy theming
- **Accent Colors**: Section-specific colors (blue, pink, green, peach, red, yellow, lavender, mauve)
- **Theme Toggle**: Persists to localStorage

### 2. Dynamic Content
- **Grouped App Sections**: Apps organized by category with color-coded headers
- **Quick Links Sidebar**: Text links for frequently accessed sites
- **World Clocks**: Live time display for 4 timezones (London, Naples, Philippines, LA)
- **Cortana Quotes**: Random Halo quotes (50 total) displayed on page load
- **Live Date/Time**: Updates every second

### 3. Interactive Features
- **Search/Filter**: Real-time app filtering across name and description
- **Auto-Focus Search**: Start typing anywhere to search
- **Keyboard Shortcuts**: Press 1-9 to open first 9 visible apps
- **Visual Indicators**: Shortcut numbers shown on cards
- **Hover Effects**: Colorful borders and animations on cards

### 4. Visual Design
- **Cortana Background**: Subtle holographic Cortana at 5% opacity, fills entire viewport
- **Semi-Transparent UI**: All cards/boxes at 95% opacity for layered effect
- **Colorful Cards**: Border colors match section themes
- **Flag Icons**: World clocks use country flags (🇬🇧 🇮🇹 🇵🇭 🇺🇸)
- **Responsive Layout**: 2-column main layout, adapts to mobile

### 5. Header Layout
- **Top Bar**:
  - Title: "cortana.carlocarfora.co.uk" (blue)
  - Random Cortana quote (purple, italic)
  - Local date/time
  - World clocks (4 timezones in bordered container)
  - Theme toggle (moon/sun icon only)
- **Search Bar**: Full-width below header

### 6. Main Layout (2-Column)
- **Left (Main)**: Grouped app card sections
- **Right (Sidebar)**: Quick links with section-style header

## Data Structure

### data.json
```json
{
  "quickLinks": [
    { "name": "Link Name", "url": "https://..." }
  ],
  "sections": [
    {
      "title": "Section Name",
      "color": "blue|pink|green|peach|...",
      "apps": [
        {
          "name": "App Name",
          "description": "Brief description",
          "url": "https://...",
          "icon": "lucide-icon-name"
        }
      ]
    }
  ]
}
```

## JavaScript Functions

### Core Functions
- `loadData()` - Fetches data.json
- `renderSections()` - Renders app sections with filtering
- `renderCard(app, sectionColor)` - Creates individual app cards with colored borders
- `renderQuickLinks()` - Renders sidebar links
- `filterApps(query)` - Filters apps based on search

### Interactive Functions
- `setupKeyboardShortcuts()` - Handles 1-9 key presses
- `setupAutoFocusSearch()` - Auto-focuses search on typing
- `toggleTheme()` - Switches dark/light mode
- `updateDateTime()` - Updates local time every second
- `updateWorldClocks()` - Updates 4 world clocks every second
- `displayCortanaQuote()` - Shows random Halo quote

### State Management
- `appData` - Loaded JSON data
- `currentSearchQuery` - Active search string
- `visibleApps` - Array of visible apps for keyboard shortcuts
- `localStorage.theme` - Theme preference persistence

## Color System

### Catppuccin Mocha (Dark)
```css
--ctp-base: #1e1e2e       /* Background */
--ctp-surface0: #313244   /* Cards */
--ctp-text: #cdd6f4       /* Primary text */
--ctp-blue: #89b4fa
--ctp-pink: #f5c2e7
--ctp-green: #a6e3a1
--ctp-peach: #fab387
--ctp-mauve: #cba6f7      /* Quote color */
```

### Section Color Mapping
```javascript
{
  blue: '#89b4fa',    // Dev Tools
  pink: '#f5c2e7',    // Media
  green: '#a6e3a1',   // Home Server, Quick Links
  peach: '#fab387',   // Productivity
  red: '#f38ba8',
  yellow: '#f9e2af',
  lavender: '#b4befe',
  mauve: '#cba6f7'
}
```

## Styling Notes

### Transparency Strategy
- **Background**: Cortana image at 5% opacity
- **UI Elements**: All cards/boxes at 95% opacity
- Creates subtle layering effect showing Cortana through UI

### Card Styling
- Base: `var(--ctp-surface0)` at 95% opacity
- Border: 2px, color based on section
- Hover: Border color intensifies, slight lift transform
- Icons: Colored background matching section theme

### Responsive Breakpoints
- Mobile: 1 column
- Tablet (md): 2 columns for app cards
- Desktop (lg): 2-column main layout (content + sidebar)

## Browser Compatibility
- Modern browsers with ES6+ support
- CSS Custom Properties
- Fetch API
- localStorage

## Development Notes

### No Build Process
- All dependencies via CDN
- Works with simple HTTP server: `python3 -m http.server 8080`
- Can't use `file://` protocol (CORS blocks fetch)

### Customization Points
1. **Apps**: Edit `data.json` sections array
2. **Quick Links**: Edit `data.json` quickLinks array
3. **Quotes**: Edit `cortanaQuotes` array in `app.js`
4. **Colors**: Modify section `color` property in `data.json`
5. **World Clocks**: Edit `worldClocks` array in `app.js`
6. **Background**: Replace `cortana-bg.png` or adjust opacity in CSS

### Key CSS Classes
- `.card` - App card styling
- `.sidebar` - Quick links container
- `.world-clocks-header` - Clock container
- `.theme-toggle` - Theme button
- `.search-input` - Search bar
- `.section-header` - Section titles
- `.shortcut-badge` - Keyboard shortcut numbers

## Future Enhancement Ideas
- Drag-and-drop card reordering
- Customizable sections via UI
- More world clock locations
- Weather widget
- RSS feed integration
- Bookmarklet for quick add
- Import/export data.json
- Custom background upload

## Credits
- **Catppuccin Theme**: https://github.com/catppuccin/catppuccin
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
- **Cortana/Halo**: Microsoft/343 Industries
