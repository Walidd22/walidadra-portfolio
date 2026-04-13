/**
 * Hero knowledge-graph scene — Three.js via ESM CDN.
 * Full-bleed behind hero text, interactive, entrance-animated.
 */

import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const HUES = {
  frontend: 0x4d94ff,
  backend: 0x8b5cf6,
  data: 0x22c55e,
};

// 23 nodes spanning Walid's real stack. Positions hand-picked on a spherical
// shell, clustered by domain: frontend (-x), backend (center), data (+x).
const TECH = [
  // 0-9: frontend cluster
  { name: 'TS',            cluster: 'frontend', pos: [-3.6,  2.0,  0.5] },
  { name: 'JS',            cluster: 'frontend', pos: [-3.4, -2.0,  0.9] },
  { name: 'React',         cluster: 'frontend', pos: [-2.2,  0.8,  1.8] },
  { name: 'React Native',  cluster: 'frontend', pos: [-3.0, -0.9,  1.3] },
  { name: 'Expo',          cluster: 'frontend', pos: [-4.0, -1.6, -0.2] },
  { name: 'Next.js',       cluster: 'frontend', pos: [-1.0,  2.4, -0.2] },
  { name: 'Tailwind',      cluster: 'frontend', pos: [-2.6,  1.5, -1.6] },
  { name: 'GSAP',          cluster: 'frontend', pos: [-3.8,  0.3, -1.2] },
  { name: 'Framer Motion', cluster: 'frontend', pos: [-2.8, -0.5, -1.8] },
  { name: 'Three.js',      cluster: 'frontend', pos: [-1.8, -1.9, -1.4] },

  // 10-16: backend / infra cluster
  { name: 'Node.js',       cluster: 'backend',  pos: [ 0.2,  1.7, -0.6] },
  { name: 'NestJS',        cluster: 'backend',  pos: [ 1.2,  0.8, -1.4] },
  { name: 'Prisma',        cluster: 'backend',  pos: [ 0.6, -0.8,  1.5] },
  { name: 'n8n',           cluster: 'backend',  pos: [-0.4, -2.2, -0.4] },
  { name: 'Docker',        cluster: 'backend',  pos: [ 1.4, -2.0,  0.6] },
  { name: 'Vercel',        cluster: 'backend',  pos: [ 0.8,  2.4,  1.0] },
  { name: 'Resend',        cluster: 'backend',  pos: [ 1.8, -0.6, -2.0] },

  // 17-22: data / AI / analytics cluster
  { name: 'Postgres',      cluster: 'data',     pos: [ 2.6,  0.4,  1.6] },
  { name: 'Supabase',      cluster: 'data',     pos: [ 3.4,  1.6,  0.2] },
  { name: 'Neo4j',         cluster: 'data',     pos: [ 3.6, -0.4, -0.6] },
  { name: 'Redis',         cluster: 'data',     pos: [ 2.0, -1.8, -1.0] },
  { name: 'Claude',        cluster: 'data',     pos: [ 2.2,  2.4, -1.2] },
  { name: 'Google Analytics', cluster: 'data',  pos: [ 4.0,  2.0, -0.4] },
  { name: 'PostHog',       cluster: 'data',     pos: [ 3.8,  0.8,  1.8] },

  // 24-33: fullstack keywords + React/RN ecosystem
  { name: 'SQL',            cluster: 'data',     pos: [ 3.2, -0.4,  2.2] },

  { name: 'GraphQL',        cluster: 'backend',  pos: [ 1.2,  2.2, -2.2] },
  { name: 'Socket.io',      cluster: 'backend',  pos: [ 2.0,  1.0, -1.8] },
  { name: 'AWS',            cluster: 'backend',  pos: [ 2.8, -1.4,  1.4] },
  { name: 'Stripe',         cluster: 'backend',  pos: [ 1.0, -2.4,  1.8] },
  { name: 'GitHub',         cluster: 'backend',  pos: [-0.6,  2.6,  1.4] },

  { name: 'Zustand',        cluster: 'frontend', pos: [-1.8,  0.2,  2.4] },
  { name: 'TanStack Query', cluster: 'frontend', pos: [-1.2, -1.4,  2.2] },
  { name: 'Zod',            cluster: 'frontend', pos: [-2.2,  2.4, -0.4] },
  { name: 'Reanimated',     cluster: 'frontend', pos: [-3.8, -0.2,  1.8] },
];

