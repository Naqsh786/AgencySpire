import { useLayoutEffect, useRef, useState } from 'react';
import { Renderer, Camera, Transform, Texture, Program, Mesh, Geometry } from 'ogl';

const cylinderConfig = { radius: 2.5, height: 2, radialSegments: 64, heightSegments: 1 };
const particleConfig = { numParticles: 12, particleRadius: 3.3, segments: 20, angleSpan: 0.3 };
const imageConfig = { width: 1024, height: 1024 };

const cylinderVertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const cylinderFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uDarkness;
  varying vec2 vUv;
  void main() {
    vec4 tex = texture2D(tMap, vUv);
    tex.rgb *= (1.0 - uDarkness);
    gl_FragColor = tex;
  }
`;

const particleVertex = /* glsl */ `
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const particleFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

const drawImageCover = (ctx, img, x, y, w, h) => {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = w / h;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = img.naturalWidth;
  let sourceHeight = img.naturalHeight;
  if (imgRatio > canvasRatio) {
    sourceWidth = img.naturalHeight * canvasRatio;
    sourceX = (img.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = img.naturalWidth / canvasRatio;
    sourceY = (img.naturalHeight - sourceHeight) / 2;
  }
  ctx.save();
  ctx.translate(x, y + h);
  ctx.scale(1, -1);
  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, w, h);
  ctx.restore();
};

const createCylinderGeometry = (gl, config) => {
  const { radius, height, radialSegments, heightSegments } = config;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let y = 0; y <= heightSegments; y += 1) {
    const v = y / heightSegments;
    const yPos = (v - 0.5) * height;
    for (let x = 0; x <= radialSegments; x += 1) {
      const u = x / radialSegments;
      const theta = u * Math.PI * 2;
      const xPos = Math.cos(theta) * radius;
      const zPos = Math.sin(theta) * radius;
      positions.push(xPos, yPos, zPos);
      uvs.push(u, 1 - v);
    }
  }
  for (let y = 0; y < heightSegments; y += 1) {
    for (let x = 0; x < radialSegments; x += 1) {
      const a = y * (radialSegments + 1) + x;
      const b = a + radialSegments + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(positions) },
    uv: { size: 2, data: new Float32Array(uvs) },
    index: { data: new Uint16Array(indices) },
  });
};

const createParticleGeometry = (gl, config, index, height) => {
  const { numParticles, particleRadius, segments, angleSpan } = config;
  const linePositions = [];
  const startAngle = (index / numParticles) * Math.PI * 2;
  const isTopHalf = index < numParticles / 2;
  const yPosition = isTopHalf
    ? height * 0.7 + Math.random() * height * 0.3
    : -height * 1 + Math.random() * height * 0.3;
  for (let j = 0; j <= segments; j += 1) {
    const t = j / segments;
    const angle = startAngle + angleSpan * t;
    const x = Math.cos(angle) * particleRadius;
    const z = Math.sin(angle) * particleRadius;
    linePositions.push(x, yPosition, z);
  }
  return {
    geometry: new Geometry(gl, {
      position: { size: 3, data: new Float32Array(linePositions) },
    }),
    userData: {
      baseAngle: startAngle,
      angleSpan,
      baseY: yPosition,
      speed: 0.5 + Math.random() * 1,
      radius: particleRadius,
    },
  };
};

