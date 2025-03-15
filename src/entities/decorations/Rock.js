import * as THREE from 'three';
import Entity from '../Entity.js';
import { COLORS } from '../../config/gameConfig.js';
import { random } from '../../utils/MathUtils.js';

class Rock extends Entity {
  constructor(position) {
    super(position);
    this.createMesh();
  }

  createMesh() {
    const rockGeometry = new THREE.DodecahedronGeometry(0.8, 0);
    const rockMaterial = new THREE.MeshLambertMaterial({
      color: COLORS.rock,
      flatShading: true
    });
    this.mesh = new THREE.Mesh(rockGeometry, rockMaterial);

    // Position the rock
    this.mesh.position.set(this.position.x, this.position.y + 0.4, this.position.z);

    // Add some random rotation and scale variation
    this.mesh.rotation.set(
      random(0, Math.PI),
      random(0, Math.PI),
      random(0, Math.PI)
    );
    const scale = 1.0 + random(0, 1.5);
    this.mesh.scale.set(scale, scale * 0.7, scale);
  }
}

export default Rock; 