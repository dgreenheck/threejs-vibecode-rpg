import * as THREE from 'three';
import Entity from '../Entity.js';
import { random } from '../../utils/MathUtils.js';

class NPC extends Entity {
  constructor(position, terrain) {
    super(position);
    this.terrain = terrain;
    this.health = 100;
    this.maxHealth = 100;
    this.speed = 0.05;
    this.heightOffset = 0.5; // Default height offset
    this.moveDirection = new THREE.Vector3(
      random(-1, 1),
      0,
      random(-1, 1)
    ).normalize();
    this.changeDirectionTime = 0;
    this.changeDirectionInterval = random(3, 8); // seconds

    // Add combat properties
    this.attackDamage = 10;
    this.attackRange = 2;
    this.attackCooldown = 0;
    this.attackCooldownTime = 2; // seconds
    this.isAggressive = true;
    this.aggroRange = 10;

    this.mesh = new THREE.Group();
    this.createMesh();
    this.createHealthBar();

    // Position the NPC
    this.updatePosition(position);
  }

  createMesh() {
    // Override in subclasses
  }

  createHealthBar() {
    // Create health bar container
    this.healthBarGroup = new THREE.Group();

    // Background bar (red)
    const bgGeometry = new THREE.PlaneGeometry(1, 0.15);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      depthTest: false
    });
    this.healthBarBg = new THREE.Mesh(bgGeometry, bgMaterial);

    // Foreground bar (green)
    const fgGeometry = new THREE.PlaneGeometry(1, 0.15);
    const fgMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      depthTest: false
    });
    this.healthBarFg = new THREE.Mesh(fgGeometry, fgMaterial);
    this.healthBarFg.position.z = 0.01; // Slightly in front of background

    // Health text
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 30;
    this.healthTextContext = canvas.getContext('2d');
    this.healthTextContext.font = '20px Arial';
    this.healthTextContext.fillStyle = 'white';
    this.healthTextContext.textAlign = 'center';
    this.healthTextContext.fillText(`${this.health}/${this.maxHealth}`, 50, 20);

    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      depthTest: false
    });
    const textGeometry = new THREE.PlaneGeometry(1, 0.3);
    this.healthText = new THREE.Mesh(textGeometry, textMaterial);
    this.healthText.position.y = 0.2;
    this.healthText.position.z = 0.02; // In front of bars

    // Add to health bar group
    this.healthBarGroup.add(this.healthBarBg);
    this.healthBarGroup.add(this.healthBarFg);
    this.healthBarGroup.add(this.healthText);

    // Position health bar above NPC
    this.healthBarGroup.position.y = 2.5;

    // Add to NPC mesh
    this.mesh.add(this.healthBarGroup);

    // Update health bar
    this.updateHealthBar();
  }

  updateHealthBar() {
    // Update health bar scale based on current health
    const healthPercent = this.health / this.maxHealth;
    this.healthBarFg.scale.x = healthPercent;
    this.healthBarFg.position.x = (healthPercent - 1) / 2;

    // Update health text
    this.healthTextContext.clearRect(0, 0, 100, 30);
    this.healthTextContext.fillText(`${this.health}/${this.maxHealth}`, 50, 20);
    this.healthText.material.map.needsUpdate = true;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();
    return this.health <= 0;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.updateHealthBar();
  }

  updatePosition(position) {
    this.position = position;

    // Use the heightOffset property
    this.mesh.position.set(
      position.x,
      position.y + this.heightOffset,
      position.z
    );
  }

  update(time, camera, player) {
    // Change direction periodically
    if (time > this.changeDirectionTime) {
      this.moveDirection.set(
        Math.random() * 2 - 1, // Random x direction between -1 and 1
        0,
        Math.random() * 2 - 1  // Random z direction between -1 and 1
      ).normalize();
      this.changeDirectionTime = time + this.changeDirectionInterval;
    }

    // Check if player is in range and we should attack
    if (player && this.isAggressive) {
      const distanceToPlayer = Math.sqrt(
        Math.pow(this.position.x - player.position.x, 2) +
        Math.pow(this.position.z - player.position.z, 2)
      );

      // If player is in aggro range, move toward player instead of random
      if (distanceToPlayer <= this.aggroRange) {
        // Calculate direction to player
        this.moveDirection.set(
          player.position.x - this.position.x,
          0,
          player.position.z - this.position.z
        ).normalize();

        // If in attack range and cooldown is ready, attack player
        if (distanceToPlayer <= this.attackRange && this.attackCooldown <= 0) {
          this.attackPlayer(player);
          this.attackCooldown = this.attackCooldownTime;
        }
      }

      // Update attack cooldown
      if (this.attackCooldown > 0) {
        this.attackCooldown -= time - (this.lastUpdateTime || time);
      }
      this.lastUpdateTime = time;
    }

    // Move NPC
    const newX = this.position.x + this.moveDirection.x * this.speed;
    const newZ = this.position.z + this.moveDirection.z * this.speed;

    // Get height at new position
    const newY = this.terrain.getHeight(newX, newZ);

    // Update position
    this.updatePosition({ x: newX, y: newY, z: newZ });

    // Make health bar face the camera
    if (camera) {
      this.healthBarGroup.lookAt(camera.position);
    }
  }

  attackPlayer(player) {
    console.log(`${this.constructor.name} attacks player for ${this.attackDamage} damage!`);
    player.takeDamage(this.attackDamage);
  }
}

export default NPC; 