import * as THREE from 'three';

/**
 * AerobaticLoopTrackBuilder
 * Generates the iconic curved half-circle aerobatic ramp & halo structure
 * matching reference Image 2 (media_1792251975259.jpg):
 * - Sweeping semi-circular steel track swooping up from lower-left to upper-right.
 * - Circular crown halo structure at the top end.
 * - Multi-layer steel truss framework, cross-beams, and glowing track edges.
 */
export class AerobaticLoopTrackBuilder {
  public static createEnvironment(): THREE.Group {
    const world = new THREE.Group();
    world.name = 'AerobaticFlightTestingArena';

    // Materials
    const steelTruss = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.35,
    });

    const trackSurface = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.4,
      roughness: 0.6,
    });

    const trackCenterLine = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const edgeNeonBlue = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const edgeNeonRed = new THREE.MeshBasicMaterial({ color: 0xff1744 });

    // -------------------------------------------------------------------------
    // 1. Sweeping Semi-Circular Half-Loop Aerobatic Ramp (Image 2)
    // -------------------------------------------------------------------------
    const rampGroup = new THREE.Group();
    rampGroup.name = 'Monumental_Half_Circle_Loop_Ramp';

    const loopSegments = 48;
    const trackWidth = 10;

    // Curve sweeping from lower left (-35, -8, -10), swooping down to (-5, -12, -8),
    // curving steeply up to (+28, +32, -6) where the circular halo sits!
    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= loopSegments; i++) {
      const t = i / loopSegments;
      // Arc angle from -0.8 rad to +1.8 rad
      const angle = -0.7 + t * 2.35;
      const radiusX = 34.0;
      const radiusY = 28.0;

      const x = -4.0 + radiusX * Math.sin(angle);
      const y = 8.0 - radiusY * Math.cos(angle);
      const z = -12.0 + t * 6.0;

      curvePoints.push(new THREE.Vector3(x, y, z));
    }

    // Build track segments along curve
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const cur = curvePoints[i];
      const next = curvePoints[i + 1];
      const segLen = cur.distanceTo(next);

      // Track Deck Slab
      const deckGeo = new THREE.BoxGeometry(segLen, 0.6, trackWidth);
      const deck = new THREE.Mesh(deckGeo, trackSurface);
      deck.position.lerpVectors(cur, next, 0.5);
      deck.lookAt(next);
      rampGroup.add(deck);

      // Centerline white stripes
      const stripeGeo = new THREE.BoxGeometry(segLen, 0.04, 0.35);
      const stripe = new THREE.Mesh(stripeGeo, trackCenterLine);
      stripe.position.set(0, 0.32, 0);
      deck.add(stripe);

      // Outer Glowing Edge Barriers (Image 2)
      const edgeGeo = new THREE.BoxGeometry(segLen, 0.3, 0.2);
      const edgeL = new THREE.Mesh(edgeGeo, edgeNeonBlue);
      edgeL.position.set(0, 0.35, trackWidth / 2 - 0.15);
      deck.add(edgeL);

      const edgeR = new THREE.Mesh(edgeGeo, edgeNeonRed);
      edgeR.position.set(0, 0.35, -trackWidth / 2 + 0.15);
      deck.add(edgeR);

      // Steel Under-Truss Support Ribs
      const trussGeo = new THREE.BoxGeometry(segLen, 1.2, 0.5);
      const trussL = new THREE.Mesh(trussGeo, steelTruss);
      trussL.position.set(0, -0.8, trackWidth / 2 - 0.5);
      deck.add(trussL);

      const trussR = new THREE.Mesh(trussGeo, steelTruss);
      trussR.position.set(0, -0.8, -trackWidth / 2 + 0.5);
      deck.add(trussR);

      // Cross-Brace Beams
      if (i % 2 === 0) {
        const crossGeo = new THREE.BoxGeometry(0.35, 0.35, trackWidth - 1.2);
        const cross = new THREE.Mesh(crossGeo, steelTruss);
        cross.position.set(0, -0.8, 0);
        deck.add(cross);
      }
    }

    // -------------------------------------------------------------------------
    // 2. Circular Crown Halo Structure at Ramp Top (Image 2 exact feature)
    // -------------------------------------------------------------------------
    const apexPoint = curvePoints[curvePoints.length - 1];
    const haloGeo = new THREE.TorusGeometry(8.5, 0.8, 16, 40);
    const halo = new THREE.Mesh(haloGeo, steelTruss);
    halo.position.set(apexPoint.x + 5.5, apexPoint.y + 4.0, apexPoint.z);
    halo.rotation.y = Math.PI / 2;
    halo.rotation.x = 0.35;
    rampGroup.add(halo);

    // Spokes inside halo
    for (let s = 0; s < 6; s++) {
      const spokeGeo = new THREE.CylinderGeometry(0.22, 0.22, 16.5, 8);
      const spoke = new THREE.Mesh(spokeGeo, steelTruss);
      spoke.position.set(apexPoint.x + 5.5, apexPoint.y + 4.0, apexPoint.z);
      spoke.rotation.x = (s * Math.PI) / 6;
      rampGroup.add(spoke);
    }

    world.add(rampGroup);

    return world;
  }
}
