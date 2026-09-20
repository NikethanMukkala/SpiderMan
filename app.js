import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { initCircularGallery } from "./circular-gallery.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

console.log("Three.js loaded successfully!");

// ---------------------------------------------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    5000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("bg"),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // Reduced pixel ratio to fix lag with BloomPass
renderer.setClearColor(0x000000, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// Generate environment map for PBR metallic materials
// Without this, metallic surfaces reflect pure black and appear invisible
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene();
envScene.background = new THREE.Color(0x111111);
const envL1 = new THREE.DirectionalLight(0xffffff, 0.5);
envL1.position.set(1, 1, 1);
envScene.add(envL1);
const envL2 = new THREE.AmbientLight(0x222233, 0.4);
envScene.add(envL2);
const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
scene.environment = envMap;
pmremGenerator.dispose();

// Post-processing for Glow (Bloom)
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,  // strength
    0.8,  // radius
    0.3   // threshold
);
composer.addPass(bloomPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
dirLight1.position.set(5, 5, 5);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0x4488ff, 1.5);
dirLight2.position.set(-5, -3, -5);
scene.add(dirLight2);

// Load the optimized 3D GLB model
let spiderModel = null;
const spiderContainer = new THREE.Group();
scene.add(spiderContainer);

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

console.log("Starting to load optimized 3D model...");

loader.load(
    "Assets/Logo/SpideyLogo-optimized.glb",
    // onLoad
    (gltf) => {
        console.log("Model loaded successfully!");
        spiderModel = gltf.scene;

        // Compute bounding box to auto-center and auto-scale
        const box = new THREE.Box3().setFromObject(spiderModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Center the model at origin INSIDE the container
        spiderModel.position.copy(center).multiplyScalar(-1);
        spiderContainer.add(spiderModel);

        // Scale the container to fit nicely in camera view
        // If maxDim is weird (0 or infinity), fallback to 1
        let scale = 1;
        if (maxDim > 0 && isFinite(maxDim)) {
            scale = 3 / maxDim;
        }
        spiderContainer.scale.setScalar(scale);

        // Fix culling and normalize materials
        spiderModel.traverse((child) => {
            if (child.isMesh) {
                child.frustumCulled = false;

                if (child.geometry) {
                    child.geometry.computeBoundingBox();
                    child.geometry.computeBoundingSphere();
                }

                if (child.material) {
                    child.material.side = THREE.DoubleSide;
                    if (child.material.metalness !== undefined) {
                        child.material.metalness = Math.min(child.material.metalness, 0.4);
                    }
                    if (child.material.roughness !== undefined) {
                        child.material.roughness = Math.max(child.material.roughness, 0.5);
                    }
                    child.material.needsUpdate = true;
                }
            }
        });
    },
    // onProgress
    undefined,
    // onError
    (error) => {
        console.error("FAILED to load model:", error);
    }
);

let autoRotation = 0;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Add auto-rotation
    if (spiderContainer && spiderModel) {
        autoRotation += 0.009;
        spiderContainer.rotation.y = autoRotation;
    }

    // Use composer instead of renderer for post-processing effects
    composer.render();
}
animate();

// Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});



// Intersection Observer to trigger animations when scrolling to page two
const pageTwoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const h1 = entry.target.querySelector('h1');
            if (h1) {
                h1.classList.add('animate-fadein');
            }
            // Stop observing once the animation has been triggered
            pageTwoObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.4 }); // Triggers when 40% of the section is visible

const pageTwo = document.getElementById('pagetwo');
if (pageTwo) {
    pageTwoObserver.observe(pageTwo);

    // Split h1 text into individual spans for per-letter hover effects
    const h1Element = pageTwo.querySelector('h1');
    if (h1Element) {
        const text = h1Element.textContent;
        h1Element.innerHTML = '';
        for (let char of text) {
            if (char === ' ') {
                h1Element.appendChild(document.createTextNode(' '));
            } else {
                const span = document.createElement('span');
                span.textContent = char;
                h1Element.appendChild(span);
            }
        }
    }
}

// for grids on pagetwo
const cardsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('#card1, #card2, #card3, #card4');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animate-entry');
                }, index * 200); // 200ms delay between each card to create a staggered effect
            });
            cardsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

if (pageTwo) {
    cardsObserver.observe(pageTwo);
}

// Initialize CircularGallery on pagethree
const castContainer = document.querySelector('#pagethree .cast-container');
if (castContainer) {
    const castItems = [
        { image: 'Assets/Pics/Tom.png', text: 'Tom Holland' },
        { image: 'Assets/Pics/zendaya.jpg', text: 'Zendaya' },
        { image: 'Assets/Pics/jacob.jpg', text: 'Jacob Batalon' },
        { image: 'Assets/Pics/jon.jpg', text: 'Jon Bernthal' },
        { image: 'Assets/Pics/mark.jpg', text: 'Mark Ruffalo' },
        { image: 'Assets/Pics/sadie.jpg', text: 'Sadie Sink' }
    ];


    initCircularGallery(castContainer, {
        items: castItems,
        bend: 3,
        textColor: '#ffffff',
        borderRadius: 0.05,
        font: 'bold 30px "Cinzel", serif',
        scrollSpeed: 2,
        scrollEase: 0.05
    });
}

//Letter by letter animation at pagethree
const textElement = document.getElementById("bigtext2");
if (textElement) {
    const text = textElement.textContent;
    //original text out of html
    textElement.textContent = "";
    //Loop through every single letter
    text.split("").forEach((letter, index) => {
        const span = document.createElement("span");
        //Keep spaces as it is use letters
        span.textContent = letter === " " ? "\u00A0" : letter;
        //put wrapped text back
        textElement.appendChild(span);
    });
    // Now tell GSAP to animate them on scroll!
    gsap.to("#bigtext2 span", {
        color: 'red',
        stagger: 0.1,
        scrollTrigger: {
            trigger: ".pagefour",
            start: "top top",
            end: "+=120%",
            scrub: 1
        }
    });
}


//animation for peter parker at page5
const textElement3 = document.getElementById("bigtext3");
const textElement4 = document.getElementById("bigtext4");

if (textElement3 && textElement4) {
    const text3 = textElement3.textContent.trim();
    textElement3.textContent = "";
    text3.split("").forEach((letter) => {
        const span = document.createElement("span");
        span.textContent = letter === " " ? "\u00A0" : letter;
        span.style.opacity = "0";
        span.style.transform = "translateY(30px)";
        span.style.display = "inline-block";
        textElement3.appendChild(span);
    });

    const text4 = textElement4.textContent.trim();
    textElement4.textContent = "";
    text4.split("").forEach((letter) => {
        const span = document.createElement("span");
        span.textContent = letter === " " ? "\u00A0" : letter;
        span.style.opacity = "0";
        span.style.transform = "translateY(30px)";
        span.style.display = "inline-block";
        textElement4.appendChild(span);
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".pagefive",
            start: "top top",
            end: "+=120%",
            scrub: 1
        }
    });

    tl.to("#bigtext3 span", {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: "power2.out"
    })
        .to("#bigtext4 span", {
            opacity: 1,
            y: 0,
            color: 'red',
            stagger: 0.1,
            ease: "power2.out"
        }, "<20%");
}

