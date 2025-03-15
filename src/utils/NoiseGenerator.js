import { createNoise2D } from 'simplex-noise';

class NoiseGenerator {
  constructor() {
    this.noise2D = createNoise2D();
  }

  // Get noise value at coordinates
  getNoise(x, z, scale = 1) {
    return (this.noise2D(x * scale, z * scale) + 1) / 2;
  }

  // Get combined noise for terrain
  getTerrainNoise(x, z) {
    // Use smaller scale values to spread out terrain features
    // Large scale terrain features
    const mountainNoise = this.getNoise(x, z, 0.005);

    // Medium scale terrain features
    const hillNoise = this.getNoise(x, z, 0.02);

    // Small scale terrain features
    const detailNoise = this.getNoise(x, z, 0.1);

    // Combine noise at different scales
    let height = mountainNoise * 0.6 + hillNoise * 0.3 + detailNoise * 0.1;

    // Apply power function to create more flat areas and steeper mountains
    height = Math.pow(height, 1.5);

    return height;
  }
}

export default NoiseGenerator; 