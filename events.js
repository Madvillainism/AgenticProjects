const mediaDisplay = document.getElementById("mediaDisplay");
const volumeControl = document.getElementById("volumeControl");
const ambianceControl = document.getElementById("ambianceControl");
const brightnessControl = document.getElementById("brightnessControl");
const volumeValue = document.getElementById("volumeValue");
const ambianceValue = document.getElementById("ambianceValue");
const brightnessValue = document.getElementById("brightnessValue");
const mediaButtons = document.querySelectorAll(".media-btn");

let audioElement = null;
let backgroundAudio = null;
let currentMediaType = "video";
let currentEffect = "sunset";
let loopTimeout = null;

const effectStyles = {
  waves: {
    filter: (ambiance, brightness) => {
      const blur = 0.5 + ambiance / 100;
      const glow = 5 + ambiance / 20;
      return `brightness(${brightness}%) blur(${blur}px) drop-shadow(0 0 ${glow}px rgba(0, 180, 255, 0.6)) saturate(110%)`;
    },
  },
  sunset: {
    filter: (ambiance, brightness) => {
      const hueShift = ambiance * 1.5;
      const saturation = 50 + ambiance / 2;
      const contrast = 80 + ambiance / 5;
      return `brightness(${brightness}%) saturate(${saturation}%) contrast(${contrast}%) hue-rotate(${hueShift}deg)`;
    },
  },
  ocean: {
    filter: (ambiance, brightness) => {
      const saturation = 120 + ambiance / 5;
      const contrast = 110 + ambiance / 10;
      return `brightness(${brightness}%) saturate(${saturation}%) contrast(${contrast}%) sepia(${10 + ambiance / 20}%)`;
    },
  },
};

function applyEffectFilter() {
  const ambiance = ambianceControl.value;
  const brightness = brightnessControl.value;
  const effect = effectStyles[currentEffect];

  if (effect) {
    mediaDisplay.style.filter = effect.filter(ambiance, brightness);
  }
}

function updateVolumeDisplay() {
  const volume = volumeControl.value;
  volumeValue.textContent = volume + "%";

  if (backgroundAudio) {
    backgroundAudio.volume = volume / 100;
  }

  if (audioElement && currentMediaType === "audio") {
    audioElement.volume = volume / 100;
  }
}

function updateAmbianceDisplay() {
  const ambiance = ambianceControl.value;
  ambianceValue.textContent = ambiance + "%";
  applyEffectFilter();
}

function updateBrightnessDisplay() {
  const brightness = brightnessControl.value;
  brightnessValue.textContent = brightness + "%";
  applyEffectFilter();
}

function switchMedia(src, type, effect) {
  currentMediaType = type;
  currentEffect = effect || "sunset";

  if (loopTimeout) {
    clearTimeout(loopTimeout);
  }

  if (type === "video") {
    if (audioElement) {
      audioElement.pause();
      audioElement = null;
    }

    mediaDisplay.style.display = "block";
    mediaDisplay.src = src;
    mediaDisplay.muted = true;
    mediaDisplay.loop = false;
    mediaDisplay.currentTime = 0;
    mediaDisplay.play().catch((error) => {
      console.error("Error playing video:", error);
    });

    loopTimeout = setTimeout(() => {
      mediaDisplay.pause();
      mediaDisplay.currentTime = 0;
    }, 30000);

    applyEffectFilter();
  } else if (type === "video-loop") {
    if (audioElement) {
      audioElement.pause();
      audioElement = null;
    }

    mediaDisplay.style.display = "block";
    mediaDisplay.src = src;
    mediaDisplay.muted = true;
    mediaDisplay.loop = true;
    mediaDisplay.currentTime = 0;
    mediaDisplay.play().catch((error) => {
      console.error("Error playing video:", error);
    });

    applyEffectFilter();
  }
}

volumeControl.addEventListener("input", updateVolumeDisplay);
ambianceControl.addEventListener("input", updateAmbianceDisplay);
brightnessControl.addEventListener("input", updateBrightnessDisplay);

document.addEventListener("DOMContentLoaded", () => {
  mediaDisplay.volume = 0;
  mediaDisplay.muted = true;
  volumeControl.value = 30;
  volumeValue.textContent = "30%";
  updateVolumeDisplay();
  updateBrightnessDisplay();

  backgroundAudio = new Audio();
  backgroundAudio.src = "assets/ocean-sound.mp3";
  backgroundAudio.volume = 0.3;
  backgroundAudio.loop = true;

  // Fix: Play audio on first user interaction to bypass browser autoplay restrictions
  const startAudio = () => {
    backgroundAudio.play().catch((error) => {
      console.error("Error playing background ocean sound:", error);
    });
    document.removeEventListener("click", startAudio);
    document.removeEventListener("keydown", startAudio);
  };

  document.addEventListener("click", startAudio);
  document.addEventListener("keydown", startAudio);

  mediaButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      mediaButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const src = btn.getAttribute("data-src");
      const type = btn.getAttribute("data-type");
      const effect = btn.getAttribute("data-effect");
      switchMedia(src, type, effect);
    });
  });
});
