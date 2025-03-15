import * as THREE from 'three';
import NPC from './NPC.js';
import { random } from '../../utils/MathUtils.js';

class Skeleton extends NPC {
  constructor(position, terrain) {
    super(position, terrain);
    this.health = 80;
    this.maxHealth = 80;
    this.speed = 0.04; // Slower than goblin
    this.heightOffset = 0.5; // Specific height offset for Skeleton
    this.updateHealthBar();
  }

  createMesh() {
    // Body (box)
    const bodyGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.2);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    this.mesh.add(body);

    // Head (skull-like box)
    const headGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.1;
    this.mesh.add(head);

    // Eyes (black boxes)
    const eyeGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.05);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.08, 1.12, 0.18);
    this.mesh.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-0.08, 1.12, 0.18);
    this.mesh.add(rightEye);

    // Arms (thin boxes)
    const armGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(0.3, 0.6, 0);
    this.mesh.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(-0.3, 0.6, 0);
    this.mesh.add(rightArm);

    // Legs (thin boxes)
    const legGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(0.15, 0.1, 0);
    this.mesh.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(-0.15, 0.1, 0);
    this.mesh.add(rightLeg);

    // Weapon (sword)
    const swordHandleGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.05);
    const swordBladeGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.02);
    const swordHandleMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const swordBladeMaterial = new THREE.MeshLambertMaterial({ color: 0xa9a9a9 });

    const swordHandle = new THREE.Mesh(swordHandleGeometry, swordHandleMaterial);
    const swordBlade = new THREE.Mesh(swordBladeGeometry, swordBladeMaterial);
    swordBlade.position.y = 0.35;

    const sword = new THREE.Group();
    sword.add(swordHandle);
    sword.add(swordBlade);
    sword.position.set(0.3, 0.3, 0.2);
    sword.rotation.x = Math.PI / 4;

    this.mesh.add(sword);
  }

  update(time, camera) {
    super.update(time, camera);

    // Add some jerky movement
    if (Math.sin(time * 10) > 0.9) {
      this.mesh.rotation.y += 0.1;
    }
  }
}

export default Skeleton; 