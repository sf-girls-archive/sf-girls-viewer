# SF-Girls Viewer

## Overview

The **SF-Girls Viewer** is a web-based tool that allows players to explore in-game assets, animations, and character models from **SF Girls**. It provides an interactive way to view and analyze game resources with a streamlined interface.

![Preview](./static/img/example.gif)

## Features

- **Character Model Viewer** – Inspect detailed 2D/3D assets from the game
- **Animation Playback** – Play character animations with adjustable speed and settings
- **Stage Export** – Save the full animated canvas as a looping GIF or MP4 video
- **Shareable stage state** – Agent and animation selections, plus all loaded animations, sync with the URL for refreshable and shareable views
- **Asset Exploration** – Browse and analyze in-game textures, sprites, and effects
- **Optimized Performance** – Lightweight and efficient for smooth operation

MP4 export depends on browser support for MP4 canvas recording. GIF export is
available independently of that support.

## Getting Started

1. Clone this repository (with submodules):

   ```bash
   git clone --recurse-submodules https://github.com/sf-girls-archive/sf-girls-viewer
   ```

   > If you already cloned the repo without `--recurse-submodules`, initialize the submodule manually:
   >
   > ```bash
   > git submodule update --init --recursive
   > ```

2. Navigate to the project directory:

   ```bash
   cd sf-girls-viewer
   ```

3. Pull LFS (Large File Storage) assets inside the submodule:

   ```bash
   cd public/sf-girls-assets
   git lfs pull
   cd ../../
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

   Or use an alternative package manager:

   ```bash
   yarn dev
   pnpm dev
   bun dev
   ```

6. Open your browser and go to [http://localhost:5173](http://localhost:5173) to access the viewer.

## Updating Assets

If you update the assets in the submodule, be sure to regenerate the entity map:

```bash
npm run generate-entity-map
npm run generate-gallery-thumbnails
```

Gallery thumbnail generation requires ImageMagick 7.

## Requirements

- **Node.js** (Latest LTS version recommended)
- **Git LFS** (required for large asset files)
- **NPM, Yarn, PNPM, or Bun** for package management
- **Modern Web Browser** (Chrome, Firefox, Edge, etc.)

## Disclaimer

This project is a **fan-made** tool and is **not affiliated** with or endorsed by the developers of **SF Girls**. All assets belong to their respective owners. This tool is for **educational and personal use only**.

## License

This repository is for **personal and educational use only**. Redistribution or commercial use is prohibited.

## Contact

For any issues, suggestions, or contributions, feel free to create an **issue** or reach out via GitHub.

---

Explore and enjoy the **SF-Girls Viewer**! 🎨
