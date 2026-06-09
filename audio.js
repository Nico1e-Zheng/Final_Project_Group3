let nativeAudio;     
let audioCtx, sourceNode, analyserNode; 
let audioStarted = false;
let audioButton;

let audioBass = 0;
let audioMid = 0;
let audioTreble = 0;
let audioEnergy = 0;
let audioLevel = 0;
let previousBass = 0;

let baseNoiseSpeed = 0.013;

function setupAudioMechanic() {
  nativeAudio = new Audio();
  nativeAudio.src = 'assets/Echoes of Nature - Low Tide.mp3';
  nativeAudio.loop = true;
  nativeAudio.crossOrigin = "anonymous"; 
  
  nativeAudio.addEventListener('canplaythrough', () => {
    console.log("Audio loaded successfully. Acceleration channel ready.");
  });

  audioButton = createButton("Activate Music Waves 🌊");
  audioButton.position(16, 16);
  audioButton.style("padding", "10px 16px");
  audioButton.style("border", "1px solid rgba(0, 0, 0, 0.2)");
  audioButton.style("border-radius", "8px");
  audioButton.style("background", "rgba(255, 245, 238, 0.95)");
  audioButton.style("font-size", "14px");
  audioButton.style("font-weight", "bold");
  audioButton.style("cursor", "pointer");
  audioButton.style("z-index", "9999"); 
  
  audioButton.mousePressed(startAudioMechanic);
}

function startAudioMechanic() {
  userStartAudio(); 

  if (!nativeAudio) return;

  if (nativeAudio.paused) {
    nativeAudio.play().then(() => {
      if (!audioCtx) {
        try {
          let AudioContextClass = window.AudioContext || window.webkitAudioContext;
          audioCtx = new AudioContextClass();
          sourceNode = audioCtx.createMediaElementSource(nativeAudio);
          analyserNode = audioCtx.createAnalyser();
          analyserNode.fftSize = 256; 
          
          sourceNode.connect(analyserNode);
          analyserNode.connect(audioCtx.destination);
        } catch (e) {
          console.error("Audio bridge initialization failed: ", e);
        }
      }
      audioStarted = true;
      audioButton.html("Music Syncing 🎵 Click to Pause");
      audioButton.style("background", "rgba(230, 245, 230, 0.95)");
    }).catch(err => {
      console.error("Playback prevented: ", err);
    });
  } else {
    nativeAudio.pause();
    audioStarted = false;
    audioButton.html("Resume Music Waves");
    audioButton.style("background", "rgba(255, 240, 240, 0.95)");
  }
}

function drawAudioMechanic() {
  if (typeof toneValue !== 'undefined') {
    if (isNaN(toneValue) || toneValue < 0 || toneValue >= 4) {
      toneValue = 2; 
    }
  }

  updateAudioLevels();
  controlNoiseWithAudio();
}

function updateAudioLevels() {
  if (!audioStarted || !nativeAudio || nativeAudio.paused || !analyserNode) {
    audioBass = lerp(audioBass, 0, 0.1);
    audioMid = lerp(audioMid, 0, 0.1);
    audioTreble = lerp(audioTreble, 0, 0.1);
    audioLevel = lerp(audioLevel, 0, 0.1);
    audioEnergy = lerp(audioEnergy, 0, 0.1);
    return;
  }

  try {
    let bufferLength = analyserNode.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);

    let bassSum = 0, midSum = 0, trebleSum = 0;
    let bCount = 0, mCount = 0, tCount = 0;

    for (let i = 0; i < bufferLength; i++) {
      if (i < bufferLength * 0.25) {
        bassSum += dataArray[i]; bCount++;
      } else if (i < bufferLength * 0.65) {
        midSum += dataArray[i]; mCount++;
      } else {
        trebleSum += dataArray[i]; tCount++;
      }
    }

    let avgBass = bCount > 0 ? bassSum / bCount : 0;
    let avgMid = mCount > 0 ? midSum / mCount : 0;
    let avgTreble = tCount > 0 ? trebleSum / tCount : 0;
    let avgAll = (avgBass + avgMid + avgTreble) / 3;

    audioBass = lerp(audioBass, constrain(map(avgBass, 10, 160, 0, 1), 0, 1), 0.25);
    audioMid = lerp(audioMid, constrain(map(avgMid, 8, 130, 0, 1), 0, 1), 0.25);
    audioTreble = lerp(audioTreble, constrain(map(avgTreble, 5, 100, 0, 1), 0, 1), 0.28);
    audioLevel = lerp(audioLevel, constrain(map(avgAll, 5, 140, 0, 1), 0, 1), 0.28);
    audioEnergy = constrain(audioBass * 0.4 + audioMid * 0.3 + audioTreble * 0.3 + audioLevel * 0.5, 0, 1);
  } catch (e) {
  }
}

function controlNoiseWithAudio() {
  let targetNoiseSpeed = baseNoiseSpeed;

  if (audioStarted && nativeAudio && !nativeAudio.paused) {
    targetNoiseSpeed = baseNoiseSpeed * (1.0 + audioEnergy * 4.5);
    targetNoiseSpeed += audioTreble * 0.08; 
  }

  if (typeof noiseSpeed !== 'undefined') {
    noiseSpeed = lerp(noiseSpeed, constrain(targetNoiseSpeed, 0.005, 0.12), 0.25);
  }
}

function getAudioWaveBoost() {
  if (!audioStarted) {
    return 0;
  }
  return audioEnergy * 0.35;
}
function getAudioBeatPulse() { return 0; }
function getAudioTrebleFlash() { return 0; }
function getAudioRowShear(rowIndex, cellWidth) { return 0; }
function getAudioWaveColor(baseColor, flashAmount) { return baseColor; }