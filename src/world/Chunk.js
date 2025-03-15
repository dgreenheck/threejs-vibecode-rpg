import * as THREE from 'three';
import { CHUNK_SIZE, WATER_LEVEL, MAX_HEIGHT } from '../config/gameConfig.js';
import Tree from '../entities/decorations/Tree.js';
import Rock from '../entities/decorations/Rock.js';
import Bush from '../entities/decorations/Bush.js';

class Chunk {
  constructor(chunkX, chunkZ, terrain, noiseGenerator) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.terrain = terrain;
    this.noiseGenerator = noiseGenerator;
    this.worldOffsetX = chunkX * CHUNK_SIZE;
    this.worldOffsetZ = chunkZ * CHUNK_SIZE;

    this.mesh = new THREE.Group();
    this.mesh.userData = { chunkX, chunkZ };
    this.mesh.position.set(this.worldOffsetX, 0, this.worldOffsetZ);

    this.generateChunk();
  }

  generateChunk() {
    // Add terrain
    const terrainMesh = this.terrain.createTerrainMesh(
      CHUNK_SIZE,
      this.worldOffsetX,
      this.worldOffsetZ
    );
    this.mesh.add(terrainMesh);

    // Add decorations
    this.addDecorations();
  }

  addDecorations() {
    // Use a different seed for decoration placement
    const decorationSeed = this.noiseGenerator.getNoise(this.worldOffsetX * 0.1, this.worldOffsetZ * 0.1);

    // Place decorations - increase step size to maintain proper density with larger chunks
    for (let x = 0; x < CHUNK_SIZE; x += 4) { // Increased from 2
      for (let z = 0; z < CHUNK_SIZE; z += 4) { // Increased from 2
        const worldX = x + this.worldOffsetX;
        const worldZ = z + this.worldOffsetZ;
        const height = this.terrain.getHeight(worldX, worldZ);

        // Skip if underwater
        if (height <= WATER_LEVEL * MAX_HEIGHT) continue;

        // Random value for decoration type
        const noiseValue = this.noiseGenerator.getNoise(worldX * 0.1, worldZ * 0.1);

        // Add decoration based on noise value
        if (noiseValue > 0.8 && height > WATER_LEVEL * MAX_HEIGHT + 0.5) {
          // Tree (10% chance in suitable areas)
          const tree = new Tree({ x, y: height, z });
          this.mesh.add(tree.mesh);
        } else if (noiseValue < -0.8) {
          // Rock (10% chance)
          const rock = new Rock({ x, y: height, z });
          this.mesh.add(rock.mesh);
        } else if (noiseValue > 0.5 && noiseValue <= 0.8) {
          // Bush (15% chance)
          const bush = new Bush({ x, y: height, z });
          this.mesh.add(bush.mesh);
        }
      }
    }
  }

  dispose() {
    // Dispose of geometries and materials to free memory
    this.mesh.traverse(object => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}

export default Chunk; 