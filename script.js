const pages = [...document.querySelectorAll('.page')];
const dots = document.getElementById('dots');
const pageSelect = document.getElementById('pageSelect');
const back = document.getElementById('backBtn');
const next = document.getElementById('nextBtn');
const skip = document.getElementById('skipBtn');
const status = document.getElementById('status');
let page = 0;
let marsSuccess = false;
let skipTimer;
const pageLabels = ['Cover', 'Night sky', 'Find the parts', 'Build the rocket', 'Launch', 'Mars'];

function isPageComplete(index) {
  if (index <= 0) return true;
  if (index === 1) return shipLit && document.querySelectorAll('.star.on').length === 4;
  if (index === 2) return packed === 4;
  if (index === 3) return lockedPieces === 4;
  if (index === 4) return launched;
  if (index === 5) return marsSuccess;
  return true;
}

function updateNav() {
  clearTimeout(skipTimer);
  const complete = isPageComplete(page);
  next.disabled = !complete;
  skip.hidden = true;
  if (!complete) {
    skipTimer = setTimeout(() => { skip.hidden = false; }, 5000);
  }
}

pages.forEach((_, index) => {
  const option = document.createElement('option');
  option.value = index;
  option.textContent = pageLabels[index];
  pageSelect.appendChild(option);
  const dot = document.createElement('button');
  dot.className = 'dot';
  dot.setAttribute('aria-label', `Go to ${pageLabels[index].toLowerCase()}`);
  dot.onclick = () => navigateTo(index);
  dots.appendChild(dot);
});

function audioContext() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  return tone.context || (tone.context = new Audio());
}

function tone(frequency = 440, duration = .08) {
  try {
    const context = audioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.06, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch (error) {}
}

function playNoise(context, duration, filterFreq, volume = .16) {
  const size = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, size, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 1.6);
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = .8;
  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
  source.connect(filter).connect(gain).connect(context.destination);
  source.start();
  source.stop(context.currentTime + duration);
}

function clatterThunk() {
  try {
    const context = audioContext();
    const now = context.currentTime;
    playNoise(context, .1, 920, .18);
    playNoise(context, .07, 1400, .1);
    const thunk = context.createOscillator();
    const thunkGain = context.createGain();
    thunk.type = 'triangle';
    thunk.frequency.setValueAtTime(170, now);
    thunk.frequency.exponentialRampToValueAtTime(48, now + .16);
    thunkGain.gain.setValueAtTime(.001, now);
    thunkGain.gain.exponentialRampToValueAtTime(.22, now + .012);
    thunkGain.gain.exponentialRampToValueAtTime(.001, now + .2);
    thunk.connect(thunkGain).connect(context.destination);
    thunk.start(now);
    thunk.stop(now + .22);
    const clack = context.createOscillator();
    const clackGain = context.createGain();
    clack.type = 'square';
    clack.frequency.setValueAtTime(420, now + .04);
    clack.frequency.exponentialRampToValueAtTime(140, now + .1);
    clackGain.gain.setValueAtTime(.001, now + .04);
    clackGain.gain.exponentialRampToValueAtTime(.08, now + .05);
    clackGain.gain.exponentialRampToValueAtTime(.001, now + .12);
    clack.connect(clackGain).connect(context.destination);
    clack.start(now + .04);
    clack.stop(now + .13);
  } catch (error) {}
}

function hammerHit() {
  try {
    const context = audioContext();
    const now = context.currentTime;
    playNoise(context, .05, 1800, .2);
    const strike = context.createOscillator();
    const strikeGain = context.createGain();
    strike.type = 'square';
    strike.frequency.setValueAtTime(220, now);
    strike.frequency.exponentialRampToValueAtTime(70, now + .08);
    strikeGain.gain.setValueAtTime(.001, now);
    strikeGain.gain.exponentialRampToValueAtTime(.18, now + .008);
    strikeGain.gain.exponentialRampToValueAtTime(.001, now + .12);
    strike.connect(strikeGain).connect(context.destination);
    strike.start(now);
    strike.stop(now + .13);
    const ring = context.createOscillator();
    const ringGain = context.createGain();
    ring.type = 'triangle';
    ring.frequency.setValueAtTime(640, now);
    ring.frequency.exponentialRampToValueAtTime(210, now + .18);
    ringGain.gain.setValueAtTime(.001, now);
    ringGain.gain.exponentialRampToValueAtTime(.09, now + .01);
    ringGain.gain.exponentialRampToValueAtTime(.001, now + .22);
    ring.connect(ringGain).connect(context.destination);
    ring.start(now);
    ring.stop(now + .24);
  } catch (error) {}
}

