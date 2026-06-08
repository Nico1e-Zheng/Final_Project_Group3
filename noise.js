// STEP 1: add noise movement to the original sunset grid
// the ocean moves like waves, and the sky changes slowly like clouds

// STEP 2: connect this noise part with the time ASCII part
// the noise starts after a short still moment and does not draw over the time characters

// STEP 3: add a small seagull trail
// when the seagull moves across the sky, nearby cells make a soft wake effect

// controls ocean movement, reflection lines and wave shape changes
let noiseTime = 0;
let noiseSpeed = 0.013;
let oceanNoiseScale = 0.08;
let reflectionMoveStrength = 0.45;
let foamNoiseScale = 0.12;

// random offset makes each noise field
let noiseRandomOffset = 0;

// short pause first, then fade the noise mechanic in
let noiseStartDelay = 35;
let noiseFadeInFrames = 10;

// set up one random value for the noise mechanic
function setupNoiseMechanic() {
  noiseRandomOffset = random(1000);
}

function getActiveColor(colorName) {
  // use the shared palette function from sketch.js
  // this also connects to the user-input tone colour system
  return getPaletteColor(colorName);
}

// AI usage: the fade-in transition and time ASCII overlap check were refined with AI.
// I adapted them so the noise mechanic appears after a short still image
// and avoids overlapping with the time mechanic.
function drawNoiseMechanic() {
  let fadeAmount = 0;
  if (frameCount > noiseStartDelay) {
    fadeAmount = (frameCount - noiseStartDelay) / noiseFadeInFrames;
    fadeAmount = constrain(fadeAmount, 0, 1);
  }
  // keep the original ocean visible for a short start transition
  if (fadeAmount < 1) {
    drawOceanOverlap();
  }
  // before noise starts, only show the still original image
  if (fadeAmount == 0) {
    return;
  }
  noiseTime += noiseSpeed * fadeAmount;
  let horizonY = height * horizonLine;
  push();
  drawingContext.globalAlpha = fadeAmount;
  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;
    let inTimeSpread = false;
    if (typeof isInTimeSpread === "function") {
      inTimeSpread = isInTimeSpread(segment);
    }
    // keep showing the seagull trail
    if (cy < horizonY) {
      let seagullWake = getSeagullWakeInfluence(segment);
      if (seagullWake > 0.08) {
        drawSeagullSkyWake(segment, seagullWake);
        continue;
      }
    }
    if (inTimeSpread) {
      continue;
    }
    if (cy < horizonY) {
      drawOriginalBasedSkyChange(segment);
    } else {
      drawNoiseOceanCell(segment);
    }
  }

  pop();
  drawingContext.globalAlpha = 1;
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
    gridX * 0.08 + noiseRandomOffset,
    gridY * 0.08 + noiseRandomOffset,
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
  let n1 = noise( gridX * oceanNoiseScale, gridY * oceanNoiseScale, noiseTime );
  let n2 = noise( gridX * oceanNoiseScale + 20, gridY * oceanNoiseScale + 20, noiseTime );
  let yOffset1 = map( n1, 0, 1, -h * reflectionMoveStrength, h * reflectionMoveStrength );
  let yOffset2 = map( n2, 0, 1, -h * reflectionMoveStrength, h * reflectionMoveStrength);

  stroke(segment.color);
  strokeWeight(1);
  line( x + w * 0.18, y + h * 0.38 + yOffset1, x + w * 0.82, y + h * 0.38 + yOffset1 );
  line( x + w * 0.18, y + h * 0.62 + yOffset2, x + w * 0.82, y + h * 0.62 + yOffset2 );
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
    gridX * foamNoiseScale + 40 + noiseRandomOffset,
    gridY * foamNoiseScale + 40 + noiseRandomOffset,
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
  let cx = x + w / 2;
  let cy = y + h / 2;
  let gridX = x / w;
  let gridY = y / h;

  let horizonY = height * horizonLine;
  let sunCentreX = width / 2;
  let sunCentreY = horizonY * 0.82;
  let sunRange = width * 0.15;

  // Check whether the time mechanic is loaded before using its spread area.
  let nearSunDots = false;
  if (abs(cx - sunCentreX) < sunRange) {
    if (cy > horizonY * 0.7) {
      if (cy < horizonY) {
        nearSunDots = true;
      }
    }
  }
  let seagullWake = getSeagullWakeInfluence(segment);
  if (seagullWake > 0.08 && nearSunDots == false) {
    drawSeagullSkyWake(segment, seagullWake);
    return;
  }
  if (nearSunDots) {
  // the sun body
    if (segment.colorName == "sunYellow") {
      drawBreathingSunCell(segment);
      return;
    }
    let isSunGlowColor = false;
    if (segment.colorName == "softOrange") {
      isSunGlowColor = true;
    }
    if (segment.colorName == "creamYellow") {
      isSunGlowColor = true;
    }
    if (isSunGlowColor) {
      noStroke();
      fill(getActiveColor("softOrange"));
      rect(x, y, w, h);
      let dotAppear = noise( gridX * 0.04 - noiseTime * 0.15, gridY * 0.04, noiseTime * 0.1 );
      if (dotAppear > 0.25) {
        let sunDist = dist(cx, cy, sunCentreX, sunCentreY);
        let pulse = map( sin(sunDist * 0.07 - frameCount * 0.14), -1, 1, 0.55, 1.3 );
        let dotScale = map(dotAppear, 0.25, 1, 0.35, 1.05);
        let dotSize = w * 0.38 * dotScale * pulse;
        noStroke();
        fill(getActiveColor("creamYellow"));
        circle(x + w * 0.3, y + h * 0.3, dotSize);
        circle(x + w * 0.7, y + h * 0.3, dotSize * 0.9);
        circle(x + w * 0.3, y + h * 0.7, dotSize * 0.85);
        circle(x + w * 0.7, y + h * 0.7, dotSize);
      }
      return;
    }
  }

  // blue cloud movement
  if (segment.colorName == "skyBlue") {
    let cloudAppear = noise( gridX * 0.035 - noiseTime * 0.12, gridY * 0.035, noiseTime * 0.08 );
    let nearbyCloud = noise( (gridX + 2) * 0.035 - noiseTime * 0.12, gridY * 0.035, noiseTime * 0.08 );
    if (cloudAppear > 0.42 || nearbyCloud > 0.46) {
      noStroke();
      fill(segment.color);
      rect(x, y, w, h);
    } else {
      noStroke();
      fill(getActiveColor("softOrange"));
      rect(x, y, w, h);
    }
  }

  // orange cross change
  else if (segment.colorName == "goldenOrange") {
    let crossAppear = noise( gridX * 0.04 - noiseTime * 0.15, gridY * 0.04, noiseTime * 0.1 );
    let sunDist = dist(cx, cy, sunCentreX, sunCentreY);
    let innerRadius = width * 0.08;
    let outerRadius = width * 0.18;
    let sunInfluence = map(sunDist, innerRadius, outerRadius, 1, 0);
    sunInfluence = constrain(sunInfluence, 0, 1);
    let appearThreshold = map(sunInfluence, 0, 1, 0.42, 0.05);

    if (crossAppear > appearThreshold) {
      let crossAmount = map(crossAppear, 0, 1, 0.55, 1.15);
      crossAmount = crossAmount * (0.75 + sunInfluence * 0.25);
      drawSoftOriginalCross(segment, crossAmount);
    } else {
      noStroke();
      fill(getActiveColor("softOrange"));
      rect(x, y, w, h);
    }

  } else if (segment.colorName == "pinkPurple") {
    let lineAppear = noise( gridX * 0.04 - noiseTime * 0.12 + 20, gridY * 0.04 + 20, noiseTime * 0.1 );
    if (lineAppear > 0.45) {
      drawSoftOriginalLines(segment, lineAppear);
    } else {
      noStroke();
      fill(getActiveColor("softOrange"));
      rect(x, y, w, h);
    }
  } else if (segment.colorName == "creamYellow") {
    noStroke();
    fill(getActiveColor("softOrange"));
    rect(x, y, w, h);
  }
}

