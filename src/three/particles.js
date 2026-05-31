import * as THREE from 'three';

/**
 * Ambient data-dust field that fills the whole scene with drifting motes —
 * the "alive" abstract motion background for the AI / data sections.
 */
export function createParticleField(count = 1400) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const colorA = new THREE.Color(0x00e5ff);
  const colorB = new THREE.Color(0x6a5cff);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 60;
    positions[i3 + 1] = Math.random() * 30 - 4;
    positions[i3 + 2] = (Math.random() - 0.5) * 50;
    speeds[i] = 0.2 + Math.random() * 0.8;

    const c = colorA.clone().lerp(colorB, Math.random());
    colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.06,
    transparent: true,
    opacity: 0.0,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geo, mat);
  points.userData.speeds = speeds;
  points.userData.basePositions = positions.slice();
  return points;
}

/**
 * Planetary "network" mesh — a glowing icosphere wireframe with travelling
 * pulse nodes, used in the NETWORK section to imply a global routing grid.
 */
export function createNetworkGlobe() {
  const group = new THREE.Group();
  group.name = 'network';

  const geo = new THREE.IcosahedronGeometry(4.2, 3);
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0x1f6f8a, transparent: true, opacity: 0.0 })
  );
  group.add(wire);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(4.0, 2),
    new THREE.MeshBasicMaterial({ color: 0x040a12, transparent: true, opacity: 0.0 })
  );
  group.add(core);

  // node pulses spread over the sphere surface
  const nodeCount = 90;
  const nodeGeo = new THREE.BufferGeometry();
  const npos = new Float32Array(nodeCount * 3);
  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / nodeCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 4.2;
    npos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    npos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    npos[i * 3 + 2] = r * Math.cos(phi);
  }
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(npos, 3));
  const nodes = new THREE.Points(
    nodeGeo,
    new THREE.PointsMaterial({
      color: 0x00e5ff, size: 0.14, transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  group.add(nodes);

  // travelling arcs between random nodes
  const arcs = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const a = i * 6 % nodeCount;
    const b = (i * 13 + 7) % nodeCount;
    const va = new THREE.Vector3(npos[a*3], npos[a*3+1], npos[a*3+2]);
    const vb = new THREE.Vector3(npos[b*3], npos[b*3+1], npos[b*3+2]);
    const mid = va.clone().add(vb).multiplyScalar(0.5).setLength(5.8);
    const curve = new THREE.QuadraticBezierCurve3(va, mid, vb);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(28));
    const arc = new THREE.Line(
      arcGeo,
      new THREE.LineBasicMaterial({ color: 0x6a5cff, transparent: true, opacity: 0.0 })
    );
    arcs.add(arc);
  }
  group.add(arcs);

  group.userData.wire = wire;
  group.userData.core = core;
  group.userData.nodes = nodes;
  group.userData.arcs = arcs;
  return group;
}
