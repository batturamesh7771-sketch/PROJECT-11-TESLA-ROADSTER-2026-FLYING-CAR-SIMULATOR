import * as THREE from 'three';

/**
 * High-Fidelity 3D Procedural Mesh Model of the 2026 Tesla Roadster "SpaceX Package"
 * Recreated accurately from the October 2026 prototype flight & ramp test photos.
 */
export class RoadsterMeshBuilder {
  public static buildRealRoadster(): THREE.Group {
    const car = new THREE.Group();
    car.name = 'TeslaRoadster_Prototype';

    // Materials based on actual reveal vehicle
    const whitePaint = new THREE.MeshPhysicalMaterial({
      color: 0xf4f6f8,
      metalness: 0.1,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    const blackComposite = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.6,
      metalness: 0.3,
    });

    const darkGlass = new THREE.MeshPhysicalMaterial({
      color: 0x050810,
      transmission: 0.6,
      opacity: 0.9,
      transparent: true,
      roughness: 0.05,
      metalness: 0.9,
      ior: 1.52,
    });

    const redLight = new THREE.MeshBasicMaterial({ color: 0xff0028 });
    const whiteLight = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    const goldInconel = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2,
    });
    const titanium = new THREE.MeshStandardMaterial({
      color: 0x8a929a,
      metalness: 0.85,
      roughness: 0.3,
    });

    // -------------------------------------------------------------
    // 1. Lower Black Skirt / Underbody Ground-Effect Pan
    // -------------------------------------------------------------
    const lowerPanGeo = new THREE.BoxGeometry(4.2, 1.85, 0.14);
    const lowerPan = new THREE.Mesh(lowerPanGeo, blackComposite);
    lowerPan.position.set(-0.1, 0, 0.16);
    lowerPan.castShadow = true;
    car.add(lowerPan);

    // -------------------------------------------------------------
    // 2. Main White Aerodynamic Body Hull (Low Wedge Silhouette)
    // -------------------------------------------------------------
    // Front Nose / Frunk (Sharp wedge sloping down)
    const noseShape = new THREE.Shape();
    noseShape.moveTo(0, -0.9);
    noseShape.lineTo(1.8, -0.75);
    noseShape.lineTo(1.9, 0);
    noseShape.lineTo(1.8, 0.75);
    noseShape.lineTo(0, 0.9);
    noseShape.closePath();

    const noseExtrude = new THREE.ExtrudeGeometry(noseShape, {
      depth: 0.25,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    });
    noseExtrude.rotateX(Math.PI / 2);
    noseExtrude.rotateY(-Math.PI / 2);

    const noseMesh = new THREE.Mesh(noseExtrude, whitePaint);
    noseMesh.position.set(0.1, 0, 0.22);
    noseMesh.scale.set(1.0, 0.95, 0.85);
    noseMesh.castShadow = true;
    car.add(noseMesh);

    // Mid Body / Cockpit Tub Sides
    const midBodyGeo = new THREE.BoxGeometry(2.1, 1.88, 0.34);
    const midBody = new THREE.Mesh(midBodyGeo, whitePaint);
    midBody.position.set(-0.1, 0, 0.35);
    midBody.castShadow = true;
    car.add(midBody);

    // Rear Haunches & Engine/COPV Deck
    const rearDeckGeo = new THREE.BoxGeometry(1.5, 1.90, 0.38);
    const rearDeck = new THREE.Mesh(rearDeckGeo, whitePaint);
    rearDeck.position.set(-1.25, 0, 0.40);
    rearDeck.castShadow = true;
    car.add(rearDeck);

    // -------------------------------------------------------------
    // 3. Greenhouse / Fastback Glass Canopy (Image 2)
    // -------------------------------------------------------------
    const canopyGeo = new THREE.CylinderGeometry(0.5, 0.75, 1.6, 16);
    canopyGeo.rotateZ(Math.PI / 2);
    const canopy = new THREE.Mesh(canopyGeo, darkGlass);
    canopy.position.set(-0.05, 0, 0.62);
    canopy.scale.set(1.1, 0.58, 0.82);
    canopy.castShadow = true;
    car.add(canopy);

    // Windshield frame & black roof pillars
    const aPillarGeo = new THREE.BoxGeometry(0.06, 0.72, 0.45);
    const aPillarL = new THREE.Mesh(aPillarGeo, blackComposite);
    aPillarL.position.set(0.48, 0.45, 0.52);
    aPillarL.rotation.y = 0.55;
    const aPillarR = aPillarL.clone();
    aPillarR.position.set(0.48, -0.45, 0.52);
    car.add(aPillarL);
    car.add(aPillarR);

    // -------------------------------------------------------------
    // 4. Front Active Aero Splitter & LED Lightbar
    // -------------------------------------------------------------
    const frontSplitterGeo = new THREE.BoxGeometry(0.35, 1.88, 0.05);
    const frontSplitter = new THREE.Mesh(frontSplitterGeo, blackComposite);
    frontSplitter.position.set(1.98, 0, 0.12);
    car.add(frontSplitter);

    const frontLightbarGeo = new THREE.BoxGeometry(0.04, 1.65, 0.03);
    const frontLightbar = new THREE.Mesh(frontLightbarGeo, whiteLight);
    frontLightbar.position.set(2.0, 0, 0.32);
    car.add(frontLightbar);

    // -------------------------------------------------------------
    // 5. Rear Fascia: Lightbar, Nozzles, Fans & "ROSTR" Plate (Image 3)
    // -------------------------------------------------------------
    // Full-Width Red Lightbar
    const rearLightbarGeo = new THREE.BoxGeometry(0.05, 1.82, 0.04);
    const rearLightbar = new THREE.Mesh(rearLightbarGeo, redLight);
    rearLightbar.position.set(-1.98, 0, 0.54);
    car.add(rearLightbar);

    // ROSTR Plate
    const plateGeo = new THREE.BoxGeometry(0.02, 0.32, 0.14);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(-1.99, 0, 0.44);
    car.add(plate);

    // Rear Active Wing on Twin Pylons (Raised, as in Image 3)
    const wingPylonL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.35), blackComposite);
    wingPylonL.position.set(-1.75, 0.45, 0.68);
    const wingPylonR = wingPylonL.clone();
    wingPylonR.position.set(-1.75, -0.45, 0.68);
    car.add(wingPylonL);
    car.add(wingPylonR);

    const wingBladeGeo = new THREE.BoxGeometry(0.32, 1.95, 0.035);
    const wingBlade = new THREE.Mesh(wingBladeGeo, blackComposite);
    wingBlade.position.set(-1.82, 0, 0.85);
    wingBlade.rotation.y = -0.15; // Aggressive downforce angle
    wingBlade.castShadow = true;
    car.add(wingBlade);

    // 4 Rear Main Diffuser Supersonic Cold-Gas Thrusters (In a row, Image 3)
    const nozzleGeo = new THREE.CylinderGeometry(0.035, 0.022, 0.16, 16);
    nozzleGeo.rotateZ(Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      const nozzle = new THREE.Mesh(nozzleGeo, goldInconel);
      nozzle.position.set(-1.96, -0.36 + i * 0.24, 0.38);
      car.add(nozzle);
    }

    // 4 Large Extraction Turbine Fans directly below nozzles (Image 3)
    const fanCasingGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.08, 16);
    fanCasingGeo.rotateZ(Math.PI / 2);
    for (let f = 0; f < 4; f++) {
      const fan = new THREE.Mesh(fanCasingGeo, titanium);
      fan.position.set(-1.92, -0.36 + f * 0.24, 0.24);
      car.add(fan);
    }

    // -------------------------------------------------------------
    // 6. Closed Aerodisc Wheels (Identical to Image 2)
    // -------------------------------------------------------------
    const tireGeo = new THREE.CylinderGeometry(0.355, 0.355, 0.24, 32);
    tireGeo.rotateX(Math.PI / 2);

    const aerodiscGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.25, 32);
    aerodiscGeo.rotateX(Math.PI / 2);

    const wheelHubGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.26, 16);
    wheelHubGeo.rotateX(Math.PI / 2);

    const wheelPositions: [number, number, number][] = [
      [1.35, 0.82, 0.355],   // Front Left
      [1.35, -0.82, 0.355],  // Front Right
      [-1.35, 0.84, 0.355],  // Rear Left
      [-1.35, -0.84, 0.355], // Rear Right
    ];

    for (let w = 0; w < 4; w++) {
      const wPos = wheelPositions[w];
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(wPos[0], wPos[1], wPos[2]);

      const tire = new THREE.Mesh(tireGeo, blackComposite);
      tire.castShadow = true;
      wheelGroup.add(tire);

      const aerodisc = new THREE.Mesh(aerodiscGeo, blackComposite);
      wheelGroup.add(aerodisc);

      const hub = new THREE.Mesh(wheelHubGeo, titanium);
      wheelGroup.add(hub);

      car.add(wheelGroup);
    }

    // -------------------------------------------------------------
    // 7. Cold-Gas Thruster Nozzles for Flight (Images 2, 3, 5)
    // -------------------------------------------------------------
    // Downward nozzles positioned just inboard of wheels
    const liftNozzleGeo = new THREE.CylinderGeometry(0.03, 0.018, 0.12, 16);
    const liftOffsets: [number, number][] = [
      [1.25, 0.72],
      [1.25, -0.72],
      [-1.42, 0.74],
      [-1.42, -0.74],
    ];

    for (const [x, y] of liftOffsets) {
      const nozzle = new THREE.Mesh(liftNozzleGeo, goldInconel);
      nozzle.position.set(x, y, 0.12);
      car.add(nozzle);
    }

    // -------------------------------------------------------------
    // 8. Internal 600L COPV High-Pressure Carbon Cylinders (Visible upon Explode)
    // -------------------------------------------------------------
    const tankCarbonMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.3,
      metalness: 0.8,
    });

    // 200L Trunk COPV Tank
    const trunkCopvGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.85, 24);
    trunkCopvGeo.rotateZ(Math.PI / 2);
    const trunkCopv = new THREE.Mesh(trunkCopvGeo, tankCarbonMat);
    trunkCopv.position.set(-1.15, 0, 0.38);
    car.add(trunkCopv);

    // 400L Passenger Cell COPV Tank (Replacing passenger seat)
    const cabinCopvGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.95, 24);
    cabinCopvGeo.rotateX(Math.PI / 2);
    const cabinCopv = new THREE.Mesh(cabinCopvGeo, tankCarbonMat);
    cabinCopv.position.set(0.12, -0.32, 0.38);
    car.add(cabinCopv);

    return car;
  }
}
