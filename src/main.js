import './styles.css';
import { gsap } from 'gsap';
import { AxionWorld } from './three/world.js';
import { SmoothScroll } from './scroll/scroll.js';
import { UI } from './ui/ui.js';

/**
 * AXION — boot sequence.
 * 1. Spin up the WebGL world (renderer warms while preloader animates).
 * 2. Run a short, believable "fleet core" preload.
 * 3. Hand off to smooth scroll + cinematic UI once everything is warm.
 */
function boot() {
  const canvas = document.getElementById('webgl');
  const world = new AxionWorld(canvas);
  world.start();

  const ui = new UI();
  const scroll = new SmoothScroll(world);

  runPreloader().then(() => {
    document.getElementById('preloader').classList.add('is-done');
    ui.init();
    // gentle hero entrance for the camera once the curtain lifts
    gsap.fromTo(
      world.camGoal,
      { z: 22, y: 7 },
      { z: 12, y: 3.2, duration: 1.8, ease: 'expo.out' }
    );
  });
}

/** Animate the preloader bar; resolves slightly after it hits 100%. */
function runPreloader() {
  return new Promise((resolve) => {
    const bar = document.getElementById('preloaderBar');
    const pct = document.getElementById('preloaderPct');
    const state = { v: 0 };
    gsap.to(state, {
      v: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        const val = Math.round(state.v);
        bar.style.width = val + '%';
        pct.textContent = val + '%';
      },
      onComplete: () => setTimeout(resolve, 320)
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
