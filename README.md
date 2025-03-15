# Low-Poly Infinite World Generator

A procedurally generated infinite world for a 3D RPG game using Three.js and Vite.

## Features

- Procedurally generated infinite terrain with hills and valleys
- Low-poly art style with flat shading
- Water bodies at lower elevations
- Procedurally placed trees, rocks, and bushes
- First-person camera controls (WASD to move, mouse to look)
- Dynamic chunk loading based on player position
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v14.x or later recommended)
- npm or yarn

### Installation

1. Clone this repository or download the files
2. Install dependencies:

```bash
npm install
# or
yarn
```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

This will start a local development server at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

Build the project for production:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## How It Works

### Terrain Generation

The terrain is generated using Simplex noise at multiple scales:
- Large scale noise creates mountains and valleys
- Medium scale noise adds hills and depressions
- Small scale noise adds terrain details

### World Chunking

The world is divided into chunks that are:
- Dynamically loaded as the player moves
- Unloaded when too far from the player to save memory
- Seamlessly connected to create an infinite world

### Decorations

Decorations are procedurally placed based on terrain height and noise values:
- Trees appear on higher ground away from water
- Rocks are scattered throughout the terrain
- Bushes appear in suitable locations based on noise values

## Customization

You can customize various aspects of the world by modifying constants in the code:

- `WORLD_SIZE`: Controls the overall size of the visible world
- `CHUNK_SIZE`: Controls the size of individual terrain chunks
- `MAX_HEIGHT`: Controls the maximum height of terrain features
- `WATER_LEVEL`: Controls the water level (as a percentage of MAX_HEIGHT)
- `COLORS`: Object containing all colors used in the world

## License

MIT 