import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { createTruck } from './truck.js';
import { createWarehouse } from './warehouse.js';
import { createParticleField, createNetworkGlobe } from './particles.js';

/**
 * AxionWorld — owns the WebGL scene, all 3D actors and the per-section
 * visual state. The scroll controller calls setState()/setProgress() to
 * drive cinematic camera moves and wireframe morphs.
 */
export class AxionWorld {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.pointer = new THREE.Vector2(0, 0);
    this.pointerTarget = new THREE.Vector2(0, 0);
    this.drag = { active: false, x: 0, y: 0, spin: 0, vel: 0 };
    this._tmpV = new THREE.Vector3();

    this._initRenderer();
    this._initScene();
    this._initLights();
    this._initActors();
    this._initComposer();
    this._bindEvents();

    // camera rig: we move a target + the camera looks at it
    this.camGoal = new THREE.Vector3(7, 3.4, 12);
    this.lookGoal = new THREE.Vector3(0, 1.4, 0);
    this.lookCurrent = new THREE.Vector3(0, 1.4, 0);
    this.camera.position.copy(this.camGoal);

    this.onReady = null;
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null;
    this.scene.fog = new THREE.FogExp2(0x05070d, 0.022);

    this.camera = new THREE.PerspectiveCamera(
      42, window.innerWidth / window.innerHeight, 0.1, 200
    );
  }

  _initLights() {
    this.scene.add(new THREE.AmbientLight(0x223052, 0.6));

    const key = new THREE.DirectionalLight(0xbfe9ff, 2.4);
    key.position.set(6, 12, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 60;
    key.shadow.camera.left = -20;
    key.shadow.camera.right = 20;
    key.shadow.camera.top = 20;
    key.shadow.camera.bottom = -20;
    key.shadow.bias = -0.0004;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x6a5cff, 1.6);
    rim.position.set(-8, 6, -6);
    this.scene.add(rim);

    const fill = new THREE.PointLight(0x00e5ff, 18, 30, 2);
    fill.position.set(0, 3, 6);
    this.scene.add(fill);
    this.fillLight = fill;

    // ground reflection plane (subtle)
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(60, 64),
      new THREE.MeshStandardMaterial({
        color: 0x04060c, metalness: 0.9, roughness: 0.55
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // infinite grid floor (sci-fi)
    const grid = new THREE.GridHelper(120, 120, 0x123047, 0x0c1c2c);
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    grid.position.y = 0;
    this.scene.add(grid);
    this.grid = grid;
  }

  _initActors() {
    // Truck — hero/fleet actor
    this.truck = createTruck();
    this.truck.position.set(0, 0, 0);
    this.scene.add(this.truck);

    // Warehouse — hidden until its section
    this.warehouse = createWarehouse();
    this.warehouse.position.set(0, 0, -4);
    this.warehouse.visible = true;
    this.warehouse.scale.setScalar(0.001);
    this.scene.add(this.warehouse);

    // Network globe — hidden until network section
    this.network = createNetworkGlobe();
    this.network.position.set(0, 4, -2);
    this.network.scale.setScalar(0.001);
    this.scene.add(this.network);

    // Ambient particle field
    this.particles = createParticleField(1500);
    this.scene.add(this.particles);
  }

  _initComposer() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.85, // strength
      0.7,  // radius
      0.18  // threshold
    );
    this.composer.addPass(this.bloom);
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  _bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('pointermove', (e) => {
      this.pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointerTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (this.drag.active) {
        const dx = e.clientX - this.drag.x;
        this.drag.vel = dx * 0.005;
        this.drag.spin += this.drag.vel;
        this.drag.x = e.clientX;
      }
    });
    // Orbit-drag the chassis (mostly meaningful in fleet section)
    this.canvas.addEventListener('pointerdown', (e) => {
      this.drag.active = true;
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
    });
    window.addEventListener('pointerup', () => { this.drag.active = false; });
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.bloom.setSize(w, h);
  }

  /**
   * Cinematic state per section. Each entry defines where the camera flies,
   * what it looks at, which actors are present and the wireframe morph factor.
   * The scroll controller tweens between these via setStateBlend().
   */
  static STATES = {
    hero:         { cam: [7, 3.2, 12],  look: [0, 1.5, 0],  wire: 0.15, truckScale: 1, fov: 42 },
    fleet:        { cam: [5.5, 2.2, 7.5],look: [-0.6, 1.3, 0], wire: 1.0, truckScale: 1.05, fov: 38 },
    network:      { cam: [0, 4.5, 13],   look: [0, 4, -2],   wire: 0.2, truckScale: 0.4, fov: 46 },
    intelligence: { cam: [4.5, 2.6, 9],  look: [0, 1.6, 0],  wire: 0.6, truckScale: 0.9, fov: 40 },
    warehouse:    { cam: [10, 7, 15],    look: [0, 2.5, 0],  wire: 0.1, truckScale: 0.35, fov: 44 },
    deploy:       { cam: [6, 3.4, 13],   look: [0, 1.6, 0],  wire: 0.4, truckScale: 1, fov: 42 }
  };

  /** Blend between two named states by t (0..1). */
  setStateBlend(fromKey, toKey, t) {
    const A = AxionWorld.STATES[fromKey] || AxionWorld.STATES.hero;
    const B = AxionWorld.STATES[toKey] || A;
    const e = t * t * (3 - 2 * t); // smoothstep

    this.camGoal.set(
      lerp(A.cam[0], B.cam[0], e),
      lerp(A.cam[1], B.cam[1], e),
      lerp(A.cam[2], B.cam[2], e)
    );
    this.lookGoal.set(
      lerp(A.look[0], B.look[0], e),
      lerp(A.look[1], B.look[1], e),
      lerp(A.look[2], B.look[2], e)
    );
    this._wireTarget = lerp(A.wire, B.wire, e);
    this._truckScaleTarget = lerp(A.truckScale, B.truckScale, e);
    this._fovTarget = lerp(A.fov, B.fov, e);

    // actor presence driven by which sections are active
    this._presence = { from: fromKey, to: toKey, t: e };
  }

  _applyPresence() {
    const p = this._presence;
    if (!p) return;
    const near = (k) => (p.from === k ? 1 - p.t : 0) + (p.to === k ? p.t : 0);

    // warehouse appears around its section
    const wh = clamp01(near('warehouse'));
    this.warehouse.scale.setScalar(lerp(0.001, 1, wh));
    this.warehouse.visible = wh > 0.001;

    // network globe appears around its section
    const nw = clamp01(near('network'));
    this.network.scale.setScalar(lerp(0.001, 1, nw));
    this.network.visible = nw > 0.001;
    setOpacity(this.network.userData.wire, nw * 0.5);
    setOpacity(this.network.userData.nodes, nw * 0.9);
    this.network.userData.arcs.children.forEach((a, i) =>
      setOpacity(a, nw * (0.3 + 0.5 * Math.abs(Math.sin(this._t * 1.5 + i)))));

    // truck recedes when warehouse/network take over
    const truckHide = Math.max(wh, nw * 0.7);
    this.truck.userData.solid.children.forEach((m) => {
      if (m.material && 'opacity' in m.material) {
        m.material.transparent = true;
        m.material.opacity = lerp(1, 0.0, truckHide);
      }
    });

    // particle field strongest in intelligence + network
    const dust = clamp01(Math.max(near('intelligence'), near('network') * 0.8, near('deploy') * 0.5));
    this.particles.material.opacity = lerp(0.0, 0.85, dust);
  }

  setProgress(p) { this._scrollP = p; }

  update() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = (this._t = this.clock.elapsedTime);

    // smooth pointer
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * 0.05;
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * 0.05;

    // camera ease toward goal + subtle parallax from pointer
    const px = this.pointer.x * 1.2;
    const py = -this.pointer.y * 0.8;
    this.camera.position.x += (this.camGoal.x + px - this.camera.position.x) * 0.06;
    this.camera.position.y += (this.camGoal.y + py - this.camera.position.y) * 0.06;
    this.camera.position.z += (this.camGoal.z - this.camera.position.z) * 0.06;

    this.lookCurrent.x += (this.lookGoal.x - this.lookCurrent.x) * 0.07;
    this.lookCurrent.y += (this.lookGoal.y - this.lookCurrent.y) * 0.07;
    this.lookCurrent.z += (this.lookGoal.z - this.lookCurrent.z) * 0.07;
    this.camera.lookAt(this.lookCurrent);

    if (this._fovTarget) {
      this.camera.fov += (this._fovTarget - this.camera.fov) * 0.06;
      this.camera.updateProjectionMatrix();
    }

    // ---- Truck behaviour ----
    // idle rotation + drag spin (with inertia)
    if (!this.drag.active) this.drag.vel *= 0.94;
    this.drag.spin += this.drag.vel;
    const wireMix = (this._wireTarget ?? 0.15);
    this.truck.rotation.y = this.drag.spin + t * 0.08;
    const ts = this._truckScaleTarget ?? 1;
    this.truck.scale.setScalar(lerp(this.truck.scale.x, ts, 0.06));
    this.truck.position.y = Math.sin(t * 0.8) * 0.06;

    // wireframe morph: fade wire lines in, solids out
    if (this.truck.userData.wireMat) {
      this.truck.userData.wireMat.opacity += (wireMix - this.truck.userData.wireMat.opacity) * 0.08;
      // pulse the trim emissive for life
      this.truck.userData.trimMat.emissiveIntensity = 1.8 + Math.sin(t * 3) * 0.6;
    }

    // ---- Warehouse AGVs ----
    if (this.warehouse.visible && this.warehouse.userData.agvs) {
      this.warehouse.userData.agvs.forEach((agv) => {
        const x = ((t * agv.userData.speed + agv.userData.offset) % 20) - 10;
        agv.position.set(x, 0.2, agv.userData.lane);
      });
      this.warehouse.rotation.y = Math.sin(t * 0.1) * 0.06 - 0.2;
    }

    // ---- Network globe ----
    if (this.network.visible) {
      this.network.rotation.y = t * 0.12;
      this.network.rotation.x = Math.sin(t * 0.2) * 0.08;
    }

    // ---- Particles drift ----
    if (this.particles.material.opacity > 0.01) {
      const pos = this.particles.geometry.attributes.position;
      const base = this.particles.userData.basePositions;
      const spd = this.particles.userData.speeds;
      for (let i = 0; i < spd.length; i++) {
        const i3 = i * 3;
        pos.array[i3 + 1] = base[i3 + 1] + Math.sin(t * spd[i] + i) * 1.4;
        pos.array[i3] = base[i3] + Math.cos(t * spd[i] * 0.5 + i) * 0.8;
      }
      pos.needsUpdate = true;
      this.particles.rotation.y = t * 0.01;
    }

    // fill light follows accent rhythm
    this.fillLight.intensity = 16 + Math.sin(t * 2) * 4;

    this._applyPresence();
    this.composer.render();
  }

  start() {
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      this.update();
    };
    loop();
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function setOpacity(obj, o) {
  obj.traverse?.((c) => { if (c.material && 'opacity' in c.material) { c.material.transparent = true; c.material.opacity = o; } });
  if (obj.material && 'opacity' in obj.material) { obj.material.transparent = true; obj.material.opacity = o; }
}
