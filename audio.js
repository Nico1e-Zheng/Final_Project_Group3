// Audio mechanic: microphone / music controls the wave system.
// Bass/beat = stronger pulse, mid = row shearing, treble = faster shimmer.

let audioInput;
let audioFFT;
let audioButton;
let audioStarted = false;

let audioBass = 0;
let audioMid = 0;
let audioTreble = 0;
let audioElasticity = 0;
let audioShear = 0;
let audioFlash = 0;
let audioBeat = 0;
let audioEnergy = 0;
let audioLevel = 0;
let audioImpact = 0;
let previousBass = 0;

let baseNoiseSpeed = 0.013;

function setupAudioMechanic() {
  audioInput = new p5.AudioIn();
  audioFFT = new p5.FFT(0.84, 1024);

  audioButton = createButton("Start Audio");
  audioButton.position(16, 16);
  audioButton.style("padding", "8px 12px");
  audioButton.style("border", "1px solid rgba(0, 0, 0, 0.18)");
  audioButton.style("border-radius", "6px");
  audioButton.style("background", "rgba(250, 240, 235, 0.82)");
  audioButton.style("font-family", "sans-serif");
  audioButton.style("cursor", "pointer");
  audioButton.mousePressed(startAudioMechanic);
}

function startAudioMechanic() {
  userStartAudio();

  audioInput.start(function() {
    audioFFT.setInput(audioInput);
    audioStarted = true;
    audioButton.html("Audio On");
  });
}

function drawAudioMechanic() {
  updateAudioLevels();
  controlNoiseWithAudio();
  drawAudioPulseLayer();
}

function updateAudioLevels() {
  if (audioStarted == false) {
    audioBass = lerp(audioBass, 0, 0.08);
    audioMid = lerp(audioMid, 0, 0.08);
    audioTreble = lerp(audioTreble, 0, 0.08);
    audioLevel = lerp(audioLevel, 0, 0.08);
    audioBeat = lerp(audioBeat, 0, 0.08);
    audioEnergy = lerp(audioEnergy, 0, 0.08);
    audioImpact = lerp(audioImpact, 0, 0.08);
    return;
  }

  audioFFT.analyze();

  let rawBass = audioFFT.getEnergy("bass");
  let rawMid = audioFFT.getEnergy("mid");
  let rawTreble = audioFFT.getEnergy("treble");
  let rawLevel = audioInput.getLevel();

  let bassTarget = getLoudAudioValue(rawBass, 26, 150, 1.45);
  let midTarget = getLoudAudioValue(rawMid, 18, 145, 1.25);
  let trebleTarget = getLoudAudioValue(rawTreble, 10, 120, 1.55);
  let levelTarget = constrain(map(rawLevel, 0.005, 0.12, 0, 1), 0, 1);

  audioBass = lerp(audioBass, bassTarget, 0.38);
  audioMid = lerp(audioMid, midTarget, 0.32);
  audioTreble = lerp(audioTreble, trebleTarget, 0.42);
  audioLevel = lerp(audioLevel, levelTarget, 0.45);

  let bassJump = audioBass - previousBass;
  audioBeat = max(audioBeat * 0.74, constrain(bassJump * 9.0 + audioBass * 0.34 + audioLevel * 0.55, 0, 1));
  previousBass = audioBass;

  audioEnergy = constrain(audioBass * 0.5 + audioMid * 0.2 + audioTreble * 0.25 + audioLevel * 0.55, 0, 1);
  audioElasticity = constrain(audioBass * 1.45 + audioBeat * 0.9, 0, 1);
  audioShear = constrain(audioMid * 1.8 + audioLevel * 0.35, 0, 1);
  audioFlash = constrain(audioTreble * 1.8 + audioBeat * 1.1 + audioLevel * 0.55, 0, 1);
  audioImpact = constrain(max(audioEnergy, audioBeat, audioFlash * 0.8), 0, 1);
}

function controlNoiseWithAudio() {
  // Beat and treble make all Perlin-driven ocean layers speed up strongly.
  let targetNoiseSpeed = baseNoiseSpeed;

  if (audioStarted) {
    targetNoiseSpeed = baseNoiseSpeed * (1 + audioEnergy * 2.4);
    targetNoiseSpeed += audioTreble * 0.12;
    targetNoiseSpeed += audioBeat * 0.16;
    targetNoiseSpeed += audioLevel * 0.08;
  }

  noiseSpeed = lerp(noiseSpeed, constrain(targetNoiseSpeed, 0.006, 0.26), 0.34);
}

function getLoudAudioValue(energy, quietPoint, loudPoint, power) {
  let normalized = constrain(map(energy, quietPoint, loudPoint, 0, 1), 0, 1);
  return constrain(pow(normalized, 0.72) * power, 0, 1);
}

function drawAudioPulseLayer() {
  if (audioStarted == false || audioImpact < 0.03) {
    return;
  }

  let horizonY = height * horizonLine;
  let bandStep = max(1, floor(resolution / 28));

  push();

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      let rowIndex = floor(segment.y / segment.height);
      let colIndex = floor(segment.x / segment.width);

      if ((rowIndex + colIndex) % bandStep == 0) {
        drawAudioPulseCell(segment, rowIndex, colIndex);
      }
    }
  }

  pop();
}

function drawAudioPulseCell(segment, rowIndex, colIndex) {
  let w = segment.width;
  let h = segment.height;
  let flicker = noise(colIndex * 0.22, rowIndex * 0.22, frameCount * 0.18);
  let pulseSize = 0.25 + audioBeat * 1.4 + audioFlash * 0.75;
  let alpha = (audioFlash * 105 + audioBeat * 95 + audioLevel * 80) * flicker;
  let shear = getAudioRowShear(rowIndex, w) * 1.3;
  let x = segment.x + w / 2 + shear;
  let y = segment.y + h / 2 + sin(frameCount * 0.24 + rowIndex) * h * audioBeat * 0.9;
  let pulseColor = color(
    red(segment.color),
    green(segment.color),
    blue(segment.color),
    alpha
  );

  stroke(pulseColor);
  strokeWeight(1 + audioImpact * 4);
  line(x - w * pulseSize, y, x + w * pulseSize, y);

  if (audioBeat > 0.28) {
    noStroke();
    fill(
      red(segment.color),
      green(segment.color),
      blue(segment.color),
      alpha * 0.45
    );
    circle(x, y, w * (0.45 + audioBeat * 1.35));
  }
}

function getAudioWaveBoost() {
  if (audioStarted == false) {
    return 0;
  }
  return audioEnergy;
}

function getAudioBeatPulse() {
  if (audioStarted == false) {
    return 0;
  }
  return audioBeat;
}

function getAudioTrebleFlash() {
  if (audioStarted == false) {
    return 0;
  }
  return audioFlash;
}

function getAudioRowShear(rowIndex, cellWidth) {
  if (audioStarted == false) {
    return 0;
  }

  let direction = rowIndex % 2 == 0 ? 1 : -1;
  let wave = sin(frameCount * 0.08 + rowIndex * 0.35);
  return direction * wave * audioShear * cellWidth * 0.65;
}

function getAudioWaveColor(baseColor, flashAmount) {
  if (audioStarted == false) {
    return baseColor;
  }

  return lerpColor(baseColor, getPaletteColor("sunYellow"), constrain(flashAmount, 0, 0.55));
}
