import { useRef, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// --- CONFIGURATION OBJECT V3.0 ---
// This version focuses on a dynamic, interactive particle system.
const config = {
    // Particle system properties
    particles: {
        count: 55000, // Number of particles in the simulation
        size: 0.02,   // Base size of each particle
        boxSize: 8,   // The cubic volume where particles are generated
    },
    // Colors for the scene
    colors: {
        // Using HSL for easier color manipulation and vibrant results
        baseHue: 285, // Base hue for particles (275 is a purple)
        hueVariance: 20, // How much the hue can vary between particles
    },
    // Animation and simulation properties
    simulation: {
        // Curl noise parameters for organic, swirling motion
        noiseSpeed: 0.1,
        noiseScale: 1.2,
        // How strongly the particles are pushed away from the mouse
        mouseRepulsion: 0.005,
        // How quickly particles return to their original path
        friction: 0.95,
    },
    // Post-processing bloom effect for the glow
    bloom: {
        strength: 0.6, // Intensity of the glow
        radius: 0.4,   // How far the glow spreads
        threshold: 0.1,// Brightness threshold to trigger the bloom
    },
    // Camera settings
    camera: {
        initialDistance: 5,
        parallaxIntensity: 0.005,
    }
};

// --- PERFORMANCE BUDGETS ---
// Mobile/weaker devices get fewer particles; DPR is capped so the
// bloom pass doesn't render a 4K framebuffer on retina screens.
const isCoarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024; // lg breakpoint
const baseCount = prefersReducedMotion ? 0 : (isDesktop ? config.particles.count : 12500);
const PARTICLE_COUNT = isCoarse ? Math.round(baseCount * 0.18) : baseCount;
const MAX_DPR = 1.5;


// v3.0: Interactive Particle Nebula Scene
export default function GenerativeArtSceneV3() {
    const mountRef = useRef(null);
    // Refs for Three.js objects that need to be accessed across renders
    const rendererRef = useRef(null);
    const composerRef = useRef(null);
    const cameraRef = useRef(null);
    const mouseRef = useRef(new THREE.Vector2(0, 0)); // Using a Vector2 for mouse position

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        // --- CORE THREE.JS & POST-PROCESSING SETUP ---

        // 1. Scene and Camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = config.camera.initialDistance;
        cameraRef.current = camera;

        // 2. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
        rendererRef.current = renderer;
        currentMount.appendChild(renderer.domElement);

        // 3. Post-Processing Composer for Bloom Effect
        const renderPass = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight), config.bloom.strength, config.bloom.radius, config.bloom.threshold);
        const composer = new EffectComposer(renderer);
        composer.addPass(renderPass);
        composer.addPass(bloomPass);
        composerRef.current = composer;


        // --- PARTICLE SYSTEM CREATION ---
        const particleCount = PARTICLE_COUNT;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3).fill(0); // For physics simulation
        const baseColor = new THREE.Color();

        for (let i = 0; i < particleCount; i++) {
            // Position particles randomly within a box
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * config.particles.boxSize;
            positions[i3 + 1] = (Math.random() - 0.5) * config.particles.boxSize;
            positions[i3 + 2] = (Math.random() - 0.5) * config.particles.boxSize;

            // Assign a unique, vibrant color to each particle
            const hue = (config.colors.baseHue + (Math.random() - 0.5) * config.colors.hueVariance) / 360;
            baseColor.setHSL(hue, 1.0, 0.6);
            colors[i3] = baseColor.r;
            colors[i3 + 1] = baseColor.g;
            colors[i3 + 2] = baseColor.b;
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // --- SHADER MATERIAL FOR PARTICLES ---
        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                u_pointSize: { value: config.particles.size * renderer.getPixelRatio() }
            },
            vertexShader: `
                attribute vec3 color;
                varying vec3 vColor;
                uniform float u_pointSize;

                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = u_pointSize * (10.0 / -mvPosition.z); // Make particles appear smaller further away
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    // Create a soft, circular shape for each particle
                    float strength = distance(gl_PointCoord, vec2(0.5));
                    strength = 1.0 - step(0.5, strength);
                    if (strength < 0.01) discard; // Discard transparent fragments for performance

                    gl_FragColor = vec4(vColor, strength);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending, // Brightens where particles overlap
            depthWrite: false, // Important for correct blending
        });

        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);


        // --- ANIMATION & SIMULATION LOOP ---
        let frameId;
        const startTime = performance.now();
        const runningRef = { current: true };

        // --- CPU-based Particle Simulation ---
        // Allocation-free: all math is done on plain floats so the loop
        // never triggers GC mid-frame (the old version allocated 3
        // THREE.Vector3 objects per particle per frame â€” ~165k/frame).
        const HALF_BOX = config.particles.boxSize / 2;
        const vel = velocities; // Float32Array alias
        const pos = positions; // Float32Array alias

        const simulate = (elapsedTime) => {
            const speed = elapsedTime * config.simulation.noiseSpeed;
            const scale = config.simulation.noiseScale;
            const repulsion = config.simulation.mouseRepulsion;
            const friction = config.simulation.friction;
            const mx = mouseRef.current.x * HALF_BOX;
            const my = mouseRef.current.y * HALF_BOX;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;
                let px = pos[i3];
                let py = pos[i3 + 1];
                let pz = pos[i3 + 2];

                // Swirl force â€” trig field approximation of curl noise
                const fx = Math.sin(py * scale + speed);
                const fy = Math.cos(pz * scale + speed);
                const fz = Math.sin(px * scale + speed);

                // Mouse repulsion (2D falloff in view plane)
                const dx = px - mx;
                const dy = py - my;
                const distSq = dx * dx + dy * dy;
                let mfx = 0;
                let mfy = 0;
                if (distSq < 4) {
                    const dist = Math.sqrt(distSq) + 0.1;
                    const inv = 1 / dist;
                    mfx = dx * inv * repulsion / dist;
                    mfy = dy * inv * repulsion / dist;
                }

                let vx = (vel[i3] + fx * 0.001 + mfx) * friction;
                let vy = (vel[i3 + 1] + fy * 0.001 + mfy) * friction;
                let vz = (vel[i3 + 2] + fz * 0.001) * friction;
                vel[i3] = vx;
                vel[i3 + 1] = vy;
                vel[i3 + 2] = vz;

                px += vx;
                py += vy;
                pz += vz;

                // Boundary wrap (fold back into the box)
                if (px > HALF_BOX) px = -HALF_BOX; else if (px < -HALF_BOX) px = HALF_BOX;
                if (py > HALF_BOX) py = -HALF_BOX; else if (py < -HALF_BOX) py = HALF_BOX;
                if (pz > HALF_BOX) pz = -HALF_BOX; else if (pz < -HALF_BOX) pz = HALF_BOX;

                pos[i3] = px;
                pos[i3 + 1] = py;
                pos[i3 + 2] = pz;
            }
        };

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            if (!runningRef.current) return; // paused (offscreen/tab hidden)

            const elapsedTime = (performance.now() - startTime) / 1000;
            simulate(elapsedTime);

            particleSystem.geometry.attributes.position.needsUpdate = true;

            // Camera Parallax
            camera.position.x += (mouseRef.current.x * config.camera.parallaxIntensity - camera.position.x) * 0.02;
            camera.position.y += (-mouseRef.current.y * config.camera.parallaxIntensity - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            // Use the composer to render the scene with post-processing
            composer.render();
        };
        animate();


        // --- EVENT HANDLERS & CLEANUP ---
        // Pause rendering whenever the hero is offscreen or the tab is hidden.
        const io = new IntersectionObserver(([entry]) => {
            runningRef.current = entry.isIntersecting;
        }, { threshold: 0 });
        io.observe(currentMount);

        const handleVisibility = () => {
            if (document.hidden) {
                runningRef.current = false;
            } else {
                const r = currentMount.getBoundingClientRect();
                runningRef.current = r.bottom > 0 && r.top < window.innerHeight;
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        const handleResize = () => {
            const w = currentMount.clientWidth;
            const h = currentMount.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            composer.setSize(w, h);
        };

        let mouseRaf = null;
        const handleMouseMove = (e) => {
            if (mouseRaf !== null) return;
            mouseRaf = requestAnimationFrame(() => {
                mouseRaf = null;
                mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
                mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
            });
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            cancelAnimationFrame(frameId);
            if (mouseRaf !== null) cancelAnimationFrame(mouseRaf);
            io.disconnect();
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            particleGeometry.dispose();
            particleMaterial.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />;
}
