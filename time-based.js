
//STEP 1: replaces the shaped-grid with ASCII characters
//260605 remove the base rects(except sun and sunGlow) to prevent overlap the noise animation

//STEP 2: spreading animation interact with noise
//spread progress accumulates over time, speed influenced by noise waves
let spreadProgress = 0;

//after 3 sec the artwork becomes dynamic
let startDelay = 180;

//AI usage: the ring-based spreading method (isInTimeSpread) was developed with AI assistance.
//it uses dist() to measure each cell's distance from the centre, and a moving ring
//determines which cells show ASCII characters at any moment.
//the ring loops so the artwork cycles between noise shapes and ASCII characters.

//the wave expands from the centre and loops, so animation switch between ASCII and noise
function isInTimeSpread(segment) {
  //nothing spreads during the delay
  if (frameCount < startDelay) {
    return false;
  }

  let cx = segment.x + segment.width / 2;
  let cy = segment.y + segment.height / 2;

  let spreadCenterX = width / 2;
  let spreadCenterY = height * horizonLine;

  let d = dist(cx, cy, spreadCenterX, spreadCenterY);
  let maxD = dist(0, 0, spreadCenterX, spreadCenterY);

  let spreadRadius = spreadProgress * maxD;
  let ringWidth = maxD * 0.25;

  return abs(d - spreadRadius) < ringWidth;
}

//the noise waves make it faster or slower
function updateSpreadProgress() {
  //wait before starting
  if (frameCount < startDelay) {
    return;
  }

  //noiseTime is from noise.js, sin gives a wave that goes -1 to 1
  let waveInfluence = map(sin(noiseTime * 5), -1, 1, 0.5, 1.5);
  spreadProgress = spreadProgress + waveInfluence * 0.001;

  //loop back to 0 when it reaches 1
  if (spreadProgress > 1) {
    spreadProgress = 0;
  }
}

//make the ASCII characters float up and down with the wave
//ocean characters follow the wave data from noise.js and sky ones follow the cloud drift from noise.js
function getWaveOffset(segment) {
  let horizonY = height * horizonLine;
  let cy = segment.y + segment.height / 2;

  if (cy >= horizonY) {
    let waveAmount = getWaveAmount(segment);
    return map(waveAmount, 0, 1, segment.height * 0.1, -segment.height * 0.12);
  } else {
    //sky: movement syncs with noise's cloud drift using noiseTime from noise.js
    return sin(noiseTime * 1.2 + segment.x * 0.01) * segment.height * 0.08;
  }
}

//check if a character should appear, using the same values from noise.js so ASCII gaps match the noise gaps
function shouldCharAppear(segment) {
  let gridX = segment.x / segment.width;
  let gridY = segment.y / segment.height;

  if (segment.colorName == "goldenOrange") {
    let appear = noise(gridX * 0.04 - noiseTime * 0.15, gridY * 0.04, noiseTime * 0.1);
    return appear > 0.42;
  }
  if (segment.colorName == "pinkPurple") {
    let appear = noise(gridX * 0.04 - noiseTime * 0.12 + 20, gridY * 0.04 + 20, noiseTime * 0.1);
    return appear > 0.45;
  }
  //other cell types always show
  return true;
}

function drawTimeBased() {
  //replaces the shaped-grid with ASCII characters
  //add a new funtion
  updateSpreadProgress();
  
  drawSunASCII();
  drawSunGlowASCII();
  drawSkyCrossASCII();
  drawSkyLinesASCII();
  drawOceanPurpleASCII();
  drawOceanSunASCII();
  drawOceanYellowASCII();
  drawOceanBlueASCII();
  drawOceanDarkASCII();
  drawOceanFoamASCII();
  drawOceanCreamASCII();
}

//replace sunYellow rect in the sky with "@"
function drawSunASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy < horizonY) {
      if (segment.colorName == "sunYellow") {
        if (isInTimeSpread(segment)) {
          let moveY = getWaveOffset(segment);

          //cover the sun glow dots underneath
          noStroke();
          fill(getPaletteColor("softOrange"));
          rect(segment.x, segment.y, segment.width, segment.height);

          fill(getPaletteColor(segment.colorName));
          textAlign(CENTER, CENTER);
          textSize(segment.width * 0.9);
          text("@", segment.x + segment.width / 2, segment.y + segment.height / 2 + moveY);
        }
      }
    }
  }
}

//replace sun glow dots with "::"
function drawSunGlowASCII() {
  let horizonY = height * horizonLine;
  let sunCentreX = width / 2;
  let sunRange = width * 0.15;

  for (let segment of segmentArr) {
    let cx = segment.x + segment.width / 2;
    let cy = segment.y + segment.height / 2;

    let nearSun = false;
    if (abs(cx - sunCentreX) < sunRange) {
      if (cy > horizonY * 0.7) {
        if (cy < horizonY) {
          nearSun = true;
        }
      }
    }

    if (nearSun) {
      if (isInTimeSpread(segment)) {
        let moveY = getWaveOffset(segment);

        if (segment.colorName == "softOrange") {
          noStroke();
          fill(getPaletteColor("softOrange"));
          rect(segment.x, segment.y, segment.width, segment.height);

          fill(getPaletteColor("creamYellow"));
          textAlign(CENTER, CENTER);
          textSize(segment.width * 1.2);
          text("::", cx, cy + moveY);
        } else if (segment.colorName == "creamYellow") {
          noStroke();
          fill(getPaletteColor("softOrange"));
          rect(segment.x, segment.y, segment.width, segment.height);

          fill(getPaletteColor("creamYellow"));
          textAlign(CENTER, CENTER);
          textSize(segment.width * 1.2);
          text("::", cx, cy + moveY);
        }
      }
    }
  }
}

