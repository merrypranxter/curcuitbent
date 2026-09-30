# CURCUITBENT Architecture

## Product rule

CURCUITBENT is an **instrument**, not a filter collection.

A bend is a signal graph. The image is the consequence of that graph.

If a new feature can only be represented as a named visual preset ("VHS 3", "Glitch 7"), it probably does not belong in the engine. Prefer exposing a signal, a destination, a component, or an operation that can be recombined.

## V0.1 renderer

V0.1 intentionally uses Canvas 2D + ImageData.

That is not the final renderer. It keeps the first experiment understandable while we prove:

1. arbitrary signals can feed arbitrary destinations;
2. PATCH / BRIDGE / SHORT feel meaningfully different;
3. saved graphs are reusable across different images;
4. image-dependent behavior is more interesting than canned presets.

Once those are true, move the render core to WebGL2.

## Graph model

A Bend is serializable JSON:

```ts
type Bend = {
  version: 1
  id: string
  name: string
  seed?: number
  connections: Connection[]
}

type Connection = {
  id: string
  source: SignalPort
  target: TargetPort
  mode: 'PATCH' | 'BRIDGE' | 'SHORT'
  strength: number
  components?: Component[]
}
```

### Initial signals

Scalar sources:

- RED
- GREEN
- BLUE
- LUMA
- X
- Y
- NOISE

Initial destinations:

- RED
- GREEN
- BLUE
- X_OFFSET
- Y_OFFSET
- THRESHOLD
- POSTERIZE

## Typed signals

Future graph nodes should have useful internal types:

- scalar
- vec2
- rgb
- texture
- temporal texture
- boolean / gate
- integer / bit field
- time

**Do not reject mismatched connections.**

Instead, CURCUITBENT should supply deliberately lossy adapters.

Examples:

- RGB -> scalar: luminance, channel average, max channel, or selectable channel
- scalar -> RGB: grayscale or palette mapping
- texture -> scalar: sampled pixel / regional mean / edge energy
- time -> scalar: normalized oscillator
- vec2 -> RGB: coordinate-to-color mapping

The point is to make "incorrect wiring" productive.

## Connection modes

### PATCH
Normal modulation. The source influences the target while preserving most of its original signal.

### BRIDGE
Two signals contaminate each other around a midpoint or combination operation.

### SHORT
The source aggressively replaces or dominates the target.

Later:

- FLOAT: connection strength drifts
- LEAK: weak contamination
- FEEDBACK: output re-enters an earlier stage

## Components

Components live **on a wire** and transform its signal.

Planned components:

- resistor / attenuator
- amplifier
- inverter
- clamp
- diode
- quantizer
- bit crusher
- bit swap
- XOR / AND / OR
- noise injector
- oscillator
- sample-and-hold
- delay
- capacitor / low-pass memory
- feedback tap

Components should be serializable and composable.

## Determinism

Random operations should have explicit seeds whenever practical.

**LICK THE CIRCUIT BOARD** adds one connection at a time instead of replacing the entire graph. Later it should optionally record the seed + mutation operation so accidental discoveries can be reproduced.

## Temporal phase

After the still-image graph proves itself, add a frame ring buffer:

- NOW
- FRAME -1
- FRAME -2
- FRAME -4
- FRAME -8
- FRAME -16

These become source signals / textures.

That enables:

- frame delay into a color channel
- brightness controlling delay depth
- motion controlling buffer address
- feedback
- temporal smearing
- image-dependent time displacement

## Dither / palette phase

Dithering is not a post-effect menu. It becomes graph machinery.

Planned modules:

- Bayer / ordered dither
- Floyd-Steinberg
- Atkinson
- Sierra
- posterize
- palette quantizer
- custom palette
- palette index
- halftone angle / scale

Their parameters should be patchable where practical.

Example:

```
LUMA -> DITHER_THRESHOLD
RED -> BAYER_SCALE
FRAME_-4 -> PALETTE_INDEX
```

## Live camera phase

Browser prototype:

```
getUserMedia()
  -> video frame
  -> WebGL texture
  -> compiled Bend graph
  -> canvas
```

Target iPhone Safari / installed PWA first.

If the concept earns it, later native iOS:

```
AVFoundation
  -> CVPixelBuffer
  -> Metal texture
  -> Bend graph / shader pipeline
  -> display / capture
```

## UI rule

The user should learn the machine like an instrument.

Prefer:

- visible jacks
- visible cables
- inspectable wires
- components physically inserted into cables
- plain-English port explanations
- saved "specimens" that reveal their wiring

Avoid:

- hidden preset stacks
- fake knobs that map to several unrelated effects
- generic glitch vocabulary without visible signal meaning
- blocking "invalid" connections when an adapter could make them interesting

## Naming note

Working title: **CURCUITBENT**

Also preserve **gitBENT** as a possible project/tool/dev-facing name because, unfortunately, it is adorable.