// Edges — real stack relationships, curated so the graph reads without spaghetti.
const EDGES = [
  // TypeScript / JavaScript roots
  [0, 2], [0, 5], [0, 11],                  // TS <-> React, Next, NestJS
  [1, 2],                                    // JS <-> React
  // React ecosystem
  [2, 3], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9],
  // Mobile
  [3, 4],                                    // RN <-> Expo
  // Next.js neighborhood
  [5, 10], [5, 15], [5, 22],                // Next <-> Node, Vercel, GA
  // Animation stack
  [7, 8], [7, 9],                            // GSAP <-> Framer, Three
  // Node ecosystem
  [10, 11], [10, 12], [10, 13], [10, 14], [10, 16], [10, 20], [10, 21],
  [11, 12],                                  // NestJS <-> Prisma
  [12, 17],                                  // Prisma <-> Postgres
  [13, 21],                                  // n8n <-> Claude
  [14, 20],                                  // Docker <-> Redis
  [15, 22],                                  // Vercel <-> GA
  // Data layer
  [17, 18], [18, 19], [19, 21],              // Postgres-Supabase-Neo4j-Claude
  // PostHog (product analytics)
  [5, 23], [15, 23], [22, 23],               // Next-PostHog, Vercel-PostHog, GA-PostHog
  // SQL + query
  [17, 24], [18, 24],                        // Postgres-SQL, Supabase-SQL
  // GraphQL + real-time
  [10, 25], [11, 25],                        // Node-GraphQL, NestJS-GraphQL
  [10, 26],                                   // Node-Socket.io
  // Cloud + deploy
  [14, 27], [10, 27],                        // Docker-AWS, Node-AWS
  [5, 28], [10, 28],                         // Next-Stripe, Node-Stripe
  [15, 29], [14, 29],                        // Vercel-GitHub, Docker-GitHub
  // React ecosystem
  [2, 30], [2, 31],                          // React-Zustand, React-TanStack
  [18, 31],                                   // Supabase-TanStack (data fetching)
  [0, 32], [2, 32], [11, 32],                // TS-Zod, React-Zod, NestJS-Zod
  // React Native ecosystem
  [3, 33], [7, 33],                          // RN-Reanimated, GSAP-Reanimated
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function init() {
  const mount = document.getElementById('heroGraph');
  const labelMount = document.getElementById('heroGraphLabels');
  const hero = document.getElementById('hero');
  if (!mount || !labelMount || !hero) return;

  const { clientWidth: W, clientHeight: H } = mount;
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 0, 11);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer({ element: labelMount });
  labelRenderer.setSize(W, H);

  // Graph group — idle rotation + drag applied to this
  const graph = new THREE.Group();
  scene.add(graph);

  // Lights — soft ambient + directional key
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.45);
  key.position.set(5, 4, 8);
  scene.add(key);

  // Shared geometries
  const nodeGeo = new THREE.SphereGeometry(0.24, 24, 24);
  const glowTex = makeGlowTexture();

  const nodeMeshes = [];
  const glowSprites = [];
  const labelObjs = [];

  TECH.forEach((t, i) => {
    const color = new THREE.Color(HUES[t.cluster]);
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color.clone().multiplyScalar(0.6),
      roughness: 0.35,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(nodeGeo, mat);
    const finalPos = new THREE.Vector3(...t.pos);
    mesh.userData.finalPos = finalPos.clone();
    mesh.userData.bobOffset = i * 0.7;
    mesh.userData.index = i;
    mesh.userData.baseScale = 1;
    mesh.position.copy(finalPos);
    graph.add(mesh);
    nodeMeshes.push(mesh);

    // Glow sprite
    const spriteMat = new THREE.SpriteMaterial({
      map: glowTex,
      color,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.15, 1.15, 1);
    sprite.position.copy(finalPos);
    graph.add(sprite);
    glowSprites.push(sprite);

    // Label via CSS2DRenderer
    const labelEl = document.createElement('span');
    labelEl.className = 'hero__graph-label';
    labelEl.textContent = t.name;
    const labelObj = new CSS2DObject(labelEl);
    labelObj.position.copy(finalPos);
    labelObj.userData.el = labelEl;
    graph.add(labelObj);
    labelObjs.push(labelObj);
  });

  // Edges — thin lines with gradient color at endpoints
  const edgeLines = [];
  EDGES.forEach(([a, b]) => {
    const pa = nodeMeshes[a].position;
    const pb = nodeMeshes[b].position;
    const colorA = new THREE.Color(HUES[TECH[a].cluster]);
    const colorB = new THREE.Color(HUES[TECH[b].cluster]);

    const positions = new Float32Array([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z]);
    const colors = new Float32Array([colorA.r, colorA.g, colorA.b, colorB.r, colorB.g, colorB.b]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.22,
    });
    const line = new THREE.Line(geo, mat);
    line.userData.a = a;
    line.userData.b = b;
    graph.add(line);
    edgeLines.push(line);
  });

  // ---- Interaction state ----
  const drag = {
    active: false,
    startX: 0, startY: 0,
    rotX: 0, rotY: 0,
    velX: 0, velY: 0,
    lastX: 0, lastY: 0,
  };
  let idleRotSpeed = 0.05; // rad/s, scaled by scroll
  let hoveredIndex = -1;
  const mouse = new THREE.Vector2(0, 0);
  const raycaster = new THREE.Raycaster();

  // Pointer events — drag rotates graph, move updates hover
  function onPointerDown(e) {
    drag.active = true;
    drag.startX = drag.lastX = e.clientX;
    drag.startY = drag.lastY = e.clientY;
    drag.velX = drag.velY = 0;
  }
  function onPointerMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (drag.active) {
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      drag.rotY += dx * 0.005;
      drag.rotX += dy * 0.005;
      drag.rotX = Math.max(-1.0, Math.min(1.0, drag.rotX));
      drag.velX = dy * 0.005;
      drag.velY = dx * 0.005;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
    }
  }
  function onPointerUp() {
    drag.active = false;
  }

  const isInteractive = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches;
  const canvasEl = renderer.domElement;
  if (isInteractive) {
    canvasEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  // Scroll dolly — plain scroll listener, works whether Lenis is active or not
  let scrollProgress = 0;
  function onScroll() {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    scrollProgress = Math.min(1, Math.max(0, scrolled / Math.max(1, window.innerHeight)));
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Entrance animation ----
  const gsap = window.gsap;
  if (gsap && !prefersReducedMotion) {
    nodeMeshes.forEach((m, i) => {
      const target = m.userData.finalPos;
      m.position.set(0, 0, 0);
      m.scale.set(0, 0, 0);
      glowSprites[i].position.copy(m.position);
      glowSprites[i].material.opacity = 0;
      labelObjs[i].userData.el.style.opacity = '0';

      gsap.to(m.position, {
        x: target.x, y: target.y, z: target.z,
        duration: 1.1,
        ease: 'power3.out',
        delay: 0.3 + i * 0.04,
        onUpdate: () => { glowSprites[i].position.copy(m.position); },
      });
      gsap.to(m.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.9,
        ease: 'back.out(1.4)',
        delay: 0.35 + i * 0.04,
      });
      gsap.to(glowSprites[i].material, {
        opacity: 0.55,
        duration: 0.8,
        delay: 0.5 + i * 0.04,
      });
      gsap.to(labelObjs[i].userData.el.style, {
        opacity: 1,
        duration: 0.4,
        delay: 0.7 + i * 0.04,
      });
    });

    // Edges: fade in after nodes arrive
    edgeLines.forEach((line, i) => {
      line.material.opacity = 0;
      gsap.to(line.material, {
        opacity: 0.22,
        duration: 0.6,
        delay: 1.0 + i * 0.02,
      });
    });
  }

  // ---- Render loop with IntersectionObserver pause ----
  let rafId = 0;
  let isVisible = true;
  const clock = new THREE.Clock();

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      isVisible = e.isIntersecting;
      if (isVisible && !rafId && !prefersReducedMotion) {
        clock.start();
        tick();
      }
    });
  }, { threshold: 0.05 });
  io.observe(hero);

  function updateEdgePositions() {
    edgeLines.forEach(line => {
      const pa = nodeMeshes[line.userData.a].position;
      const pb = nodeMeshes[line.userData.b].position;
      const arr = line.geometry.attributes.position.array;
      arr[0] = pa.x; arr[1] = pa.y; arr[2] = pa.z;
      arr[3] = pb.x; arr[4] = pb.y; arr[5] = pb.z;
      line.geometry.attributes.position.needsUpdate = true;
    });
  }

  function tick() {
    if (!isVisible || prefersReducedMotion) { rafId = 0; return; }
    rafId = requestAnimationFrame(tick);

    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;

    // Idle rotation (dampened when user is dragging)
    if (!drag.active) {
      graph.rotation.y += idleRotSpeed * dt * (1 + scrollProgress * 1.4);
      graph.rotation.x += drag.velX * 0.92;
      graph.rotation.y += drag.velY * 0.92;
      drag.velX *= 0.92;
      drag.velY *= 0.92;
    } else {
      graph.rotation.x = drag.rotX;
      graph.rotation.y += drag.velY * 0.5;
    }

    // Camera dolly on scroll
    camera.position.z = 11 - scrollProgress * 3;
    camera.lookAt(0, 0, 0);

    // Parallax — desktop only (skipped if pointer coarse)
    if (window.matchMedia('(hover: hover)').matches && !drag.active) {
      camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.04;
    }

    // Node bob
    nodeMeshes.forEach((m) => {
      const base = m.userData.finalPos;
      const off = m.userData.bobOffset;
      const y = base.y + Math.sin(t * 0.9 + off) * 0.06;
      m.position.y += (y - m.position.y) * 0.12;
      glowSprites[m.userData.index].position.copy(m.position);
      labelObjs[m.userData.index].position.copy(m.position);
    });

    updateEdgePositions();

    // Hover raycast (desktop only)
    if (isInteractive && !drag.active) {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeMeshes, false);
      const newHover = hits.length ? hits[0].object.userData.index : -1;
      if (newHover !== hoveredIndex) {
        if (hoveredIndex >= 0) {
          labelObjs[hoveredIndex].userData.el.classList.remove('is-active');
          nodeMeshes[hoveredIndex].userData.baseScale = 1;
        }
        if (newHover >= 0) {
          labelObjs[newHover].userData.el.classList.add('is-active');
          nodeMeshes[newHover].userData.baseScale = 1.35;
        }
        hoveredIndex = newHover;
      }
    }
    // Smooth scale toward baseScale
    nodeMeshes.forEach((m) => {
      const s = m.scale.x + (m.userData.baseScale - m.scale.x) * 0.15;
      m.scale.setScalar(s);
    });

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  // Reduced motion: single static frame
  if (prefersReducedMotion) {
    labelObjs.forEach(l => { l.userData.el.style.opacity = '1'; });
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  } else {
    clock.start();
    tick();
  }

  // Resize
  let resizeRaf = 0;
  function onResize() {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    });
  }
  window.addEventListener('resize', onResize, { passive: true });

  // Expose a tiny handle for debugging / verify scripts
  window.__heroGraph = { scene, renderer, camera, nodes: nodeMeshes, edges: edgeLines };
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0.00, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.60, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1.00, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
