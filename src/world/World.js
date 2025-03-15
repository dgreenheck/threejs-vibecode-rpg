import * as THREE from 'three';
import { CHUNK_SIZE, VISIBLE_CHUNKS_RADIUS } from '../config/gameConfig.js';
import Chunk from './Chunk.js';
import Water from './Water.js';
import Terrain from './Terrain.js';
import NoiseGenerator from '../utils/NoiseGenerator.js';
import NPCManager from '../entities/npc/NPCManager.js';

class World {
  constructor(scene) {
    this.scene = scene;
    this.chunks = new Map();
    this.chunksGroup = new THREE.Group();
    this.scene.add(this.chunksGroup);

    this.noiseGenerator = new NoiseGenerator();
    this.terrain = new Terrain(this.noiseGenerator);
    this.water = new Water();

    // Create NPC manager
    this.npcManager = new NPCManager(scene, this.terrain);

    this.generateInitialChunks();
  }

  generateInitialChunks() {
    const radius = 2; // Initial chunks radius
    const visibleChunks = new Set();

    for (let x = -radius; x <= radius; x++) {
      for (let z = -radius; z <= radius; z++) {
        const chunkKey = `${x},${z}`;
        visibleChunks.add(chunkKey);
        this.createChunk(x, z);
      }
    }

    // Initialize water chunks
    this.water.updateWaterChunks(visibleChunks, this.scene);
  }

  createChunk(chunkX, chunkZ) {
    const chunkKey = `${chunkX},${chunkZ}`;

    // Skip if chunk already exists
    if (this.chunks.has(chunkKey)) return;

    // Create new chunk
    const chunk = new Chunk(chunkX, chunkZ, this.terrain, this.noiseGenerator);
    this.chunks.set(chunkKey, chunk);
    this.chunksGroup.add(chunk.mesh);
  }

  updateChunks(cameraPosition) {
    const cameraChunkX = Math.floor(cameraPosition.x / CHUNK_SIZE);
    const cameraChunkZ = Math.floor(cameraPosition.z / CHUNK_SIZE);

    // Track which chunks should be visible
    const visibleChunks = new Set();

    // Create chunks that should be visible
    for (let x = cameraChunkX - VISIBLE_CHUNKS_RADIUS; x <= cameraChunkX + VISIBLE_CHUNKS_RADIUS; x++) {
      for (let z = cameraChunkZ - VISIBLE_CHUNKS_RADIUS; z <= cameraChunkZ + VISIBLE_CHUNKS_RADIUS; z++) {
        const chunkKey = `${x},${z}`;
        visibleChunks.add(chunkKey);

        // Create chunk if it doesn't exist
        if (!this.chunks.has(chunkKey)) {
          this.createChunk(x, z);
        }
      }
    }

    // Remove chunks that are too far away
    for (const [key, chunk] of this.chunks.entries()) {
      if (!visibleChunks.has(key)) {
        this.chunksGroup.remove(chunk.mesh);
        chunk.dispose();
        this.chunks.delete(key);
      }
    }

    // Update water chunks
    this.water.updateWaterChunks(visibleChunks, this.scene);
  }

  update(time, playerPosition, camera) {
    // Update chunks
    this.updateChunks(playerPosition);

    // Update NPCs
    this.npcManager.update(time, playerPosition, camera);
  }
}

export default World; 