function barkSound() {
  try {
    const context = audioContext();
    context.resume?.();
    const now = context.currentTime + .01;
    const duration = .38;
    const size = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, size, context.sampleRate);
    const samples = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < size; i += 1) {
      const time = i / context.sampleRate;
      const attack = Math.min(1, time / .008);
      const decay = Math.pow(Math.max(0, 1 - time / duration), 2.6);
      brown = brown * .93 + (Math.random() * 2 - 1) * .07;
      samples[i] = (brown * .75 + (Math.random() * 2 - 1) * .25) * attack * decay;
    }

    const noise = context.createBufferSource();
    const throat = context.createBiquadFilter();
    const warmth = context.createBiquadFilter();
    const barkGain = context.createGain();
    noise.buffer = buffer;
    throat.type = 'bandpass';
    throat.Q.value = 1.25;
    throat.frequency.setValueAtTime(720, now);
    throat.frequency.exponentialRampToValueAtTime(180, now + duration);
    warmth.type = 'lowpass';
    warmth.frequency.setValueAtTime(1700, now);
    warmth.frequency.exponentialRampToValueAtTime(620, now + duration);
    barkGain.gain.setValueAtTime(.001, now);
    barkGain.gain.exponentialRampToValueAtTime(.52, now + .009);
    barkGain.gain.exponentialRampToValueAtTime(.16, now + .11);
    barkGain.gain.exponentialRampToValueAtTime(.001, now + duration);
    noise.connect(throat).connect(warmth).connect(barkGain).connect(context.destination);
    noise.start(now);
    noise.stop(now + duration);

    const addVoice = (type, startFrequency, endFrequency, peak, length) => {
      const voice = context.createOscillator();
      const voiceGain = context.createGain();
      voice.type = type;
      voice.frequency.setValueAtTime(startFrequency, now);
      voice.frequency.exponentialRampToValueAtTime(endFrequency, now + length);
      voiceGain.gain.setValueAtTime(.001, now);
      voiceGain.gain.exponentialRampToValueAtTime(peak, now + .012);
      voiceGain.gain.exponentialRampToValueAtTime(.001, now + length);
      voice.connect(voiceGain).connect(context.destination);
      voice.start(now);
      voice.stop(now + length);
    };
    addVoice('sawtooth', 205, 82, .11, .3);
    addVoice('triangle', 410, 145, .055, .22);
  } catch (error) {}
}

function launchBlast() {
  try {
    const context = audioContext();
    context.resume?.();
    const now = context.currentTime + .01;
    const duration = 1.35;
    const size = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, size, context.sampleRate);
    const samples = buffer.getChannelData(0);
    let lowNoise = 0;
    for (let i = 0; i < size; i += 1) {
      const time = i / context.sampleRate;
      const attack = Math.min(1, time / .035);
      const decay = Math.pow(Math.max(0, 1 - time / duration), .72);
      lowNoise = lowNoise * .965 + (Math.random() * 2 - 1) * .035;
      const crackle = Math.random() > .985 ? (Math.random() * 2 - 1) * .8 : 0;
      samples[i] = (lowNoise * .72 + (Math.random() * 2 - 1) * .28 + crackle) * attack * decay;
    }
    const blast = context.createBufferSource();
    const lowpass = context.createBiquadFilter();
    const highpass = context.createBiquadFilter();
    const blastGain = context.createGain();
    blast.buffer = buffer;
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1450, now);
    lowpass.frequency.exponentialRampToValueAtTime(420, now + duration);
    highpass.type = 'highpass';
    highpass.frequency.value = 38;
    blastGain.gain.setValueAtTime(.001, now);
    blastGain.gain.exponentialRampToValueAtTime(.42, now + .035);
    blastGain.gain.exponentialRampToValueAtTime(.001, now + duration);
    blast.connect(lowpass).connect(highpass).connect(blastGain).connect(context.destination);
    blast.start(now);
    blast.stop(now + duration);

    [48, 63].forEach((frequency, index) => {
      const rumble = context.createOscillator();
      const gain = context.createGain();
      rumble.type = 'sine';
      rumble.frequency.setValueAtTime(frequency, now);
      rumble.frequency.exponentialRampToValueAtTime(frequency * .72, now + 1.2);
      gain.gain.setValueAtTime(.001, now);
      gain.gain.exponentialRampToValueAtTime(index ? .055 : .11, now + .04);
      gain.gain.exponentialRampToValueAtTime(.001, now + 1.25);
      rumble.connect(gain).connect(context.destination);
      rumble.start(now);
      rumble.stop(now + 1.3);
    });
  } catch (error) {}
}

function show(index) {
  index = Math.max(0, Math.min(pages.length - 1, index));
  stopReading();
  pages[page].classList.remove('active');
  page = index;
  pages[page].classList.add('active');
  pageSelect.value = page;
  back.disabled = page === 0;
  updateNav();
  [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === page));
  status.textContent = pageLabels[page];
  tone(360 + page * 45);
  requestAnimationFrame(() => {
    fitStoryCards();
    if (page === 1) sizeRocketCanvas();
  });
  scheduleSupplyHint();
  // Let the page slide in (and its chime play) before reading.
  if (autoRead) readingTimer = setTimeout(readPage, 550);
}

function fitStoryCards() {
  document.querySelectorAll('.story-copy').forEach(card => {
    const verse = card.querySelector('.verse');
    verse.style.fontSize = '';
    if (card.scrollHeight <= card.clientHeight) return;
    let verseSize = parseFloat(getComputedStyle(verse).fontSize);
    let attempts = 0;
    while (card.scrollHeight > card.clientHeight && attempts < 18) {
      verseSize = Math.max(11.5, verseSize - .55);
      verse.style.fontSize = `${verseSize}px`;
      attempts += 1;
    }
  });
}
window.addEventListener('resize', () => requestAnimationFrame(() => {
  fitStoryCards();
  if (page === 1) sizeRocketCanvas();
}));

