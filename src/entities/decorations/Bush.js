import * as THREE from 'three';
import Entity from '../Entity.js';
import { COLORS } from '../../config/gameConfig.js';
import { random } from '../../utils/MathUtils.js';

class Bush extends Entity {
  constructor(position) {
    super(position);
    this.createMesh();
  }

  createMesh() {
    const bushGeometry = new THREE.DodecahedronGeometry(0.8, 1);
    const bushMaterial = new THREE.MeshLambertMaterial({
      color: COLORS.bush,
      flatShading: true
    });
    this.mesh = new THREE.Mesh(bushGeometry, bushMaterial);

    // Position the bush
    this.mesh.position.set(this.position.x, this.position.y + 0.5, this.position.z);

    // Add some random scale variation
    const scale = 0.7 + random(0, 0.5);
    this.mesh.scale.set(scale, scale, scale);
  }
}

export default Bush; 