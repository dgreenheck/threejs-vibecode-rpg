import * as THREE from 'three';

class Time {
  constructor() {
    this.clock = new THREE.Clock();
    this.delta = 0;
    this.elapsed = 0;
  }

  update() {
    this.delta = this.clock.getDelta();
    this.elapsed = this.clock.getElapsedTime();
  }
}

export default Time; 