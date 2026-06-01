import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * UI — all the DOM-side cinematic motion: staggered typography splits,
 * scroll reveals, animated counters, magnetic buttons and the HUD intro.
 * Timing is tuned to the 0.6s–1.2s cinematic band with expressive easing.
 */
export class UI {
  constructor() {
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    this._splitTitles();
    this._introHUD();
    this._revealParagraphs();
    this._staggerGroups();
    this._counters();
    this._magnetic();
    this._navAnchors();
    this._form();
  }

  /** Split [data-split] lines into per-word spans and slide them up on scroll. */
  _splitTitles() {
    document.querySelectorAll('[data-split]').forEach((el) => {
      const text = el.textContent.trim();
      el.textContent = '';
      el.setAttribute('aria-label', text);
      const frag = document.createDocumentFragment();
      text.split(' ').forEach((word) => {
        const w = document.createElement('span');
        w.className = 'word';
        w.style.display = 'inline-block';
        w.style.overflow = 'hidden';
        w.style.verticalAlign = 'top';
        const inner = document.createElement('span');
        inner.textContent = word;
        inner.style.display = 'inline-block';
        inner.style.willChange = 'transform';
        w.appendChild(inner);
        frag.appendChild(w);
        frag.appendChild(document.createTextNode(' '));
        el._words = el._words || [];
        el._words.push(inner);
      });
      el.appendChild(frag);

      if (this.reduced) return;
      gsap.set(el._words, { yPercent: 115 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => gsap.to(el._words, {
          yPercent: 0, duration: 1.0, ease: 'expo.out', stagger: 0.08
        }),
        once: true
      });
    });
  }

  /** Fade the HUD chrome in after the preloader hands off. */
  _introHUD() {
    const huds = document.querySelectorAll('[data-hud]');
    gsap.to(huds, {
      opacity: 1, duration: 1.0, ease: 'power2.out', stagger: 0.12, delay: 0.2
    });
  }

  /** Generic upward fade for [data-reveal] elements. */
  _revealParagraphs() {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (this.reduced) { el.style.opacity = 1; return; }
      gsap.set(el, { y: 28, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }),
        once: true
      });
    });
  }

  /** Stagger children of [data-stagger] containers. */
  _staggerGroups() {
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      const items = Array.from(group.children);
      if (this.reduced) { items.forEach((i) => (i.style.opacity = 1)); return; }
      gsap.set(items, { y: 24, opacity: 0 });
      ScrollTrigger.create({
        trigger: group,
        start: 'top 85%',
        onEnter: () => gsap.to(items, {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1
        }),
        once: true
      });
    });
  }

  /** Count up [data-counter] numbers when scrolled into view. */
  _counters() {
    document.querySelectorAll('[data-counter]').forEach((el) => {
      const to = parseFloat(el.dataset.to || '0');
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      const render = () => {
        const val = to % 1 === 0 ? Math.round(obj.v) : obj.v.toFixed(2);
        el.textContent = val + suffix;
      };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        onEnter: () => {
          if (this.reduced) { obj.v = to; render(); return; }
          gsap.to(obj, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: render });
        },
        once: true
      });
    });
  }

  /** Magnetic hover for [data-magnetic] interactive elements. */
  _magnetic() {
    if (this.reduced || window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = 0.4;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        gsap.to(el, { x, y, duration: 0.5, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /** Anchor links + progress dots route through Lenis. */
  _navAnchors() {
    document.querySelectorAll('a[href^="#"], [data-goto]').forEach((el) => {
      el.addEventListener('click', (e) => {
        const id = el.dataset.goto || el.getAttribute('href')?.slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1.4 });
        else target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /** Demo access form — no backend; gives premium confirmation feedback. */
  _form() {
    const form = document.getElementById('accessForm');
    const note = document.getElementById('formNote');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (!input.value) return;
      note.textContent = `✓ ACCESS QUEUED — rendering ${input.value.split('@')[0]}'s network into AXION.`;
      note.classList.add('is-ok');
      input.value = '';
      gsap.fromTo(note, { y: 8, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    });
  }
}
