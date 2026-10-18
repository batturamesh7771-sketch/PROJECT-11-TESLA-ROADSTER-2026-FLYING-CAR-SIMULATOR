import * as THREE from 'three';

/**
 * 21-Meter Parabolic Inverted Wall & Launch Ramp
 * Recreates the exact SpaceX McGregor launch structure shown in Images 4 & 5.
 */
export class McGregorRampBuilder {
  public static buildRamp(): THREE.Group {
    const rampGroup = new THREE.Group();
    rampGroup.name = 'SpaceX_McGregor_170Deg_Ramp';

    const steelTrussMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.35,
    });

    const rampSurfaceMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.2,
      roughness: 0.7,
    });

    const edgeLightMat = new THREE.MeshBasicMaterial({ color: 0xff1e27 });

    // Curve Path: 21m high, curving up and back to 170 degrees inverted
    const curvePoints: THREE.Vector3[] = [];
    const segments = 32;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Parabolic curve reaching 21m height and overhanging
      const angle = t * (170 * Math.PI / 180);
      const radius = 9.5;
      const x = -8.0 + radius * Math.sin(angle);
      const z = radius * (1.0 - Math.cos(angle)) * 1.1;
      curvePoints.push(new THREE.Vector3(x, 0, z));
    }

    // Build curved track surface
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const extrudeShape = new THREE.Shape();
    extrudeShape.moveTo(-1.6, -0.1);
    extrudeShape.lineTo(1.6, -0.1);
    extrudeShape.lineTo(1.6, 0.1);
    extrudeShape.lineTo(-1.6, 0.1);
    extrudeShape.closePath();

    // Ribbed steel track
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const p1 = curvePoints[i];
      const p2 = curvePoints[i + 1];
      const dist = p1.distanceTo(p2);

      const segmentGeo = new THREE.BoxGeometry(dist, 3.6, 0.15);
      const segment = new THREE.Mesh(segmentGeo, rampSurfaceMat);
      segment.position.lerpVectors(p1, p2, 0.5);
      segment.lookAt(p2);
      rampGroup.add(segment);

      // Red edge marker lights (Image 4 & 5)
      const edgeLightGeo = new THREE.BoxGeometry(dist, 0.08, 0.06);
      const edgeL = new THREE.Mesh(edgeLightGeo, edgeLightMat);
      edgeL.position.set(0, 1.82, 0.1);
      segment.add(edgeL);

      const edgeR = new THREE.Mesh(edgeLightGeo, edgeLightMat);
      edgeR.position.set(0, -1.82, 0.1);
      segment.add(edgeR);

      // Vertical steel support truss pillars
      if (i % 3 === 0 && p1.z > 0.5) {
        const pillarGeo = new THREE.CylinderGeometry(0.12, 0.14, p1.z, 8);
        pillarGeo.rotateX(Math.PI / 2);
        const pillar = new THREE.Mesh(pillarGeo, steelTrussMat);
        pillar.position.set(p1.x, p1.y, p1.z / 2);
        rampGroup.add(pillar);
      }
    }

    // Shift ramp so base meets the launch staging pad
    rampGroup.position.set(-6.0, 0, 0);

    return rampGroup;
  }
}
