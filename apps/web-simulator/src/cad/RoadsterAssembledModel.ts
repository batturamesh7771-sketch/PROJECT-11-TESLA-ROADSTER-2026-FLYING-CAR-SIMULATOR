import * as THREE from 'three';

/**
 * Photorealistic Assembled Tesla Roadster Sports Car (Next-Gen 2026 Prototype)
 * Accurately proportioned to public reveal specifications:
 * - Length (X): 4.45m
 * - Width (Z): 1.95m
 * - Height (Y): 1.18m
 * - Wheelbase: 2.75m (Axles at X = +1.375m and X = -1.375m)
 * - Track: 1.68m (Wheels at Z = ±0.84m)
 * - Wheel Radius: 0.355m (Sitting squarely at Y = 0 on the asphalt road)
 */
export class RoadsterAssembledModel {
  public static createModel(): THREE.Group {
    const car = new THREE.Group();
    car.name = 'TeslaRoadster_Assembled';

    // -------------------------------------------------------------------------
    // Materials
    // -------------------------------------------------------------------------
    const bodyPaint = new THREE.MeshPhysicalMaterial({
      color: 0xc8102e, // Ultra-Deep Metallic Crimson Red (matching real SpaceX Roadster Reveal prototype)
      metalness: 0.88,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.98,
    });

    const carbonFiber = new THREE.MeshStandardMaterial({
      color: 0x14161a,
      roughness: 0.4,
      metalness: 0.7,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x05070a,
      transmission: 0.85,
      opacity: 0.95,
      transparent: true,
      roughness: 0.05,
      metalness: 0.9,
      ior: 1.54,
    });

    const tireRubber = new THREE.MeshStandardMaterial({
      color: 0x1a1c20,
      roughness: 0.85,
      metalness: 0.1,
    });

    const alloyRim = new THREE.MeshStandardMaterial({
      color: 0x2b303c, // Satin Dark Gunmetal
      metalness: 0.92,
      roughness: 0.22,
    });

    const brakeBrembo = new THREE.MeshStandardMaterial({
      color: 0xd90429, // Performance Red Caliper
      metalness: 0.6,
      roughness: 0.3,
    });

    const brakeDisc = new THREE.MeshStandardMaterial({
      color: 0x8d99ae, // Carbon Ceramic Rotor
      metalness: 0.88,
      roughness: 0.32,
    });

    const ledHeadlight = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ledTaillight = new THREE.MeshBasicMaterial({ color: 0xff002b });
    const nozzleGold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.2 });

    // -------------------------------------------------------------------------
    // 1. Lower Aerodynamic Undertray & Diffuser (X: length, Y: height, Z: width)
    // -------------------------------------------------------------------------
    const undertray = new THREE.Mesh(new THREE.BoxGeometry(4.35, 0.06, 1.86), carbonFiber);
    undertray.position.set(0, 0.12, 0);
    undertray.castShadow = true;
    car.add(undertray);

    // Front Splitter (carbon fiber front blade extending forward)
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 1.88), carbonFiber);
    splitter.position.set(2.18, 0.10, 0);
    splitter.castShadow = true;
    car.add(splitter);

    // Rear Venturi Diffuser
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.12, 1.80), carbonFiber);
    diffuser.position.set(-1.95, 0.16, 0);
    diffuser.castShadow = true;
    car.add(diffuser);

    // Side Rocker Skirts (Left & Right)
    const skirtL = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.10, 0.10), carbonFiber);
    skirtL.position.set(0, 0.14, 0.88);
    const skirtR = skirtL.clone();
    skirtR.position.set(0, 0.14, -0.88);
    car.add(skirtL);
    car.add(skirtR);

    // -------------------------------------------------------------------------
    // 2. Sculpted Lower Body & Cockpit Tub
    // -------------------------------------------------------------------------
    // Central passenger cabin lower structure
    const cabinTub = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.36, 1.76), bodyPaint);
    cabinTub.position.set(-0.05, 0.33, 0);
    cabinTub.castShadow = true;
    car.add(cabinTub);

    // Low aerodynamic sloping front hood
    // Box dimensions: Length (X) = 1.6m, Height (Y) = 0.22m, Width (Z) = 1.68m
    const frontHood = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 1.68), bodyPaint);
    frontHood.position.set(1.25, 0.30, 0);
    frontHood.rotation.z = -0.06; // Slopes down toward nose
    frontHood.castShadow = true;
    car.add(frontHood);

    // Aerodynamic curved nose tip
    const noseCone = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 1.58), bodyPaint);
    noseCone.position.set(2.05, 0.22, 0);
    noseCone.castShadow = true;
    car.add(noseCone);

    // Rear Fastback Deck & Trunk Lid
    const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.26, 1.68), bodyPaint);
    rearDeck.position.set(-1.35, 0.40, 0);
    rearDeck.rotation.z = 0.05; // Slopes down toward rear
    rearDeck.castShadow = true;
    car.add(rearDeck);

    // -------------------------------------------------------------------------
    // 3. Muscular Wheel Arches & Fenders (Front & Rear)
    // -------------------------------------------------------------------------
    // Front Left & Right Arches over 20" wheels (Wheel center at X = +1.375, Z = ±0.84)
    const frontArchL = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.28, 0.22), bodyPaint);
    frontArchL.position.set(1.375, 0.46, 0.84);
    frontArchL.castShadow = true;
    const frontArchR = frontArchL.clone();
    frontArchR.position.set(1.375, 0.46, -0.84);
    car.add(frontArchL);
    car.add(frontArchR);

    // Rear Left & Right Muscular Haunches over 21" wheels (Wheel center at X = -1.375, Z = ±0.85)
    const rearArchL = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.32, 0.24), bodyPaint);
    rearArchL.position.set(-1.375, 0.48, 0.85);
    rearArchL.castShadow = true;
    const rearArchR = rearArchL.clone();
    rearArchR.position.set(-1.375, 0.48, -0.85);
    car.add(rearArchL);
    car.add(rearArchR);

    // -------------------------------------------------------------------------
    // 4. Glass Canopy & Cockpit Greenhouse
    // -------------------------------------------------------------------------
    // Curved Windshield & Glass Targa Canopy
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.38, 1.28), glassMat);
    canopy.position.set(-0.15, 0.68, 0);
    canopy.castShadow = true;
    car.add(canopy);

    // Windshield fast slope
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.32, 1.26), glassMat);
    windshield.position.set(0.68, 0.56, 0);
    windshield.rotation.z = -0.42; // Fast aerodynamic rake angle
    windshield.castShadow = true;
    car.add(windshield);

    // Rear glass hatch
    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 1.24), glassMat);
    rearGlass.position.set(-0.95, 0.58, 0);
    rearGlass.rotation.z = 0.35;
    rearGlass.castShadow = true;
    car.add(rearGlass);

    // Slender Carbon A-Pillars
    const aPillarL = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.06), carbonFiber);
    aPillarL.position.set(0.65, 0.58, 0.58);
    aPillarL.rotation.z = -0.42;
    const aPillarR = aPillarL.clone();
    aPillarR.position.set(0.65, 0.58, -0.58);
    car.add(aPillarL);
    car.add(aPillarR);

    // Side Mirrors / Cameras
    const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.14), carbonFiber);
    mirrorL.position.set(0.62, 0.52, 0.76);
    const mirrorR = mirrorL.clone();
    mirrorR.position.set(0.62, 0.52, -0.76);
    car.add(mirrorL);
    car.add(mirrorR);

    // -------------------------------------------------------------------------
    // 5. Lighting: Front LEDs & Rear Continuous Lightbar
    // -------------------------------------------------------------------------
    // Sleek horizontal LED Headlights
    const headlightL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.35), ledHeadlight);
    headlightL.position.set(2.10, 0.28, 0.56);
    headlightL.rotation.y = -0.22;
    const headlightR = headlightL.clone();
    headlightR.position.set(2.10, 0.28, -0.56);
    headlightR.rotation.y = 0.22;
    car.add(headlightL);
    car.add(headlightR);

    // Full-Width Rear Red Taillight Bar
    const rearLightbar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.68), ledTaillight);
    rearLightbar.position.set(-2.15, 0.50, 0);
    car.add(rearLightbar);

    // -------------------------------------------------------------------------
    // 6. Active Rear Wing & Aerodynamic Hardware
    // -------------------------------------------------------------------------
    const pylonL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.04), carbonFiber);
    pylonL.position.set(-1.88, 0.62, 0.42);
    const pylonR = pylonL.clone();
    pylonR.position.set(-1.88, 0.62, -0.42);
    car.add(pylonL);
    car.add(pylonR);

    // Active Spoiler Blade (raises and tilts up dynamically during flight & hard braking)
    const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 1.78), carbonFiber);
    wingBlade.position.set(-1.92, 0.74, 0);
    wingBlade.rotation.z = -0.10; // Nominal downforce angle
    wingBlade.name = 'ActiveSpoilerBlade';
    wingBlade.castShadow = true;
    car.add(wingBlade);

    // -------------------------------------------------------------------------
    // 10 Perimeter Cold-Gas Thruster Nozzle Assemblies (SpaceX Rocket Package)
    // 2 Front Bumper + 4 Rocker Underbody + 4 Rear Diffuser
    // -------------------------------------------------------------------------
    const nozzleBezelGeo = new THREE.CylinderGeometry(0.038, 0.026, 0.12, 16);
    nozzleBezelGeo.rotateZ(Math.PI / 2);

    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Ice-blue pressurized cryogenic expansion plume
      transparent: true,
      opacity: 0.88,
    });
    const plumeCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, // Pure white supersonic shock diamond core
      transparent: true,
      opacity: 0.96,
    });

    // Conical downward & rearward plume geometry
    const coneDownPlumeGeo = new THREE.ConeGeometry(0.16, 1.25, 16);
    coneDownPlumeGeo.rotateZ(Math.PI); // Points downward (-Y)

    const coneDownCoreGeo = new THREE.ConeGeometry(0.065, 0.85, 12);
    coneDownCoreGeo.rotateZ(Math.PI);

    const coneRearPlumeGeo = new THREE.ConeGeometry(0.14, 1.15, 16);
    coneRearPlumeGeo.rotateZ(Math.PI / 2); // Points backward (-X)

    const coneRearCoreGeo = new THREE.ConeGeometry(0.06, 0.75, 12);
    coneRearCoreGeo.rotateZ(Math.PI / 2);

    // Coordinate specifications for all 10 perimeter nozzles:
    // [index, name, x, y, z, rotX, rotY, rotZ, isDownward]
    const nozzleSpecs: [number, number, number, number, boolean][] = [
      // 0 & 1: Front bumper downward corner nozzles
      [0, 1.95, 0.15, 0.72, true],
      [1, 1.95, 0.15, -0.72, true],
      // 2 & 3: Mid-front underbody rocker downward nozzles
      [2, 0.65, 0.12, 0.88, true],
      [3, 0.65, 0.12, -0.88, true],
      // 4 & 5: Mid-rear underbody rocker downward nozzles
      [4, -0.65, 0.12, 0.88, true],
      [5, -0.65, 0.12, -0.88, true],
      // 6, 7, 8, 9: Rear diffuser cold-gas nozzles
      [6, -2.14, 0.28, -0.36, false],
      [7, -2.14, 0.28, -0.12, false],
      [8, -2.14, 0.28, 0.12, false],
      [9, -2.14, 0.28, 0.36, false],
    ];

    nozzleSpecs.forEach(([i, nx, ny, nz, isDown]) => {
      const bezel = new THREE.Mesh(nozzleBezelGeo, nozzleGold);
      bezel.position.set(nx, ny, nz);
      if (isDown) {
        bezel.rotation.z = -Math.PI / 2;
      }
      car.add(bezel);

      // Outer expansion plume
      const plume = new THREE.Mesh(isDown ? coneDownPlumeGeo : coneRearPlumeGeo, plumeMat);
      plume.position.set(
        nx + (isDown ? 0.0 : -0.65),
        ny + (isDown ? -0.70 : 0.0),
        nz
      );
      plume.name = `ThrusterPlume_${i}`;
      plume.visible = false;
      car.add(plume);

      // Supersonic diamond core
      const core = new THREE.Mesh(isDown ? coneDownCoreGeo : coneRearCoreGeo, plumeCoreMat);
      core.position.set(
        nx + (isDown ? 0.0 : -0.45),
        ny + (isDown ? -0.48 : 0.0),
        nz
      );
      core.name = `ThrusterCore_${i}`;
      core.visible = false;
      car.add(core);
    });

    // -------------------------------------------------------------------------
    // Ground Blast Pressure Shockwave Ring (Active when altitude < 6m and firing)
    // -------------------------------------------------------------------------
    const blastRingGeo = new THREE.RingGeometry(1.2, 2.8, 32);
    blastRingGeo.rotateX(-Math.PI / 2);
    const blastRingMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const blastRing = new THREE.Mesh(blastRingGeo, blastRingMat);
    blastRing.position.set(0, 0.02, 0);
    blastRing.name = 'GroundBlastRing';
    blastRing.visible = false;
    car.add(blastRing);

    // -------------------------------------------------------------------------
    // 7. Four Wheels, Tires & Brakes (Sitting solidly at Y = 0)
    // -------------------------------------------------------------------------
    const tireRadius = 0.355; // 355mm rolling radius -> Wheel center at Y = 0.355
    const wheelPositions: [number, number, number][] = [
      [1.375, tireRadius, 0.84],   // Front Left
      [1.375, tireRadius, -0.84],  // Front Right
      [-1.375, tireRadius, 0.85],  // Rear Left
      [-1.375, tireRadius, -0.85], // Rear Right
    ];

    const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, 0.28, 32);
    tireGeo.rotateX(Math.PI / 2);

    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.29, 24);
    rimGeo.rotateX(Math.PI / 2);

    const discGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 24);
    discGeo.rotateX(Math.PI / 2);

    const caliperGeo = new THREE.BoxGeometry(0.08, 0.10, 0.06);

    for (let w = 0; w < 4; w++) {
      const [wx, wy, wz] = wheelPositions[w];
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(wx, wy, wz);
      wheelAssembly.name = `WheelAssembly_${w}`;

      // Rubber Tire
      const tire = new THREE.Mesh(tireGeo, tireRubber);
      tire.castShadow = true;
      tire.receiveShadow = true;
      wheelAssembly.add(tire);

      // Gunmetal Alloy Rim
      const rim = new THREE.Mesh(rimGeo, alloyRim);
      wheelAssembly.add(rim);

      // Carbon-Ceramic Rotor
      const disc = new THREE.Mesh(discGeo, brakeDisc);
      wheelAssembly.add(disc);

      // Red Brake Caliper
      const caliper = new THREE.Mesh(caliperGeo, brakeBrembo);
      caliper.position.set(0, 0.12, 0);
      wheelAssembly.add(caliper);

      car.add(wheelAssembly);
    }

    car.position.set(0, 0, 0);
    return car;
  }
}
