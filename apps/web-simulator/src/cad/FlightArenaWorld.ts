import * as THREE from 'three';

/**
 * FlightArenaWorld
 * Generates the live 3D scenic environment matching reference Image 2:
 * - Mountainous coastal valley and ocean water.
 * - Procedural sky dome with clouds.
 * - 300m asphalt approach straight with distance lines.
 * - Monumental 152.3m curved vertical half-circle aerobatic ramp with steel truss framework and halo crown.
 */
export class FlightArenaWorld {
  public static createWorld(): THREE.Group {
    const world = new THREE.Group();
    world.name = 'FlightArenaWorld_3D';

    // -------------------------------------------------------------------------
    // 1. Materials
    // -------------------------------------------------------------------------
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      side: THREE.BackSide,
    });

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x22382b,
      roughness: 0.88,
      metalness: 0.05,
      flatShading: true,
    });

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0f3460,
      roughness: 0.15,
      metalness: 0.85,
    });

    const trackSurface = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.25,
    });

    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const steelTrussMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
    const edgeNeonBlue = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const edgeNeonRed = new THREE.MeshBasicMaterial({ color: 0xff1744 });

    // -------------------------------------------------------------------------
    // 2. Giant Sky Dome (No static 2D image - pure 3D sky sphere)
    // -------------------------------------------------------------------------
    const skyGeo = new THREE.SphereGeometry(1500, 32, 24);
    const sky = new THREE.Mesh(skyGeo, skyMat);
    world.add(sky);

    // -------------------------------------------------------------------------
    // 3. Coastal Water Plane & Mountain Topography
    // -------------------------------------------------------------------------
    const waterGeo = new THREE.PlaneGeometry(3000, 3000);
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -6, 0);
    world.add(water);

    // Mountainous Terrain ring with rolling elevation
    const terrainGeo = new THREE.PlaneGeometry(2400, 2400, 64, 64);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const distFromCenter = Math.hypot(vx, vz);

      let elevation = 0;
      if (distFromCenter > 140) {
        // Dramatic mountain ridges and coastlines
        elevation = Math.sin(vx * 0.006) * 60 + Math.cos(vz * 0.005) * 55 + Math.sin((vx + vz) * 0.012) * 35;
        if (elevation < -4) elevation = -6; // ocean level
      } else {
        // Flat ground runway plateau
        elevation = 0;
      }
      pos.setY(i, elevation);
    }
    terrainGeo.computeVertexNormals();
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.set(0, -0.5, 0);
    terrain.receiveShadow = true;
    world.add(terrain);

    // -------------------------------------------------------------------------
    // 4. Approach Asphalt Runway (From X = -280 to X = -30, width = 16m)
    // -------------------------------------------------------------------------
    const runwayGeo = new THREE.BoxGeometry(260, 0.4, 16);
    const runway = new THREE.Mesh(runwayGeo, trackSurface);
    runway.position.set(-160, -0.2, 0);
    runway.receiveShadow = true;
    world.add(runway);

    // Centerline dashed white stripes
    for (let x = -280; x <= -35; x += 15) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(7, 0.02, 0.4), whiteLineMat);
      dash.position.set(x, 0.02, 0);
      world.add(dash);
    }

    // Runway glowing edge barriers
    const runEdgeL = new THREE.Mesh(new THREE.BoxGeometry(260, 0.3, 0.25), edgeNeonBlue);
    runEdgeL.position.set(-160, 0.15, 7.8);
    const runEdgeR = new THREE.Mesh(new THREE.BoxGeometry(260, 0.3, 0.25), edgeNeonRed);
    runEdgeR.position.set(-160, 0.15, -7.8);
    world.add(runEdgeL);
    world.add(runEdgeR);

    // -------------------------------------------------------------------------
    // 5. C-Shaped 28.0m Curved Half-Loop Stunt Ramp (R = 14.0m)
    // -------------------------------------------------------------------------
    const rampGroup = new THREE.Group();
    rampGroup.name = 'Tesla_28m_Curved_Loop_Ramp';

    const loopSegments = 48;
    const trackWidth = 14.0;
    const R_loop = 14.0; // Radius to achieve exact 28.0m altitude apex (25-35m facility bounds)

    const curvePoints: { p: THREE.Vector3; tangent: THREE.Vector3 }[] = [];

    for (let i = 0; i <= loopSegments; i++) {
      const t = i / loopSegments;
      // Angle theta from 0 rad (horizontal road tangent) to PI rad (180 degrees upside-down ceiling lip)
      const theta = t * Math.PI;

      // X starts at -30, curves forward to -16m at 90 deg, then back to -30m at 180 deg ceiling
      const x = -30.0 + R_loop * Math.sin(theta);
      const y = R_loop * (1.0 - Math.cos(theta));
      const z = 0.0; // Solid aligned centerline

      const p = new THREE.Vector3(x, y, z);
      const dx = R_loop * Math.cos(theta);
      const dy = R_loop * Math.sin(theta);
      const tangent = new THREE.Vector3(dx, dy, 0).normalize();

      curvePoints.push({ p, tangent });
    }

    // Build solid track deck slabs along the curved ramp
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const cur = curvePoints[i];
      const next = curvePoints[i + 1];
      const segLen = cur.p.distanceTo(next.p);

      // Solid Track Deck (0.6m thick)
      const deckGeo = new THREE.BoxGeometry(segLen, 0.6, trackWidth);
      const deck = new THREE.Mesh(deckGeo, trackSurface);
      deck.position.lerpVectors(cur.p, next.p, 0.5);
      deck.lookAt(next.p);
      deck.castShadow = true;
      deck.receiveShadow = true;
      rampGroup.add(deck);

      // Centerline Stripe
      const stripeGeo = new THREE.BoxGeometry(segLen, 0.04, 0.4);
      const stripe = new THREE.Mesh(stripeGeo, whiteLineMat);
      stripe.position.set(0, 0.32, 0);
      deck.add(stripe);

      // Glowing Neon Track Lip Barriers (Blue & Red)
      const edgeL = new THREE.Mesh(new THREE.BoxGeometry(segLen, 0.35, 0.2), edgeNeonBlue);
      edgeL.position.set(0, 0.40, trackWidth / 2 - 0.15);
      deck.add(edgeL);

      const edgeR = new THREE.Mesh(new THREE.BoxGeometry(segLen, 0.35, 0.2), edgeNeonRed);
      edgeR.position.set(0, 0.40, -trackWidth / 2 + 0.15);
      deck.add(edgeR);

      // Heavy Under-Truss Support Beams
      const trussGeo = new THREE.BoxGeometry(segLen, 1.0, 0.5);
      const trussL = new THREE.Mesh(trussGeo, steelTrussMat);
      trussL.position.set(0, -0.6, trackWidth / 2 - 0.5);
      deck.add(trussL);

      const trussR = new THREE.Mesh(trussGeo, steelTrussMat);
      trussR.position.set(0, -0.6, -trackWidth / 2 + 0.5);
      deck.add(trussR);

      // Grounding Steel Pylons (supporting vertical wall and ceiling)
      if (i % 6 === 0 && cur.p.y > 4.0) {
        const pylonHeight = cur.p.y;
        const pylonGeo = new THREE.CylinderGeometry(0.8, 1.2, pylonHeight, 12);
        const pylon = new THREE.Mesh(pylonGeo, steelTrussMat);
        pylon.position.set(cur.p.x - 1.2, pylonHeight / 2, cur.p.z);
        rampGroup.add(pylon);
      }
    }

    // -------------------------------------------------------------------------
    // 6. Circular Halo Crown Structure at 28.0m Ramp Apex
    // -------------------------------------------------------------------------
    const apexPoint = curvePoints[curvePoints.length - 1].p;
    const haloGeo = new THREE.TorusGeometry(6.0, 0.8, 16, 36);
    const halo = new THREE.Mesh(haloGeo, steelTrussMat);
    halo.position.set(apexPoint.x - 1.5, apexPoint.y + 1.0, apexPoint.z);
    halo.rotation.y = Math.PI / 2;
    rampGroup.add(halo);

    world.add(rampGroup);

    // -------------------------------------------------------------------------
    // 7. Volumetric Cumulus Cloud Clusters Floating near Apex (Image 2)
    // -------------------------------------------------------------------------
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85,
    });

    const cloudCoords = [
      [10, 36, -50],
      [25, 42, -30],
      [-20, 34, 40],
      [30, 38, 45],
      [50, 44, -20],
      [-40, 32, -50],
    ];

    const puffGeo = new THREE.DodecahedronGeometry(6, 1);
    cloudCoords.forEach(([cx, cy, cz]) => {
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(cx, cy, cz);
      puff.scale.set(1.8, 0.75, 1.3);
      world.add(puff);
    });

    return world;
  }

  /**
   * Helper to sample track position and normal at progress t (0 to 1) along the 28.0m loop
   */
  public static getRampPoint(t: number): { x: number; y: number; z: number; pitch: number; roll: number } {
    const R_loop = 14.0;
    const theta = Math.max(0, Math.min(1, t)) * Math.PI;
    const x = -30.0 + R_loop * Math.sin(theta);
    const y = R_loop * (1.0 - Math.cos(theta));
    const z = 0.0;
    const pitch = theta; // Pitch follows ramp slope (0 to PI)
    const roll = 0.0;

    return { x, y, z, pitch, roll };
  }
}
