import * as THREE from 'three';
import Entity from './Entity.js';
import { PLAYER_HEIGHT } from '../config/gameConfig.js';

class Player extends Entity {
  constructor(camera) {
    super();
    this.camera = camera;
    this.velocity = new THREE.Vector3();
    this.speed = 0.1;

    // Combat properties
    this.attackCooldown = 0;
    this.attackDuration = 1.0; // seconds
    this.attackDamage = 20;
    this.attackRange = 2.5;
    this.isAttacking = false;

    // Add player health properties
    this.health = 100;
    this.maxHealth = 100;
    this.isDead = false;
    this.invulnerableTime = 0;
    this.invulnerableDuration = 1.0; // seconds of invulnerability after taking damage

    // Initialize player position
    this.position = {
      x: 0,
      y: PLAYER_HEIGHT,
      z: 0
    };

    // Create sword
    this.createSword();

    // Create health display
    this.createHealthDisplay();

    // Update camera position to match player
    this.updateCameraPosition();
  }

  createSword() {
    console.log("Creating sword for player");
    // Create sword group
    this.sword = new THREE.Group();

    // Sword handle
    const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
    const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.rotation.x = Math.PI / 2;
    this.sword.add(handle);

    // Sword blade
    const bladeGeometry = new THREE.BoxGeometry(0.05, 0.7, 0.01);
    const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.y = 0.45;
    this.sword.add(blade);

    // Sword guard
    const guardGeometry = new THREE.BoxGeometry(0.15, 0.03, 0.03);
    const guardMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.position.y = 0.1;
    this.sword.add(guard);

    // Position sword in front and to the right of camera - make it more visible
    this.sword.position.set(0.5, -0.2, -0.7);
    this.sword.rotation.set(0, 0, 0);

    // Add sword to camera
    this.camera.instance.add(this.sword);

    // Store original position and rotation for animation
    this.swordRestPosition = new THREE.Vector3(0.5, -0.2, -0.7);
    this.swordRestRotation = new THREE.Vector3(0, 0, 0);
  }

  attack() {
    console.log("Attack method called");
    if (this.attackCooldown <= 0 && !this.isAttacking) {
      this.isAttacking = true;
      this.attackCooldown = this.attackDuration;
      console.log("Attack started - sword should swing");
      return true;
    }
    return false;
  }

  updateAttack(deltaTime, npcs) {
    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    // Handle attack animation
    if (this.isAttacking) {
      // Calculate attack progress (0 to 1)
      const progress = 1 - (this.attackCooldown / this.attackDuration);

      // Swing animation
      if (progress < 0.5) {
        // First half of swing (0 to 0.5)
        const swingProgress = progress * 2; // 0 to 1

        // Move sword in a more dramatic arc
        this.sword.position.x = this.swordRestPosition.x - swingProgress * 0.5;
        this.sword.position.y = this.swordRestPosition.y + swingProgress * 0.3;

        // Rotate sword more dramatically
        this.sword.rotation.z = this.swordRestRotation.z + swingProgress * Math.PI;
        this.sword.rotation.y = this.swordRestRotation.y + swingProgress * Math.PI / 3;
      } else {
        // Second half of swing (0.5 to 1)
        const swingProgress = (progress - 0.5) * 2; // 0 to 1

        // Return to rest position
        this.sword.position.x = this.swordRestPosition.x - 0.5 + swingProgress * 0.5;
        this.sword.position.y = this.swordRestPosition.y + 0.3 - swingProgress * 0.3;

        // Return to rest rotation
        this.sword.rotation.z = this.swordRestRotation.z + Math.PI - swingProgress * Math.PI;
        this.sword.rotation.y = this.swordRestRotation.y + Math.PI / 3 - swingProgress * Math.PI / 3;
      }

      // Check for hits at the middle of the swing
      if (progress >= 0.25 && progress <= 0.5) {
        this.checkHits(npcs);
      }

      // End attack
      if (progress >= 1) {
        this.isAttacking = false;
        console.log("Attack ended");

        // Reset sword position
        this.sword.position.copy(this.swordRestPosition);
        this.sword.rotation.set(
          this.swordRestRotation.x,
          this.swordRestRotation.y,
          this.swordRestRotation.z
        );
      }
    }
  }

  checkHits(npcs) {
    if (!npcs || npcs.length === 0) return;

    console.log("Checking for hits against", npcs.length, "enemies");

    // Get player's forward direction
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.camera.instance.quaternion);

