import * as THREE from 'three';
import { CHUNK_SIZE, COLORS, WATER_LEVEL, MAX_HEIGHT } from '../config/gameConfig.js';

class Water {
  constructor() {
    this.chunks = new Map();
  }

  createWaterChunk(chunkX, chunkZ) {
    const chunkKey = `${chunkX},${chunkZ}`;

    // Skip if water chunk already exists
    if (this.chunks.has(chunkKey)) {
      return this.chunks.get(chunkKey);
    }

    const worldOffsetX = chunkX * CHUNK_SIZE;
    const worldOffsetZ = chunkZ * CHUNK_SIZE;

    const waterGeometry = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, 1, 1);
    const waterMaterial = new THREE.MeshPhongMaterial({
      color: COLORS.water,
      transparent: true,
      opacity: 0.7,
      shininess: 100
    });

    const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(
      worldOffsetX + CHUNK_SIZE / 2,
      WATER_LEVEL * MAX_HEIGHT,
      worldOffsetZ + CHUNK_SIZE / 2
    );

    // Store the chunk
    this.chunks.set(chunkKey, waterMesh);

    return waterMesh;
  }

  updateWaterChunks(visibleChunks, scene) {
    // Add water chunks for visible terrain chunks
    for (const chunkKey of visibleChunks) {
      if (!this.chunks.has(chunkKey)) {
        const [chunkX, chunkZ] = chunkKey.split(',').map(Number);
        const waterChunk = this.createWaterChunk(chunkX, chunkZ);
        scene.add(waterChunk);
      }
    }

    // Remove water chunks that are no longer visible
    for (const [key, waterMesh] of this.chunks.entries()) {
      if (!visibleChunks.has(key)) {
        scene.remove(waterMesh);
        waterMesh.geometry.dispose();
        waterMesh.material.dispose();
        this.chunks.delete(key);
      }
    }
  }
}

export default Water; 