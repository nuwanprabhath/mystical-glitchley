import type { PetStage, PetAction, PetMood } from "../state/types.ts";

export interface ArtFrame {
  lines: string[];
  width: number;
}

// ── Egg Stage ──────────────────────────────────────────
const EGG_IDLE: ArtFrame[] = [
  {
    lines: [
      "    ___   ",
      "   /   \\  ",
      "  | ~~~ | ",
      "  | ~~~ | ",
      "   \\___/  ",
    ],
    width: 10,
  },
  {
    lines: [
      "    ___   ",
      "   / ~ \\  ",
      "  | ~~~ | ",
      "  | ~ ~ | ",
      "   \\___/  ",
    ],
    width: 10,
  },
];

const EGG_HATCHING: ArtFrame[] = [
  {
    lines: [
      "    _*_   ",
      "   / ~ \\  ",
      "  | *~* | ",
      "  | ~*~ | ",
      "   \\___/  ",
    ],
    width: 10,
  },
  {
    lines: [
      "   \\_ _/  ",
      "   / * \\  ",
      "  | ^.^ | ",
      "  | ~*~ | ",
      "   \\___/  ",
    ],
    width: 10,
  },
  {
    lines: [
      "  \\\\_ _// ",
      "    \\ /   ",
      "   (^.^)  ",
      "   /| |\\  ",
      "   ~~~~   ",
    ],
    width: 10,
  },
];

// ── Baby Stage ─────────────────────────────────────────
const BABY_IDLE: ArtFrame[] = [
  {
    lines: [
      "   /\\_/\\  ",
      "  ( o.o ) ",
      "   > ^ <  ",
      "  /|   |\\ ",
      "  ~     ~ ",
    ],
    width: 10,
  },
  {
    lines: [
      "   /\\_/\\  ",
      "  ( o.o ) ",
      "   > ^ <  ",
      "  /|   |\\ ",
      " ~       ~",
    ],
    width: 10,
  },
];

const BABY_HAPPY: ArtFrame[] = [
  {
    lines: [
      "   /\\_/\\  ",
      "  ( ^.^ ) ",
      "   > ~ <  ",
      "  \\|   |/ ",
      "   ~   ~  ",
    ],
    width: 10,
  },
  {
    lines: [
      "  */\\_/\\* ",
      "  ( ^.^ ) ",
      "   > ~ <  ",
      "  /|   |\\ ",
      "   ~   ~  ",
    ],
    width: 10,
  },
];

const BABY_EATING: ArtFrame[] = [
  {
    lines: [
      "   /\\_/\\  ",
      "  ( o.o ) ",
      "   > 0 <  ",
      "  /| ~ |\\ ",
      "   ~   ~  ",
    ],
    width: 10,
  },
  {
    lines: [
      "   /\\_/\\  ",
      "  ( -.- ) ",
      "   >nom<  ",
      "  /| ~ |\\ ",
      "   ~   ~  ",
    ],
    width: 10,
  },
];

const BABY_SLEEPING: ArtFrame[] = [
  {
    lines: [
      "   /\\_/\\  ",
      "  ( -.- ) ",
      "   > _ < z",
      "  /|   |\\ ",
      "   ~   ~  ",
    ],
    width: 10,
  },
  {
    lines: [
      "   /\\_/\\ Z",
      "  ( -.- ) ",
      "   > _ <  ",
      "  /|   |\\ ",
      "   ~   ~  ",
    ],
    width: 10,
  },
];

const BABY_SAD: ArtFrame[] = [
  {
    lines: [
      "   /\\_/\\  ",
      "  ( ;.; ) ",
      "   > _ <  ",
      "  /|   |\\ ",
      "   ~   ~  ",
    ],
    width: 10,
  },
];

