const pages = [...document.querySelectorAll('.page')];
const dots = document.getElementById('dots');
const pageSelect = document.getElementById('pageSelect');
const back = document.getElementById('backBtn');
const next = document.getElementById('nextBtn');
const status = document.getElementById('status');
let page = 0;
let marsSuccess = false;
const pageLabels = ['Cover', 'Night sky', 'Find the parts', 'Build the rocket', 'Launch', 'Mars'];

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

function tone(frequency = 440, duration = .08) {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    const context = tone.context || (tone.context = new Audio());
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

function show(index) {
  index = Math.max(0, Math.min(pages.length - 1, index));
  window.speechSynthesis?.cancel();
  pages[page].classList.remove('active');
  page = index;
  pages[page].classList.add('active');
  pageSelect.value = page;
  back.disabled = page === 0;
  next.disabled = page === pages.length - 1 && !marsSuccess;
  [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === page));
  status.textContent = pageLabels[page];
  tone(360 + page * 45);
  requestAnimationFrame(fitStoryCards);
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
window.addEventListener('resize', () => requestAnimationFrame(fitStoryCards));

back.onclick = () => {
  const target = Math.max(0, page - 1);
  resetFrom(target);
  show(target);
};
next.onclick = () => {
  if (page === pages.length - 1) {
    if (marsSuccess) showEnding();
    return;
  }
  show(page + 1);
};
pageSelect.onchange = () => navigateTo(Number(pageSelect.value));
document.getElementById('homeBtn').onclick = () => { resetFrom(0); show(0); };
document.querySelectorAll('[data-go]').forEach(button => button.onclick = () => show(Number(button.dataset.go)));
document.addEventListener('keydown', event => {
  if (event.target.closest('select')) return;
  if (event.key === 'ArrowRight') show(page + 1);
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
  return [...availableVoices]
    .filter(voice => /^en([-_]|$)/i.test(voice.lang))
    .sort((a, b) => {
      const score = voice => {
        const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
        return wanted.some(word => name.includes(word)) * 5 + naturalWords.some(word => name.includes(word)) * 4 + !voice.localService * 2 + /en-us/i.test(voice.lang);
      };
      return score(b) - score(a);
    })[0];
}

document.getElementById('readBtn').onclick = () => {
  if (!('speechSynthesis' in window)) {
    status.textContent = 'Read aloud is not available in this browser.';
    return;
  }
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    return;
  }
  const speech = new SpeechSynthesisUtterance(pages[page].dataset.read);
  const kind = voiceChoice.value;
  speech.voice = bestVoice(kind) || null;
  speech.lang = speech.voice?.lang || 'en-US';
  speech.rate = .96;
  speech.pitch = kind === 'man' ? .98 : 1.01;
  speech.volume = 1;
  speechSynthesis.speak(speech);
};

document.querySelectorAll('.star').forEach(star => {
  star.onclick = () => {
    star.classList.add('on');
    tone(620 + document.querySelectorAll('.star.on').length * 80, .15);
    if (document.querySelectorAll('.star.on').length === 4) {
      status.textContent = 'All the stars are shining!';
      glowBurstStars(star, 22);
    }
  };
});

function pointInside(rect, x, y) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

let packed = 0;
const basket = document.getElementById('basket');
const packedCount = document.getElementById('packedCount');
document.querySelectorAll('.supply').forEach(item => {
  let originX = 0;
  let originY = 0;

  item.addEventListener('pointerdown', event => {
    if (item.classList.contains('packed')) return;
    event.preventDefault();
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
      tone(300 + packed * 90, .12);
      if (packed === 4) {
        basket.classList.add('done');
        basket.querySelector('span').textContent = 'ALL PACKED!';
        status.textContent = 'All four supplies are packed!';
        confetti(12);
      }
    } else {
      item.style.transform = '';
      tone(190, .08);
    }
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
      piece.classList.add('locked');
      target.classList.add('filled');
      placeLockedPiece(piece, target);
      lockedPieces += 1;
      tone(430 + lockedPieces * 90, .16);
      status.textContent = `${lockedPieces} of 4 rocket parts locked in place.`;
      if (lockedPieces === 4) {
        document.querySelector('.dog-says').classList.add('show');
        status.textContent = 'The rocket puzzle is complete. The dog still has concerns.';
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
  tone(760, .7);
  setTimeout(() => { whoosh.classList.remove('show'); show(5); }, 2300);
}
launchBtn.addEventListener('pointerdown', startHold);
['pointerup','pointerleave','pointercancel'].forEach(name => launchBtn.addEventListener(name, stopHold));

function grumbleSound() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    const context = tone.context || (tone.context = new Audio());
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(95, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(42, context.currentTime + .75);
    gain.gain.setValueAtTime(.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.11, context.currentTime + .08);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .8);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .82);
  } catch (error) {}
}

const accuracyFill = document.getElementById('accuracyFill');
const accuracyTrack = accuracyFill.parentElement;
const accuracyHint = document.getElementById('accuracyHint');
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
    accuracyHint.textContent = 'Too soon — wait for GO!';
    accuracyTrack.classList.remove('miss');
    requestAnimationFrame(() => accuracyTrack.classList.add('miss'));
    tone(170, .12);
    return;
  }
  marsSuccess = true;
  document.getElementById('grumble').classList.add('show');
  accuracyHint.textContent = 'Perfect! Johnny’s tummy rumbles.';
  next.disabled = false;
  status.textContent = 'Perfect timing! Johnny’s hungry tummy is grumbling. Select Next to finish the story.';
  grumbleSound();
};

function resetPage(index) {
  if (index === 1) {
    document.querySelectorAll('.star').forEach(star => star.classList.remove('on'));
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
    accuracyHint.textContent = 'Tap Johnny when the bar reaches GO';
    accuracyTrack.classList.remove('miss');
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