    // Check each NPC
    for (const npc of npcs) {
      // Calculate vector to NPC
      const toNPC = new THREE.Vector3(
        npc.position.x - this.position.x,
        0, // Ignore Y difference
        npc.position.z - this.position.z
      );

      // Calculate distance to NPC
      const distance = toNPC.length();

      // Check if NPC is in range
      if (distance <= this.attackRange) {
        // Normalize direction to NPC
        toNPC.normalize();

        // Calculate dot product to check if NPC is in front of player
        const dot = forward.dot(toNPC);

        // If dot product is positive, NPC is in front of player
        if (dot > 0.5) { // Within ~60 degree cone
          console.log("Hit detected on enemy at distance", distance);

          // Apply damage
          const killed = npc.takeDamage(this.attackDamage);

          if (killed) {
            console.log("Enemy killed!");
          }
        }
      }
    }
  }

  updateCameraPosition() {
    this.camera.instance.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );
  }

  createHealthDisplay() {
    // Create a canvas for the health bar
    this.healthCanvas = document.createElement('canvas');
    this.healthCanvas.width = 200;
    this.healthCanvas.height = 30;
    this.healthCanvas.style.position = 'absolute';
    this.healthCanvas.style.bottom = '20px';
    this.healthCanvas.style.left = '20px';
    document.body.appendChild(this.healthCanvas);

    // Update the health display
    this.updateHealthDisplay();
  }

  updateHealthDisplay() {
    const ctx = this.healthCanvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, this.healthCanvas.width, this.healthCanvas.height);

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.healthCanvas.width, this.healthCanvas.height);

    // Draw health bar
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? 'green' : healthPercent > 0.25 ? 'orange' : 'red';
    ctx.fillRect(5, 5, (this.healthCanvas.width - 10) * healthPercent, this.healthCanvas.height - 10);

    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Health: ${this.health}/${this.maxHealth}`, this.healthCanvas.width / 2, this.healthCanvas.height / 2);
  }

  takeDamage(amount) {
    // Check if player is invulnerable
    if (this.invulnerableTime > 0) return;

    console.log(`Player takes ${amount} damage!`);
    this.health = Math.max(0, this.health - amount);
    this.updateHealthDisplay();

    // Make player invulnerable for a short time
    this.invulnerableTime = this.invulnerableDuration;

    // Flash the screen red to indicate damage
    this.flashDamage();

    // Check if player is dead
    if (this.health <= 0) {
      this.die();
    }

    return this.health <= 0;
  }

  flashDamage() {
    // Create a red overlay that fades out
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    overlay.style.pointerEvents = 'none';
    overlay.style.transition = 'opacity 0.5s';
    document.body.appendChild(overlay);

    // Fade out and remove
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 500);
    }, 100);
  }

  die() {
    this.isDead = true;
    console.log("Player has died!");

    // Show death screen
    const deathScreen = document.createElement('div');
    deathScreen.style.position = 'absolute';
    deathScreen.style.top = '0';
    deathScreen.style.left = '0';
    deathScreen.style.width = '100%';
    deathScreen.style.height = '100%';
    deathScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    deathScreen.style.display = 'flex';
    deathScreen.style.justifyContent = 'center';
    deathScreen.style.alignItems = 'center';
    deathScreen.style.flexDirection = 'column';
    deathScreen.style.color = 'white';
    deathScreen.style.fontSize = '32px';
    deathScreen.style.fontFamily = 'Arial, sans-serif';
    deathScreen.innerHTML = `
      <h1>You Died</h1>
      <p>Press R to respawn</p>
    `;
    document.body.appendChild(deathScreen);

    // Add event listener for respawn
    const respawnHandler = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        this.respawn();
        document.body.removeChild(deathScreen);
        document.removeEventListener('keydown', respawnHandler);
      }
    };
    document.addEventListener('keydown', respawnHandler);
  }

  respawn() {
    this.isDead = false;
    this.health = this.maxHealth;
    this.updateHealthDisplay();

    // Reset position to origin
    this.position = {
      x: 0,
      y: PLAYER_HEIGHT,
      z: 0
    };
    this.updateCameraPosition();
  }

  update(input, terrain, deltaTime, npcs) {
    // Don't update if player is dead
    if (this.isDead) return;

    // Update invulnerability timer
    if (this.invulnerableTime > 0) {
      this.invulnerableTime -= deltaTime;
    }

    // Reset velocity
    this.velocity.set(0, 0, 0);

    // Get movement direction based on camera rotation
    const direction = new THREE.Vector3();
    const rotation = this.camera.rotation.y;

    // Calculate forward/backward movement
    if (input.keys.forward) {
      direction.x -= Math.sin(rotation);
      direction.z -= Math.cos(rotation);
    }
    if (input.keys.backward) {
      direction.x += Math.sin(rotation);
      direction.z += Math.cos(rotation);
    }

    // Calculate left/right movement
    if (input.keys.right) {
      direction.x += Math.sin(rotation + Math.PI / 2);
      direction.z += Math.cos(rotation + Math.PI / 2);
    }
    if (input.keys.left) {
      direction.x += Math.sin(rotation - Math.PI / 2);
      direction.z += Math.cos(rotation - Math.PI / 2);
    }

    // Normalize direction vector to maintain consistent speed in all directions
    if (direction.length() > 0) {
      direction.normalize();

      // Apply speed
      this.velocity.x = direction.x * this.speed;
      this.velocity.z = direction.z * this.speed;

      // Update position
      this.position.x += this.velocity.x;
      this.position.z += this.velocity.z;

      // Update y position based on terrain height if terrain is provided
      if (terrain) {
        const terrainHeight = terrain.getHeight(this.position.x, this.position.z);
        this.position.y = terrainHeight + PLAYER_HEIGHT;
      }

      // Update camera position
      this.updateCameraPosition();
    }

    // Handle attack input
    if (input.keys.attack) {
      console.log("Attack key detected in player update");
      this.attack();
    }

    // Update attack state
    this.updateAttack(deltaTime, npcs);
  }
}

export default Player; 