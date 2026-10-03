const pages = [...document.querySelectorAll('.page')];
const dots = document.getElementById('dots');
const count = document.getElementById('pageCount');
const back = document.getElementById('backBtn');
const next = document.getElementById('nextBtn');
const status = document.getElementById('status');
let page = 0;

pages.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.className = 'dot';
  dot.setAttribute('aria-label', index ? `Go to page ${index}` : 'Go to cover');
  dot.onclick = () => show(index);
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
  count.textContent = page === 0 ? 'Cover' : `Page ${page} of 5`;
  back.disabled = page === 0;
  next.disabled = page === pages.length - 1;
  [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === page));
  status.textContent = pages[page].dataset.title;
  tone(360 + page * 45);
}

back.onclick = () => show(page - 1);
next.onclick = () => show(page + 1);
document.getElementById('homeBtn').onclick = () => show(0);
document.querySelectorAll('[data-go]').forEach(button => button.onclick = () => show(Number(button.dataset.go)));
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') show(page + 1);
  if (event.key === 'ArrowLeft') show(page - 1);
});

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
  speech.rate = .88;
  speech.pitch = 1.08;
  speechSynthesis.speak(speech);
};

document.querySelectorAll('.star').forEach(star => {
  star.onclick = () => {
    star.classList.add('on');
    tone(620 + document.querySelectorAll('.star.on').length * 80, .15);
    if (document.querySelectorAll('.star.on').length === 4) {
      status.textContent = 'All the stars are shining!';
      confetti(10);
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
        confetti(16);
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
function launch() {
  launched = true;
  launchBtn.classList.remove('ready');
  document.getElementById('launchRocket').classList.add('go');
  const whoosh = document.getElementById('whoosh');
  whoosh.classList.add('show');
  status.textContent = 'Liftoff!';
  confetti(24);
  tone(760, .7);
  setTimeout(() => { whoosh.classList.remove('show'); show(5); }, 1200);
}
launchBtn.addEventListener('pointerdown', startHold);
['pointerup','pointerleave','pointercancel'].forEach(name => launchBtn.addEventListener(name, stopHold));

document.getElementById('lunchbox').onclick = event => {
  event.currentTarget.classList.add('open');
  event.currentTarget.querySelector('span').textContent = 'NO SNACKS!';
  document.getElementById('finale').classList.add('show');
  status.textContent = 'The lunchbox is empty. Johnny forgot the snacks!';
  tone(180, .25);
};
document.getElementById('finale').onclick = () => {
  document.getElementById('ending').classList.add('show');
  confetti(36);
  tone(540, .4);
};
document.getElementById('againBtn').onclick = () => {
  document.getElementById('ending').classList.remove('show');
  show(0);
};

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

show(0);
