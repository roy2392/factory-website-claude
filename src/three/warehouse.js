import * as THREE from 'three';

/**
 * Procedural autonomous warehouse: racking grid, glowing dock bays and
 * roaming AGV indicator lights. Designed to read as an industrial sci-fi
 * facility seen from a cinematic 3/4 angle.
 */
export function createWarehouse() {
  const group = new THREE.Group();
  group.name = 'warehouse';

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0c1322,
    metalness: 0.8,
    roughness: 0.4
  });
  const rackMat = new THREE.MeshStandardMaterial({
    color: 0x121b2e,
    metalness: 0.6,
    roughness: 0.5
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x00e5ff,
    emissiveIntensity: 1.8
  });
  const palletMat = new THREE.MeshStandardMaterial({
    color: 0x6a5cff,
    emissive: 0x2a2470,
    emissiveIntensity: 1.0,
    metalness: 0.3,
    roughness: 0.6
  });

  // floor plate
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(22, 0.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x070b14, metalness: 0.7, roughness: 0.6 })
  );
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  group.add(floor);

  // racking rows
  const rows = 4;
  const bays = 6;
  const levels = 3;
  for (let r = 0; r < rows; r++) {
    for (let b = 0; b < bays; b++) {
      const x = -8.5 + b * 3.0;
      const z = -5.4 + r * 3.6;

      // vertical posts
      for (const dx of [-0.9, 0.9]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 4.6, 0.16), frameMat);
        post.position.set(x + dx, 2.3, z);
        post.castShadow = true;
        group.add(post);
      }
      // shelves + pallets
      for (let l = 0; l < levels; l++) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 1.4), rackMat);
        shelf.position.set(x, 0.7 + l * 1.5, z);
        group.add(shelf);

        if (Math.random() > 0.35) {
          const pallet = new THREE.Mesh(
            new THREE.BoxGeometry(0.9 + Math.random() * 0.6, 0.7, 0.9),
            palletMat
          );
          pallet.position.set(x + (Math.random() - 0.5) * 0.4, 1.15 + l * 1.5, z);
          pallet.castShadow = true;
          group.add(pallet);
        }
      }
      // glowing aisle marker
      const marker = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 0.1), glowMat);
      marker.position.set(x, 0.04, z + 1.8);
      group.add(marker);
    }
  }

  // dock bay doors along the front (glowing portals)
  for (let d = 0; d < 5; d++) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.0, 0.2), frameMat);
    door.position.set(-7.5 + d * 3.6, 1.5, 8);
    group.add(door);
    const portal = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.5), glowMat.clone());
    portal.material.emissiveIntensity = 1.2 + Math.random();
    portal.position.set(-7.5 + d * 3.6, 1.4, 8.12);
    group.add(portal);
  }

  // roaming AGV lights
  const agvs = [];
  for (let i = 0; i < 8; i++) {
    const agv = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), glowMat.clone());
    agv.material.color = new THREE.Color(i % 2 ? 0xff7a45 : 0x00e5ff);
    agv.material.emissive = agv.material.color;
    agv.userData.lane = -5 + (i % 4) * 3.6;
    agv.userData.speed = 0.6 + Math.random() * 0.8;
    agv.userData.offset = Math.random() * 20;
    group.add(agv);
    agvs.push(agv);
  }
  group.userData.agvs = agvs;

  return group;
}
