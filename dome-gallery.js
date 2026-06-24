/**
 * DomeGallery — Vanilla JS conversion of the React DomeGallery component.
 * No React, no @use-gesture/react. Pure DOM + pointer events.
 */

(function () {
  // ─── Configuration ───
  const CONFIG = {
    images: [
      { src: 'Assets/pics/Tom.png', alt: 'Tom Holland' },
      { src: 'Assets/pics/zendaya.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/jacob.jpg', alt: 'Jacob Batalon' },
      { src: 'Assets/pics/sadie.jpeg', alt: 'Sadie Sink' },
      { src: 'Assets/pics/jon.jpg', alt: 'Jon Favreau' },
      { src: 'Assets/pics/mark.jpg', alt: 'Mark Webb' },
      { src: 'Assets/pics/sadie.jpg', alt: 'Sadie Sink Alt' },
      { src: 'Assets/pics/blackspidey.jpeg', alt: 'Black Suit Spider-Man' },
      { src: 'Assets/pics/nwh.jpg', alt: 'No Way Home' },
      { src: 'Assets/pics/brand.png', alt: 'Brand New Day' },
      { src: 'Assets/pics/Bnew.png', alt: 'Brand New' },
      { src: 'Assets/pics/sadie1.jpg', alt: 'Sadie' },
      { src: 'Assets/pics/sadie2.jpg', alt: 'Sadie' },
      { src: 'Assets/pics/sadie3.jpg', alt: 'Sadie' },
      { src: 'Assets/pics/sadie4.jpg', alt: 'Sadie' },
      { src: 'Assets/pics/sadie5.jpg', alt: 'Sadie' },
      { src: 'Assets/pics/sadie6.jpg', alt: 'Sadie' },
      { src: 'Assets/pics/sadie7.jpg', alt: 'Sadie' },
      { src: 'Assets/pics/sadie8.jpeg', alt: 'Sadie' },
      { src: 'Assets/pics/sadie9.jpg', alt: 'Sadie' },
      { src: 'Assets/pics/sadie10.jpg', alt: 'Sadie' },
      { src: 'Assets/pics/sadie.jpeg', alt: 'sadie' },
      { src: 'Assets/pics/tom1.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom2.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom3.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom4.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom5.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom6.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom7.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom8.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom9.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom10.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom11.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom12.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom13.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom14.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom15.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom16.jpg', alt: 'Tom' },
      { src: 'Assets/pics/tom17.jpg', alt: 'Tom' },
      { src: 'Assets/pics/MJ1.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/MJ2.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/MJ3.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/MJ4.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/MJ5.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/MJ6.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/MJ7.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/MJ8.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/MJ9.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/MJ10.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/MJ11.jpg', alt: 'Zendaya' },
      { src: 'Assets/pics/Hulk1.jpg', alt: 'Mark Ruffalo' },
      { src: 'Assets/pics/Hulk2.jpg', alt: 'Mark Ruffalo' },
      { src: 'Assets/pics/Hulk3.jpg', alt: 'Mark Ruffalo' },
      { src: 'Assets/pics/Hulk4.jpg', alt: 'Mark Ruffalo' },
      { src: 'Assets/pics/Hulk5.jpg', alt: 'Mark Ruffalo' },

    ],
    fit: 0.5,
    fitBasis: 'auto',
    minRadius: 600,
    maxRadius: Infinity,
    padFactor: 0.25,
    overlayBlurColor: '#000000',
    maxVerticalRotationDeg: 5,
    dragSensitivity: 20,
    enlargeTransitionMs: 300,
    segments: 35,
    dragDampening: 2,
    openedImageWidth: '400px',
    openedImageHeight: '400px',
    imageBorderRadius: '30px',
    openedImageBorderRadius: '30px',
    grayscale: true,
  };

  // ─── Utility functions ───
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const normalizeAngle = d => ((d % 360) + 360) % 360;
  const wrapAngleSigned = deg => {
    const a = (((deg + 180) % 360) + 360) % 360;
    return a - 180;
  };
  const getDataNumber = (el, name, fallback) => {
    const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
    const n = attr == null ? NaN : parseFloat(attr);
    return Number.isFinite(n) ? n : fallback;
  };

  // ─── Build the grid of image tiles ───
  function buildItems(pool, seg) {
    const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
    const evenYs = [-4, -2, 0, 2, 4];
    const oddYs = [-3, -1, 1, 3, 5];

    const coords = xCols.flatMap((x, c) => {
      const ys = c % 2 === 0 ? evenYs : oddYs;
      return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
    });

    const totalSlots = coords.length;
    if (pool.length === 0) return coords.map(c => ({ ...c, src: '', alt: '' }));

    const normalizedImages = pool.map(img =>
      typeof img === 'string' ? { src: img, alt: '' } : { src: img.src || '', alt: img.alt || '' }
    );

    const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

    // Deduplicate consecutive identical images
    for (let i = 1; i < usedImages.length; i++) {
      if (usedImages[i].src === usedImages[i - 1].src) {
        for (let j = i + 1; j < usedImages.length; j++) {
          if (usedImages[j].src !== usedImages[i].src) {
            [usedImages[i], usedImages[j]] = [usedImages[j], usedImages[i]];
            break;
          }
        }
      }
    }

    return coords.map((c, i) => ({ ...c, src: usedImages[i].src, alt: usedImages[i].alt }));
  }

  function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
    const unit = 360 / segments / 2;
    const rotateY = unit * (offsetX + (sizeX - 1) / 2);
    const rotateX = unit * (offsetY - (sizeY - 1) / 2);
    return { rotateX, rotateY };
  }

  // ─── State (replaces React refs) ───
  let rotation = { x: 0, y: 0 };
  let startRot = { x: 0, y: 0 };
  let startPos = null;
  let dragging = false;
  let moved = false;
  let inertiaRAF = null;
  let opening = false;
  let openStartedAt = 0;
  let lastDragEndAt = 0;
  let focusedEl = null;
  let originalTilePosition = null;
  let scrollLocked = false;
  let lockedRadius = null;

  // ─── DOM references ───
  let rootEl, mainEl, sphereEl, frameEl, viewerEl, scrimEl;

  // ─── Core functions ───
  function applyTransform(xDeg, yDeg) {
    if (sphereEl) {
      sphereEl.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  }

  function lockScroll() {
    if (scrollLocked) return;
    scrollLocked = true;
    document.body.classList.add('dg-scroll-lock');
  }

  function unlockScroll() {
    if (!scrollLocked) return;
    if (rootEl?.getAttribute('data-enlarging') === 'true') return;
    scrollLocked = false;
    document.body.classList.remove('dg-scroll-lock');
  }

  function stopInertia() {
    if (inertiaRAF) {
      cancelAnimationFrame(inertiaRAF);
      inertiaRAF = null;
    }
  }

  function startInertia(vx, vy) {
    const MAX_V = 1.4;
    let vX = clamp(vx, -MAX_V, MAX_V) * 80;
    let vY = clamp(vy, -MAX_V, MAX_V) * 80;
    let frames = 0;
    const d = clamp(CONFIG.dragDampening ?? 0.6, 0, 1);
    const frictionMul = 0.94 + 0.055 * d;
    const stopThreshold = 0.015 - 0.01 * d;
    const maxFrames = Math.round(90 + 270 * d);

    const step = () => {
      vX *= frictionMul;
      vY *= frictionMul;
      if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) { inertiaRAF = null; return; }
      if (++frames > maxFrames) { inertiaRAF = null; return; }
      const nextX = clamp(rotation.x - vY / 200, -CONFIG.maxVerticalRotationDeg, CONFIG.maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(rotation.y + vX / 200);
      rotation = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      inertiaRAF = requestAnimationFrame(step);
    };
    stopInertia();
    inertiaRAF = requestAnimationFrame(step);
  }

  // ─── Open / close image logic ───
  function openItemFromElement(el) {
    if (opening) return;
    opening = true;
    openStartedAt = performance.now();
    lockScroll();

    const parent = el.parentElement;
    focusedEl = el;
    el.setAttribute('data-focused', 'true');

    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX = getDataNumber(parent, 'sizeX', 2);
    const sizeY = getDataNumber(parent, 'sizeY', 2);
    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, CONFIG.segments);
    const parentY = normalizeAngle(parentRot.rotateY);
    const globalY = normalizeAngle(rotation.y);
    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;
    const rotX = -parentRot.rotateX - rotation.x;

    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

    const refDiv = document.createElement('div');
    refDiv.className = 'item__image item__image--reference';
    refDiv.style.opacity = '0';
    refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
    parent.appendChild(refDiv);
    void refDiv.offsetHeight;

    const tileR = refDiv.getBoundingClientRect();
    const mainR = mainEl.getBoundingClientRect();
    const frameR = frameEl.getBoundingClientRect();

    if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
      opening = false;
      focusedEl = null;
      parent.removeChild(refDiv);
      unlockScroll();
      return;
    }

    originalTilePosition = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
    el.style.visibility = 'hidden';
    el.style.zIndex = 0;

    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.position = 'absolute';
    overlay.style.left = frameR.left - mainR.left + 'px';
    overlay.style.top = frameR.top - mainR.top + 'px';
    overlay.style.width = frameR.width + 'px';
    overlay.style.height = frameR.height + 'px';
    overlay.style.opacity = '0';
    overlay.style.zIndex = '30';
    overlay.style.willChange = 'transform, opacity';
    overlay.style.transformOrigin = 'top left';
    overlay.style.transition = `transform ${CONFIG.enlargeTransitionMs}ms ease, opacity ${CONFIG.enlargeTransitionMs}ms ease`;

    const rawSrc = parent.dataset.src || el.querySelector('img')?.src || '';
    const img = document.createElement('img');
    img.src = rawSrc;
    overlay.appendChild(img);
    viewerEl.appendChild(overlay);

    const tx0 = tileR.left - frameR.left;
    const ty0 = tileR.top - frameR.top;
    const sx0 = tileR.width / frameR.width;
    const sy0 = tileR.height / frameR.height;
    const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
    const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;
    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;

    setTimeout(() => {
      if (!overlay.parentElement) return;
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
      rootEl.setAttribute('data-enlarging', 'true');
    }, 16);

    // Resize to custom opened dimensions
    const wantsResize = CONFIG.openedImageWidth || CONFIG.openedImageHeight;
    if (wantsResize) {
      const onFirstEnd = ev => {
        if (ev.propertyName !== 'transform') return;
        overlay.removeEventListener('transitionend', onFirstEnd);
        const prevTransition = overlay.style.transition;
        overlay.style.transition = 'none';
        const tempWidth = CONFIG.openedImageWidth || `${frameR.width}px`;
        const tempHeight = CONFIG.openedImageHeight || `${frameR.height}px`;
        overlay.style.width = tempWidth;
        overlay.style.height = tempHeight;
        const newRect = overlay.getBoundingClientRect();
        overlay.style.width = frameR.width + 'px';
        overlay.style.height = frameR.height + 'px';
        void overlay.offsetWidth;
        overlay.style.transition = `left ${CONFIG.enlargeTransitionMs}ms ease, top ${CONFIG.enlargeTransitionMs}ms ease, width ${CONFIG.enlargeTransitionMs}ms ease, height ${CONFIG.enlargeTransitionMs}ms ease`;
        const centeredLeft = frameR.left - mainR.left + (frameR.width - newRect.width) / 2;
        const centeredTop = frameR.top - mainR.top + (frameR.height - newRect.height) / 2;
        requestAnimationFrame(() => {
          overlay.style.left = `${centeredLeft}px`;
          overlay.style.top = `${centeredTop}px`;
          overlay.style.width = tempWidth;
          overlay.style.height = tempHeight;
        });
        const cleanupSecond = () => {
          overlay.removeEventListener('transitionend', cleanupSecond);
          overlay.style.transition = prevTransition;
        };
        overlay.addEventListener('transitionend', cleanupSecond, { once: true });
      };
      overlay.addEventListener('transitionend', onFirstEnd);
    }
  }

  function closeEnlargedImage() {
    if (performance.now() - openStartedAt < 250) return;
    const el = focusedEl;
    if (!el) return;

    const parent = el.parentElement;
    const overlay = viewerEl.querySelector('.enlarge');
    if (!overlay) return;

    const refDiv = parent.querySelector('.item__image--reference');
    const origPos = originalTilePosition;

    if (!origPos) {
      overlay.remove();
      if (refDiv) refDiv.remove();
      parent.style.setProperty('--rot-y-delta', '0deg');
      parent.style.setProperty('--rot-x-delta', '0deg');
      el.style.visibility = '';
      el.style.zIndex = 0;
      focusedEl = null;
      rootEl.removeAttribute('data-enlarging');
      opening = false;
      unlockScroll();
      return;
    }

    const currentRect = overlay.getBoundingClientRect();
    const rootRect = rootEl.getBoundingClientRect();

    const origRelRoot = {
      left: origPos.left - rootRect.left,
      top: origPos.top - rootRect.top,
      width: origPos.width,
      height: origPos.height,
    };
    const overlayRelRoot = {
      left: currentRect.left - rootRect.left,
      top: currentRect.top - rootRect.top,
      width: currentRect.width,
      height: currentRect.height,
    };

    const animOverlay = document.createElement('div');
    animOverlay.className = 'enlarge-closing';
    animOverlay.style.cssText = `position:absolute;left:${overlayRelRoot.left}px;top:${overlayRelRoot.top}px;width:${overlayRelRoot.width}px;height:${overlayRelRoot.height}px;z-index:9999;border-radius:var(--enlarge-radius,32px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${CONFIG.enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;`;

    const origImg = overlay.querySelector('img');
    if (origImg) {
      const clonedImg = origImg.cloneNode();
      clonedImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      animOverlay.appendChild(clonedImg);
    }

    overlay.remove();
    rootEl.appendChild(animOverlay);
    void animOverlay.getBoundingClientRect();

    requestAnimationFrame(() => {
      animOverlay.style.left = origRelRoot.left + 'px';
      animOverlay.style.top = origRelRoot.top + 'px';
      animOverlay.style.width = origRelRoot.width + 'px';
      animOverlay.style.height = origRelRoot.height + 'px';
      animOverlay.style.opacity = '0';
    });

    const cleanup = () => {
      animOverlay.remove();
      originalTilePosition = null;
      if (refDiv) refDiv.remove();
      parent.style.transition = 'none';
      el.style.transition = 'none';
      parent.style.setProperty('--rot-y-delta', '0deg');
      parent.style.setProperty('--rot-x-delta', '0deg');

      requestAnimationFrame(() => {
        el.style.visibility = '';
        el.style.opacity = '0';
        el.style.zIndex = 0;
        focusedEl = null;
        rootEl.removeAttribute('data-enlarging');

        requestAnimationFrame(() => {
          parent.style.transition = '';
          el.style.transition = 'opacity 300ms ease-out';
          requestAnimationFrame(() => {
            el.style.opacity = '1';
            setTimeout(() => {
              el.style.transition = '';
              el.style.opacity = '';
              opening = false;
              if (!dragging && rootEl.getAttribute('data-enlarging') !== 'true') {
                document.body.classList.remove('dg-scroll-lock');
              }
            }, 300);
          });
        });
      });
    };

    animOverlay.addEventListener('transitionend', cleanup, { once: true });
  }

  // ─── Tile click handler ───
  function onTileClick(e) {
    if (dragging) return;
    if (moved) return;
    if (performance.now() - lastDragEndAt < 80) return;
    if (opening) return;
    openItemFromElement(e.currentTarget);
  }

  // ─── Build the DOM ───
  function init() {
    const container = document.getElementById('dome-gallery-root');
    if (!container) return;

    const items = buildItems(CONFIG.images, CONFIG.segments);

    // Root
    rootEl = document.createElement('div');
    rootEl.className = 'sphere-root';
    rootEl.style.setProperty('--segments-x', CONFIG.segments);
    rootEl.style.setProperty('--segments-y', CONFIG.segments);
    rootEl.style.setProperty('--overlay-blur-color', CONFIG.overlayBlurColor);
    rootEl.style.setProperty('--tile-radius', CONFIG.imageBorderRadius);
    rootEl.style.setProperty('--enlarge-radius', CONFIG.openedImageBorderRadius);
    rootEl.style.setProperty('--image-filter', CONFIG.grayscale ? 'grayscale(1)' : 'none');

    // Main
    mainEl = document.createElement('main');
    mainEl.className = 'sphere-main';

    // Stage
    const stageEl = document.createElement('div');
    stageEl.className = 'stage';

    // Sphere
    sphereEl = document.createElement('div');
    sphereEl.className = 'sphere';

    // Items
    items.forEach((it, i) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';
      itemDiv.dataset.src = it.src;
      itemDiv.dataset.offsetX = it.x;
      itemDiv.dataset.offsetY = it.y;
      itemDiv.dataset.sizeX = it.sizeX;
      itemDiv.dataset.sizeY = it.sizeY;
      itemDiv.style.setProperty('--offset-x', it.x);
      itemDiv.style.setProperty('--offset-y', it.y);
      itemDiv.style.setProperty('--item-size-x', it.sizeX);
      itemDiv.style.setProperty('--item-size-y', it.sizeY);

      const imageDiv = document.createElement('div');
      imageDiv.className = 'item__image';
      imageDiv.setAttribute('role', 'button');
      imageDiv.setAttribute('tabindex', '0');
      imageDiv.setAttribute('aria-label', it.alt || 'Open image');
      imageDiv.addEventListener('click', onTileClick);

      const img = document.createElement('img');
      img.src = it.src;
      img.draggable = false;
      img.alt = it.alt;

      imageDiv.appendChild(img);
      itemDiv.appendChild(imageDiv);
      sphereEl.appendChild(itemDiv);
    });

    stageEl.appendChild(sphereEl);
    mainEl.appendChild(stageEl);

    // Overlays
    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'overlay';
    mainEl.appendChild(overlayDiv);

    const blurDiv = document.createElement('div');
    blurDiv.className = 'overlay overlay--blur';
    mainEl.appendChild(blurDiv);

    const edgeTop = document.createElement('div');
    edgeTop.className = 'edge-fade edge-fade--top';
    mainEl.appendChild(edgeTop);

    const edgeBottom = document.createElement('div');
    edgeBottom.className = 'edge-fade edge-fade--bottom';
    mainEl.appendChild(edgeBottom);

    // Viewer
    viewerEl = document.createElement('div');
    viewerEl.className = 'viewer';

    scrimEl = document.createElement('div');
    scrimEl.className = 'scrim';
    viewerEl.appendChild(scrimEl);

    frameEl = document.createElement('div');
    frameEl.className = 'frame';
    viewerEl.appendChild(frameEl);

    mainEl.appendChild(viewerEl);
    rootEl.appendChild(mainEl);
    container.appendChild(rootEl);

    // Apply initial transform
    applyTransform(rotation.x, rotation.y);

    // ─── Drag handling (replaces @use-gesture/react) ───
    let lastPointerX = 0, lastPointerY = 0, lastPointerTime = 0;
    let velocityX = 0, velocityY = 0;

    mainEl.addEventListener('pointerdown', (e) => {
      if (focusedEl) return;
      stopInertia();
      dragging = true;
      moved = false;
      startRot = { ...rotation };
      startPos = { x: e.clientX, y: e.clientY };
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastPointerTime = performance.now();
      velocityX = 0;
      velocityY = 0;
    });

    window.addEventListener('pointermove', (e) => {
      if (!dragging || !startPos || focusedEl) return;

      const dxTotal = e.clientX - startPos.x;
      const dyTotal = e.clientY - startPos.y;

      if (!moved) {
        const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
        if (dist2 > 16) moved = true;
      }

      // Track velocity
      const now = performance.now();
      const dt = now - lastPointerTime;
      if (dt > 0) {
        velocityX = (e.clientX - lastPointerX) / dt;
        velocityY = (e.clientY - lastPointerY) / dt;
      }
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastPointerTime = now;

      const nextX = clamp(
        startRot.x - dyTotal / CONFIG.dragSensitivity,
        -CONFIG.maxVerticalRotationDeg,
        CONFIG.maxVerticalRotationDeg
      );
      const nextY = wrapAngleSigned(startRot.y + dxTotal / CONFIG.dragSensitivity);

      if (rotation.x !== nextX || rotation.y !== nextY) {
        rotation = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
      }
    });

    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;

      if (Math.abs(velocityX) > 0.005 || Math.abs(velocityY) > 0.005) {
        startInertia(velocityX, velocityY);
      }

      if (moved) lastDragEndAt = performance.now();
      moved = false;
    });

    // ─── Scrim close + Escape key ───
    scrimEl.addEventListener('click', closeEnlargedImage);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeEnlargedImage();
    });

    // ─── ResizeObserver ───
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width), h = Math.max(1, cr.height);
      const minDim = Math.min(w, h), maxDim = Math.max(w, h), aspect = w / h;

      let basis;
      switch (CONFIG.fitBasis) {
        case 'min': basis = minDim; break;
        case 'max': basis = maxDim; break;
        case 'width': basis = w; break;
        case 'height': basis = h; break;
        default: basis = aspect >= 1.3 ? w : minDim;
      }

      let radius = basis * CONFIG.fit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, CONFIG.minRadius, CONFIG.maxRadius);
      lockedRadius = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * CONFIG.padFactor));
      rootEl.style.setProperty('--radius', `${lockedRadius}px`);
      rootEl.style.setProperty('--viewer-pad', `${viewerPad}px`);
      applyTransform(rotation.x, rotation.y);
    });
    ro.observe(rootEl);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