//replace goldenOrange crosses in the sky with "+"
function drawSkyCrossASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy < horizonY) {
      if (segment.colorName == "goldenOrange") {
        if (isInTimeSpread(segment)) {
          if (shouldCharAppear(segment)) {
            let moveY = getWaveOffset(segment);

            noStroke();
            fill(getPaletteColor(segment.colorName));
            textAlign(CENTER, CENTER);
            textSize(segment.width * 1);
            text("+", segment.x + segment.width / 2, segment.y + segment.height / 2 + moveY);
          }
        }
      }
    }
  }
}

//replace pinkPurple horizontal lines in the sky with "="
function drawSkyLinesASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy < horizonY) {
      if (segment.colorName == "pinkPurple") {
        if (isInTimeSpread(segment)) {
          if (shouldCharAppear(segment)) {
            let moveY = getWaveOffset(segment);

            noStroke();
            fill(getPaletteColor(segment.colorName));
            textAlign(CENTER, CENTER);
            textSize(segment.width * 1);
            text("=", segment.x + segment.width / 2, segment.y + segment.height / 2 + moveY);
          }
        }
      }
    }
  }
}

//replace pinkPurple reflection lines in the ocean with "~"
function drawOceanPurpleASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      if (segment.colorName == "pinkPurple") {
        if (isInTimeSpread(segment)) {
          let moveY = getWaveOffset(segment);

          noStroke();
          fill(getPaletteColor(segment.colorName));
          textAlign(CENTER, CENTER);
          textSize(segment.width * 1);
          text("~", segment.x + segment.width / 2, segment.y + segment.height / 2 + moveY);
        }
      }
    }
  }
}

//replace goldenOrange crosses in the ocean with "*"
function drawOceanSunASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      if (segment.colorName == "goldenOrange") {
        if (isInTimeSpread(segment)) {
          let moveY = getWaveOffset(segment);

          noStroke();
          fill(getPaletteColor(segment.colorName));
          textAlign(CENTER, CENTER);
          textSize(segment.width * 1.5);
          text("*", segment.x + segment.width / 2, segment.y + segment.height * 0.8 + moveY);
        }
      }
    }
  }
}

//replace sunYellow reflection lines in the ocean with "-"
function drawOceanYellowASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      if (segment.colorName == "sunYellow") {
        if (isInTimeSpread(segment)) {
          let moveY = getWaveOffset(segment);

          noStroke();
          fill(getPaletteColor(segment.colorName));
          textAlign(CENTER, CENTER);
          textSize(segment.width * 1.2);
          text("-", segment.x + segment.width / 2, segment.y + segment.height / 2 + moveY);
        }
      }
    }
  }
}

//replace skyBlue reflection lines in the ocean with "~"
function drawOceanBlueASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      if (segment.colorName == "skyBlue") {
        if (isInTimeSpread(segment)) {
          let moveY = getWaveOffset(segment);

          noStroke();
          fill(getPaletteColor(segment.colorName));
          textAlign(CENTER, CENTER);
          textSize(segment.width * 1.2);
          text("~", segment.x + segment.width / 2, segment.y + segment.height / 2 + moveY);
        }
      }
    }
  }
}

//replace darkBlue crosses in the ocean with "#"
function drawOceanDarkASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      if (segment.colorName == "darkBlue") {
        if (isInTimeSpread(segment)) {
          let moveY = getWaveOffset(segment);

          noStroke();
          fill(getPaletteColor(segment.colorName));
          textAlign(CENTER, CENTER);
          textSize(segment.width * 1);
          text("#", segment.x + segment.width / 2, segment.y + segment.height / 2 + moveY);
        }
      }
    }
  }
}

//replace foamGrey in the ocean with morphing ASCII
//the character changes with spreadProgress so it evolves over time
function drawOceanFoamASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      if (segment.colorName == "foamGrey") {
        if (isInTimeSpread(segment)) {
          let moveY = getWaveOffset(segment);

          //character evolves with time progress: o / * %
          //floor() rounds down to a whole number, % loops the index back to 0-3
          //reference: https://p5js.org/reference/p5/floor/
          let foamChars = ["o", "/", "*", "%"];
          let charIndex = floor(spreadProgress * 8) % 4;
          let foamChar = foamChars[charIndex];

          noStroke();
          fill(getPaletteColor(segment.colorName));
          textAlign(CENTER, CENTER);
          textSize(segment.width * 1);
          text(foamChar, segment.x + segment.width / 2, segment.y + segment.height / 2 + moveY);
        }
      }
    }
  }
}

//replace creamYellow in the ocean with growing bubble ASCII
function drawOceanCreamASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      if (segment.colorName == "creamYellow") {
        if (isInTimeSpread(segment)) {
          let moveY = getWaveOffset(segment);

          //bubble grows with time progress: . o 0 O
          //floor() rounds down to a whole number, % loops the index back to 0-3
          let bubbleChars = [".", "o", "0", "O"];
          let charIndex = floor(spreadProgress * 8) % 4;
          let foamChar = bubbleChars[charIndex];

          noStroke();
          fill(getPaletteColor(segment.colorName));
          textAlign(CENTER, CENTER);
          textSize(segment.width * 1);
          text(foamChar, segment.x + segment.width / 2, segment.y + segment.height / 2 + moveY);
        }
      }
    }
  }
}
