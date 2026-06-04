let img;

let segmentArr = [];

let resolution = 93;

//splits sky and ocean into two parts
let horizonLine = 0.5;

//prepare base colors for each region
let skyBase, oceanBase;

let colorPalette = [];

class PaletteColor {

  constructor(name, color) {
    this.name = name;
    this.color = color;
  }
}

class Segment {
  
  constructor(x, y, width, height, color, colorName){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.colorName = colorName;
  }
}

function preload(){

  img = loadImage("assets/sunset.png");
}

function setup() {
  //the color palette, every cell will be matched to its closest color
  //the color values were chosen with the help of Claude using a Python script to find the average RGB of each color group
  colorPalette = [
    new PaletteColor("skyBlue", color(146, 178, 221)),
    new PaletteColor("darkBlue", color(65, 93, 137)),
    new PaletteColor("oceanBlue", color(103, 142, 182)),
    new PaletteColor("softOrange", color(241, 186, 112)),
    new PaletteColor("goldenOrange", color(235, 145, 84)),
    new PaletteColor("pinkPurple", color(180, 120, 175)),
    new PaletteColor("sunYellow", color(255, 238, 160)),
    new PaletteColor("foamGrey", color(180, 180, 220)),
    new PaletteColor("creamYellow", color(250, 220, 190))
  ];

  skyBase = getPaletteColor("skyBlue");
  oceanBase = getPaletteColor("oceanBlue");

  let size = Math.min(windowWidth, windowHeight);
  createCanvas(size, size);
  buildGrid();
}

//keep the canvas resizing with the window
function windowResized() {

  let size = Math.min(windowWidth, windowHeight);
  resizeCanvas(size, size);
  buildGrid();
}

function draw(){
  //create a soft color canvas as base
  background(250, 240, 235);

  //each piece of the artwork called here by its function name

  //draw base layers first
  drawSkyBackground();
  drawOceanBackground();

  //add warm base so blue does not show through warm shapes
  drawWarmSkyBase();
  drawWarmOceanBase();
  drawSunGlow();

  //draw top details
  drawSkyOverlap();
  drawOceanOverlap();
}

function buildGrid() {
  segmentArr = [];

  //calculate the cell size by dividing the canvas width by resolution
  let cellSize = width / resolution;

  //row
  for (let i = 0; i < resolution; i++) { 

    //column
    for (let j = 0; j < resolution; j++) {
      //the position of each cell on canvas
      let x = j * cellSize;
      let y = i * cellSize;

      //convert each cell center from canvas postion to image position
      let imgX = map(x + cellSize / 2, 0, width, 0, img.width);
      let imgY = map(y + cellSize / 2, 0, height, 0, img.height);
      let rawColor = img.get(imgX, imgY);

      //match to the closest color in color palette
      let matchedColor = findClosestColor(rawColor);

      let newSegment = new Segment(x, y, cellSize, cellSize, matchedColor.color, matchedColor.name);
      segmentArr.push(newSegment);
    }
  }

}

//helper function written with the help of Claude
//given a known color name in the palette and return the color value
function getPaletteColor(colorName) {
  for (let item of colorPalette) {
    if (item.name == colorName) {
      return item.color;
    }
  }
  //backup in case the name is not found
  return colorPalette[0].color;
}

//find the closest fixed color by comparing RGB distance from the raw color in each cell
//written with the help of Claude
function findClosestColor(sourceColor) {
  let closest = colorPalette[0];
  let closestScore = 999999;

  for (let paletteColor of colorPalette) {
    //compare the difference in red, green, blue separately
    let rDiff = red(sourceColor) - red(paletteColor.color);
    let gDiff = green(sourceColor) - green(paletteColor.color);
    let bDiff = blue(sourceColor) - blue(paletteColor.color);
    
    //use square to make the gap more apparent
    let score = rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;

    //go through each score to find the closest one
    if (score < closestScore) {
      closestScore = score;
      closest = paletteColor;
    }
  }

  return closest;
}


//LAYERS OF THE ARTWORK
//First Layer
//fill the entire sky with skyBlue squares as the bottom layer
function drawSkyBackground() {
  let horizonY = height * horizonLine;
  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;
    if (cy < horizonY) {
      noStroke();
      fill(skyBase);
      rect(segment.x, segment.y, segment.width, segment.height);
    }
  }
}

//fill the entire ocean with oceanBlue squares as the bottom layer
function drawOceanBackground() {
  let horizonY = height * horizonLine;
  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;
    if (cy >= horizonY) {
      noStroke();
      fill(oceanBase);
      rect(segment.x, segment.y, segment.width, segment.height);
    }
  }
}

