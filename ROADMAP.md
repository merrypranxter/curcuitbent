# Roadmap

## V0.1 — Prove the Bend

Goal: prove that a reusable patch graph creates interesting, image-dependent results.

- [x] React/Vite shell
- [x] still-image upload
- [x] Canvas processing engine
- [x] RED / GREEN / BLUE / LUMA / X / Y / NOISE sources
- [x] RGB / X OFFSET / Y OFFSET / THRESHOLD / POSTERIZE targets
- [x] PATCH / BRIDGE / SHORT
- [x] per-wire strength
- [x] visible patch cables
- [x] one-at-a-time random bend
- [x] save/load bends in browser storage
- [x] PNG export
- [x] mobile-responsive first pass
- [x] CI build check
- [ ] test several radically different source images
- [ ] tune signal math based on what actually looks interesting
- [ ] add undo/redo

## V0.2 — Components

- resistor / attenuator
- amplifier
- inverter
- diode / clip
- quantizer
- bit crusher
- noise injector
- oscillator
- component chain per wire
- serialize components inside saved Bend JSON

## V0.3 — Memory

- frame/image history abstraction
- delay
- capacitor-like persistence
- previous-frame source
- feedback-safe limits
- deterministic/random seed plumbing

## V0.4 — Dither board

- ordered Bayer
- Floyd-Steinberg
- Atkinson
- Sierra
- custom palette editor
- palette-index signal
- dither threshold / scale patch targets
- RGB/CMY channel misregistration

## V0.5 — Live browser camera

- getUserMedia source
- WebGL2 renderer
- live patching
- front/rear camera selector
- still capture
- performance controls

## V0.6 — Temporal camera

- ring buffer
- FRAME -N sources
- motion source
- delay-depth target
- temporal displacement
- feedback
- video recording/export

## V0.7 — Specimen library

- thumbnails
- favorite/star
- rename
- duplicate/mutate
- JSON import/export
- shareable bend files
- seeded random mutation

## V1 — Installable instrument

- PWA polish
- phone-first patch UX
- better touch cable interaction
- offline operation
- robust export
- specimen browser
- onboarding that teaches patching without turning into a tutorial prison

## Later / Dangerous

- breed two bends
- graph crossover + mutation
- MIDI / audio-reactive signals
- accelerometer / gyro / touch as sources
- external OSC/WebMIDI control
- native iOS AVFoundation + Metal version
