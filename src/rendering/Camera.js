import * as THREE from 'three';
import { PLAYER_HEIGHT } from '../config/gameConfig.js';

class Camera {
  constructor() {
    // Create camera
    this.instance = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.instance.position.set(0, PLAYER_HEIGHT, 0);

    // Set up mouse look controls
    this.rotation = {
      x: 0,
      y: 0
    };
    this.targetRotation = {
      x: 0,
      y: 0
    };
    this.sensitivity = 0.002;
    this.setupMouseControls();

    // Handle window resize
    window.addEventListener('resize', this.onResize.bind(this));
  }

  setupMouseControls() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Lock pointer for first person controls
    document.addEventListener('click', () => {
      document.body.requestPointerLock();
    });
  }

  onMouseMove(event) {
    // Only update if pointer is locked (first-person mode)
    if (document.pointerLockElement) {
      this.targetRotation.x -= event.movementY * this.sensitivity;
      this.targetRotation.y -= event.movementX * this.sensitivity;

      // Limit vertical rotation to prevent camera flipping
      this.targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotation.x));
    }
  }

  onResize() {
    this.instance.aspect = window.innerWidth / window.innerHeight;
    this.instance.updateProjectionMatrix();
  }

  update() {
    // Smooth camera rotation
    this.rotation.x += (this.targetRotation.x - this.rotation.x) * 0.1;
    this.rotation.y += (this.targetRotation.y - this.rotation.y) * 0.1;

    // Apply rotation
    this.instance.rotation.order = 'YXZ'; // This order prevents gimbal lock
    this.instance.rotation.x = this.rotation.x;
    this.instance.rotation.y = this.rotation.y;
  }
}

export default Camera; 