/**
 * Hero knowledge-graph scene — Three.js via ESM CDN.
 * Full-bleed behind hero text, interactive, entrance-animated.
 */

import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Timer } from 'three/addons/misc/Timer.js';

const HUES = {
  frontend: 0x4d94ff,
  backend: 0x8b5cf6,
  data: 0x22c55e,
};

// Viewport detection — picks the graph layout at init time.
const IS_MOBILE = window.matchMedia('(max-width: 899px)').matches;

// --- DESKTOP: DNA double helix along X-axis ---
const HELIX_TECH_NAMES = [
  { name: 'TS',              cluster: 'frontend' },
  { name: 'n8n',             cluster: 'backend'  },
  { name: 'JS',              cluster: 'frontend' },
  { name: 'Docker',          cluster: 'backend'  },
  { name: 'React',           cluster: 'frontend' },
  { name: 'Vercel',          cluster: 'backend'  },
  { name: 'React Native',    cluster: 'frontend' },
  { name: 'Resend',          cluster: 'backend'  },
  { name: 'Expo',            cluster: 'frontend' },
  { name: 'GraphQL',         cluster: 'backend'  },
  { name: 'Next.js',         cluster: 'frontend' },
  { name: 'Socket.io',       cluster: 'backend'  },
  { name: 'Tailwind',        cluster: 'frontend' },
  { name: 'AWS',             cluster: 'backend'  },
  { name: 'GSAP',            cluster: 'frontend' },
  { name: 'Stripe',          cluster: 'backend'  },
  { name: 'Framer Motion',   cluster: 'frontend' },
  { name: 'GitHub',          cluster: 'backend'  },
  { name: 'Three.js',        cluster: 'frontend' },
  { name: 'Postgres',        cluster: 'data'     },
  { name: 'Zustand',         cluster: 'frontend' },
  { name: 'Supabase',        cluster: 'data'     },
  { name: 'TanStack Query',  cluster: 'frontend' },
  { name: 'Neo4j',           cluster: 'data'     },
  { name: 'Zod',             cluster: 'frontend' },
  { name: 'Redis',           cluster: 'data'     },
  { name: 'Reanimated',      cluster: 'frontend' },
  { name: 'Claude',          cluster: 'data'     },
  { name: 'Node.js',         cluster: 'backend'  },
  { name: 'Google Analytics',cluster: 'data'     },
  { name: 'NestJS',          cluster: 'backend'  },
  { name: 'PostHog',         cluster: 'data'     },
  { name: 'Prisma',          cluster: 'backend'  },
  { name: 'SQL',             cluster: 'data'     },
];

const HELIX = { xSpan: 8.0, radius: 1.2, turns: 1.5 };

const HELIX_TECH = HELIX_TECH_NAMES.map((t, i) => {
  const pairIndex = Math.floor(i / 2);
  const strand = i % 2;
  const pairCount = Math.ceil(HELIX_TECH_NAMES.length / 2);
  const tt = pairIndex / (pairCount - 1);
  const x = -HELIX.xSpan + tt * HELIX.xSpan * 2;
  const theta = tt * Math.PI * 2 * HELIX.turns + strand * Math.PI;
  const y = Math.sin(theta) * HELIX.radius;
  const z = Math.cos(theta) * HELIX.radius;
  return { ...t, pos: [x, y, z] };
});

const HELIX_EDGES = (() => {
  const edges = [];
  const n = HELIX_TECH_NAMES.length;
  for (let i = 0; i < n - 2; i += 2) edges.push([i, i + 2]);
  for (let i = 1; i < n - 2; i += 2) edges.push([i, i + 2]);
  for (let i = 0; i < n; i += 2) edges.push([i, i + 1]);
  return edges;
})();

