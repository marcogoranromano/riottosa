(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

  function init() {
    document.querySelectorAll("[data-marquee]").forEach(prepareMarquee);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150);
  });

  reducedMotion.addEventListener("change", init);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
