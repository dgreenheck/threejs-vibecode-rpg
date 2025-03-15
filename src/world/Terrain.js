import * as THREE from 'three';
import { COLORS, WATER_LEVEL, MAX_HEIGHT } from '../config/gameConfig.js';

class Terrain {
  constructor(noiseGenerator) {
    this.noiseGenerator = noiseGenerator;
  }

  createTerrainMesh(chunkSize, worldOffsetX, worldOffsetZ) {
    // Generate terrain mesh
    const terrainGeometry = new THREE.PlaneGeometry(
      chunkSize,
      chunkSize,
      chunkSize - 1,
      chunkSize - 1
    );
    terrainGeometry.rotateX(-Math.PI / 2);

    // Adjust vertices based on noise
    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      // Use local coordinates for the vertices but global coordinates for noise
      const x = vertices[i] + worldOffsetX;
      const z = vertices[i + 2] + worldOffsetZ;
      vertices[i + 1] = this.getHeight(x, z);
    }

    // Update normals
    terrainGeometry.computeVertexNormals();

    // Create terrain material
    const terrainMaterial = new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: true
    });

    // Add vertex colors based on height
    const colors = [];
    for (let i = 0; i < vertices.length; i += 3) {
      const height = vertices[i + 1];
      let color = new THREE.Color(COLORS.grass);

      if (height < WATER_LEVEL * MAX_HEIGHT + 0.2) {
        color = new THREE.Color(COLORS.dirt);
      } else if (height > MAX_HEIGHT * 0.7) {
        color = new THREE.Color(COLORS.stone);
      }

      colors.push(color.r, color.g, color.b);
    }

    terrainGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3)
    );

    return new THREE.Mesh(terrainGeometry, terrainMaterial);
  }

  getHeight(x, z) {
    return this.noiseGenerator.getTerrainNoise(x, z) * MAX_HEIGHT;
  }
}

export default Terrain; 