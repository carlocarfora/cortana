# Cortana Dashboard

A simple, elegant static dashboard built with HTML, Tailwind CSS, and Vanilla JavaScript featuring Catppuccin theming and keyboard shortcuts.

## Features

- **Catppuccin Theme**: Beautiful Mocha (dark) and Latte (light) color schemes
- **Grouped Sections**: Organize apps into categories (Dev Tools, Media, Home Server, etc.)
- **Search & Filter**: Real-time search across app names and descriptions
- **Keyboard Shortcuts**: Press 1-9 to quickly open the first 9 visible apps
- **Live Clock**: Always-updated time and date display
- **Dark/Light Mode**: Toggle between themes with localStorage persistence
- **Responsive Design**: Adapts to desktop, tablet, and mobile screens
- **Zero Dependencies**: Works locally without any build process or server

## Project Structure

```
cortana/
├── index.html          # Main dashboard page
├── app.js             # JavaScript for rendering cards and theme toggle
├── data.json          # Link data with grouped sections
└── README.md          # This file
```

## Quick Start

1. Simply open `index.html` in your web browser
2. No build process or server required!
3. Customize `data.json` to add your own apps and sections

## Usage

### Navigation

- **Click**: Click any app card to open it in a new tab
- **Search**: Type in the search bar to filter apps by name or description
- **Keyboard Shortcuts**: Press number keys 1-9 to open apps (shortcuts shown on cards)
- **Theme Toggle**: Click the theme toggle button in the header to switch between dark/light mode

### Customizing Apps

Edit `data.json` to add or modify apps and sections:

```json
{
  "sections": [
    {
      "title": "Your Section",
      "color": "blue",
      "apps": [
        {
          "name": "App Name",
          "description": "Brief description",
          "url": "https://example.com",
          "icon": "wrench"
        }
      ]
    }
  ]
}
```

**Available Colors**: `blue`, `pink`, `green`, `peach`, `red`, `yellow`, `lavender`, `mauve`

**Icons**: Use any [Lucide icon name](https://lucide.dev/icons) (e.g., `wrench`, `home`, `code`, `server`, `github`, `music`, etc.)

## Color Palette

### Catppuccin Mocha (Dark)
- Background: `#1e1e2e`
- Surface: `#313244`
- Text: `#cdd6f4`
- Blue: `#89b4fa`
- Pink: `#f5c2e7`
- Green: `#a6e3a1`
- Peach: `#fab387`

### Catppuccin Latte (Light)
- Background: `#eff1f5`
- Surface: `#ccd0da`
- Text: `#4c4f69`
- Blue: `#1e66f5`
- Pink: `#ea76cb`
- Green: `#40a02b`
- Peach: `#fe640b`

## Technical Details

- **No Build Required**: Pure HTML/CSS/JS with CDN resources
- **Tailwind CSS**: Utility-first CSS framework via CDN
- **Lucide Icons**: Beautiful icon library via CDN
- **Responsive Grid**: 1 column (mobile), 2 columns (tablet), 3-4 columns (desktop)
- **Smooth Animations**: Hover effects and theme transitions
- **localStorage**: Theme preference persists across sessions

## Browser Support

Works on all modern browsers that support:
- CSS Custom Properties
- ES6+ JavaScript (async/await, arrow functions, etc.)
- Fetch API
- localStorage

## License

Free to use and modify for personal or commercial projects.

## Credits

- **Catppuccin**: [Catppuccin Theme](https://github.com/catppuccin/catppuccin)
- **Tailwind CSS**: [Tailwind CSS](https://tailwindcss.com)
- **Lucide Icons**: [Lucide](https://lucide.dev)
