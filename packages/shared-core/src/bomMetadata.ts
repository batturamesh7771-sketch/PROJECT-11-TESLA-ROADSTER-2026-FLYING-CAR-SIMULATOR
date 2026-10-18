/**
 * 1,048-Part Parametric CAD Bill of Materials (BOM) Metadata
 * Subsystems SYS-01 through SYS-10, Part IDs RD26-0001 to RD26-1048
 */

export interface SubsystemDefinition {
  code: string;
  name: string;
  startId: number;
  endId: number;
  partCount: number;
  totalMassKg: number;
  primaryMaterials: string[];
  description: string;
}

export interface CADPartMetadata {
  id: string; // e.g. "RD26-0001"
  index: number; // 1..1048
  subsystemCode: string;
  name: string;
  material: string;
  massKg: number;
  kinematicJoint: string;
  meshPrimitive: 'box' | 'cylinder' | 'sphere' | 'torus' | 'compound' | 'extrusion';
  dimensions: [number, number, number]; // [width, height, depth] or [r_top, r_bot, height]
  baseOffset: [number, number, number]; // [x, y, z] in vehicle body frame
  assemblyNormal: [number, number, number]; // vector along which it explodes
}

export const SUBSYSTEM_DEFINITIONS: SubsystemDefinition[] = [
  {
    code: 'SYS-01',
    name: 'Carbon-Ti Monocoque Tub & Spaceframe Subframes',
    startId: 1,
    endId: 112,
    partCount: 112,
    totalMassKg: 245.0,
    primaryMaterials: ['Toray T1100G CFRP', 'Ti-6Al-4V', 'Hollow Cast Mg-AZ91D', '7075-T6 Al'],
    description: 'Chassis central tub with integrated fixed seats, magnesium front subframe, electron-beam welded rear thrust cradle, and A/B pillar roll halo.',
  },
  {
    code: 'SYS-02',
    name: 'Ano White Exterior Bodywork, Doors & Gold Glazed Glass',
    startId: 113,
    endId: 210,
    partCount: 98,
    totalMassKg: 138.0,
    primaryMaterials: ['Autoclave Prepreg CFRP', 'TiO2/Cu Vapor Gorilla Glass', 'Polycarbonate'],
    description: 'SR-71 wedge body panels in Ano White pearl, 2-axis dihedral doors, 68.5 deg gold glazed windshield, stowable T-top roof, pop-down micro-LEDs.',
  },
  {
    code: 'SYS-03',
    name: 'Active Aerodynamics & Optimus Wing Actuation Suite',
    startId: 211,
    endId: 304,
    partCount: 94,
    totalMassKg: 64.5,
    primaryMaterials: ['Hollow-Core CFRP', '17-4PH Stainless Gears', 'Ti-6Al-4V Torque Tubes'],
    description: 'Single-pylon rear wing with 4 Optimus robot ankle actuators (0-90 deg airbrake), 5-surface articulated front flaps, pop-out barge boards.',
  },
  {
    code: 'SYS-04',
    name: 'Multi-Mode Underbody Suction Fans & Dynamic Skirts',
    startId: 305,
    endId: 412,
    partCount: 108,
    totalMassKg: 78.5,
    primaryMaterials: ['Ti-6Al-4V Blisks', 'Viton Elastomer', 'Nylon-66 Bristles', 'CFRP Plenum'],
    description: '4 x 20 kW mixed-flow suction fans (28,000 RPM), 4 drop-down rubber/nylon bristle sealing skirts (0-55 mm travel), 4.0 m^2 floor plenum.',
  },
  {
    code: 'SYS-05',
    name: 'SpaceX Cold-Gas Thruster (CGT) Array (10 Nozzles)',
    startId: 413,
    endId: 556,
    partCount: 144,
    totalMassKg: 112.0,
    primaryMaterials: ['DMLS Inconel 718', 'Ti-6Al-4V Nozzles', 'Au-Plated Thermal Shields'],
    description: '4 rear gold-ringed De Laval nozzles with +/-8 deg gimbals, 4 wheel-well lift/roll nozzles, 2 lateral nose yaw nozzles.',
  },
  {
    code: 'SYS-06',
    name: '10,000-PSI COPV Storage Vessels, Manifolds & Cryo Valves',
    startId: 557,
    endId: 678,
    partCount: 122,
    totalMassKg: 195.0,
    primaryMaterials: ['Toray T1100G Carbon Overwrap', 'Al-Li 2195 Liner', 'MP35N Tubing'],
    description: '200L trunk COPV, 400L passenger cabin COPV, 38 mm high-pressure manifolds, 10 Optimus pintle valves, 750 bar burst discs, intercooled compressor.',
  },
  {
    code: 'SYS-07',
    name: '800V-1000V Bespoke 4680 Structural Battery & Thermal Loop',
    startId: 679,
    endId: 794,
    partCount: 116,
    totalMassKg: 445.0,
    primaryMaterials: ['Aluminum-Can 4680 Cells', 'Ti-6Al-4V Top Plate', 'Al-6061 Skid Plate'],
    description: 'Structural 4680 battery pack, dual-sided cross-flow dielectric cooling jacket, Octovalve heat-pump manifold, 500 kW V4 NACS port.',
  },
  {
    code: 'SYS-08',
    name: '1 MW Dual-Motor Rear Drive Unit (RDU) & 8.4:1 Gearboxes',
    startId: 795,
    endId: 892,
    partCount: 98,
    totalMassKg: 124.0,
    primaryMaterials: ['FeCoV Cobalt-Steel', 'Carbon-Wrapped Rotor', 'SiC Inverters', 'Maraging Steel 300'],
    description: 'Dual 500 kW coaxial electric motors, independent left/right SiC inverters, twin 8.4:1 planetary gearsets, titanium half-shafts.',
  },
  {
    code: 'SYS-09',
    name: 'Rocker-Arm Suspension, Spool-Valve Dampers, Brakes & Wheels',
    startId: 893,
    endId: 984,
    partCount: 92,
    totalMassKg: 186.0,
    primaryMaterials: ['Aero CFRP Arms', 'C/SiC Ceramic Rotors', 'Forged Mg Wheels', 'Ti Coil Springs'],
    description: 'Pushrod double-wishbone front, 5-link rear, spool-valve adaptive dampers (-40 mm drop), carbon-ceramic brakes, forged magnesium wheels.',
  },
  {
    code: 'SYS-10',
    name: 'Steer-by-Wire Cockpit, Movable Pedal Box & FSD/VLA Sensors',
    startId: 985,
    endId: 1048,
    partCount: 64,
    totalMassKg: 62.0,
    primaryMaterials: ['Magnesium Yoke Core', 'Microsuede Shell', 'BGA Silicon (AI5/HW5)', 'Sapphire Glass'],
    description: '+/-170 deg steer-by-wire yoke, motorized sliding pedal box (220 mm), tri-screen panoramic display, 8 FSD cameras, triple 2 kHz IMU.',
  },
];

