import * as THREE from 'three';

/**
 * 1:1 Scale Proving Ground & Automotive Test Facility
 * Inspired by actual test proving grounds (Image reference: media_1792242213677.jpg).
 * Features:
 * - 400m asphalt acceleration & braking straight with distance markings.
 * - Marked road edges, white dashed center line.
 * - Slalom section with physical orange traffic cones.
 * - Test Facility pit building, red-and-white safety barriers.
 */
export class ProvingGroundFacility {
  public static createFacility(): THREE.Group {
    const facility = new THREE.Group();
    facility.name = 'AutomotiveProvingGround';

    // Materials
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x272b33,
      roughness: 0.88,
      metalness: 0.15,
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x788291,
      roughness: 0.75,
      metalness: 0.1,
    });

    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.4,
    });

    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 });
    const redBarrierMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const whiteBarrierMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const coneOrange = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
    const coneWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // -------------------------------------------------------------------------
    // 1. Main Asphalt Test Runway (200m long, 16m wide)
    // -------------------------------------------------------------------------
    const roadGeo = new THREE.PlaneGeometry(300, 18);
    const road = new THREE.Mesh(roadGeo, asphaltMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, 0);
    road.receiveShadow = true;
    facility.add(road);

    // Road Edge Solid White Lines (Left & Right)
    const edgeLineGeo = new THREE.PlaneGeometry(300, 0.2);
    const edgeL = new THREE.Mesh(edgeLineGeo, whiteLineMat);
    edgeL.rotation.x = -Math.PI / 2;
    edgeL.position.set(0, 0.002, 7.5);
    const edgeR = edgeL.clone();
    edgeR.position.set(0, 0.002, -7.5);
    facility.add(edgeL);
    facility.add(edgeR);

    // Center Dashed White Line
    for (let x = -140; x <= 140; x += 10) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 0.18), whiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(x, 0.002, 0);
      facility.add(dash);
    }

    // Braking Distance Grid Lines (at X = 20m, 40m, 60m, 80m, 100m)
    for (const dist of [20, 40, 60, 80, 100]) {
      const stopLine = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 15.0), whiteLineMat);
      stopLine.rotation.x = -Math.PI / 2;
      stopLine.position.set(dist, 0.002, 0);
      facility.add(stopLine);
    }

    // -------------------------------------------------------------------------
    // 2. Concrete Paddock Apron & Surrounding Ground
    // -------------------------------------------------------------------------
    const apronGeo = new THREE.PlaneGeometry(350, 100);
    const ground = new THREE.Mesh(apronGeo, concreteMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.01, 35);
    ground.receiveShadow = true;
    facility.add(ground);

    // -------------------------------------------------------------------------
    // 3. Pit Building / Operations Facility (Background)
    // -------------------------------------------------------------------------
    const building = new THREE.Mesh(new THREE.BoxGeometry(45, 7.5, 14), buildingMat);
    building.position.set(-15, 3.75, 28);
    building.castShadow = true;
    building.receiveShadow = true;
    facility.add(building);

    // Facility Signboard banner
    const signGeo = new THREE.PlaneGeometry(16, 2.2);
    const signMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(-15, 6.2, 20.95);
    facility.add(sign);

    // -------------------------------------------------------------------------
    // 4. Red-and-White Safety Barriers Along Road Edge
    // -------------------------------------------------------------------------
    for (let x = -80; x <= 80; x += 3.5) {
      const isRed = Math.floor(Math.abs(x) / 3.5) % 2 === 0;
      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.85, 0.5),
        isRed ? redBarrierMat : whiteBarrierMat
      );
      barrier.position.set(x, 0.425, 9.2);
      barrier.castShadow = true;
      facility.add(barrier);
    }

    // -------------------------------------------------------------------------
    // 5. Slalom Cones (Orange & White Reflective Stripes)
    // -------------------------------------------------------------------------
    const coneBodyGeo = new THREE.ConeGeometry(0.18, 0.65, 16);
    const coneStripeGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.15, 16);

    for (let x = -60; x <= 60; x += 15) {
      const coneGroup = new THREE.Group();
      coneGroup.position.set(x, 0.325, 0);

      const cone = new THREE.Mesh(coneBodyGeo, coneOrange);
      cone.castShadow = true;
      coneGroup.add(cone);

      const stripe = new THREE.Mesh(coneStripeGeo, coneWhite);
      stripe.position.y = 0.05;
      coneGroup.add(stripe);

      facility.add(coneGroup);
    }

    return facility;
  }
}
