import * as THREE from 'three';

/**
 * Cryogenic Dense White Nitrogen Plumes
 * Replicates the intense vertical downward exhaust jets seen in prototype flight test photos (Images 2, 3, 5).
 */
export class RealCryoPlumeRenderer {
  public plumeGroup: THREE.Group;
  private plumes: THREE.Mesh[] = [];
  private smokeClouds: THREE.Mesh[] = [];

  constructor() {
    this.plumeGroup = new THREE.Group();
    this.initFlightPlumes();
  }

  private initFlightPlumes(): void {
    // 4 Downward Thruster Positions (under wheel wells, Images 2, 3, 5)
    const positions: [number, number, number][] = [
      [1.25,  0.72, 0.12],
      [1.25, -0.72, 0.12],
      [-1.42, 0.74, 0.12],
      [-1.42, -0.74, 0.12],
    ];

    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });

    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xecfeff,
      transparent: true,
      opacity: 0.45,
    });

    for (const [x, y, z] of positions) {
      // High-speed supersonic jet core (Cylinder tapering downwards)
      const jetGeo = new THREE.CylinderGeometry(0.04, 0.18, 1.6, 16);
      jetGeo.translate(0, -0.8, 0); // extend downwards
      const jet = new THREE.Mesh(jetGeo, plumeMat);
      jet.position.set(x, y, z);
      this.plumes.push(jet);
      this.plumeGroup.add(jet);

      // Billowing ground/air condensation cloud at bottom
      const cloudGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(x, y, z - 1.6);
      this.smokeClouds.push(cloud);
      this.plumeGroup.add(cloud);
    }
  }

  public update(time: number, isFiring: boolean, intensity: number = 1.0): void {
    const active = isFiring && intensity > 0.05;
    this.plumeGroup.visible = active;

    if (!active) return;

    for (let i = 0; i < this.plumes.length; i++) {
      // Dynamic pulsating jet flutter
      const pulse = 1.0 + Math.sin(time * 45.0 + i) * 0.12;
      const lengthScale = (0.7 + intensity * 0.9) * pulse;

      this.plumes[i].scale.set(pulse, lengthScale, pulse);

      // Billow cloud wobble
      this.smokeClouds[i].position.z = -1.6 * lengthScale;
      const cloudScale = (1.0 + Math.sin(time * 30.0 + i) * 0.25) * intensity;
      this.smokeClouds[i].scale.set(cloudScale, cloudScale, cloudScale);
    }
  }
}
