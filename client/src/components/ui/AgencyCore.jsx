import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { NODES } from './agencyCoreData';

const NODE_COUNT = NODES.length;
const ORBIT_RADIUS = 2.6;
const CORE_RADIUS = 0.55;

const AgencyCore = forwardRef(function AgencyCore(_, ref) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    activeIndex: 0,
    targetActive: 0,
    scrollProgress: 0,
  });
  const hoverIndexRef = useRef(-1);

  useImperativeHandle(ref, () => ({
    setActive: (i) => {
      stateRef.current.targetActive = i;
    },
    setHover: (i) => {
      hoverIndexRef.current = i ?? -1;
    },
    setScrollProgress: (p) => {
      stateRef.current.scrollProgress = p;
    },
  }));

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const w = currentMount.clientWidth;
    const h = currentMount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    currentMount.appendChild(renderer.domElement);

    const accent = new THREE.Color('#D8B4E2');
    const accentDim = new THREE.Color('#6B4A78');

    // --- Build a circular radial-gradient texture for halos (no square) ---
    const haloTexture = createCircularGradientTexture(256);

    // --- Central core: icosahedron wireframe + inner solid ---
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreSolid = new THREE.Mesh(
      new THREE.IcosahedronGeometry(CORE_RADIUS, 1),
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
      })
    );
    coreGroup.add(coreSolid);

    const coreWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(CORE_RADIUS, 1)),
      new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.85 })
    );
    coreGroup.add(coreWire);

    // Outer ring around core (very slow spin for life)
    const coreRing = new THREE.Mesh(
      new THREE.TorusGeometry(CORE_RADIUS * 1.6, 0.005, 8, 64),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.4 })
    );
    coreGroup.add(coreRing);

    // --- 5 orbital nodes (STATIONARY â€” no group rotation) ---
    const nodeMeshes = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = (i / NODE_COUNT) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * ORBIT_RADIUS;
      const y = Math.sin(angle) * ORBIT_RADIUS;

      const group = new THREE.Group();
      group.position.set(x, y, 0);
      scene.add(group);

      // Outer ring around node
      const outerRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.005, 8, 32),
        new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.5 })
      );
      group.add(outerRing);

      // Solid sphere
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 20, 20),
        new THREE.MeshBasicMaterial({
          color: accentDim,
          transparent: true,
          opacity: 0.5,
        })
      );
      group.add(sphere);

      // Glow halo (additive sprite, uses circular texture â†’ no square artifact)
      const haloMaterial = new THREE.SpriteMaterial({
        map: haloTexture,
        color: accent,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });
      const halo = new THREE.Sprite(haloMaterial);
      halo.scale.set(1.2, 1.2, 1);
      group.add(halo);

      // Per-node visual state only â€” labels are rendered as DOM in the parent
      // to keep the visual clean and avoid sprite/texture artifacts.
      nodeMeshes.push({ group, sphere, outerRing, halo, haloMaterial });
    }

    // --- Connecting lines from core to each node ---
    const lines = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = (i / NODE_COUNT) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * ORBIT_RADIUS;
      const y = Math.sin(angle) * ORBIT_RADIUS;

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([0, 0, 0, x, y, 0]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.12,
      });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      lines.push({ material });
    }

    // --- Ambient particle field ---
    const particleCount = 150;
    const particles = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 4 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      particles[i * 3] = r * Math.cos(phi) * Math.cos(theta);
      particles[i * 3 + 1] = r * Math.cos(phi) * Math.sin(theta);
      particles[i * 3 + 2] = r * Math.sin(phi);
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    const partMat = new THREE.PointsMaterial({
      color: accent,
      size: 0.02,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const points = new THREE.Points(partGeo, partMat);
    scene.add(points);

    // --- Animation loop ---
    let frameId = null;
    let isVisible = true;
    const startTime = performance.now();

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(currentMount);

    const animate = () => {
      if (!isVisible) {
        frameId = requestAnimationFrame(animate);
        return;
      }
      frameId = requestAnimationFrame(animate);

      const t = (performance.now() - startTime) / 1000;
      const s = stateRef.current;
      const hover = hoverIndexRef.current;

      // Ease active index toward target (smooth stage transitions)
      s.activeIndex += (s.targetActive - s.activeIndex) * 0.08;

      // STATIONARY nodes â€” no group rotation. Only the core's outer ring spins slowly.
      coreGroup.rotation.y = -s.rotationY * 0;
      coreRing.rotation.z = t * 0.15;

      // Ambient bob on core
      coreGroup.position.y = Math.sin(t * 0.6) * 0.06;

      // Per-node state. Each node gets a continuous intensity that combines:
      //   - the scroll-driven stage weight (1.0 at exact stage, falling off on both sides)
      //   - hover boost
      //   - the eased activeIndex for adjacency weighting
      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodeMeshes[i];

        // Distance to the eased active index (1..4). 0 = fully active.
        // Strategy (node 0) is always the "foundation" â€” it stays subtly lit
        // when any of the four disciplines is active, but is never the focal node.
        const isStrategyNode = i === 0;
        const isFoundation = isStrategyNode;
        const dist = Math.abs(s.activeIndex - i);

        // Stage weight: 1 at the active node, sharp falloff so adjacent nodes
        // are visibly dimmer. Foundation (node 0) gets a constant soft glow.
        const stageWeight = Math.max(0, 1 - dist * 0.95);
        const foundationGlow = isFoundation ? 0.18 : 0;

        const isHovered = hover === i;

        // Sphere + ring opacity follow stage weight + foundation glow + hover
        const baseOpacity = 0.15 + stageWeight * 0.85 + foundationGlow;
        const targetOpacity = Math.min(1, baseOpacity + (isHovered ? 0.1 : 0));
        n.sphere.material.opacity += (targetOpacity - n.sphere.material.opacity) * 0.12;
        n.outerRing.material.opacity += (targetOpacity * 0.6 - n.outerRing.material.opacity) * 0.12;

        // Halo opacity: strong at active, soft at neighbors, zero elsewhere.
        // Foundation node has a very subtle halo. Hover gives an extra bump.
        const haloBase = stageWeight * 0.75 + foundationGlow * 0.4;
        const haloTarget = Math.min(0.85, haloBase + (isHovered ? 0.15 : 0));
        n.haloMaterial.opacity += (haloTarget - n.haloMaterial.opacity) * 0.1;

        // Halo size: scales with stage weight
        const haloSize = 0.9 + stageWeight * 0.8 + (isHovered ? 0.2 : 0);
        n.halo.scale.setScalar(n.halo.scale.x + (haloSize - n.halo.scale.x) * 0.1);

        // Sphere scale: subtle pulse for active, gentle scale up for hover
        const sphereScale = 1 + stageWeight * 0.4 + (isHovered ? 0.15 : 0);
        const breathe = 1 + Math.sin(t * 2.5 + i) * 0.05 * stageWeight;
        const finalSphereScale = sphereScale * breathe;
        n.sphere.scale.setScalar(n.sphere.scale.x + (finalSphereScale - n.sphere.scale.x) * 0.12);
      }

      // Per-line state â€” same stage-weight logic
      for (let i = 0; i < NODE_COUNT; i++) {
        const dist = Math.abs(s.activeIndex - i);
        const stageWeight = Math.max(0, 1 - dist * 0.95);
        const isFoundation = i === 0;
        const foundationGlow = isFoundation ? 0.18 : 0;
        const isHovered = hover === i;
        const target = 0.1 + stageWeight * 0.7 + foundationGlow * 0.4 + (isHovered ? 0.1 : 0);
        lines[i].material.opacity += (target - lines[i].material.opacity) * 0.1;
      }

      // Particle field slow drift
      points.rotation.y = t * 0.02;

      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(animate);

    // --- Resize ---
    const handleResize = () => {
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(currentMount);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      observer.disconnect();
      ro.disconnect();
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      coreSolid.geometry.dispose();
      coreSolid.material.dispose();
      coreWire.geometry.dispose();
      coreWire.material.dispose();
      coreRing.geometry.dispose();
      coreRing.material.dispose();
      nodeMeshes.forEach((n) => {
        n.sphere.geometry.dispose();
        n.sphere.material.dispose();
        n.outerRing.geometry.dispose();
        n.outerRing.material.dispose();
        n.haloMaterial.map?.dispose();
        n.haloMaterial.dispose();
      });
      lines.forEach((l) => {
        l.material.dispose();
      });
      partGeo.dispose();
      partMat.dispose();
      haloTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
});

export default AgencyCore;

// --- helpers ---

// Build a circular radial-gradient texture so sprite halos are round (not square).
function createCircularGradientTexture(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.55)');
  grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.12)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
