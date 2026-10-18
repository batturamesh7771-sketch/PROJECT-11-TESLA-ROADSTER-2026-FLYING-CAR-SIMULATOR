import * as THREE from 'three';

export interface TrafficObstacle {
  id: string;
  type: 'semi' | 'cybertruck' | 'cybercab' | 'police' | 'taxi' | 'suv' | 'sedan';
  x: number;
  z: number;
  width: number;
  length: number;
  height: number;
}

interface AnimatedVehicle {
  mesh: THREE.Group;
  baseX: number;
  baseZ: number;
  lane: number;
  speed: number;
  isOncoming: boolean;
  hazardLights?: THREE.Mesh[];
  policeStrobes?: { red: THREE.Mesh; blue: THREE.Mesh };
}

/**
 * CityTrafficWorld (Theme 2: Test Mission 09 - Heavy City Traffic Escape)
 * Authentic American Multi-Lane Interstate Freeway & Downtown Skyline:
 * - 5-Lane Jammed Interstate Highway (I-405 / I-80 Downtown Expressway)
 * - Concrete Jersey Median Barrier separating Eastbound Jam from Westbound Moving Traffic
 * - American Steel Truss Overhead Sign Gantries ("NORTH 80 Highway", "NORTH 90 City Center", "EXIT 33")
 * - Amber LED Matrix Sign: "SEVERE GRIDLOCK AHEAD — ALL LANES STOPPED"
 * - Detailed Procedural 3D Vehicles: Tesla Semis (4.2m tall trailers), Cybertrucks, Cybercabs,
 *   American Police Cruisers with flashing strobes, Yellow City Taxis, SUVs & Sedans with brake lights & hazards
 * - Dynamic moving oncoming traffic, traffic creep animation, and thruster buffeting physics
 */
export class CityTrafficWorld {
  public static readonly TRAFFIC_OBSTACLES: TrafficObstacle[] = [];
  private static animatedVehicles: AnimatedVehicle[] = [];
  private static policeStrobesList: { red: THREE.Mesh; blue: THREE.Mesh }[] = [];
  private static hazardLightsList: THREE.Mesh[] = [];
  private static jammedCarsList: THREE.Group[] = [];
  private static gantryMatrixFace: THREE.Mesh | null = null;