// ── Teen Stage ─────────────────────────────────────────
const TEEN_IDLE: ArtFrame[] = [
  {
    lines: [
      "   /\\_/\\    ",
      "  ( o.o )   ",
      "  />   <\\   ",
      " / |   | \\  ",
      " \\_|   |_/  ",
      "   |_ _|    ",
    ],
    width: 12,
  },
  {
    lines: [
      "   /\\_/\\    ",
      "  ( o.o )   ",
      "  />   <\\   ",
      " / |   | \\  ",
      " \\_|   |_/  ",
      "  |_   _|   ",
    ],
    width: 12,
  },
];

const TEEN_HAPPY: ArtFrame[] = [
  {
    lines: [
      "  **/\\_/\\** ",
      "  ( ^o^ )   ",
      "  \\> ~ </   ",
      "   |   |    ",
      "   |   |    ",
      "   ~   ~    ",
    ],
    width: 12,
  },
  {
    lines: [
      "   /\\_/\\    ",
      " *( ^o^ )*  ",
      "  /> ~ <\\   ",
      "   |   |    ",
      "   |   |    ",
      "   ~   ~    ",
    ],
    width: 12,
  },
];

const TEEN_CODING: ArtFrame[] = [
  {
    lines: [
      "   /\\_/\\    ",
      "  ( o.o )   ",
      "  />   <\\   ",
      " /||___|\\\\  ",
      " \\_|>_ |_/  ",
      "   |_ _|    ",
    ],
    width: 12,
  },
  {
    lines: [
      "   /\\_/\\    ",
      "  ( -.- )   ",
      "  />   <\\   ",
      " /||___|\\\\  ",
      " \\_| _<|_/  ",
      "   |_ _|    ",
    ],
    width: 12,
  },
];

const TEEN_SLEEPING: ArtFrame[] = [
  {
    lines: [
      "   /\\_/\\  z ",
      "  ( -.- )   ",
      "  />   <\\   ",
      "   |   |    ",
      "   |   |    ",
      "   ~   ~    ",
    ],
    width: 12,
  },
  {
    lines: [
      "   /\\_/\\    ",
      "  ( -.- ) Z ",
      "  />   <\\   ",
      "   |   |    ",
      "   |   |    ",
      "   ~   ~    ",
    ],
    width: 12,
  },
];

const TEEN_SAD: ArtFrame[] = [
  {
    lines: [
      "   /\\_/\\    ",
      "  ( T.T )   ",
      "  />   <\\   ",
      "   |   |    ",
      "   |   |    ",
      "   ~   ~    ",
    ],
    width: 12,
  },
];

// ── Adult Stage ────────────────────────────────────────
const ADULT_IDLE: ArtFrame[] = [
  {
    lines: [
      "    /\\_/\\     ",
      "   ( o.o )    ",
      "   /> ~ <\\    ",
      "  / |   | \\   ",
      " /__|   |__\\  ",
      "    |   |     ",
      "    |___|     ",
    ],
    width: 14,
  },
  {
    lines: [
      "    /\\_/\\     ",
      "   ( o.o )    ",
      "   /> ~ <\\    ",
      "  / |   | \\   ",
      " /__|   |__\\  ",
      "    |   |     ",
      "   _|   |_    ",
    ],
    width: 14,
  },
];

const ADULT_HAPPY: ArtFrame[] = [
  {
    lines: [
      "  *  /\\_/\\  * ",
      "   ( ^w^ )    ",
      " * /> ~ <\\ *  ",
      "  / |   | \\   ",
      " /__|   |__\\  ",
      "    |   |     ",
      "    |___|     ",
    ],
    width: 14,
  },
  {
    lines: [
      " *   /\\_/\\   *",
      "   ( ^w^ )    ",
      "  */>   <\\*   ",
      "  / |   | \\   ",
      " /__|   |__\\  ",
      "    |   |     ",
      "    |___|     ",
    ],
    width: 14,
  },
];

