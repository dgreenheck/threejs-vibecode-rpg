import * as THREE from 'three';

class Entity {
  constructor(position = { x: 0, y: 0, z: 0 }) {
    this.position = position;
    this.mesh = null;
  }

  update() {
    // Base update method to be overridden
  }
}

export default Entity; 