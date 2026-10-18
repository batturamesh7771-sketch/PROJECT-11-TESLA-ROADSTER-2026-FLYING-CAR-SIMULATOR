import * as THREE from 'three';
import { generateFullBOM, CADPartMetadata, SUBSYSTEM_DEFINITIONS } from '@tesla-roadster/shared-core';
import { PBRMaterialsLibrary } from './PBRMaterialsLibrary';
import { RoadsterMeshBuilder } from './RoadsterMeshBuilder';
import { RealCryoPlumeRenderer } from './RealCryoPlumeRenderer';

export class RoadsterCADAssembly {
  public rootGroup: THREE.Group;
  public carBodyGroup: THREE.Group;
  public internalPartsGroup: THREE.Group;
  public subsystemGroups: Map<string, THREE.Group> = new Map();
  public partMeshes: Map<string, THREE.Mesh> = new Map();
  public bomData: CADPartMetadata[] = [];
  public plumeRenderer: RealCryoPlumeRenderer;

  private activeExplosionFactor: number = 0.0;
  private selectedPartId: string | null = null;
  private highlightMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'TeslaRoadster2026_Root';

    // 1. Authentic Exterior Body Mesh (Image 2 & Image 3)
    this.carBodyGroup = RoadsterMeshBuilder.buildRealRoadster();
    this.rootGroup.add(this.carBodyGroup);

    // 2. Cryogenic Thrust Plumes (Images 2, 3, 5)
    this.plumeRenderer = new RealCryoPlumeRenderer();
    this.rootGroup.add(this.plumeRenderer.plumeGroup);

    // 3. Internal 1,048-Part Subsystems for CAD Explosion
    this.internalPartsGroup = new THREE.Group();
    this.internalPartsGroup.name = 'InternalSubsystemParts';
    this.rootGroup.add(this.internalPartsGroup);

    this.highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x0088ff,
      emissiveIntensity: 0.9,
      wireframe: true,
    });

    this.buildInternalParts();
  }

  private buildInternalParts(): void {
    this.bomData = generateFullBOM();

    for (const sys of SUBSYSTEM_DEFINITIONS) {
      const group = new THREE.Group();
      group.name = `${sys.code}_${sys.name}`;
      this.subsystemGroups.set(sys.code, group);
      this.internalPartsGroup.add(group);
    }

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    for (const part of this.bomData) {
      const mat = PBRMaterialsLibrary.getMaterial(part.material);
      const mesh = new THREE.Mesh(boxGeo, mat);

      const offset = part.baseOffset;
      const normal = part.assemblyNormal;
      mesh.scale.set(part.dimensions[0], part.dimensions[1], part.dimensions[2]);
      mesh.position.set(offset[0], offset[1], offset[2]);

      // Hide internal parts initially, reveal as explosionFactor > 0
      mesh.visible = false;

      mesh.name = part.id;
      mesh.userData = {
        id: part.id,
        index: part.index,
        subsystemCode: part.subsystemCode,
        name: part.name,
        material: part.material,
        massKg: part.massKg,
        baseOffset: [...offset],
        assemblyNormal: [...normal],
        defaultMaterial: mat,
      };

      const group = this.subsystemGroups.get(part.subsystemCode);
      if (group) group.add(mesh);
      this.partMeshes.set(part.id, mesh);
    }
  }

  public setExplosionFactor(factor: number): void {
    this.activeExplosionFactor = Math.max(0.0, Math.min(1.0, factor));

    // Gradually make outer body transparent / explode when slider moves
    const isExploded = this.activeExplosionFactor > 0.02;

    this.carBodyGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material && 'opacity' in child.material) {
          (child.material as THREE.Material).transparent = true;
          (child.material as THREE.Material).opacity = Math.max(0.2, 1.0 - this.activeExplosionFactor * 0.75);
        }
      }
    });

    // Reveal and separate internal 1,048 components
    for (const part of this.bomData) {
      const mesh = this.partMeshes.get(part.id);
      if (!mesh) continue;

      mesh.visible = isExploded;
      const base = mesh.userData.baseOffset as [number, number, number];
      const normal = mesh.userData.assemblyNormal as [number, number, number];
      const dist = this.activeExplosionFactor * 1.8;

      mesh.position.set(
        base[0] + normal[0] * dist,
        base[1] + normal[1] * dist,
        base[2] + normal[2] * dist
      );
    }
  }

  public getExplosionFactor(): number {
    return this.activeExplosionFactor;
  }

  public setSubsystemVisibility(code: string, visible: boolean): void {
    const group = this.subsystemGroups.get(code);
    if (group) group.visible = visible;
  }

  public selectPart(partId: string | null): CADPartMetadata | null {
    if (this.selectedPartId && this.partMeshes.has(this.selectedPartId)) {
      const prevMesh = this.partMeshes.get(this.selectedPartId)!;
      prevMesh.material = prevMesh.userData.defaultMaterial;
    }

    this.selectedPartId = partId;
    if (!partId || !this.partMeshes.has(partId)) return null;

    const mesh = this.partMeshes.get(partId)!;
    mesh.material = this.highlightMaterial;
    mesh.visible = true;
    return this.bomData.find((p) => p.id === partId) || null;
  }

  public updatePlumes(time: number, isFiring: boolean, intensity: number = 1.0): void {
    this.plumeRenderer.update(time, isFiring, intensity);
  }
}
