import './styles/main.css';
import { render, initAuth, parseHash } from './app.js';
import { subscribe } from './state.js';

async function boot() {
  parseHash();
  window.addEventListener('hashchange', () => {
    parseHash();
    render();
  });

  subscribe(render);
  await initAuth();
  render();
}

boot();
