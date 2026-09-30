# CURCUITBENT

A virtual circuit-bent camera / image instrument.

This is **not** a collection of glitch filters. The image is treated as a signal system with patchable sources and targets. A "bend" is a reusable wiring graph.

## V0.1

The first prototype is intentionally small:

- upload a still image
- patch virtual signal jacks together
- PATCH / BRIDGE / SHORT connection modes
- adjust connection strength
- clear the board
- **LICK THE CIRCUIT BOARD** to add one random bend
- save/load bends in local storage
- export the bent image as PNG

### Initial signal sources

- RED
- GREEN
- BLUE
- LUMA
- X
- Y
- NOISE

### Initial targets

- RED
- GREEN
- BLUE
- X OFFSET
- Y OFFSET
- THRESHOLD
- POSTERIZE

Later versions add temporal frame memory, virtual electronic components, dithering/palette modules, live camera input, video capture, and eventually a native Metal version.

## Development

```bash
npm install
npm run dev
```

Built with React + Vite. V0.1 uses Canvas 2D deliberately so the signal-graph behavior can be proven before moving the renderer to WebGL/Metal.