function drawSoftOriginalCross(segment, amount) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;
  let moveY = sin(noiseTime * 1.2 + x * 0.01) * h * 0.08;
  let scaleAmount = map(amount, 0.42, 1, 0.55, 1.1);
  stroke(getActiveColor("goldenOrange"));
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
  stroke(getActiveColor("pinkPurple"));
  strokeWeight(1);
  line(x + w * 0.16 + moveX, y + h * 0.3, x + w * 0.84 + moveX, y + h * 0.3);
  line(x + w * 0.16 + moveX, y + h * 0.5, x + w * 0.84 + moveX, y + h * 0.5);
  line(x + w * 0.16 + moveX, y + h * 0.7, x + w * 0.84 + moveX, y + h * 0.7);
}

// the sun breathing movement
function drawBreathingSunCell(segment) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;
  let pulse = map( sin(frameCount * 0.055 + x * 0.02 + y * 0.02), -1, 1, 0.94, 1.06 );
  let sunColor = getActiveColor("sunYellow");
  let warmShadowColor = getActiveColor("goldenOrange");

  // make the sun slightly darker and warmer 
  let mixAmount = map(pulse, 0.94, 1.06, 0.35, 0.08);
  // It makes the sun softly shift between yellow and orange.
  let breathingColor = lerpColor(sunColor, warmShadowColor, mixAmount);
  noStroke();
  fill(breathingColor);
  let newW = w * pulse;
  let newH = h * pulse;
  rect( x + (w - newW) / 2, y + (h - newH) / 2, newW, newH );
}

