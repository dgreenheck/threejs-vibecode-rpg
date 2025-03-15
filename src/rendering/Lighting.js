import * as THREE from 'three';

class Lighting {
  constructor(scene) {
    this.scene = scene;
    this.setupLights();
  }

  setupLights() {
    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    // Directional light (sun)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(100, 100, 50);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);
  }
}

export default Lighting; 