# Frida

**Frida** is a web-based image processing tool that generates responsive image variants from a single high-resolution source. Upload a 3x master image and instantly create optimized 2x, 1.5x, and 1x versions in PNG, JPEG, and WebP formats.

## What It Does

- **Multi-Scale Generation**: Automatically creates 2x, 1.5x, and 1x variants from a 3x source image
- **Multi-Format Export**: Generates PNG, JPEG (92% quality), and WebP (90% quality) for each scale
- **High-Quality Resizing**: Uses [Pica](https://github.com/nodeca/pica) for superior image interpolation and color management
- **Visual Comparison**: Side-by-side comparison slider to review quality across formats
- **Batch Download**: Download individual files or all variants at once
- **Client-Side Processing**: All image processing happens in the browser—no server uploads required

## Tech Stack

### Build System & Framework
- **[Vite](https://vite.dev/)** (v7.2.2) - Ultra-fast build tool and dev server with native ES modules
- **[React](https://react.dev/)** (v19.2.0) - UI framework
- **[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)** - Uses Babel for Fast Refresh during development

### UI & Components
- **[@mantine/core](https://mantine.dev/)** (v8.3.8) - Component library for layout and controls
- **[@mantine/hooks](https://mantine.dev/hooks/use-media-query/)** - React hooks for common UI patterns
- **[@tabler/icons-react](https://tabler.io/icons)** (v3.35.0) - Icon set
- **[@img-comparison-slider/react](https://img-comparison-slider.sneas.io/)** (v8.0.2) - Interactive image comparison component

### Image Processing
- **[Pica](https://github.com/nodeca/pica)** (v9.0.1) - High-quality image resize library using Canvas and Web Workers
- **Canvas API** - Browser-native image manipulation and format conversion

### Code Quality
- **[ESLint](https://eslint.org/)** (v9.39.1) - Linting with React-specific rules
- **eslint-plugin-react-hooks** - Enforces React Hooks rules
- **eslint-plugin-react-refresh** - Validates Fast Refresh constraints

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation
```bash
npm install
```

### Development
Start the development server with Hot Module Replacement:
```bash
npm run dev
```
The app will be available at `http://localhost:5173/frida/`

### Build
Create an optimized production build:
```bash
npm run build
```
Output will be in the `dist/` directory.

### Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

### Linting
Check code for errors and style issues:
```bash
npm run lint
```

## Configuration

### Vite Configuration
The project uses a custom base path (`/frida/`) configured in `vite.config.js`:
```javascript
{
  base: '/frida/',
  worker: {
    format: 'es'
  }
}
```

### Build Output
- **Format**: ES modules (native browser imports)
- **Optimization**: Automatic code splitting, tree-shaking, and minification
- **Assets**: Hashed filenames for optimal caching

## How It Works

1. User uploads a 3x resolution source image
2. Image is loaded into an HTML5 Canvas element
3. Pica resizes the canvas to target dimensions (2x, 1.5x, 1x) using high-quality interpolation
4. Each resized canvas is converted to PNG, JPEG, and WebP formats
5. Files are made available for individual or batch download via object URLs
6. All processing happens client-side—no data leaves the browser

## Browser Support

Requires modern browsers with support for:
- Canvas API with `toBlob()`
- ES6+ modules
- WebP encoding (for WebP output)
- Object URL creation

Tested on latest versions of Chrome, Firefox, Safari, and Edge.

## License

Private project (see `package.json`).
