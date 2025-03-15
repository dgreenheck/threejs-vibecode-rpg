import * as THREE from 'three';

class Renderer {
  constructor() {
    this.instance = new THREE.WebGLRenderer({
      antialias: true
    });

    this.instance.setSize(window.innerWidth, window.innerHeight);
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(this.instance.domElement);

    // Handle window resize
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    this.instance.setSize(window.innerWidth, window.innerHeight);
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render(scene, camera) {
    this.instance.render(scene, camera);
  }
}

export default Renderer; 