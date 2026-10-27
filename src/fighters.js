// Narnia Math Brawler - FIGHTER CONFIG (single source of truth, edit freely)
// 70 fighters from the Roster Page (10 per book). Aslan is NOT here: he is the narrator.
// body: biped | critter (small upright animal: mouse, beaver, badger, squirrel) | quadruped (horse, horse-winged, unicorn, donkey, dog, wolf, bear, elephant)
//       | centaur | bird (owl, eagle) | monopod (Dufflepud)
// variant (biped): child, dwarf, giant, faun, marshwiggle, ape, gnome, thin, fat, crown, beard, turban, helmet (combine with '-')
// move type: melee | multi | spin | projectile | aoe | dash | stun | heal | breath | leap | recover
// art.front/side/back (+ optional action = dynamic fighting pose, used on the select screen when present): final reference PNGs (1024x1536, transparent) from "/workspace/Narnia Game Art/Characters/<book>/<Name> - front|side|back.png",
//   copied into art/characters/... by tools/sync-art.sh (which skips ' - ChatGPT' / ' - built-in' test files and _Peter previews). Front is shown on cards/HUD when present.
// art.model: optional GLB path (e.g. "art/models/peter.glb"). If it loads, it replaces the procedural placeholder; clips named idle/run/attack/hit/jump/block/ko are used if present.
// art.billboard: true = show art.front as a flat sprite in 3D instead of the placeholder (quick preview of new art).
// starter: true = in the default 10-fighter pool. Set ROSTER_MODE in settings to 'all' to draw from all 70.
export const FIGHTERS = [
 {
  "id": "queen-helen",
  "name": "Queen Helen",
  "book": "The Magician's Nephew",
  "bookId": "mn",
  "bio": "Frank's wife, pulled into Narnia from her washing to become its first Queen.",
  "starter": false,
  "body": "biped",
  "variant": "",
  "scale": 1,
  "colors": {
   "primary": "#7a9e7e",
   "secondary": "#f2e6c9",
   "skin": "#f1c9a5",
   "hair": "#6b3e26"
  },
  "weapon": "none",
  "sex": "f",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/01 The Magician's Nephew/",
   "front": "art/characters/01 The Magician's Nephew/Queen Helen - front.png",
   "side": "art/characters/01 The Magician's Nephew/Queen Helen - side.png",
   "back": "art/characters/01 The Magician's Nephew/Queen Helen - back.png",
   "action": "art/characters/01 The Magician's Nephew/Queen Helen - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Laundry Snap",
    "desc": "Snaps a wet towel at foes",
    "type": "melee"
   },
   "combo1": {
    "name": "Soapsuds Splash",
    "desc": "Splash, slip, then a shove",
    "type": "melee"
   },
   "combo2": {
    "name": "Apron Spin",
    "desc": "Spinning apron sweep hits all around",
    "type": "spin"
   },
   "power": {
    "name": "Queen's Crown",
    "desc": "Golden glow heals and shields her",
    "type": "heal"
   },
   "flying": {
    "name": "Washday Leap",
    "desc": "Jumps, lands with a basket slam",
    "type": "leap"
   },
   "recover": {
    "name": "Brave Smile",
    "desc": "Smiles and stands up steady",
    "type": "recover"
   }
  }
 },
 {
  "id": "aunt-letty",
  "name": "Aunt Letty",
  "book": "The Magician's Nephew",
  "bookId": "mn",
  "bio": "Digory's tough, no-nonsense aunt who stands up to Jadis in London.",
  "starter": false,
  "body": "biped",
  "variant": "",
  "scale": 1,
  "colors": {
   "primary": "#4b4b6b",
   "secondary": "#dddddd",
   "skin": "#f1c9a5",
   "hair": "#9a9a9a"
  },
  "weapon": "none",
  "sex": "f",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/01 The Magician's Nephew/",
   "front": "art/characters/01 The Magician's Nephew/Aunt Letty - front.png",
   "side": "art/characters/01 The Magician's Nephew/Aunt Letty - side.png",
   "back": "art/characters/01 The Magician's Nephew/Aunt Letty - back.png",
   "action": "art/characters/01 The Magician's Nephew/Aunt Letty - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Stern Swat",
    "desc": "Firm open-hand swat",
    "type": "melee"
   },
   "combo1": {
    "name": "Tidy Up",
    "desc": "Shoo, shove, then sweep",
    "type": "spin"
   },
   "combo2": {
    "name": "Curtain Pull",
    "desc": "Yanks a curtain over a foe",
    "type": "stun"
   },
   "power": {
    "name": "Not in My House!",
    "desc": "Scolding blast pushes all foes back",
    "type": "aoe"
   },
   "flying": {
    "name": "Staircase Leap",
    "desc": "Jumps from the stairs, lands firm",
    "type": "leap"
   },
   "recover": {
    "name": "Smooth the Skirt",
    "desc": "Dusts off and stands proudly",
    "type": "recover"
   }
  }
 },
 {
  "id": "digory-kirke",
  "name": "Digory Kirke",
  "book": "The Magician's Nephew",
  "bookId": "mn",
  "bio": "Brave London boy. Quick fists and the little golden hammer from the Hall of Images.",
  "starter": false,
  "body": "biped",
  "variant": "child",
  "scale": 0.82,
  "colors": {
   "primary": "#5a6e8c",
   "secondary": "#c9b28a",
   "skin": "#f1c9a5",
   "hair": "#5a3a1e"
  },
  "weapon": "hammer",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/01 The Magician's Nephew/",
   "front": "art/characters/01 The Magician's Nephew/Digory Kirke - front.png",
   "side": "art/characters/01 The Magician's Nephew/Digory Kirke - side.png",
   "back": "art/characters/01 The Magician's Nephew/Digory Kirke - back.png",
   "action": "art/characters/01 The Magician's Nephew/Digory Kirke - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "London Jab",
    "desc": "Fast one-two punch",
    "type": "multi"
   },
   "combo1": {
    "name": "Bell Hammer",
    "desc": "Golden hammer swing, ringing shockwave",
    "type": "aoe"
   },
   "combo2": {
    "name": "Garden Wall Vault",
    "desc": "Vaults forward into a flying kick",
    "type": "aoe"
   },
   "power": {
    "name": "Yellow Ring Jump",
    "desc": "Vanishes, reappears behind foes, strikes",
    "type": "melee"
   },
   "flying": {
    "name": "Fledge Drop",
    "desc": "Drops onto foes from Fledge's back",
    "type": "leap"
   },
   "recover": {
    "name": "Get Back Up",
    "desc": "Rolls up fast with a shout",
    "type": "recover"
   }
  }
 },
 {
  "id": "polly-plummer",
  "name": "Polly Plummer",
  "book": "The Magician's Nephew",
  "bookId": "mn",
  "bio": "Quick, clever girl. Dodges and strikes with speed.",
  "starter": false,
  "body": "biped",
  "variant": "child",
  "scale": 0.8,
  "colors": {
   "primary": "#b5485d",
   "secondary": "#f4e3c1",
   "skin": "#f1c9a5",
   "hair": "#c9a25a"
  },
  "weapon": "none",
  "sex": "f",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/01 The Magician's Nephew/",
   "front": "art/characters/01 The Magician's Nephew/Polly Plummer - front.png",
   "side": "art/characters/01 The Magician's Nephew/Polly Plummer - side.png",
   "back": "art/characters/01 The Magician's Nephew/Polly Plummer - back.png",
   "action": "art/characters/01 The Magician's Nephew/Polly Plummer - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Quick Kick",
    "desc": "Fast snap kick",
    "type": "melee"
   },
   "combo1": {
    "name": "Attic Tunnel Dash",
    "desc": "Low crawl dash into a trip",
    "type": "dash"
   },
   "combo2": {
    "name": "Pool Splash",
    "desc": "Splash from the Wood knocks foes off balance",
    "type": "melee"
   },
   "power": {
    "name": "Green Ring Flash",
    "desc": "Ring flash teleports her, stuns nearby",
    "type": "aoe"
   },
   "flying": {
    "name": "Cartwheel Leap",
    "desc": "Cartwheel jump into a double kick",
    "type": "leap"
   },
   "recover": {
    "name": "Ring Spin",
    "desc": "Spins up off the ground",
    "type": "recover"
   }
  }
 },
 {
  "id": "king-frank-the-cabby",
  "name": "King Frank (the Cabby)",
  "book": "The Magician's Nephew",
  "bookId": "mn",
  "bio": "London cab driver who becomes Narnia's first King. Big fists and a cab whip.",
  "starter": false,
  "body": "biped",
  "variant": "crown",
  "scale": 1.05,
  "colors": {
   "primary": "#3b4a3a",
   "secondary": "#c9a227",
   "skin": "#f1c9a5",
   "hair": "#3a2a1a"
  },
  "weapon": "whip",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/01 The Magician's Nephew/",
   "front": "art/characters/01 The Magician's Nephew/King Frank (the Cabby) - front.png",
   "side": "art/characters/01 The Magician's Nephew/King Frank (the Cabby) - side.png",
   "back": "art/characters/01 The Magician's Nephew/King Frank (the Cabby) - back.png",
   "action": "art/characters/01 The Magician's Nephew/King Frank (the Cabby) - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Cabby's Haymaker",
    "desc": "Big swinging punch",
    "type": "melee"
   },
   "combo1": {
    "name": "Whip Crack",
    "desc": "Two whip cracks, then a punch",
    "type": "multi"
   },
   "combo2": {
    "name": "Hymn Charge",
    "desc": "Sings out, charges shoulder first",
    "type": "dash"
   },
   "power": {
    "name": "Crown of Narnia",
    "desc": "Golden glow, triple-strength punches",
    "type": "aoe"
   },
   "flying": {
    "name": "Cab-Roof Drop",
    "desc": "Jumps high, lands in a body slam",
    "type": "leap"
   },
   "recover": {
    "name": "Steady On",
    "desc": "Dusts off his hat, stands up",
    "type": "recover"
   }
  }
 },
 {
  "id": "fledge",
  "name": "Fledge",
  "book": "The Magician's Nephew",
  "bookId": "mn",
  "bio": "Strawberry the cab-horse, given wings by Aslan. Kicks, charges and flies.",
  "starter": false,
  "body": "quadruped",
  "variant": "horse-winged",
  "scale": 1,
  "colors": {
   "primary": "#a0522d",
   "secondary": "#5a2d0c",
   "skin": "#a0522d",
   "hair": "#f3eee0"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/01 The Magician's Nephew/",
   "front": "art/characters/01 The Magician's Nephew/Fledge - front.png",
   "side": "art/characters/01 The Magician's Nephew/Fledge - side.png",
   "back": "art/characters/01 The Magician's Nephew/Fledge - back.png",
   "action": "art/characters/01 The Magician's Nephew/Fledge - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Hoof Kick",
    "desc": "Back hooves kick straight behind",
    "type": "melee"
   },
   "combo1": {
    "name": "Gallop Charge",
    "desc": "Rushes, rears, double hoof stomp",
    "type": "dash"
   },
   "combo2": {
    "name": "Wing Buffet",
    "desc": "Wing beats blow foes backward",
    "type": "melee"
   },
   "power": {
    "name": "Sky Stampede",
    "desc": "Flies a loop, dives through all foes",
    "type": "dash"
   },
   "flying": {
    "name": "Winged Dive",
    "desc": "Soars up, dives hooves first",
    "type": "leap"
   },
   "recover": {
    "name": "Wing Flap Up",
    "desc": "Beats wings to lift back up",
    "type": "recover"
   }
  }
 },
 {
  "id": "uncle-andrew",
  "name": "Uncle Andrew",
  "book": "The Magician's Nephew",
  "bookId": "mn",
  "bio": "The sneaky magician who made the rings. A comic, dodgy fighter.",
  "starter": false,
  "body": "biped",
  "variant": "thin",
  "scale": 1,
  "colors": {
   "primary": "#5c4033",
   "secondary": "#e8e0c8",
   "skin": "#f1c9a5",
   "hair": "#d8d8d8"
  },
  "weapon": "cane",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/01 The Magician's Nephew/",
   "front": "art/characters/01 The Magician's Nephew/Uncle Andrew - front.png",
   "side": "art/characters/01 The Magician's Nephew/Uncle Andrew - side.png",
   "back": "art/characters/01 The Magician's Nephew/Uncle Andrew - back.png",
   "action": "art/characters/01 The Magician's Nephew/Uncle Andrew - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Cane Poke",
    "desc": "Jabs with his walking stick",
    "type": "melee"
   },
   "combo1": {
    "name": "Atlantis Dust",
    "desc": "Magic dust cloud blinds nearby foes",
    "type": "aoe"
   },
   "combo2": {
    "name": "Ring Box Bonk",
    "desc": "Swings the wooden ring box",
    "type": "melee"
   },
   "power": {
    "name": "Yellow Ring Trick",
    "desc": "Slips rings on foes, they vanish briefly",
    "type": "melee"
   },
   "flying": {
    "name": "Panicked Leap",
    "desc": "Flailing jump, lands on foes",
    "type": "leap"
   },
   "recover": {
    "name": "Bumbling Rise",
    "desc": "Wobbles up, complaining loudly",
    "type": "recover"
   }
  }
 },
 {
  "id": "the-bulldog",
  "name": "The Bulldog",
  "book": "The Magician's Nephew",
  "bookId": "mn",
  "bio": "A Talking Dog of new Narnia. Bites, barks and bowls foes over.",
  "starter": false,
  "body": "quadruped",
  "variant": "dog",
  "scale": 0.6,
  "colors": {
   "primary": "#c8a27a",
   "secondary": "#f0e0c8",
   "skin": "#c8a27a",
   "hair": "#3a2a1a"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/01 The Magician's Nephew/",
   "front": "art/characters/01 The Magician's Nephew/The Bulldog - front.png",
   "side": "art/characters/01 The Magician's Nephew/The Bulldog - side.png",
   "back": "art/characters/01 The Magician's Nephew/The Bulldog - back.png",
   "action": "art/characters/01 The Magician's Nephew/The Bulldog - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Bulldog Bite",
    "desc": "Quick snapping bite",
    "type": "melee"
   },
   "combo1": {
    "name": "Tug of War",
    "desc": "Grabs a sleeve, shakes, throws",
    "type": "projectile"
   },
   "combo2": {
    "name": "Bark Blast",
    "desc": "Loud barks push enemies back",
    "type": "aoe"
   },
   "power": {
    "name": "Bulldog Bowl",
    "desc": "Rolls into foes like a cannonball",
    "type": "melee"
   },
   "flying": {
    "name": "Leaping Snap",
    "desc": "Jumps up and bites from above",
    "type": "leap"
   },
   "recover": {
    "name": "Shake It Off",
    "desc": "Shakes all over, springs up",
    "type": "recover"
   }
  }
 },
 {
  "id": "the-elephant",
  "name": "The Elephant",
  "book": "The Magician's Nephew",
  "bookId": "mn",
  "bio": "Huge Talking Elephant of new Narnia. Tramples and trunk-slams.",
  "starter": false,
  "body": "quadruped",
  "variant": "elephant",
  "scale": 1.5,
  "colors": {
   "primary": "#8d8d8d",
   "secondary": "#bdbdbd",
   "skin": "#8d8d8d",
   "hair": "#eeeeee"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/01 The Magician's Nephew/",
   "front": "art/characters/01 The Magician's Nephew/The Elephant - front.png",
   "side": "art/characters/01 The Magician's Nephew/The Elephant - side.png",
   "back": "art/characters/01 The Magician's Nephew/The Elephant - back.png",
   "action": "art/characters/01 The Magician's Nephew/The Elephant - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Trunk Slap",
    "desc": "Wide trunk swing",
    "type": "melee"
   },
   "combo1": {
    "name": "Tusk Toss",
    "desc": "Tusk hook launches foe upward",
    "type": "melee"
   },
   "combo2": {
    "name": "Trunk Spray",
    "desc": "Water blast washes foes back",
    "type": "aoe"
   },
   "power": {
    "name": "Stampede Stomp",
    "desc": "Earth-shaking stomps across the arena",
    "type": "dash"
   },
   "flying": {
    "name": "Big Belly Flop",
    "desc": "Heavy jump, giant landing slam",
    "type": "leap"
   },
   "recover": {
    "name": "Trumpet Call",
    "desc": "Trumpets loudly and rises",
    "type": "recover"
   }
  }
 },
 {
  "id": "the-bear",
  "name": "The Bear",
  "book": "The Magician's Nephew",
  "bookId": "mn",
  "bio": "Talking Bear of new Narnia, one of the honeycomb bringers. Wrestles and swipes.",
  "starter": false,
  "body": "quadruped",
  "variant": "bear",
  "scale": 1.1,
  "colors": {
   "primary": "#6b4423",
   "secondary": "#8a5a33",
   "skin": "#6b4423",
   "hair": "#3a2412"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/01 The Magician's Nephew/",
   "front": "art/characters/01 The Magician's Nephew/The Bear - front.png",
   "side": "art/characters/01 The Magician's Nephew/The Bear - side.png",
   "back": "art/characters/01 The Magician's Nephew/The Bear - back.png",
   "action": "art/characters/01 The Magician's Nephew/The Bear - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Bear Swipe",
    "desc": "Heavy paw swipe",
    "type": "melee"
   },
   "combo1": {
    "name": "Bear Hug",
    "desc": "Grabs, squeezes, tosses",
    "type": "melee"
   },
   "combo2": {
    "name": "Honeycomb Hurl",
    "desc": "Sticky honeycomb slows a foe",
    "type": "projectile"
   },
   "power": {
    "name": "Bear Rampage",
    "desc": "Rushes through foes swiping wildly",
    "type": "dash"
   },
   "flying": {
    "name": "Bear Drop",
    "desc": "Leaps and slams down belly first",
    "type": "leap"
   },
   "recover": {
    "name": "Roll and Rise",
    "desc": "Rolls over, stands on hind legs",
    "type": "recover"
   }
  }
 },
 {
  "id": "peter",
  "name": "Peter",
  "book": "The Lion, the Witch and the Wardrobe",
  "bookId": "lww",
  "bio": "The High King. Sword Rhindon and a shield with a red lion.",
  "starter": true,
  "body": "biped",
  "variant": "",
  "scale": 1,
  "colors": {
   "primary": "#c0392b",
   "secondary": "#d4ac0d",
   "skin": "#f1c9a5",
   "hair": "#c9a25a"
  },
  "weapon": "swordshield",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/02 The Lion, the Witch and the Wardrobe/",
   "front": "art/characters/02 The Lion, the Witch and the Wardrobe/Peter - front.png",
   "side": "art/characters/02 The Lion, the Witch and the Wardrobe/Peter - side.png",
   "back": "art/characters/02 The Lion, the Witch and the Wardrobe/Peter - back.png",
   "action": "art/characters/02 The Lion, the Witch and the Wardrobe/Peter - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Rhindon Strike",
    "desc": "Clean forward sword slash",
    "type": "melee"
   },
   "combo1": {
    "name": "Lion Shield Bash",
    "desc": "Shield bash, then sword cut",
    "type": "multi"
   },
   "combo2": {
    "name": "High King's Fury",
    "desc": "Four-hit sword combo with finisher",
    "type": "multi"
   },
   "power": {
    "name": "For Narnia!",
    "desc": "Charging sword rush with golden trail",
    "type": "dash"
   },
   "flying": {
    "name": "Leaping Lion Slash",
    "desc": "Big jump into downward sword chop",
    "type": "leap"
   },
   "recover": {
    "name": "Shield Up Rise",
    "desc": "Rises behind his raised shield",
    "type": "recover"
   }
  }
 },
 {
  "id": "susan",
  "name": "Susan",
  "book": "The Lion, the Witch and the Wardrobe",
  "bookId": "lww",
  "bio": "Archer with Father Christmas's bow and ivory horn.",
  "starter": true,
  "body": "biped",
  "variant": "",
  "scale": 0.95,
  "colors": {
   "primary": "#2e7d32",
   "secondary": "#e0c068",
   "skin": "#f1c9a5",
   "hair": "#3b2414"
  },
  "weapon": "bow",
  "sex": "f",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/02 The Lion, the Witch and the Wardrobe/",
   "front": "art/characters/02 The Lion, the Witch and the Wardrobe/Susan - front.png",
   "side": "art/characters/02 The Lion, the Witch and the Wardrobe/Susan - side.png",
   "back": "art/characters/02 The Lion, the Witch and the Wardrobe/Susan - back.png",
   "action": "art/characters/02 The Lion, the Witch and the Wardrobe/Susan - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Swift Arrow",
    "desc": "Fast single arrow shot",
    "type": "projectile"
   },
   "combo1": {
    "name": "Triple Volley",
    "desc": "Three arrows in a quick spread",
    "type": "projectile"
   },
   "combo2": {
    "name": "Bow Spin Strike",
    "desc": "Bow swing, then close shot",
    "type": "multi"
   },
   "power": {
    "name": "Horn Call",
    "desc": "Horn blast shockwave stuns foes",
    "type": "aoe"
   },
   "flying": {
    "name": "Sky Arrow Rain",
    "desc": "Jumps and fires arrows downward",
    "type": "leap"
   },
   "recover": {
    "name": "Gentle Rise",
    "desc": "Back-rolls up, bow ready",
    "type": "recover"
   }
  }
 },
 {
  "id": "edmund",
  "name": "Edmund",
  "book": "The Lion, the Witch and the Wardrobe",
  "bookId": "lww",
  "bio": "The Just. Sword fighter who smashed the Witch's wand.",
  "starter": true,
  "body": "biped",
  "variant": "",
  "scale": 0.88,
  "colors": {
   "primary": "#34495e",
   "secondary": "#b0bec5",
   "skin": "#f1c9a5",
   "hair": "#2b1a0e"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/02 The Lion, the Witch and the Wardrobe/",
   "front": "art/characters/02 The Lion, the Witch and the Wardrobe/Edmund - front.png",
   "side": "art/characters/02 The Lion, the Witch and the Wardrobe/Edmund - side.png",
   "back": "art/characters/02 The Lion, the Witch and the Wardrobe/Edmund - back.png",
   "action": "art/characters/02 The Lion, the Witch and the Wardrobe/Edmund - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Quick Blade",
    "desc": "Fast sword thrust",
    "type": "melee"
   },
   "combo1": {
    "name": "Wand Breaker",
    "desc": "Overhead chop that breaks blocks",
    "type": "melee"
   },
   "combo2": {
    "name": "Just King Combo",
    "desc": "Three slashes ending in a spin",
    "type": "spin"
   },
   "power": {
    "name": "Turn the Tide",
    "desc": "Glowing sword stuns everyone nearby",
    "type": "aoe"
   },
   "flying": {
    "name": "Battle Leap",
    "desc": "Hop into an overhead sword strike",
    "type": "leap"
   },
   "recover": {
    "name": "Second Chance",
    "desc": "Springs up with a sword sweep",
    "type": "recover"
   }
  }
 },
 {
  "id": "lucy",
  "name": "Lucy",
  "book": "The Lion, the Witch and the Wardrobe",
  "bookId": "lww",
  "bio": "The Valiant. Small dagger and the healing cordial.",
  "starter": true,
  "body": "biped",
  "variant": "child",
  "scale": 0.78,
  "colors": {
   "primary": "#d35454",
   "secondary": "#f7e1a0",
   "skin": "#f1c9a5",
   "hair": "#b5651d"
  },
  "weapon": "dagger",
  "sex": "f",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/02 The Lion, the Witch and the Wardrobe/",
   "front": "art/characters/02 The Lion, the Witch and the Wardrobe/Lucy - front.png",
   "side": "art/characters/02 The Lion, the Witch and the Wardrobe/Lucy - side.png",
   "back": "art/characters/02 The Lion, the Witch and the Wardrobe/Lucy - back.png",
   "action": "art/characters/02 The Lion, the Witch and the Wardrobe/Lucy - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Dagger Dart",
    "desc": "Quick dagger jab",
    "type": "melee"
   },
   "combo1": {
    "name": "Valiant Flurry",
    "desc": "Three fast dagger stabs",
    "type": "multi"
   },
   "combo2": {
    "name": "Lamp-Post Spin",
    "desc": "Spinning dagger slash all around",
    "type": "spin"
   },
   "power": {
    "name": "Fire-Flower Cordial",
    "desc": "Heals herself, refills some health",
    "type": "heal"
   },
   "flying": {
    "name": "Faun Hop Strike",
    "desc": "Light jump into a dagger dive",
    "type": "leap"
   },
   "recover": {
    "name": "Cordial Sip",
    "desc": "One drop of cordial, stands up",
    "type": "recover"
   }
  }
 },
 {
  "id": "the-witch-s-dwarf",
  "name": "The Witch's Dwarf",
  "book": "The Lion, the Witch and the Wardrobe",
  "bookId": "lww",
  "bio": "Drives the White Witch's reindeer sledge. Fights with his long whip.",
  "starter": false,
  "body": "biped",
  "variant": "dwarf",
  "scale": 0.68,
  "colors": {
   "primary": "#4a3b2a",
   "secondary": "#aa3333",
   "skin": "#f1c9a5",
   "hair": "#222222"
  },
  "weapon": "whip",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/02 The Lion, the Witch and the Wardrobe/",
   "front": "art/characters/02 The Lion, the Witch and the Wardrobe/The Witch's Dwarf - front.png",
   "side": "art/characters/02 The Lion, the Witch and the Wardrobe/The Witch's Dwarf - side.png",
   "back": "art/characters/02 The Lion, the Witch and the Wardrobe/The Witch's Dwarf - back.png",
   "action": "art/characters/02 The Lion, the Witch and the Wardrobe/The Witch's Dwarf - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Sledge Whip",
    "desc": "Long whip crack",
    "type": "melee"
   },
   "combo1": {
    "name": "Dwarf Kick",
    "desc": "Kick, whip, kick",
    "type": "melee"
   },
   "combo2": {
    "name": "Reindeer Rush",
    "desc": "Rushes in like the reindeer team",
    "type": "dash"
   },
   "power": {
    "name": "Winter Ride",
    "desc": "Sledge zooms through all foes",
    "type": "dash"
   },
   "flying": {
    "name": "Sledge Leap",
    "desc": "Leaps from the sledge, whip down",
    "type": "leap"
   },
   "recover": {
    "name": "Bells Jingle",
    "desc": "Jingles up, whip ready",
    "type": "recover"
   }
  }
 },
 {
  "id": "the-white-witch",
  "name": "The White Witch",
  "book": "The Lion, the Witch and the Wardrobe",
  "bookId": "lww",
  "bio": "Jadis as Queen of Narnia. Her wand turns foes to stone.",
  "starter": true,
  "body": "biped",
  "variant": "crown",
  "scale": 1.12,
  "colors": {
   "primary": "#e8f4fb",
   "secondary": "#7fc8ef",
   "skin": "#f4f7fb",
   "hair": "#1a1a1a"
  },
  "weapon": "wand",
  "sex": "f",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/02 The Lion, the Witch and the Wardrobe/",
   "front": "art/characters/02 The Lion, the Witch and the Wardrobe/The White Witch - front.png",
   "side": "art/characters/02 The Lion, the Witch and the Wardrobe/The White Witch - side.png",
   "back": "art/characters/02 The Lion, the Witch and the Wardrobe/The White Witch - back.png",
   "action": "art/characters/02 The Lion, the Witch and the Wardrobe/The White Witch - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Wand Strike",
    "desc": "Ice-tipped wand jab",
    "type": "melee"
   },
   "combo1": {
    "name": "Winter Lash",
    "desc": "Two icy wand whips",
    "type": "multi"
   },
   "combo2": {
    "name": "Ice Shard Throw",
    "desc": "Flings sharp ice at foes",
    "type": "projectile"
   },
   "power": {
    "name": "Turn to Stone",
    "desc": "Freezes one foe as a statue briefly",
    "type": "stun"
   },
   "flying": {
    "name": "Frost Fall",
    "desc": "Leaps, lands in an ice burst",
    "type": "leap"
   },
   "recover": {
    "name": "Always Winter",
    "desc": "Ice shell guards her as she rises",
    "type": "recover"
   }
  }
 },
 {
  "id": "mr-beaver",
  "name": "Mr. Beaver",
  "book": "The Lion, the Witch and the Wardrobe",
  "bookId": "lww",
  "bio": "The children's guide. Bites, tail slaps and dam walls.",
  "starter": false,
  "body": "critter",
  "variant": "beaver",
  "scale": 0.6,
  "colors": {
   "primary": "#7b4a2a",
   "secondary": "#a8754f",
   "skin": "#7b4a2a",
   "hair": "#4a2a14"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/02 The Lion, the Witch and the Wardrobe/",
   "front": "art/characters/02 The Lion, the Witch and the Wardrobe/Mr. Beaver - front.png",
   "side": "art/characters/02 The Lion, the Witch and the Wardrobe/Mr. Beaver - side.png",
   "back": "art/characters/02 The Lion, the Witch and the Wardrobe/Mr. Beaver - back.png",
   "action": "art/characters/02 The Lion, the Witch and the Wardrobe/Mr. Beaver - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Beaver Bite",
    "desc": "Chomping front-teeth bite",
    "type": "melee"
   },
   "combo1": {
    "name": "Tail Slap",
    "desc": "Spin, slap, slap with flat tail",
    "type": "spin"
   },
   "combo2": {
    "name": "Dam Builder",
    "desc": "Throws up a log wall to block",
    "type": "projectile"
   },
   "power": {
    "name": "Rapid Gnaw",
    "desc": "Chews through blocks, many bites",
    "type": "dash"
   },
   "flying": {
    "name": "River Dive",
    "desc": "Dive-jump splash onto foes",
    "type": "leap"
   },
   "recover": {
    "name": "Busy Beaver",
    "desc": "Scrambles up in a flash",
    "type": "recover"
   }
  }
 },
 {
  "id": "mr-tumnus",
  "name": "Mr. Tumnus",
  "book": "The Lion, the Witch and the Wardrobe",
  "bookId": "lww",
  "bio": "The Faun. Quick goat hooves, umbrella and pipes.",
  "starter": false,
  "body": "biped",
  "variant": "faun",
  "scale": 0.95,
  "colors": {
   "primary": "#8b5a2b",
   "secondary": "#c0392b",
   "skin": "#f1c9a5",
   "hair": "#3b2a1a"
  },
  "weapon": "umbrella",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/02 The Lion, the Witch and the Wardrobe/",
   "front": "art/characters/02 The Lion, the Witch and the Wardrobe/Mr. Tumnus - front.png",
   "side": "art/characters/02 The Lion, the Witch and the Wardrobe/Mr. Tumnus - side.png",
   "back": "art/characters/02 The Lion, the Witch and the Wardrobe/Mr. Tumnus - back.png",
   "action": "art/characters/02 The Lion, the Witch and the Wardrobe/Mr. Tumnus - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Hoof Kick",
    "desc": "Quick goat-hoof kick",
    "type": "melee"
   },
   "combo1": {
    "name": "Faun Dance",
    "desc": "Spinning dance kicks",
    "type": "spin"
   },
   "combo2": {
    "name": "Umbrella Parry",
    "desc": "Blocks with umbrella, then jabs",
    "type": "aoe"
   },
   "power": {
    "name": "Lullaby Pipes",
    "desc": "Pipe song makes foes sleepy",
    "type": "aoe"
   },
   "flying": {
    "name": "Goat Leap",
    "desc": "High springy jump, hoof stomp",
    "type": "leap"
   },
   "recover": {
    "name": "Scarf Twirl",
    "desc": "Twirls up with his red scarf",
    "type": "recover"
   }
  }
 },
 {
  "id": "maugrim",
  "name": "Maugrim",
  "book": "The Lion, the Witch and the Wardrobe",
  "bookId": "lww",
  "bio": "Wolf, Captain of the Witch's Secret Police (Fenris Ulf in some editions).",
  "starter": false,
  "body": "quadruped",
  "variant": "wolf",
  "scale": 0.9,
  "colors": {
   "primary": "#5f6a72",
   "secondary": "#8c969e",
   "skin": "#5f6a72",
   "hair": "#3a4248"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/02 The Lion, the Witch and the Wardrobe/",
   "front": "art/characters/02 The Lion, the Witch and the Wardrobe/Maugrim - front.png",
   "side": "art/characters/02 The Lion, the Witch and the Wardrobe/Maugrim - side.png",
   "back": "art/characters/02 The Lion, the Witch and the Wardrobe/Maugrim - back.png",
   "action": "art/characters/02 The Lion, the Witch and the Wardrobe/Maugrim - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Wolf Bite",
    "desc": "Fast lunging bite",
    "type": "melee"
   },
   "combo1": {
    "name": "Pack Hunt",
    "desc": "Dash, bite, dash, bite",
    "type": "dash"
   },
   "combo2": {
    "name": "Claw Rake",
    "desc": "Two slashing claw rakes",
    "type": "multi"
   },
   "power": {
    "name": "Howl of Winter",
    "desc": "Icy howl slows all foes",
    "type": "aoe"
   },
   "flying": {
    "name": "Pouncing Fang",
    "desc": "Long leap, bites on landing",
    "type": "leap"
   },
   "recover": {
    "name": "Prowl",
    "desc": "Crouches and slinks back up",
    "type": "recover"
   }
  }
 },
 {
  "id": "giant-rumblebuffin",
  "name": "Giant Rumblebuffin",
  "book": "The Lion, the Witch and the Wardrobe",
  "bookId": "lww",
  "bio": "Kind giant freed from stone. Swings a huge club.",
  "starter": false,
  "body": "biped",
  "variant": "giant",
  "scale": 1.9,
  "colors": {
   "primary": "#6d5d3b",
   "secondary": "#8a7a55",
   "skin": "#f1c9a5",
   "hair": "#7a4a1a"
  },
  "weapon": "club",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/02 The Lion, the Witch and the Wardrobe/",
   "front": "art/characters/02 The Lion, the Witch and the Wardrobe/Giant Rumblebuffin - front.png",
   "side": "art/characters/02 The Lion, the Witch and the Wardrobe/Giant Rumblebuffin - side.png",
   "back": "art/characters/02 The Lion, the Witch and the Wardrobe/Giant Rumblebuffin - back.png",
   "action": "art/characters/02 The Lion, the Witch and the Wardrobe/Giant Rumblebuffin - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Club Swing",
    "desc": "Wide club sweep",
    "type": "spin"
   },
   "combo1": {
    "name": "Gate Smasher",
    "desc": "Two castle-gate smashing blows",
    "type": "multi"
   },
   "combo2": {
    "name": "Giant Stomp",
    "desc": "Stomps the ground twice",
    "type": "melee"
   },
   "power": {
    "name": "Rumble Quake",
    "desc": "Club slam shakes the whole arena",
    "type": "aoe"
   },
   "flying": {
    "name": "Giant Hop",
    "desc": "Small hop, huge landing shock",
    "type": "leap"
   },
   "recover": {
    "name": "Hanky Wipe",
    "desc": "Wipes his face, stands up",
    "type": "recover"
   }
  }
 },
 {
  "id": "shasta-prince-cor",
  "name": "Shasta (Prince Cor)",
  "book": "The Horse and His Boy",
  "bookId": "hhb",
  "bio": "Fisherman's boy who turns out to be a prince. Untrained but brave with sword and shield.",
  "starter": false,
  "body": "biped",
  "variant": "child",
  "scale": 0.85,
  "colors": {
   "primary": "#c9a87a",
   "secondary": "#7a5a3a",
   "skin": "#c8946a",
   "hair": "#e0c27a"
  },
  "weapon": "swordshield",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/03 The Horse and His Boy/",
   "front": "art/characters/03 The Horse and His Boy/Shasta (Prince Cor) - front.png",
   "side": "art/characters/03 The Horse and His Boy/Shasta (Prince Cor) - side.png",
   "back": "art/characters/03 The Horse and His Boy/Shasta (Prince Cor) - back.png",
   "action": "art/characters/03 The Horse and His Boy/Shasta (Prince Cor) - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Brave Swing",
    "desc": "Rough but strong sword swing",
    "type": "melee"
   },
   "combo1": {
    "name": "Desert Dash",
    "desc": "Running shoulder bump into a slash",
    "type": "dash"
   },
   "combo2": {
    "name": "Shield Scramble",
    "desc": "Shield push, then quick stab",
    "type": "aoe"
   },
   "power": {
    "name": "Run, Shasta, Run",
    "desc": "Speed burst hits every foe passed",
    "type": "dash"
   },
   "flying": {
    "name": "Tomb Leap",
    "desc": "Jumps from the Tombs, sword down",
    "type": "leap"
   },
   "recover": {
    "name": "Prince Cor Rises",
    "desc": "Stands up with a short shield",
    "type": "recover"
   }
  }
 },
 {
  "id": "aravis",
  "name": "Aravis",
  "book": "The Horse and His Boy",
  "bookId": "hhb",
  "bio": "Brave Tarkheena who runs away north. Fast with her dagger.",
  "starter": false,
  "body": "biped",
  "variant": "",
  "scale": 0.95,
  "colors": {
   "primary": "#7b2d5a",
   "secondary": "#e0b84a",
   "skin": "#9a6a44",
   "hair": "#1a1a1a"
  },
  "weapon": "dagger",
  "sex": "f",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/03 The Horse and His Boy/",
   "front": "art/characters/03 The Horse and His Boy/Aravis - front.png",
   "side": "art/characters/03 The Horse and His Boy/Aravis - side.png",
   "back": "art/characters/03 The Horse and His Boy/Aravis - back.png",
   "action": "art/characters/03 The Horse and His Boy/Aravis - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Tarkheena Dagger",
    "desc": "Fast dagger slash",
    "type": "melee"
   },
   "combo1": {
    "name": "Desert Wind",
    "desc": "Two slashes and a spin",
    "type": "spin"
   },
   "combo2": {
    "name": "Hwin's Gallop",
    "desc": "Hwin gallops through foes",
    "type": "dash"
   },
   "power": {
    "name": "Escape from Tashbaan",
    "desc": "Shadow dash through all foes",
    "type": "dash"
   },
   "flying": {
    "name": "Rooftop Leap",
    "desc": "Leaps into a dagger dive",
    "type": "leap"
   },
   "recover": {
    "name": "Proud Rise",
    "desc": "Flips up with a swish",
    "type": "recover"
   }
  }
 },
 {
  "id": "bree",
  "name": "Bree",
  "book": "The Horse and His Boy",
  "bookId": "hhb",
  "bio": "Talking Narnian warhorse, battle trained in Calormen.",
  "starter": false,
  "body": "quadruped",
  "variant": "horse",
  "scale": 1.05,
  "colors": {
   "primary": "#5a3a22",
   "secondary": "#1a1a1a",
   "skin": "#5a3a22",
   "hair": "#1a1a1a"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/03 The Horse and His Boy/",
   "front": "art/characters/03 The Horse and His Boy/Bree - front.png",
   "side": "art/characters/03 The Horse and His Boy/Bree - side.png",
   "back": "art/characters/03 The Horse and His Boy/Bree - back.png",
   "action": "art/characters/03 The Horse and His Boy/Bree - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "War Kick",
    "desc": "Powerful rear-hoof kick",
    "type": "melee"
   },
   "combo1": {
    "name": "Battle Charge",
    "desc": "Gallops, rears, stomps",
    "type": "dash"
   },
   "combo2": {
    "name": "Broo-hoo-hah!",
    "desc": "Battle-cry whinny pushes foes away",
    "type": "aoe"
   },
   "power": {
    "name": "Narnia and the North",
    "desc": "Unstoppable gallop around the arena",
    "type": "dash"
   },
   "flying": {
    "name": "Hurdle Strike",
    "desc": "High leap, double hoof landing",
    "type": "leap"
   },
   "recover": {
    "name": "Roll in the Grass",
    "desc": "Rolls, then springs up",
    "type": "recover"
   }
  }
 },
 {
  "id": "hwin",
  "name": "Hwin",
  "book": "The Horse and His Boy",
  "bookId": "hhb",
  "bio": "Gentle Talking mare, quick and clever.",
  "starter": false,
  "body": "quadruped",
  "variant": "horse",
  "scale": 0.92,
  "colors": {
   "primary": "#d8cfc0",
   "secondary": "#9a9080",
   "skin": "#d8cfc0",
   "hair": "#ffffff"
  },
  "weapon": "none",
  "sex": "f",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/03 The Horse and His Boy/",
   "front": "art/characters/03 The Horse and His Boy/Hwin - front.png",
   "side": "art/characters/03 The Horse and His Boy/Hwin - side.png",
   "back": "art/characters/03 The Horse and His Boy/Hwin - back.png",
   "action": "art/characters/03 The Horse and His Boy/Hwin - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Quick Hoof",
    "desc": "Fast front-hoof strike",
    "type": "melee"
   },
   "combo1": {
    "name": "Swift Trot",
    "desc": "Weaving trot with kicks",
    "type": "melee"
   },
   "combo2": {
    "name": "Mare's Shove",
    "desc": "Head shove knocks foe away",
    "type": "melee"
   },
   "power": {
    "name": "Gallop of Courage",
    "desc": "Speed burst carries her through foes",
    "type": "dash"
   },
   "flying": {
    "name": "Light Leap",
    "desc": "Graceful jump, hoof stomp",
    "type": "leap"
   },
   "recover": {
    "name": "Steady Breath",
    "desc": "Calmly rises with a quick guard",
    "type": "recover"
   }
  }
 },
 {
  "id": "prince-corin-thunder-fist",
  "name": "Prince Corin Thunder-Fist",
  "book": "The Horse and His Boy",
  "bookId": "hhb",
  "bio": "Shasta's twin and a champion boxer.",
  "starter": false,
  "body": "biped",
  "variant": "child",
  "scale": 0.86,
  "colors": {
   "primary": "#8e2a2a",
   "secondary": "#d4a64a",
   "skin": "#f1c9a5",
   "hair": "#e0c27a"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/03 The Horse and His Boy/",
   "front": "art/characters/03 The Horse and His Boy/Prince Corin Thunder-Fist - front.png",
   "side": "art/characters/03 The Horse and His Boy/Prince Corin Thunder-Fist - side.png",
   "back": "art/characters/03 The Horse and His Boy/Prince Corin Thunder-Fist - back.png",
   "action": "art/characters/03 The Horse and His Boy/Prince Corin Thunder-Fist - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Thunder-Fist",
    "desc": "Heavy boxing punch",
    "type": "melee"
   },
   "combo1": {
    "name": "Bear Boxer",
    "desc": "Jab, jab, uppercut",
    "type": "multi"
   },
   "combo2": {
    "name": "Brawler's Rush",
    "desc": "Charging flurry of punches",
    "type": "dash"
   },
   "power": {
    "name": "Thirty-Three Rounds",
    "desc": "Nonstop punch barrage",
    "type": "multi"
   },
   "flying": {
    "name": "Flying Fist",
    "desc": "Jumping overhead punch",
    "type": "leap"
   },
   "recover": {
    "name": "Back on Your Feet",
    "desc": "Hops up, fists raised",
    "type": "recover"
   }
  }
 },
 {
  "id": "king-lune",
  "name": "King Lune",
  "book": "The Horse and His Boy",
  "bookId": "hhb",
  "bio": "Jolly King of Archenland. Sword and hunting horn.",
  "starter": false,
  "body": "biped",
  "variant": "crown-beard",
  "scale": 1.05,
  "colors": {
   "primary": "#8a2d2d",
   "secondary": "#d4a64a",
   "skin": "#f1c9a5",
   "hair": "#b0b0b0"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/03 The Horse and His Boy/",
   "front": "art/characters/03 The Horse and His Boy/King Lune - front.png",
   "side": "art/characters/03 The Horse and His Boy/King Lune - side.png",
   "back": "art/characters/03 The Horse and His Boy/King Lune - back.png",
   "action": "art/characters/03 The Horse and His Boy/King Lune - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "King's Cut",
    "desc": "Broad sword slash",
    "type": "melee"
   },
   "combo1": {
    "name": "Hunting Horn",
    "desc": "Horn blast, then sword chop",
    "type": "aoe"
   },
   "combo2": {
    "name": "Anvard Defense",
    "desc": "Shield block into counter slash",
    "type": "aoe"
   },
   "power": {
    "name": "Sally from the Gate",
    "desc": "Charges out with his knights",
    "type": "dash"
   },
   "flying": {
    "name": "Mounted Leap",
    "desc": "Jumps as if from horseback, slashes",
    "type": "leap"
   },
   "recover": {
    "name": "Hearty Laugh",
    "desc": "Laughs and stands on guard",
    "type": "recover"
   }
  }
 },
 {
  "id": "prince-rabadash",
  "name": "Prince Rabadash",
  "book": "The Horse and His Boy",
  "bookId": "hhb",
  "bio": "Hot-headed Calormene prince with a scimitar.",
  "starter": false,
  "body": "biped",
  "variant": "turban",
  "scale": 1.02,
  "colors": {
   "primary": "#b03a2e",
   "secondary": "#f1c40f",
   "skin": "#9a6a44",
   "hair": "#111111"
  },
  "weapon": "scimitar",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/03 The Horse and His Boy/",
   "front": "art/characters/03 The Horse and His Boy/Prince Rabadash - front.png",
   "side": "art/characters/03 The Horse and His Boy/Prince Rabadash - side.png",
   "back": "art/characters/03 The Horse and His Boy/Prince Rabadash - back.png",
   "action": "art/characters/03 The Horse and His Boy/Prince Rabadash - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Scimitar Slash",
    "desc": "Curved blade swipe",
    "type": "melee"
   },
   "combo1": {
    "name": "Tashbaan Fury",
    "desc": "Three wild scimitar swings",
    "type": "spin"
   },
   "combo2": {
    "name": "Wall Hook Swing",
    "desc": "Swings from a wall hook, kicks",
    "type": "aoe"
   },
   "power": {
    "name": "Rage of Rabadash",
    "desc": "Spinning blade storm",
    "type": "dash"
   },
   "flying": {
    "name": "Mounting-Block Leap",
    "desc": "Jumps high, scimitar down",
    "type": "leap"
   },
   "recover": {
    "name": "Proud Prince",
    "desc": "Leaps up shouting a boast",
    "type": "recover"
   }
  }
 },
 {
  "id": "lord-peridan",
  "name": "Lord Peridan",
  "book": "The Horse and His Boy",
  "bookId": "hhb",
  "bio": "Narnian lord who escapes Tashbaan with the royals and fights at Anvard.",
  "starter": false,
  "body": "biped",
  "variant": "",
  "scale": 1,
  "colors": {
   "primary": "#2c5d8a",
   "secondary": "#c0c0c0",
   "skin": "#f1c9a5",
   "hair": "#6b4a2a"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/03 The Horse and His Boy/",
   "front": "art/characters/03 The Horse and His Boy/Lord Peridan - front.png",
   "side": "art/characters/03 The Horse and His Boy/Lord Peridan - side.png",
   "back": "art/characters/03 The Horse and His Boy/Lord Peridan - back.png",
   "action": "art/characters/03 The Horse and His Boy/Lord Peridan - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Narnian Blade",
    "desc": "Clean sword cut",
    "type": "melee"
   },
   "combo1": {
    "name": "Tashbaan Escape",
    "desc": "Dodge, slash, slash",
    "type": "melee"
   },
   "combo2": {
    "name": "Counsel Strike",
    "desc": "Block, then thrust",
    "type": "aoe"
   },
   "power": {
    "name": "Splendour Hyaline",
    "desc": "Sea-wind blast from the Narnian ship",
    "type": "aoe"
   },
   "flying": {
    "name": "Gangplank Leap",
    "desc": "Jumps from the ship, chops",
    "type": "leap"
   },
   "recover": {
    "name": "Calm Lord",
    "desc": "Rises on guard",
    "type": "recover"
   }
  }
 },
 {
  "id": "anradin-tarkaan",
  "name": "Anradin Tarkaan",
  "book": "The Horse and His Boy",
  "bookId": "hhb",
  "bio": "Bree's old Calormene master with a crimson beard. Scimitar.",
  "starter": false,
  "body": "biped",
  "variant": "turban-beard",
  "scale": 1.02,
  "colors": {
   "primary": "#6c3483",
   "secondary": "#f5cba7",
   "skin": "#9a6a44",
   "hair": "#b0281a"
  },
  "weapon": "scimitar",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/03 The Horse and His Boy/",
   "front": "art/characters/03 The Horse and His Boy/Anradin Tarkaan - front.png",
   "side": "art/characters/03 The Horse and His Boy/Anradin Tarkaan - side.png",
   "back": "art/characters/03 The Horse and His Boy/Anradin Tarkaan - back.png",
   "action": "art/characters/03 The Horse and His Boy/Anradin Tarkaan - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Crimson Beard Cut",
    "desc": "Heavy scimitar cut",
    "type": "melee"
   },
   "combo1": {
    "name": "Tarkaan's Blows",
    "desc": "Three hammering swings",
    "type": "multi"
   },
   "combo2": {
    "name": "Rider's Charge",
    "desc": "Charges as if on horseback",
    "type": "dash"
   },
   "power": {
    "name": "Tisroc's Fury",
    "desc": "Spinning blade fury",
    "type": "spin"
   },
   "flying": {
    "name": "War-Saddle Leap",
    "desc": "Leaps, scimitar down",
    "type": "leap"
   },
   "recover": {
    "name": "Proud Tarkaan",
    "desc": "Rises with a sneer",
    "type": "recover"
   }
  }
 },
 {
  "id": "lord-darrin",
  "name": "Lord Darrin",
  "book": "The Horse and His Boy",
  "bookId": "hhb",
  "bio": "Archenland lord who rides beside King Lune at Anvard.",
  "starter": false,
  "body": "biped",
  "variant": "beard",
  "scale": 1,
  "colors": {
   "primary": "#5d6d2a",
   "secondary": "#c0c0c0",
   "skin": "#f1c9a5",
   "hair": "#5a3a1a"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/03 The Horse and His Boy/",
   "front": "art/characters/03 The Horse and His Boy/Lord Darrin - front.png",
   "side": "art/characters/03 The Horse and His Boy/Lord Darrin - side.png",
   "back": "art/characters/03 The Horse and His Boy/Lord Darrin - back.png",
   "action": "art/characters/03 The Horse and His Boy/Lord Darrin - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Knight's Swing",
    "desc": "Strong sword cut",
    "type": "melee"
   },
   "combo1": {
    "name": "Brother's Guard",
    "desc": "Block, then double slash",
    "type": "aoe"
   },
   "combo2": {
    "name": "Twisted Lip Takedown",
    "desc": "Heavy blow knocks foe flat",
    "type": "melee"
   },
   "power": {
    "name": "Archenland Sortie",
    "desc": "Rushing charge with his brother lords",
    "type": "dash"
   },
   "flying": {
    "name": "Saddle Leap",
    "desc": "Leaps from the saddle, chops",
    "type": "leap"
   },
   "recover": {
    "name": "Loyal Rise",
    "desc": "Gets up beside his king",
    "type": "recover"
   }
  }
 },
 {
  "id": "prince-caspian",
  "name": "Prince Caspian",
  "book": "Prince Caspian",
  "bookId": "pc",
  "bio": "Young rightful King of Narnia. Sword, plus Susan's horn.",
  "starter": true,
  "body": "biped",
  "variant": "",
  "scale": 1,
  "colors": {
   "primary": "#1f3a93",
   "secondary": "#c9a227",
   "skin": "#f1c9a5",
   "hair": "#2b1a0e"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/04 Prince Caspian/",
   "front": "art/characters/04 Prince Caspian/Prince Caspian - front.png",
   "side": "art/characters/04 Prince Caspian/Prince Caspian - side.png",
   "back": "art/characters/04 Prince Caspian/Prince Caspian - back.png",
   "action": "art/characters/04 Prince Caspian/Prince Caspian - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Telmarine Thrust",
    "desc": "Fast sword stab",
    "type": "melee"
   },
   "combo1": {
    "name": "Rightful King",
    "desc": "Three-hit sword chain",
    "type": "multi"
   },
   "combo2": {
    "name": "Horn of Help",
    "desc": "Blows Queen Susan's horn, stuns foes",
    "type": "aoe"
   },
   "power": {
    "name": "Old Narnia Rising",
    "desc": "Old Narnians charge across the arena",
    "type": "dash"
   },
   "flying": {
    "name": "Castle Wall Leap",
    "desc": "Leaps down into a slash",
    "type": "leap"
   },
   "recover": {
    "name": "Cornelius's Lesson",
    "desc": "Rolls up, guard ready",
    "type": "recover"
   }
  }
 },
 {
  "id": "lord-glozelle",
  "name": "Lord Glozelle",
  "book": "Prince Caspian",
  "bookId": "pc",
  "bio": "One of Miraz's marshals, a strong Telmarine swordsman.",
  "starter": false,
  "body": "biped",
  "variant": "helmet",
  "scale": 1.02,
  "colors": {
   "primary": "#5b5b5b",
   "secondary": "#7b241c",
   "skin": "#f1c9a5",
   "hair": "#2a2a2a"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/04 Prince Caspian/",
   "front": "art/characters/04 Prince Caspian/Lord Glozelle - front.png",
   "side": "art/characters/04 Prince Caspian/Lord Glozelle - side.png",
   "back": "art/characters/04 Prince Caspian/Lord Glozelle - back.png",
   "action": "art/characters/04 Prince Caspian/Lord Glozelle - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Marshal's Cut",
    "desc": "Strong sword cut",
    "type": "melee"
   },
   "combo1": {
    "name": "Side Strike",
    "desc": "Fake, then stab from the side",
    "type": "melee"
   },
   "combo2": {
    "name": "Telmarine Wall",
    "desc": "Shield block, then push",
    "type": "aoe"
   },
   "power": {
    "name": "Marshal's Command",
    "desc": "Telmarine soldiers rush in",
    "type": "dash"
   },
   "flying": {
    "name": "Lists Leap",
    "desc": "Jumps into a heavy chop",
    "type": "leap"
   },
   "recover": {
    "name": "Sly Rise",
    "desc": "Rolls away, then stands",
    "type": "recover"
   }
  }
 },
 {
  "id": "lord-sopespian",
  "name": "Lord Sopespian",
  "book": "Prince Caspian",
  "bookId": "pc",
  "bio": "Miraz's other scheming marshal. Sword and spear.",
  "starter": false,
  "body": "biped",
  "variant": "helmet",
  "scale": 1,
  "colors": {
   "primary": "#4a4a4a",
   "secondary": "#1f618d",
   "skin": "#f1c9a5",
   "hair": "#2a2a2a"
  },
  "weapon": "spear",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/04 Prince Caspian/",
   "front": "art/characters/04 Prince Caspian/Lord Sopespian - front.png",
   "side": "art/characters/04 Prince Caspian/Lord Sopespian - side.png",
   "back": "art/characters/04 Prince Caspian/Lord Sopespian - back.png",
   "action": "art/characters/04 Prince Caspian/Lord Sopespian - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Lord's Thrust",
    "desc": "Fast sword thrust",
    "type": "melee"
   },
   "combo1": {
    "name": "Scheming Blows",
    "desc": "Two quick cuts, one kick",
    "type": "multi"
   },
   "combo2": {
    "name": "Spear Grab",
    "desc": "Grabs a spear and jabs",
    "type": "melee"
   },
   "power": {
    "name": "Plot Twist",
    "desc": "Smoke dash, hits from behind",
    "type": "dash"
   },
   "flying": {
    "name": "Leap from the Lists",
    "desc": "Jumps, slashes down",
    "type": "leap"
   },
   "recover": {
    "name": "Smooth Talker",
    "desc": "Smiles and stands",
    "type": "recover"
   }
  }
 },
 {
  "id": "trumpkin",
  "name": "Trumpkin",
  "book": "Prince Caspian",
  "bookId": "pc",
  "bio": "Red Dwarf and loyal soldier, the DLF (Dear Little Friend).",
  "starter": true,
  "body": "biped",
  "variant": "dwarf",
  "scale": 0.68,
  "colors": {
   "primary": "#8e3b2a",
   "secondary": "#4a6b2a",
   "skin": "#f1c9a5",
   "hair": "#c0461a"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/04 Prince Caspian/",
   "front": "art/characters/04 Prince Caspian/Trumpkin - front.png",
   "side": "art/characters/04 Prince Caspian/Trumpkin - side.png",
   "back": "art/characters/04 Prince Caspian/Trumpkin - back.png",
   "action": "art/characters/04 Prince Caspian/Trumpkin - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Dwarf Chop",
    "desc": "Short sword chop",
    "type": "melee"
   },
   "combo1": {
    "name": "Red Dwarf Rush",
    "desc": "Low charge with two slashes",
    "type": "dash"
   },
   "combo2": {
    "name": "Bowman's Shot",
    "desc": "Draws and fires fast",
    "type": "projectile"
   },
   "power": {
    "name": "Dear Little Friend",
    "desc": "Spinning blade fury",
    "type": "spin"
   },
   "flying": {
    "name": "Barrel Hop",
    "desc": "Hops onto a foe, sword down",
    "type": "leap"
   },
   "recover": {
    "name": "Grumble Up",
    "desc": "Grumbles and pops back up",
    "type": "recover"
   }
  }
 },
 {
  "id": "pattertwig",
  "name": "Pattertwig",
  "book": "Prince Caspian",
  "bookId": "pc",
  "bio": "Chattering Talking Red Squirrel who carries messages for Caspian.",
  "starter": false,
  "body": "critter",
  "variant": "squirrel",
  "scale": 0.5,
  "colors": {
   "primary": "#b5532a",
   "secondary": "#f0d0a0",
   "skin": "#b5532a",
   "hair": "#7a2a10"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/04 Prince Caspian/",
   "front": "art/characters/04 Prince Caspian/Pattertwig - front.png",
   "side": "art/characters/04 Prince Caspian/Pattertwig - side.png",
   "back": "art/characters/04 Prince Caspian/Pattertwig - back.png",
   "action": "art/characters/04 Prince Caspian/Pattertwig - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Nut Pelt",
    "desc": "Throws a hard nut",
    "type": "projectile"
   },
   "combo1": {
    "name": "Chatter Dash",
    "desc": "Zips in, bites, zips out",
    "type": "dash"
   },
   "combo2": {
    "name": "Tail Flick",
    "desc": "Bushy tail slap",
    "type": "melee"
   },
   "power": {
    "name": "Nut Storm",
    "desc": "Rain of nuts from above",
    "type": "spin"
   },
   "flying": {
    "name": "Treetop Leap",
    "desc": "Leaps from branches, pounces",
    "type": "leap"
   },
   "recover": {
    "name": "Scurry Up",
    "desc": "Scurries up in a blink",
    "type": "recover"
   }
  }
 },
 {
  "id": "trufflehunter",
  "name": "Trufflehunter",
  "book": "Prince Caspian",
  "bookId": "pc",
  "bio": "Loyal Talking Badger. Bites and digs.",
  "starter": false,
  "body": "critter",
  "variant": "badger",
  "scale": 0.62,
  "colors": {
   "primary": "#5a5a5a",
   "secondary": "#f0f0f0",
   "skin": "#5a5a5a",
   "hair": "#1a1a1a"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/04 Prince Caspian/",
   "front": "art/characters/04 Prince Caspian/Trufflehunter - front.png",
   "side": "art/characters/04 Prince Caspian/Trufflehunter - side.png",
   "back": "art/characters/04 Prince Caspian/Trufflehunter - back.png",
   "action": "art/characters/04 Prince Caspian/Trufflehunter - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Badger Bite",
    "desc": "Strong gripping bite",
    "type": "melee"
   },
   "combo1": {
    "name": "Dig Strike",
    "desc": "Burrows, pops up hitting a foe",
    "type": "melee"
   },
   "combo2": {
    "name": "Claw Scratch",
    "desc": "Two digging claw swipes",
    "type": "multi"
   },
   "power": {
    "name": "Badgers Remember",
    "desc": "Unstoppable rush, can't be knocked down",
    "type": "dash"
   },
   "flying": {
    "name": "Burrow Leap",
    "desc": "Leaps from a hole, slams",
    "type": "leap"
   },
   "recover": {
    "name": "Steady Badger",
    "desc": "Calmly gets up, armored",
    "type": "recover"
   }
  }
 },
 {
  "id": "glenstorm",
  "name": "Glenstorm",
  "book": "Prince Caspian",
  "bookId": "pc",
  "bio": "Centaur prophet and warrior, father of three sons. Fights with a sword.",
  "starter": false,
  "body": "centaur",
  "variant": "",
  "scale": 1.15,
  "colors": {
   "primary": "#6b4b2a",
   "secondary": "#c9a227",
   "skin": "#f1c9a5",
   "hair": "#c9a25a"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/04 Prince Caspian/",
   "front": "art/characters/04 Prince Caspian/Glenstorm - front.png",
   "side": "art/characters/04 Prince Caspian/Glenstorm - side.png",
   "back": "art/characters/04 Prince Caspian/Glenstorm - back.png",
   "action": "art/characters/04 Prince Caspian/Glenstorm - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Centaur Sword",
    "desc": "Sword strike from up high",
    "type": "melee"
   },
   "combo1": {
    "name": "Hoof and Blade",
    "desc": "Kicks, then sword slash",
    "type": "melee"
   },
   "combo2": {
    "name": "Stamping Charge",
    "desc": "Gallops forward, front hooves strike",
    "type": "dash"
   },
   "power": {
    "name": "Stars Foretell",
    "desc": "Starlight rains down on foes",
    "type": "aoe"
   },
   "flying": {
    "name": "Centaur Bound",
    "desc": "Long gallop leap, double stomp",
    "type": "leap"
   },
   "recover": {
    "name": "Warrior Rise",
    "desc": "Rears up, guard raised",
    "type": "recover"
   }
  }
 },
 {
  "id": "king-miraz",
  "name": "King Miraz",
  "book": "Prince Caspian",
  "bookId": "pc",
  "bio": "The usurper king. Heavy sword in his duel with Peter.",
  "starter": false,
  "body": "biped",
  "variant": "crown-beard",
  "scale": 1.08,
  "colors": {
   "primary": "#3d3d3d",
   "secondary": "#7b1f1f",
   "skin": "#f1c9a5",
   "hair": "#222222"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/04 Prince Caspian/",
   "front": "art/characters/04 Prince Caspian/King Miraz - front.png",
   "side": "art/characters/04 Prince Caspian/King Miraz - side.png",
   "back": "art/characters/04 Prince Caspian/King Miraz - back.png",
   "action": "art/characters/04 Prince Caspian/King Miraz - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Usurper Slash",
    "desc": "Heavy sword cut",
    "type": "melee"
   },
   "combo1": {
    "name": "Tyrant's Blows",
    "desc": "Three hammering strikes",
    "type": "multi"
   },
   "combo2": {
    "name": "Telmarine Guard",
    "desc": "Shield block, counter slash",
    "type": "aoe"
   },
   "power": {
    "name": "King's Wrath",
    "desc": "Rage burst, power slashes",
    "type": "aoe"
   },
   "flying": {
    "name": "Leap Attack",
    "desc": "Jumps and crashes down",
    "type": "leap"
   },
   "recover": {
    "name": "Iron Pride",
    "desc": "Rises stiffly, armored",
    "type": "recover"
   }
  }
 },
 {
  "id": "wimbleweather",
  "name": "Wimbleweather",
  "book": "Prince Caspian",
  "bookId": "pc",
  "bio": "Well-meaning giant who fights for Caspian. Big club.",
  "starter": false,
  "body": "biped",
  "variant": "giant",
  "scale": 1.8,
  "colors": {
   "primary": "#5b6b3b",
   "secondary": "#8a6a3a",
   "skin": "#f1c9a5",
   "hair": "#4a3a1a"
  },
  "weapon": "club",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/04 Prince Caspian/",
   "front": "art/characters/04 Prince Caspian/Wimbleweather - front.png",
   "side": "art/characters/04 Prince Caspian/Wimbleweather - side.png",
   "back": "art/characters/04 Prince Caspian/Wimbleweather - back.png",
   "action": "art/characters/04 Prince Caspian/Wimbleweather - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Giant Club",
    "desc": "Big club swing",
    "type": "melee"
   },
   "combo1": {
    "name": "Clumsy Crush",
    "desc": "Two stomps and one swing",
    "type": "dash"
   },
   "combo2": {
    "name": "Rock Toss",
    "desc": "Hurls a boulder",
    "type": "projectile"
   },
   "power": {
    "name": "Earthshaker",
    "desc": "Huge slam, arena quake",
    "type": "aoe"
   },
   "flying": {
    "name": "Giant Hop",
    "desc": "Hop and heavy landing",
    "type": "leap"
   },
   "recover": {
    "name": "Sorry Giant",
    "desc": "Apologizes and gets up",
    "type": "recover"
   }
  }
 },
 {
  "id": "nikabrik",
  "name": "Nikabrik",
  "book": "Prince Caspian",
  "bookId": "pc",
  "bio": "Bitter Black Dwarf. Short axe.",
  "starter": false,
  "body": "biped",
  "variant": "dwarf",
  "scale": 0.66,
  "colors": {
   "primary": "#2b2b2b",
   "secondary": "#5a3a1a",
   "skin": "#f1c9a5",
   "hair": "#111111"
  },
  "weapon": "axe",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/04 Prince Caspian/",
   "front": "art/characters/04 Prince Caspian/Nikabrik - front.png",
   "side": "art/characters/04 Prince Caspian/Nikabrik - side.png",
   "back": "art/characters/04 Prince Caspian/Nikabrik - back.png",
   "action": "art/characters/04 Prince Caspian/Nikabrik - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Black Dwarf Axe",
    "desc": "Short axe chop",
    "type": "melee"
   },
   "combo1": {
    "name": "Grudge Combo",
    "desc": "Axe, kick, axe",
    "type": "melee"
   },
   "combo2": {
    "name": "Dark Bargain",
    "desc": "Throws a puff of dark smoke",
    "type": "projectile"
   },
   "power": {
    "name": "Black Dwarf Fury",
    "desc": "Spinning axe tornado",
    "type": "spin"
   },
   "flying": {
    "name": "Dwarf Pounce",
    "desc": "Leaps, axe down",
    "type": "leap"
   },
   "recover": {
    "name": "Scowl and Stand",
    "desc": "Scowls and pops up",
    "type": "recover"
   }
  }
 },
 {
  "id": "coriakin",
  "name": "Coriakin",
  "book": "The Voyage of the Dawn Treader",
  "bookId": "vdt",
  "bio": "The Magician of the Island of Voices, a star who rules the Dufflepuds. Staff and spells.",
  "starter": false,
  "body": "biped",
  "variant": "beard",
  "scale": 1,
  "colors": {
   "primary": "#2d3e8c",
   "secondary": "#f5e663",
   "skin": "#f1c9a5",
   "hair": "#e8e8e8"
  },
  "weapon": "staff",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/05 The Voyage of the Dawn Treader/",
   "front": "art/characters/05 The Voyage of the Dawn Treader/Coriakin - front.png",
   "side": "art/characters/05 The Voyage of the Dawn Treader/Coriakin - side.png",
   "back": "art/characters/05 The Voyage of the Dawn Treader/Coriakin - back.png",
   "action": "art/characters/05 The Voyage of the Dawn Treader/Coriakin - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Staff Tap",
    "desc": "Magic staff strike",
    "type": "melee"
   },
   "combo1": {
    "name": "Spell Sparks",
    "desc": "Two quick spell sparks",
    "type": "projectile"
   },
   "combo2": {
    "name": "Visible Again",
    "desc": "Reveals hidden foes, zaps them",
    "type": "melee"
   },
   "power": {
    "name": "Magician's Glow",
    "desc": "Big light blast",
    "type": "aoe"
   },
   "flying": {
    "name": "Floating Step",
    "desc": "Floats up, zaps down",
    "type": "leap"
   },
   "recover": {
    "name": "Wise Rise",
    "desc": "Calmly stands with a small shield",
    "type": "recover"
   }
  }
 },
 {
  "id": "lord-rhoop",
  "name": "Lord Rhoop",
  "book": "The Voyage of the Dawn Treader",
  "bookId": "vdt",
  "bio": "Lost Narnian lord rescued from the Dark Island. Sword.",
  "starter": false,
  "body": "biped",
  "variant": "beard",
  "scale": 0.98,
  "colors": {
   "primary": "#5a5a4a",
   "secondary": "#8a8a7a",
   "skin": "#e0c8b0",
   "hair": "#cfcfcf"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/05 The Voyage of the Dawn Treader/",
   "front": "art/characters/05 The Voyage of the Dawn Treader/Lord Rhoop - front.png",
   "side": "art/characters/05 The Voyage of the Dawn Treader/Lord Rhoop - side.png",
   "back": "art/characters/05 The Voyage of the Dawn Treader/Lord Rhoop - back.png",
   "action": "art/characters/05 The Voyage of the Dawn Treader/Lord Rhoop - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Rescued Blade",
    "desc": "Shaky but fast sword cut",
    "type": "melee"
   },
   "combo1": {
    "name": "Nightmare Escape",
    "desc": "Dodge, dodge, slash",
    "type": "melee"
   },
   "combo2": {
    "name": "Fear Shout",
    "desc": "Shout pushes foes back",
    "type": "aoe"
   },
   "power": {
    "name": "Out of the Dark",
    "desc": "Light burst blinds all foes",
    "type": "aoe"
   },
   "flying": {
    "name": "Desperate Leap",
    "desc": "Leaps aboard, chops",
    "type": "leap"
   },
   "recover": {
    "name": "Wake Up",
    "desc": "Shakes off the dream, stands",
    "type": "recover"
   }
  }
 },
 {
  "id": "chief-duffer",
  "name": "Chief Duffer",
  "book": "The Voyage of the Dawn Treader",
  "bookId": "vdt",
  "bio": "Leader of the one-footed Dufflepuds, who agree with everything he says.",
  "starter": false,
  "body": "monopod",
  "variant": "",
  "scale": 0.75,
  "colors": {
   "primary": "#c08a3a",
   "secondary": "#7a4a1a",
   "skin": "#f1c9a5",
   "hair": "#5a3a1a"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/05 The Voyage of the Dawn Treader/",
   "front": "art/characters/05 The Voyage of the Dawn Treader/Chief Duffer - front.png",
   "side": "art/characters/05 The Voyage of the Dawn Treader/Chief Duffer - side.png",
   "back": "art/characters/05 The Voyage of the Dawn Treader/Chief Duffer - back.png",
   "action": "art/characters/05 The Voyage of the Dawn Treader/Chief Duffer - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Big Foot Stomp",
    "desc": "Stomps with his one huge foot",
    "type": "melee"
   },
   "combo1": {
    "name": "Bounce Bounce",
    "desc": "Two hops onto foes",
    "type": "multi"
   },
   "combo2": {
    "name": "Umbrella Foot",
    "desc": "Lies back, foot blocks like an umbrella",
    "type": "aoe"
   },
   "power": {
    "name": "Monopod Mayhem",
    "desc": "Bounces all over the arena",
    "type": "dash"
   },
   "flying": {
    "name": "Mega Hop",
    "desc": "Huge one-foot hop",
    "type": "leap"
   },
   "recover": {
    "name": "Right You Are, Chief!",
    "desc": "Bounces back up",
    "type": "recover"
   }
  }
 },
 {
  "id": "eustace",
  "name": "Eustace",
  "book": "The Voyage of the Dawn Treader",
  "bookId": "vdt",
  "bio": "Grumpy boy who is turned into a dragon and changed by Aslan.",
  "starter": true,
  "body": "biped",
  "variant": "child",
  "scale": 0.86,
  "colors": {
   "primary": "#7a8a99",
   "secondary": "#d4b26a",
   "skin": "#f1c9a5",
   "hair": "#d8b878"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/05 The Voyage of the Dawn Treader/",
   "front": "art/characters/05 The Voyage of the Dawn Treader/Eustace - front.png",
   "side": "art/characters/05 The Voyage of the Dawn Treader/Eustace - side.png",
   "back": "art/characters/05 The Voyage of the Dawn Treader/Eustace - back.png",
   "action": "art/characters/05 The Voyage of the Dawn Treader/Eustace - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Wild Swing",
    "desc": "Untrained but fast sword swing",
    "type": "melee"
   },
   "combo1": {
    "name": "Sea Serpent Hack",
    "desc": "Two big swings at the head",
    "type": "multi"
   },
   "combo2": {
    "name": "Armband Toss",
    "desc": "Throws the dragon's gold armband",
    "type": "projectile"
   },
   "power": {
    "name": "Dragon Eustace",
    "desc": "Briefly becomes a dragon, breathes fire",
    "type": "breath"
   },
   "flying": {
    "name": "Dragon Flap",
    "desc": "Leaps with a wing-flap boost",
    "type": "leap"
   },
   "recover": {
    "name": "Undragoned",
    "desc": "Sheds the dragon skin, stands renewed",
    "type": "recover"
   }
  }
 },
 {
  "id": "reepicheep",
  "name": "Reepicheep",
  "book": "The Voyage of the Dawn Treader",
  "bookId": "vdt",
  "bio": "The Mouse sails to find the utter East.",
  "starter": true,
  "body": "critter",
  "variant": "mouse",
  "scale": 0.5,
  "colors": {
   "primary": "#8a7a6a",
   "secondary": "#c0392b",
   "skin": "#8a7a6a",
   "hair": "#c0392b"
  },
  "weapon": "rapier",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/05 The Voyage of the Dawn Treader/",
   "front": "art/characters/05 The Voyage of the Dawn Treader/Reepicheep - front.png",
   "side": "art/characters/05 The Voyage of the Dawn Treader/Reepicheep - side.png",
   "back": "art/characters/05 The Voyage of the Dawn Treader/Reepicheep - back.png",
   "action": "art/characters/05 The Voyage of the Dawn Treader/Reepicheep - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Pointed Thrust",
    "desc": "Fast rapier stab",
    "type": "melee"
   },
   "combo1": {
    "name": "Duel Flourish",
    "desc": "Three thrusts and a twirl",
    "type": "multi"
   },
   "combo2": {
    "name": "Coracle Charge",
    "desc": "Dashes like his little boat",
    "type": "dash"
   },
   "power": {
    "name": "Utter East",
    "desc": "Burst of light dash, many hits",
    "type": "dash"
   },
   "flying": {
    "name": "Serpent Leap",
    "desc": "Leaps and stabs downward",
    "type": "leap"
   },
   "recover": {
    "name": "Never Retreat",
    "desc": "Hops up, sword raised",
    "type": "recover"
   }
  }
 },
 {
  "id": "captain-drinian",
  "name": "Captain Drinian",
  "book": "The Voyage of the Dawn Treader",
  "bookId": "vdt",
  "bio": "Captain of the Dawn Treader. Sturdy sword.",
  "starter": false,
  "body": "biped",
  "variant": "beard",
  "scale": 1.02,
  "colors": {
   "primary": "#1a3a5a",
   "secondary": "#d4a64a",
   "skin": "#c8946a",
   "hair": "#3a2a1a"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/05 The Voyage of the Dawn Treader/",
   "front": "art/characters/05 The Voyage of the Dawn Treader/Captain Drinian - front.png",
   "side": "art/characters/05 The Voyage of the Dawn Treader/Captain Drinian - side.png",
   "back": "art/characters/05 The Voyage of the Dawn Treader/Captain Drinian - back.png",
   "action": "art/characters/05 The Voyage of the Dawn Treader/Captain Drinian - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Captain's Blade",
    "desc": "Sturdy sword chop",
    "type": "melee"
   },
   "combo1": {
    "name": "All Hands",
    "desc": "Calls the crew, double slash",
    "type": "multi"
   },
   "combo2": {
    "name": "Helm Spin",
    "desc": "Spins like a ship's wheel",
    "type": "spin"
   },
   "power": {
    "name": "Full Sail",
    "desc": "Wind gust pushes foes away",
    "type": "aoe"
   },
   "flying": {
    "name": "Rigging Drop",
    "desc": "Falls from rigging into a chop",
    "type": "leap"
   },
   "recover": {
    "name": "Sea Legs",
    "desc": "Balanced, quick stand",
    "type": "recover"
   }
  }
 },
 {
  "id": "rynelf",
  "name": "Rynelf",
  "book": "The Voyage of the Dawn Treader",
  "bookId": "vdt",
  "bio": "Strong sailor of the Dawn Treader's crew.",
  "starter": false,
  "body": "biped",
  "variant": "",
  "scale": 1.05,
  "colors": {
   "primary": "#7a5a3a",
   "secondary": "#e0d0b0",
   "skin": "#c8946a",
   "hair": "#4a2a1a"
  },
  "weapon": "oar",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/05 The Voyage of the Dawn Treader/",
   "front": "art/characters/05 The Voyage of the Dawn Treader/Rynelf - front.png",
   "side": "art/characters/05 The Voyage of the Dawn Treader/Rynelf - side.png",
   "back": "art/characters/05 The Voyage of the Dawn Treader/Rynelf - back.png",
   "action": "art/characters/05 The Voyage of the Dawn Treader/Rynelf - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Sailor's Punch",
    "desc": "Strong deckhand punch",
    "type": "melee"
   },
   "combo1": {
    "name": "Rope Lash",
    "desc": "Swings a rope twice",
    "type": "melee"
   },
   "combo2": {
    "name": "Oar Smash",
    "desc": "Swings a heavy oar",
    "type": "melee"
   },
   "power": {
    "name": "Heave-Ho",
    "desc": "Lifts and hurls a foe away",
    "type": "projectile"
   },
   "flying": {
    "name": "Crow's Nest Dive",
    "desc": "Dives from the lookout",
    "type": "leap"
   },
   "recover": {
    "name": "Shake Off the Spray",
    "desc": "Shakes off seawater, stands",
    "type": "recover"
   }
  }
 },
 {
  "id": "lord-bern",
  "name": "Lord Bern",
  "book": "The Voyage of the Dawn Treader",
  "bookId": "vdt",
  "bio": "Lost lord found on the Lone Islands. Helps free the slaves.",
  "starter": false,
  "body": "biped",
  "variant": "beard",
  "scale": 1,
  "colors": {
   "primary": "#3a5a3a",
   "secondary": "#c0c0c0",
   "skin": "#f1c9a5",
   "hair": "#8a8a8a"
  },
  "weapon": "swordshield",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/05 The Voyage of the Dawn Treader/",
   "front": "art/characters/05 The Voyage of the Dawn Treader/Lord Bern - front.png",
   "side": "art/characters/05 The Voyage of the Dawn Treader/Lord Bern - side.png",
   "back": "art/characters/05 The Voyage of the Dawn Treader/Lord Bern - back.png",
   "action": "art/characters/05 The Voyage of the Dawn Treader/Lord Bern - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Lord's Sword",
    "desc": "Clean sword cut",
    "type": "melee"
   },
   "combo1": {
    "name": "Felimath Rescue",
    "desc": "Block, cut, cut",
    "type": "aoe"
   },
   "combo2": {
    "name": "Island Guard",
    "desc": "Shield bash",
    "type": "aoe"
   },
   "power": {
    "name": "Chain Breaker",
    "desc": "Shockwave that breaks free of grabs",
    "type": "aoe"
   },
   "flying": {
    "name": "Horseback Leap",
    "desc": "Leaping sword cut",
    "type": "leap"
   },
   "recover": {
    "name": "Lord's Honor",
    "desc": "Rises on guard",
    "type": "recover"
   }
  }
 },
 {
  "id": "pug",
  "name": "Pug",
  "book": "The Voyage of the Dawn Treader",
  "bookId": "vdt",
  "bio": "Slave trader of the Lone Islands. A rough villain.",
  "starter": false,
  "body": "biped",
  "variant": "fat",
  "scale": 1,
  "colors": {
   "primary": "#6b5a3a",
   "secondary": "#3a3a2a",
   "skin": "#c8946a",
   "hair": "#2a2a2a"
  },
  "weapon": "whip",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/05 The Voyage of the Dawn Treader/",
   "front": "art/characters/05 The Voyage of the Dawn Treader/Pug - front.png",
   "side": "art/characters/05 The Voyage of the Dawn Treader/Pug - side.png",
   "back": "art/characters/05 The Voyage of the Dawn Treader/Pug - back.png",
   "action": "art/characters/05 The Voyage of the Dawn Treader/Pug - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Slaver's Whip",
    "desc": "Cracking whip lash",
    "type": "melee"
   },
   "combo1": {
    "name": "Chain Swing",
    "desc": "Swinging chains, two hits",
    "type": "multi"
   },
   "combo2": {
    "name": "Dirty Trick",
    "desc": "Throws sand, then shoves",
    "type": "projectile"
   },
   "power": {
    "name": "Net Throw",
    "desc": "Big net traps one foe",
    "type": "stun"
   },
   "flying": {
    "name": "Belly Bounce",
    "desc": "Clumsy jump, belly slam",
    "type": "leap"
   },
   "recover": {
    "name": "Sneaky Crawl",
    "desc": "Crawls away, then stands",
    "type": "recover"
   }
  }
 },
 {
  "id": "ramandu",
  "name": "Ramandu",
  "book": "The Voyage of the Dawn Treader",
  "bookId": "vdt",
  "bio": "A retired star living as an old man at the World's End.",
  "starter": false,
  "body": "biped",
  "variant": "beard",
  "scale": 1,
  "colors": {
   "primary": "#f5f5f0",
   "secondary": "#c9d6ff",
   "skin": "#f0e0d0",
   "hair": "#ffffff"
  },
  "weapon": "staff",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/05 The Voyage of the Dawn Treader/",
   "front": "art/characters/05 The Voyage of the Dawn Treader/Ramandu - front.png",
   "side": "art/characters/05 The Voyage of the Dawn Treader/Ramandu - side.png",
   "back": "art/characters/05 The Voyage of the Dawn Treader/Ramandu - back.png",
   "action": "art/characters/05 The Voyage of the Dawn Treader/Ramandu - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Starlight Touch",
    "desc": "Light pulse from his hands",
    "type": "melee"
   },
   "combo1": {
    "name": "Fire-Berry Glow",
    "desc": "Two light blasts",
    "type": "projectile"
   },
   "combo2": {
    "name": "Birds of Morning",
    "desc": "White birds swoop at foes",
    "type": "melee"
   },
   "power": {
    "name": "Rising Star",
    "desc": "Blinding star burst",
    "type": "aoe"
   },
   "flying": {
    "name": "Sky Glide",
    "desc": "Floats up, light rains down",
    "type": "leap"
   },
   "recover": {
    "name": "Morning Renewed",
    "desc": "Glows brighter and rises",
    "type": "recover"
   }
  }
 },
 {
  "id": "jill-pole",
  "name": "Jill Pole",
  "book": "The Silver Chair",
  "bookId": "sc",
  "bio": "Bold girl sent to find Prince Rilian by remembering Aslan's signs.",
  "starter": false,
  "body": "biped",
  "variant": "child",
  "scale": 0.8,
  "colors": {
   "primary": "#4a6a8a",
   "secondary": "#c9a25a",
   "skin": "#f1c9a5",
   "hair": "#6b3a1a"
  },
  "weapon": "none",
  "sex": "f",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/06 The Silver Chair/",
   "front": "art/characters/06 The Silver Chair/Jill Pole - front.png",
   "side": "art/characters/06 The Silver Chair/Jill Pole - side.png",
   "back": "art/characters/06 The Silver Chair/Jill Pole - back.png",
   "action": "art/characters/06 The Silver Chair/Jill Pole - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Quick Kick",
    "desc": "Snappy kick",
    "type": "melee"
   },
   "combo1": {
    "name": "School Escape",
    "desc": "Dodge, kick, punch",
    "type": "melee"
   },
   "combo2": {
    "name": "Snowball Fight",
    "desc": "Throws hard-packed snowballs",
    "type": "projectile"
   },
   "power": {
    "name": "Remember the Signs",
    "desc": "Glowing signs boost speed and hits",
    "type": "aoe"
   },
   "flying": {
    "name": "Cliff Leap",
    "desc": "High jump into a double kick",
    "type": "leap"
   },
   "recover": {
    "name": "Breath of Aslan",
    "desc": "Wind gust lifts her up",
    "type": "recover"
   }
  }
 },
 {
  "id": "king-of-harfang",
  "name": "King of Harfang",
  "book": "The Silver Chair",
  "bookId": "sc",
  "bio": "Jolly but sneaky king of the Gentle Giants of Harfang.",
  "starter": false,
  "body": "biped",
  "variant": "giant-crown",
  "scale": 1.85,
  "colors": {
   "primary": "#8a3a3a",
   "secondary": "#d4a64a",
   "skin": "#f1c9a5",
   "hair": "#5a3a1a"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/06 The Silver Chair/",
   "front": "art/characters/06 The Silver Chair/King of Harfang - front.png",
   "side": "art/characters/06 The Silver Chair/King of Harfang - side.png",
   "back": "art/characters/06 The Silver Chair/King of Harfang - back.png",
   "action": "art/characters/06 The Silver Chair/King of Harfang - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Royal Giant Swat",
    "desc": "Big hand swat",
    "type": "melee"
   },
   "combo1": {
    "name": "Feast Fists",
    "desc": "Two heavy fists",
    "type": "multi"
   },
   "combo2": {
    "name": "Table Flip",
    "desc": "Flips the banquet table at foes",
    "type": "melee"
   },
   "power": {
    "name": "Harfang Hunt",
    "desc": "Giant charge across the arena",
    "type": "dash"
   },
   "flying": {
    "name": "Throne Hop",
    "desc": "Hops, lands with a boom",
    "type": "leap"
   },
   "recover": {
    "name": "Royal Yawn",
    "desc": "Yawns and stands up huge",
    "type": "recover"
   }
  }
 },
 {
  "id": "puddleglum",
  "name": "Puddleglum",
  "book": "The Silver Chair",
  "bookId": "sc",
  "bio": "Gloomy but brave Marsh-wiggle with long arms and legs.",
  "starter": true,
  "body": "biped",
  "variant": "marshwiggle",
  "scale": 1.1,
  "colors": {
   "primary": "#5a6b3a",
   "secondary": "#3a4a2a",
   "skin": "#a6b07a",
   "hair": "#3a4a2a"
  },
  "weapon": "spear",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/06 The Silver Chair/",
   "front": "art/characters/06 The Silver Chair/Puddleglum - front.png",
   "side": "art/characters/06 The Silver Chair/Puddleglum - side.png",
   "back": "art/characters/06 The Silver Chair/Puddleglum - back.png",
   "action": "art/characters/06 The Silver Chair/Puddleglum - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Long Arm Jab",
    "desc": "Long-reach lanky punch",
    "type": "melee"
   },
   "combo1": {
    "name": "Frog Kick",
    "desc": "Long-leg double kick",
    "type": "multi"
   },
   "combo2": {
    "name": "Eel Spear",
    "desc": "Jabs with his fishing spear",
    "type": "melee"
   },
   "power": {
    "name": "Stamp the Fire",
    "desc": "Stomps flames, breaks spells nearby",
    "type": "aoe"
   },
   "flying": {
    "name": "Wiggle Leap",
    "desc": "Huge springy leap down",
    "type": "leap"
   },
   "recover": {
    "name": "Expect the Worst",
    "desc": "Gloomy sigh, sturdy rise",
    "type": "recover"
   }
  }
 },
 {
  "id": "prince-rilian",
  "name": "Prince Rilian",
  "book": "The Silver Chair",
  "bookId": "sc",
  "bio": "Lost prince of Narnia, once the enchanted Black Knight. Sword and shield.",
  "starter": false,
  "body": "biped",
  "variant": "",
  "scale": 1.02,
  "colors": {
   "primary": "#1a1a1a",
   "secondary": "#c0c0c0",
   "skin": "#f1c9a5",
   "hair": "#d0b070"
  },
  "weapon": "swordshield",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/06 The Silver Chair/",
   "front": "art/characters/06 The Silver Chair/Prince Rilian - front.png",
   "side": "art/characters/06 The Silver Chair/Prince Rilian - side.png",
   "back": "art/characters/06 The Silver Chair/Prince Rilian - back.png",
   "action": "art/characters/06 The Silver Chair/Prince Rilian - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Black Knight Strike",
    "desc": "Heavy sword cut",
    "type": "melee"
   },
   "combo1": {
    "name": "Chair Breaker",
    "desc": "Three smashing blows",
    "type": "multi"
   },
   "combo2": {
    "name": "Shield Charge",
    "desc": "Running shield bash",
    "type": "dash"
   },
   "power": {
    "name": "Spell Broken",
    "desc": "Burst of light, sword fury",
    "type": "aoe"
   },
   "flying": {
    "name": "Knight's Leap",
    "desc": "Jumps and slashes down",
    "type": "leap"
   },
   "recover": {
    "name": "True Prince",
    "desc": "Rises shining",
    "type": "recover"
   }
  }
 },
 {
  "id": "lady-of-the-green-kirtle",
  "name": "Lady of the Green Kirtle",
  "book": "The Silver Chair",
  "bookId": "sc",
  "bio": "Queen of Underland. Uses enchanting green powder and turns into a great green serpent.",
  "starter": false,
  "body": "biped",
  "variant": "crown",
  "scale": 1.05,
  "colors": {
   "primary": "#1e8a3a",
   "secondary": "#a0f0a0",
   "skin": "#f2e4d8",
   "hair": "#e0c060"
  },
  "weapon": "none",
  "sex": "f",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/06 The Silver Chair/",
   "front": "art/characters/06 The Silver Chair/Lady of the Green Kirtle - front.png",
   "side": "art/characters/06 The Silver Chair/Lady of the Green Kirtle - side.png",
   "back": "art/characters/06 The Silver Chair/Lady of the Green Kirtle - back.png",
   "action": "art/characters/06 The Silver Chair/Lady of the Green Kirtle - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Green Powder",
    "desc": "Tosses sleepy dust at foes",
    "type": "aoe"
   },
   "combo1": {
    "name": "Mandolin Thrum",
    "desc": "Strums that slow foes down",
    "type": "melee"
   },
   "combo2": {
    "name": "Serpent Lash",
    "desc": "Serpent tail whip",
    "type": "melee"
   },
   "power": {
    "name": "Serpent Form",
    "desc": "Becomes the huge green serpent, coils",
    "type": "melee"
   },
   "flying": {
    "name": "Striking Coil",
    "desc": "Lunging serpent strike",
    "type": "leap"
   },
   "recover": {
    "name": "Sweet Words",
    "desc": "Charm wave pushes foes back",
    "type": "recover"
   }
  }
 },
 {
  "id": "glimfeather",
  "name": "Glimfeather",
  "book": "The Silver Chair",
  "bookId": "sc",
  "bio": "Great white Talking Owl.",
  "starter": false,
  "body": "bird",
  "variant": "owl",
  "scale": 0.75,
  "colors": {
   "primary": "#f0f0ea",
   "secondary": "#c8b890",
   "skin": "#f0f0ea",
   "hair": "#e0a020"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/06 The Silver Chair/",
   "front": "art/characters/06 The Silver Chair/Glimfeather - front.png",
   "side": "art/characters/06 The Silver Chair/Glimfeather - side.png",
   "back": "art/characters/06 The Silver Chair/Glimfeather - back.png",
   "action": "art/characters/06 The Silver Chair/Glimfeather - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Talon Swipe",
    "desc": "Sharp claw scratch",
    "type": "melee"
   },
   "combo1": {
    "name": "Night Flight",
    "desc": "Swoops twice from the dark",
    "type": "aoe"
   },
   "combo2": {
    "name": "Wing Buffet",
    "desc": "Wing gust pushes back",
    "type": "aoe"
   },
   "power": {
    "name": "Parliament of Owls",
    "desc": "Owls dive across the arena",
    "type": "aoe"
   },
   "flying": {
    "name": "Silent Swoop",
    "desc": "Silent dive from above",
    "type": "leap"
   },
   "recover": {
    "name": "Feather Ruffle",
    "desc": "Flaps up quickly",
    "type": "recover"
   }
  }
 },
 {
  "id": "golg",
  "name": "Golg",
  "book": "The Silver Chair",
  "bookId": "sc",
  "bio": "Earthman from deep Bism, freed when the spell breaks.",
  "starter": false,
  "body": "biped",
  "variant": "gnome",
  "scale": 0.72,
  "colors": {
   "primary": "#7a4a2a",
   "secondary": "#d4a020",
   "skin": "#c89a7a",
   "hair": "#3a2a1a"
  },
  "weapon": "spear",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/06 The Silver Chair/",
   "front": "art/characters/06 The Silver Chair/Golg - front.png",
   "side": "art/characters/06 The Silver Chair/Golg - side.png",
   "back": "art/characters/06 The Silver Chair/Golg - back.png",
   "action": "art/characters/06 The Silver Chair/Golg - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Earthman Spear",
    "desc": "Short spear jab",
    "type": "melee"
   },
   "combo1": {
    "name": "Tunnel Rush",
    "desc": "Dash, poke, poke",
    "type": "dash"
   },
   "combo2": {
    "name": "Bism Gems",
    "desc": "Throws glowing gems",
    "type": "projectile"
   },
   "power": {
    "name": "Back to Bism",
    "desc": "Fiery chasm burst",
    "type": "aoe"
   },
   "flying": {
    "name": "Burrow Pop",
    "desc": "Pops up from underground",
    "type": "leap"
   },
   "recover": {
    "name": "Happy Hop",
    "desc": "Hops up dancing",
    "type": "recover"
   }
  }
 },
 {
  "id": "warden-of-the-marches-of-underland",
  "name": "Warden of the Marches of Underland",
  "book": "The Silver Chair",
  "bookId": "sc",
  "bio": "Gloomy Earthman captain who meets the travelers underground.",
  "starter": false,
  "body": "biped",
  "variant": "gnome",
  "scale": 0.78,
  "colors": {
   "primary": "#3a3a4a",
   "secondary": "#8a8a6a",
   "skin": "#b8a090",
   "hair": "#2a2a2a"
  },
  "weapon": "spear",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/06 The Silver Chair/",
   "front": "art/characters/06 The Silver Chair/Warden of the Marches of Underland - front.png",
   "side": "art/characters/06 The Silver Chair/Warden of the Marches of Underland - side.png",
   "back": "art/characters/06 The Silver Chair/Warden of the Marches of Underland - back.png",
   "action": "art/characters/06 The Silver Chair/Warden of the Marches of Underland - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Warden's Spear",
    "desc": "Long spear thrust",
    "type": "melee"
   },
   "combo1": {
    "name": "Sad March",
    "desc": "Slow, heavy double thrust",
    "type": "multi"
   },
   "combo2": {
    "name": "Lantern Swing",
    "desc": "Lantern swing dazzles foes",
    "type": "melee"
   },
   "power": {
    "name": "Hundred Earthmen",
    "desc": "Earthmen march across the arena",
    "type": "aoe"
   },
   "flying": {
    "name": "Cave Drop",
    "desc": "Drops from the cave ceiling",
    "type": "leap"
   },
   "recover": {
    "name": "Gloomy Stand",
    "desc": "Sighs and stands back up",
    "type": "recover"
   }
  }
 },
 {
  "id": "queen-of-harfang",
  "name": "Queen of Harfang",
  "book": "The Silver Chair",
  "bookId": "sc",
  "bio": "Giant queen of Harfang who welcomes the travelers for the Autumn Feast.",
  "starter": false,
  "body": "biped",
  "variant": "giant-crown",
  "scale": 1.8,
  "colors": {
   "primary": "#8a3a7a",
   "secondary": "#d4a64a",
   "skin": "#f1c9a5",
   "hair": "#7a4a2a"
  },
  "weapon": "fan",
  "sex": "f",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/06 The Silver Chair/",
   "front": "art/characters/06 The Silver Chair/Queen of Harfang - front.png",
   "side": "art/characters/06 The Silver Chair/Queen of Harfang - side.png",
   "back": "art/characters/06 The Silver Chair/Queen of Harfang - back.png",
   "action": "art/characters/06 The Silver Chair/Queen of Harfang - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Giant Slap",
    "desc": "Wide hand slap",
    "type": "melee"
   },
   "combo1": {
    "name": "Banquet Toss",
    "desc": "Throws dishes at foes",
    "type": "projectile"
   },
   "combo2": {
    "name": "Fan Flap",
    "desc": "Big fan gust pushes foes",
    "type": "aoe"
   },
   "power": {
    "name": "Autumn Feast",
    "desc": "Food storm rains on the arena",
    "type": "aoe"
   },
   "flying": {
    "name": "Royal Stomp",
    "desc": "Hops, heavy landing",
    "type": "leap"
   },
   "recover": {
    "name": "Giggle Rise",
    "desc": "Giggles and stands",
    "type": "recover"
   }
  }
 },
 {
  "id": "ettinsmoor-giant",
  "name": "Ettinsmoor Giant",
  "book": "The Silver Chair",
  "bookId": "sc",
  "bio": "One of the dim, rock-throwing giants of the moors.",
  "starter": false,
  "body": "biped",
  "variant": "giant",
  "scale": 1.9,
  "colors": {
   "primary": "#6a6a5a",
   "secondary": "#4a4a3a",
   "skin": "#b8a890",
   "hair": "#3a3a2a"
  },
  "weapon": "club",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/06 The Silver Chair/",
   "front": "art/characters/06 The Silver Chair/Ettinsmoor Giant - front.png",
   "side": "art/characters/06 The Silver Chair/Ettinsmoor Giant - side.png",
   "back": "art/characters/06 The Silver Chair/Ettinsmoor Giant - back.png",
   "action": "art/characters/06 The Silver Chair/Ettinsmoor Giant - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Boulder Toss",
    "desc": "Throws a big rock",
    "type": "projectile"
   },
   "combo1": {
    "name": "Cock-Shy",
    "desc": "Two quick rock throws",
    "type": "projectile"
   },
   "combo2": {
    "name": "Hammer Fist",
    "desc": "Overhead fist smash",
    "type": "melee"
   },
   "power": {
    "name": "Rock Rain",
    "desc": "Boulders fall across the arena",
    "type": "aoe"
   },
   "flying": {
    "name": "Moor Stomp",
    "desc": "Huge jump, ground cracks",
    "type": "leap"
   },
   "recover": {
    "name": "Grumpy Giant",
    "desc": "Grumbles and stands",
    "type": "recover"
   }
  }
 },
 {
  "id": "king-tirian",
  "name": "King Tirian",
  "book": "The Last Battle",
  "bookId": "lb",
  "bio": "The last King of Narnia. Sword fighter.",
  "starter": false,
  "body": "biped",
  "variant": "crown",
  "scale": 1.02,
  "colors": {
   "primary": "#2a4a8a",
   "secondary": "#d4a64a",
   "skin": "#f1c9a5",
   "hair": "#c9a25a"
  },
  "weapon": "sword",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/07 The Last Battle/",
   "front": "art/characters/07 The Last Battle/King Tirian - front.png",
   "side": "art/characters/07 The Last Battle/King Tirian - side.png",
   "back": "art/characters/07 The Last Battle/King Tirian - back.png",
   "action": "art/characters/07 The Last Battle/King Tirian - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Last King's Slash",
    "desc": "Strong sword cut",
    "type": "melee"
   },
   "combo1": {
    "name": "Stable Door Defense",
    "desc": "Block, slash, shove",
    "type": "aoe"
   },
   "combo2": {
    "name": "Tirian's Charge",
    "desc": "Running double slash",
    "type": "dash"
   },
   "power": {
    "name": "Narnia Calls",
    "desc": "Light of the old kings stuns foes",
    "type": "aoe"
   },
   "flying": {
    "name": "Rope Break Leap",
    "desc": "Breaks free, jumps, slashes",
    "type": "leap"
   },
   "recover": {
    "name": "Last Stand",
    "desc": "Rises with a fierce guard",
    "type": "recover"
   }
  }
 },
 {
  "id": "jewel",
  "name": "Jewel",
  "book": "The Last Battle",
  "bookId": "lb",
  "bio": "The Unicorn, Tirian's best friend.",
  "starter": false,
  "body": "quadruped",
  "variant": "unicorn",
  "scale": 1,
  "colors": {
   "primary": "#f8f8ff",
   "secondary": "#e0c060",
   "skin": "#f8f8ff",
   "hair": "#f0e8d0"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/07 The Last Battle/",
   "front": "art/characters/07 The Last Battle/Jewel - front.png",
   "side": "art/characters/07 The Last Battle/Jewel - side.png",
   "back": "art/characters/07 The Last Battle/Jewel - back.png",
   "action": "art/characters/07 The Last Battle/Jewel - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Horn Thrust",
    "desc": "Straight horn stab",
    "type": "melee"
   },
   "combo1": {
    "name": "Unicorn Charge",
    "desc": "Gallop, then horn toss",
    "type": "dash"
   },
   "combo2": {
    "name": "Hoof Storm",
    "desc": "Rears, many hoof stomps",
    "type": "spin"
   },
   "power": {
    "name": "Shining Horn",
    "desc": "Glowing horn charge across the arena",
    "type": "dash"
   },
   "flying": {
    "name": "Unicorn Leap",
    "desc": "Leaps, horn-first dive",
    "type": "leap"
   },
   "recover": {
    "name": "Noble Rise",
    "desc": "Shakes mane, springs up",
    "type": "recover"
   }
  }
 },
 {
  "id": "puzzle",
  "name": "Puzzle",
  "book": "The Last Battle",
  "bookId": "lb",
  "bio": "The Donkey Shift tricked into wearing a lion skin, who joins Tirian's side.",
  "starter": false,
  "body": "quadruped",
  "variant": "donkey",
  "scale": 0.85,
  "colors": {
   "primary": "#8a8478",
   "secondary": "#5a5448",
   "skin": "#8a8478",
   "hair": "#3a3428"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/07 The Last Battle/",
   "front": "art/characters/07 The Last Battle/Puzzle - front.png",
   "side": "art/characters/07 The Last Battle/Puzzle - side.png",
   "back": "art/characters/07 The Last Battle/Puzzle - back.png",
   "action": "art/characters/07 The Last Battle/Puzzle - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Donkey Kick",
    "desc": "Strong back kick",
    "type": "melee"
   },
   "combo1": {
    "name": "Bray Blast",
    "desc": "Hee-haw pushes foes back",
    "type": "aoe"
   },
   "combo2": {
    "name": "Lion Skin Shrug",
    "desc": "Shakes off the skin, stuns foes",
    "type": "aoe"
   },
   "power": {
    "name": "Puzzle's Stampede",
    "desc": "Charging gallop through foes",
    "type": "dash"
   },
   "flying": {
    "name": "Hoof Hop",
    "desc": "Jumps, double hoof stomp",
    "type": "leap"
   },
   "recover": {
    "name": "Sorry, Sorry",
    "desc": "Gets up looking sheepish",
    "type": "recover"
   }
  }
 },
 {
  "id": "griffle",
  "name": "Griffle",
  "book": "The Last Battle",
  "bookId": "lb",
  "bio": "Black Dwarf leader who says the Dwarfs are for the Dwarfs. Bow and axe.",
  "starter": false,
  "body": "biped",
  "variant": "dwarf",
  "scale": 0.66,
  "colors": {
   "primary": "#2b2b2b",
   "secondary": "#6b4a2a",
   "skin": "#f1c9a5",
   "hair": "#111111"
  },
  "weapon": "bow",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/07 The Last Battle/",
   "front": "art/characters/07 The Last Battle/Griffle - front.png",
   "side": "art/characters/07 The Last Battle/Griffle - side.png",
   "back": "art/characters/07 The Last Battle/Griffle - back.png",
   "action": "art/characters/07 The Last Battle/Griffle - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Dwarf Arrow",
    "desc": "Fast short-bow shot",
    "type": "projectile"
   },
   "combo1": {
    "name": "Dwarf Volley",
    "desc": "Two quick arrows",
    "type": "projectile"
   },
   "combo2": {
    "name": "Axe Chop",
    "desc": "Short axe swing",
    "type": "melee"
   },
   "power": {
    "name": "Dwarfs for the Dwarfs",
    "desc": "Arrows fly at everyone",
    "type": "aoe"
   },
   "flying": {
    "name": "Dwarf Leap",
    "desc": "Hop into an axe chop",
    "type": "leap"
   },
   "recover": {
    "name": "Stubborn Stand",
    "desc": "Folds his arms, stands up",
    "type": "recover"
   }
  }
 },
 {
  "id": "poggin",
  "name": "Poggin",
  "book": "The Last Battle",
  "bookId": "lb",
  "bio": "The one Dwarf who stays loyal to Aslan.",
  "starter": false,
  "body": "biped",
  "variant": "dwarf",
  "scale": 0.68,
  "colors": {
   "primary": "#6b3a2a",
   "secondary": "#c0a060",
   "skin": "#f1c9a5",
   "hair": "#8a5a2a"
  },
  "weapon": "swordshield",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/07 The Last Battle/",
   "front": "art/characters/07 The Last Battle/Poggin - front.png",
   "side": "art/characters/07 The Last Battle/Poggin - side.png",
   "back": "art/characters/07 The Last Battle/Poggin - back.png",
   "action": "art/characters/07 The Last Battle/Poggin - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Dwarf Strike",
    "desc": "Short sword chop",
    "type": "melee"
   },
   "combo1": {
    "name": "Loyal Blows",
    "desc": "Three quick chops",
    "type": "multi"
   },
   "combo2": {
    "name": "Shield Butt",
    "desc": "Shield bash, then slice",
    "type": "aoe"
   },
   "power": {
    "name": "For Aslan!",
    "desc": "Furious charge through foes",
    "type": "dash"
   },
   "flying": {
    "name": "Dwarf Jump",
    "desc": "Hops, lands with a chop",
    "type": "leap"
   },
   "recover": {
    "name": "Sturdy Dwarf",
    "desc": "Bounces up armored",
    "type": "recover"
   }
  }
 },
 {
  "id": "farsight",
  "name": "Farsight",
  "book": "The Last Battle",
  "bookId": "lb",
  "bio": "The Eagle who brings news of the fall of Cair Paravel.",
  "starter": false,
  "body": "bird",
  "variant": "eagle",
  "scale": 0.8,
  "colors": {
   "primary": "#6b4a2a",
   "secondary": "#f0f0f0",
   "skin": "#6b4a2a",
   "hair": "#e0c020"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/07 The Last Battle/",
   "front": "art/characters/07 The Last Battle/Farsight - front.png",
   "side": "art/characters/07 The Last Battle/Farsight - side.png",
   "back": "art/characters/07 The Last Battle/Farsight - back.png",
   "action": "art/characters/07 The Last Battle/Farsight - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Talon Strike",
    "desc": "Talon claw slash",
    "type": "melee"
   },
   "combo1": {
    "name": "Eagle Dive",
    "desc": "Two diving strikes",
    "type": "multi"
   },
   "combo2": {
    "name": "Wing Slam",
    "desc": "Wing slap knocks back",
    "type": "melee"
   },
   "power": {
    "name": "Eye in the Sky",
    "desc": "Spots foes, lightning dives",
    "type": "aoe"
   },
   "flying": {
    "name": "High Soar",
    "desc": "Soars, then plunges talons first",
    "type": "leap"
   },
   "recover": {
    "name": "Lift Off",
    "desc": "Flaps up into the air",
    "type": "recover"
   }
  }
 },
 {
  "id": "roonwit",
  "name": "Roonwit",
  "book": "The Last Battle",
  "bookId": "lb",
  "bio": "Wise Centaur who reads the stars and warns the King.",
  "starter": false,
  "body": "centaur",
  "variant": "",
  "scale": 1.15,
  "colors": {
   "primary": "#4a3a2a",
   "secondary": "#2a4a6a",
   "skin": "#c8946a",
   "hair": "#3a2a1a"
  },
  "weapon": "spear",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/07 The Last Battle/",
   "front": "art/characters/07 The Last Battle/Roonwit - front.png",
   "side": "art/characters/07 The Last Battle/Roonwit - side.png",
   "back": "art/characters/07 The Last Battle/Roonwit - back.png",
   "action": "art/characters/07 The Last Battle/Roonwit - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Spear Thrust",
    "desc": "Long spear jab",
    "type": "melee"
   },
   "combo1": {
    "name": "Hoof Stamp",
    "desc": "Rears and stamps foes",
    "type": "melee"
   },
   "combo2": {
    "name": "Starwatcher",
    "desc": "Reads the stars, perfect counter",
    "type": "aoe"
   },
   "power": {
    "name": "Message to the King",
    "desc": "Gallop rush through all foes",
    "type": "dash"
   },
   "flying": {
    "name": "Bounding Gallop",
    "desc": "Leaping hoof strike",
    "type": "leap"
   },
   "recover": {
    "name": "Proud Stand",
    "desc": "Rises tall",
    "type": "recover"
   }
  }
 },
 {
  "id": "emeth",
  "name": "Emeth",
  "book": "The Last Battle",
  "bookId": "lb",
  "bio": "Honorable young Calormene officer. Scimitar.",
  "starter": false,
  "body": "biped",
  "variant": "turban",
  "scale": 1,
  "colors": {
   "primary": "#d4c8a8",
   "secondary": "#2a6a8a",
   "skin": "#9a6a44",
   "hair": "#111111"
  },
  "weapon": "scimitar",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/07 The Last Battle/",
   "front": "art/characters/07 The Last Battle/Emeth - front.png",
   "side": "art/characters/07 The Last Battle/Emeth - side.png",
   "back": "art/characters/07 The Last Battle/Emeth - back.png",
   "action": "art/characters/07 The Last Battle/Emeth - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Scimitar Arc",
    "desc": "Graceful curved cut",
    "type": "melee"
   },
   "combo1": {
    "name": "Honorable Duel",
    "desc": "Three precise slashes",
    "type": "multi"
   },
   "combo2": {
    "name": "Truth Seeker",
    "desc": "Block, counter thrust",
    "type": "aoe"
   },
   "power": {
    "name": "True Heart",
    "desc": "Golden glow, power slashes",
    "type": "aoe"
   },
   "flying": {
    "name": "Desert Leap",
    "desc": "Jumps, slashes down",
    "type": "leap"
   },
   "recover": {
    "name": "Faithful Rise",
    "desc": "Kneels, then rises",
    "type": "recover"
   }
  }
 },
 {
  "id": "rishda-tarkaan",
  "name": "Rishda Tarkaan",
  "book": "The Last Battle",
  "bookId": "lb",
  "bio": "Calormene captain who leads the invasion. Scimitar.",
  "starter": false,
  "body": "biped",
  "variant": "turban-beard",
  "scale": 1.05,
  "colors": {
   "primary": "#7a1a1a",
   "secondary": "#d4a020",
   "skin": "#9a6a44",
   "hair": "#111111"
  },
  "weapon": "scimitar",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/07 The Last Battle/",
   "front": "art/characters/07 The Last Battle/Rishda Tarkaan - front.png",
   "side": "art/characters/07 The Last Battle/Rishda Tarkaan - side.png",
   "back": "art/characters/07 The Last Battle/Rishda Tarkaan - back.png",
   "action": "art/characters/07 The Last Battle/Rishda Tarkaan - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Tarkaan Slash",
    "desc": "Hard scimitar cut",
    "type": "melee"
   },
   "combo1": {
    "name": "Calormene Assault",
    "desc": "Three heavy swings",
    "type": "multi"
   },
   "combo2": {
    "name": "Stable Trick",
    "desc": "Shoves a foe toward the stable",
    "type": "melee"
   },
   "power": {
    "name": "Calormene Legion",
    "desc": "Soldiers rush the arena",
    "type": "dash"
   },
   "flying": {
    "name": "Crushing Leap",
    "desc": "Jump, overhead chop",
    "type": "leap"
   },
   "recover": {
    "name": "Cruel Pride",
    "desc": "Rises sneering",
    "type": "recover"
   }
  }
 },
 {
  "id": "shift",
  "name": "Shift",
  "book": "The Last Battle",
  "bookId": "lb",
  "bio": "The scheming Ape who dresses Puzzle in a lion skin.",
  "starter": false,
  "body": "biped",
  "variant": "ape",
  "scale": 0.85,
  "colors": {
   "primary": "#5a4a3a",
   "secondary": "#8a7a6a",
   "skin": "#5a4a3a",
   "hair": "#3a2a1a"
  },
  "weapon": "none",
  "sex": "m",
  "art": {
   "source": "/workspace/Narnia Game Art/Characters/07 The Last Battle/",
   "front": "art/characters/07 The Last Battle/Shift - front.png",
   "side": "art/characters/07 The Last Battle/Shift - side.png",
   "back": "art/characters/07 The Last Battle/Shift - back.png",
   "action": "art/characters/07 The Last Battle/Shift - action.png",
   "model": null,
   "billboard": false
  },
  "moves": {
   "main": {
    "name": "Ape Slap",
    "desc": "Quick hairy slap",
    "type": "melee"
   },
   "combo1": {
    "name": "Nutcracker",
    "desc": "Cracks nuts, flings the shells",
    "type": "projectile"
   },
   "combo2": {
    "name": "Lion Skin Trick",
    "desc": "Throws the lion skin over a foe",
    "type": "projectile"
   },
   "power": {
    "name": "Tashlan Trick",
    "desc": "Fake roar in the dark scares foes",
    "type": "aoe"
   },
   "flying": {
    "name": "Tree Swing",
    "desc": "Swings from a branch, kicks",
    "type": "leap"
   },
   "recover": {
    "name": "Scamper",
    "desc": "Scurries off, then stands",
    "type": "recover"
   }
  }
 }
];
