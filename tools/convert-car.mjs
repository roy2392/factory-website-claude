/**
 * Offline asset pipeline: convert the Sketchfab sports-car GLB from
 * KHR_materials_pbrSpecularGlossiness (unsupported by modern three.js
 * GLTFLoader) into standard metallic-roughness, then prune/dedup so it
 * loads cleanly and lean in the browser.
 *
 *   node tools/convert-car.mjs
 *
 * Source : tools/_src_car.glb
 * Output : public/assets/vehicle.glb
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { metalRough, prune, dedup, weld } from '@gltf-transform/functions';

const SRC = new URL('./_src_car.glb', import.meta.url);
const OUT = new URL('../public/assets/vehicle.glb', import.meta.url);

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

const doc = await io.read(SRC.pathname);

await doc.transform(
  metalRough(),          // KHR specular-glossiness -> metallic-roughness
  weld(),                // merge identical vertices
  dedup(),               // remove duplicate accessors/textures/materials
  prune()                // drop unused data
);

await io.write(OUT.pathname, doc);
console.log('✓ wrote', OUT.pathname);
