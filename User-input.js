// Current time tone
// 0 = Morning
// 1 = Noon
// 2 = Sunset
// 3 = Night
let toneIndex = 2;


// Four time-tone palettes
// AI usage note: AI was consulted for the code-writing format of a nested structure:
// an array containing objects, and each object containing a colors object.
// This part is used to store four groups of time-tone colors.
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


// draw()
function drawUserInput() {
  background(250, 240, 235);

  drawToneSkyBackground();
  drawToneOceanBackground();

  drawToneWarmSkyBase();
  drawToneWarmOceanBase();
  drawToneSunGlow();

  drawToneSkyOverlap();
  drawToneOceanOverlap();
}



// Switch time tone with keyboard input
// AI usage note: AI was consulted on how to add keyboard interaction in p5.js.
// This part is used to switch between time tones by pressing the left and right arrow keys.
function keyPressed() {
  if (keyCode == RIGHT_ARROW) {
    toneIndex = toneIndex + 1;

    if (toneIndex >= timeTonePalettes.length) {
      toneIndex = 0;
    }

    return false;
  }

  if (keyCode == LEFT_ARROW) {
    toneIndex = toneIndex - 1;

    if (toneIndex < 0) {
      toneIndex = timeTonePalettes.length - 1;
    }

    return false;
  }
}



// Get the current tone color by color name
// AI usage note: This part of the code was generated with AI.
// It is used to get the matching RGB color from the current time-tone palette by using the color name.
function getToneColor(colorName) {
  let selectedTone = timeTonePalettes[toneIndex];
  let rgbValue = selectedTone.colors[colorName];

  if (rgbValue == undefined) {
    return color(0);
  }

  return color(rgbValue[0], rgbValue[1], rgbValue[2]);
}


// This part directly follows and adapts the code structure from sketch.js
// First layer: sky background
function drawToneSkyBackground() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy < horizonY) {
      noStroke();
      fill(getToneColor("skyBlue"));
      rect(segment.x, segment.y, segment.width, segment.height);
    }
  }
}



// First layer: ocean background
function drawToneOceanBackground() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      noStroke();
      fill(getToneColor("oceanBlue"));
      rect(segment.x, segment.y, segment.width, segment.height);
    }
  }
}



// Second layer: warm sky layer
function drawToneWarmSkyBase() {
  let horizonY = height * horizonLine;

  noStroke();
  fill(getToneColor("softOrange"));

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy < horizonY) {
      if (segment.colorName != "skyBlue") {
        rect(segment.x, segment.y, segment.width, segment.height);
      }
    }
  }
}



// Second layer: warm ocean reflection
function drawToneWarmOceanBase() {
  let horizonY = height * horizonLine;

  noStroke();
  fill(getToneColor("softOrange"));

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      if (segment.colorName == "goldenOrange") {
        rect(segment.x, segment.y, segment.width, segment.height);
      }
    }
  }
}



// Second layer: highlight dots near the sun
function drawToneSunGlow() {
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

    if (nearSun == true) {
      if (segment.colorName == "softOrange") {
        drawFourDotsWithColor(segment, getToneColor("creamYellow"));
      } else if (segment.colorName == "sunYellow") {
        drawFourDotsWithColor(segment, getToneColor("creamYellow"));
      } else if (segment.colorName == "creamYellow") {
        drawFourDotsWithColor(segment, getToneColor("creamYellow"));
      }
    }
  }
}



// Third layer: sky patterns
function drawToneSkyOverlap() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy < horizonY) {
      if (segment.colorName == "goldenOrange") {
        drawCrossWithColor(segment, getToneColor("goldenOrange"));
      } else if (segment.colorName == "pinkPurple") {
        drawHorizontalLinesWithColor(segment, getToneColor("pinkPurple"));
      } else if (segment.colorName == "sunYellow") {
        noStroke();
        fill(getToneColor("sunYellow"));
        rect(segment.x, segment.y, segment.width, segment.height);
      }
    }
  }
}



// Third layer: ocean patterns
function drawToneOceanOverlap() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      if (segment.colorName == "darkBlue") {
        drawCrossWithColor(segment, getToneColor("darkBlue"));
      } else if (segment.colorName == "skyBlue") {
        drawReflectionLinesWithColor(segment, getToneColor("skyBlue"));
      } else if (segment.colorName == "softOrange") {
        noStroke();
        fill(getToneColor("softOrange"));
        rect(segment.x, segment.y, segment.width, segment.height);
      } else if (segment.colorName == "goldenOrange") {
        drawCrossWithColor(segment, getToneColor("goldenOrange"));
      } else if (segment.colorName == "pinkPurple") {
        drawReflectionLinesWithColor(segment, getToneColor("pinkPurple"));
      } else if (segment.colorName == "sunYellow") {
        drawReflectionLinesWithColor(segment, getToneColor("sunYellow"));
      } else if (segment.colorName == "foamGrey") {
        drawSmallerSquareWithColor(segment, getToneColor("foamGrey"));
      } else if (segment.colorName == "creamYellow") {
        drawSmallDotWithColor(segment, getToneColor("creamYellow"));
      }
    }
  }
}



// Basic shape functions with color parameters
function drawSmallerSquareWithColor(segment, c) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  noStroke();
  fill(c);
  rect(x + w * 0.18, y + h * 0.18, w * 0.64, h * 0.64);
}


function drawFourDotsWithColor(segment, dotColor) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  noStroke();
  fill(dotColor);

  let dotSize = w * 0.3;
  let left = x + w * 0.3;
  let right = x + w * 0.7;
  let top = y + h * 0.3;
  let bottom = y + h * 0.7;

  circle(left, top, dotSize);
  circle(right, top, dotSize);
  circle(left, bottom, dotSize);
  circle(right, bottom, dotSize);
}


function drawSmallDotWithColor(segment, c) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  noStroke();
  fill(c);
  circle(x + w / 2, y + h / 2, w * 0.36);
}


function drawCrossWithColor(segment, c) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  stroke(c);
  strokeWeight(2);

  line(x + w * 0.25, y + h * 0.5, x + w * 0.75, y + h * 0.5);
  line(x + w * 0.5, y + h * 0.25, x + w * 0.5, y + h * 0.75);
}


function drawHorizontalLinesWithColor(segment, c) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  stroke(c);
  strokeWeight(1);

  line(x + w * 0.16, y + h * 0.3, x + w * 0.84, y + h * 0.3);
  line(x + w * 0.16, y + h * 0.5, x + w * 0.84, y + h * 0.5);
  line(x + w * 0.16, y + h * 0.7, x + w * 0.84, y + h * 0.7);
}


function drawReflectionLinesWithColor(segment, c) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  stroke(c);
  strokeWeight(1);

  line(x + w * 0.18, y + h * 0.38, x + w * 0.82, y + h * 0.38);
  line(x + w * 0.18, y + h * 0.62, x + w * 0.82, y + h * 0.62);
}