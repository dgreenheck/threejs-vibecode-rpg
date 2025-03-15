import * as THREE from 'three';
import NPC from './NPC.js';
import { random } from '../../utils/MathUtils.js';

class Goblin extends NPC {
  constructor(position, terrain) {
    super(position, terrain);
    this.health = 50;
    this.maxHealth = 50;
    this.speed = 0.07; // Faster than base NPC
    this.heightOffset = 0.4; // Specific height offset for Goblin
    this.updateHealthBar();
  }

  createMesh() {
    // Body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    this.mesh.add(body);

    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.1;
    this.mesh.add(head);

    // Eyes (white spheres with black pupils)
    const eyeGeometry = new THREE.SphereGeometry(0.07, 8, 8);
    const eyeWhiteMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
    leftEye.position.set(0.12, 1.15, 0.18);
    this.mesh.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
    rightEye.position.set(-0.12, 1.15, 0.18);
    this.mesh.add(rightEye);

    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(0.12, 1.15, 0.24);
    this.mesh.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(-0.12, 1.15, 0.24);
    this.mesh.add(rightPupil);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(0.4, 0.7, 0);
    leftArm.rotation.z = -Math.PI / 4;
    this.mesh.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(-0.4, 0.7, 0);
    rightArm.rotation.z = Math.PI / 4;
    this.mesh.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(0.15, 0.1, 0);
    this.mesh.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(-0.15, 0.1, 0);
    this.mesh.add(rightLeg);
  }

  update(time, camera) {
    super.update(time, camera);

    // Add some bobbing motion
    this.mesh.position.y += Math.sin(time * 5) * 0.02;
  }
}

export default Goblin; 