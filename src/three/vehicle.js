import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Loads the real GLB hero vehicle and wraps it so it honours the same
 * userData contract as the procedural truck (createTruck): a solid layer we
 * can fade, a wireframe overlay we can morph in, and an emissive trim we can
 * pulse. The model is normalised (Z-up → Y-up, recentred, grounded, rescaled)
 * so it drops straight into the existing camera/scroll choreography.
 *
 * @param {string} url            path to the .glb
 * @param {number} targetSize     desired horizontal footprint in world units
 * @returns {Promise<THREE.Group>}
 */
export function loadVehicle(url, targetSize = 6.4) {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(normalise(gltf.scene, targetSize)),
      undefined,
      (err) => reject(err)
    );
  });
}

function normalise(model, targetSize) {
  // Sketchfab/Blender exports are commonly Z-up — stand the car on Y.
  model.rotation.x = -Math.PI / 2;
  model.updateMatrixWorld(true);

  // Shared wireframe material (opacity is animated by the world each frame).
  const wireMat = new THREE.LineBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.0
  });

  const solidMats = new Set();
  const wire = new THREE.Group();

  model.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;

    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((m) => {
      if (!m) return;
      m.transparent = true;        // allow the fade-out near warehouse/network
      m.envMapIntensity = 1.15;
      // Remember the natural opacity (e.g. glass) so the scroll fade is relative.
      if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity;
      solidMats.add(m);
    });

    // Per-mesh edge overlay, parented to the mesh so it inherits its transform.
    const edges = new THREE.EdgesGeometry(node.geometry, 28);
    const line = new THREE.LineSegments(edges, wireMat);
    node.add(line);
    wire.add(line); // tracked for completeness; transform comes from parent
  });

  // Recentre on origin and sit it on the grid (y = 0), then scale to fit.
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const footprint = Math.max(size.x, size.z) || size.length();
  const scale = targetSize / footprint;

  const inner = new THREE.Group();
  inner.add(model);
  inner.scale.setScalar(scale);
  inner.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

  // Outer pivot = the actor the world animates (rotation.y / bob / state scale).
  const group = new THREE.Group();
  group.name = 'vehicle';
  group.add(inner);

  // Emissive under-glow puck — the "trim" the world pulses for a sense of life.
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x00e5ff,
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: 0.9,
    metalness: 0.3,
    roughness: 0.4
  });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(targetSize * 0.55, 48), trimMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.02;
  group.add(glow);
  solidMats.add(trimMat);

  group.userData.wireMat = wireMat;
  group.userData.trimMat = trimMat;
  group.userData.solidMats = Array.from(solidMats);
  group.userData.wire = wire;
  group.userData.solid = model;

  return group;
}