// AI usage: the seagull wake influence method was refined with AI.
// I adapted it to check the seagull path and create a short soft trail.

// check if this sky cell is near the seagull path
function getSeagullWakeInfluence(segment) {
  if (typeof seagullAnimations == "undefined") {
    return 0;
  }
  if (seagullAnimations.length == 0) {
    return 0;
  }
  let cx = segment.x + segment.width / 2;
  let cy = segment.y + segment.height / 2;
  let cellSize = segment.width;
  let strongest = 0;

  for (let bird of seagullAnimations) {
    let currentT = (millis() - bird.startTime) / bird.duration;
    // keep the animation progress between 0 and 1
    currentT = constrain(currentT, 0, 1);
    for (let i = 0; i < 7; i++) {
      let oldT = currentT - i * 0.045;
      if (oldT < 0) {
        continue;
      }
      let easedT = -(cos(PI * oldT) - 1) / 2;
      let oldX = lerp(bird.startX, bird.endX, easedT);
      let oldBaseY = lerp(bird.startY, bird.endY, easedT);
      let oldY = oldBaseY + sin(easedT * TWO_PI * 2) * width * 0.015;
      let d = dist(cx, cy, oldX, oldY);
      let range = cellSize * map(i, 0, 6, 5.5, 2.3);
      if (d < range) {
        let influence = map(d, 0, range, 1, 0);
        influence = influence * map(i, 0, 6, 1, 0.22);
        strongest = max(strongest, influence);
      }
    }
  }
  // keep the final wake strength between 0 and 1
  return constrain(strongest, 0, 1);
}

// sky cells change like a soft wind trail after the seagull passes
function drawSeagullSkyWake(segment, wakeAmount) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;
  let gridX = x / w;
  let gridY = y / h;
  noStroke();
  fill(getActiveColor("softOrange"));
  rect(x, y, w, h);
  let drift = map( noise(gridX * 0.08 - noiseTime * 0.3, gridY * 0.08), 0, 1, -w * 0.25, w * 0.25 );

  if (segment.colorName == "skyBlue") {
    let c = getActiveColor("skyBlue");
    fill(red(c), green(c), blue(c), map(wakeAmount, 0, 1, 80, 210));
    rect(x + drift, y, w, h);
  } else if (segment.colorName == "goldenOrange") {
    drawSoftOriginalCross(segment, 0.8 + wakeAmount * 0.55);
  } else if (segment.colorName == "pinkPurple") {
    drawSoftOriginalLines(segment, 0.8 + wakeAmount * 0.55);
  } else {
    let c = getActiveColor("creamYellow");
    stroke(red(c), green(c), blue(c), map(wakeAmount, 0, 1, 60, 150));
    strokeWeight(max(1, w * 0.07 * wakeAmount));
    let lineY = y + h * 0.5 + sin(noiseTime * 2 + gridX) * h * 0.18;
    line(x + w * 0.15 + drift, lineY, x + w * 0.85 + drift, lineY);
  }
}