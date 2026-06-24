// Register the ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

// Grab the canvas element from your HTML
const canvas = document.getElementById("spider-canvas");
const context = canvas.getContext("2d");

// Ensure the canvas resolution matches the screen resolution to avoid blurriness
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Single unified resize handler for all three canvases
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame(spiderman.frame);

    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    renderFrame2(spiderman2.frame);

    canvas3.width = window.innerWidth;
    canvas3.height = window.innerHeight;
    renderFrame3(spiderman3.frame);
});


// We extracted exactly 52 frames from your video!
const frameCount = 50;

// This function creates the file path for each image (e.g., frames/0001.jpg)
const currentFrame = index => (
    `Assets/frames/${(index + 1).toString().padStart(4, '0')}.jpg`
);

// We need to preload all the images so they don't stutter when scrolling
const images = [];
const spiderman = {
    frame: 0 // We start at frame 0
};

for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
}

function renderFrame(index) {
    const img = images[index];

    // Safety check: don't draw if the image hasn't finished loading yet
    if (!img || !img.complete || img.naturalWidth === 0) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    // Switch to "contain" logic so the whole image fits on screen
    if (imgRatio > canvasRatio) {
        // Image is wider than the screen
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
    } else {
        // Image is taller than the screen
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
    }

    // --- ZOOM SETTING ---
    // Increase this number to zoom in! (e.g., 1.3 zooms in 30%)
    // This is perfect for hiding baked-in black bars from movie clips.
    const zoom = 1.35;

    drawWidth *= zoom;
    drawHeight *= zoom;

    // Recalculate offsets so the image stays perfectly centered
    offsetX = (canvas.width - drawWidth) / 2;
    offsetY = (canvas.height - drawHeight) / 2;

    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

// Draw the very first frame as soon as the first image loads
images[0].onload = function () {
    renderFrame(0);
};

// --- THE SCROLL ANIMATION ---
gsap.to(spiderman, {
    frame: frameCount - 1,   // Animate our object all the way to frame 203
    snap: "frame",           // Make sure we only use whole numbers (no half frames)
    ease: "none",
    scrollTrigger: {
        trigger: ".pagefour", // Start animating when we hit this section
        start: "top top",             // When the top of the section hits the top of the screen
        end: "+=120%",                // Make the scrolling area 1.5x the screen height
        scrub: 1,                     // Scrub smoothly (ties it directly to the scrollbar)
        pin: true                     // Pin the section so it freezes on screen while the video plays!
    },
    onUpdate: function () {
        // Every time you scroll, GSAP updates the 'frame' number and we draw the new image!
        renderFrame(spiderman.frame);
    }
});


// --- SECOND CANVAS ANIMATION (PAGE FIVE) ---

const canvas2 = document.getElementById("spider-canvas-2");
const context2 = canvas2.getContext("2d");

canvas2.width = window.innerWidth;
canvas2.height = window.innerHeight;


// Update this variable if you want a different number of frames for the second canvas
const frameCount2 = 204;

// Update this path if you extract frames to a different folder (e.g., frames5/)
const currentFrame2 = index => (
    `Assets/frames4/${(index + 1).toString().padStart(4, '0')}.jpg`
);

const images2 = [];
const spiderman2 = {
    frame: 0
};

for (let i = 0; i < frameCount2; i++) {
    const img = new Image();
    img.src = currentFrame2(i);
    images2.push(img);
}

function renderFrame2(index) {
    const img = images2[index];

    if (!img || !img.complete || img.naturalWidth === 0) return;

    context2.clearRect(0, 0, canvas2.width, canvas2.height);

    const canvasRatio = canvas2.width / canvas2.height;
    const imgRatio = img.width / img.height;

    let drawWidth = canvas2.width;
    let drawHeight = canvas2.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
        drawWidth = canvas2.width;
        drawHeight = img.height * (canvas2.width / img.width);
    } else {
        drawHeight = canvas2.height;
        drawWidth = img.width * (canvas2.height / img.height);
    }

    const zoom = 1.35;
    drawWidth *= zoom;
    drawHeight *= zoom;

    offsetX = (canvas2.width - drawWidth) / 2;
    offsetY = (canvas2.height - drawHeight) / 2;

    context2.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

images2[0].onload = function () {
    renderFrame2(0);
};

gsap.to(spiderman2, {
    frame: frameCount2 - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
        trigger: ".pagefive",
        start: "top top",
        end: "+=400%",
        scrub: 1,
        pin: true
    },
    onUpdate: function () {
        renderFrame2(spiderman2.frame);
    }
});