// --- MOBILE: original hand-picked cluster/spherical-shell layout ---
const CLUSTER_TECH = [
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
  { name: 'Node.js',       cluster: 'backend',  pos: [ 0.2,  1.7, -0.6] },
  { name: 'NestJS',        cluster: 'backend',  pos: [ 1.2,  0.8, -1.4] },
  { name: 'Prisma',        cluster: 'backend',  pos: [ 0.6, -0.8,  1.5] },
  { name: 'n8n',           cluster: 'backend',  pos: [-0.4, -2.2, -0.4] },
  { name: 'Docker',        cluster: 'backend',  pos: [ 1.4, -2.0,  0.6] },
  { name: 'Vercel',        cluster: 'backend',  pos: [ 0.8,  2.4,  1.0] },
  { name: 'Resend',        cluster: 'backend',  pos: [ 1.8, -0.6, -2.0] },
  { name: 'Postgres',      cluster: 'data',     pos: [ 2.6,  0.4,  1.6] },
  { name: 'Supabase',      cluster: 'data',     pos: [ 3.4,  1.6,  0.2] },
  { name: 'Neo4j',         cluster: 'data',     pos: [ 3.6, -0.4, -0.6] },
  { name: 'Redis',         cluster: 'data',     pos: [ 2.0, -1.8, -1.0] },
  { name: 'Claude',        cluster: 'data',     pos: [ 2.2,  2.4, -1.2] },
  { name: 'Google Analytics', cluster: 'data',  pos: [ 4.0,  2.0, -0.4] },
  { name: 'PostHog',       cluster: 'data',     pos: [ 3.8,  0.8,  1.8] },
  { name: 'SQL',           cluster: 'data',     pos: [ 3.2, -0.4,  2.2] },
  { name: 'GraphQL',       cluster: 'backend',  pos: [ 1.2,  2.2, -2.2] },
  { name: 'Socket.io',     cluster: 'backend',  pos: [ 2.0,  1.0, -1.8] },
  { name: 'AWS',           cluster: 'backend',  pos: [ 2.8, -1.4,  1.4] },
  { name: 'Stripe',        cluster: 'backend',  pos: [ 1.0, -2.4,  1.8] },
  { name: 'GitHub',        cluster: 'backend',  pos: [-0.6,  2.6,  1.4] },
  { name: 'Zustand',       cluster: 'frontend', pos: [-1.8,  0.2,  2.4] },
  { name: 'TanStack Query',cluster: 'frontend', pos: [-1.2, -1.4,  2.2] },
  { name: 'Zod',           cluster: 'frontend', pos: [-2.2,  2.4, -0.4] },
  { name: 'Reanimated',    cluster: 'frontend', pos: [-3.8, -0.2,  1.8] },
];

const CLUSTER_EDGES = [
  [0, 2], [0, 5], [0, 11], [1, 2],
  [2, 3], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9],
  [3, 4],
  [5, 10], [5, 15], [5, 22],
  [7, 8], [7, 9],
  [10, 11], [10, 12], [10, 13], [10, 14], [10, 16], [10, 20], [10, 21],
  [11, 12], [12, 17], [13, 21], [14, 20], [15, 22],
  [17, 18], [18, 19], [19, 21],
  [5, 23], [15, 23], [22, 23],
  [17, 24], [18, 24],
  [10, 25], [11, 25], [10, 26],
  [14, 27], [10, 27], [5, 28], [10, 28], [15, 29], [14, 29],
  [2, 30], [2, 31], [18, 31],
  [0, 32], [2, 32], [11, 32],
  [3, 33], [7, 33],
];

const MOBILE_MQL = window.matchMedia('(max-width: 899px)');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Build a vertical DNA double-helix (spine = Y-axis) with `count` nodes.
 * Used on mobile as the transformer target — nodes spiral from the
 * scattered cluster layout into this tall, narrow shape before the whole
 * thing swirls and drops off-screen.
 */
function buildVerticalHelix(count, ySpan = 4.0, radius = 0.9, turns = 2.0) {
  const out = [];
  const pairCount = Math.max(1, Math.ceil(count / 2));
  for (let i = 0; i < count; i++) {
    const pairIndex = Math.floor(i / 2);
    const strand = i % 2;
    const tt = pairCount > 1 ? pairIndex / (pairCount - 1) : 0;
    const y = -ySpan + tt * ySpan * 2;
    const theta = tt * Math.PI * 2 * turns + strand * Math.PI;
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;
    out.push([x, y, z]);
  }
  return out;
}