/**
 * Generate full metadata array for all 1,048 parts
 */
export function generateFullBOM(): CADPartMetadata[] {
  const parts: CADPartMetadata[] = [];

  for (const sys of SUBSYSTEM_DEFINITIONS) {
    const count = sys.endId - sys.startId + 1;
    const avgMass = sys.totalMassKg / count;

    for (let id = sys.startId; id <= sys.endId; id++) {
      const padId = id.toString().padStart(4, '0');
      const partIdStr = `RD26-${padId}`;
      const relIdx = id - sys.startId;

      // Deterministic layout offsets based on subsystem
      let offset: [number, number, number] = [0, 0, 0];
      let normal: [number, number, number] = [0, 0, 1];
      let primitive: CADPartMetadata['meshPrimitive'] = 'box';
      let dims: [number, number, number] = [0.2, 0.2, 0.2];
      let joint = 'fixed';

      switch (sys.code) {
        case 'SYS-01': // Monocoque tub
          offset = [-0.2 + (relIdx / count) * 2.5 - 1.0, ((relIdx % 2 === 0 ? 1 : -1) * 0.4), 0.3];
          normal = [offset[0] * 0.5, offset[1] * 1.2, 0.5];
          primitive = relIdx < 20 ? 'compound' : 'box';
          dims = [0.4, 0.1, 0.15];
          break;
        case 'SYS-02': // Bodywork & Glass
          offset = [-0.5 + (relIdx / count) * 4.0 - 1.5, ((relIdx % 2 === 0 ? 1 : -1) * 0.85), 0.6];
          normal = [offset[0] * 0.8, offset[1] * 1.5, 0.8];
          primitive = id >= 145 && id <= 172 ? 'compound' : 'extrusion';
          joint = id >= 145 && id <= 172 ? 'revolute' : 'fixed';
          dims = [0.35, 0.05, 0.25];
          break;
        case 'SYS-03': // Active Aero
          if (id <= 246) {
            // Rear wing
            offset = [-1.85, ((relIdx % 2 === 0 ? 1 : -1) * 0.5), 1.0];
            normal = [-0.5, 0, 1.0];
            joint = 'revolute';
          } else {
            // Front wing
            offset = [1.85, ((relIdx % 2 === 0 ? 1 : -1) * 0.6), 0.2];
            normal = [0.8, 0, -0.2];
            joint = 'revolute';
          }
          dims = [0.25, 0.04, 0.3];
          break;
        case 'SYS-04': // Suction Fans & Skirts
          if (id <= 348) {
            // Fans
            const fanIdx = (id - 305) % 4;
            offset = [-1.6, -0.45 + fanIdx * 0.3, 0.15];
            normal = [0, 0, -1.0];
            primitive = 'cylinder';
            dims = [0.11, 0.11, 0.1];
          } else {
            // Skirts
            offset = [-0.2, (relIdx % 2 === 0 ? 0.85 : -0.85), 0.05];
            normal = [0, offset[1] > 0 ? 1.0 : -1.0, -0.5];
            joint = 'prismatic';
            dims = [0.5, 0.02, 0.05];
          }
          break;
        case 'SYS-05': // 10 CGTs
          if (id <= 468) {
            // Rear 4 nozzles
            const rIdx = (id - 413) % 4;
            offset = [-1.95, -0.45 + rIdx * 0.3, 0.38];
            normal = [-1.0, 0, 0];
          } else if (id <= 524) {
            // Wheel lift 4
            const wIdx = (id - 469) % 4;
            offset = [wIdx < 2 ? 1.3 : -1.3, wIdx % 2 === 0 ? 0.9 : -0.9, 0.32];
            normal = [0, 0, -1.0];
          } else {
            // Nose yaw 2
            const nIdx = (id - 525) % 2;
            offset = [1.85, nIdx === 0 ? 0.88 : -0.88, 0.42];
            normal = [0, nIdx === 0 ? 1.0 : -1.0, 0];
          }
          primitive = 'cylinder';
          dims = [0.03, 0.015, 0.12];
          break;
        case 'SYS-06': // COPV Tanks & Manifolds
          if (id <= 604) {
            // Trunk & Cabin tanks
            offset = id < 580 ? [-1.3, 0, 0.45] : [0.2, -0.35, 0.45];
            primitive = 'cylinder';
            dims = [0.28, 0.28, 0.75];
          } else {
            offset = [-0.8, 0, 0.35];
            primitive = 'cylinder';
            dims = [0.038, 0.038, 0.3];
          }
          normal = [offset[0] * 0.4, offset[1] * 0.4, 0.8];
          break;
        case 'SYS-07': // Battery Pack
          offset = [-0.1, ((relIdx % 2 === 0 ? 1 : -1) * 0.5), 0.12];
          normal = [0, 0, -1.0];
          primitive = 'box';
          dims = [0.2, 0.2, 0.08];
          break;
        case 'SYS-08': // RDU Motors & Gearboxes
          offset = [-1.2, ((relIdx % 2 === 0 ? 0.35 : -0.35)), 0.32];
          normal = [-0.5, offset[1] > 0 ? 0.8 : -0.8, 0];
          primitive = 'cylinder';
          dims = [0.18, 0.18, 0.25];
          break;
        case 'SYS-09': // Suspension & Wheels
          const corner = relIdx % 4;
          const isFront = corner < 2;
          const isLeft = corner % 2 === 0;
          offset = [isFront ? 1.35 : -1.35, isLeft ? 0.85 : -0.85, 0.35];
          normal = [isFront ? 0.4 : -0.4, isLeft ? 1.0 : -1.0, 0];
          primitive = 'cylinder';
          dims = [0.35, 0.35, 0.25];
          joint = 'revolute';
          break;
        case 'SYS-10': // Cockpit & Sensors
          offset = [0.35, 0.35, 0.55];
          normal = [0.2, 0.5, 0.8];
          primitive = 'box';
          dims = [0.15, 0.1, 0.05];
          break;
      }

      parts.push({
        id: partIdStr,
        index: id,
        subsystemCode: sys.code,
        name: `${sys.name.split('&')[0].trim()} Part #${padId}`,
        material: sys.primaryMaterials[relIdx % sys.primaryMaterials.length],
        massKg: parseFloat(avgMass.toFixed(3)),
        kinematicJoint: joint,
        meshPrimitive: primitive,
        dimensions: dims,
        baseOffset: offset,
        assemblyNormal: normal,
      });
    }
  }

  return parts;
}
