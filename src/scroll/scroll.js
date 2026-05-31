import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SmoothScroll — wires Lenis to GSAP's ScrollTrigger so every cinematic
 * trigger reads the same ultra-smooth scroll position, and drives the
 * AxionWorld camera between section states as you travel.
 */
export class SmoothScroll {
  constructor(world) {
    this.world = world;
    this.sections = Array.from(document.querySelectorAll('[data-scene]'));
    this.order = this.sections.map((s) => s.dataset.scene);

    this._initLenis();
    this._initSceneTimeline();
    this._initNavSync();
  }

  _initLenis() {
    this.lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      lerp: 0.09,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.4
    });

    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => this.lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // expose for anchor navigation
    window.__lenis = this.lenis;
  }

  /**
   * Master scrubbed timeline: drives camera state blends across the whole
   * page. We map global scroll progress (0..1) onto consecutive section
   * states so the camera continuously flies between them.
   */
  _initSceneTimeline() {
    const order = this.order;
    const n = order.length;

    ScrollTrigger.create({
      trigger: '#scroll',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress * (n - 1); // 0..(n-1)
        const i = Math.min(n - 2, Math.floor(p));
        const local = p - i;
        this.world.setStateBlend(order[i], order[i + 1], local);
        this.world.setProgress(self.progress);
      }
    });

    // Set an initial state so the first frame isn't mid-air
    this.world.setStateBlend(order[0], order[1], 0);
  }

  /** Keep nav + progress dots in sync with the active section. */
  _initNavSync() {
    const navLinks = document.querySelectorAll('[data-nav]');
    const dots = document.querySelectorAll('.hud--progress .dot');

    this.sections.forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (!self.isActive) return;
          const id = sec.id;
          navLinks.forEach((l) => l.classList.toggle('is-current', l.getAttribute('href') === `#${id}`));
          dots.forEach((d) => d.classList.toggle('is-active', d.dataset.goto === id));
        }
      });
    });
  }

  /** Smoothly scroll to a section id via Lenis. */
  scrollTo(id) {
    const el = document.getElementById(id);
    if (el) this.lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  }
}
