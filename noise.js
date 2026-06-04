//controls ocean movement, reflection lines and sea wave transformation

let noiseTime = 0;
let noiseSpeed = 0.013;
let oceanNoiseScale = 0.08;
let reflectionMoveStrength = 0.45;
let foamNoiseScale = 0.12;

function drawNoiseMechanic() {
  noiseTime += noiseSpeed;
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy < horizonY) {
      drawOriginalBasedSkyChange(segment);
    } else {
      drawNoiseOceanCell(segment);
    }
  }
}

//The shape and color changes of the waves
function drawNoiseOceanCell(segment) {
  if (segment.colorName == "darkBlue") {
    drawMovingWaveCross(segment);

  } else if (segment.colorName == "skyBlue") {
    drawNoisyReflectionLines(segment);

  } else if (segment.colorName == "softOrange") {
    noStroke();
    fill(segment.color);
    rect(segment.x, segment.y, segment.width, segment.height);

  } else if (segment.colorName == "goldenOrange") {
    drawMovingWaveCross(segment);

  } else if (segment.colorName == "pinkPurple") {
    drawNoisyReflectionLines(segment);

  } else if (segment.colorName == "sunYellow") {
    drawNoisyReflectionLines(segment);

  } else if (segment.colorName == "foamGrey") {
    drawMorphingFoam(segment);

  } else if (segment.colorName == "creamYellow") {
    drawMorphingFoam(segment);
  }
}

//combines sine wave and Perlin noise - the ocean rise and fall smoothly
function getWaveAmount(segment) {
  let gridX = segment.x / segment.width;
  let gridY = segment.y / segment.height;
  let wave = sin(gridY * 0.85 + gridX * 0.16 - noiseTime * 5.0);

  //I used Perlin noise to create smooth, continuous wave movement.
  let softNoise = noise(
    gridX * 0.08,
    gridY * 0.08,
    noiseTime * 0.45
  );

  let amount = map(wave, -1, 1, 0, 1);
  amount = amount * 0.75 + softNoise * 0.25;
  return amount;
}

function drawNoisyReflectionLines(segment) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;
  let gridX = x / w;
  let gridY = y / h;

  let n1 = noise(
    gridX * oceanNoiseScale,
    gridY * oceanNoiseScale,
    noiseTime
  );

  let n2 = noise(
    gridX * oceanNoiseScale + 20,
    gridY * oceanNoiseScale + 20,
    noiseTime
  );

  let yOffset1 = map(
    n1,
    0,
    1,
    -h * reflectionMoveStrength,
    h * reflectionMoveStrength
  );

  let yOffset2 = map(
    n2,
    0,
    1,
    -h * reflectionMoveStrength,
    h * reflectionMoveStrength
  );

  stroke(segment.color);
  strokeWeight(1);

  line(
    x + w * 0.18,
    y + h * 0.38 + yOffset1,
    x + w * 0.82,
    y + h * 0.38 + yOffset1
  );

  line(
    x + w * 0.18,
    y + h * 0.62 + yOffset2,
    x + w * 0.82,
    y + h * 0.62 + yOffset2
  );
}

function drawMorphingFoam(segment) {
  let waveAmount = getWaveAmount(segment);
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;
  let gridX = x / w;
  let gridY = y / h;

  let moveY = map(waveAmount, 0, 1, h * 0.18, -h * 0.3);
  let scaleAmount = map(waveAmount, 0, 1, 0.55, 1.35);

  let morph = noise(
    gridX * foamNoiseScale + 40,
    gridY * foamNoiseScale + 40,
    noiseTime * 0.9
  );

  push();
  translate(x + w / 2, y + h / 2 + moveY);

  if (morph < 0.25) {
    noStroke();
    fill(segment.color);
    circle(0, 0, w * 0.36 * scaleAmount);

  } else if (morph < 0.5) {
    noStroke();
    fill(segment.color);
    rectMode(CENTER);
    rect(0, 0, w * 0.65 * scaleAmount, h * 0.65 * scaleAmount);
    rectMode(CORNER);

  } else if (morph < 0.75) {
    stroke(segment.color);
    strokeWeight(max(1, w * 0.08 * scaleAmount));
    line(-w * 0.25 * scaleAmount, 0, w * 0.25 * scaleAmount, 0);
    line(0, -h * 0.25 * scaleAmount, 0, h * 0.25 * scaleAmount);

  } else {
    noStroke();
    fill(segment.color);

    let dotSize = w * 0.22 * scaleAmount;
    circle(-w * 0.18, -h * 0.15, dotSize);
    circle(w * 0.18, -h * 0.1, dotSize);
    circle(-w * 0.12, h * 0.16, dotSize);
    circle(w * 0.16, h * 0.18, dotSize);
  }

  pop();
}