const ADULT_CODING: ArtFrame[] = [
  {
    lines: [
      "    /\\_/\\     ",
      "   ( -.- )    ",
      "   /> ~ <\\    ",
      "  /||___|\\\\   ",
      " /_| >_ |_\\   ",
      "    |   |     ",
      "    |___|     ",
    ],
    width: 14,
  },
  {
    lines: [
      "    /\\_/\\     ",
      "   ( o.o )    ",
      "   /> ~ <\\    ",
      "  /||___|\\\\   ",
      " /_| _< |_\\   ",
      "    |   |     ",
      "    |___|     ",
    ],
    width: 14,
  },
];

const ADULT_CELEBRATING: ArtFrame[] = [
  {
    lines: [
      " \\o /\\_/\\ o/  ",
      "   ( >w< )    ",
      "   /> ~ <\\    ",
      "  / |   | \\   ",
      " /__|   |__\\  ",
      "    |   |     ",
      "   _/ \\_      ",
    ],
    width: 14,
  },
  {
    lines: [
      "  o /\\_/\\ o   ",
      " / ( >w< ) \\  ",
      "   /> ~ <\\    ",
      "  / |   | \\   ",
      " /__|   |__\\  ",
      "    |   |     ",
      "    |___|     ",
    ],
    width: 14,
  },
];

const ADULT_SLEEPING: ArtFrame[] = [
  {
    lines: [
      "    /\\_/\\   z ",
      "   ( -.- )    ",
      "   /> _ <\\    ",
      "   ||   ||    ",
      "   ||   ||    ",
      "    |   |     ",
      "    ~   ~     ",
    ],
    width: 14,
  },
  {
    lines: [
      "    /\\_/\\     ",
      "   ( -.- ) Z  ",
      "   /> _ <\\    ",
      "   ||   ||    ",
      "   ||   ||    ",
      "    |   |     ",
      "    ~   ~     ",
    ],
    width: 14,
  },
];

const ADULT_SAD: ArtFrame[] = [
  {
    lines: [
      "    /\\_/\\     ",
      "   ( ;_; )    ",
      "   /> _ <\\    ",
      "   ||   ||    ",
      "   ||   ||    ",
      "    |   |     ",
      "    ~   ~     ",
    ],
    width: 14,
  },
];

// ── Elder Stage ────────────────────────────────────────
const ELDER_IDLE: ArtFrame[] = [
  {
    lines: [
      "   ~~/\\_/\\~~  ",
      "   ( o.o )    ",
      "  ~~> ~ <~~   ",
      "  /  |_|  \\   ",
      " / / | | \\ \\  ",
      " \\_\\_|_|_/_/  ",
      "    /   \\     ",
      "   ~     ~    ",
    ],
    width: 14,
  },
  {
    lines: [
      "  ~~/\\_/\\~~   ",
      "   ( o.o )    ",
      " ~~>   <~~    ",
      "  /  |_|  \\   ",
      " / / | | \\ \\  ",
      " \\_\\_|_|_/_/  ",
      "    /   \\     ",
      "  ~       ~   ",
    ],
    width: 14,
  },
];

// ── Mythical Stage ─────────────────────────────────────
const MYTHICAL_IDLE: ArtFrame[] = [
  {
    lines: [
      "  .  *  .  *  ",
      " * /\\_/\\  .   ",
      "  ( @.@ ) *   ",
      " */> ~ <\\  .  ",
      " / \\|||/ \\    ",
      "/__\\|||/__\\   ",
      " * \\|_|/  *   ",
      "  . /|\\ .     ",
      " * / | \\ *    ",
      "  ~  ~  ~     ",
    ],
    width: 14,
  },
  {
    lines: [
      " .   *   .    ",
      "  * /\\_/\\ *   ",
      "   ( @.@ )    ",
      "  */> ~ <\\ .  ",
      " / \\|||/ \\    ",
      "/__\\|||/__\\   ",
      "  *\\|_|/ .    ",
      "   ./|\\.  *   ",
      "  * | | *     ",
      "   ~   ~      ",
    ],
    width: 14,
  },
];

