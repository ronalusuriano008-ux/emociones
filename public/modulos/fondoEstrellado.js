//import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';
import * as THREE from '/three/three.module.js';

export class StarryBackground {
  constructor(scene, options = {}) {
    this.group = new THREE.Group();
    this.updates = [];
    this.shootingStars = [];
    this.prevTime = 0;

    // Shaders por defecto para las nebulosas (si no se proveen)
    this.nebulaVertexShader = options.nebulaVertexShader || this.defaultNebulaVertexShader();
    this.nebulaFragmentShader = options.nebulaFragmentShader || this.defaultNebulaFragmentShader();

    this._initStarLayers();
    this._initNebulas();
    this._initInterstellarGas();
    this._initShootingStars();
    this._initGodRays();
    this._initCosmicDust();

    scene.add(this.group);
  }

  // ── UTILIDADES INTERNAS ──

  _createParticles(count, params) {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const r = Math.random() * params.spread;
      positions[i * 3] = Math.cos(theta) * Math.cos(phi) * r;
      positions[i * 3 + 1] = Math.sin(phi) * r;
      positions[i * 3 + 2] = Math.cos(theta) * Math.sin(phi) * r;
      randoms[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: params.size || 1.0 },
        uColor: { value: new THREE.Color(params.color || '#ffffff') },
        uOpacity: { value: params.opacity || 1.0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      vertexShader: `
        attribute float aRandom;
        uniform float uTime;
        uniform float uSize;
        uniform float uPixelRatio;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          pos.x += sin(uTime * 0.1 + aRandom * 6.28) * 0.5;
          pos.y += cos(uTime * 0.08 + aRandom * 6.28) * 0.5;
          vAlpha = 0.5 + 0.5 * sin(uTime * 0.5 + aRandom * 6.28);
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = uSize * uPixelRatio * (60.0 / -mv.z);
          gl_PointSize = max(gl_PointSize, 0.5);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d) * uOpacity * vAlpha;
          gl_FragColor = vec4(uColor, a);
        }
      `
    });

