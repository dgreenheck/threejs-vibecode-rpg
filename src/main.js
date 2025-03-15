import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNoise2D } from 'simplex-noise';

// Initialize the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Initialize the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30);
camera.lookAt(0, 0, 0);

// Initialize the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 100;
controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground

// World generation parameters
const WORLD_SIZE = 100;
const CHUNK_SIZE = 20;
const MAX_HEIGHT = 8;
const WATER_LEVEL = 0.3;

// Colors
const COLORS = {
  grass: 0x7CFC00,
  dirt: 0x8B4513,
  stone: 0x808080,
  water: 0x1E90FF,
  treeLeaves: 0x228B22,
  treeTrunk: 0x8B4513,
  bush: 0x006400,
  rock: 0x696969
};

// Initialize noise generator
const noise2D = createNoise2D();

// Create chunks container
const chunks = new THREE.Group();
scene.add(chunks);

// Add water plane
const waterGeometry = new THREE.PlaneGeometry(WORLD_SIZE * 2, WORLD_SIZE * 2);
const waterMaterial = new THREE.MeshPhongMaterial({
  color: COLORS.water,
  transparent: true,
  opacity: 0.7,
  shininess: 100
});
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
water.position.y = WATER_LEVEL * MAX_HEIGHT;
scene.add(water);

// Function to generate terrain height using noise
function getHeight(x, z) {
  // Large scale terrain features
  const mountainNoise = (noise2D(x * 0.01, z * 0.01) + 1) / 2;

  // Medium scale terrain features
  const hillNoise = (noise2D(x * 0.05, z * 0.05) + 1) / 2;

  // Small scale terrain features
  const detailNoise = (noise2D(x * 0.2, z * 0.2) + 1) / 2;

  // Combine noise at different scales
  let height = mountainNoise * 0.6 + hillNoise * 0.3 + detailNoise * 0.1;

  // Apply power function to create more flat areas and steeper mountains
  height = Math.pow(height, 1.5);

  return height * MAX_HEIGHT;
}

// Function to generate a terrain chunk
function generateChunk(chunkX, chunkZ) {
  const chunkGroup = new THREE.Group();
  chunkGroup.userData = { chunkX, chunkZ };

  // Set the position of the chunk group
  const worldOffsetX = chunkX * CHUNK_SIZE;
  const worldOffsetZ = chunkZ * CHUNK_SIZE;
  chunkGroup.position.set(worldOffsetX, 0, worldOffsetZ);

  // Generate terrain mesh
  const terrainGeometry = new THREE.PlaneGeometry(
    CHUNK_SIZE,
    CHUNK_SIZE,
    CHUNK_SIZE - 1,
    CHUNK_SIZE - 1
  );
  terrainGeometry.rotateX(-Math.PI / 2);

  // Adjust vertices based on noise
  const vertices = terrainGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    // Use local coordinates for the vertices but global coordinates for noise
    const x = vertices[i] + worldOffsetX;
    const z = vertices[i + 2] + worldOffsetZ;
    vertices[i + 1] = getHeight(x, z);

    // Reset the x and z to local coordinates (relative to chunk)
    vertices[i] = vertices[i];
    vertices[i + 2] = vertices[i + 2];
  }

  // Update normals
  terrainGeometry.computeVertexNormals();

  // Create terrain material
  const terrainMaterial = new THREE.MeshLambertMaterial({
    vertexColors: true,
    flatShading: true
  });

  // Add vertex colors based on height
  const colors = [];
  for (let i = 0; i < vertices.length; i += 3) {
    const height = vertices[i + 1];
    let color = new THREE.Color(COLORS.grass);

    if (height < WATER_LEVEL * MAX_HEIGHT + 0.2) {
      color = new THREE.Color(COLORS.dirt);
    } else if (height > MAX_HEIGHT * 0.7) {
      color = new THREE.Color(COLORS.stone);
    }

    colors.push(color.r, color.g, color.b);
  }

  terrainGeometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(colors, 3)
  );

  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  chunkGroup.add(terrain);

  // Add decorations (trees, rocks, bushes)
  addDecorations(chunkGroup, worldOffsetX, worldOffsetZ);

  return chunkGroup;
}

// Function to add decorations to a chunk
function addDecorations(chunkGroup, offsetX, offsetZ) {
  // Use a different seed for decoration placement
  const decorationSeed = noise2D(offsetX * 0.1, offsetZ * 0.1);

  // Place decorations
  for (let x = 0; x < CHUNK_SIZE; x += 2) {
    for (let z = 0; z < CHUNK_SIZE; z += 2) {
      const worldX = x + offsetX;
      const worldZ = z + offsetZ;
      const height = getHeight(worldX, worldZ);

      // Skip if underwater
      if (height <= WATER_LEVEL * MAX_HEIGHT) continue;

      // Random value for decoration type
      const noiseValue = noise2D(worldX * 0.1, worldZ * 0.1);

      // Add decoration based on noise value
      if (noiseValue > 0.8 && height > WATER_LEVEL * MAX_HEIGHT + 0.5) {
        // Tree (10% chance in suitable areas)
        // Use local coordinates for positioning within the chunk
        addTree(chunkGroup, x, height, z);
      } else if (noiseValue < -0.8) {
        // Rock (10% chance)
        addRock(chunkGroup, x, height, z);
      } else if (noiseValue > 0.5 && noiseValue <= 0.8) {
        // Bush (15% chance)
        addBush(chunkGroup, x, height, z);
      }
    }
  }
}