  public static createWorld(): THREE.Group {
    const world = new THREE.Group();
    world.name = 'CityTrafficWorld_Theme2_3D';

    this.TRAFFIC_OBSTACLES.length = 0;
    this.animatedVehicles.length = 0;
    this.policeStrobesList.length = 0;
    this.hazardLightsList.length = 0;
    this.jammedCarsList.length = 0;

    // -------------------------------------------------------------------------
    // 1. Materials Library (Accurate Real-World PBR)
    // -------------------------------------------------------------------------
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x1f232b,
      roughness: 0.75,
      metalness: 0.10,
    });

    const shoulderRumbleMat = new THREE.MeshStandardMaterial({
      color: 0x16181e,
      roughness: 0.88,
      metalness: 0.05,
    });

    const jerseyBarrierMat = new THREE.MeshStandardMaterial({
      color: 0x8a99a8, // Weathered American highway concrete
      roughness: 0.85,
      metalness: 0.08,
    });

    const steelTrussMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Galvanized American bridge steel
      roughness: 0.45,
      metalness: 0.85,
    });

    const greenSignMat = new THREE.MeshStandardMaterial({
      color: 0x065f46, // Official MUTCD Interstate Green
      roughness: 0.35,
      metalness: 0.20,
    });

    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // MUTCD Highway Yellow
    const brakeRedMat = new THREE.MeshBasicMaterial({ color: 0xff002b });
    const headlightWhiteMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const amberHazardMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const policeBlueMat = new THREE.MeshBasicMaterial({ color: 0x0066ff });
    const policeRedMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a1118,
      transmission: 0.82,
      opacity: 0.95,
      transparent: true,
      roughness: 0.08,
      metalness: 0.90,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.12,
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x151619,
      roughness: 0.85,
      metalness: 0.08,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.90,
      roughness: 0.25,
    });

    // -------------------------------------------------------------------------
    // 2. Dusk / Twilight American City Sky Dome & Atmospheric Lighting
    // -------------------------------------------------------------------------
    const skyGeo = new THREE.SphereGeometry(1600, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b, // American dusk twilight sky
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    world.add(sky);

    // City ground base
    const groundGeo = new THREE.PlaneGeometry(2400, 2400);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.96 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(300, -0.42, 0);
    world.add(ground);

    // -------------------------------------------------------------------------
    // 3. Realistic 5-Lane Interstate Highway with Center Median & Oncoming Lanes
    // Total Width = 48m, Length = 1,400m (from X = -250 to +1150)
    // - Eastbound Jammed Carriageway (5 Lanes): Z = -10.0m to +11.0m
    // - Center Concrete Jersey Median Barrier: Z = -11.0m
    // - Westbound Oncoming Carriageway (3 Lanes): Z = -12.5m to -26.0m
    // -------------------------------------------------------------------------
    const roadLength = 1400;
    const roadGeo = new THREE.BoxGeometry(roadLength, 0.40, 48);
    const road = new THREE.Mesh(roadGeo, asphaltMat);
    road.position.set(450, -0.20, -7);
    road.receiveShadow = true;
    world.add(road);

    // Shoulders with rumble strips
    const shoulderOuterR = new THREE.Mesh(new THREE.BoxGeometry(roadLength, 0.40, 3.5), shoulderRumbleMat);
    shoulderOuterR.position.set(450, -0.20, 16.0);
    world.add(shoulderOuterR);

    const shoulderOuterL = new THREE.Mesh(new THREE.BoxGeometry(roadLength, 0.40, 3.5), shoulderRumbleMat);
    shoulderOuterL.position.set(450, -0.20, -30.0);
    world.add(shoulderOuterL);

    // Outer Concrete Jersey Barriers
    const barrierOuterR = new THREE.Mesh(new THREE.BoxGeometry(roadLength, 1.05, 0.50), jerseyBarrierMat);
    barrierOuterR.position.set(450, 0.525, 17.5);
    world.add(barrierOuterR);

    const barrierOuterL = new THREE.Mesh(new THREE.BoxGeometry(roadLength, 1.05, 0.50), jerseyBarrierMat);
    barrierOuterL.position.set(450, 0.525, -31.5);
    world.add(barrierOuterL);

    // Center Double-Sided Concrete Jersey Median Barrier (dividing Eastbound from Westbound)
    const centerMedianBarrier = new THREE.Mesh(new THREE.BoxGeometry(roadLength, 1.15, 0.65), jerseyBarrierMat);
    centerMedianBarrier.position.set(450, 0.575, -11.0);
    world.add(centerMedianBarrier);

    // Highway Shoulder Lines (MUTCD Yellow on Left, White on Right)
    const edgeYellowGeo = new THREE.PlaneGeometry(roadLength, 0.28);
    edgeYellowGeo.rotateX(-Math.PI / 2);
    // Yellow line next to center median (Eastbound)
    const edgeYellowEB = new THREE.Mesh(edgeYellowGeo, yellowLineMat);
    edgeYellowEB.position.set(450, 0.025, -10.2);
    world.add(edgeYellowEB);
    // Yellow line next to center median (Westbound)
    const edgeYellowWB = new THREE.Mesh(edgeYellowGeo, yellowLineMat);
    edgeYellowWB.position.set(450, 0.025, -11.8);
    world.add(edgeYellowWB);

    // Outer Solid White Shoulder Lines
    const edgeWhiteGeo = new THREE.PlaneGeometry(roadLength, 0.28);
    edgeWhiteGeo.rotateX(-Math.PI / 2);
    const edgeWhiteEB = new THREE.Mesh(edgeWhiteGeo, whiteLineMat);
    edgeWhiteEB.position.set(450, 0.025, 13.8);
    world.add(edgeWhiteEB);

    const edgeWhiteWB = new THREE.Mesh(edgeWhiteGeo, whiteLineMat);
    edgeWhiteWB.position.set(450, 0.025, -28.0);
    world.add(edgeWhiteWB);

    // 5 Lanes for Eastbound Jammed Expressway:
    // Lane 1: Z = -7.5 (Inside fast lane)
    // Lane 2: Z = -2.5 (Mid-left)
    // Lane 3: Z = +2.5 (Center / Hero car approach lane)
    // Lane 4: Z = +7.5 (Mid-right)
    // Lane 5: Z = +11.5 (Outer slow / truck lane)
    // Lane dividers at Z = -5.0, 0.0, 5.0, 9.5
    const ebDividers = [-5.0, 0.0, 5.0, 9.5];
    const wbDividers = [-16.5, -21.5]; // 3 Westbound lanes

    const dashGeo = new THREE.PlaneGeometry(4.0, 0.22);
    dashGeo.rotateX(-Math.PI / 2);

    for (let x = -240; x < 1140; x += 11) {
      ebDividers.forEach((z) => {
        const stripe = new THREE.Mesh(dashGeo, whiteLineMat);
        stripe.position.set(x, 0.022, z);
        world.add(stripe);
      });
      wbDividers.forEach((z) => {
        const stripe = new THREE.Mesh(dashGeo, whiteLineMat);
        stripe.position.set(x, 0.022, z);
        world.add(stripe);
      });
    }

    // -------------------------------------------------------------------------
    // 4. Highway Street Lighting (Cobra-head highway streetlamps every 45m)
    // -------------------------------------------------------------------------
    for (let x = -220; x < 1100; x += 45) {
      // Median double-arm pole
      const poleGeo = new THREE.CylinderGeometry(0.14, 0.18, 9.8, 8);
      const pole = new THREE.Mesh(poleGeo, jerseyBarrierMat);
      pole.position.set(x, 4.9, -11.0);
      world.add(pole);

      // Eastbound lamp arm
      const armEB = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 0.12), jerseyBarrierMat);
      armEB.position.set(x, 9.6, -9.6);
      world.add(armEB);

      const lampEB = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.18, 0.40),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      lampEB.position.set(x, 9.5, -8.3);
      world.add(lampEB);

      // Westbound lamp arm
      const armWB = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 0.12), jerseyBarrierMat);
      armWB.position.set(x, 9.6, -12.4);
      world.add(armWB);

      const lampWB = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.18, 0.40),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      lampWB.position.set(x, 9.5, -13.7);
      world.add(lampWB);
    }

    // -------------------------------------------------------------------------
    // 5. Authentic American Steel Truss Overhead Highway Gantries
    // -------------------------------------------------------------------------
    // Helper to build realistic steel lattice highway gantry
    const createInterstateGantry = (
      xPos: number,
      signLeftText: string,
      signRightText: string,
      exitText: string,
      amberWarningText: string | null
    ) => {
      const gantry = new THREE.Group();
      gantry.position.set(xPos, 0, 0);

      const trussSpanZ = 30.0;
      const trussHeightY = 9.8;

      // Heavy steel lattice side support towers
      const towerL = new THREE.Mesh(new THREE.BoxGeometry(1.2, trussHeightY, 1.2), steelTrussMat);
      towerL.position.set(0, trussHeightY / 2, 15.5);
      const towerR = new THREE.Mesh(new THREE.BoxGeometry(1.2, trussHeightY, 1.2), steelTrussMat);
      towerR.position.set(0, trussHeightY / 2, -10.8);
      gantry.add(towerL);
      gantry.add(towerR);

      // Overhead cross-truss bridge
      const crossBeamTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, trussSpanZ), steelTrussMat);
      crossBeamTop.position.set(0, trussHeightY, 2.35);
      const crossBeamBot = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, trussSpanZ), steelTrussMat);
      crossBeamBot.position.set(0, trussHeightY - 1.8, 2.35);
      gantry.add(crossBeamTop);
      gantry.add(crossBeamBot);

      // Diagonal cross-braces
      for (let z = -9.0; z <= 13.0; z += 3.5) {
        const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), steelTrussMat);
        brace.position.set(0, trussHeightY - 0.9, z);
        brace.rotation.x = 0.65;
        gantry.add(brace);
      }

      // Green Signboard 1 (Left / Interstate 80)
      const sign1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.3, 7.5), greenSignMat);
      sign1.position.set(-0.9, trussHeightY - 0.9, -3.5);
      gantry.add(sign1);

      // White border on Sign 1
      const sign1Face = new THREE.Mesh(
        new THREE.PlaneGeometry(7.2, 2.0),
        new THREE.MeshBasicMaterial({ color: 0x065f46 })
      );
      sign1Face.rotation.y = -Math.PI / 2;
      sign1Face.position.set(-1.0, trussHeightY - 0.9, -3.5);
      gantry.add(sign1Face);

      // Green Signboard 2 (Right / Interstate 90)
      const sign2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.3, 8.5), greenSignMat);
      sign2.position.set(-0.9, trussHeightY - 0.9, 5.5);
      gantry.add(sign2);

      const sign2Face = new THREE.Mesh(
        new THREE.PlaneGeometry(8.2, 2.0),
        new THREE.MeshBasicMaterial({ color: 0x065f46 })
      );
      sign2Face.rotation.y = -Math.PI / 2;
      sign2Face.position.set(-1.0, trussHeightY - 0.9, 5.5);
      gantry.add(sign2Face);

      // Yellow Exit Tab atop Sign 2
      const exitTab = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 3.2), yellowLineMat);
      exitTab.position.set(-0.9, trussHeightY + 0.65, 7.5);
      gantry.add(exitTab);

      // Amber LED Digital Matrix Sign (if present)
      if (amberWarningText) {
        const amberMatrixBoard = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 1.4, 18.0),
          new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.2 })
        );
        amberMatrixBoard.position.set(-1.05, trussHeightY - 2.8, 2.0);
        gantry.add(amberMatrixBoard);

        const matrixFace = new THREE.Mesh(
          new THREE.PlaneGeometry(17.5, 1.15),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b }) // Blinking amber LED grid
        );
        matrixFace.rotation.y = -Math.PI / 2;
        matrixFace.position.set(-1.18, trussHeightY - 2.8, 2.0);
        gantry.add(matrixFace);
        this.gantryMatrixFace = matrixFace;
      }

      return gantry;
    };

    // Gantry 1: Directly above road before gridlock (X = -26m)
    world.add(
      createInterstateGantry(
        -26,
        'INTERSTATE 80 NORTH — DOWNTOWN',
        'INTERSTATE 90 NORTH — CITY CENTER',
        'EXIT 33',
        'SEVERE GRIDLOCK AHEAD — ALL LANES STOPPED'
      )
    );

    // Gantry 2: Above open highway landing zone (X = 95m)
    world.add(
      createInterstateGantry(
        95,
        'INTERSTATE 80 NORTH — OPEN FREEWAY',
        'EXIT 34 — AIRPORT / PACIFIC COAST',
        'EXIT 34',
        null
      )
    );

    // -------------------------------------------------------------------------
    // 6. American Downtown Skyline: 48 Modern Illuminated High-Rise Skyscrapers
    // -------------------------------------------------------------------------
    const towerColors = [0x0f172a, 0x1e293b, 0x1e1b4b, 0x172554, 0x0c4a6e, 0x18181b, 0x1c1917];
    const warmWindowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const cyanWindowMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    const beaconRedMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });

    for (let i = 0; i < 48; i++) {
      const bHeight = 55.0 + Math.random() * 110.0;
      const bWidth = 26.0 + Math.random() * 28.0;
      const bDepth = 24.0 + Math.random() * 32.0;

      const isRightSide = i % 2 === 0;
      const bZ = isRightSide
        ? 34.0 + bDepth / 2.0 + Math.random() * 18.0
        : -48.0 - bDepth / 2.0 - Math.random() * 18.0;

      const bX = -220.0 + i * 26.0;

      const color = towerColors[i % towerColors.length];
      const towerMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.82,
      });

      const tower = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bDepth), towerMat);
      tower.position.set(bX, bHeight / 2.0, bZ);
      tower.castShadow = true;
      world.add(tower);

      // Window grid rows
      const winMat = i % 3 === 0 ? cyanWindowMat : warmWindowMat;
      for (let wy = 8.0; wy < bHeight - 8.0; wy += 9.5) {
        const winBand = new THREE.Mesh(new THREE.BoxGeometry(bWidth * 0.92, 1.4, bDepth * 0.92), winMat);
        winBand.position.set(bX, wy, bZ);
        world.add(winBand);
      }

      // Rooftop aviation warning beacon
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), beaconRedMat);
      beacon.position.set(bX, bHeight + 1.2, bZ);
      world.add(beacon);
    }

    // -------------------------------------------------------------------------
    // 7. Multi-Part Detailed Procedural Vehicle Builder (No More Flat Boxes!)
    // -------------------------------------------------------------------------
    // Wheels builder
    const create3DWheel = (radius: number, width: number) => {
      const wGroup = new THREE.Group();
      const tMesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 16), tireMat);
      tMesh.rotation.x = Math.PI / 2;
      tMesh.castShadow = true;
      wGroup.add(tMesh);

      const rMesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width + 0.02, 12), rimMat);
      rMesh.rotation.x = Math.PI / 2;
      wGroup.add(rMesh);
      return wGroup;
    };

    // -------------------------------------------------------------------------
    // A. Tesla Semi (18-Wheeler with 4.2m tall trailer)
    // -------------------------------------------------------------------------
    const spawnDetailedSemi = (x: number, z: number, id: string, cabColor = 0xffffff) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const semiCabMat = new THREE.MeshStandardMaterial({ color: cabColor, metalness: 0.85, roughness: 0.25 });
      const trailerMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.88, roughness: 0.28 });

      // 1. Aerodynamic Cab (sloped nose, wrap-around windshield)
      const cabBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 2.5), semiCabMat);
      cabBase.position.set(5.8, 1.4, 0);
      cabBase.castShadow = true;
      group.add(cabBase);

      const cabUpper = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 2.45), semiCabMat);
      cabUpper.position.set(5.4, 3.2, 0);
      group.add(cabUpper);

      // Sloped front aerodynamic glass
      const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 2.40), glassMat);
      cabGlass.position.set(6.7, 2.8, 0);
      cabGlass.rotation.z = -0.32;
      group.add(cabGlass);

      // Cab front headlights
      const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.45), headlightWhiteMat);
      hlL.position.set(7.9, 0.85, 0.95);
      const hlR = hlL.clone();
      hlR.position.set(7.9, 0.85, -0.95);
      group.add(hlL);
      group.add(hlR);

      // 2. Huge 4.2m Tall Freight Cargo Box Trailer
      const trailer = new THREE.Mesh(new THREE.BoxGeometry(13.2, 4.2, 2.65), trailerMat);
      trailer.position.set(-1.8, 2.4, 0);
      trailer.castShadow = true;
      group.add(trailer);

      // Corrugated trailer side ribs
      for (let rx = -7.0; rx <= 3.8; rx += 1.8) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.10, 4.0, 2.68), steelTrussMat);
        rib.position.set(rx, 2.4, 0);
        group.add(rib);
      }

      // Amber side marker lights along trailer roof
      for (let mx = -7.5; mx <= 4.0; mx += 2.5) {
        const markerL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), amberHazardMat);
        markerL.position.set(mx, 4.35, 1.34);
        const markerR = markerL.clone();
        markerR.position.set(mx, 4.35, -1.34);
        group.add(markerL);
        group.add(markerR);
      }

      // Rear Full-Width Red Brake Lightbar
      const brakeBar = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 2.45), brakeRedMat);
      brakeBar.position.set(-8.45, 0.95, 0);
      group.add(brakeBar);

      // Rear underride crash guard
      const underride = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.20, 2.4), steelTrussMat);
      underride.position.set(-8.42, 0.55, 0);
      group.add(underride);

      // 10 Detailed Wheels (Tandem rear trailer axles + cab drive axles)
      const wheelZ = 1.15;
      const wheelXs = [7.0, 5.0, 3.8, -4.5, -6.5];
      wheelXs.forEach((wx) => {
        const wL = create3DWheel(0.52, 0.34);
        wL.position.set(wx, 0.52, wheelZ);
        const wR = create3DWheel(0.52, 0.34);
        wR.position.set(wx, 0.52, -wheelZ);
        group.add(wL);
        group.add(wR);
      });

      world.add(group);
      this.jammedCarsList.push(group);

      this.TRAFFIC_OBSTACLES.push({
        id,
        type: 'semi',
        x,
        z,
        length: 16.5,
        width: 2.8,
        height: 4.2, // Full 4.2m tall obstacle!
      });
    };

    // -------------------------------------------------------------------------
    // B. Tesla Cybertruck (Angular Brushed Stainless Steel)
    // -------------------------------------------------------------------------
    const spawnDetailedCybertruck = (x: number, z: number, id: string) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const steelMat = new THREE.MeshStandardMaterial({
        color: 0xcfd8dc,
        metalness: 0.88,
        roughness: 0.22,
      });

      // Sculpted wedge lower body
      const lower = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.95, 2.2), steelMat);
      lower.position.set(0, 0.72, 0);
      lower.castShadow = true;
      group.add(lower);

      // Iconic peaked triangular roofline
      const peakRoof = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.85, 2.05), steelMat);
      peakRoof.position.set(-0.25, 1.60, 0);
      peakRoof.rotation.z = 0.08;
      group.add(peakRoof);

      // Dark tinted armor glass canopy
      const glassCanopy = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.75, 1.95), glassMat);
      glassCanopy.position.set(0.15, 1.50, 0);
      glassCanopy.rotation.z = -0.15;
      group.add(glassCanopy);

      // Black truck bed / tonneau cover
      const tonneau = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 1.85), tireMat);
      tonneau.position.set(-1.85, 1.15, 0);
      group.add(tonneau);

      // Front Full-Width White LED Blade Lightbar
      const frontBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 2.1), headlightWhiteMat);
      frontBlade.position.set(2.91, 1.05, 0);
      group.add(frontBlade);

      // Rear Full-Width Crimson-Red LED Taillight Bar
      const rearBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 2.1), brakeRedMat);
      rearBlade.position.set(-2.91, 1.08, 0);
      group.add(rearBlade);

      // Flared angular wheel arches & 4 chunky all-terrain tires
      const wZ = 0.96;
      [1.7, -1.7].forEach((wx) => {
        const wL = create3DWheel(0.44, 0.28);
        wL.position.set(wx, 0.44, wZ);
        const wR = create3DWheel(0.44, 0.28);
        wR.position.set(wx, 0.44, -wZ);
        group.add(wL);
        group.add(wR);
      });

      world.add(group);
      this.jammedCarsList.push(group);

      this.TRAFFIC_OBSTACLES.push({
        id,
        type: 'cybertruck',
        x,
        z,
        length: 5.9,
        width: 2.25,
        height: 2.35,
      });
    };

    // -------------------------------------------------------------------------
    // C. Tesla Cybercab (Metallic Gold Robotaxi)
    // -------------------------------------------------------------------------
    const spawnDetailedCybercab = (x: number, z: number, id: string) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xeab308,
        metalness: 0.88,
        roughness: 0.25,
      });

      const body = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.85, 1.95), goldMat);
      body.position.set(0, 0.65, 0);
      body.castShadow = true;
      group.add(body);

      // Curved fastback glass canopy
      const greenhouse = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.65, 1.75), glassMat);
      greenhouse.position.set(-0.25, 1.35, 0);
      group.add(greenhouse);

      // Headlight & Taillight bars
      const frontLight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.10, 1.85), headlightWhiteMat);
      frontLight.position.set(2.16, 0.72, 0);
      group.add(frontLight);

      const rearLight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 1.85), brakeRedMat);
      rearLight.position.set(-2.16, 0.82, 0);
      group.add(rearLight);

      // Wheels
      [1.35, -1.35].forEach((wx) => {
        const wL = create3DWheel(0.36, 0.24);
        wL.position.set(wx, 0.36, 0.85);
        const wR = create3DWheel(0.36, 0.24);
        wR.position.set(wx, 0.36, -0.85);
        group.add(wL);
        group.add(wR);
      });

      world.add(group);
      this.jammedCarsList.push(group);

      this.TRAFFIC_OBSTACLES.push({
        id,
        type: 'cybercab',
        x,
        z,
        length: 4.4,
        width: 2.0,
        height: 1.8,
      });
    };

    // -------------------------------------------------------------------------
    // D. American Police Cruiser (Black & White with Flashing Red/Blue Lightbar)
    // -------------------------------------------------------------------------
    const spawnPoliceCruiser = (x: number, z: number, id: string) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const blackPaint = new THREE.MeshStandardMaterial({ color: 0x0a0c10, metalness: 0.8, roughness: 0.3 });
      const whiteDoors = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.7, roughness: 0.3 });

      // Lower body black
      const body = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.90, 2.0), blackPaint);
      body.position.set(0, 0.65, 0);
      group.add(body);

      // White door center panel
      const doors = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.88, 2.02), whiteDoors);
      doors.position.set(-0.1, 0.65, 0);
      group.add(doors);

      // Cabin glass
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.72, 1.8), glassMat);
      cabin.position.set(-0.25, 1.40, 0);
      group.add(cabin);

      // Heavy push-bumper on front
      const pushBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 1.4), steelTrussMat);
      pushBar.position.set(2.55, 0.65, 0);
      group.add(pushBar);

      // Red & Blue Emergency Strobe Lightbar on Roof
      const strobeBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 1.2), steelTrussMat);
      strobeBase.position.set(-0.25, 1.80, 0);
      group.add(strobeBase);

      const strobeRed = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.15, 0.52), policeRedMat);
      strobeRed.position.set(-0.25, 1.90, 0.32);
      group.add(strobeRed);

      const strobeBlue = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.15, 0.52), policeBlueMat);
      strobeBlue.position.set(-0.25, 1.90, -0.32);
      group.add(strobeBlue);

      this.policeStrobesList.push({ red: strobeRed, blue: strobeBlue });

      // Taillights
      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.4), brakeRedMat);
      tailL.position.set(-2.52, 0.80, 0.75);
      const tailR = tailL.clone();
      tailR.position.set(-2.52, 0.80, -0.75);
      group.add(tailL);
      group.add(tailR);

      // Wheels
      [1.5, -1.5].forEach((wx) => {
        const wL = create3DWheel(0.38, 0.25);
        wL.position.set(wx, 0.38, 0.88);
        const wR = create3DWheel(0.38, 0.25);
        wR.position.set(wx, 0.38, -0.88);
        group.add(wL);
        group.add(wR);
      });

      world.add(group);
      this.jammedCarsList.push(group);

      this.TRAFFIC_OBSTACLES.push({
        id,
        type: 'police',
        x,
        z,
        length: 5.2,
        width: 2.1,
        height: 2.0,
      });
    };

    // -------------------------------------------------------------------------
    // E. Yellow American City Taxis
    // -------------------------------------------------------------------------
    const spawnYellowTaxi = (x: number, z: number, id: string) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const taxiYellowMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15, // NYC Medallion Yellow
        metalness: 0.65,
        roughness: 0.30,
      });

      const body = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.85, 1.92), taxiYellowMat);
      body.position.set(0, 0.65, 0);
      group.add(body);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.70, 1.74), glassMat);
      cabin.position.set(-0.2, 1.35, 0);
      group.add(cabin);

      // Roof taxi sign
      const taxiSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.40, 0.22, 0.90),
        new THREE.MeshBasicMaterial({ color: 0xffedd5 })
      );
      taxiSign.position.set(-0.2, 1.82, 0);
      group.add(taxiSign);

      // Taillights
      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.4), brakeRedMat);
      tailL.position.set(-2.41, 0.78, 0.72);
      const tailR = tailL.clone();
      tailR.position.set(-2.41, 0.78, -0.72);
      group.add(tailL);
      group.add(tailR);

      // Wheels
      [1.4, -1.4].forEach((wx) => {
        const wL = create3DWheel(0.36, 0.24);
        wL.position.set(wx, 0.36, 0.84);
        const wR = create3DWheel(0.36, 0.24);
        wR.position.set(wx, 0.36, -0.84);
        group.add(wL);
        group.add(wR);
      });

      world.add(group);
      this.jammedCarsList.push(group);

      this.TRAFFIC_OBSTACLES.push({
        id,
        type: 'taxi',
        x,
        z,
        length: 4.9,
        width: 2.0,
        height: 1.9,
      });
    };

    // -------------------------------------------------------------------------
    // F. Detailed Civilian SUVs & Sedans (White, Silver, Navy, Black, Red)
    // -------------------------------------------------------------------------
    const spawnDetailedCar = (
      x: number,
      z: number,
      id: string,
      colorHex: number,
      isSUV = false,
      hasHazards = false
    ) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const paintMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        metalness: 0.82,
        roughness: 0.24,
      });

      const carLen = isSUV ? 4.9 : 4.65;
      const carHeight = isSUV ? 1.05 : 0.85;
      const cabinHeight = isSUV ? 0.85 : 0.68;

      const body = new THREE.Mesh(new THREE.BoxGeometry(carLen, carHeight, 1.94), paintMat);
      body.position.set(0, carHeight / 2 + 0.20, 0);
      body.castShadow = true;
      group.add(body);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(carLen * 0.55, cabinHeight, 1.76), glassMat);
      cabin.position.set(-0.25, carHeight + cabinHeight / 2 + 0.15, 0);
      group.add(cabin);

      // Headlights
      const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.45), headlightWhiteMat);
      hlL.position.set(carLen / 2 + 0.02, carHeight * 0.75, 0.72);
      const hlR = hlL.clone();
      hlR.position.set(carLen / 2 + 0.02, carHeight * 0.75, -0.72);
      group.add(hlL);
      group.add(hlR);

      // Red brake lights
      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.5), brakeRedMat);
      tailL.position.set(-carLen / 2 - 0.02, carHeight * 0.8, 0.70);
      const tailR = tailL.clone();
      tailR.position.set(-carLen / 2 - 0.02, carHeight * 0.8, -0.70);
      group.add(tailL);
      group.add(tailR);

      // Blinking Amber Hazard Lights (optional)
      if (hasHazards) {
        const hazL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.18), amberHazardMat);
        hazL.position.set(-carLen / 2 - 0.03, carHeight * 0.8, 0.88);
        const hazR = hazL.clone();
        hazR.position.set(-carLen / 2 - 0.03, carHeight * 0.8, -0.88);
        group.add(hazL);
        group.add(hazR);
        this.hazardLightsList.push(hazL, hazR);
      }

      // Wheels
      const axleX = carLen * 0.32;
      const wRadius = isSUV ? 0.40 : 0.35;
      [axleX, -axleX].forEach((wx) => {
        const wL = create3DWheel(wRadius, 0.24);
        wL.position.set(wx, wRadius, 0.85);
        const wR = create3DWheel(wRadius, 0.24);
        wR.position.set(wx, wRadius, -0.85);
        group.add(wL);
        group.add(wR);
      });

      world.add(group);
      this.jammedCarsList.push(group);

      this.TRAFFIC_OBSTACLES.push({
        id,
        type: isSUV ? 'suv' : 'sedan',
        x,
        z,
        length: carLen,
        width: 1.95,
        height: carHeight + cabinHeight,
      });
    };

    // -------------------------------------------------------------------------
    // 8. Dense 5-Lane Traffic Gridlock Placement (Bumper-to-Bumper Jam)
    // Spans from X = -14m to X = +68m across all 5 Eastbound Lanes!
    // -------------------------------------------------------------------------
    // Row 1 (Right in front of Roadster at X = -14m to -4m)
    spawnDetailedSemi(-1.0, -2.5, 'obs_semi_1', 0xffffff);     // Massive White Tesla Semi in Lane 2
    spawnDetailedCybertruck(-8.0, 2.5, 'obs_ct_1');             // Cybertruck directly blocking Hero car lane (Lane 3)
    spawnPoliceCruiser(-10.0, -7.5, 'obs_cop_1');               // Police cruiser in Lane 1 with flashing lights
    spawnDetailedCar(-9.5, 7.5, 'obs_suv_1', 0x1e3a8a, true);   // Navy Blue SUV in Lane 4
    spawnYellowTaxi(-7.5, 11.5, 'obs_taxi_1');                  // Yellow NYC Taxi in Lane 5

    // Row 2 (X = 4m to 16m)
    spawnDetailedCybercab(6.0, 2.5, 'obs_cc_1');                // Gold Cybercab in Lane 3
    spawnDetailedCar(5.5, -7.5, 'obs_car_1', 0xd90429, false, true); // Red Sedan with hazard blinkers in Lane 1
    spawnDetailedCybertruck(7.5, 7.5, 'obs_ct_2');              // Cybertruck in Lane 4
    spawnDetailedCar(8.0, 11.5, 'obs_suv_2', 0x0f172a, true);   // Black SUV in Lane 5

    // Row 3 (X = 18m to 32m)
    spawnDetailedSemi(23.0, 7.5, 'obs_semi_2', 0xd1d5db);     // Second Tesla Semi in Lane 4
    spawnDetailedCar(19.0, 2.5, 'obs_car_2', 0x94a3b8, false); // Silver Sedan in Lane 3
    spawnDetailedCybertruck(21.0, -2.5, 'obs_ct_3');            // Cybertruck in Lane 2
    spawnYellowTaxi(20.0, -7.5, 'obs_taxi_2');                  // Yellow Taxi in Lane 1
    spawnDetailedCar(22.0, 11.5, 'obs_car_3', 0xffffff, false); // White Sedan in Lane 5

    // Row 4 (X = 35m to 48m)
    spawnDetailedCybercab(36.0, -7.5, 'obs_cc_2');              // Gold Cybercab in Lane 1
    spawnDetailedSemi(40.0, -2.5, 'obs_semi_3', 0xffffff);     // Third Tesla Semi in Lane 2
    spawnDetailedCar(38.0, 2.5, 'obs_suv_3', 0xd90429, true);   // Red SUV in Lane 3
    spawnDetailedCybertruck(41.0, 7.5, 'obs_ct_4');             // Cybertruck in Lane 4
    spawnDetailedCar(39.0, 11.5, 'obs_car_4', 0x1e293b, false, true); // Dark sedan with hazards in Lane 5

    // Row 5 (X = 52m to 66m - Final Row of Gridlock Blockade)
    spawnDetailedCar(54.0, -7.5, 'obs_suv_4', 0x0284c7, true);  // Blue SUV in Lane 1
    spawnDetailedCybercab(56.0, -2.5, 'obs_cc_3');              // Gold Cybercab in Lane 2
    spawnDetailedCybertruck(58.0, 2.5, 'obs_ct_5');             // Cybertruck in Lane 3
    spawnYellowTaxi(57.0, 7.5, 'obs_taxi_3');                   // Yellow Taxi in Lane 4
    spawnDetailedCar(55.0, 11.5, 'obs_car_5', 0xd1d5db, false); // Silver Sedan in Lane 5

    // -------------------------------------------------------------------------
    // 9. Oncoming Moving Traffic (Westbound Lanes: Z = -16m, -20m, -24m)
    // Cruising at high speed in the opposite direction (-X travel)
    // -------------------------------------------------------------------------
    const spawnOncomingCar = (x: number, z: number, speed: number, colorHex: number) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = Math.PI; // Heading opposite (-X)

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(4.7, 0.88, 1.92),
        new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.8, roughness: 0.25 })
      );
      body.position.set(0, 0.65, 0);
      group.add(body);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.68, 1.74), glassMat);
      cabin.position.set(-0.2, 1.35, 0);
      group.add(cabin);

      // Bright headlights pointing opposite (-X)
      const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.42), headlightWhiteMat);
      hlL.position.set(2.36, 0.65, 0.72);
      const hlR = hlL.clone();
      hlR.position.set(2.36, 0.65, -0.72);
      group.add(hlL);
      group.add(hlR);

      // Taillights
      const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.42), brakeRedMat);
      tlL.position.set(-2.36, 0.70, 0.72);
      const tlR = tlL.clone();
      tlR.position.set(-2.36, 0.70, -0.72);
      group.add(tlL);
      group.add(tlR);

      [1.4, -1.4].forEach((wx) => {
        const wL = create3DWheel(0.36, 0.24);
        wL.position.set(wx, 0.36, 0.84);
        const wR = create3DWheel(0.36, 0.24);
        wR.position.set(wx, 0.36, -0.84);
        group.add(wL);
        group.add(wR);
      });

      world.add(group);
      this.animatedVehicles.push({
        mesh: group,
        baseX: x,
        baseZ: z,
        lane: z,
        speed, // e.g. 24.0 m/s (~86 km/h)
        isOncoming: true,
      });
    };

    // Staggered oncoming vehicles
    spawnOncomingCar(250, -15.0, 24.0, 0xffffff);
    spawnOncomingCar(120, -19.5, 26.0, 0x1e3a8a);
    spawnOncomingCar(380, -24.0, 23.0, 0xd90429);
    spawnOncomingCar(-40, -15.0, 25.0, 0x94a3b8);
    spawnOncomingCar(40, -19.5, 27.0, 0x0f172a);
    spawnOncomingCar(520, -24.0, 24.0, 0xfacc15);
    spawnOncomingCar(680, -15.0, 26.0, 0xffffff);
    spawnOncomingCar(820, -19.5, 25.0, 0xd90429);

    // -------------------------------------------------------------------------
    // 10. Open Landing Highway Target Ring (At X = 110m onward)
    // -------------------------------------------------------------------------
    const targetRing = new THREE.Mesh(
      new THREE.RingGeometry(4.8, 5.4, 32),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide })
    );
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.set(110.0, 0.05, 2.5);
    world.add(targetRing);

    // Inner pulsing target chevron
    const innerTarget = new THREE.Mesh(
      new THREE.CircleGeometry(1.8, 16),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    innerTarget.rotation.x = -Math.PI / 2;
    innerTarget.position.set(110.0, 0.04, 2.5);
    world.add(innerTarget);

    return world;
  }

  /**
   * Real-time animation loop for Theme 2:
   * - Smoothly drives oncoming traffic in westbound freeway lanes
   * - Animates traffic creep & subtle suspension bobbing of jammed cars
   * - Blinks police red/blue strobes and vehicle hazard lights
   * - Buffets nearby jammed cars when Roadster passes overhead firing cold-gas thrusters
   */
  public static update(dt: number, simTime: number, carX: number, carY: number, carThrustKn: number): void {
    // 1. Move Oncoming Traffic along -X
    for (const v of this.animatedVehicles) {
      if (v.isOncoming) {
        v.mesh.position.x -= v.speed * dt;
        if (v.mesh.position.x < -200) {
          v.mesh.position.x = 900 + Math.random() * 80;
        }
      }
    }

    // 2. Police Strobe Lights Alternating Flash (8 Hz)
    const strobePhase = Math.floor(simTime * 8) % 2 === 0;
    for (const s of this.policeStrobesList) {
      s.red.visible = strobePhase;
      s.blue.visible = !strobePhase;
    }

    // 3. Hazard Warning Lights Pulse (1.5 Hz)
    const hazardPhase = Math.sin(simTime * 9.4) > 0;
    for (const h of this.hazardLightsList) {
      h.visible = hazardPhase;
    }

    // 4. Subtle Traffic Creep & Thruster Blast Buffeting
    // Jammed cars creep forward very slightly and rock if the Roadster blasts overhead
    const isRocketOverhead = carThrustKn > 15.0 && carY < 18.0;

    for (let i = 0; i < this.jammedCarsList.length; i++) {
      const carGroup = this.jammedCarsList[i];
      const distToRoadster = Math.abs(carGroup.position.x - carX);

      // Subtle traffic creep: slow harmonic forward/backward creep of 0.08m
      const creepOffset = Math.sin(simTime * 0.4 + i * 1.3) * 0.04;
      carGroup.position.x = (this.TRAFFIC_OBSTACLES[i]?.x ?? carGroup.position.x) + creepOffset;

      // Suspension rocking from cold-gas thruster blast
      if (isRocketOverhead && distToRoadster < 14.0) {
        const blastForce = Math.max(0, 1.0 - distToRoadster / 14.0);
        carGroup.rotation.z = Math.sin(simTime * 22.0 + i) * 0.025 * blastForce;
        carGroup.rotation.x = Math.cos(simTime * 18.0 + i) * 0.015 * blastForce;
      } else {
        carGroup.rotation.z = 0;
        carGroup.rotation.x = 0;
      }
    }

    // 5. Digital Overhead Matrix Sign subtle flicker
    if (this.gantryMatrixFace) {
      const flicker = 0.92 + Math.sin(simTime * 12.0) * 0.08;
      (this.gantryMatrixFace.material as THREE.MeshBasicMaterial).color.setRGB(0.96 * flicker, 0.62 * flicker, 0.05);
    }
  }
}
