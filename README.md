# Digital Tide

## Project Overview

Digital Tide is an interactive visual piece built with p5.js. We took a sunset image and broke it down into a segment grid — a grid of small cells, where each cell stores its position, size, colour, and colour name. Instead of showing the image as a normal picture, the artwork redraws it using repeated symbols: crosses, dots, lines, squares, colour blocks, and ASCII characters.

From a distance, the sunset silhouette is still recognisable. Up close, the image becomes a dense pattern of geometric marks and characters — somewhere between a landscape painting, a digital mosaic, and a woven textile.

This project reinterprets the repeated cross, grid, and symbol-based visual language of Ding Yi's *Appearance of Crosses*, rather than directly copying one specific image. We applied this visual language to a team-created sunset scene and extended it with interactive p5.js mechanics. As the piece runs, Perlin noise, time-based events, user input, and audio response all affect the same grid, turning the still sunset into something that moves, responds, and changes over time.

<img src="readmeImages/sunset-grid-comparison.jpg">

*Figure 1. The original sunset image translated into a segment grid of repeated colours, crosses, dots, lines, and geometric marks.*

## Inspiration

Our main artistic reference is **Ding Yi**'s *Appearance of Crosses*. His work uses repeated crosses, X-shapes, grid structures, and layered colours to build dense visual surfaces from a single simple mark. We borrowed this idea of "repetition, grid, and symbol" and turned it into our segment grid, where every cell can become a cross, dot, line, square, colour block, or character.

We also looked at **Seohyo**'s *Tidal Tessellation*, which showed us how geometric symbols can be used as basic units to reconstruct an image. This is why we did not display the sunset photo directly — we split it into grid cells and redrew it with different visual marks, keeping the overall shape while making it more abstract.

**Anna Lucia**'s *Loom #0* (2021) influenced our concept too. Its repeated lines reminded us of looms, threads, circuits, and data streams. This led us to think of Digital Tide as a kind of digital textile — an image woven from many small units, which can then be changed by time, sound, user input, and noise.

Together, these references shaped our direction. Ding Yi gave us the foundation of crosses, repetition, grid, and layered colour. Seohyo showed us how to reconstruct an image with geometric symbols. Anna Lucia inspired us to treat the grid as a system that can carry movement, rhythm, and interaction.

<img src="readmeImages/inspiration-references.jpg">

**Figure 2. Visual references used for the project, including Ding Yi's cross-based composition, Seohyo's grid/tessellation work, and Anna Lucia's line-based generative artwork.**

## Project Concept

The core idea of Digital Tide is to turn a still sunset image into a constantly changing digital textile. The artwork starts with a brief still moment, letting the viewer see the original image and its composition. After a short delay, the piece enters a dynamic state: ocean waves move through Perlin noise, the sky drifts with soft cloud changes, and the sun area gently pulses.

At the same time, the time mechanic spreads ASCII characters across the grid, the user input mechanic lets viewers change the colour tone and trigger seagull or dolphin paths, and the audio mechanic makes the waves respond to music energy.

The key design decision is that the four mechanics are not separate layers stacked on top of each other. They all work on the same segment grid. User input changes the colour mood, the time mechanic changes the symbol language, the noise mechanic adds natural movement, and the audio mechanic strengthens the wave rhythm. Because everything affects the same grid, the artwork stays unified — it feels like one interactive environment, not four separate effects.

## p5.js Techniques Used

The project uses image loading, colour sampling, arrays, functions, custom objects, and multiple JavaScript files. sketch.js handles image loading, responsive canvas creation, segment grid generation, and calls each mechanic file.

Main techniques:
- `noise()` — smooth, natural variation for waves, sky, and sun glow
- `random()` — random offset for the noise field so each session looks slightly different
- `map()` — converts noise values into position, size, and movement strength
- `sin()` — flickering, wave motion, and cyclical animation
- `frameCount` and timers — controls when the piece transitions between still, noise, and ASCII states
- `lerp()` — smooths out changes so nothing jumps suddenly
- `push()` and `pop()` — isolates drawing states between different shapes
- `windowResized()` — makes the artwork adapt when the browser window is resized
- Separate script files — each mechanic lives in its own file (noise.js, time-based.js, User-input.js, audio.js)
