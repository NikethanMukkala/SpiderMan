import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ═══════════════════════════════════════════
//  SUIT CONFIG — name + model path
// ═══════════════════════════════════════════
const SUITS = [
    { name: "HOMEMADE SUIT", path: "Assets/3d/homemade-optimized.glb" },
    { name: "STARK SUIT", path: "Assets/3d/suit-optimized.glb" },
    { name: "UPGRADED SUIT", path: "Assets/3d/upgraded-optimized.glb" },
    { name: "NIGHT MONKEY SUIT", path: "Assets/3d/monkey-optimized.glb", colorOverride: 0x111111 }, // Force black — optimization lost the material color
    { name: "INSIDE-OUT SUIT", path: "Assets/3d/insideout-optimized.glb", colorMultiplier: 0.3, roughnessOverride: 0.7 }, // Darken and reduce shine
    { name: "IRON SPIDEY", path: "Assets/3d/FrontSpidey-optimized.glb" },
    // { name: "CROSS SUIT",        path: "Assets/3d/cross-optimized.glb", roughnessOverride: 0.9, metalnessOverride: 0.1, envMapIntensityOverride: 0.1 }, // Kill metallic shine and reflection
    { name: "BRAND NEW DAY SUIT", path: "Assets/3d/BND2-optimized.glb" },
];

// ═══════════════════════════════════════════
//  RENDERER SETUP
// ═══════════════════════════════════════════
const canvas = document.getElementById("suits-canvas");
const w = canvas.clientWidth || window.innerWidth;
const h = canvas.clientHeight || window.innerHeight;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setClearColor(0x000000, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.6; // Darker, cinematic exposure
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ═══════════════════════════════════════════
//  SCENE
// ═══════════════════════════════════════════
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.03);

// Environment map for PBR reflections
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
const envMap = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envMap;
pmremGenerator.dispose();

// ═══════════════════════════════════════════
//  CAMERA
// ═══════════════════════════════════════════
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 1, 12);

// ═══════════════════════════════════════════
//  ORBIT CONTROLS (Interactive)
// ═══════════════════════════════════════════
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 22;
controls.target.set(0, 0, 0);
controls.autoRotate = false;
controls.autoRotateSpeed = 2.5;

// ═══════════════════════════════════════════
//  LIGHTING — dark, dramatic, cinematic
// ═══════════════════════════════════════════
const ambient = new THREE.AmbientLight(0x111133, 0.3); // Very dim cold fill
scene.add(ambient);