//moves the cross marks - wave shadows under the spindrift
function drawMovingWaveCross(segment) {
  let waveAmount = getWaveAmount(segment);
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  let moveY = map(waveAmount, 0, 1, h * 0.1, -h * 0.12);
  let scaleAmount = map(waveAmount, 0, 1, 0.75, 1.15);

  stroke(segment.color);
  strokeWeight(2);

  push();
  translate(x + w / 2, y + h / 2 + moveY);

  line(-w * 0.25 * scaleAmount, 0, w * 0.25 * scaleAmount, 0);
  line(0, -h * 0.25 * scaleAmount, 0, h * 0.25 * scaleAmount);

  pop();
}

// large slow cloud movement
function drawOriginalBasedSkyChange(segment) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  let gridX = x / w;
  let gridY = y / h;

  let cloudMove = noise(
    gridX * 0.035 - noiseTime * 0.18,
    gridY * 0.035,
    noiseTime * 0.08
  );

  let breathe = map(sin(noiseTime * 0.8), -1, 1, 0.35, 0.75);
  if (segment.colorName == "skyBlue") {
     let blueBreath = map(
     sin(noiseTime * 0.5 + gridX * 0.05),
     -1,
     1,
     180,
     255
   );

  noStroke();
  fill(146, 178, 221, blueBreath);
  rect(x, y, w, h);
}

  if (segment.colorName == "goldenOrange") {
    let crossAppear = noise(
      gridX * 0.04 - noiseTime * 0.15,
      gridY * 0.04,
      noiseTime * 0.1
    );

    if (crossAppear > 0.42) {
      drawSoftOriginalCross(segment, crossAppear);
    } else {
      noStroke();
      fill(getPaletteColor("softOrange"));
      rect(x, y, w, h);
    }
  }

  if (segment.colorName == "pinkPurple") {
    let lineAppear = noise(
      gridX * 0.04 - noiseTime * 0.12 + 20,
      gridY * 0.04 + 20,
      noiseTime * 0.1
    );

    if (lineAppear > 0.45) {
      drawSoftOriginalLines(segment, lineAppear);
    } else {
      noStroke();
      fill(getPaletteColor("softOrange"));
      rect(x, y, w, h);
    }
  }
}

function drawSoftOriginalCross(segment, amount) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  let moveY = sin(noiseTime * 1.2 + x * 0.01) * h * 0.08;
  let scaleAmount = map(amount, 0.42, 1, 0.55, 1.1);

  stroke(getPaletteColor("goldenOrange"));
  strokeWeight(2);

  push();
  translate(x + w / 2, y + h / 2 + moveY);
  line(-w * 0.25 * scaleAmount, 0, w * 0.25 * scaleAmount, 0);
  line(0, -h * 0.25 * scaleAmount, 0, h * 0.25 * scaleAmount);
  pop();
}

function drawSoftOriginalLines(segment, amount) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  let moveX = sin(noiseTime * 1.1 + y * 0.01) * w * 0.08;

  stroke(getPaletteColor("pinkPurple"));
  strokeWeight(1);

  line(x + w * 0.16 + moveX, y + h * 0.3, x + w * 0.84 + moveX, y + h * 0.3);
  line(x + w * 0.16 + moveX, y + h * 0.5, x + w * 0.84 + moveX, y + h * 0.5);
  line(x + w * 0.16 + moveX, y + h * 0.7, x + w * 0.84 + moveX, y + h * 0.7);
}