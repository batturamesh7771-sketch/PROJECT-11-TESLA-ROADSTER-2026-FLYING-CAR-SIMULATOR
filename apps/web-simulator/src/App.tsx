import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoadsterAssembledModel } from './cad/RoadsterAssembledModel';
import { FlightArenaWorld } from './cad/FlightArenaWorld';
import { CityTrafficWorld } from './cad/CityTrafficWorld';
import { GroundVehicleDynamics } from './physics/GroundVehicleDynamics';
import { TrackSurfaceEvaluator } from './physics/TrackSurfaceEvaluator';
import { FlightEngineeringLab } from './ui/FlightEngineeringLab';

export const App: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Core Dynamic Simulation & Vehicle Plant
  const [vehicle] = useState(() => new GroundVehicleDynamics());

  // UI Interactive States
  const [cameraPreset, setCameraPreset] = useState<'chase' | 'cockpit' | 'top' | 'free' | 'trafficSide'>('chase');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [, setTick] = useState<number>(0);

  // References for Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Initialize Full 3D Interactive World, Car, Lighting & Controls
  useEffect(() => {
    (window as any).vehicle = vehicle;
    (window as any).getTrackSurface = (x: number, z: number) => TrackSurfaceEvaluator.getTrackSurface(x, z);
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    // 1. Scene, Camera, WebGL Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x38bdf8); // Clean sky blue
    scene.fog = new THREE.FogExp2(0x93c5fd, 0.0006); // Atmospheric haze

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.5, 3500);
    cameraRef.current = camera;
    camera.position.set(-188.5, 2.4, 0.0);
    camera.lookAt(-176.5, 0.9, 0.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 2. Mouse OrbitControls (Enables 360° click-and-drag inspection of the live 3D car)
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 500;
    controls.minDistance = 3.0;
    controls.target.set(-180.0, 0.6, 0.0);

    // 3. Realistic High-Altitude Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 3.4);
    sunLight.position.set(-80, 250, 120);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const skyFill = new THREE.DirectionalLight(0x7dd3fc, 1.4);
    skyFill.position.set(100, 150, -100);
    scene.add(skyFill);

    // Thruster Blue Light Glow (Illuminates car rear when boosting)
    const thrusterGlow = new THREE.PointLight(0x00e5ff, 4.0, 25);
    thrusterGlow.name = 'ThrusterPointLight';
    scene.add(thrusterGlow);

    // 4. Live 3D Worlds: Theme 1 (McGregor Ramp) & Theme 2 (Downtown City Expressway Gridlock)
    const theme1World = FlightArenaWorld.createWorld();
    theme1World.name = 'Theme1_Ramp_World';
    scene.add(theme1World);

    const theme2World = CityTrafficWorld.createWorld();
    theme2World.name = 'Theme2_Traffic_World';
    theme2World.visible = false;
    scene.add(theme2World);

    // 5. Live Photorealistic 3D Tesla Roadster Sports Car (Always visible, spinning wheels, firing thrusters)
    const car = RoadsterAssembledModel.createModel();
    carGroupRef.current = car;
    car.visible = true; // Always visible!
    scene.add(car);

    // 6. Window Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 7. 60 FPS Real-Time Physics & Rendering Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min(0.05, (currentTime - lastTime) / 1000.0);
      lastTime = currentTime;

      // Update Dynamic Vehicle Physics
      if (!isPaused) {
        vehicle.update(dt);
      }

      // Update Theme 2 dynamic traffic, animated moving cars, and gantry flicker
      if (vehicle.activeTheme === 'THEME_2_TRAFFIC') {
        CityTrafficWorld.update(dt, vehicle.simTimeSec, vehicle.posX, vehicle.posY, vehicle.totalThrustKn);
      }

      // Toggle Theme Worlds cleanly without modifying Theme 1 meshes or physics
      theme1World.visible = vehicle.activeTheme === 'THEME_1_RAMP';
      theme2World.visible = vehicle.activeTheme === 'THEME_2_TRAFFIC';

      // Sync 3D Car Mesh with Real Physics (Position, 6-DOF Rotation, Wheels, Steering, Thrusters)
      if (carGroupRef.current) {
        vehicle.syncCarMesh(carGroupRef.current);

        // Position Thruster Light Glow right behind the car
        const isPlumeActive = vehicle.totalThrustKn > 5.0 || vehicle.isBoosting;
        thrusterGlow.visible = isPlumeActive;
        if (isPlumeActive) {
          thrusterGlow.position.set(vehicle.posX - 2.8, vehicle.posY + 0.3, vehicle.posZ);
          thrusterGlow.intensity = 2.0 + Math.random() * 2.5;
        }
      }

      // Camera Presets & Dynamic Tracking
      if (cameraRef.current && controlsRef.current) {
        const carX = vehicle.posX;
        const carY = vehicle.posY;
        const carZ = vehicle.posZ;
        const yaw = vehicle.yawRad;
        const pitch = vehicle.pitchRad;

        // Dynamic FOV: Smoothly widens at high speed/altitude for aerospace sensation
        const targetFov = 48 + Math.min(10, (vehicle.speedKmh / 250) * 8 + (vehicle.posY / 30) * 4);
        camera.fov += (targetFov - camera.fov) * 0.1;
        camera.updateProjectionMatrix();

        // High-thrust camera vibration when cold-gas nozzles fire (> 40 kN)
        let shakeX = 0;
        let shakeY = 0;
        if (vehicle.totalThrustKn > 40.0) {
          const shakeMag = (vehicle.totalThrustKn / vehicle.maxColdGasThrustKn) * 0.08;
          shakeX = (Math.random() - 0.5) * shakeMag;
          shakeY = (Math.random() - 0.5) * shakeMag;
        }

        if (cameraPreset === 'chase') {
          controls.enabled = false;
          // Dynamic 3D Aerospace Chase Cam following the moving car along road pitch and flight yaw
          const dist = 8.5;
          const height = 2.4;

          // Forward unit vector based on vehicle pitch & yaw
          const fwdX = Math.cos(pitch) * Math.cos(yaw);
          const fwdY = Math.sin(pitch);
          const fwdZ = -Math.cos(pitch) * Math.sin(yaw);

          // Roof up unit vector
          const upX = -Math.sin(pitch) * Math.cos(yaw);
          const upY = Math.cos(pitch);
          const upZ = Math.sin(pitch) * Math.sin(yaw);

          const targetCamX = carX - fwdX * dist + upX * height + shakeX;
          const targetCamY = carY - fwdY * dist + upY * height + shakeY;
          const targetCamZ = carZ - fwdZ * dist + upZ * height;

          const targetCamPos = new THREE.Vector3(targetCamX, targetCamY, targetCamZ);
          if (camera.position.distanceTo(targetCamPos) > 30.0) {
            camera.position.copy(targetCamPos);
          } else {
            camera.position.lerp(targetCamPos, 0.18);
          }
          camera.lookAt(carX + fwdX * 3.5, carY + fwdY * 3.5 + 0.3, carZ + fwdZ * 3.5);
        } else if (cameraPreset === 'cockpit') {
          controls.enabled = false;
          // 1st-person driver cabin view
          const eyeX = carX + Math.cos(yaw) * 0.2 + shakeX * 0.5;
          const eyeZ = carZ - Math.sin(yaw) * 0.2;
          camera.position.set(eyeX, carY + 0.88 + shakeY * 0.5, eyeZ);
          camera.lookAt(eyeX + Math.cos(yaw) * 30.0, carY + 0.82 - Math.sin(pitch) * 15.0, eyeZ - Math.sin(yaw) * 30.0);
        } else if (cameraPreset === 'top') {
          controls.enabled = false;
          // Top-down aerial drone view
          camera.position.lerp(new THREE.Vector3(carX, carY + 35.0, carZ), 0.12);
          camera.lookAt(carX, carY, carZ);
        } else if (cameraPreset === 'trafficSide') {
          controls.enabled = false;
          // Elevated 3/4 cinematic angle tracking Roadster leaping over traffic (matching reveal image)
          const targetCam = new THREE.Vector3(carX - 12.0 + shakeX, carY + 8.5 + shakeY, carZ + 14.0);
          camera.position.lerp(targetCam, 0.15);
          camera.lookAt(carX + 8.0, carY + 2.0, carZ - 1.0);
        } else if (cameraPreset === 'free') {
          controls.enabled = true;
          // Smoothly track vehicle so it never flies out of frame in free orbit mode
          const deltaOffset = new THREE.Vector3(carX, carY + 0.6, carZ).sub(controls.target);
          camera.position.add(deltaOffset);
          controls.target.set(carX, carY + 0.6, carZ);
          controls.update();
        }
      }

      renderer.render(scene, camera);

      // Trigger UI telemetry refresh
      setTick((t) => (t + 1) % 10000);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, [isPaused, cameraPreset]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070b13]">
      {/* 3D Interactive WebGL Canvas Viewport (Mouse Drag & Scroll Zoom Enabled) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Flight Engineering Lab Master Interface with Live Interactive Gaming Controls */}
      <FlightEngineeringLab
        vehicle={vehicle}
        cameraPreset={cameraPreset}
        onSelectCamera={setCameraPreset}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((p) => !p)}
        onSelectFlightStep={(stepIdx) => vehicle.setFlightSequenceStep(stepIdx)}
      />
    </div>
  );
};