// Narrow overhead key light — like a single spotlight in a dark room
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(3, 12, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.bias = -0.0001;
scene.add(keyLight);

// Cold blue fill from the side — barely visible, just edge detail
const fillLight = new THREE.DirectionalLight(0x1144aa, 0.8);
fillLight.position.set(-8, 1, -3);
scene.add(fillLight);

// Deep red rim from behind — grazes the suit's back, not the floor
const rimLight = new THREE.DirectionalLight(0xff0022, 1.0);
rimLight.position.set(0, 15, -12); // High up so it hits shoulders/back, not the floor
scene.add(rimLight);

// Narrow overhead spot for a cone of light on the suit
const spotLight = new THREE.SpotLight(0xffffff, 120);
spotLight.position.set(0, 20, 2);
spotLight.angle = Math.PI / 12; // Tighter cone
spotLight.penumbra = 0.8;       // Soft edges
spotLight.decay = 2;
spotLight.distance = 40;
spotLight.castShadow = true;
scene.add(spotLight);

// Reflective floor
const floorMat = new THREE.MeshStandardMaterial({
    color: 0x050508,
    roughness: 0.18,    // Less mirror-like — stops bright light pools on the floor
    metalness: 0.85,
    transparent: true,
    opacity: 0.75,
    envMap,
    envMapIntensity: 0.8,
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -3.6;
floor.receiveShadow = true;
scene.add(floor);

// ═══════════════════════════════════════════
//  POST-PROCESSING
// ═══════════════════════════════════════════
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,   // strength  — stronger glow in the dark
    0.6,   // radius
    0.75   // threshold — only bright highlights glow
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ═══════════════════════════════════════════
//  LOADING BAR
// ═══════════════════════════════════════════
const loadingOverlay = document.getElementById("loading-overlay");
const barFill = document.getElementById("loading-bar-fill");
const barPercent = document.getElementById("loading-percent");

function updateLoadingBar(loaded, total) {
    const pct = Math.round((loaded / total) * 100);
    if (barFill) barFill.style.width = pct + "%";
    if (barPercent) barPercent.textContent = pct + "%";
    if (loaded === total && loadingOverlay) {
        setTimeout(() => loadingOverlay.classList.add("hidden"), 500);
    }
}

// ═══════════════════════════════════════════
//  LOAD ALL MODELS
// ═══════════════════════════════════════════
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

const wrappers = new Array(SUITS.length).fill(null);
let loadedCount = 0;

// Platform group — holds the currently visible model
const platform = new THREE.Group();
scene.add(platform);

SUITS.forEach((suit, index) => {
    loader.load(
        suit.path,
        (gltf) => {
            const model = gltf.scene;

            // Auto-center and auto-scale
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            model.position.copy(center).multiplyScalar(-1);

            const wrapper = new THREE.Group();
            wrapper.add(model);
            wrapper.scale.setScalar(6 / maxDim);
            wrapper.position.y = -0.3;
            wrapper.visible = false;

            // Fix materials for PBR
            model.traverse((child) => {
                if (child.isMesh) {
                    child.frustumCulled = false;
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        child.material.side = THREE.DoubleSide;
                        child.material.envMap = envMap;
                        child.material.envMapIntensity = suit.envMapIntensityOverride !== undefined ? suit.envMapIntensityOverride : 0.6;
                        if (child.material.roughness !== undefined) {
                            child.material.roughness = Math.max(child.material.roughness, 0.3);
                        }
                        if (suit.roughnessOverride !== undefined) {
                            child.material.roughness = suit.roughnessOverride;
                        }
                        if (suit.metalnessOverride !== undefined) {
                            child.material.metalness = suit.metalnessOverride;
                        }
                        // Apply color override if defined in SUITS config (e.g. monkey suit lost its black color after optimization)
                        if (suit.colorOverride !== undefined && child.material.color) {
                            child.material.color.setHex(suit.colorOverride);
                        }
                        // Multiply color if we want to darken the existing textures without losing variations
                        if (suit.colorMultiplier !== undefined && child.material.color) {
                            child.material.color.multiplyScalar(suit.colorMultiplier);
                        }
                        child.material.needsUpdate = true;
                    }
                }
            });

            // Fake floor reflection (flipped clone)
            const reflection = model.clone();
            reflection.scale.y = -1;
            reflection.position.y = -6;
            reflection.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material = child.material.clone();
                    child.material.opacity = 0.3;
                    child.material.transparent = true;
                    if (child.material.color) child.material.color.multiplyScalar(0.5);
                    child.castShadow = false;
                }
            });
            wrapper.add(reflection);

            wrappers[index] = wrapper;
            platform.add(wrapper);

            loadedCount++;
            updateLoadingBar(loadedCount, SUITS.length);

            // Show suit 0 as soon as it's ready
            if (index === currentIndex) {
                wrapper.visible = true;
            }
        },
        undefined,
        (err) => console.error(`Failed: ${suit.path}`, err)
    );
});

// ═══════════════════════════════════════════
//  NAVIGATION STATE
// ═══════════════════════════════════════════
let currentIndex = 0;

const suitName = document.getElementById("suit-name");
const suitCounter = document.getElementById("suit-counter");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnAutoRotate = document.getElementById("btn-autorotate");
const rotateLabel = document.getElementById("rotate-label");
const btnRotateMode = document.getElementById("btn-rotatemode");
const rotateModeLabel = document.getElementById("rotatemode-label");
const hintText = document.getElementById("hint-text");
const dotsContainer = document.getElementById("suit-dots");

// Build dot indicators
SUITS.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "suit-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
});

function getDots() {
    return dotsContainer.querySelectorAll(".suit-dot");
}