// --- THIRD CANVAS ANIMATION (PAGE FIVE) ---

const canvas3 = document.getElementById("title-canvas");
const context3 = canvas3.getContext("2d");

canvas3.width = window.innerWidth;
canvas3.height = window.innerHeight;


// Update this variable if you want a different number of frames for the second canvas
const frameCount3 = 545;

// Update this path if you extract frames to a different folder (e.g., frames5/)
const currentFrame3 = index => (
    `framesTitle/${(index + 1).toString().padStart(4, '0')}.jpg`
);

const images3 = [];
const spiderman3 = {
    frame: 0
};

for (let i = 0; i < frameCount3; i++) {
    const img = new Image();
    img.src = currentFrame3(i);
    images3.push(img);
}

function renderFrame3(index) {
    const img = images3[index];

    if (!img || !img.complete || img.naturalWidth === 0) return;

    context3.clearRect(0, 0, canvas3.width, canvas3.height);

    const canvasRatio = canvas3.width / canvas3.height;
    const imgRatio = img.width / img.height;

    let drawWidth = canvas3.width;
    let drawHeight = canvas3.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
        drawWidth = canvas3.width;
        drawHeight = img.height * (canvas3.width / img.width);
    } else {
        drawHeight = canvas3.height;
        drawWidth = img.width * (canvas3.height / img.height);
    }

    const zoom = 1.1;
    drawWidth *= zoom;
    drawHeight *= zoom;

    offsetX = (canvas3.width - drawWidth) / 2;
    offsetY = (canvas3.height - drawHeight) / 2;

    context3.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

images3[0].onload = function () {
    renderFrame3(0);
};

gsap.to(spiderman3, {
    frame: frameCount3 - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
        trigger: ".Title",
        start: "top top",
        end: "+=800%", // Increased from 400% to 800% to make it scroll twice as slowly
        scrub: 1,
        pin: true
    },
    onUpdate: function () {
        renderFrame3(spiderman3.frame);

        // Frame-based fade in/out for the title texts
        const titleText1 = document.querySelector(".title-text-1");
        const titleText2 = document.querySelector(".title-text-2");
        const titleText3 = document.querySelector(".title-text-3");
        const currentFrame = spiderman3.frame;

        if (titleText1) {
            let opacity = 0;
            // Frame 0030 corresponds to index 29. Frame 0079 is index 78. Frame 0083 is index 82.
            if (currentFrame >= 29 && currentFrame <= 33) {
                opacity = (currentFrame - 29) / 4;
            } else if (currentFrame > 33 && currentFrame <= 78) {
                opacity = 1;
            } else if (currentFrame > 78 && currentFrame <= 82) {
                opacity = 1 - ((currentFrame - 78) / 4);
            }
            titleText1.style.opacity = opacity;
        }

        if (titleText2) {
            let opacity = 0;
            // Frame 0113 corresponds to index 112. Frame 0262 corresponds to index 261.
            if (currentFrame >= 112 && currentFrame <= 116) {
                opacity = (currentFrame - 112) / 4;
            } else if (currentFrame > 116 && currentFrame <= 257) {
                opacity = 1;
            } else if (currentFrame > 257 && currentFrame <= 261) {
                opacity = 1 - ((currentFrame - 257) / 4);
            }
            titleText2.style.opacity = opacity;
        }

        if (titleText3) {
            let opacity = 0;
            // Frame 0287 corresponds to index 286. Frame 0384 corresponds to index 383.
            if (currentFrame >= 286 && currentFrame <= 290) {
                // Fade in from index 286 to 290
                opacity = (currentFrame - 286) / 4;
            } else if (currentFrame > 290 && currentFrame <= 379) {
                // Fully visible
                opacity = 1;
            } else if (currentFrame > 379 && currentFrame <= 383) {
                // Fade out from index 379 to complete fade out by frame 0384 (index 383)
                opacity = 1 - ((currentFrame - 379) / 4);
            }
            titleText3.style.opacity = opacity;
        }
    }
});