// Function to create a low-poly tree
function addTree(parent, x, y, z) {
  const treeGroup = new THREE.Group();

  // Tree trunk (cylinder)
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 5, 1);
  const trunkMaterial = new THREE.MeshLambertMaterial({ color: COLORS.treeTrunk });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(0, 0.75, 0);
  treeGroup.add(trunk);

  // Tree leaves (cone)
  const leavesGeometry = new THREE.ConeGeometry(1, 2, 6);
  const leavesMaterial = new THREE.MeshLambertMaterial({
    color: COLORS.treeLeaves,
    flatShading: true
  });
  const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
  leaves.position.set(0, 2.5, 0);
  treeGroup.add(leaves);

  // Position the tree
  treeGroup.position.set(x, y, z);

  // Add some random rotation and scale variation
  treeGroup.rotation.y = Math.random() * Math.PI * 2;
  const scale = 0.8 + Math.random() * 0.4;
  treeGroup.scale.set(scale, scale, scale);

  parent.add(treeGroup);
}

// Function to create a low-poly rock
function addRock(parent, x, y, z) {
  const rockGeometry = new THREE.DodecahedronGeometry(0.5, 0);
  const rockMaterial = new THREE.MeshLambertMaterial({
    color: COLORS.rock,
    flatShading: true
  });
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);

  // Position the rock
  rock.position.set(x, y + 0.25, z);

  // Add some random rotation and scale variation
  rock.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  const scale = 0.5 + Math.random() * 1;
  rock.scale.set(scale, scale * 0.7, scale);

  parent.add(rock);
}

// Function to create a low-poly bush
function addBush(parent, x, y, z) {
  const bushGeometry = new THREE.DodecahedronGeometry(0.5, 1);
  const bushMaterial = new THREE.MeshLambertMaterial({
    color: COLORS.bush,
    flatShading: true
  });
  const bush = new THREE.Mesh(bushGeometry, bushMaterial);

  // Position the bush
  bush.position.set(x, y + 0.3, z);

  // Add some random scale variation
  const scale = 0.4 + Math.random() * 0.3;
  bush.scale.set(scale, scale, scale);

  parent.add(bush);
}

// Generate initial chunks
function generateInitialChunks() {
  const radius = 2; // Number of chunks in each direction

  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      const chunk = generateChunk(x, z);
      chunks.add(chunk);
    }
  }
}

// Function to update visible chunks based on camera position
function updateChunks() {
  const cameraChunkX = Math.floor(camera.position.x / CHUNK_SIZE);
  const cameraChunkZ = Math.floor(camera.position.z / CHUNK_SIZE);
  const radius = 3; // Visible chunk radius

  // Check which chunks need to be added or removed
  const visibleChunks = new Set();

  for (let x = cameraChunkX - radius; x <= cameraChunkX + radius; x++) {
    for (let z = cameraChunkZ - radius; z <= cameraChunkZ + radius; z++) {
      const chunkKey = `${x},${z}`;
      visibleChunks.add(chunkKey);

      // Check if chunk already exists
      let chunkExists = false;
      chunks.children.forEach(chunk => {
        if (chunk.userData.chunkX === x && chunk.userData.chunkZ === z) {
          chunkExists = true;
        }
      });

      // If not, create it
      if (!chunkExists) {
        const chunk = generateChunk(x, z);
        chunks.add(chunk);
      }
    }
  }

  // Remove chunks that are too far away
  for (let i = chunks.children.length - 1; i >= 0; i--) {
    const chunk = chunks.children[i];
    const chunkKey = `${chunk.userData.chunkX},${chunk.userData.chunkZ}`;

    if (!visibleChunks.has(chunkKey)) {
      chunks.remove(chunk);
      // Dispose of geometries to free memory
      chunk.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
  }
}

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(100, 100, 50);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Handle window resize
window.addEventListener('resize', () => {
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Generate initial world
generateInitialChunks();

// Player movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let playerSpeed = 0.2;
let playerVelocity = new THREE.Vector3();

// Set up keyboard controls
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW': moveForward = true; break;
    case 'KeyS': moveBackward = true; break;
    case 'KeyA': moveLeft = true; break;
    case 'KeyD': moveRight = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW': moveForward = false; break;
    case 'KeyS': moveBackward = false; break;
    case 'KeyA': moveLeft = false; break;
    case 'KeyD': moveRight = false; break;
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Calculate delta time
  const currentTime = performance.now() / 1000; // Convert to seconds
  const deltaTime = currentTime - (lastTime || currentTime);
  lastTime = currentTime;

  // Update player
  player.update(input, terrain, deltaTime, npcManager.npcs);

  // Update NPCs with player reference
  npcManager.update(currentTime, player.position, camera, player);

  // Update controls
  controls.update();

  // Handle player movement
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  cameraDirection.y = 0;
  cameraDirection.normalize();

  const cameraRight = new THREE.Vector3(cameraDirection.z, 0, -cameraDirection.x);

  playerVelocity.set(0, 0, 0);

  if (moveForward) playerVelocity.add(cameraDirection.multiplyScalar(playerSpeed));
  if (moveBackward) playerVelocity.sub(cameraDirection.multiplyScalar(playerSpeed));
  if (moveRight) playerVelocity.add(cameraRight.multiplyScalar(playerSpeed));
  if (moveLeft) playerVelocity.sub(cameraRight.multiplyScalar(playerSpeed));

  if (playerVelocity.length() > 0) {
    camera.position.add(playerVelocity);

    // Update chunks based on new camera position
    updateChunks();
  }

  // Render the scene
  renderer.render(scene, camera);
}

animate(); 