back.onclick = () => {
  const target = Math.max(0, page - 1);
  resetFrom(target);
  show(target);
};
next.onclick = () => {
  if (!isPageComplete(page)) return;
  if (page === pages.length - 1) {
    showEnding();
    return;
  }
  show(page + 1);
};
skip.onclick = () => {
  if (page === pages.length - 1) {
    marsSuccess = true;
    updateNav();
    showEnding();
    return;
  }
  show(page + 1);
};
pageSelect.onchange = () => navigateTo(Number(pageSelect.value));
document.getElementById('homeBtn').onclick = () => { resetFrom(0); show(0); };
document.querySelectorAll('[data-go]').forEach(button => button.onclick = () => show(Number(button.dataset.go)));
document.addEventListener('keydown', event => {
  if (event.target.closest('select')) return;
  if (event.key === 'ArrowRight') {
    if (!isPageComplete(page) && skip.hidden) return;
    if (page === pages.length - 1) {
      if (isPageComplete(page)) showEnding();
      return;
    }
    show(page + 1);
  }
  if (event.key === 'ArrowLeft') {
    const target = Math.max(0, page - 1);
    resetFrom(target);
    show(target);
  }
});

function navigateTo(index) {
  if (index < page) resetFrom(index);
  show(index);
}

const voiceChoice = document.getElementById('voiceChoice');
let availableVoices = [];

function refreshVoices() {
  availableVoices = speechSynthesis.getVoices();
}

if ('speechSynthesis' in window) {
  refreshVoices();
  speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
}

function bestVoice(kind) {
  const naturalWords = ['natural','neural','online','premium','enhanced'];
  const womanNames = ['aria','jenny','michelle','sonia','natasha','libby','maisie','samantha','zira','ava','susan','karen','serena','moira','veena','female'];
  const manNames = ['guy','davis','tony','jason','christopher','eric','roger','stefan','ryan','thomas','william','mark','daniel','david','george','alex','aaron','fred','male'];
  const wanted = kind === 'man' ? manNames : womanNames;
  const unwanted = kind === 'man' ? womanNames : manNames;
  // Whole-word matches only, so "male" doesn't match "female".
  const hasWord = (name, words) => words.some(word => new RegExp(`\\b${word}\\b`).test(name));
  return [...availableVoices]
    .filter(voice => /^en([-_]|$)/i.test(voice.lang))
    .sort((a, b) => {
      const score = voice => {
        const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
        return hasWord(name, wanted) * 5 - hasWord(name, unwanted) * 5 + naturalWords.some(word => name.includes(word)) * 4 + !voice.localService * 2 + /en-us/i.test(voice.lang);
      };
      return score(b) - score(a);
    })[0];
}

const readBtn = document.getElementById('readBtn');
const autoReadBtn = document.getElementById('autoReadBtn');
let autoRead = false;
let readingId = 0;
let readingTimer;

// Wrap each verse word in its own span so it can be highlighted while it is spoken.
document.querySelectorAll('.verse > span').forEach(line => {
  line.innerHTML = line.textContent.trim().split(/\s+/).map(word => `<span class="word">${word}</span>`).join(' ');
});

