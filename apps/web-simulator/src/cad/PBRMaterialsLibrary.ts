import * as THREE from 'three';

export class PBRMaterialsLibrary {
  private static materials: Map<string, THREE.Material> = new Map();

  public static getMaterial(name: string): THREE.Material {
    if (this.materials.has(name)) {
      return this.materials.get(name)!;
    }

    let mat: THREE.Material;

    switch (name) {
      case 'Ano White':
        mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0xf8fafc),
          metalness: 0.15,
          roughness: 0.12,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
          reflectivity: 0.9,
          sheen: 0.5,
          sheenColor: new THREE.Color(0xdbeafe), // Subtle cryogenic pearl sheen
        });
        break;

      case 'Gold Glazed Glass':
        mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0xd97706),
          metalness: 0.35,
          roughness: 0.05,
          transmission: 0.72,
          ior: 1.52,
          transparent: true,
          opacity: 0.85,
          reflectivity: 0.95,
        });
        break;

      case 'Toray T1100G CFRP':
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x1a1a1e),
          metalness: 0.8,
          roughness: 0.35,
        });
        break;

      case 'Ti-6Al-4V':
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x94a3b8),
          metalness: 0.9,
          roughness: 0.28,
        });
        break;

      case 'DMLS Inconel 718':
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xd4af37), // Golden hue of heat-treated Inconel
          metalness: 0.95,
          roughness: 0.2,
        });
        break;

      case 'Mg-AZ91D':
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x64748b),
          metalness: 0.85,
          roughness: 0.4,
        });
        break;

      case 'Al-Li 2195 Liner':
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xcfd8dc),
          metalness: 0.92,
          roughness: 0.15,
        });
        break;

      case 'C/SiC Ceramic':
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x27272a),
          metalness: 0.4,
          roughness: 0.7,
        });
        break;

      case 'Viton Rubber':
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x0f172a),
          metalness: 0.05,
          roughness: 0.95,
        });
        break;

      case 'Tesla Red Accent':
        mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0xe82127),
          metalness: 0.5,
          roughness: 0.2,
          clearcoat: 0.8,
        });
        break;

      default:
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x71717a),
          metalness: 0.7,
          roughness: 0.35,
        });
        break;
    }

    this.materials.set(name, mat);
    return mat;
  }
}
