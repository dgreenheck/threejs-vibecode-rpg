import * as THREE from 'three';
import Renderer from '../rendering/Renderer.js';
import Camera from '../rendering/Camera.js';
import Lighting from '../rendering/Lighting.js';
import World from '../world/World.js';
import Input from './Input.js';
import Time from './Time.js';
import Player from '../entities/Player.js';

class Engine {
  constructor() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    // Initialize systems
    this.renderer = new Renderer();
    this.camera = new Camera();
    this.lighting = new Lighting(this.scene);
    this.input = new Input();
    this.time = new Time();

    // Create world
    this.world = new World(this.scene);

    // Create player with camera
    this.player = new Player(this.camera);

    // Start game loop
    this.update();
  }

  update() {
    // Update time
    this.time.update();
    const deltaTime = this.time.delta;

    // Update world and get NPCs
    const npcs = this.world.npcManager.npcs;
    this.world.update(this.time.elapsed, this.player.position, this.camera.instance);

    // Update player with NPCs for combat
    this.player.update(this.input, this.world.terrain, deltaTime, npcs);

    // Update camera
    this.camera.update();

    // Render
    this.renderer.render(this.scene, this.camera.instance);

    // Call next frame
    requestAnimationFrame(this.update.bind(this));
  }
}

export default Engine; 