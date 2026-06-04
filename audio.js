// Audio mechanic: microphone / music controls the grid movement.
// Bass = slow elastic pulse, mid = row shearing, treble = fast noise + flicker.

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

  if (audioStarted == false) {
    return;
  }

  drawAudioReactiveOcean();
}

function updateAudioLevels() {
  if (audioStarted == false) {
    audioBass = lerp(audioBass, 0, 0.08);
    audioMid = lerp(audioMid, 0, 0.08);
    audioTreble = lerp(audioTreble, 0, 0.08);
    return;
  }

  audioFFT.analyze();

  let rawBass = audioFFT.getEnergy("bass");
  let rawMid = audioFFT.getEnergy("mid");
  let rawTreble = audioFFT.getEnergy("treble");

  audioBass = lerp(audioBass, map(rawBass, 0, 255, 0, 1), 0.18);
  audioMid = lerp(audioMid, map(rawMid, 0, 255, 0, 1), 0.16);
  audioTreble = lerp(audioTreble, map(rawTreble, 0, 255, 0, 1), 0.28);

  audioElasticity = constrain(audioBass * 1.25, 0, 1);
  audioShear = constrain(audioMid * 1.1, 0, 1);
  audioFlash = constrain(audioTreble * 1.35, 0, 1);
}

function controlNoiseWithAudio() {
  // Low sounds keep the textile heavy and slow; high sounds make it ripple quickly.
  let targetNoiseSpeed = baseNoiseSpeed;

  if (audioStarted) {
    targetNoiseSpeed = map(audioTreble, 0, 1, 0.006, 0.055);
    targetNoiseSpeed += audioMid * 0.012;
    targetNoiseSpeed -= audioBass * 0.004;
  }

  noiseSpeed = lerp(noiseSpeed, constrain(targetNoiseSpeed, 0.004, 0.065), 0.1);
}

function drawAudioReactiveOcean() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      drawAudioCell(segment);
    }
  }
}

function drawAudioCell(segment) {
  let rowIndex = floor(segment.y / segment.height);
  let colIndex = floor(segment.x / segment.width);

  let centerX = width / 2;
  let centerY = height * 0.72;
  let cx = segment.x + segment.width / 2;
  let cy = segment.y + segment.height / 2;

  let fromCenterX = cx - centerX;
  let fromCenterY = cy - centerY;
  let pulse = sin(frameCount * 0.18 + rowIndex * 0.12) * audioElasticity;
  let pull = map(audioElasticity, 0, 1, 1, 0.86 + pulse * 0.05);
  let shearDirection = rowIndex % 2 == 0 ? 1 : -1;
  let shearX = shearDirection * audioShear * segment.width * 1.4;

  push();
  translate(
    centerX + fromCenterX * pull + shearX,
    centerY + fromCenterY * pull
  );

  if (segment.colorName == "darkBlue" || segment.colorName == "goldenOrange") {
    drawAudioCross(segment, colIndex, rowIndex);
  } else if (segment.colorName == "skyBlue" || segment.colorName == "pinkPurple" || segment.colorName == "sunYellow") {
    drawAudioSignalLines(segment, rowIndex);
  } else if (segment.colorName == "foamGrey" || segment.colorName == "creamYellow") {
    drawAudioFoam(segment, colIndex, rowIndex);
  }

  pop();
}

function drawAudioCross(segment, colIndex, rowIndex) {
  let w = segment.width;
  let h = segment.height;
  let flicker = noise(colIndex * 0.3, rowIndex * 0.3, frameCount * 0.08);
  let scaleAmount = 0.7 + audioElasticity * 0.55 + audioFlash * 0.35;
  let weight = 1 + audioFlash * 3;

  if (flicker < audioFlash * 0.45) {
    stroke(getPaletteColor("sunYellow"));
  } else {
    stroke(segment.color);
  }

  strokeWeight(weight);
  line(-w * 0.28 * scaleAmount, 0, w * 0.28 * scaleAmount, 0);
  line(0, -h * 0.28 * scaleAmount, 0, h * 0.28 * scaleAmount);
}

function drawAudioSignalLines(segment, rowIndex) {
  let w = segment.width;
  let h = segment.height;
  let jitter = sin(frameCount * 0.45 + rowIndex) * audioFlash * h * 0.28;

  stroke(segment.color);
  strokeWeight(1 + audioTreble * 2);
  line(-w * 0.34, -h * 0.12 + jitter, w * 0.34, -h * 0.12 + jitter);
  line(-w * 0.34, h * 0.15 - jitter, w * 0.34, h * 0.15 - jitter);
}

function drawAudioFoam(segment, colIndex, rowIndex) {
  let w = segment.width;
  let flicker = noise(colIndex * 0.45 + 10, rowIndex * 0.45 + 10, frameCount * 0.12);
  let dotSize = w * (0.18 + audioElasticity * 0.28 + audioFlash * 0.2);

  noStroke();
  if (flicker < audioFlash * 0.5) {
    fill(getPaletteColor("sunYellow"));
  } else {
    fill(segment.color);
  }

  circle(0, 0, dotSize);
}