function updateUI() {
    // Counter
    suitCounter.textContent = `${currentIndex + 1} / ${SUITS.length}`;

    // Suit name with transition
    suitName.classList.add("transitioning");
    setTimeout(() => {
        suitName.textContent = SUITS[currentIndex].name;
        suitName.classList.remove("transitioning");
    }, 300);

    // Dots
    getDots().forEach((d, i) => d.classList.toggle("active", i === currentIndex));

    // Arrow disabled state
    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === SUITS.length - 1;
}

function goTo(index) {
    if (index === currentIndex) return;
    if (index < 0 || index >= SUITS.length) return;

    // Hide current
    if (wrappers[currentIndex]) wrappers[currentIndex].visible = false;

    currentIndex = index;

    // Show new (if loaded)
    if (wrappers[currentIndex]) {
        wrappers[currentIndex].visible = true;
        // Reset camera view on switch
        controls.reset();
        camera.position.set(0, 1, 12);
        controls.target.set(0, 0, 0);
    }

    updateUI();
}

btnPrev.addEventListener("click", () => goTo(currentIndex - 1));
btnNext.addEventListener("click", () => goTo(currentIndex + 1));

// Keyboard arrow navigation
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(currentIndex - 1);
    if (e.key === "ArrowRight") goTo(currentIndex + 1);
});

updateUI();

// ═══════════════════════════════════════════
//  AUTO-ROTATE TOGGLE
// ═══════════════════════════════════════════
btnAutoRotate.addEventListener("click", () => {
    controls.autoRotate = !controls.autoRotate;
    const isOn = controls.autoRotate;
    rotateLabel.textContent = `AUTO ROTATE: ${isOn ? "ON" : "OFF"}`;
    btnAutoRotate.classList.toggle("active", isOn);
});

// ═══════════════════════════════════════════
//  ROTATE MODE TOGGLE
// ═══════════════════════════════════════════
let modelOnlyMode = window.innerWidth <= 768; // Default to true on mobile

// Pointer state for manual model drag
let isDragging = false;
let prevPointer = { x: 0, y: 0 };

// Initialize default state
controls.enabled = !modelOnlyMode;
rotateModeLabel.textContent = modelOnlyMode ? "WITH BACKGROUND" : "MODEL ONLY";
if (modelOnlyMode) btnRotateMode.classList.add("active");
if (hintText) {
    hintText.textContent = modelOnlyMode
        ? "DRAG TO SPIN MODEL  ·  SWITCHING DISABLES CAMERA"
        : "DRAG TO ROTATE  ·  SCROLL TO ZOOM";
}

btnRotateMode.addEventListener("click", () => {
    modelOnlyMode = !modelOnlyMode;
    const label = modelOnlyMode ? "WITH BACKGROUND" : "MODEL ONLY";
    rotateModeLabel.textContent = label;
    btnRotateMode.classList.toggle("active", modelOnlyMode);

    // Enable/disable OrbitControls based on mode
    controls.enabled = !modelOnlyMode;

    // Reset the model's rotation when returning to WITH BACKGROUND mode
    if (!modelOnlyMode) {
        platform.rotation.set(0, 0, 0);
    }

    if (hintText) {
        hintText.textContent = modelOnlyMode
            ? "DRAG TO SPIN MODEL  ·  SWITCHING DISABLES CAMERA"
            : "DRAG TO ROTATE  ·  SCROLL TO ZOOM";
    }
});

// Manual drag — rotates only the platform group
canvas.addEventListener("pointerdown", (e) => {
    if (!modelOnlyMode) return;
    isDragging = true;
    prevPointer = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", (e) => {
    if (!modelOnlyMode || !isDragging) return;
    const dx = e.clientX - prevPointer.x;
    prevPointer = { x: e.clientX, y: e.clientY };

    // Horizontal drag only — model spins left/right, never up/down
    platform.rotation.y += dx * 0.01;
});

canvas.addEventListener("pointerup", () => { isDragging = false; });
canvas.addEventListener("pointerleave", () => { isDragging = false; });

// ═══════════════════════════════════════════
//  ANIMATION LOOP
// ═══════════════════════════════════════════
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Required for damping + auto-rotate
    composer.render();
}
animate();

// ═══════════════════════════════════════════
//  RESIZE
// ═══════════════════════════════════════════
window.addEventListener("resize", () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
});
