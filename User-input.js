// Current time tone
// 0 = Morning
// 1 = Noon
// 2 = Sunset
// 3 = Night

// AI Usage Instructions: AI assisted in generating the smooth color transition logic
// Colors transition smoothly between different tones instead of jumping directly to the next one
let toneValue = 2;

// Records the state of long-pressing the arrow keys
// Used to achieve continuous color changing
let toneHoldDirection = 0;

// Records the last color update time
// Used to calculate the color change speed
let lastToneUpdateTime = 0;

// Controls the color change speed when an arrow key is held down
let toneChangeSpeed = 0.45;

// AI Usage Instructions: AI assisted in generating the drag path and animation array structure
// Used to create the drag interaction that generates seagulls / dolphins
let isDrawingPath = false;
let currentPathArea = "";
let currentPathPoints = [];
let minPathDistance = 35;

let dolphinAnimations = [];
let seagullAnimations = [];

// Four time-tone palettes
// Uses an array to store objects, and each object contains a colors object
let timeTonePalettes = [
  {
    name: "Morning",
    colors: {
      skyBlue: [178, 205, 238],
      darkBlue: [92, 132, 168],
      oceanBlue: [145, 192, 222],
      softOrange: [238, 214, 228],
      goldenOrange: [248, 198, 188],
      pinkPurple: [206, 188, 224],
      sunYellow: [255, 242, 205],
      foamGrey: [190, 210, 236],
      creamYellow: [255, 235, 220]
    }
  },
  {
    name: "Noon",
    colors: {
      skyBlue: [105, 220, 246],
      darkBlue: [20, 130, 170],
      oceanBlue: [48, 200, 225],
      softOrange: [238, 252, 255],
      goldenOrange: [255, 235, 135],
      pinkPurple: [175, 218, 245],
      sunYellow: [255, 252, 215],
      foamGrey: [212, 245, 255],
      creamYellow: [255, 255, 235]
    }
  },
  {
    name: "Sunset",
    colors: {
      skyBlue: [146, 178, 221],
      darkBlue: [65, 93, 137],
      oceanBlue: [103, 142, 182],
      softOrange: [241, 186, 112],
      goldenOrange: [235, 145, 84],
      pinkPurple: [180, 120, 175],
      sunYellow: [255, 238, 160],
      foamGrey: [180, 180, 220],
      creamYellow: [250, 220, 190]
    }
  },
  {
    name: "Night",
    colors: {
      skyBlue: [22, 34, 95],
      darkBlue: [5, 14, 45],
      oceanBlue: [8, 35, 72],
      softOrange: [35, 32, 95],
      goldenOrange: [45, 65, 130],
      pinkPurple: [48, 44, 118],
      sunYellow: [170, 220, 230],
      foamGrey: [58, 82, 145],
      creamYellow: [140, 210, 230]
    }
  }
];

// AI Usage Instructions: AI assisted in generating continuous color changing with left/right arrow key long-presses
function keyPressed() {
  if (keyCode == RIGHT_ARROW) {
    toneHoldDirection = 1;
    lastToneUpdateTime = millis();
    return false;
  }

  if (keyCode == LEFT_ARROW) {
    toneHoldDirection = -1;
    lastToneUpdateTime = millis();
    return false;
  }
}

// AI Usage Instructions: AI assisted in generating the function that stops color changing when the arrow key is released
function keyReleased() {
  if (keyCode == RIGHT_ARROW) {
    toneHoldDirection = 0;
    return false;
  }

  if (keyCode == LEFT_ARROW) {
    toneHoldDirection = 0;
    return false;
  }
}

// Uses mouseX and mouseY to determine whether the drag starts from the sky or the sea
function mousePressed() {
  if (segmentArr.length > 0) {
    minPathDistance = segmentArr[0].width * 6;
  }

  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return;
  }

  isDrawingPath = true;
  currentPathPoints = [];

  let horizonY = height * horizonLine;

  if (mouseY < horizonY) {
    currentPathArea = "sky";
  } else {
    currentPathArea = "water";
  }

  currentPathPoints.push({
    x: mouseX,
    y: mouseY
  });
}

