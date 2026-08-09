(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const DESIGN_WIDTH = 1728;
  const SCALE_MIN_WIDTH = 1280;
  const TABLET_DESIGN_WIDTH = 768;
  const TABLET_MAX_WIDTH = 1279;
  const MOBILE_DESIGN_WIDTH = 390;

  const AMPERSAND_STATES = [
    { label: "Riottosa Regular Condensed", wght: 0, wdth: 0 },
    { label: "Riottosa Bold Condensed", wght: 100, wdth: 0 },
    { label: "Riottosa Bold Wide", wght: 100, wdth: 100 },
    { label: "Riottosa Regular Wide", wght: 0, wdth: 100 },
  ];

  const AMPERSAND_STATIC = AMPERSAND_STATES[2];
  const TRANSITION_MS = 1200;
  const PAUSE_MS = 650;

  function duplicateLine(track) {
    const line = track.querySelector(".marquee-line");
    if (!line || track.dataset.duplicated === "true") return line;
    track.append(line.cloneNode(true));
    track.dataset.duplicated = "true";
    return line;
  }

  function prepareMarquee(clip) {
    const track = clip.querySelector(".marquee-track");
    if (!track) return;

    const line = duplicateLine(track);
    if (!line) return;

    // Use layout width (pre-transform) so marquee distance stays correct when the stage scales
    const distance = line.offsetWidth;
    if (!distance) return;

    const speed = clip.dataset.marquee === "phrase" ? 90 : 120;
    const duration = Math.max(18, distance / speed);

    track.style.setProperty("--marquee-distance", `${distance}px`);
    track.style.setProperty("--marquee-duration", `${duration}s`);

    if (!reducedMotion.matches) {
      track.classList.add("is-ready");
    } else {
      track.classList.remove("is-ready");
    }
  }

  function initMarquees() {
    document.querySelectorAll("[data-marquee]").forEach(prepareMarquee);
  }

  let ampersandAnimation = null;
  let ampersandRunning = false;

  function applyAmpersandState(glyph, styleEl, values, label) {
    glyph.style.fontVariationSettings = `"wght" ${values.wght}, "wdth" ${values.wdth}`;
    if (label) styleEl.textContent = label;
  }

  function stopAmpersandAnimation() {
    ampersandRunning = false;
    if (ampersandAnimation) {
      ampersandAnimation.pause();
      ampersandAnimation = null;
    }
  }

  function initAmpersandAnimation() {
    const glyph = document.querySelector(".ampersand__glyph");
    const styleEl = document.querySelector(".ampersand__style");
    if (!glyph || !styleEl || typeof anime === "undefined") return;

    stopAmpersandAnimation();

    if (reducedMotion.matches) {
      applyAmpersandState(
        glyph,
        styleEl,
        AMPERSAND_STATIC,
        AMPERSAND_STATIC.label
      );
      return;
    }

    const values = {
      wght: AMPERSAND_STATES[0].wght,
      wdth: AMPERSAND_STATES[0].wdth,
    };
    applyAmpersandState(
      glyph,
      styleEl,
      values,
      AMPERSAND_STATES[0].label
    );

    ampersandRunning = true;
    let index = 0;

    function playNext() {
      if (!ampersandRunning) return;

      const nextIndex = (index + 1) % AMPERSAND_STATES.length;
      const next = AMPERSAND_STATES[nextIndex];

      ampersandAnimation = anime({
        targets: values,
        wght: next.wght,
        wdth: next.wdth,
        duration: TRANSITION_MS,
        delay: PAUSE_MS,
        easing: "easeInOutCubic",
        update: () => applyAmpersandState(glyph, styleEl, values),
        complete: () => {
          index = nextIndex;
          applyAmpersandState(glyph, styleEl, values, next.label);
          playNext();
        },
      });
    }

    playNext();
  }

  function updateStageScale() {
    const stage = document.querySelector(".stage");
    const page = document.querySelector(".page");
    if (!stage || !page) return;

    const viewportWidth = window.innerWidth;

    if (viewportWidth >= SCALE_MIN_WIDTH) {
      const scale = Math.min(1, viewportWidth / DESIGN_WIDTH);
      document.documentElement.style.setProperty(
        "--desktop-scale",
        String(scale)
      );
      document.documentElement.style.setProperty("--tablet-scale", "1");
      document.documentElement.style.setProperty("--mobile-scale", "1");

      const naturalHeight = page.offsetHeight;
      stage.style.height = `${naturalHeight * scale}px`;
      return;
    }

    if (viewportWidth >= TABLET_DESIGN_WIDTH && viewportWidth <= TABLET_MAX_WIDTH) {
      const scale = viewportWidth / TABLET_DESIGN_WIDTH;
      document.documentElement.style.setProperty("--desktop-scale", "1");
      document.documentElement.style.setProperty(
        "--tablet-scale",
        String(scale)
      );
      document.documentElement.style.setProperty("--mobile-scale", "1");

      const naturalHeight = page.offsetHeight;
      stage.style.height = `${naturalHeight * scale}px`;
      return;
    }

    // Mobile: scale the 390px stage to the viewport (up to 767, down below 390)
    const scale = viewportWidth / MOBILE_DESIGN_WIDTH;
    document.documentElement.style.setProperty("--desktop-scale", "1");
    document.documentElement.style.setProperty("--tablet-scale", "1");
    document.documentElement.style.setProperty("--mobile-scale", String(scale));

    const naturalHeight = page.offsetHeight;
    stage.style.height = `${naturalHeight * scale}px`;
  }

  function init() {
    updateStageScale();
    initMarquees();
    initAmpersandAnimation();
    updateStageScale();
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateStageScale();
      initMarquees();
      updateStageScale();
    }, 150);
  });

  reducedMotion.addEventListener("change", init);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