const MYTHICAL_CELEBRATING: ArtFrame[] = [
  {
    lines: [
      " .*  *  *  *. ",
      " * /\\_/\\  * * ",
      "  ( >@< )  *  ",
      " */> ~ <\\ *.  ",
      " / \\|||/ \\    ",
      "/__\\|||/__\\   ",
      " * \\|_|/ .*   ",
      " .* /|\\ *.    ",
      "  ~/ | \\~     ",
      " ~   ~   ~    ",
    ],
    width: 14,
  },
  {
    lines: [
      " .* .* .* .*  ",
      "  */\\_/\\*  .  ",
      "  ( >@< )  *  ",
      "  /> ~ <\\  .  ",
      " / \\|||/ \\    ",
      "/__\\|||/__\\   ",
      "  .\\|_|/*.    ",
      "  * /|\\ *     ",
      "  ~ | | ~     ",
      "   ~   ~      ",
    ],
    width: 14,
  },
];

// ── Dead ───────────────────────────────────────────────
const DEAD: ArtFrame[] = [
  {
    lines: [
      "    /\\_/\\     ",
      "   ( x.x )    ",
      "   /> _ <\\    ",
      "   ||   ||    ",
      "  _||   ||_   ",
      " /_________\\  ",
      " |  R.I.P  |  ",
      " |_________|  ",
    ],
    width: 14,
  },
];

// ── Frame Lookup ───────────────────────────────────────

type FrameKey = `${PetStage}_${PetAction | PetMood}`;

const FRAME_MAP: Partial<Record<FrameKey, ArtFrame[]>> = {
  // Egg
  egg_idle: EGG_IDLE,
  egg_hatching: EGG_HATCHING,

  // Baby
  baby_idle: BABY_IDLE,
  baby_happy: BABY_HAPPY,
  baby_ecstatic: BABY_HAPPY,
  baby_eating: BABY_EATING,
  baby_sleeping: BABY_SLEEPING,
  baby_sad: BABY_SAD,
  baby_hungry: BABY_SAD,
  baby_tired: BABY_SLEEPING,

  // Teen
  teen_idle: TEEN_IDLE,
  teen_happy: TEEN_HAPPY,
  teen_ecstatic: TEEN_HAPPY,
  teen_coding: TEEN_CODING,
  teen_sleeping: TEEN_SLEEPING,
  teen_sad: TEEN_SAD,
  teen_hungry: TEEN_SAD,
  teen_tired: TEEN_SLEEPING,

  // Adult
  adult_idle: ADULT_IDLE,
  adult_happy: ADULT_HAPPY,
  adult_ecstatic: ADULT_HAPPY,
  adult_coding: ADULT_CODING,
  adult_celebrating: ADULT_CELEBRATING,
  adult_sleeping: ADULT_SLEEPING,
  adult_sad: ADULT_SAD,
  adult_hungry: ADULT_SAD,
  adult_tired: ADULT_SLEEPING,
  adult_eating: BABY_EATING,

  // Elder
  elder_idle: ELDER_IDLE,
  elder_happy: ELDER_IDLE,
  elder_ecstatic: ELDER_IDLE,
  elder_sleeping: ADULT_SLEEPING,
  elder_sad: ADULT_SAD,

  // Mythical
  mythical_idle: MYTHICAL_IDLE,
  mythical_happy: MYTHICAL_IDLE,
  mythical_ecstatic: MYTHICAL_CELEBRATING,
  mythical_celebrating: MYTHICAL_CELEBRATING,
  mythical_sleeping: ADULT_SLEEPING,
  mythical_sad: ADULT_SAD,
};

export function getFrames(stage: PetStage, actionOrMood: PetAction | PetMood): ArtFrame[] {
  if (actionOrMood === "dead") return DEAD;
  const key = `${stage}_${actionOrMood}` as FrameKey;
  return FRAME_MAP[key] ?? FRAME_MAP[`${stage}_idle`] ?? BABY_IDLE;
}

export function getFrame(stage: PetStage, actionOrMood: PetAction | PetMood, tick: number): ArtFrame {
  const frames = getFrames(stage, actionOrMood);
  return frames[tick % frames.length]!;
}
