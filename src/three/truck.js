import * as THREE from 'three';

/**
 * Procedurally builds a stylized Class-8 autonomous hauler.
 * Returns a group containing both a solid (PBR-ish) mesh set and a
 * matching wireframe overlay so we can morph between the two on scroll.
 */
export function createTruck() {
  const group = new THREE.Group();
  group.name = 'truck';

  const solid = new THREE.Group();
  const wire = new THREE.Group();
  group.add(solid, wire);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0b1220,
    metalness: 0.9,
    roughness: 0.32,
    envMapIntensity: 1.1
  });
  const cabMat = new THREE.MeshStandardMaterial({
    color: 0x10182a,
    metalness: 0.85,
    roughness: 0.28
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x081018,
    metalness: 1,
    roughness: 0.06,
    emissive: 0x00343d,
    emissiveIntensity: 0.6
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x00e5ff,
    emissiveIntensity: 2.2,
    metalness: 0.4,
    roughness: 0.3
  });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x05080e, metalness: 0.2, roughness: 0.85 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x1a2336, metalness: 0.95, roughness: 0.25 });

  const wireMat = new THREE.LineBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.0
  });

  // helper: add a box to both solid + wire layers
  const add = (w, h, d, mat, x, y, z, bevel = 0.02) => {
    const geo = new THREE.BoxGeometry(w, h, d, 1, 1, 1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    solid.add(mesh);

    const wgeo = new THREE.EdgesGeometry(geo, 25);
    const line = new THREE.LineSegments(wgeo, wireMat);
    line.position.set(x, y, z);
    wire.add(line);
    return mesh;
  };

  // ---- Trailer ----
  add(3.0, 2.6, 1.9, bodyMat, -2.4, 1.55, 0);            // trailer body
  add(3.02, 0.12, 1.92, trimMat, -2.4, 0.55, 0);          // under-glow strip
  add(0.06, 2.0, 1.92, trimMat, -0.92, 1.55, 0);          // accent seam
  // trailer roof aero
  add(2.9, 0.18, 1.7, cabMat, -2.4, 2.95, 0);

  // ---- Cab ----
  add(1.5, 1.9, 1.85, cabMat, 0.55, 1.2, 0);              // cab body
  add(1.2, 0.9, 1.7, glassMat, 0.78, 1.95, 0);            // windshield block
  add(0.16, 1.4, 1.86, trimMat, -0.2, 1.2, 0);            // cab back light
  // hood / nose
  add(0.9, 0.9, 1.8, cabMat, 1.62, 0.78, 0);
  add(0.12, 0.5, 1.82, trimMat, 2.05, 0.78, 0);           // front light bar

  // sensor pod on roof (autonomy)
  const pod = add(0.34, 0.34, 0.34, trimMat, 0.55, 2.7, 0);
  pod.rotation.y = Math.PI / 4;

  // side fairings
  add(2.9, 0.7, 0.12, cabMat, -2.4, 0.55, 0.92);
  add(2.9, 0.7, 0.12, cabMat, -2.4, 0.55, -0.92);

  // ---- Wheels ----
  const wheelGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.34, 22);
  const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.36, 14);
  const wheelXs = [1.5, -1.4, -2.4, -3.3];
  const wheelZs = [1.0, -1.0];
  wheelXs.forEach((wx) => {
    wheelZs.forEach((wz) => {
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.rotation.x = Math.PI / 2;
      tire.position.set(wx, 0.46, wz);
      tire.castShadow = true;
      solid.add(tire);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(wx, 0.46, wz);
      solid.add(rim);

      const wEdges = new THREE.EdgesGeometry(wheelGeo, 15);
      const wLine = new THREE.LineSegments(wEdges, wireMat);
      wLine.rotation.x = Math.PI / 2;
      wLine.position.set(wx, 0.46, wz);
      wire.add(wLine);
    });
  });

  // store materials for morph control
  group.userData.wireMat = wireMat;
  group.userData.solidMats = [bodyMat, cabMat, glassMat, trimMat, tireMat, rimMat];
  group.userData.solid = solid;
  group.userData.wire = wire;
  group.userData.trimMat = trimMat;
  group.userData.glassMat = glassMat;

  // center the truck
  group.position.y = 0;

  return group;
}
