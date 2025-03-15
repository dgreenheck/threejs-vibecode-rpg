import Engine from './core/Engine.js';

// Create UI overlay
function createUI() {
  const uiOverlay = document.createElement('div');
  uiOverlay.className = 'ui-overlay';
  uiOverlay.innerHTML = `
    <h3>Low-Poly Infinite World</h3>
    <p>Procedurally generated terrain with trees, rocks, and bushes</p>
  `;
  document.body.appendChild(uiOverlay);

  const controls = document.createElement('div');
  controls.className = 'controls';
  controls.innerHTML = `
    <p>WASD: Move | Mouse: Look around</p>
  `;
  document.body.appendChild(controls);
}

// Initialize the game
window.addEventListener('DOMContentLoaded', () => {
  createUI();
  new Engine();
}); 