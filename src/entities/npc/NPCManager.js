import { random, randomInt } from '../../utils/MathUtils.js';
import { CHUNK_SIZE, WATER_LEVEL, MAX_HEIGHT } from '../../config/gameConfig.js';
import Goblin from './Goblin.js';
import Skeleton from './Skeleton.js';

class NPCManager {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;
    this.npcs = [];
    this.maxNPCs = 20; // Maximum number of NPCs in the world
    this.spawnRadius = 50; // Spawn within this radius of player
    this.despawnRadius = 80; // Despawn if further than this from player
  }

  spawnNPC(playerPosition) {
    // Don't spawn if we've reached the maximum
    if (this.npcs.length >= this.maxNPCs) return;

    // Random position within spawn radius
    const angle = random(0, Math.PI * 2);
    const distance = random(20, this.spawnRadius);
    const x = playerPosition.x + Math.cos(angle) * distance;
    const z = playerPosition.z + Math.sin(angle) * distance;

    // Get height at position
    const y = this.terrain.getHeight(x, z);

    // Don't spawn in water
    if (y <= WATER_LEVEL * MAX_HEIGHT) return;

    // Create random NPC type
    const npcType = randomInt(0, 1);
    let npc;

    if (npcType === 0) {
      npc = new Goblin({ x, y, z }, this.terrain);
    } else {
      npc = new Skeleton({ x, y, z }, this.terrain);
    }

    // Add to scene and list
    this.scene.add(npc.mesh);
    this.npcs.push(npc);
  }

  update(time, playerPosition, camera, player) {
    // Try to spawn a new NPC occasionally
    if (Math.random() < 0.01 && this.npcs.length < this.maxNPCs) {
      this.spawnNPC(playerPosition);
    }

    // Update all NPCs
    for (let i = this.npcs.length - 1; i >= 0; i--) {
      const npc = this.npcs[i];

      // Update NPC with player reference
      npc.update(time, camera, player);

      // Check if NPC is too far from player
      const distanceToPlayer = Math.sqrt(
        Math.pow(npc.position.x - playerPosition.x, 2) +
        Math.pow(npc.position.z - playerPosition.z, 2)
      );

      if (distanceToPlayer > this.despawnRadius) {
        // Remove NPC
        this.scene.remove(npc.mesh);
        this.npcs.splice(i, 1);
      }
    }
  }
}

export default NPCManager; 