    return new THREE.Points(geo, mat);
  }

  defaultNebulaVertexShader() {
    return `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  defaultNebulaFragmentShader() {
    return `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
        return v;
      }
      void main() {
        vec2 uv = vUv - 0.5;
        float dist = length(uv);
        float n = fbm(uv * 3.0 + uTime * 0.05);
        vec3 color = mix(uColor1, uColor2, n);
        float alpha = smoothstep(0.5, 0.0, dist) * n * 0.3;
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  // ── INICIALIZADORES DE CAPAS ──

  _initStarLayers() {
    const layers = [

      {
        name: 'farStars',
        count: 15000,
        spread: 600,
        size: 0.10,
        color: '#a040ff',
        opacity: 0.40
      },

      {
        name: 'midStars',
        count: 10000,
        spread: 350,
        size: 0.30,
        color: '#ffffff',
        opacity: 0.75
      },

      {
        name: 'nearStars',
        count: 8000,
        spread: 200,
        size: 0.55,
        color: '#00ff88',
        opacity: 1.0
      },

      {
        name: 'redStars',
        count: 2000,
        spread: 250,
        size: 0.80,
        color: '#ff40aa',
        opacity: 0.85
      },

      {
        name: 'blueStars',
        count: 2000,
        spread: 250,
        size: 0.80,
        color: '#40c0ff',
        opacity: 0.85
      }

    ];
    /*
      _initStarLayers() {
        const layers = [
          { name: 'farStars', count: 40000, spread: 500, size: 0.12, color: '#9900ff', opacity: 0.5 },
          { name: 'midStars', count: 30000, spread: 300, size: 1, color: '#ffffff', opacity: 0.5 },
          { name: 'nearStars', count: 20000, spread: 150, size: 0.6, color: '#09ff00', opacity: 1.0 },
          { name: 'redStars', count: 9000, spread: 50, size: 0.9, color: '#e5f0fa', opacity: 0.7 },
          { name: 'blueStars', count: 5000, spread: 50, size: 0.5, color: '#ff0000', opacity: 0.9 }
        ]; 
    */
    layers.forEach(cfg => {
      const stars = this._createParticles(cfg.count, cfg);
      stars.name = cfg.name;
      this.group.add(stars);
      this.updates.push((t) => { stars.material.uniforms.uTime.value = t; });
    });
  }

  _initNebulas() {
    const nebulaConfigs = [
      {
        colors: ['#4020ff', '#ff60ff'],
        pos: [-30, 20, -80],
        rot: 0.3,
        scale: 2.0
      },
      {
        colors: ['#2060ff', '#40c0ff'],
        pos: [35, -15, -60],
        rot: -0.5,
        scale: 1.4
      },
      {
        colors: ['#ff4080', '#ff80c0'],
        pos: [0, 5, -100],
        rot: 0.8,
        scale: 2.5
      },
      {
        colors: ['#40a0ff', '#80e0ff'],
        pos: [-20, -25, -50],
        rot: 1.2,
        scale: 1.0
      },
      {
        colors: ['#9040ff', '#d080ff'],
        pos: [25, 25, -70],
        rot: -0.2,
        scale: 1.3
      },
      {
        colors: ['#6040ff', '#ff80ff'],
        pos: [0, 10, -120],
        rot: 0.1,
        scale: 3.0
      },
      {
        colors: ['#ff6060', '#ffb080'],
        pos: [-40, -5, -90],
        rot: 0.6,
        scale: 1.8
      }
    ];

    nebulaConfigs.forEach((cfg) => {
      const geo = new THREE.PlaneGeometry(80 * cfg.scale, 80 * cfg.scale);
      const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color(cfg.colors[0]) },
          uColor2: { value: new THREE.Color(cfg.colors[1]) }
        },
        vertexShader: this.nebulaVertexShader,
        fragmentShader: this.nebulaFragmentShader
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      mesh.rotation.z = cfg.rot;
      this.group.add(mesh);
      this.updates.push((t) => { mat.uniforms.uTime.value = t; });
    });
  }

  _initInterstellarGas() {
    const gasGeo = new THREE.PlaneGeometry(160, 160);
    const gasMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#080015') },
        uColor2: { value: new THREE.Color('#1a0045') }
      },
      vertexShader: this.nebulaVertexShader,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
        }
        float fbm(vec2 p) {
          float v = 0.0; float a = 0.5;
          for (int i = 0; i < 6; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
          return v;
        }

        void main() {
          vec2 uv = vUv - 0.5;
          float dist = length(uv);
          vec2 warp = vec2(fbm(uv * 2.0 + uTime * 0.015), fbm(uv * 2.0 + uTime * 0.015 + 5.2));
          float n = fbm(uv * 3.0 + warp * 0.6 + uTime * 0.02);
          float n2 = fbm(uv * 1.5 - uTime * 0.015 + 10.0);
          vec3 color = mix(uColor1, uColor2, n);
          color += vec3(0.12, 0.04, 0.18) * n2;
          float alpha = smoothstep(0.5, 0.0, dist) * n * 0.18;
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
    const gasMesh = new THREE.Mesh(gasGeo, gasMat);
    gasMesh.position.z = -40;
    this.group.add(gasMesh);
    this.updates.push((t) => { gasMat.uniforms.uTime.value = t; });
  }

  _initShootingStars() {
    for (let i = 0; i < 10; i++) {
      const trailLen = 35;
      const positions = new Float32Array(trailLen * 3);
      const alphas = new Float32Array(trailLen);
      for (let j = 0; j < trailLen; j++) alphas[j] = 1.0 - j / trailLen;

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));


      const cometColors = [
  '#ffffff', // blanco
  '#40c0ff', // azul eléctrico
  '#00ffff', // cian
  '#00ff88', // verde neón
  '#ff80ff', // magenta
  '#ff4080', // rosa intenso
  '#ffd080', // dorado
  '#ff8040', // naranja
  '#a040ff'  // violeta
];


      const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: {
            value: new THREE.Color(
              cometColors[
              Math.floor(Math.random() * cometColors.length)
              ]
            )
          }, uOpacity: { value: 0 }
        },
        vertexShader: `
          attribute float aAlpha; varying float vAlpha;
          void main() { vAlpha = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: `
          uniform vec3 uColor; uniform float uOpacity; varying float vAlpha;
          void main() { gl_FragColor = vec4(uColor * 2.5, vAlpha * uOpacity); }
        `
      });

      const line = new THREE.Line(geo, mat);
      line.userData = {
        active: false, timer: Math.random() * 12, interval: 6 + Math.random() * 14,
        head: new THREE.Vector3(), vel: new THREE.Vector3(), trailLen
      };

      this.group.add(line);
      this.shootingStars.push(line);
    }
  }

  _launchShootingStar(star) {
    const d = star.userData;
    d.active = true;
    star.material.uniforms.uOpacity.value = 1.0;
    const theta = Math.random() * Math.PI * 2;
    const r = 60 + Math.random() * 100;
    d.head.set(Math.cos(theta) * r, 20 + Math.random() * 40, (Math.random() - 0.5) * 60 - 20);
    const speed = 1.2 + Math.random() * 2.5;
    d.vel.set(-Math.cos(theta) * speed * 0.8, -speed * 0.6 - Math.random() * 0.5, (Math.random() - 0.5) * speed * 0.3);
    const posArr = star.geometry.attributes.position.array;
    for (let j = 0; j < d.trailLen; j++) {
      posArr[j * 3] = d.head.x; posArr[j * 3 + 1] = d.head.y; posArr[j * 3 + 2] = d.head.z;
    }
    star.geometry.attributes.position.needsUpdate = true;
  }

  _initGodRays() {
    const godRaysCount = 14;
    for (let i = 0; i < godRaysCount; i++) {
      const rayGeo = new THREE.PlaneGeometry(0.4, 100);
      const rayMat = new THREE.MeshBasicMaterial({
        color: '#18103a', transparent: true, opacity: 0.012, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      const ray = new THREE.Mesh(rayGeo, rayMat);
      const angle = (i / godRaysCount) * Math.PI * 2;
      ray.position.set(0, 0, -35);
      ray.rotation.z = angle;
      ray.userData = { baseAngle: angle, baseOp: 0.012 };
      this.group.add(ray);
      this.updates.push((t) => {
        ray.rotation.z = ray.userData.baseAngle + Math.sin(t * 0.08 + ray.userData.baseAngle) * 0.04;
        ray.material.opacity = ray.userData.baseOp * (0.4 + 0.6 * Math.sin(t * 0.25 + i * 0.7));
      });
    }
  }

  _initCosmicDust() {
    const cosmicDust = this._createParticles(4000, { spread: 80, size: 0.15, color: '#aa88cc', opacity: 0.25 });
    cosmicDust.name = 'cosmicDust';
    this.group.add(cosmicDust);
    this.updates.push((t) => { cosmicDust.material.uniforms.uTime.value = t; });
  }

  // ── BUCLE DE ACTUALIZACIÓN PÚBLICO ──

  update(time) {
    const dt = Math.min(time - this.prevTime, 0.1);

    // Actualizar estrellas fugaces
    this.shootingStars.forEach(star => {
      const d = star.userData;
      if (!d.active) {
        d.timer += dt;
        if (d.timer > d.interval) { d.timer = 0; this._launchShootingStar(star); }
        return;
      }
      const posArr = star.geometry.attributes.position.array;
      for (let j = d.trailLen - 1; j > 0; j--) {
        posArr[j * 3] = posArr[(j - 1) * 3];
        posArr[j * 3 + 1] = posArr[(j - 1) * 3 + 1];
        posArr[j * 3 + 2] = posArr[(j - 1) * 3 + 2];
      }
      d.head.add(d.vel.clone().multiplyScalar(dt * 60));
      posArr[0] = d.head.x; posArr[1] = d.head.y; posArr[2] = d.head.z;
      star.geometry.attributes.position.needsUpdate = true;
      star.material.uniforms.uOpacity.value *= 0.993;
      if (star.material.uniforms.uOpacity.value < 0.01) {
        d.active = false; star.material.uniforms.uOpacity.value = 0;
      }
    });

    // Actualizar el resto de elementos
    this.updates.forEach(fn => fn(time, dt));
    this.prevTime = time;
  }

  // ── LIMPIEZA DE MEMORIA ──

  dispose() {
    this.group.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    });
    if (this.group.parent) this.group.parent.remove(this.group);
  }
}