//Second Layer
//orange cloud in the sky
function drawWarmSkyBase() {
  let horizonY = height * horizonLine;
  noStroke();
  fill(getPaletteColor("softOrange"));

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;
    if (cy < horizonY) {
      //skip if the cell is blue
      let skyIsBlue = false;

      if (segment.colorName == "skyBlue") {
        skyIsBlue = true;
      }

      //paint orange
      if (skyIsBlue == false) {
        rect(segment.x, segment.y, segment.width, segment.height);
      }
    }
  }
}

//orange reflection in the ocean
function drawWarmOceanBase() {
  let horizonY = height * horizonLine;
  noStroke();
  fill(getPaletteColor("softOrange"));

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;
    if (cy >= horizonY) {
      //only golden-orange reflection needs orange base, other ocean cells just keep in blue
      if (segment.colorName == "goldenOrange") {
        rect(segment.x, segment.y, segment.width, segment.height);
      }
    }
  }
}

//cream dots near the sun, the range was adjusted by approximation
function drawSunGlow() {
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

    //only draw on soft orange cells, not on golden orange (those have crosses)
    if (nearSun) {
      if (segment.colorName == "softOrange") {
        drawFourDots(segment, getPaletteColor("creamYellow"));
      } else if (segment.colorName == "sunYellow") {
        drawFourDots(segment, getPaletteColor("creamYellow"));
      } else if (segment.colorName == "creamYellow") {
        drawFourDots(segment, getPaletteColor("creamYellow"));
      }
    }
  }
}

//Third Layer
//draw overlap shapes in the sky
function drawSkyOverlap() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy < horizonY) {
      noStroke();
      fill(segment.color);

      if (segment.colorName == "goldenOrange") {
        drawCross(segment);
      } else if (segment.colorName == "pinkPurple") {
        drawHorizontalLines(segment);
      } else if (segment.colorName == "sunYellow") {
        rect(segment.x, segment.y, segment.width, segment.height);
      }
    }
  }
}

//draw overlap shapes in the ocean
function drawOceanOverlap() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      noStroke();
      fill(segment.color);

      if (segment.colorName == "darkBlue") {
        drawCross(segment);
      } else if (segment.colorName == "skyBlue") {
        drawReflectionLines(segment);
      } else if (segment.colorName == "softOrange") {
        rect(segment.x, segment.y, segment.width, segment.height);
      } else if (segment.colorName == "goldenOrange") {
        drawCross(segment);
      } else if (segment.colorName == "pinkPurple") {
        drawReflectionLines(segment);
      } else if (segment.colorName == "sunYellow") {
        drawReflectionLines(segment);
      } else if (segment.colorName == "foamGrey") {
        drawSmallerSquare(segment);
      } else if (segment.colorName == "creamYellow") {
        drawSmallDot(segment);
      }
    }
  }
}


//OVERLAP SHAPES
//shape overlap over a printed cell
function drawSmallerSquare(segment) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  noStroke();
  fill(segment.color);
  rect(x + w * 0.18, y + h * 0.18, w * 0.64, h * 0.64);
}

function drawFourDots(segment, dotColor) {
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

function drawSmallDot(segment) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  noStroke();
  fill(segment.color);
  circle(x + w / 2, y + h / 2, w * 0.36);
}

function drawCross(segment) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  stroke(segment.color);
  strokeWeight(2);
  line(x + w * 0.25, y + h * 0.5, x + w * 0.75, y + h * 0.5);
  line(x + w * 0.5, y + h * 0.25, x + w * 0.5, y + h * 0.75);
}

function drawHorizontalLines(segment) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  stroke(segment.color);
  strokeWeight(1);

  line(x + w * 0.16, y + h * 0.3, x + w * 0.84, y + h * 0.3);
  line(x + w * 0.16, y + h * 0.5, x + w * 0.84, y + h * 0.5);
  line(x + w * 0.16, y + h * 0.7, x + w * 0.84, y + h * 0.7);
}

function drawReflectionLines(segment) {
  let x = segment.x;
  let y = segment.y;
  let w = segment.width;
  let h = segment.height;

  stroke(segment.color);
  strokeWeight(1);

  line(x + w * 0.18, y + h * 0.38, x + w * 0.82, y + h * 0.38);
  line(x + w * 0.18, y + h * 0.62, x + w * 0.82, y + h * 0.62);
}
