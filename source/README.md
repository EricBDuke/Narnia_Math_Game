# Narnia Math Brawler — Stage 1

A 3D browser fighting game for kids, built with Three.js. Before each round you solve 10 math problems. Then you fight a 6-fighter free-for-all. Aslan is the narrator. It works on iPad (touch, Safari, landscape) and on a computer (keyboard and mouse).

## Run it
Use any static web server. There is no build step, and all libraries are kept in `vendor/`.
```
python3 -m http.server 8000      # then open http://localhost:8000
./tools/build-dist.sh            # copies only the runtime files into dist/ for hosting
```
Debug and test hooks: add `?debug=1` to the URL. Add `?touch=1` or `?touch=0` to force touch controls on or off.

## Files
| File | What it holds |
|---|---|
| `src/fighters.js` | **Fighter config, the single source of truth.** All 70 fighters from the Roster Page, with exact names, bios, the six named moves (plus each move's mechanic type), body type, colors, weapon, `starter` flag and art paths. You can edit it by hand. |
| `src/narration.js` | Aslan's lines. These are **only** the 12 verified book quotes from the Roster Page, copied word for word and mapped to game moments. |
| `src/arenas.js`, `src/arenas-more.js` | 14 arenas, two per book, with config and procedural scenes. |
| `src/math.js` | Difficulty ranges, problem generation, the gate rule (7 of 10), and hints. |
| `src/models.js` | Procedural placeholder rigs for each body type, the art swap-in loader (GLB or image billboard), and animation. |
| `src/combat.js` | World, Fighter, moves, projectiles and effects. |
| `src/controllers.js` | **Input/controller layer.** `LocalController`, `AIController`, `NetworkController` (stub). |
| `src/main.js` | Screens, math gate UI, fighter/arena select, HUD, camera, keyboard and touch input, round flow. |
| `tools/build-fighters.cjs` | One-time generator that turns the Roster Page export into `src/fighters.js`. |
| `tools/sync-art.sh` | Copies final art from `/workspace/Narnia Game Art` and writes `art/manifest.json`. |
| `tools/playtest.cjs` | Headless Playwright playthrough. Run with `node tools/playtest.cjs desktop` or `node tools/playtest.cjs ipad`. |

## Swapping in real art later
* Character art goes in `/workspace/Narnia Game Art/Characters/<book folder>/<Name> - front.png`, `- side.png`, `- back.png`, and optionally `- action.png` (1024x1536, transparent). Run `tools/sync-art.sh`. It skips ` - ChatGPT`, ` - built-in` and `_Peter` test files. After that, the select cards and HUD show the action or front image automatically.
* For 3D models, put a GLB in `art/models/` and set `art.model: "art/models/<id>.glb"` on that fighter in `src/fighters.js`. It replaces the procedural placeholder and keeps the same height. Animation clips named idle, run or attack get played. If the GLB fails to load, the placeholder stays.
* `art.billboard: true` shows the front PNG as a flat sprite in 3D. This is a quick way to preview new art.
* Arena previews go in `/workspace/Narnia Game Art/Arena Previews/<book folder>/`. Each arena has `artSource` and `previewImage` set in `src/arenas.js`.

## Body types (placeholder rigs)
`biped` comes with variants: child, dwarf, giant, faun, marshwiggle, ape, gnome (Earthmen), thin, fat, crown, beard, turban, helmet.
The other body types are:
* `critter`: small upright animal (mouse, beaver, badger, squirrel)
* `quadruped`: horse, winged horse, unicorn, donkey, dog, wolf, bear, elephant
* `centaur`
* `bird`: owl, eagle
* `monopod`: Dufflepud

Pevensie ages are reflected in scale: Peter 18 = 1.0, Susan 16 = 0.95, Edmund 14 = 0.88, Lucy 12 = 0.78.

## Stage 2: online multiplayer (designed for, not built)
* Fighters never read the keyboard directly. Each `Fighter` has a `controller` that fills `fighter.input = {mx, mz, block, dodge, actions[]}` once per fixed 60 Hz step.
  * The local human uses `LocalController(InputState)`. Keyboard and touch write into `InputState`, and `InputState.frame()` produces the serialisable frame that a client would send.
  * Bots use `AIController(level)`. They fill any empty slots out of the 6.
  * Remote humans use `NetworkController(playerId)`, which takes frames through `push(frame)`. It's a stub for now and isn't connected to anything.
* The simulation runs in fixed steps (`World.update(1/60)`), and all combat state lives in `World` and `Fighter`. That makes a server-authoritative or lockstep model straightforward.
* Every player does their own math gate on their own device. The lobby would only let a player into the round once they pass, and their gate bonus (power/health) would be sent along with their join message.
