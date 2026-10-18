import * as THREE from 'three';

export class ThrusterPlumeRenderer {
  public plumeGroup: THREE.Group;
  private plumeMeshes: THREE.Mesh[] = [];
  private diamondMaterials: THREE.ShaderMaterial[] = [];

  constructor() {
    this.plumeGroup = new THREE.Group();
    this.initPlumes();
  }

  private initPlumes(): void {
    // 4 Rear diffuser main thrusters
    const rearPositions: [number, number, number][] = [
      [-1.95, -0.45, 0.38],
      [-1.95, -0.15, 0.38],
      [-1.95,  0.15, 0.38],
      [-1.95,  0.45, 0.38],
    ];

    for (let i = 0; i < rearPositions.length; i++) {
      const pos = rearPositions[i];
      const coneGeo = new THREE.ConeGeometry(0.08, 0.8, 16, 8, true);
      coneGeo.rotateZ(Math.PI / 2); // Point backward (-X)

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uThrust: { value: 0 },
          uMach: { value: 2.18 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uThrust;
          uniform float uMach;
          varying vec2 vUv;
          varying vec3 vNormal;

          void main() {
            if (uThrust < 0.05) discard;

            // Supersonic Mach diamond standing shock wave pattern
            float periodicDiamond = sin(vUv.x * 28.0 - uTime * 30.0) * 0.5 + 0.5;
            float diamondIntensity = pow(periodicDiamond, 3.0) * uMach * 0.4;

            // Core expansion plume
            vec3 coreColor = vec3(0.9, 0.95, 1.0); // Bright white-blue nitrogen condensation
            vec3 outerColor = vec3(0.2, 0.6, 1.0); // Cryogenic sky blue
            vec3 color = mix(outerColor, coreColor, diamondIntensity + (1.0 - vUv.x) * 0.5);

            float alpha = (1.0 - vUv.x) * uThrust * 0.85;
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(coneGeo, mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      this.plumeMeshes.push(mesh);
      this.diamondMaterials.push(mat);
      this.plumeGroup.add(mesh);
    }
  }

  public update(time: number, totalThrustN: number, exitMach: number = 2.18): void {
    const normThrust = Math.min(1.0, Math.max(0.0, totalThrustN / 80000.0));
    for (let i = 0; i < this.diamondMaterials.length; i++) {
      this.diamondMaterials[i].uniforms.uTime.value = time;
      this.diamondMaterials[i].uniforms.uThrust.value = normThrust;
      this.diamondMaterials[i].uniforms.uMach.value = exitMach;

      // Scale cone geometry with thrust
      const scaleX = 0.5 + normThrust * 1.5;
      const scaleRadial = 0.8 + normThrust * 0.6;
      this.plumeMeshes[i].scale.set(scaleX, scaleRadial, scaleRadial);
    }
  }
}
