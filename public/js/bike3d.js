/**
 * Royal Enfield 3D Showroom Experience - Advanced High-Detail Model
 * Powered by Three.js & OrbitControls
 */

(function () {
  let scene, camera, renderer, controls;
  let bikeGroup, tankMesh, frontFenderMesh, rearFenderMesh, sideToolboxMesh, sideToolboxR;
  let headlightLight, headlightLens, headlightBeam, groundLightSpot;
  let isHeadlightOn = true;
  let currentBikeColor = '#181818'; // Stealth Black default
  let stagePlatform, stageDisc;
  let animationFrameId;

  const container = document.getElementById('canvasContainer');
  const canvas = document.getElementById('bikeCanvas');
  const loader = document.getElementById('stageLoader');

  // Materials Cache
  let paintMaterial, chromeMaterial, engineAlloyMaterial, darkEngineMaterial, rubberMaterial, glassMaterial, amberGlassMaterial, leatherMaterial, goldMaterial;

  function initMaterials() {
    // Automotive Deep Clearcoat Paint
    paintMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(currentBikeColor),
      metalness: 0.65,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95
    });

    // Mirror Finish Chrome
    chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.06
    });

    // Polished Engine Alloy
    engineAlloyMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8dadf,
      metalness: 0.85,
      roughness: 0.25
    });

    // Dark Matte Engine Cast
    darkEngineMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2024,
      metalness: 0.7,
      roughness: 0.45
    });

    // Tread Rubber
    rubberMaterial = new THREE.MeshStandardMaterial({
      color: 0x121215,
      metalness: 0.05,
      roughness: 0.9
    });

    // Headlight Lens Glass
    glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.9,
      transparent: true,
      opacity: 0.85
    });

    // Amber Turn Indicator Glass
    amberGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      metalness: 0.2,
      roughness: 0.15,
      transmission: 0.8,
      transparent: true,
      opacity: 0.9
    });

    // Saddle Ribbed Leather
    leatherMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e1c12, // Rich dark vintage brown leather
      roughness: 0.7,
      metalness: 0.12
    });

    // Pure Brass / Gold Emblem
    goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfa037,
      metalness: 0.92,
      roughness: 0.2
    });
  }

  function initThree() {
    // 1. Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0e, 0.04);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    camera.position.set(3.6, 1.6, 3.4);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    // 4. Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // restrict to showroom floor
    controls.minDistance = 2.0;
    controls.maxDistance = 6.0;
    controls.target.set(0, 0.75, 0);

    // 5. Lighting
    setupLighting();

    // 6. Stage & Platform
    buildShowroomStage();

    // 7. Build Royal Enfield High-Detail Model
    initMaterials();
    buildMotorcycle();

    // 8. Atmospheric Motes
    buildAtmosphericMotes();

    // Resize Handler
    window.addEventListener('resize', onWindowResize);

    // Hide Loader
    if (loader) {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 350);
    }

    animate();
  }

  function setupLighting() {
    // Soft Ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    // Studio Key Light (Warm Champagne Gold)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    keyLight.position.set(4.5, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    // Fill Light (Cool Metallic Cast)
    const fillLight = new THREE.DirectionalLight(0xcfd8eb, 1.6);
    fillLight.position.set(-4.5, 4.5, -3.5);
    scene.add(fillLight);

    // Rim Spotlight (Accentuating the classic fuel tank line)
    const rimLight = new THREE.SpotLight(0xe5a93c, 4.2, 14, Math.PI / 4, 0.4);
    rimLight.position.set(0, 5, -4.8);
    rimLight.target.position.set(0, 0.8, 0);
    scene.add(rimLight);
    scene.add(rimLight.target);

    // Front Showroom Floor Glow
    const floorGlow = new THREE.PointLight(0xe5a93c, 1.2, 5);
    floorGlow.position.set(0, 0.2, 2.2);
    scene.add(floorGlow);
  }

  function buildShowroomStage() {
    // Outer Stepped Turntable Base
    const stageGeo = new THREE.CylinderGeometry(2.35, 2.45, 0.14, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x121217,
      metalness: 0.8,
      roughness: 0.3
    });
    stagePlatform = new THREE.Mesh(stageGeo, stageMat);
    stagePlatform.position.y = -0.07;
    stagePlatform.receiveShadow = true;
    scene.add(stagePlatform);

    // Inner Mirror Finish Platter
    const discGeo = new THREE.CylinderGeometry(2.25, 2.25, 0.02, 64);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a24,
      metalness: 0.9,
      roughness: 0.15
    });
    stageDisc = new THREE.Mesh(discGeo, discMat);
    stageDisc.position.y = 0.005;
    stageDisc.receiveShadow = true;
    scene.add(stageDisc);

    // Outer Illuminated Brass LED Ring
    const ringGeo = new THREE.TorusGeometry(2.36, 0.018, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xe5a93c });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.002;
    scene.add(ringMesh);

    // Infinite Studio Floor
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070709,
      roughness: 0.92,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.075;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  function buildMotorcycle() {
    bikeGroup = new THREE.Group();

    const wheelRadius = 0.43;
    const rearWheelX = -0.88;
    const frontWheelX = 0.88;
    const wheelCenterY = wheelRadius;

    // Helper: High-Detail Spoke Wheel (36 spokes criss-cross + tread ribs + ByBre disc)
    function createDetailedWheel(isFront = false) {
      const wheel = new THREE.Group();

      // 1. Tire Main Donut
      const tireGeo = new THREE.TorusGeometry(wheelRadius, 0.075, 24, 64);
      const tire = new THREE.Mesh(tireGeo, rubberMaterial);
      tire.castShadow = true;
      tire.receiveShadow = true;
      wheel.add(tire);

      // Tread Grooves (Knobby Ridges along circumference)
      const treadRibGeo = new THREE.BoxGeometry(0.015, 0.012, 0.13);
      for (let t = 0; t < 36; t++) {
        const rib = new THREE.Mesh(treadRibGeo, rubberMaterial);
        const angle = (t / 36) * Math.PI * 2;
        rib.position.set(Math.cos(angle) * (wheelRadius + 0.068), Math.sin(angle) * (wheelRadius + 0.068), 0);
        rib.rotation.z = angle;
        wheel.add(rib);
      }

      // 2. High-Polished Chrome Rim
      const rimGeo = new THREE.TorusGeometry(wheelRadius - 0.05, 0.026, 16, 50);
      const rim = new THREE.Mesh(rimGeo, chromeMaterial);
      wheel.add(rim);

      // 3. Central Hub & Axle
      const hubGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.14, 24);
      const hub = new THREE.Mesh(hubGeo, chromeMaterial);
      hub.rotation.x = Math.PI / 2;
      wheel.add(hub);

      // 4. Criss-Cross 36 Spokes
      const spokeGeo = new THREE.CylinderGeometry(0.0028, 0.0028, (wheelRadius - 0.065) * 2, 6);
      for (let s = 0; s < 18; s++) {
        const spoke1 = new THREE.Mesh(spokeGeo, chromeMaterial);
        spoke1.rotation.z = (s * Math.PI) / 9 + 0.1;
        spoke1.rotation.x = 0.07;
        wheel.add(spoke1);

        const spoke2 = new THREE.Mesh(spokeGeo, chromeMaterial);
        spoke2.rotation.z = (s * Math.PI) / 9 - 0.1;
        spoke2.rotation.x = -0.07;
        wheel.add(spoke2);
      }

      // 5. Ventilated Disc Brake Rotor
      const discGeo = new THREE.RingGeometry(0.12, 0.28, 36);
      const disc = new THREE.Mesh(discGeo, chromeMaterial);
      disc.position.z = 0.06;
      wheel.add(disc);

      // 6. ByBre Gold Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(0.09, 0.13, 0.055);
      const caliper = new THREE.Mesh(caliperGeo, goldMaterial);
      caliper.position.set(isFront ? -0.16 : 0.16, 0.16, 0.075);
      wheel.add(caliper);

      return wheel;
    }

    // Rear & Front Wheels
    const rearWheel = createDetailedWheel(false);
    rearWheel.position.set(rearWheelX, wheelCenterY, 0);
    bikeGroup.add(rearWheel);

    const frontWheel = createDetailedWheel(true);
    frontWheel.position.set(frontWheelX, wheelCenterY, 0);
    bikeGroup.add(frontWheel);

    // ================= DOUBLE CRADLE CHASSIS =================
    const frameGroup = new THREE.Group();

    // Twin Down-Tubes
    const tubeGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.15, 14);
    const tubeL = new THREE.Mesh(tubeGeo, darkEngineMaterial);
    tubeL.rotation.z = Math.PI / 2.05;
    tubeL.position.set(-0.08, wheelCenterY - 0.09, 0.13);
    frameGroup.add(tubeL);

    const tubeR = tubeL.clone();
    tubeR.position.z = -0.13;
    frameGroup.add(tubeR);

    // Main Spine Backbone
    const backboneGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.05, 14);
    const backbone = new THREE.Mesh(backboneGeo, darkEngineMaterial);
    backbone.rotation.z = Math.PI / 2.28;
    backbone.position.set(0.12, 0.79, 0);
    frameGroup.add(backbone);

    // Tubular Swingarm with Pivot
    const swingarmGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.78, 12);
    const swingL = new THREE.Mesh(swingarmGeo, darkEngineMaterial);
    swingL.rotation.z = Math.PI / 2.12;
    swingL.position.set(-0.48, wheelCenterY, 0.11);
    frameGroup.add(swingL);

    const swingR = swingL.clone();
    swingR.position.z = -0.11;
    frameGroup.add(swingR);

    // Twin Rear Gas Shocks with Golden Reservoirs & Chrome Springs
    function createRearShock(zPos) {
      const shock = new THREE.Group();
      // Main Body
      const bGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.42, 12);
      const bMesh = new THREE.Mesh(bGeo, chromeMaterial);
      shock.add(bMesh);

      // Gold Top Nitrogen Piggyback Reservoir
      const resGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.12, 14);
      const resMesh = new THREE.Mesh(resGeo, goldMaterial);
      resMesh.position.set(-0.04, 0.14, 0);
      shock.add(resMesh);

      // Coiled Spring
      const coilGeo = new THREE.TorusGeometry(0.034, 0.008, 12, 32);
      for (let c = -0.14; c <= 0.14; c += 0.038) {
        const coil = new THREE.Mesh(coilGeo, chromeMaterial);
        coil.rotation.x = Math.PI / 2;
        coil.position.y = c;
        shock.add(coil);
      }

      shock.rotation.z = -0.46;
      shock.position.set(-0.64, 0.64, zPos);
      return shock;
    }
    frameGroup.add(createRearShock(0.15));
    frameGroup.add(createRearShock(-0.15));

    bikeGroup.add(frameGroup);

    // ================= ROYAL ENFIELD 349cc J-SERIES ENGINE =================
    const engineGroup = new THREE.Group();

    // 1. Lower Crankcase Block
    const crankcaseGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.32, 28);
    const crankcase = new THREE.Mesh(crankcaseGeo, darkEngineMaterial);
    crankcase.rotation.x = Math.PI / 2;
    crankcase.position.set(0.02, 0.45, 0);
    crankcase.castShadow = true;
    engineGroup.add(crankcase);

    // 2. High-Polished Chrome Clutch Inspection Cover (Right Side)
    const clutchCoverGeo = new THREE.CylinderGeometry(0.155, 0.155, 0.04, 28);
    const clutchCover = new THREE.Mesh(clutchCoverGeo, engineAlloyMaterial);
    clutchCover.rotation.x = Math.PI / 2;
    clutchCover.position.set(0.02, 0.45, 0.165);
    engineGroup.add(clutchCover);

    // Brass RE Medallion on Crankcase
    const reBadge = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.046, 24), goldMaterial);
    reBadge.rotation.x = Math.PI / 2;
    reBadge.position.set(0.02, 0.45, 0.168);
    engineGroup.add(reBadge);

    // Left Magneto Stator Cover with Chrome Cap
    const magnetoCover = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 28), engineAlloyMaterial);
    magnetoCover.rotation.x = Math.PI / 2;
    magnetoCover.position.set(0.02, 0.45, -0.165);
    engineGroup.add(magnetoCover);

    // 3. Upright Single Cylinder with Distinct Cooling Fins
    const cylinderGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.28, 24);
    const cylinder = new THREE.Mesh(cylinderGeo, darkEngineMaterial);
    cylinder.position.set(0.04, 0.68, 0);
    engineGroup.add(cylinder);

    // Stack of 9 Machined Aluminium Cooling Fins
    const finGeo = new THREE.CylinderGeometry(0.155, 0.155, 0.009, 24);
    for (let f = 0; f < 9; f++) {
      const fin = new THREE.Mesh(finGeo, engineAlloyMaterial);
      fin.position.set(0.04, 0.58 + f * 0.028, 0);
      engineGroup.add(fin);
    }

    // 4. Cylinder Head & Rocker Cover
    const headGeo = new THREE.BoxGeometry(0.26, 0.11, 0.24);
    const head = new THREE.Mesh(headGeo, chromeMaterial);
    head.position.set(0.04, 0.84, 0);
    engineGroup.add(head);

    // 5. Polished Chrome Pushrod Tube
    const pushrodGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.35, 12);
    const pushrod = new THREE.Mesh(pushrodGeo, chromeMaterial);
    pushrod.position.set(0.13, 0.69, 0.115);
    engineGroup.add(pushrod);

    // Spark Plug with Red Performance Cable
    const plugGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 10);
    const plug = new THREE.Mesh(plugGeo, chromeMaterial);
    plug.rotation.z = 0.6;
    plug.position.set(0.05, 0.89, -0.06);
    engineGroup.add(plug);

    // Starter Motor
    const starterGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.15, 18);
    const starter = new THREE.Mesh(starterGeo, darkEngineMaterial);
    starter.rotation.z = Math.PI / 2;
    starter.position.set(-0.14, 0.48, 0);
    engineGroup.add(starter);

    bikeGroup.add(engineGroup);

    // ================= EXHAUST SYSTEM (Swept Header & Peashooter) =================
    const exhaustGroup = new THREE.Group();

    // Sweeping Chrome Header Pipe
    const headerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.15, 0.74, 0.06),
      new THREE.Vector3(0.32, 0.64, 0.13),
      new THREE.Vector3(0.34, 0.32, 0.16),
      new THREE.Vector3(0.02, 0.24, 0.18),
      new THREE.Vector3(-0.38, 0.24, 0.19)
    ]);
    const headerGeo = new THREE.TubeGeometry(headerCurve, 32, 0.028, 14, false);
    const headerPipe = new THREE.Mesh(headerGeo, chromeMaterial);
    headerPipe.castShadow = true;
    exhaustGroup.add(headerPipe);

    // Tapered Peashooter Silencer / Muffler with Chrome Heat Shield
    const silencerGeo = new THREE.CylinderGeometry(0.048, 0.032, 0.88, 24);
    const silencer = new THREE.Mesh(silencerGeo, chromeMaterial);
    silencer.rotation.z = Math.PI / 2.06;
    silencer.rotation.y = -0.04;
    silencer.position.set(-0.80, 0.27, 0.21);
    silencer.castShadow = true;
    exhaustGroup.add(silencer);

    // Slotted Heat Guard on Exhaust
    const guardGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.28, 14, 1, true, 0, Math.PI);
    const guard = new THREE.Mesh(guardGeo, chromeMaterial);
    guard.rotation.z = Math.PI / 2;
    guard.position.set(0.12, 0.24, 0.19);
    exhaustGroup.add(guard);

    bikeGroup.add(exhaustGroup);

    // ================= SCULPTED TEARDROP FUEL TANK =================
    const tankGeo = new THREE.SphereGeometry(0.28, 36, 28);
    tankGeo.scale(1.75, 0.95, 0.96);
    tankMesh = new THREE.Mesh(tankGeo, paintMaterial);
    tankMesh.position.set(0.25, 0.93, 0);
    tankMesh.castShadow = true;
    bikeGroup.add(tankMesh);

    // Chrome Monza-Style Filler Cap
    const capGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.022, 24);
    const tankCap = new THREE.Mesh(capGeo, chromeMaterial);
    tankCap.position.set(0.31, 1.07, 0);
    bikeGroup.add(tankCap);

    // Handcrafted Winged Royal Enfield Tank Badges (Left & Right)
    const badgeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.012, 28);
    const badgeL = new THREE.Mesh(badgeGeo, goldMaterial);
    badgeL.rotation.x = Math.PI / 2;
    badgeL.position.set(0.25, 0.94, 0.255);
    bikeGroup.add(badgeL);

    const badgeR = badgeL.clone();
    badgeR.position.z = -0.255;
    bikeGroup.add(badgeR);

    // Ribbed Rubber Knee Pads
    const padGeo = new THREE.BoxGeometry(0.24, 0.13, 0.018);
    const padL = new THREE.Mesh(padGeo, rubberMaterial);
    padL.position.set(0.12, 0.92, 0.258);
    bikeGroup.add(padL);

    const padR = padL.clone();
    padR.position.z = -0.258;
    bikeGroup.add(padR);

    // ================= OVAL SIDE TOOLBOXES (Classic 350 Battery Box) =================
    const toolboxGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.065, 24);
    sideToolboxMesh = new THREE.Mesh(toolboxGeo, paintMaterial);
    sideToolboxMesh.rotation.x = Math.PI / 2;
    sideToolboxMesh.position.set(-0.25, 0.65, 0.145);
    sideToolboxMesh.castShadow = true;
    bikeGroup.add(sideToolboxMesh);

    sideToolboxR = sideToolboxMesh.clone();
    sideToolboxR.position.z = -0.145;
    bikeGroup.add(sideToolboxR);

    // Chrome Keyhole on Toolbox
    const keyhole = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.07, 12), chromeMaterial);
    keyhole.rotation.x = Math.PI / 2;
    keyhole.position.set(-0.25, 0.65, 0.155);
    bikeGroup.add(keyhole);

    // ================= DEEP VALENCE FENDERS =================
    // Front Fender with Gold Pinstripe Beading
    const frontFenderGeo = new THREE.CylinderGeometry(wheelRadius + 0.055, wheelRadius + 0.055, 0.15, 32, 1, true, -Math.PI / 3, Math.PI / 1.45);
    frontFenderMesh = new THREE.Mesh(frontFenderGeo, paintMaterial);
    frontFenderMesh.rotation.z = Math.PI / 2;
    frontFenderMesh.position.set(frontWheelX, wheelCenterY, 0);
    frontFenderMesh.castShadow = true;
    bikeGroup.add(frontFenderMesh);

    // Chrome Mudguard Stay Struts
    const stayGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.44, 8);
    const stayL = new THREE.Mesh(stayGeo, chromeMaterial);
    stayL.position.set(frontWheelX - 0.08, wheelCenterY + 0.14, 0.1);
    stayL.rotation.z = 0.4;
    bikeGroup.add(stayL);

    // Rear Fender
    const rearFenderGeo = new THREE.CylinderGeometry(wheelRadius + 0.055, wheelRadius + 0.055, 0.18, 32, 1, true, -Math.PI / 3.8, Math.PI / 1.15);
    rearFenderMesh = new THREE.Mesh(rearFenderGeo, paintMaterial);
    rearFenderMesh.rotation.z = Math.PI / 2;
    rearFenderMesh.position.set(rearWheelX, wheelCenterY, 0);
    rearFenderMesh.castShadow = true;
    bikeGroup.add(rearFenderMesh);

    // ================= FRONT FORKS & CASQUETTE HEADLIGHT =================
    const forkGroup = new THREE.Group();

    // Telescopic Stanchions
    const forkGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.88, 16);
    const forkL = new THREE.Mesh(forkGeo, chromeMaterial);
    forkL.position.set(0, 0, 0.12);
    forkGroup.add(forkL);

    const forkR = forkL.clone();
    forkR.position.z = -0.12;
    forkGroup.add(forkR);

    // Rubber Accordion Gaiter Boots
    const gaiterGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.29, 16);
    const gaiterL = new THREE.Mesh(gaiterGeo, rubberMaterial);
    gaiterL.position.set(0, -0.12, 0.12);
    forkGroup.add(gaiterL);

    const gaiterR = gaiterL.clone();
    gaiterR.position.z = -0.12;
    forkGroup.add(gaiterR);

    // Royal Enfield Casquette (Headlamp Shell with hooded peak/visor)
    const casquetteGeo = new THREE.CylinderGeometry(0.105, 0.07, 0.16, 28);
    const casquette = new THREE.Mesh(casquetteGeo, chromeMaterial);
    casquette.rotation.z = Math.PI / 2;
    casquette.position.set(0.07, 0.36, 0);
    forkGroup.add(casquette);

    // Chrome Peak / Visor over headlight
    const visorGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.05, 24, 1, true, -Math.PI / 3, Math.PI / 1.5);
    const visor = new THREE.Mesh(visorGeo, chromeMaterial);
    visor.rotation.z = Math.PI / 2;
    visor.position.set(0.12, 0.38, 0);
    forkGroup.add(visor);

    // Round Glass Lens with Warm Emissive Glow
    const lensGeo = new THREE.SphereGeometry(0.098, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    headlightLens = new THREE.Mesh(lensGeo, glassMaterial);
    headlightLens.rotation.z = -Math.PI / 2;
    headlightLens.position.set(0.14, 0.36, 0);
    headlightLens.material.emissive = new THREE.Color(0xfff3c8);
    headlightLens.material.emissiveIntensity = 0.85;
    forkGroup.add(headlightLens);

    // Realistic Spotlight Beam
    headlightLight = new THREE.SpotLight(0xfff3d0, 4.5, 12, Math.PI / 5.5, 0.35, 1.2);
    headlightLight.position.set(0.18, 0.36, 0);
    headlightLight.target.position.set(4.5, 0.2, 0);
    forkGroup.add(headlightLight);
    forkGroup.add(headlightLight.target);

    // Amber Bullet Front Turn Indicators
    function createTurnSignal(zPos) {
      const sig = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 10), chromeMaterial);
      stem.rotation.x = Math.PI / 2;
      sig.add(stem);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.024, 16, 12), amberGlassMaterial);
      bulb.position.z = zPos > 0 ? 0.04 : -0.04;
      sig.add(bulb);
      return sig;
    }
    const sigL = createTurnSignal(1);
    sigL.position.set(0.06, 0.33, 0.18);
    forkGroup.add(sigL);

    const sigR = createTurnSignal(-1);
    sigR.position.set(0.06, 0.33, -0.18);
    forkGroup.add(sigR);

    forkGroup.rotation.z = -0.38; // Royal Enfield rake angle ~26°
    forkGroup.position.set(0.70, 0.73, 0);
    bikeGroup.add(forkGroup);

    // ================= SWEPT HANDLEBARS & RETRO COCKPIT =================
    const handleGroup = new THREE.Group();

    // Chrome Bar
    const barGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.78, 18);
    const bar = new THREE.Mesh(barGeo, chromeMaterial);
    bar.rotation.x = Math.PI / 2;
    handleGroup.add(bar);

    // Rubber Grips with Diamond Texture
    const gripGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.125, 16);
    const gripL = new THREE.Mesh(gripGeo, rubberMaterial);
    gripL.rotation.x = Math.PI / 2;
    gripL.position.z = 0.32;
    handleGroup.add(gripL);

    const gripR = gripL.clone();
    gripR.position.z = -0.32;
    handleGroup.add(gripR);

    // Levers (Clutch & Front Brake)
    const leverGeo = new THREE.BoxGeometry(0.12, 0.012, 0.016);
    const leverL = new THREE.Mesh(leverGeo, chromeMaterial);
    leverL.position.set(0.05, -0.02, 0.28);
    leverL.rotation.y = 0.2;
    handleGroup.add(leverL);

    const leverR = leverL.clone();
    leverR.position.z = -0.28;
    leverR.rotation.y = -0.2;
    handleGroup.add(leverR);

    // Round Chrome Stem Mirrors
    function createMirror(zPos) {
      const m = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.15, 8), chromeMaterial);
      stem.position.y = 0.08;
      m.add(stem);

      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.012, 24), chromeMaterial);
      head.rotation.x = Math.PI / 2;
      head.position.set(0, 0.15, 0);
      m.add(head);

      const mirrorFace = new THREE.Mesh(new THREE.CircleGeometry(0.044, 24), glassMaterial);
      mirrorFace.position.set(0, 0.15, zPos > 0 ? -0.007 : 0.007);
      if (zPos < 0) mirrorFace.rotation.y = Math.PI;
      m.add(mirrorFace);

      m.position.set(-0.02, 0.04, zPos);
      return m;
    }
    handleGroup.add(createMirror(0.28));
    handleGroup.add(createMirror(-0.28));

    // Integrated Analogue Speedometer Console with Dial
    const consoleGeo = new THREE.CylinderGeometry(0.06, 0.052, 0.045, 28);
    const consoleMesh = new THREE.Mesh(consoleGeo, chromeMaterial);
    consoleMesh.position.set(0.03, 0.045, 0);
    handleGroup.add(consoleMesh);

    // Glowing Speedometer Face
    const dialGeo = new THREE.CircleGeometry(0.055, 28);
    const dialMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.rotation.x = -Math.PI / 2;
    dial.position.set(0.03, 0.069, 0);
    handleGroup.add(dial);

    // Needle
    const needleGeo = new THREE.BoxGeometry(0.004, 0.035, 0.002);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.rotation.x = -Math.PI / 2;
    needle.rotation.z = 0.8;
    needle.position.set(0.03, 0.071, 0);
    handleGroup.add(needle);

    handleGroup.position.set(0.55, 1.10, 0);
    bikeGroup.add(handleGroup);

    // ================= RIBBED LEATHER SEATS =================
    // Rider Contoured Saddle
    const riderSeatGeo = new THREE.BoxGeometry(0.40, 0.095, 0.33);
    riderSeatGeo.scale(1, 0.85, 1);
    const riderSeat = new THREE.Mesh(riderSeatGeo, leatherMaterial);
    riderSeat.position.set(-0.16, 0.83, 0);
    riderSeat.castShadow = true;
    bikeGroup.add(riderSeat);

    // Pillion Saddle
    const pillionSeatGeo = new THREE.BoxGeometry(0.32, 0.075, 0.23);
    const pillionSeat = new THREE.Mesh(pillionSeatGeo, leatherMaterial);
    pillionSeat.position.set(-0.54, 0.85, 0);
    pillionSeat.castShadow = true;
    bikeGroup.add(pillionSeat);

    // Chrome Pillion Grab Rail
    const railGeo = new THREE.TorusGeometry(0.125, 0.013, 14, 28, Math.PI);
    const grabRail = new THREE.Mesh(railGeo, chromeMaterial);
    grabRail.rotation.y = Math.PI / 2;
    grabRail.position.set(-0.73, 0.89, 0);
    bikeGroup.add(grabRail);

    // Classic Red Bullet Taillight
    const tailLightGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.06, 18);
    const tailLight = new THREE.Mesh(tailLightGeo, new THREE.MeshStandardMaterial({
      color: 0xd62828,
      emissive: 0x9b1b1b,
      roughness: 0.2
    }));
    tailLight.rotation.z = Math.PI / 2;
    tailLight.position.set(-0.88, 0.72, 0);
    bikeGroup.add(tailLight);

    // Number Plate Bracket
    const plateGeo = new THREE.BoxGeometry(0.02, 0.08, 0.20);
    const plate = new THREE.Mesh(plateGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    plate.position.set(-0.91, 0.63, 0);
    bikeGroup.add(plate);

    // Center Stand
    const standGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.39, 12);
    const stand = new THREE.Mesh(standGeo, darkEngineMaterial);
    stand.rotation.z = -0.15;
    stand.position.set(-0.25, 0.18, 0.12);
    bikeGroup.add(stand);

    scene.add(bikeGroup);
  }

  function buildAtmosphericMotes() {
    const particleCount = 70;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 7;
      positions[i + 1] = Math.random() * 2.8 + 0.1;
      positions[i + 2] = (Math.random() - 0.5) * 7;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xe5a93c,
      size: 0.022,
      transparent: true,
      opacity: 0.4
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function onWindowResize() {
    if (!container || !camera || !renderer) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function tweenCamera(targetPos, targetLookAt, duration = 1100) {
    const startPos = camera.position.clone();
    const startLook = controls.target.clone();
    const startTime = performance.now();

    function updateCam(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      camera.position.lerpVectors(startPos, targetPos, ease);
      controls.target.lerpVectors(startLook, targetLookAt, ease);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(updateCam);
      }
    }
    requestAnimationFrame(updateCam);
  }

  // Render Loop
  let clock = new THREE.Clock();
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Gentle slow turntable rotation when not dragging
    if (controls && !controls.state == -1 && !controls.isInteracting) {
      if (stagePlatform) stagePlatform.rotation.y += delta * 0.045;
      if (stageDisc) stageDisc.rotation.y += delta * 0.045;
      if (bikeGroup) bikeGroup.rotation.y += delta * 0.045;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  // PUBLIC EXPOSED CONTROLLER
  window.reBike3D = {
    setColor: function (hexColor) {
      currentBikeColor = hexColor;
      if (paintMaterial) {
        paintMaterial.color.set(hexColor);
      }
    },

    toggleHeadlight: function () {
      isHeadlightOn = !isHeadlightOn;
      if (headlightLight) {
        headlightLight.intensity = isHeadlightOn ? 4.5 : 0;
      }
      if (headlightLens) {
        headlightLens.material.emissiveIntensity = isHeadlightOn ? 0.85 : 0;
      }
      return isHeadlightOn;
    },

    setCameraPreset: function (presetName) {
      if (presetName === 'side') {
        tweenCamera(new THREE.Vector3(0, 0.95, 3.2), new THREE.Vector3(0, 0.7, 0));
      } else if (presetName === 'cockpit') {
        tweenCamera(new THREE.Vector3(0.12, 1.42, 0.42), new THREE.Vector3(0.68, 0.95, 0));
      } else if (presetName === 'engine') {
        tweenCamera(new THREE.Vector3(0.38, 0.62, 1.4), new THREE.Vector3(0.04, 0.55, 0));
      } else if (presetName === 'front') {
        tweenCamera(new THREE.Vector3(3.2, 1.05, 0), new THREE.Vector3(0, 0.7, 0));
      } else {
        // Orbit default
        tweenCamera(new THREE.Vector3(3.6, 1.6, 3.4), new THREE.Vector3(0, 0.75, 0));
      }
    },

    resetRotation: function () {
      if (bikeGroup) bikeGroup.rotation.y = 0;
      if (stagePlatform) stagePlatform.rotation.y = 0;
      if (stageDisc) stageDisc.rotation.y = 0;
      this.setCameraPreset('orbit');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }
})();
