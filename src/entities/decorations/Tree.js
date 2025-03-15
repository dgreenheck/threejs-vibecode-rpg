import * as THREE from 'three';
import Entity from '../Entity.js';
import { COLORS } from '../../config/gameConfig.js';
import { random } from '../../utils/MathUtils.js';

class Tree extends Entity {
  constructor(position) {
    super(position);
    this.createMesh();
  }

  createMesh() {
    this.mesh = new THREE.Group();

    // Tree trunk (cylinder)
    const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.5, 4, 5, 1);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: COLORS.treeTrunk });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(0, 2, 0);
    this.mesh.add(trunk);

    // Tree leaves (cone)
    const leavesGeometry = new THREE.ConeGeometry(2, 5, 6);
    const leavesMaterial = new THREE.MeshLambertMaterial({
      color: COLORS.treeLeaves,
      flatShading: true
    });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(0, 6, 0);
    this.mesh.add(leaves);

    // Position the tree
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);

    // Add some random rotation and scale variation
    this.mesh.rotation.y = Math.random() * Math.PI * 2;
    const scale = 1.5 + random(0, 0.7);
    this.mesh.scale.set(scale, scale, scale);
  }
}

export default Tree; 