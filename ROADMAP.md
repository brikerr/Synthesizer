# Hybrid Studio — Feature Roadmap

## Sound Design — Completed

- [x] **Wavetable oscillator** — 7 pre-computed tables with crossfade morphing
- [x] **Granular processor** — 4s circular buffer, 32 grain pool, Hann windows, pitch shift
- [x] **FM operator module** — self-feedback, dual outputs for chaining operators
- [x] **Compressor/limiter** — peak envelope follower, sidechain input, makeup gain
- [x] **3-band EQ** — low shelf, parametric mid, high shelf (Bristow-Johnson cookbook)
- [x] **Chorus** — 1-4 voice LFO-modulated delay lines
- [x] **Arpeggiator** — 4 patterns, 1-4 octave range, internal/external clock
- [x] **Euclidean rhythm** — Bjorklund algorithm with visual ring display
- [x] **Probability gate** — random gate filtering with pass/block/toggle modes
- [x] **Looper/recorder** — 10s buffer, speed control, reverse playback
- [x] **Macro knobs** — 4 CV outputs for performance control

---

## Sound Design — New Modules

### Oscillators & Sources

- [ ] **Sampler** — load audio files (drag-and-drop WAV/MP3), one-shot or loop playback, pitch tracking via CV. Start/end markers, ADSR envelope on playback.
- [ ] **Karplus-Strong** — physical modeling string/pluck synthesis. Excitation noise burst → tuned delay line with damping. Simple controls: pitch, damping, brightness, pluck.
- [ ] **Additive oscillator** — 8-16 individually controllable harmonics with per-partial amplitude. Spectral morphing between harmonic presets.
- [ ] **Drum synth** — dedicated analog-style drum module. Kick (pitch sweep + body), snare (noise burst + tone), hi-hat (tuned noise). Three trigger inputs, three audio outputs.
- [ ] **Oscillator sync** — hard-sync option for VCO module. Slave oscillator resets phase on master zero-crossing for classic tearing sync tones.
- [ ] **Super oscillator** — unison detuned oscillator (up to 7 voices) with spread and stereo width controls.

### Filters & Dynamics

- [ ] **Multi-mode SVF** — state-variable filter with continuous LP→BP→HP→Notch morphing via single CV-controllable knob. Smoother than the current VCF for sweeps.
- [ ] **Formant filter** — vowel synthesis (A/E/I/O/U morph). Two parallel bandpass filters with formant frequency tables. Great for vocal textures.
- [ ] **Resonator bank** — 4-8 tuned bandpass filters in parallel, tuned to harmonic series or custom frequencies. Audio input excites the resonators.
- [ ] **Comb filter** — positive and negative comb with feedback. CV-controllable delay time for metallic/flanging/Karplus-Strong-adjacent effects.
- [ ] **Envelope follower** — audio-to-CV converter. Tracks the amplitude of an audio signal and outputs a smooth CV. Essential for ducking, auto-wah, dynamics-driven modulation.
- [ ] **Gate-to-trigger converter** — outputs a short pulse on gate rising edge. Useful for retriggering envelopes from held gates.

### Distortion & Saturation

- [ ] **Distortion** — multiple algorithms (soft clip, hard clip, tube saturation, foldback, rectify). Drive, tone, and mix controls.
- [ ] **Bitcrusher** — sample rate reduction and bit depth reduction. Extreme lo-fi digital artifacts. CV-controllable crush amount.

### Modulation & Utility

- [ ] **Slew limiter** — smooths/limits the rate of CV change. Separate rise/fall rates. Acts as portamento on pitch CV or smooths stepped sequences.
- [ ] **Clock divider/multiplier** — takes a clock input, outputs divided (/2, /4, /8) and multiplied (x2, x3, x4) clocks on separate outputs.
- [ ] **Logic gates** — AND, OR, XOR operations on two gate inputs. Useful for combining rhythmic patterns from multiple sequencers/euclidean generators.
- [ ] **CV mixer/offset** — attenuvert + offset for CV signals. Scale, invert, and shift CV before it reaches a destination. 4 inputs with individual level + polarity.
- [ ] **Stereo panner** — takes mono input, outputs L/R with CV-controllable pan position. Auto-pan via LFO input.
- [ ] **Pitch shifter** — real-time pitch shifting via granular or phase-vocoder technique. Separate from granular module — focused on clean pitch shift with minimal artifacts.
- [ ] **Vocoder** — 8-16 band analysis/synthesis. Carrier input (synth), modulator input (mic/audio). Outputs carrier shaped by modulator's spectral envelope.

---

## Visuals & Polish

### Signal Visualization

- [ ] **VU meters on cables** — small floating level indicators on each cable showing signal amplitude. Color shifts from green → yellow → red. Toggle on/off globally.
- [ ] **Animated cable glow** — cables pulse/glow in sync with the audio signal flowing through them. Brighter = louder. Subtle animation, not distracting.
- [ ] **Inline mini-scope** — hovering over any cable shows a tiny oscilloscope tooltip of the signal at that point. No extra module needed for quick debugging.
- [ ] **Module output meters** — small LED-style meter bars on each output port showing signal level at a glance.
- [ ] **Signal flow highlighting** — clicking a module highlights all connected cables and modules in the signal chain upstream and downstream. Dims unrelated modules.

