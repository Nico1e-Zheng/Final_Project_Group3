//STEP 1
//replaces the shaped-grid with ASCII characters

function drawTimeBased() {
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
        //cover the solid yellow rectangle with the warm base color
        noStroke();
        fill(getPaletteColor("softOrange"));
        rect(segment.x, segment.y, segment.width, segment.height);

        //draw @ in sun color on top
        fill(segment.color);
        //Sets the way text is aligned when text() is called, reference: https://p5js.org/reference/p5/textAlign/
        textAlign(CENTER, CENTER);
        textSize(segment.width * 0.9);
        text("@", segment.x + segment.width / 2, segment.y + segment.height / 2);
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
      if (segment.colorName == "softOrange") {
        noStroke();
        fill(getPaletteColor("softOrange"));
        rect(segment.x, segment.y, segment.width, segment.height);

        fill(getPaletteColor("creamYellow"));
        textAlign(CENTER, CENTER);
        textSize(segment.width * 1.2);
        text("::", cx, cy);
      } else if (segment.colorName == "creamYellow") {
        noStroke();
        fill(getPaletteColor("softOrange"));
        rect(segment.x, segment.y, segment.width, segment.height);

        fill(getPaletteColor("creamYellow"));
        textAlign(CENTER, CENTER);
        textSize(segment.width * 1.2);
        text("::", cx, cy);
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
        noStroke();
        fill(getPaletteColor("softOrange"));
        rect(segment.x, segment.y, segment.width, segment.height);

        fill(segment.color);
        textAlign(CENTER, CENTER);
        textSize(segment.width * 1);
        text("+", segment.x + segment.width / 2, segment.y + segment.height / 2);
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
        noStroke();
        fill(getPaletteColor("softOrange"));
        rect(segment.x, segment.y, segment.width, segment.height);

        fill(segment.color);
        textAlign(CENTER, CENTER);
        textSize(segment.width * 1);
        text("=", segment.x + segment.width / 2, segment.y + segment.height / 2);
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
        noStroke();
        fill(getPaletteColor("oceanBlue"));
        rect(segment.x, segment.y, segment.width, segment.height);

        fill(segment.color);
        textAlign(CENTER, CENTER);
        textSize(segment.width * 1);
        text("~", segment.x + segment.width / 2, segment.y + segment.height / 2);
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
        noStroke();
        fill(getPaletteColor("softOrange"));
        rect(segment.x, segment.y, segment.width, segment.height);

        fill(segment.color);
        textAlign(CENTER, CENTER);
        textSize(segment.width * 1.5);
        text("*", segment.x + segment.width / 2, segment.y + segment.height * 0.8);
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
        noStroke();
        fill(getPaletteColor("oceanBlue"));
        rect(segment.x, segment.y, segment.width, segment.height);

        fill(segment.color);
        textAlign(CENTER, CENTER);
        textSize(segment.width * 1.2);
        text("-", segment.x + segment.width / 2, segment.y + segment.height / 2);
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
        noStroke();
        fill(getPaletteColor("oceanBlue"));
        rect(segment.x, segment.y, segment.width, segment.height);

        fill(segment.color);
        textAlign(CENTER, CENTER);
        textSize(segment.width * 1.2);
        text("~", segment.x + segment.width / 2, segment.y + segment.height / 2);
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
        noStroke();
        fill(getPaletteColor("oceanBlue"));
        rect(segment.x, segment.y, segment.width, segment.height);

        fill(segment.color);
        textAlign(CENTER, CENTER);
        textSize(segment.width * 1);
        text("#", segment.x + segment.width / 2, segment.y + segment.height / 2);
      }
    }
  }
}

//replace foamGrey smaller squares in the ocean with "%"
function drawOceanFoamASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      if (segment.colorName == "foamGrey") {
        noStroke();
        fill(getPaletteColor("oceanBlue"));
        rect(segment.x, segment.y, segment.width, segment.height);

        fill(segment.color);
        textAlign(CENTER, CENTER);
        textSize(segment.width * 1);
        text("%", segment.x + segment.width / 2, segment.y + segment.height / 2);
      }
    }
  }
}

//replace creamYellow small dots in the ocean with "."
function drawOceanCreamASCII() {
  let horizonY = height * horizonLine;

  for (let segment of segmentArr) {
    let cy = segment.y + segment.height / 2;

    if (cy >= horizonY) {
      if (segment.colorName == "creamYellow") {
        noStroke();
        fill(getPaletteColor("oceanBlue"));
        rect(segment.x, segment.y, segment.width, segment.height);

        fill(segment.color);
        textAlign(CENTER, CENTER);
        textSize(segment.width * 1.5);
        text(".", segment.x + segment.width / 2, segment.y + segment.height * 0.2);
      }
    }
  }
}