function init() {
  const mount = document.getElementById('heroGraph');
  const labelMount = document.getElementById('heroGraphLabels');
  const hero = document.getElementById('hero');
  if (!mount || !labelMount || !hero) return () => {};

  const isMobile = MOBILE_MQL.matches;
  const TECH = isMobile ? CLUSTER_TECH : HELIX_TECH;
  const EDGES = isMobile ? CLUSTER_EDGES : HELIX_EDGES;
  const ROT_AXIS = isMobile ? 'y' : 'x';

  // Track cleanup hooks for hot-swap when viewport crosses the breakpoint.
  const cleanups = [];
  const addListener = (target, ev, handler, opts) => {
    target.addEventListener(ev, handler, opts);
    cleanups.push(() => target.removeEventListener(ev, handler, opts));
  };

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

  // Mobile-only: pre-compute vertical DNA helix target positions (one per node).
  // Used by the press-and-hold transformer effect on the hero section.
  if (isMobile) {
    const hPoints = buildVerticalHelix(nodeMeshes.length, 3.6, 0.85, 2.0);
    nodeMeshes.forEach((m, i) => {
      m.userData.helixPos = new THREE.Vector3(...hPoints[i]);
    });
  }

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
  let morphProgress = 0;   // 0..1, driven by ScrollTrigger on mobile
  let morphEngaged = false; // true once morphProgress has ever been > 0; gates opacity overrides
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
    addListener(canvasEl, 'pointerdown', onPointerDown);
    addListener(window, 'pointermove', onPointerMove);
    addListener(window, 'pointerup', onPointerUp);
  }

  // Scroll dolly — plain scroll listener, works whether Lenis is active or not
  let scrollProgress = 0;
  let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  let scrollVelocity = 0; // px delta accumulated between frames
  function onScroll() {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    scrollProgress = Math.min(1, Math.max(0, scrolled / Math.max(1, window.innerHeight)));
    scrollVelocity += scrolled - lastScrollY;
    lastScrollY = scrolled;
  }
  addListener(window, 'scroll', onScroll, { passive: true });

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
  const timer = new Timer();

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      isVisible = e.isIntersecting;
      if (isVisible && !rafId && !prefersReducedMotion) {
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

    timer.update();
    const dt = Math.min(0.05, timer.getDelta());
    const t = timer.getElapsed();

    // Mobile morph phases (all zero on desktop since morphProgress stays 0).
    //   transformT: cluster → helix corkscrew
    //   dropT:      helix swirls and translates down
    //   fadeT:      opacity fade-out
    const transformT = smoothstep(0.0, 0.45, morphProgress);
    const dropT      = smoothstep(0.55, 1.0, morphProgress);
    const fadeT      = smoothstep(0.65, 1.0, morphProgress);
    const notTransform = 1 - transformT;

    // Rotation: idle spin + swirl boost during morph.
    // Mobile rotates on Y (vertical spine of the helix), desktop on X.
    if (!drag.active) {
      const swirlBoost = 1 + transformT * 5 + dropT * 10;
      graph.rotation[ROT_AXIS] += idleRotSpeed * dt * swirlBoost;
      if (isInteractive) {
        graph.rotation[ROT_AXIS] += scrollVelocity * 0.0018;
      }
      graph.rotation[ROT_AXIS] += drag.velX * 0.92;
      drag.velX *= 0.92;
      drag.velY *= 0.92;
    } else {
      graph.rotation[ROT_AXIS] = drag.rotX;
    }

    // Drop: helix translates downward off-screen during dropT.
    graph.position.y = -dropT * 14;
    // Consume scroll velocity with exponential decay so it bleeds off when user stops scrolling
    scrollVelocity *= 0.85;

    // Camera dolly on scroll
    camera.position.z = 11 - scrollProgress * 3;
    camera.lookAt(0, 0, 0);

    // Parallax — desktop only (skipped if pointer coarse)
    if (window.matchMedia('(hover: hover)').matches && !drag.active) {
      camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.04;
    }

    // Node position: bob around cluster finalPos, then blend toward the helix
    // shape via a mid-flight corkscrew (peaks at transformT = 0.5).
    nodeMeshes.forEach((m, i) => {
      const base = m.userData.finalPos;
      const off = m.userData.bobOffset;
      const bobY = Math.sin(t * 0.9 + off) * 0.06 * notTransform;
      const helix = m.userData.helixPos;

      let tx, ty, tz;
      if (helix) {
        // Linear cluster → helix blend
        const bx = base.x + (helix.x - base.x) * transformT;
        const by = (base.y + bobY) + (helix.y - (base.y + bobY)) * transformT;
        const bz = base.z + (helix.z - base.z) * transformT;
        // Corkscrew offset in the XZ plane — rotates around Y spine, peaks mid-flight
        const spiralAmp = Math.sin(Math.PI * transformT) * 0.65;
        const spiralAngle = transformT * Math.PI * 3.5 + i * 0.37;
        tx = bx + Math.sin(spiralAngle) * spiralAmp;
        ty = by;
        tz = bz + Math.cos(spiralAngle) * spiralAmp;
      } else {
        tx = base.x;
        ty = base.y + bobY;
        tz = base.z;
      }

      const lerpK = 0.15 + transformT * 0.15; // snappier during active morph
      m.position.x += (tx - m.position.x) * lerpK;
      m.position.y += (ty - m.position.y) * lerpK;
      m.position.z += (tz - m.position.z) * lerpK;
      glowSprites[m.userData.index].position.copy(m.position);
      labelObjs[m.userData.index].position.copy(m.position);
    });

    // Fade edges, labels, glow, and the whole graph as the transform progresses.
    // Gated on morphEngaged so the initial entrance animation isn't fought.
    if (isMobile && morphEngaged) {
      const edgeOpacity = 0.22 * notTransform;
      for (let i = 0; i < edgeLines.length; i++) edgeLines[i].material.opacity = edgeOpacity;
      const glowOp = 0.55 * (1 - transformT * 0.3);
      for (let i = 0; i < glowSprites.length; i++) glowSprites[i].material.opacity = glowOp;
      const labelOp = String(notTransform);
      for (let i = 0; i < labelObjs.length; i++) labelObjs[i].userData.el.style.opacity = labelOp;
      const groupOp = String(1 - fadeT);
      mount.style.opacity = groupOp;
      labelMount.style.opacity = groupOp;
    }

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
    // Smooth scale toward baseScale; nodes shrink slightly during the drop
    // so the helix reads as receding into the distance.
    const morphScale = 1 - dropT * 0.35;
    nodeMeshes.forEach((m) => {
      const target = m.userData.baseScale * morphScale;
      const s = m.scale.x + (target - m.scale.x) * 0.15;
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
  addListener(window, 'resize', onResize, { passive: true });

  // Expose a tiny handle for debugging / verify scripts
  window.__heroGraph = {
    scene, renderer, camera,
    nodes: nodeMeshes,
    edges: edgeLines,
    layout: isMobile ? 'cluster' : 'helix',
    setMorphProgress: (p) => {
      morphProgress = Math.min(1, Math.max(0, p));
      if (morphProgress > 0) morphEngaged = true;
    },
    getMorphProgress: () => morphProgress,
  };

  // Return destroy hook — tears down scene + listeners for hot-swap on viewport change
  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (resizeRaf) cancelAnimationFrame(resizeRaf);  // cancel pending resize render
    io.disconnect();
    cleanups.forEach(fn => fn());

    // Remove CSS2DObjects from the scene graph so any stray render() call has nothing to re-append
    labelObjs.forEach(l => {
      if (l.parent) l.parent.remove(l);
      const el = l.userData.el;
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });

    // Defensive: clear anything left behind in labelMount
    while (labelMount.firstChild) labelMount.removeChild(labelMount.firstChild);

    // Reset any opacity the morph applied so a rebuilt scene is fully visible
    mount.style.opacity = '';
    labelMount.style.opacity = '';

    // Dispose Three.js resources
    nodeMeshes.forEach(m => m.material.dispose());
    glowSprites.forEach(s => s.material.dispose());
    edgeLines.forEach(l => { l.geometry.dispose(); l.material.dispose(); });
    nodeGeo.dispose();
    glowTex.dispose();
    renderer.dispose();

    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);

    window.__heroGraph = null;
  };
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

let _destroy = null;
function boot() {
  if (_destroy) _destroy();
  _destroy = init() || null;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

// Hot-swap layout when viewport crosses the 900px breakpoint
const _onBreakpointChange = () => boot();
if (MOBILE_MQL.addEventListener) {
  MOBILE_MQL.addEventListener('change', _onBreakpointChange);
} else if (MOBILE_MQL.addListener) {
  MOBILE_MQL.addListener(_onBreakpointChange);
}