### Canvas & Navigation

- [x] **Canvas panning** — left-drag on empty space, spacebar+drag, two-finger trackpad scroll
- [ ] **Mini-map** — small overview window (bottom-left) showing the entire patch layout. Click to jump. Shows viewport rectangle.
- [ ] **Grid snapping** — optional snap-to-grid for module placement. Toggle in toolbar. Makes patches look tidy.
- [ ] **Auto-layout** — button that automatically arranges modules left-to-right following signal flow. Minimizes cable crossings.
- [ ] **Fit-to-view** — double-click the zoom percentage to auto-fit all modules into the viewport.
- [ ] **Module search/spotlight** — Cmd+K opens a search bar to quickly find and add modules by name.

### Module Appearance

- [ ] **Module skins** — alternate visual styles per module type (minimal, vintage, neon). User preference saved.
- [ ] **Collapsed modules** — double-click header to collapse a module to just its header + ports. Saves canvas space for big patches.
- [ ] **Module badges** — small icons on module corners showing state (e.g., recording indicator on Looper, pattern on Euclidean, waveform on VCO).
- [ ] **Custom module labels** — double-click the module name to rename it (e.g., "Bass VCO", "Lead Filter"). Stored in patch state.

### Cables & Connections

- [ ] **Cable color picker** — right-click a cable to change its color. Or auto-color by signal path/voice.
- [ ] **Cable routing modes** — straight, curved (current), or right-angle/orthogonal cable styles. User preference.
- [ ] **Drag-to-connect** — drag from an output port directly to a module body to get a popup of compatible input ports.
- [ ] **Connection preview** — while dragging a cable, compatible ports glow/highlight on nearby modules.
- [ ] **Cable organization** — "cable tidy" button that reroutes cables to minimize visual overlap.

### Animation & Feedback

- [ ] **Module add/remove animations** — smooth scale-in when adding, fade-out when removing modules.
- [ ] **Parameter change indicators** — brief highlight/flash when a parameter is being modulated by CV.
- [ ] **Knob acceleration curves** — fine control (shift+drag for precision), coarse control (normal drag). Double-click to reset to default.
- [ ] **Smooth zoom transitions** — animated zoom when using the +/- buttons or fit-to-view.

### Responsive & Touch

- [ ] **Touch-friendly controls** — larger hit targets for knobs/ports on touch devices. Detect touch and adapt layout.
- [ ] **Mobile layout** — responsive module panels that stack vertically on narrow screens. Simplified toolbar.
- [ ] **Touch gestures** — long-press to delete module, two-finger rotate for knobs, pinch on individual modules to collapse.

---

## UX & Workflow

- [ ] **Undo/redo** — full history for module placement, connections, and parameter changes. Cmd+Z / Cmd+Shift+Z.
- [ ] **Module grouping** — select multiple modules, group into a collapsible "subpatch" block with exposed I/O ports.
- [ ] **Patch notes/annotations** — floating sticky notes on the canvas. Markdown support. Color-coded.
- [ ] **Keyboard shortcuts** — comprehensive shortcuts (Delete to remove module, Cmd+D to duplicate, arrow keys to nudge).
- [ ] **Module duplication** — Cmd+D or right-click → Duplicate. Copies module with same parameters.
- [ ] **Right-click context menus** — on modules (duplicate, delete, collapse, rename), on cables (delete, change color), on canvas (add module, paste).
- [ ] **Parameter presets per module** — save/recall parameter snapshots for individual modules (not full patches).
- [ ] **Waveform preview on hover** — show a mini scope when hovering over audio output ports.

---

## Sharing & Persistence

- [ ] **Export audio** — record the Output module to WAV. Start/stop recording button in toolbar. Offline render option for CPU-heavy patches.
- [ ] **Shareable patch URLs** — encode patch state in a compressed URL hash for one-click sharing.
- [ ] **Export/import patch JSON** — download/upload `.hybridpatch` files.
- [ ] **User preset bank** — save custom presets to localStorage with categories and search. Cloud sync as stretch goal.
- [ ] **Preset tagging** — tag presets with multiple categories, sort/filter in the preset browser.
- [ ] **Patch screenshots** — auto-generate a thumbnail of the patch layout for the preset browser.

---

## Performance & Architecture

- [ ] **Web Worker offloading** — move audio graph management off the main thread for smoother UI.
- [ ] **SharedArrayBuffer** — use SAB for zero-copy waveform/spectrum data transfer between AudioWorklet and UI.
- [ ] **Lazy module loading** — code-split module processors so only loaded modules add to bundle size.
- [ ] **CPU meter** — show AudioContext CPU usage in toolbar. Warn when approaching limits.
- [ ] **Polyphony optimization** — voice stealing, note priority modes (last/highest/lowest), configurable max voices.