// Restricts sky paths to the sky area and sea paths to the sea area
function mouseDragged() {
  if (!isDrawingPath) {
    return false;
  }

  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return false;
  }

  let horizonY = height * horizonLine;

  if (currentPathArea == "sky" && mouseY >= horizonY) {
    return false;
  }

  if (currentPathArea == "water" && mouseY < horizonY) {
    return false;
  }

  let lastPoint = currentPathPoints[currentPathPoints.length - 1];
  let pointGap = max(10, segmentArr[0].width * 1.8);

  if (dist(mouseX, mouseY, lastPoint.x, lastPoint.y) >= pointGap) {
    currentPathPoints.push({
      x: mouseX,
      y: mouseY
    });
  }

  if (currentPathPoints.length > 80) {
    currentPathPoints.shift();
  }

  return false;
}

// Uses dist() to check the drag distance and generates the corresponding animation based on the area
function mouseReleased() {
  if (!isDrawingPath) {
    return;
  }

  isDrawingPath = false;

  if (currentPathPoints.length < 2) {
    currentPathPoints = [];
    currentPathArea = "";
    return;
  }

  let startPoint = currentPathPoints[0];
  let endPoint = currentPathPoints[currentPathPoints.length - 1];

  let pathLength = dist(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

  if (pathLength < minPathDistance) {
    currentPathPoints = [];
    currentPathArea = "";
    return;
  }

  if (currentPathArea == "water") {
    createDolphinAnimation(startPoint, endPoint);
  } else if (currentPathArea == "sky") {
    createSeagullAnimation(startPoint, endPoint);
  }

  currentPathPoints = [];
  currentPathArea = "";
}

// Uses beginShape() and vertex() to draw a continuous path
function drawCurrentDragPath() {
  if (!isDrawingPath || currentPathPoints.length < 2) {
    return;
  }

  push();

  noFill();

  if (currentPathArea == "sky") {
    stroke(255, 255, 255, 150);
  } else {
    stroke(170, 230, 255, 150);
  }

  strokeWeight(max(1, width * 0.002));

  beginShape();

  for (let p of currentPathPoints) {
    vertex(p.x, p.y);
  }

  endShape();

  pop();
}

// Stores the start point, end point, direction, start time, and duration
function createDolphinAnimation(startPoint, endPoint) {
  let horizonY = height * horizonLine;
  let cellSize = segmentArr[0].width;

  let baselineY = (startPoint.y + endPoint.y) / 2;

  baselineY = constrain(
    baselineY,
    horizonY + cellSize * 2,
    height - cellSize * 4
  );

  let direction;

  if (endPoint.x < startPoint.x) {
    direction = 1;
  } else {
    direction = -1;
  }

  dolphinAnimations.push({
    startX: startPoint.x,
    endX: endPoint.x,
    baseY: baselineY,
    direction: direction,
    startTime: millis(),
    duration: 1800
  });
}

// Uses constrain() to limit flight height and prevent the seagull from flying out of bounds
function createSeagullAnimation(startPoint, endPoint) {
  let horizonY = height * horizonLine;
  let cellSize = segmentArr[0].height;

  let startY = constrain(startPoint.y, cellSize * 2, horizonY - cellSize * 2);
  let endY = constrain(endPoint.y, cellSize * 2, horizonY - cellSize * 2);

  let direction;

  if (endPoint.x < startPoint.x) {
    direction = 1;
  } else {
    direction = -1;
  }

  seagullAnimations.push({
    startX: startPoint.x,
    startY: startY,
    endX: endPoint.x,
    endY: endY,
    direction: direction,
    startTime: millis(),
    duration: 2200
  });
}

// Uses millis(), lerp(), sin(), and an easing function to generate the dolphin jumping animation
function drawDolphinAnimations() {
  for (let i = dolphinAnimations.length - 1; i >= 0; i--) {
    let dolphin = dolphinAnimations[i];

    let t = (millis() - dolphin.startTime) / dolphin.duration;

    if (t >= 1) {
      dolphinAnimations.splice(i, 1);
      continue;
    }

    t = constrain(t, 0, 1);

    let easedT = easeInOutSine(t);

    let x = lerp(dolphin.startX, dolphin.endX, easedT);

    let jumpHeight = width * 0.13;
    let y = dolphin.baseY - sin(easedT * PI) * jumpHeight;

    let arcAngle = map(easedT, 0, 1, 0.58, -0.58);
    let angle = dolphin.direction * arcAngle;

    drawDolphinSplash(dolphin, easedT);
    drawLineDolphin(x, y, dolphin.direction, angle);
  }
}

// Uses millis(), lerp(), sin(), and wingPhase to create the seagull flying and wing-flapping animation
function drawSeagullAnimations() {
  for (let i = seagullAnimations.length - 1; i >= 0; i--) {
    let bird = seagullAnimations[i];

    let t = (millis() - bird.startTime) / bird.duration;

    if (t >= 1) {
      seagullAnimations.splice(i, 1);
      continue;
    }

    t = constrain(t, 0, 1);

    let easedT = easeInOutSine(t);

    let x = lerp(bird.startX, bird.endX, easedT);
    let baseY = lerp(bird.startY, bird.endY, easedT);

    let y = baseY + sin(easedT * TWO_PI * 2) * width * 0.015;

    let wingPhase = sin(easedT * TWO_PI * 6);

    drawLineSeagull(x, y, bird.direction, wingPhase);
  }
}

// Uses cos() and PI to calculate a smooth easing transition
function easeInOutSine(t) {
  return -(cos(PI * t) - 1) / 2;
}

// AI Usage Instructions: AI assisted in positioning and drawing the dolphin
// Uses translate(), rotate(), scale(), bezierVertex(), and lerpColor() to draw the dolphin
function drawLineDolphin(x, y, direction, angle) {
  let cellSize = segmentArr[0].width;
  let s = cellSize * 1.55;

  push();

  translate(x, y);
  rotate(angle);
  scale(-direction, 1);

  let bodyColor = color(160, 225, 245);
  let bellyColor = color(245, 248, 250);
  let outlineColor = color(20, 25, 30);
  let blushColor = color(255, 205, 220, 110);

  let nightMix = getTimeBlendToNight();

  bodyColor = lerpColor(bodyColor, color(95, 155, 205), nightMix);
  bellyColor = lerpColor(bellyColor, color(195, 210, 225), nightMix);
  outlineColor = lerpColor(outlineColor, color(18, 22, 40), nightMix);
  blushColor = lerpColor(blushColor, color(180, 130, 160, 80), nightMix);

  stroke(outlineColor);
  strokeWeight(max(1.8, s * 0.065));
  strokeJoin(ROUND);
  strokeCap(ROUND);

  fill(bodyColor);

  beginShape();
  vertex(2.52 * s, -0.02 * s);

  bezierVertex(2.72 * s, -0.18 * s, 2.68 * s, -0.42 * s, 2.35 * s, -0.52 * s);
  bezierVertex(
    1.95 * s,
    -1.1 * s,
    1.0 * s,
    -1.38 * s,
    0.12 * s,
    -1.18 * s
  );
  bezierVertex(
    -0.65 * s,
    -0.98 * s,
    -1.28 * s,
    -0.45 * s,
    -1.42 * s,
    0.18 * s
  );
  bezierVertex(
    -1.55 * s,
    0.52 * s,
    -1.85 * s,
    0.9 * s,
    -2.18 * s,
    1.02 * s
  );
  bezierVertex(
    -2.48 * s,
    1.12 * s,
    -2.72 * s,
    0.98 * s,
    -2.62 * s,
    0.76 * s
  );
  bezierVertex(
    -2.5 * s,
    0.62 * s,
    -2.22 * s,
    0.64 * s,
    -2.0 * s,
    0.84 * s
  );
  bezierVertex(
    -2.3 * s,
    1.06 * s,
    -2.4 * s,
    1.45 * s,
    -2.08 * s,
    1.62 * s
  );
  bezierVertex(
    -1.75 * s,
    1.78 * s,
    -1.38 * s,
    1.65 * s,
    -1.1 * s,
    1.35 * s
  );
  bezierVertex(
    -0.55 * s,
    1.9 * s,
    0.68 * s,
    1.45 * s,
    1.28 * s,
    0.72 * s
  );
  bezierVertex(1.82 * s, 0.38 * s, 2.2 * s, 0.2 * s, 2.48 * s, 0.1 * s);
  bezierVertex(2.72 * s, 0.08 * s, 2.7 * s, 0.0 * s, 2.52 * s, -0.02 * s);

  endShape(CLOSE);

  noStroke();
  fill(bellyColor);

  beginShape();
  vertex(0.62 * s, -0.12 * s);
  bezierVertex(0.18 * s, 0.18 * s, -0.45 * s, 0.8 * s, -0.88 * s, 1.28 * s);
  bezierVertex(-0.3 * s, 1.5 * s, 0.72 * s, 1.12 * s, 1.38 * s, 0.42 * s);
  bezierVertex(1.18 * s, 0.12 * s, 0.95 * s, -0.02 * s, 0.62 * s, -0.12 * s);
  endShape(CLOSE);

  fill(bodyColor);
  stroke(outlineColor);
  strokeWeight(max(1.6, s * 0.06));

  beginShape();
  vertex(0.06 * s, -1.02 * s);
  bezierVertex(-0.16 * s, -1.5 * s, -0.62 * s, -1.48 * s, -0.72 * s, -1.02 * s);
  bezierVertex(-0.38 * s, -0.95 * s, -0.1 * s, -0.94 * s, 0.06 * s, -1.02 * s);
  endShape(CLOSE);

  beginShape();
  vertex(0.62 * s, 0.34 * s);
  bezierVertex(0.52 * s, 0.86 * s, 0.22 * s, 1.02 * s, 0.0 * s, 0.7 * s);
  bezierVertex(0.08 * s, 0.42 * s, 0.28 * s, 0.28 * s, 0.62 * s, 0.34 * s);
  endShape(CLOSE);

  beginShape();
  vertex(1.42 * s, 0.4 * s);
  bezierVertex(1.42 * s, 0.86 * s, 1.18 * s, 1.0 * s, 0.98 * s, 0.78 * s);
  bezierVertex(1.0 * s, 0.5 * s, 1.14 * s, 0.34 * s, 1.42 * s, 0.4 * s);
  endShape(CLOSE);

  noStroke();
  fill(18, 18, 22);
  ellipse(1.62 * s, -0.42 * s, 0.24 * s, 0.32 * s);

  noFill();
  stroke(outlineColor);
  strokeWeight(max(1.2, s * 0.04));

  beginShape();
  vertex(2.06 * s, 0.02 * s);
  bezierVertex(2.2 * s, 0.12 * s, 2.38 * s, 0.14 * s, 2.52 * s, 0.08 * s);
  endShape();

  noStroke();
  fill(blushColor);
  ellipse(1.96 * s, -0.02 * s, 0.22 * s, 0.12 * s);

  pop();
}

// AI Usage Instructions: AI assisted in positioning and drawing the seagull
// Uses Bezier curves, wing-flapping parameters, feather-line loops, and coordinate transformations
function drawLineSeagull(x, y, direction, wingPhase) {
  let cellSize = segmentArr[0].width;
  let s = cellSize * 1.15;

  push();

  translate(x, y);
  scale(direction, 1);

  let bodyColor = color(220, 238, 248);
  let wingColor = color(195, 218, 235);
  let outlineColor = color(45, 55, 70);
  let tipColor = color(45, 45, 120);
  let beakColor = color(235, 180, 75);
  let footColor = color(230, 175, 60);

  let nightMix = getTimeBlendToNight();

  bodyColor = lerpColor(bodyColor, color(120, 145, 185), nightMix);
  wingColor = lerpColor(wingColor, color(95, 115, 160), nightMix);
  outlineColor = lerpColor(outlineColor, color(20, 25, 55), nightMix);
  tipColor = lerpColor(tipColor, color(20, 25, 80), nightMix);
  beakColor = lerpColor(beakColor, color(165, 120, 60), nightMix);

  strokeCap(ROUND);
  strokeJoin(ROUND);

  let flap = map(wingPhase, -1, 1, 0.25, -0.25);

  fill(wingColor);
  stroke(outlineColor);
  strokeWeight(max(1.4, s * 0.055));

  beginShape();
  vertex(-0.22 * s, -0.18 * s);
  bezierVertex(
    -0.85 * s,
    (-1.02 + flap) * s,
    -1.65 * s,
    (-2.02 + flap) * s,
    -2.62 * s,
    (-2.18 + flap) * s
  );
  bezierVertex(
    -2.65 * s,
    (-1.48 + flap) * s,
    -2.05 * s,
    (-0.62 + flap) * s,
    -0.72 * s,
    -0.02 * s
  );
  bezierVertex(
    -0.48 * s,
    -0.08 * s,
    -0.32 * s,
    -0.12 * s,
    -0.22 * s,
    -0.18 * s
  );
  endShape(CLOSE);

  fill(tipColor);

  beginShape();
  vertex(-2.58 * s, (-2.12 + flap) * s);
  bezierVertex(
    -3.05 * s,
    (-1.98 + flap) * s,
    -3.08 * s,
    (-1.55 + flap) * s,
    -2.58 * s,
    (-1.25 + flap) * s
  );
  bezierVertex(
    -2.62 * s,
    (-1.65 + flap) * s,
    -2.6 * s,
    (-1.9 + flap) * s,
    -2.58 * s,
    (-2.12 + flap) * s
  );
  endShape(CLOSE);

  stroke(outlineColor);
  strokeWeight(max(0.8, s * 0.026));

  for (let i = 0; i < 8; i++) {
    let px = map(i, 0, 7, -0.8, -2.25) * s;
    let py = map(i, 0, 7, -0.1 + flap, -1.75 + flap) * s;

    line(px, py, px + 0.42 * s, py + 0.38 * s);
  }

  fill(wingColor);
  stroke(outlineColor);
  strokeWeight(max(1.4, s * 0.055));

  beginShape();
  vertex(0.58 * s, -0.18 * s);
  bezierVertex(
    1.35 * s,
    (-1.12 + flap) * s,
    2.42 * s,
    (-2.35 + flap) * s,
    3.48 * s,
    (-2.55 + flap) * s
  );
  bezierVertex(
    3.42 * s,
    (-1.72 + flap) * s,
    2.65 * s,
    (-0.62 + flap) * s,
    1.0 * s,
    0.02 * s
  );
  bezierVertex(0.84 * s, -0.08 * s, 0.68 * s, -0.14 * s, 0.58 * s, -0.18 * s);
  endShape(CLOSE);

  fill(tipColor);

  beginShape();
  vertex(3.38 * s, (-2.48 + flap) * s);
  bezierVertex(
    3.92 * s,
    (-2.28 + flap) * s,
    3.95 * s,
    (-1.78 + flap) * s,
    3.42 * s,
    (-1.42 + flap) * s
  );
  bezierVertex(
    3.46 * s,
    (-1.88 + flap) * s,
    3.43 * s,
    (-2.22 + flap) * s,
    3.38 * s,
    (-2.48 + flap) * s
  );
  endShape(CLOSE);

  stroke(outlineColor);
  strokeWeight(max(0.8, s * 0.026));

  for (let i = 0; i < 10; i++) {
    let px = map(i, 0, 9, 1.05, 3.02) * s;
    let py = map(i, 0, 9, -0.05 + flap, -2.0 + flap) * s;

    line(px, py, px - 0.45 * s, py + 0.42 * s);
  }

  fill(bodyColor);
  stroke(outlineColor);
  strokeWeight(max(1.5, s * 0.055));

  beginShape();
  vertex(-1.95 * s, 0.05 * s);
  bezierVertex(-1.38 * s, -0.42 * s, -0.25 * s, -0.32 * s, 0.72 * s, -0.15 * s);
  bezierVertex(1.55 * s, 0.05 * s, 2.02 * s, 0.3 * s, 2.28 * s, 0.45 * s);
  bezierVertex(1.15 * s, 0.74 * s, -0.45 * s, 0.74 * s, -1.58 * s, 0.43 * s);
  bezierVertex(-2.18 * s, 0.25 * s, -2.36 * s, 0.08 * s, -1.95 * s, 0.05 * s);
  endShape(CLOSE);

  fill(bodyColor);
  stroke(outlineColor);
  ellipse(-2.0 * s, 0.05 * s, 0.62 * s, 0.45 * s);

  fill(beakColor);
  stroke(outlineColor);
  strokeWeight(max(0.9, s * 0.035));

  beginShape();
  vertex(-2.32 * s, 0.05 * s);
  vertex(-2.9 * s, 0.12 * s);
  vertex(-2.32 * s, 0.2 * s);
  endShape(CLOSE);

  noStroke();
  fill(20, 25, 35);
  circle(-2.05 * s, -0.03 * s, 0.075 * s);

  stroke(outlineColor);
  strokeWeight(max(1.2, s * 0.04));
  noFill();

  line(2.12 * s, 0.43 * s, 2.58 * s, 0.25 * s);
  line(2.1 * s, 0.48 * s, 2.68 * s, 0.5 * s);
  line(2.05 * s, 0.52 * s, 2.52 * s, 0.72 * s);

  stroke(footColor);
  strokeWeight(max(1, s * 0.035));

  line(0.8 * s, 0.58 * s, 1.05 * s, 0.8 * s);
  line(1.05 * s, 0.8 * s, 1.25 * s, 0.72 * s);

  line(1.15 * s, 0.58 * s, 1.38 * s, 0.78 * s);
  line(1.38 * s, 0.78 * s, 1.58 * s, 0.7 * s);

  pop();
}

// AI Usage Instructions: AI assisted in generating the dolphin splash animation
// Draws different splash stages based on progress
function drawDolphinSplash(dolphin, progress) {
  let cellSize = segmentArr[0].width;
  let s = cellSize * 0.9;

  let splashColor = getToneColor("foamGrey");

  noFill();
  stroke(splashColor);
  strokeWeight(max(1.2, s * 0.16));
  strokeCap(ROUND);

  if (progress < 0.25) {
    let amount = map(progress, 0, 0.25, 1, 0);

    let x = lerp(dolphin.startX, dolphin.endX, progress);
    let y = dolphin.baseY;

    drawSplashLines(x, y, s, amount);
  }

  if (progress > 0.75) {
    let amount = map(progress, 0.75, 1, 0, 1);

    let x = lerp(dolphin.startX, dolphin.endX, progress);
    let y = dolphin.baseY;

    drawSplashLines(x, y, s, amount);
  }
}

// Combines spread, rise, and arc() to create the splash effect
function drawSplashLines(x, y, s, amount) {
  let spread = s * 4.5 * amount;
  let rise = s * 2.2 * amount;

  line(x - spread, y, x - spread * 0.55, y - rise * 0.4);
  line(x + spread, y, x + spread * 0.55, y - rise * 0.4);
  line(x - spread * 0.35, y, x - spread * 0.15, y - rise);
  line(x + spread * 0.35, y, x + spread * 0.15, y - rise);

  arc(x, y + s * 0.2, spread * 1.4, s * 0.8, PI, TWO_PI);
}

// AI Usage Instructions: AI assisted in calculating the night blending ratio
// Uses abs(), min(), map(), and constrain() together with lerpColor()
function getTimeBlendToNight() {
  let distanceToNight = abs(toneValue - 3);

  distanceToNight = min(distanceToNight, abs(toneValue + 1 - 3));

  let nightMix = map(distanceToNight, 0, 2, 1, 0);

  return constrain(nightMix, 0, 1);
}

// AI Usage Instructions: AI assisted in generating the continuous color update logic and color loop
// Updates toneValue based on the long-press direction and time difference
function updateToneChange() {
  if (toneHoldDirection == 0) {
    lastToneUpdateTime = millis();
    return;
  }

  let now = millis();

  let deltaTime = (now - lastToneUpdateTime) / 1000;

  lastToneUpdateTime = now;

  toneValue = toneValue + toneHoldDirection * toneChangeSpeed * deltaTime;

  toneValue = wrapToneValue(toneValue);
}

// Makes toneValue loop through the four time tones
function wrapToneValue(value) {
  let total = timeTonePalettes.length;

  while (value < 0) {
    value = value + total;
  }

  while (value >= total) {
    value = value - total;
  }

  return value;
}

// AI Usage Instructions: AI assisted in generating the smooth color transition
// Uses Math.floor(), %, and lerp() to blend two tones and create a smooth color transition
function getToneColor(colorName) {
  let total = timeTonePalettes.length;

  let fromIndex = Math.floor(toneValue);
  let toIndex = (fromIndex + 1) % total;

  let amount = toneValue - fromIndex;

  let fromRGB = timeTonePalettes[fromIndex].colors[colorName];
  let toRGB = timeTonePalettes[toIndex].colors[colorName];

  if (fromRGB == undefined) {
    return color(0);
  }

  if (toRGB == undefined) {
    return color(0);
  }

  let r = lerp(fromRGB[0], toRGB[0], amount);
  let g = lerp(fromRGB[1], toRGB[1], amount);
  let b = lerp(fromRGB[2], toRGB[2], amount);

  return color(r, g, b);
}

// Stores the current tone colors for all color names as a shared color source for sketch.js, noise.js, time-based.js, and audio.js
let activeToneColorMap = {};

// Refreshes all current colors based on the current toneValue
function refreshActiveToneColors() {
  activeToneColorMap = {};

  if (typeof timeTonePalettes == "undefined") {
    return;
  }

  if (timeTonePalettes.length == 0) {
    return;
  }

  let colorNames = Object.keys(timeTonePalettes[0].colors);

  for (let name of colorNames) {
    activeToneColorMap[name] = getToneColor(name);
  }
}

// Gets the current tone color by color name
// sketch.js will call this function through getPaletteColor()
function getActiveToneColor(colorName) {
  if (activeToneColorMap[colorName] != undefined) {
    return activeToneColorMap[colorName];
  }

  return getToneColor(colorName);
}

// Updates segment.color according to segment.colorName
// Allows noise.js and audio.js to follow tone changes without modifying those files
function applyToneToSegments() {
  refreshActiveToneColors();

  if (typeof segmentArr == "undefined") {
    return;
  }

  for (let segment of segmentArr) {
    if (segment.colorName != undefined) {
      segment.color = getActiveToneColor(segment.colorName);
    }
  }
}

// Converts the current tone color into a CSS rgba string
function getToneCss(colorName, alphaValue) {
  let c = getActiveToneColor(colorName);
  return "rgba(" + red(c) + "," + green(c) + "," + blue(c) + "," + alphaValue + ")";
}

// Makes the audio button follow the current tone; only the button UI is changed
function updateToneUI() {
  if (typeof audioButton != "undefined" && audioButton) {
    audioButton.style("background", getToneCss("creamYellow", 0.82));
    audioButton.style("border", "1px solid " + getToneCss("darkBlue", 0.18));
    audioButton.style("color", getToneCss("darkBlue", 1));
  }
}

// Draw user input mechanic
function drawUserinputMechanic() {
  drawCurrentDragPath();
  drawDolphinAnimations();
  drawSeagullAnimations();
}