// Read the verse exactly as it appears on the page, remembering where each word starts in the spoken text.
function verseReading(section) {
  const lines = [...section.querySelectorAll('.verse > span')];
  if (!lines.length) return { text: section.dataset.read || '' };
  let text = '';
  const words = [];
  lines.forEach(line => {
    const lineWords = [...line.querySelectorAll('.word')];
    lineWords.forEach((word, i) => {
      if (text) text += ' ';
      words.push({ start: text.length, el: word });
      text += word.textContent;
      // Add a short pause after lines that don't already end in punctuation.
      if (i === lineWords.length - 1 && !/[.,!?;:…—”"’]$/.test(word.textContent)) text += ',';
    });
  });
  return { text, words };
}

function clearHighlight() {
  document.querySelectorAll('.reading').forEach(el => el.classList.remove('reading'));
}

function highlightWord(words, charIndex) {
  let current = words[0];
  for (const word of words) {
    if (word.start > charIndex) break;
    current = word;
  }
  if (current.el.classList.contains('reading')) return;
  clearHighlight();
  current.el.classList.add('reading');
}

function stopReading() {
  readingId += 1;
  clearTimeout(readingTimer);
  window.speechSynthesis?.cancel();
  clearHighlight();
  readBtn.classList.remove('speaking');
}

// Speak each part in turn: { text, words } highlights word by word, { text, el } highlights the whole element.
function speakParts(parts) {
  stopReading();
  if (!('speechSynthesis' in window)) {
    status.textContent = 'Read aloud is not available in this browser.';
    return;
  }
  const id = readingId;
  const kind = voiceChoice.value;
  const voice = bestVoice(kind) || null;
  const queue = parts.filter(part => part.text);
  readBtn.classList.add('speaking');
  queue.forEach((part, index) => {
    const speech = new SpeechSynthesisUtterance(part.text);
    speech.voice = voice;
    speech.lang = voice?.lang || 'en-US';
    speech.rate = .96;
    speech.pitch = kind === 'man' ? .98 : 1.01;
    speech.volume = 1;
    speech.onstart = () => {
      if (id !== readingId) return;
      clearHighlight();
      part.el?.classList.add('reading');
    };
    speech.onboundary = event => {
      if (id !== readingId || !part.words || event.name !== 'word') return;
      highlightWord(part.words, event.charIndex);
    };
    speech.onend = speech.onerror = () => {
      if (id !== readingId) return;
      clearHighlight();
      if (index === queue.length - 1) readBtn.classList.remove('speaking');
    };
    speechSynthesis.speak(speech);
  });
}

function cuePart(section) {
  const cue = section.querySelector('.cue');
  return cue ? { text: cue.textContent.trim(), el: cue } : {};
}

function readPage() {
  speakParts([verseReading(pages[page]), cuePart(pages[page])]);
}

// In read-to-me mode, speak a new instruction as soon as it appears.
function announce(part) {
  if (autoRead) speakParts([part]);
}

readBtn.onclick = () => {
  if (readBtn.classList.contains('speaking')) stopReading();
  else readPage();
};

autoReadBtn.onclick = () => {
  autoRead = !autoRead;
  autoReadBtn.setAttribute('aria-pressed', autoRead);
  status.textContent = autoRead ? 'Read to me is on.' : 'Read to me is off.';
  if (autoRead) readPage();
  else stopReading();
};

const rocketCanvas = document.getElementById('rocketCanvas');
const rocketCtx = rocketCanvas.getContext('2d', { alpha: true });
const drawPad = document.getElementById('drawPad');
const drawnShip = document.getElementById('drawnShip');
const drawnShipImg = document.getElementById('drawnShipImg');
const nightCue = document.getElementById('nightCue');
let drawColor = '#fa5a45';
let drawing = false;
let hasInk = false;
let shipSaved = false;
let shipLit = false;
let lastDrawX = 0;
let lastDrawY = 0;
let canvasScale = 1;

function sizeRocketCanvas(force = false) {
  if (shipSaved) return;
  const rect = rocketCanvas.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const nextWidth = Math.round(rect.width * dpr);
  const nextHeight = Math.round(rect.height * dpr);
  if (rocketCanvas.width === nextWidth && rocketCanvas.height === nextHeight) {
    drawnShip.style.setProperty('--ship-ratio', `${rect.width} / ${rect.height}`);
    return;
  }
  if (hasInk && !force) return;
  rocketCanvas.width = nextWidth;
  rocketCanvas.height = nextHeight;
  canvasScale = dpr;
  rocketCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  rocketCtx.lineCap = 'round';
  rocketCtx.lineJoin = 'round';
  rocketCtx.imageSmoothingEnabled = true;
  hasInk = false;
  drawnShip.style.setProperty('--ship-ratio', `${rect.width} / ${rect.height}`);
}

function canvasPoint(event) {
  const rect = rocketCanvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function clearRocketCanvas() {
  rocketCtx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  rocketCtx.clearRect(0, 0, rocketCanvas.width / canvasScale, rocketCanvas.height / canvasScale);
  hasInk = false;
}

function checkNightComplete(origin) {
  const starsLit = document.querySelectorAll('.star.on').length;
  if (starsLit === 4 && shipLit) {
    status.textContent = 'Your rocket is glowing with the stars!';
    glowBurstStars(origin, 22);
    updateNav();
  }
}

rocketCanvas.addEventListener('pointerdown', event => {
  if (shipSaved) return;
  event.preventDefault();
  if (!hasInk) sizeRocketCanvas(true);
  drawing = true;
  hasInk = true;
  const point = canvasPoint(event);
  lastDrawX = point.x;
  lastDrawY = point.y;
  rocketCtx.strokeStyle = drawColor;
  rocketCtx.fillStyle = drawColor;
  rocketCtx.lineWidth = 7;
  rocketCtx.lineCap = 'round';
  rocketCtx.lineJoin = 'round';
  rocketCtx.beginPath();
  rocketCtx.arc(point.x, point.y, 3.5, 0, Math.PI * 2);
  rocketCtx.fill();
  rocketCanvas.setPointerCapture(event.pointerId);
});

rocketCanvas.addEventListener('pointermove', event => {
  if (!drawing) return;
  const point = canvasPoint(event);
  rocketCtx.strokeStyle = drawColor;
  rocketCtx.lineWidth = 7;
  rocketCtx.beginPath();
  rocketCtx.moveTo(lastDrawX, lastDrawY);
  rocketCtx.lineTo(point.x, point.y);
  rocketCtx.stroke();
  lastDrawX = point.x;
  lastDrawY = point.y;
});

const stopDrawing = () => { drawing = false; };
rocketCanvas.addEventListener('pointerup', stopDrawing);
rocketCanvas.addEventListener('pointercancel', stopDrawing);
rocketCanvas.addEventListener('pointerleave', stopDrawing);

document.querySelectorAll('.swatch').forEach(swatch => {
  swatch.onclick = () => {
    drawColor = swatch.dataset.color;
    document.querySelectorAll('.swatch').forEach(item => item.classList.toggle('on', item === swatch));
  };
});

document.getElementById('clearDraw').onclick = () => {
  if (shipSaved) return;
  clearRocketCanvas();
  tone(190, .08);
};

document.getElementById('saveDraw').onclick = () => {
  if (shipSaved) return;
  if (!hasInk) {
    status.textContent = 'Draw a rocket first, then add it to the sky.';
    tone(170, .1);
    return;
  }
  const rect = rocketCanvas.getBoundingClientRect();
  drawnShip.style.setProperty('--ship-ratio', `${rect.width} / ${rect.height}`);
  drawnShipImg.src = rocketCanvas.toDataURL('image/png');
  drawnShip.hidden = false;
  drawPad.classList.add('saved');
  shipSaved = true;
  setRocketArt(croppedDrawing());
  document.querySelectorAll('.star').forEach(star => { star.disabled = false; });
  nightCue.textContent = 'Tap all four stars and your ship';
  announce({ text: nightCue.textContent, el: nightCue });
  status.textContent = 'Your rocket is floating among the stars. Tap the stars and your ship!';
  tone(540, .2);
  confetti(10);
};

// Trim the drawing to the inked area so it fills the rocket's space on later pages.
function croppedDrawing() {
  const { width, height } = rocketCanvas;
  const alpha = rocketCtx.getImageData(0, 0, width, height).data;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (alpha[(y * width + x) * 4 + 3] < 8) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < 0) return rocketCanvas.toDataURL('image/png');
  const pad = Math.round(4 * canvasScale);
  left = Math.max(0, left - pad);
  top = Math.max(0, top - pad);
  const cropWidth = Math.min(width, right + pad + 1) - left;
  const cropHeight = Math.min(height, bottom + pad + 1) - top;
  const crop = document.createElement('canvas');
  crop.width = cropWidth;
  crop.height = cropHeight;
  crop.getContext('2d').drawImage(rocketCanvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return crop.toDataURL('image/png');
}

// Fly the child's drawing on the launch, whoosh and Mars pages; no drawing keeps the standard rocket.
function setRocketArt(url) {
  const image = document.getElementById('kidRocketImage');
  if (url) image.setAttribute('href', url);
  else image.removeAttribute('href');
  document.querySelectorAll('.rocket-art use').forEach(use => use.setAttribute('href', url ? '#icon-kid-rocket' : '#icon-rocket'));
}

const nightPitches = [523, 622, 740, 880];
document.querySelectorAll('.star').forEach((star, index) => {
  star.onclick = () => {
    if (!shipSaved || star.classList.contains('on')) return;
    star.classList.add('on');
    tone(nightPitches[index], .15);
    checkNightComplete(star);
  };
});

drawnShip.onclick = () => {
  if (!shipSaved || shipLit) return;
  shipLit = true;
  drawnShip.classList.add('on');
  tone(1047, .18);
  checkNightComplete(drawnShip);
};

function pointInside(rect, x, y) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

let packed = 0;
const basket = document.getElementById('basket');
const packedCount = document.getElementById('packedCount');
const hintDelay = 10000;
let hintTimer;

function clearSupplyHint() {
  clearTimeout(hintTimer);
  document.querySelectorAll('.hint').forEach(el => el.classList.remove('hint'));
}

// After a quiet stretch on the find-the-parts page, wiggle the next item still to be found.
function scheduleSupplyHint() {
  clearSupplyHint();
  if (page !== 2 || packed === 4) return;
  hintTimer = setTimeout(() => {
    const item = document.querySelector('.supply:not(.packed)');
    if (!item) return;
    item.classList.add('hint');
    document.querySelector(`[data-find="${item.dataset.item}"]`).classList.add('hint');
    announce({ text: `Can you find the ${item.dataset.item.toLowerCase()}?` });
  }, hintDelay);
}

document.querySelectorAll('.supply').forEach(item => {
  let originX = 0;
  let originY = 0;

  item.addEventListener('pointerdown', event => {
    if (item.classList.contains('packed')) return;
    event.preventDefault();
    clearSupplyHint();
    originX = event.clientX;
    originY = event.clientY;
    item.classList.add('dragging');
    item.setPointerCapture(event.pointerId);
  });

  item.addEventListener('pointermove', event => {
    if (!item.classList.contains('dragging')) return;
    item.style.transform = `translate(${event.clientX - originX}px, ${event.clientY - originY}px) scale(1.06)`;
    basket.classList.toggle('over', pointInside(basket.getBoundingClientRect(), event.clientX, event.clientY));
  });

  const finishSupplyDrag = event => {
    if (!item.classList.contains('dragging')) return;
    const dropped = pointInside(basket.getBoundingClientRect(), event.clientX, event.clientY);
    item.classList.remove('dragging');
    basket.classList.remove('over');
    if (dropped) {
      const itemRect = item.getBoundingClientRect();
      const basketRect = basket.getBoundingClientRect();
      const dragX = event.clientX - originX;
      const dragY = event.clientY - originY;
      item.style.setProperty('--pack-x', `${basketRect.left + basketRect.width / 2 - itemRect.left - itemRect.width / 2 + dragX}px`);
      item.style.setProperty('--pack-y', `${basketRect.top + basketRect.height / 2 - itemRect.top - itemRect.height / 2 + dragY}px`);
      item.classList.add('packed');
      packed += 1;
      packedCount.textContent = `${packed}/4`;
      document.querySelector(`[data-find="${item.dataset.item}"]`).classList.add('found');
      clatterThunk();
      if (packed === 4) {
        basket.classList.add('done');
        basket.querySelector('span').textContent = 'ALL PACKED!';
        status.textContent = 'All four supplies are packed!';
        confetti(12);
        updateNav();
      }
    } else {
      item.style.transform = '';
      tone(190, .08);
    }
    scheduleSupplyHint();
  };

  item.addEventListener('pointerup', finishSupplyDrag);
  item.addEventListener('pointercancel', finishSupplyDrag);
});

const puzzleZone = document.getElementById('puzzleZone');
const rocketBody = puzzleZone.querySelector('.rocket-body');
let lockedPieces = 0;

function distanceBetween(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();
  return Math.hypot((a.left + a.width / 2) - (b.left + b.width / 2), (a.top + a.height / 2) - (b.top + b.height / 2));
}

function placeLockedPiece(piece, target) {
  rocketBody.appendChild(piece);
  piece.style.right = 'auto';
  piece.style.bottom = 'auto';
  piece.style.left = `${target.offsetLeft + (target.offsetWidth - piece.offsetWidth) / 2}px`;
  piece.style.top = `${target.offsetTop + (target.offsetHeight - piece.offsetHeight) / 2}px`;
  piece.style.transform = '';
}

function poofPieceIn(piece, target) {
  const rect = target.getBoundingClientRect();
  const colors = ['#ffd23f','#fa5a45','#438cff','#fff7df','#62ddb1'];
  for (let i = 0; i < 10; i += 1) {
    const puff = document.createElement('i');
    const angle = (Math.PI * 2 * i) / 10;
    const distance = 18 + Math.random() * 36;
    puff.className = 'snap-poof';
    puff.style.left = `${rect.left + rect.width / 2}px`;
    puff.style.top = `${rect.top + rect.height / 2}px`;
    puff.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    puff.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    puff.style.setProperty('--poof-color', colors[i % colors.length]);
    document.body.appendChild(puff);
    setTimeout(() => puff.remove(), 600);
  }
  piece.classList.add('locked');
  placeLockedPiece(piece, target);
  piece.style.animation = 'none';
  void piece.offsetWidth;
  piece.style.animation = '';
}

document.querySelectorAll('.puzzle-piece').forEach(piece => {
  let startX = 0;
  let startY = 0;
  let homeLeft = 0;
  let homeTop = 0;
  const target = puzzleZone.querySelector(`.snap-target[data-slot="${piece.dataset.slot}"]`);

  piece.addEventListener('pointerdown', event => {
    if (piece.classList.contains('locked')) return;
    event.preventDefault();
    const zoneRect = puzzleZone.getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();
    homeLeft = pieceRect.left - zoneRect.left;
    homeTop = pieceRect.top - zoneRect.top;
    piece.style.left = `${homeLeft}px`;
    piece.style.top = `${homeTop}px`;
    piece.style.right = 'auto';
    piece.style.bottom = 'auto';
    startX = event.clientX;
    startY = event.clientY;
    piece.classList.add('dragging');
    piece.setPointerCapture(event.pointerId);
  });

  piece.addEventListener('pointermove', event => {
    if (!piece.classList.contains('dragging')) return;
    piece.style.left = `${homeLeft + event.clientX - startX}px`;
    piece.style.top = `${homeTop + event.clientY - startY}px`;
    target.classList.toggle('near', distanceBetween(piece, target) < Math.max(78, target.offsetWidth));
  });

  const finishPuzzleDrag = () => {
    if (!piece.classList.contains('dragging')) return;
    const closeEnough = distanceBetween(piece, target) < Math.max(78, target.offsetWidth);
    piece.classList.remove('dragging');
    target.classList.remove('near');
    if (closeEnough) {
      target.classList.add('filled');
      poofPieceIn(piece, target);
      lockedPieces += 1;
      hammerHit();
      status.textContent = `${lockedPieces} of 4 rocket parts locked in place.`;
      if (lockedPieces === 4) {
        document.querySelector('.dog-says').classList.add('show');
        status.textContent = 'The rocket puzzle is complete. The dog still has concerns.';
        updateNav();
      }
    } else {
      piece.style.left = `${homeLeft}px`;
      piece.style.top = `${homeTop}px`;
      piece.classList.add('returning');
      setTimeout(() => piece.classList.remove('returning'), 360);
      tone(180, .09);
    }
  };

  piece.addEventListener('pointerup', finishPuzzleDrag);
  piece.addEventListener('pointercancel', finishPuzzleDrag);
});

window.addEventListener('resize', () => {
  document.querySelectorAll('.puzzle-piece.locked').forEach(piece => {
    const target = rocketBody.querySelector(`.snap-target[data-slot="${piece.dataset.slot}"]`);
    placeLockedPiece(piece, target);
  });
});

const launchBtn = document.getElementById('launchBtn');
let holdTimer;
let holdStart;
let holdFrame;
let launched = false;

function holdTick() {
  const percent = Math.min(100, (performance.now() - holdStart) / 10);
  launchBtn.style.setProperty('--hold', `${percent}%`);
  if (percent < 100) holdFrame = requestAnimationFrame(holdTick);
}
function startHold(event) {
  event.preventDefault();
  if (launched) return;
  holdStart = performance.now();
  launchBtn.classList.add('ready');
  holdFrame = requestAnimationFrame(holdTick);
  holdTimer = setTimeout(launch, 1000);
  tone(150, .5);
}
function stopHold() {
  if (launched) return;
  clearTimeout(holdTimer);
  cancelAnimationFrame(holdFrame);
  launchBtn.classList.remove('ready');
  launchBtn.style.setProperty('--hold', '0%');
}

function makeFireballPoof() {
  const poof = document.getElementById('fireballPoof');
  const colors = ['#ff3b30','#ff7b38','#ffd23f','#fff7df','#ffffff'];
  poof.replaceChildren();
  for (let i = 0; i < 26; i += 1) {
    const ball = document.createElement('i');
    const angle = Math.random() * Math.PI * 2;
    const distance = 75 + Math.random() * 230;
    ball.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    ball.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    ball.style.setProperty('--size', `${8 + Math.random() * 22}px`);
    ball.style.setProperty('--delay', `${Math.random() * .18}s`);
    ball.style.setProperty('--fire', colors[Math.floor(Math.random() * colors.length)]);
    poof.appendChild(ball);
  }
}

function launch() {
  launched = true;
  launchBtn.classList.remove('ready');
  document.getElementById('launchRocket').classList.add('go');
  const whoosh = document.getElementById('whoosh');
  makeFireballPoof();
  whoosh.classList.add('show');
  status.textContent = 'Liftoff!';
  launchBlast();
  setTimeout(() => { whoosh.classList.remove('show'); show(5); }, 2300);
}
launchBtn.addEventListener('pointerdown', startHold);
['pointerup','pointerleave','pointercancel'].forEach(name => launchBtn.addEventListener(name, stopHold));

function grumbleSound() {
  try {
    const context = audioContext();
    const play = () => {
      const now = context.currentTime + .025;
      const duration = 1.3;
      const size = Math.floor(context.sampleRate * duration);
      const buffer = context.createBuffer(1, size, context.sampleRate);
      const samples = buffer.getChannelData(0);
      let smoothNoise = 0;
      for (let i = 0; i < size; i += 1) {
        smoothNoise = smoothNoise * .972 + (Math.random() * 2 - 1) * .028;
        samples[i] = smoothNoise;
      }
      const noise = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const noiseGain = context.createGain();
      noise.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.value = 245;
      filter.Q.value = .65;
      noiseGain.gain.setValueAtTime(.001, now);
      noiseGain.gain.linearRampToValueAtTime(.18, now + .14);
      noiseGain.gain.linearRampToValueAtTime(.035, now + .5);
      noiseGain.gain.linearRampToValueAtTime(.2, now + .79);
      noiseGain.gain.exponentialRampToValueAtTime(.001, now + duration);
      noise.connect(filter).connect(noiseGain).connect(context.destination);
      noise.start(now);
      noise.stop(now + duration);

      const addStomachVoice = (type, frequencies, peak) => {
        const voice = context.createOscillator();
        const gain = context.createGain();
        voice.type = type;
        voice.frequency.setValueAtTime(frequencies[0], now);
        voice.frequency.exponentialRampToValueAtTime(frequencies[1], now + .42);
        voice.frequency.exponentialRampToValueAtTime(frequencies[2], now + .78);
        voice.frequency.exponentialRampToValueAtTime(frequencies[3], now + duration);
        gain.gain.setValueAtTime(.001, now);
        gain.gain.linearRampToValueAtTime(peak, now + .12);
        gain.gain.linearRampToValueAtTime(peak * .24, now + .5);
        gain.gain.linearRampToValueAtTime(peak * .9, now + .78);
        gain.gain.exponentialRampToValueAtTime(.001, now + duration);
        voice.connect(gain).connect(context.destination);
        voice.start(now);
        voice.stop(now + duration);
      };
      addStomachVoice('sine', [96, 68, 112, 61], .17);
      addStomachVoice('triangle', [192, 136, 224, 122], .055);
    };
    if (context.state === 'suspended') context.resume().then(play).catch(() => {});
    else play();
  } catch (error) {}
}

document.querySelectorAll('.dog, .mars-dog').forEach(dog => {
  dog.addEventListener('click', () => barkSound());
});

const accuracyFill = document.getElementById('accuracyFill');
const accuracyTrack = accuracyFill.parentElement;
const accuracyGame = accuracyTrack.parentElement;
let accuracy = 0;
let accuracyDirection = 1;
let accuracyTime = performance.now();

function animateAccuracy(now) {
  const elapsed = Math.min(45, now - accuracyTime);
  accuracyTime = now;
  accuracy += accuracyDirection * elapsed * .00072;
  if (accuracy >= 1) { accuracy = 1; accuracyDirection = -1; }
  if (accuracy <= 0) { accuracy = 0; accuracyDirection = 1; }
  accuracyFill.style.width = `${accuracy * 100}%`;
  accuracyTrack.classList.toggle('ready', accuracy >= .88);
  requestAnimationFrame(animateAccuracy);
}
requestAnimationFrame(animateAccuracy);

document.getElementById('johnnyButton').onclick = () => {
  if (marsSuccess) return;
  if (accuracy < .88) {
    accuracyTrack.classList.remove('miss');
    requestAnimationFrame(() => accuracyTrack.classList.add('miss'));
    tone(170, .12);
    return;
  }
  marsSuccess = true;
  document.getElementById('johnnyButton').classList.add('rumbling');
  document.getElementById('grumble').classList.add('show');
  accuracyGame.classList.add('complete');
  status.textContent = 'Perfect timing! Johnny’s hungry tummy is grumbling. Select Next to finish the story.';
  grumbleSound();
  updateNav();
};

function resetPage(index) {
  if (index === 1) {
    drawing = false;
    hasInk = false;
    shipSaved = false;
    shipLit = false;
    drawPad.classList.remove('saved');
    drawnShip.hidden = true;
    drawnShip.classList.remove('on');
    drawnShipImg.removeAttribute('src');
    setRocketArt(null);
    nightCue.textContent = 'Draw a rocket, then add it to the sky';
    document.querySelectorAll('.star').forEach(star => {
      star.classList.remove('on');
      star.disabled = true;
    });
    document.querySelectorAll('.swatch').forEach((swatch, i) => swatch.classList.toggle('on', i === 0));
    drawColor = '#fa5a45';
    requestAnimationFrame(() => sizeRocketCanvas(true));
  }
  if (index === 2) {
    packed = 0;
    packedCount.textContent = '0/4';
    basket.classList.remove('over','done');
    basket.querySelector('span').textContent = 'PACKING CRATE';
    document.querySelectorAll('.supply').forEach(item => {
      item.classList.remove('packed','dragging');
      item.style.transform = '';
    });
    document.querySelectorAll('.find-list li').forEach(item => item.classList.remove('found'));
  }
  if (index === 3) {
    lockedPieces = 0;
    document.querySelectorAll('.puzzle-piece').forEach(piece => {
      puzzleZone.appendChild(piece);
      piece.classList.remove('locked','dragging','returning');
      piece.removeAttribute('style');
    });
    puzzleZone.querySelectorAll('.snap-target').forEach(target => target.classList.remove('near','filled'));
    document.querySelector('.dog-says').classList.remove('show');
  }
  if (index === 4) {
    clearTimeout(holdTimer);
    cancelAnimationFrame(holdFrame);
    launched = false;
    launchBtn.classList.remove('ready');
    launchBtn.style.setProperty('--hold', '0%');
    document.getElementById('launchRocket').classList.remove('go');
    document.getElementById('whoosh').classList.remove('show');
    document.getElementById('fireballPoof').replaceChildren();
  }
  if (index === 5) {
    marsSuccess = false;
    document.getElementById('johnnyButton').classList.remove('rumbling');
    accuracyTrack.classList.remove('miss');
    accuracyGame.classList.remove('complete');
    document.getElementById('grumble').classList.remove('show');
    const ending = document.getElementById('ending');
    ending.classList.remove('show');
    ending.querySelectorAll('.end-star').forEach(star => star.remove());
  }
}

function resetFrom(index) {
  for (let i = index; i < pages.length; i += 1) resetPage(i);
}

function showEnding() {
  const ending = document.getElementById('ending');
  ending.classList.add('show');
  glowEndingStars(48);
  tone(540, .4);
  announce({ text: `${ending.querySelector('h2').textContent} ${ending.querySelector('p').innerText.replace(/\s+/g, ' ')}` });
}

document.getElementById('againBtn').onclick = () => {
  const ending = document.getElementById('ending');
  ending.classList.remove('show');
  ending.querySelectorAll('.end-star').forEach(star => star.remove());
  resetFrom(0);
  show(0);
};

function glowEndingStars(amount) {
  const ending = document.getElementById('ending');
  ending.querySelectorAll('.end-star').forEach(star => star.remove());
  const colors = ['#5aa9ff','#86c9ff','#ffd23f','#fff7c7','#ffffff'];
  for (let i = 0; i < amount; i += 1) {
    const star = document.createElement('i');
    const size = 3 + Math.random() * 7;
    star.className = 'end-star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.setProperty('--star-color', colors[Math.floor(Math.random() * colors.length)]);
    star.style.setProperty('--twinkle-time', `${.7 + Math.random() * 1.8}s`);
    star.style.animationDelay = `${Math.random() * 1.2}s`;
    ending.appendChild(star);
  }
}

function glowCoverStars(amount) {
  const sky = document.getElementById('coverSparkles');
  const colors = ['#5aa9ff','#9fd3ff','#ffd23f','#fff7c7','#ffffff'];
  for (let i = 0; i < amount; i += 1) {
    const star = document.createElement('i');
    const size = 2 + Math.random() * 5;
    star.className = 'cover-star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.setProperty('--star-color', colors[Math.floor(Math.random() * colors.length)]);
    star.style.setProperty('--twinkle-time', `${.8 + Math.random() * 2}s`);
    star.style.animationDelay = `${Math.random() * 1.4}s`;
    sky.appendChild(star);
  }
}

function glowSceneStars(container, amount, maxTop = 100) {
  const colors = ['#5aa9ff','#9fd3ff','#ffd23f','#fff7c7','#ffffff'];
  for (let i = 0; i < amount; i += 1) {
    const star = document.createElement('i');
    const size = 2 + Math.random() * 5;
    star.className = 'scene-star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * maxTop}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.setProperty('--star-color', colors[Math.floor(Math.random() * colors.length)]);
    star.style.setProperty('--twinkle-time', `${.8 + Math.random() * 2}s`);
    star.style.animationDelay = `${Math.random() * 1.4}s`;
    container.appendChild(star);
  }
}

function glowBurstStars(origin, amount) {
  const rect = origin.getBoundingClientRect();
  const colors = ['#5aa9ff','#86c9ff','#ffd23f','#fff7c7','#ffffff'];
  for (let i = 0; i < amount; i += 1) {
    const star = document.createElement('i');
    const angle = Math.random() * Math.PI * 2;
    const distance = 45 + Math.random() * 130;
    star.className = 'burst-star';
    star.style.left = `${rect.left + rect.width / 2}px`;
    star.style.top = `${rect.top + rect.height / 2}px`;
    star.style.setProperty('--size', `${3 + Math.random() * 6}px`);
    star.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    star.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    star.style.setProperty('--star-color', colors[Math.floor(Math.random() * colors.length)]);
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 1100);
  }
}

function confetti(amount) {
  const colors = ['#ffd23f','#fa5a45','#62ddb1','#438cff'];
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement('i');
    piece.className = 'celebrate';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = '-30px';
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--round', i % 3 === 0 ? '50%' : '3px');
    piece.style.setProperty('--x', `${Math.random() * 180 - 90}px`);
    piece.style.animationDelay = `${Math.random() * .25}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1800);
  }
}

glowCoverStars(44);
glowSceneStars(document.getElementById('nightSparkles'), 34);
glowSceneStars(document.getElementById('launchPageSparkles'), 42, 66);
glowSceneStars(document.getElementById('marsSparkles'), 38, 58);
show(0);
// The story font is wider than the fallback, so re-fit the verses once it has loaded.
document.fonts?.ready.then(fitStoryCards);
