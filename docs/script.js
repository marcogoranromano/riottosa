(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

    const distance = line.getBoundingClientRect().width;
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

  function init() {
    initMarquees();
    initAmpersandAnimation();
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initMarquees, 150);
  });

  reducedMotion.addEventListener("change", init);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