const SushCarousel = ({
  images = [],
  darkness = 0.3,
  backgroundColor = '#000000',
  rotationSpeed = 28.27,
  progressRef = null,
}) => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const sceneRef = useRef(null);
  const lastProgressRef = useRef(0);
  const velocityRef = useRef(0);

  const imagesKey = images.join('|');
  useLayoutEffect(() => {
    if (!canvasRef.current) return undefined;
    let isActive = true;
    let animationFrameId;
    let isInView = true;
    let sceneReady = false;

    const renderer = new Renderer({
      canvas: canvasRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: Math.min(window.devicePixelRatio, 1),
      alpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.disable(gl.CULL_FACE);

    const getDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const baseScaleFactor = Math.min(width, height) / 1000;
      const targetRadius = isMobile
        ? Math.max(1.5, baseScaleFactor * 3.5)
        : Math.max(2, baseScaleFactor * 2.8);
      const targetHeight = isMobile ? targetRadius * 0.75 : targetRadius * 0.9;
      const cameraZ = isMobile ? 6 : isTablet ? 7 : 8;
      const fov = isMobile ? 50 : 45;
      return { cylinderScale: targetRadius / cylinderConfig.radius, targetHeight, cameraZ, fov, isMobile };
    };

    const dimensions = getDimensions();
    const cameraOptions = { fov: dimensions.fov };
    if (dimensions.isMobile) {
      cameraOptions.aspect = window.innerWidth / window.innerHeight;
    }
    const camera = new Camera(gl, cameraOptions);
    camera.position.set(0, 0, dimensions.cameraZ);
    const scene = new Transform();
    const activeConfig = { ...cylinderConfig, height: dimensions.targetHeight };
    const geometry = createCylinderGeometry(gl, activeConfig);
    const safeLimit = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), 8192);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: false, alpha: false });
    const numImages = images.length;
    const totalWidth = imageConfig.width * numImages;
    const scale = Math.min(1, safeLimit / totalWidth);
    canvas.width = Math.floor(totalWidth * scale);
    canvas.height = Math.floor(imageConfig.height * scale);
    let loaded = 0;
    const imageEls = [];
    const imageTags = [];
    let cylinderMesh = null;
    const particles = [];
    const cameraAnim = { x: 0, y: 0, z: dimensions.cameraZ };
    const circumference = 2 * Math.PI * cylinderConfig.radius;
    const textureAspect = imageConfig.height / (imageConfig.width * numImages);
    const idealHeight = circumference * textureAspect;
    const heightCorrection = idealHeight / activeConfig.height;

    const handleResize = () => {
      const newDimensions = getDimensions();
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.perspective({
        fov: newDimensions.fov,
        aspect: window.innerWidth / window.innerHeight,
      });
      if (cylinderMesh) {
        if (newDimensions.isMobile) {
          cylinderMesh.scale.set(
            newDimensions.cylinderScale,
            newDimensions.cylinderScale * heightCorrection,
            newDimensions.cylinderScale,
          );
        } else {
          cylinderMesh.scale.set(
            newDimensions.cylinderScale,
            newDimensions.cylinderScale,
            newDimensions.cylinderScale,
          );
        }
      }
      cameraAnim.z = newDimensions.cameraZ;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (!isActive) return undefined;
      if (!isInView) {
        animationFrameId = undefined;
        return undefined;
      }
      animationFrameId = requestAnimationFrame(animate);

      let progress = 0;
      if (progressRef && typeof progressRef.current === 'number') {
        progress = Math.max(0, Math.min(1, progressRef.current));
      }

      // 5-stage cinematic camera path
      if (progress < 0.25) {
        const t = progress / 0.25;
        cameraAnim.x = 0;
        cameraAnim.y = 0 + t * 5;
        cameraAnim.z = dimensions.cameraZ - t * (dimensions.cameraZ - 5);
      } else if (progress < 0.5) {
        const t = (progress - 0.25) / 0.25;
        cameraAnim.x = 0 + t * 1.5;
        cameraAnim.y = 5 - t * 3;
        cameraAnim.z = 5 - t * 3;
      } else if (progress < 0.85) {
        const t = (progress - 0.5) / 0.35;
        cameraAnim.x = 1.5 - t * 1;
        cameraAnim.y = 2 - t * 2;
        cameraAnim.z = 2 - t * 1.2;
      } else {
        const t = (progress - 0.85) / 0.15;
        cameraAnim.x = 0.5 - t * 6.5;
        cameraAnim.y = 0 - t;
        cameraAnim.z = 0.8 + t * (dimensions.cameraZ - 0.8);
      }

      const targetRotation = progress * rotationSpeed;
      const prevProgress = lastProgressRef.current;
      const progressDelta = progress - prevProgress;
      velocityRef.current = progressDelta;
      lastProgressRef.current = progress;

      camera.position.set(cameraAnim.x, cameraAnim.y, cameraAnim.z);
      camera.lookAt([0, 0, 0]);

      if (cylinderMesh) {
        cylinderMesh.rotation.y = targetRotation;
        const speed = Math.abs(progressDelta) * 100;
        const isRotating = Math.abs(progressDelta) > 1e-4;
        particles.forEach((particle) => {
          const data = particle.userData;
          const targetOpacity = isRotating ? Math.min(speed * 3, 0.95) : 0;
          const currentOpacity = particle.program.uniforms.uOpacity.value;
          particle.program.uniforms.uOpacity.value =
            currentOpacity + (targetOpacity - currentOpacity) * 0.15;
          if (isRotating) {
            const rotationOffset = progressDelta * data.speed * 1.5;
            const newBase = data.baseAngle + rotationOffset;
            data.baseAngle = newBase;
            const segments = particleConfig.segments;
            const positions = particle.geometry.attributes.position.data;
            for (let j = 0; j <= segments; j += 1) {
              const t = j / segments;
              const angle = newBase + data.angleSpan * t;
              const radius = data.radius;
              positions[j * 3] = Math.cos(angle) * radius;
              positions[j * 3 + 1] = data.baseY;
              positions[j * 3 + 2] = Math.sin(angle) * radius;
            }
            particle.geometry.attributes.position.needsUpdate = true;
          }
        });
      }

      renderer.render({ scene, camera });
      return undefined;
    };

    const resumeIfNeeded = () => {
      if (isActive && isInView && sceneReady && animationFrameId === undefined) {
        animate();
      }
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isInView = entry.isIntersecting;
        if (isInView) resumeIfNeeded();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvasRef.current);

    images.forEach((imageSrc, index) => {
      const img = new window.Image();
      imageTags[index] = img;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!isActive) return;
        imageEls[index] = img;
        loaded += 1;
        if (loaded === numImages) {
          const totalCanvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          imageEls.forEach((imgEl, i) => {
            const xStart = Math.floor((i / numImages) * totalCanvasWidth);
            const xEnd = Math.floor(((i + 1) / numImages) * totalCanvasWidth);
            const drawWidth = xEnd - xStart;
            drawImageCover(ctx, imgEl, xStart, 0, drawWidth, canvasHeight);
          });
          const texture = new Texture(gl, {
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE,
            minFilter: gl.LINEAR,
            magFilter: gl.LINEAR,
            generateMipmaps: false,
          });
          texture.image = canvas;
          texture.needsUpdate = true;
          const program = new Program(gl, {
            vertex: cylinderVertex,
            fragment: cylinderFragment,
            uniforms: { tMap: { value: texture }, uDarkness: { value: darkness } },
            cullFace: null,
          });
          cylinderMesh = new Mesh(gl, { geometry, program });
          cylinderMesh.setParent(scene);
          cylinderMesh.rotation.y = 0;
          cylinderMesh.scale.set(
            dimensions.cylinderScale,
            dimensions.cylinderScale,
            dimensions.cylinderScale,
          );
          setIsLoading(false);
          for (let i = 0; i < particleConfig.numParticles; i += 1) {
            const { geometry: lineGeometry, userData } = createParticleGeometry(
              gl,
              particleConfig,
              i,
              activeConfig.height,
            );
            const lineProgram = new Program(gl, {
              vertex: particleVertex,
              fragment: particleFragment,
              uniforms: { uColor: { value: [1, 1, 1] }, uOpacity: { value: 0 } },
              transparent: true,
              depthTest: true,
            });
            const particle = new Mesh(gl, {
              geometry: lineGeometry,
              program: lineProgram,
              mode: gl.LINE_STRIP,
            });
            particle.userData = userData;
            particle.setParent(scene);
            particles.push(particle);
          }
          sceneRef.current = { cylinderMesh, particles };
          sceneReady = true;
          if (isActive && isInView) animate();
        }
      };
      img.onerror = () => {
        if (!isActive) return;
        setIsLoading(false);
      };
      img.src = imageSrc;
    });

    return () => {
      isActive = false;
      if (animationFrameId !== undefined) cancelAnimationFrame(animationFrameId);
      intersectionObserver.disconnect();
      imageTags.forEach((img) => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
      window.removeEventListener('resize', handleResize);
      geometry.remove();
      particles.forEach((p) => p.geometry.remove());
    };
  }, [images, imagesKey, darkness, rotationSpeed, progressRef]);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor }}
    >
      {isLoading && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor }}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
      <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
        <canvas ref={canvasRef} className="h-full w-full block" />
      </div>
    </div>
  );
};

export default SushCarousel;
