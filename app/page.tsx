'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Fish = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  accent: string;
  kind: 'tang' | 'clown' | 'butterfly' | 'puffer' | 'ray' | 'jelly' | 'angelfish' | 'eel' | 'seahorse' | 'shark' | 'angler' | 'koi' | 'urchin' | 'otter' | 'penguin';
  phase: number;
  temperament: 'shy' | 'curious' | 'calm' | 'playful' | 'sleepy';
  name: string;
  happy: number;
  biteCooldown: number;
  diveClock: number;
  homeY: number;
  turnTimer: number;
  targetVx: number;
  targetVy: number;
};

type Algae = { x: number; y: number; amount: number; size: number };
type FoodPellet = { x: number; y: number; vx: number; vy: number; life: number };

type Level = {
  id: 'freshwater' | 'mangrove' | 'saltwater' | 'reef' | 'kelp' | 'openocean' | 'polar' | 'deepsea' | 'vents';
  name: string;
  moment: string;
  note: string;
  depthNames: [string, string, string];
  maxDepth: number;
  colors: [string, string, string];
  floor: string;
  growth: string;
  species: Array<{ kind: Fish['kind']; name: string; color: string; accent: string; scale?: number }>;
};

type JournalData = {
  creatures: Partial<Record<Level['id'], string[]>>;
};

const WORLD = { width: 2800, height: 2400 };
const CURIOUS_FOLLOW_RADIUS = 170;

type MotionContext = { time: number; dt: number };

abstract class AnimalBehavior {
  readonly allowsSocialResponse: boolean = true;
  readonly allowsFeeding: boolean = true;

  abstract updateNaturalMotion(animal: Fish, context: MotionContext): void;

  protected getSpeedLimit() {
    return 0.95;
  }

  protected getVerticalDamping() {
    return 0.98;
  }

  move(animal: Fish, context: MotionContext, isFollowing: boolean) {
    const naturalLimit = this.getSpeedLimit();
    const speedLimit = isFollowing ? Math.max(1.15, naturalLimit) : animal.temperament === 'sleepy' ? naturalLimit * 0.58 : naturalLimit;
    animal.vx = Math.max(-speedLimit, Math.min(speedLimit, animal.vx));
    animal.vy = Math.max(-speedLimit, Math.min(speedLimit, animal.vy));
    animal.vy *= Math.pow(this.getVerticalDamping(), context.dt);
    animal.x += animal.vx * context.dt;
    animal.y += animal.vy * context.dt;

    if (animal.x < 80 || animal.x > WORLD.width - 80) {
      animal.vx *= -1;
      animal.targetVx *= -1;
    }
    if (animal.y < 160 || animal.y > WORLD.height - 210) {
      animal.vy *= -1;
      animal.targetVy *= -1;
    }
  }
}

type SwimmingOptions = {
  baseSpeed: number;
  speedVariation: number;
  verticalVariation: number;
  minTurnTime: number;
  turnTimeVariation: number;
  turnChance: number;
  steering: number;
  speedLimit: number;
  verticalDamping?: number;
};

class SwimmingBehavior extends AnimalBehavior {
  constructor(protected readonly options: SwimmingOptions) {
    super();
  }

  protected onCourseChange(animal: Fish, direction: number) {
    void animal;
    void direction;
  }

  protected addSpeciesMotion(animal: Fish, context: MotionContext) {
    void animal;
    void context;
  }

  updateNaturalMotion(animal: Fish, context: MotionContext) {
    animal.turnTimer -= context.dt;
    if (animal.turnTimer <= 0) {
      const currentDirection = Math.sign(animal.vx || animal.targetVx || 1);
      const nextDirection = Math.random() < this.options.turnChance ? -currentDirection : currentDirection;
      animal.targetVx = nextDirection * (this.options.baseSpeed + Math.random() * this.options.speedVariation);
      animal.targetVy = (Math.random() - 0.5) * this.options.verticalVariation;
      animal.turnTimer = this.options.minTurnTime + Math.random() * this.options.turnTimeVariation;
      this.onCourseChange(animal, nextDirection);
    }

    animal.vx += (animal.targetVx - animal.vx) * this.options.steering * context.dt;
    animal.vy += (animal.targetVy - animal.vy) * this.options.steering * context.dt;
    this.addSpeciesMotion(animal, context);
  }

  protected getSpeedLimit() {
    return this.options.speedLimit;
  }

  protected getVerticalDamping() {
    return this.options.verticalDamping ?? 0.98;
  }
}

class DartingBehavior extends SwimmingBehavior {
  constructor() {
    super({
      baseSpeed: 0.5,
      speedVariation: 0.42,
      verticalVariation: 0.72,
      minTurnTime: 42,
      turnTimeVariation: 105,
      turnChance: 0.14,
      steering: 0.014,
      speedLimit: 1.18,
    });
  }

  protected onCourseChange(animal: Fish, direction: number) {
    if (Math.random() < 0.62) {
      animal.vx += direction * (0.16 + Math.random() * 0.28);
      animal.vy += (Math.random() - 0.5) * 0.48;
    }
  }

  protected addSpeciesMotion(animal: Fish, context: MotionContext) {
    animal.vy += Math.sin(context.time * 0.001 + animal.phase) * 0.001;
  }
}

class CruisingBehavior extends SwimmingBehavior {
  constructor() {
    super({
      baseSpeed: 0.58,
      speedVariation: 0.16,
      verticalVariation: 0.18,
      minTurnTime: 110,
      turnTimeVariation: 190,
      turnChance: 0.06,
      steering: 0.006,
      speedLimit: 0.82,
      verticalDamping: 0.986,
    });
  }

  protected addSpeciesMotion(animal: Fish, context: MotionContext) {
    animal.vy += (animal.homeY - animal.y) * 0.00014 * context.dt;
  }
}

class UndulatingBehavior extends SwimmingBehavior {
  constructor() {
    super({ baseSpeed: 0.48, speedVariation: 0.16, verticalVariation: 0.4, minTurnTime: 110, turnTimeVariation: 190, turnChance: 0.06, steering: 0.014, speedLimit: 0.9 });
  }

  protected addSpeciesMotion(animal: Fish, context: MotionContext) {
    animal.vy += Math.sin(context.time * 0.004 + animal.phase) * 0.009 * context.dt;
  }
}

class HoveringBehavior extends SwimmingBehavior {
  constructor() {
    super({ baseSpeed: 0.2, speedVariation: 0.12, verticalVariation: 0.28, minTurnTime: 120, turnTimeVariation: 180, turnChance: 0.05, steering: 0.009, speedLimit: 0.44 });
  }

  protected addSpeciesMotion(animal: Fish, context: MotionContext) {
    animal.vy += Math.sin(context.time * 0.0022 + animal.phase) * 0.006 * context.dt;
  }
}

class OtterBehavior extends SwimmingBehavior {
  constructor() {
    super({ baseSpeed: 0.68, speedVariation: 0.18, verticalVariation: 0.4, minTurnTime: 100, turnTimeVariation: 160, turnChance: 0.08, steering: 0.014, speedLimit: 1.08 });
  }

  protected addSpeciesMotion(animal: Fish, context: MotionContext) {
    animal.vy += Math.sin(context.time * 0.0015 + animal.phase) * 0.004 * context.dt;
  }
}

class JellyfishBehavior extends AnimalBehavior {
  readonly allowsSocialResponse = false;
  readonly allowsFeeding = false;

  updateNaturalMotion(animal: Fish, context: MotionContext) {
    const slowDrift = Math.sin(context.time * 0.00065 + animal.phase) * 0.24;
    const bounceTarget = animal.homeY + Math.sin(context.time * 0.00145 + animal.phase) * 82;
    const pulseLift = Math.max(0, Math.sin(context.time * 0.006 + animal.phase)) * 0.012;
    animal.vx += (slowDrift - animal.vx) * 0.008 * context.dt;
    animal.vy += ((bounceTarget - animal.y) * 0.0018 - pulseLift) * context.dt;
  }

  move(animal: Fish, context: MotionContext) {
    animal.vx = Math.max(-0.34, Math.min(0.34, animal.vx));
    animal.vy = Math.max(-0.58, Math.min(0.58, animal.vy));
    animal.vy *= Math.pow(0.988, context.dt);
    animal.x += animal.vx * context.dt;
    animal.y += animal.vy * context.dt;
    if (animal.x < 90 || animal.x > WORLD.width - 90) animal.vx *= -1;
    if (animal.y < 155 || animal.y > WORLD.height - 220) {
      animal.vy *= -0.75;
      animal.homeY = Math.max(250, Math.min(WORLD.height - 320, animal.homeY));
    }
  }
}

class DivingBehavior extends AnimalBehavior {
  readonly allowsSocialResponse = false;
  readonly allowsFeeding = false;

  updateNaturalMotion(animal: Fish, context: MotionContext) {
    animal.diveClock = (animal.diveClock + 0.00068 * context.dt) % 1;
    const diveProgress = (1 - Math.cos(animal.diveClock * Math.PI * 2)) / 2;
    const targetY = 145 + diveProgress * 1570;
    animal.vy += (targetY - animal.y) * 0.0036 * context.dt;
    animal.vx += Math.sin(context.time * 0.0011 + animal.phase) * 0.004 * context.dt;
  }

  move(animal: Fish, context: MotionContext) {
    animal.vx = Math.max(-1.25, Math.min(1.25, animal.vx));
    animal.vy = Math.max(-2.25, Math.min(2.25, animal.vy));
    animal.vy *= Math.pow(0.985, context.dt);
    animal.x += animal.vx * context.dt;
    animal.y += animal.vy * context.dt;
    if (animal.x < 100 || animal.x > WORLD.width - 100) animal.vx *= -1;
    animal.y = Math.max(125, Math.min(WORLD.height - 240, animal.y));
  }
}

class StationaryBehavior extends AnimalBehavior {
  readonly allowsSocialResponse = false;
  readonly allowsFeeding = false;

  updateNaturalMotion(animal: Fish) {
    animal.vx = 0;
    animal.vy = 0;
  }

  move() {}
}

const dartingBehavior = new DartingBehavior();
const cruisingBehavior = new CruisingBehavior();
// New animals can reuse one of these instances or extend a behavior class with a species-specific motion hook.
const ANIMAL_BEHAVIORS: Record<Fish['kind'], AnimalBehavior> = {
  tang: dartingBehavior,
  clown: dartingBehavior,
  butterfly: dartingBehavior,
  puffer: dartingBehavior,
  angelfish: dartingBehavior,
  koi: dartingBehavior,
  angler: dartingBehavior,
  ray: cruisingBehavior,
  shark: cruisingBehavior,
  eel: new UndulatingBehavior(),
  seahorse: new HoveringBehavior(),
  otter: new OtterBehavior(),
  jelly: new JellyfishBehavior(),
  penguin: new DivingBehavior(),
  urchin: new StationaryBehavior(),
};

const LEVELS: Level[] = [
  {
    id: 'freshwater',
    name: 'Lilypond Gallery',
    moment: 'Morning',
    note: 'Clear the soft moss from the river stones.',
    depthNames: ['Lily shelf', 'Driftwood hollow', 'Riverbed garden'],
    maxDepth: 45,
    colors: ['#79c6b5', '#3c9c91', '#276d72'],
    floor: '#577b68',
    growth: '76, 117, 69',
    species: [
      { kind: 'butterfly', name: 'Neon tetra', color: '#7fd3cd', accent: '#db6f70' },
      { kind: 'puffer', name: 'Golden gourami', color: '#e9bd62', accent: '#fff0b4' },
      { kind: 'angelfish', name: 'Blue discus', color: '#5a9dae', accent: '#dce9a6', scale: 1.15 },
      { kind: 'tang', name: 'Glass catfish', color: '#b9d9d2', accent: '#e5f2e8' },
      { kind: 'koi', name: 'Kohaku koi', color: '#fff0d3', accent: '#e47759', scale: 1.3 },
      { kind: 'angelfish', name: 'Marble angelfish', color: '#dfdbbd', accent: '#66736e' },
      { kind: 'tang', name: 'Peppered cory', color: '#9b9880', accent: '#d6cba4' },
      { kind: 'clown', name: 'Fancy guppy', color: '#d97988', accent: '#75b4ae' },
      { kind: 'butterfly', name: 'Boesemani rainbowfish', color: '#6fa8b9', accent: '#e5a65b' },
    ],
  },
  {
    id: 'mangrove',
    name: 'Mangrove Nursery',
    moment: 'Falling Tide',
    note: 'Tend the roots where young fish gather.',
    depthNames: ['Root canopy', 'Brackish channels', 'Seagrass floor'],
    maxDepth: 35,
    colors: ['#75b9a1', '#397d70', '#234c54'],
    floor: '#4f6857',
    growth: '91, 119, 67',
    species: [
      { kind: 'butterfly', name: 'Archerfish', color: '#b4b58c', accent: '#586d65' },
      { kind: 'tang', name: 'Silver moony', color: '#b9c8bd', accent: '#e2d37e' },
      { kind: 'koi', name: 'Mudskipper', color: '#8e7b5c', accent: '#c4b17c' },
      { kind: 'shark', name: 'Young lemon shark', color: '#a49b70', accent: '#e4dbad', scale: 1.1 },
      { kind: 'seahorse', name: 'Dwarf seahorse', color: '#c99a58', accent: '#f0d58d' },
      { kind: 'ray', name: 'Mangrove whipray', color: '#6d7b68', accent: '#cad5b3' },
      { kind: 'puffer', name: 'Green spotted puffer', color: '#98a866', accent: '#e8d578' },
      { kind: 'eel', name: 'Freshwater moray', color: '#647359', accent: '#b7bd7e' },
    ],
  },
  {
    id: 'saltwater',
    name: 'Saltwater Lagoon',
    moment: 'Noon',
    note: 'Brush the warm lagoon stones until they glow.',
    depthNames: ['Tidal garden', 'Bluewater shelf', 'Sandy lagoon'],
    maxDepth: 90,
    colors: ['#53b8bd', '#247f8b', '#145567'],
    floor: '#326d75',
    growth: '70, 119, 76',
    species: [
      { kind: 'clown', name: 'Clownfish', color: '#ef8b62', accent: '#fff0ae' },
      { kind: 'tang', name: 'Blue tang', color: '#4f91be', accent: '#f2cf57' },
      { kind: 'butterfly', name: 'Butterflyfish', color: '#f3cf69', accent: '#315b83' },
      { kind: 'puffer', name: 'Honey puffer', color: '#d9b85c', accent: '#fff0ae' },
      { kind: 'ray', name: 'Reef ray', color: '#557e83', accent: '#d8e4d4' },
      { kind: 'seahorse', name: 'Lined seahorse', color: '#d9aa62', accent: '#f3dc9a' },
      { kind: 'angelfish', name: 'Moorish idol', color: '#f1e4bd', accent: '#273f51' },
      { kind: 'eel', name: 'Green moray', color: '#6c8b68', accent: '#c4c887', scale: 1.25 },
      { kind: 'shark', name: 'Whitetip reef shark', color: '#7896a0', accent: '#e0e8df', scale: 1.35 },
      { kind: 'koi', name: 'Cleaner wrasse', color: '#547eb8', accent: '#72d7c5' },
    ],
  },
  {
    id: 'reef',
    name: 'Rainbow Reef',
    moment: 'Bright Afternoon',
    note: 'Care for the coral towers and their colorful neighbors.',
    depthNames: ['Reef crown', 'Coral canyons', 'Sheltered reef floor'],
    maxDepth: 120,
    colors: ['#50c4c1', '#218da0', '#175c76'],
    floor: '#39777a',
    growth: '74, 126, 79',
    species: [
      { kind: 'butterfly', name: 'Royal gramma', color: '#7155a9', accent: '#f0cf59' },
      { kind: 'clown', name: 'Firefish goby', color: '#f2eee2', accent: '#e97f69' },
      { kind: 'angelfish', name: 'Emperor angelfish', color: '#346bb2', accent: '#f2d45e', scale: 1.15 },
      { kind: 'koi', name: 'Rainbow parrotfish', color: '#54b7a0', accent: '#e98175', scale: 1.2 },
      { kind: 'puffer', name: 'Picasso triggerfish', color: '#d8bf76', accent: '#477b8a' },
      { kind: 'tang', name: 'Purple tang', color: '#6650a8', accent: '#f2d45d' },
      { kind: 'jelly', name: 'Caribbean reef squid', color: '#d999ad', accent: '#8fe2d2' },
      { kind: 'ray', name: 'Spotted eagle ray', color: '#476f85', accent: '#d9e9de', scale: 1.35 },
      { kind: 'eel', name: 'Snowflake moray', color: '#d6c9a5', accent: '#5b5e59', scale: 1.15 },
      { kind: 'shark', name: 'Caribbean reef shark', color: '#6c8d9d', accent: '#e0e8df', scale: 1.3 },
    ],
  },
  {
    id: 'kelp',
    name: 'Kelp Forest',
    moment: 'Golden Hour',
    note: 'Tidy the old stones beneath the swaying canopy.',
    depthNames: ['Sunlit canopy', 'Kelp corridors', 'Rocky holdfasts'],
    maxDepth: 70,
    colors: ['#5d9e87', '#2e746b', '#173f4c'],
    floor: '#3e5e4c',
    growth: '102, 124, 65',
    species: [
      { kind: 'puffer', name: 'Garibaldi', color: '#ed9b4a', accent: '#f7c56a' },
      { kind: 'butterfly', name: 'Copper rockfish', color: '#b96d4f', accent: '#e2ba78' },
      { kind: 'ray', name: 'Leopard shark', color: '#74877e', accent: '#d4dece' },
      { kind: 'jelly', name: 'Sea nettle', color: '#e0c6b4', accent: '#f0dba4' },
      { kind: 'tang', name: 'Kelp bass', color: '#6f7860', accent: '#b6a36a' },
      { kind: 'angelfish', name: 'Giant sea bass', color: '#66726f', accent: '#9da798', scale: 1.45 },
      { kind: 'eel', name: 'Wolf eel', color: '#697367', accent: '#a9af8e', scale: 1.25 },
      { kind: 'butterfly', name: 'Northern anchovy', color: '#9bb7b4', accent: '#d6e6d1' },
      { kind: 'koi', name: 'California sheephead', color: '#b66f69', accent: '#303f48', scale: 1.15 },
      { kind: 'urchin', name: 'Purple sea urchin', color: '#745780', accent: '#c3a8cc', scale: 0.9 },
      { kind: 'otter', name: 'Southern sea otter', color: '#705847', accent: '#dfc49c', scale: 1.25 },
    ],
  },
  {
    id: 'openocean',
    name: 'Open Ocean',
    moment: 'Long Drift',
    note: 'Follow the current and clear the floating growth.',
    depthNames: ['Sunlit blue', 'Twilight current', 'Pelagic quiet'],
    maxDepth: 800,
    colors: ['#4cadd0', '#216d9a', '#12375f'],
    floor: '#24425a',
    growth: '58, 115, 104',
    species: [
      { kind: 'shark', name: 'Blue shark', color: '#5687a4', accent: '#d7e4df', scale: 1.35 },
      { kind: 'ray', name: 'Oceanic manta', color: '#496878', accent: '#cbd9d4', scale: 1.5 },
      { kind: 'tang', name: 'Yellowfin tuna', color: '#487790', accent: '#edcf5c', scale: 1.25 },
      { kind: 'koi', name: 'Mahi-mahi', color: '#58a9a2', accent: '#e5d45f', scale: 1.2 },
      { kind: 'butterfly', name: 'Flying fish', color: '#8abac5', accent: '#dce9de' },
      { kind: 'jelly', name: 'Crystal jelly', color: '#c1e0ec', accent: '#e7f8f5' },
      { kind: 'eel', name: 'Ribbonfish', color: '#a8c2ca', accent: '#7896bc', scale: 1.45 },
      { kind: 'angelfish', name: 'Ocean sunfish', color: '#87999e', accent: '#cad1c7', scale: 1.45 },
    ],
  },
  {
    id: 'polar',
    name: 'Polar Sea',
    moment: 'Blue Noon',
    note: 'Polish the viewing stones beneath the ice.',
    depthNames: ['Under-ice garden', 'Silver water', 'Glacial shelf'],
    maxDepth: 500,
    colors: ['#79b7c8', '#3d7391', '#203d61'],
    floor: '#536d79',
    growth: '77, 112, 103',
    species: [
      { kind: 'tang', name: 'Polar cod', color: '#a7bcc0', accent: '#dae2da' },
      { kind: 'shark', name: 'Greenland shark', color: '#60747b', accent: '#c8d3cb', scale: 1.5 },
      { kind: 'angelfish', name: 'Antarctic icefish', color: '#b6d2d5', accent: '#e4eef0' },
      { kind: 'eel', name: 'Eelpout', color: '#687c80', accent: '#a9bec0' },
      { kind: 'ray', name: 'Arctic skate', color: '#718996', accent: '#d1dbdc' },
      { kind: 'butterfly', name: 'Capelin', color: '#99b9bf', accent: '#dce7dc' },
      { kind: 'jelly', name: 'Lion’s mane jelly', color: '#c89d8f', accent: '#f1d4bd', scale: 1.2 },
      { kind: 'koi', name: 'Lumpsucker', color: '#7f9a94', accent: '#d0cfaa' },
      { kind: 'penguin', name: 'Gentoo penguin', color: '#293b44', accent: '#f4eee0', scale: 1.2 },
    ],
  },
  {
    id: 'deepsea',
    name: 'Midnight Trench',
    moment: 'Quiet Watch',
    note: 'Polish the mineral glass under the glowing shoals.',
    depthNames: ['Twilight rim', 'Midnight water', 'Abyssal plain'],
    maxDepth: 3600,
    colors: ['#152e49', '#10213d', '#090f28'],
    floor: '#18263b',
    growth: '53, 104, 105',
    species: [
      { kind: 'angler', name: 'Lanternfish', color: '#315474', accent: '#8de4c3' },
      { kind: 'butterfly', name: 'Silver hatchetfish', color: '#7e9cab', accent: '#b9f0d9' },
      { kind: 'jelly', name: 'Ghost jelly', color: '#8a8eda', accent: '#c6bcff' },
      { kind: 'ray', name: 'Velvet ray', color: '#283657', accent: '#86d9c8' },
      { kind: 'angler', name: 'Little angler', color: '#55627a', accent: '#f5d66d' },
      { kind: 'eel', name: 'Gulper eel', color: '#2f3852', accent: '#8ad8cf', scale: 1.4 },
      { kind: 'shark', name: 'Ghost shark', color: '#566a83', accent: '#bddad4', scale: 1.3 },
      { kind: 'tang', name: 'Pacific viperfish', color: '#435b70', accent: '#c5e9b7' },
      { kind: 'angelfish', name: 'Telescopefish', color: '#4c506d', accent: '#d190b4' },
      { kind: 'eel', name: 'Silver oarfish', color: '#a7b7c7', accent: '#d86575', scale: 1.65 },
    ],
  },
  {
    id: 'vents',
    name: 'Volcanic Gardens',
    moment: 'Abyssal Bloom',
    note: 'Care for the mineral chimneys and their tiny lights.',
    depthNames: ['Basalt descent', 'Vent plume', 'Mineral garden'],
    maxDepth: 4200,
    colors: ['#17223a', '#10172d', '#080b1c'],
    floor: '#25283a',
    growth: '74, 103, 92',
    species: [
      { kind: 'angler', name: 'Black seadevil', color: '#222a3b', accent: '#f2ce6d', scale: 1.2 },
      { kind: 'eel', name: 'Cutthroat eel', color: '#3d4055', accent: '#bb6a72', scale: 1.3 },
      { kind: 'shark', name: 'Sixgill shark', color: '#4c5667', accent: '#bfc5bd', scale: 1.5 },
      { kind: 'angelfish', name: 'Vent snailfish', color: '#a48791', accent: '#e0bcc0' },
      { kind: 'tang', name: 'Zoarcid fish', color: '#6e625d', accent: '#d5aa82' },
      { kind: 'jelly', name: 'Deep red jelly', color: '#b45b6a', accent: '#ef9a9f' },
      { kind: 'ray', name: 'Abyssal skate', color: '#323a4c', accent: '#88c4b6' },
      { kind: 'puffer', name: 'Blob sculpin', color: '#8b6e78', accent: '#d5a9a8' },
    ],
  },
];

const JOURNAL_KEY = 'drift-and-dapple-field-journal-v1';
const EMPTY_JOURNAL: JournalData = { creatures: {} };

function readJournal(): JournalData {
  if (typeof window === 'undefined') return EMPTY_JOURNAL;
  try {
    const saved = JSON.parse(window.localStorage.getItem(JOURNAL_KEY) ?? 'null') as JournalData | null;
    return saved?.creatures ? { creatures: saved.creatures } : EMPTY_JOURNAL;
  } catch {
    return EMPTY_JOURNAL;
  }
}

function writeJournal(journal: JournalData) {
  try {
    window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
  } catch {
    // Exploration still works when storage is unavailable (for example, in private browsing).
  }
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawFish(ctx: CanvasRenderingContext2D, fish: Fish, time: number) {
  const direction = fish.vx >= 0 ? 1 : -1;
  const bob = Math.sin(time * 0.002 + fish.phase) * 3;
  ctx.save();
  ctx.translate(fish.x, fish.y + bob);
  ctx.scale(direction, 1);

  if (fish.kind === 'urchin') {
    ctx.strokeStyle = fish.accent;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * Math.PI * 2;
      const sway = Math.sin(time * 0.0015 + fish.phase + i) * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * fish.size * 0.34, Math.sin(angle) * fish.size * 0.34);
      ctx.lineTo(Math.cos(angle) * (fish.size * 0.72 + sway), Math.sin(angle) * (fish.size * 0.72 + sway));
      ctx.stroke();
    }
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.arc(0, 0, fish.size * 0.43, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(246, 221, 190, .7)';
    for (let i = 0; i < 7; i += 1) {
      const angle = fish.phase + i * 2.3;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * fish.size * 0.23, Math.sin(angle) * fish.size * 0.23, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (fish.kind === 'otter') {
    const paddle = Math.sin(time * 0.008 + fish.phase) * 0.28;
    ctx.rotate(Math.sin(time * 0.001 + fish.phase) * 0.06);
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.ellipse(-fish.size * 0.08, 0, fish.size * 0.8, fish.size * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(fish.size * 0.58, -fish.size * 0.03, fish.size * 0.35, fish.size * 0.31, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-fish.size * 0.83, fish.size * 0.04, fish.size * 0.48, fish.size * 0.13, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fish.accent;
    ctx.beginPath();
    ctx.ellipse(fish.size * 0.67, fish.size * 0.02, fish.size * 0.22, fish.size * 0.19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.arc(fish.size * 0.43, -fish.size * 0.25, fish.size * 0.09, 0, Math.PI * 2);
    ctx.arc(fish.size * 0.74, -fish.size * 0.25, fish.size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(-fish.size * 0.05, fish.size * 0.22);
    ctx.rotate(paddle);
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.ellipse(0, fish.size * 0.22, fish.size * 0.11, fish.size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#263a3b';
    ctx.beginPath();
    ctx.arc(fish.size * 0.82, 0, fish.size * 0.06, 0, Math.PI * 2);
    ctx.arc(fish.size * 0.67, -fish.size * 0.08, fish.size * 0.025, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (fish.kind === 'penguin') {
    const tilt = Math.atan2(fish.vy, Math.max(Math.abs(fish.vx), 0.28)) * 0.72;
    const flap = Math.sin(time * 0.012 + fish.phase) * 0.3;
    ctx.rotate(tilt);
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, fish.size * 0.72, fish.size * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fish.accent;
    ctx.beginPath();
    ctx.ellipse(fish.size * 0.12, fish.size * 0.07, fish.size * 0.46, fish.size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#efad55';
    ctx.beginPath();
    ctx.moveTo(fish.size * 0.68, -fish.size * 0.06);
    ctx.lineTo(fish.size * 0.96, fish.size * 0.03);
    ctx.lineTo(fish.size * 0.67, fish.size * 0.11);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.rotate(flap);
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.ellipse(-fish.size * 0.06, fish.size * 0.3, fish.size * 0.34, fish.size * 0.11, 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#edf3ec';
    ctx.beginPath();
    ctx.arc(fish.size * 0.48, -fish.size * 0.12, fish.size * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d3038';
    ctx.beginPath();
    ctx.arc(fish.size * 0.51, -fish.size * 0.12, fish.size * 0.032, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (fish.kind === 'jelly') {
    const pulse = (Math.sin(time * 0.006 + fish.phase) + 1) / 2;
    ctx.scale(1 + pulse * 0.08, 1 - pulse * 0.1);
    ctx.globalAlpha = 0.78;
    ctx.fillStyle = '#dbc8e9';
    ctx.beginPath();
    ctx.arc(0, -5, fish.size * 0.48, Math.PI, 0);
    ctx.quadraticCurveTo(fish.size * 0.35, fish.size * 0.24, 0, fish.size * 0.1);
    ctx.quadraticCurveTo(-fish.size * 0.35, fish.size * 0.24, -fish.size * 0.48, -5);
    ctx.fill();
    ctx.strokeStyle = '#eadff2';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * fish.size * 0.18, fish.size * 0.08);
      ctx.bezierCurveTo(i * fish.size * 0.25, fish.size * 0.45, -i * fish.size * 0.1, fish.size * 0.58, i * fish.size * 0.16, fish.size * 0.8);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (fish.kind === 'ray') {
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.moveTo(fish.size * 0.74, 0);
    ctx.quadraticCurveTo(0, -fish.size * 0.58, -fish.size * 0.82, 0);
    ctx.quadraticCurveTo(0, fish.size * 0.58, fish.size * 0.74, 0);
    ctx.fill();
    ctx.strokeStyle = fish.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-fish.size * 0.7, 0);
    ctx.quadraticCurveTo(-fish.size * 1.2, fish.size * 0.15, -fish.size * 1.55, fish.size * 0.05);
    ctx.stroke();
    ctx.fillStyle = fish.accent;
    ctx.beginPath();
    ctx.arc(fish.size * 0.35, -fish.size * 0.08, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (fish.kind === 'eel') {
    ctx.strokeStyle = 'rgba(4, 30, 40, .16)';
    ctx.lineWidth = fish.size * 0.46;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-fish.size * 1.3, 8);
    ctx.bezierCurveTo(-fish.size * 0.7, -fish.size * 0.45, fish.size * 0.2, fish.size * 0.44, fish.size * 0.95, 7);
    ctx.stroke();
    ctx.strokeStyle = fish.color;
    ctx.lineWidth = fish.size * 0.42;
    ctx.beginPath();
    ctx.moveTo(-fish.size * 1.3, 0);
    ctx.bezierCurveTo(-fish.size * 0.7, -fish.size * 0.45, fish.size * 0.2, fish.size * 0.44, fish.size * 0.95, 0);
    ctx.stroke();
    ctx.strokeStyle = fish.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-fish.size * 1.2, -1);
    ctx.bezierCurveTo(-fish.size * 0.6, -fish.size * 0.33, fish.size * 0.18, fish.size * 0.3, fish.size * 0.78, -2);
    ctx.stroke();
    ctx.fillStyle = '#f6f0d9';
    ctx.beginPath();
    ctx.arc(fish.size * 0.78, -fish.size * 0.08, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e3340';
    ctx.beginPath();
    ctx.arc(fish.size * 0.8, -fish.size * 0.08, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (fish.kind === 'seahorse') {
    ctx.scale(0.9, 0.9);
    ctx.strokeStyle = fish.color;
    ctx.lineWidth = fish.size * 0.34;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(4, -fish.size * 0.42);
    ctx.bezierCurveTo(-fish.size * 0.3, -fish.size * 0.08, fish.size * 0.18, fish.size * 0.22, -fish.size * 0.08, fish.size * 0.52);
    ctx.bezierCurveTo(-fish.size * 0.28, fish.size * 0.75, -fish.size * 0.5, fish.size * 0.5, -fish.size * 0.27, fish.size * 0.4);
    ctx.stroke();
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.ellipse(fish.size * 0.12, -fish.size * 0.48, fish.size * 0.32, fish.size * 0.23, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(fish.size * 0.32, -fish.size * 0.54);
    ctx.lineTo(fish.size * 0.72, -fish.size * 0.48);
    ctx.lineTo(fish.size * 0.31, -fish.size * 0.4);
    ctx.fill();
    ctx.strokeStyle = fish.accent;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-4, -fish.size * 0.18 + i * 8);
      ctx.lineTo(5, -fish.size * 0.2 + i * 8);
      ctx.stroke();
    }
    ctx.fillStyle = '#243945';
    ctx.beginPath();
    ctx.arc(fish.size * 0.24, -fish.size * 0.53, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (fish.kind === 'shark') {
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.moveTo(fish.size * 1.05, 0);
    ctx.bezierCurveTo(fish.size * 0.35, -fish.size * 0.4, -fish.size * 0.7, -fish.size * 0.3, -fish.size * 0.95, 0);
    ctx.bezierCurveTo(-fish.size * 0.55, fish.size * 0.3, fish.size * 0.45, fish.size * 0.3, fish.size * 1.05, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-fish.size * 0.85, 0);
    ctx.lineTo(-fish.size * 1.35, -fish.size * 0.5);
    ctx.lineTo(-fish.size * 1.2, 0);
    ctx.lineTo(-fish.size * 1.35, fish.size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-fish.size * 0.1, -fish.size * 0.24);
    ctx.lineTo(-fish.size * 0.38, -fish.size * 0.7);
    ctx.lineTo(fish.size * 0.2, -fish.size * 0.25);
    ctx.fill();
    ctx.fillStyle = fish.accent;
    ctx.beginPath();
    ctx.ellipse(fish.size * 0.28, fish.size * 0.13, fish.size * 0.46, fish.size * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#152d38';
    ctx.beginPath();
    ctx.arc(fish.size * 0.67, -fish.size * 0.08, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (fish.kind === 'angelfish') {
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.moveTo(fish.size * 0.68, 0);
    ctx.lineTo(0, -fish.size * 0.76);
    ctx.lineTo(-fish.size * 0.68, 0);
    ctx.lineTo(0, fish.size * 0.76);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = fish.accent;
    ctx.beginPath();
    ctx.moveTo(-fish.size * 0.55, 0);
    ctx.lineTo(-fish.size * 1.0, -fish.size * 0.4);
    ctx.lineTo(-fish.size * 0.92, fish.size * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = fish.accent;
    ctx.lineWidth = fish.size * 0.12;
    ctx.beginPath();
    ctx.moveTo(-fish.size * 0.18, -fish.size * 0.59);
    ctx.lineTo(-fish.size * 0.18, fish.size * 0.58);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(fish.size * 0.38, -fish.size * 0.12, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#193540';
    ctx.beginPath();
    ctx.arc(fish.size * 0.4, -fish.size * 0.12, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.fillStyle = 'rgba(4, 44, 61, .16)';
  ctx.beginPath();
  ctx.ellipse(5, 9, fish.size * 0.75, fish.size * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fish.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, fish.size * (fish.kind === 'puffer' || fish.kind === 'angler' ? 0.58 : 0.72), fish.size * (fish.kind === 'puffer' || fish.kind === 'angler' ? 0.55 : 0.42), 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-fish.size * 0.62, 0);
  ctx.lineTo(-fish.size * 1.05, -fish.size * 0.38);
  ctx.lineTo(-fish.size * 0.98, fish.size * 0.38);
  ctx.closePath();
  ctx.fill();

  if (fish.kind === 'clown') {
    ctx.strokeStyle = '#fff5d9';
    ctx.lineWidth = fish.size * 0.14;
    ctx.beginPath();
    ctx.moveTo(-fish.size * 0.2, -fish.size * 0.34);
    ctx.lineTo(-fish.size * 0.2, fish.size * 0.34);
    ctx.moveTo(fish.size * 0.28, -fish.size * 0.28);
    ctx.lineTo(fish.size * 0.28, fish.size * 0.28);
    ctx.stroke();
  } else if (fish.kind !== 'puffer' && fish.kind !== 'angler') {
    ctx.fillStyle = fish.accent;
    ctx.beginPath();
    ctx.ellipse(-fish.size * 0.05, 0, fish.size * 0.16, fish.size * 0.39, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (fish.kind === 'puffer') {
    ctx.strokeStyle = '#8c7745';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * fish.size * 0.42, Math.sin(angle) * fish.size * 0.4);
      ctx.lineTo(Math.cos(angle) * fish.size * 0.68, Math.sin(angle) * fish.size * 0.63);
      ctx.stroke();
    }
  }

  if (fish.kind === 'koi') {
    ctx.fillStyle = fish.accent;
    ctx.beginPath();
    ctx.ellipse(-fish.size * 0.12, -fish.size * 0.12, fish.size * 0.22, fish.size * 0.18, 0.3, 0, Math.PI * 2);
    ctx.ellipse(fish.size * 0.27, fish.size * 0.08, fish.size * 0.16, fish.size * 0.14, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (fish.kind === 'angler') {
    ctx.strokeStyle = fish.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fish.size * 0.06, -fish.size * 0.42);
    ctx.quadraticCurveTo(fish.size * 0.35, -fish.size * 0.88, fish.size * 0.62, -fish.size * 0.58);
    ctx.stroke();
    ctx.shadowColor = fish.accent;
    ctx.shadowBlur = 14;
    ctx.fillStyle = fish.accent;
    ctx.beginPath();
    ctx.arc(fish.size * 0.65, -fish.size * 0.57, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(fish.size * 0.43, -fish.size * 0.08, fish.size * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#163e45';
  ctx.beginPath();
  ctx.arc(fish.size * 0.46, -fish.size * 0.08, fish.size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHappyReaction(ctx: CanvasRenderingContext2D, fish: Fish) {
  if (fish.happy <= 0) return;
  const progress = 1 - fish.happy / 100;
  const alpha = Math.min(1, fish.happy / 22);
  ctx.save();
  ctx.translate(fish.x, fish.y - fish.size * 0.9 - 12 - progress * 22);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#f3d579';
  ctx.shadowColor = 'rgba(255, 225, 125, .65)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, 7);
  ctx.bezierCurveTo(-13, -1, -9, -11, 0, -5);
  ctx.bezierCurveTo(9, -11, 13, -1, 0, 7);
  ctx.fill();
  ctx.restore();
}

function drawDiver(ctx: CanvasRenderingContext2D, x: number, y: number, facing: number, cleaning: boolean, time: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  const kick = Math.sin(time * 0.012) * 0.24;

  ctx.strokeStyle = '#f5d772';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-7, 17);
  ctx.lineTo(-29, 30 + kick * 16);
  ctx.moveTo(3, 19);
  ctx.lineTo(-16, 39 - kick * 16);
  ctx.stroke();

  ctx.fillStyle = '#173e4e';
  roundedRect(ctx, -29, 27 + kick * 16, 22, 8, 4);
  ctx.fill();
  roundedRect(ctx, -17, 36 - kick * 16, 22, 8, 4);
  ctx.fill();

  ctx.fillStyle = '#efb052';
  roundedRect(ctx, -20, -22, 30, 48, 13);
  ctx.fill();
  ctx.fillStyle = '#28596a';
  roundedRect(ctx, -27, -15, 11, 34, 5);
  ctx.fill();

  ctx.fillStyle = '#173e4e';
  ctx.beginPath();
  ctx.arc(6, -26, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b8f0ec';
  roundedRect(ctx, 5, -36, 22, 17, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.65)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = '#efb052';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(5, 1);
  ctx.lineTo(cleaning ? 38 : 29, cleaning ? -7 : 9);
  ctx.stroke();
  if (cleaning) {
    ctx.fillStyle = '#f7e6a4';
    roundedRect(ctx, 34, -17, 15, 22, 5);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(224, 252, 249, .75)';
  for (let i = 0; i < 3; i += 1) {
    const rise = (time * 0.025 + i * 15) % 52;
    ctx.beginPath();
    ctx.arc(25 + rise * 0.2, -39 - rise, 2 + i, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFormationGrowth(
  ctx: CanvasRenderingContext2D,
  level: Level,
  x: number,
  y: number,
  width: number,
  seed: number,
  time: number,
) {
  const reefLike = level.id === 'reef' || level.id === 'saltwater';
  const leafy = level.id === 'freshwater' || level.id === 'mangrove' || level.id === 'kelp';

  if (reefLike) {
    const colors = level.id === 'reef' ? ['#ef8c7c', '#d989b5', '#efbd61', '#8dc58c'] : ['#cf8c7c', '#c692a9', '#d8ae68'];
    for (let i = 0; i < 5; i += 1) {
      const stemX = x + 34 + ((i * 67 + seed * 29) % Math.max(70, width - 68));
      const height = 34 + ((i + seed) % 3) * 18;
      ctx.strokeStyle = colors[(i + seed) % colors.length];
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(stemX, y);
      ctx.lineTo(stemX, y - height);
      ctx.moveTo(stemX, y - height * 0.52);
      ctx.lineTo(stemX - 13, y - height * 0.78);
      ctx.moveTo(stemX, y - height * 0.68);
      ctx.lineTo(stemX + 15, y - height * 0.9);
      ctx.stroke();
    }
    return;
  }

  if (leafy) {
    for (let i = 0; i < 7; i += 1) {
      const stemX = x + 25 + ((i * 53 + seed * 31) % Math.max(60, width - 50));
      const height = (level.id === 'kelp' ? 120 : 62) + ((i + seed) % 4) * 24;
      const sway = Math.sin(time * 0.001 + i + seed) * (level.id === 'kelp' ? 18 : 10);
      ctx.strokeStyle = level.id === 'kelp' ? 'rgba(116, 151, 72, .68)' : 'rgba(115, 154, 84, .62)';
      ctx.lineWidth = level.id === 'kelp' ? 9 : 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(stemX, y);
      ctx.quadraticCurveTo(stemX - 12, y - height * 0.55, stemX + sway, y - height);
      ctx.stroke();
      ctx.fillStyle = 'rgba(153, 178, 92, .48)';
      ctx.beginPath();
      ctx.ellipse(stemX + sway - 4, y - height + 7, 18, 7, -0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (level.id === 'deepsea' || level.id === 'vents') {
    const glow = level.id === 'vents' ? 'rgba(242, 133, 91, .7)' : 'rgba(103, 229, 202, .64)';
    for (let i = 0; i < 8; i += 1) {
      const stemX = x + 24 + ((i * 47 + seed * 37) % Math.max(55, width - 48));
      const height = 18 + ((i + seed) % 4) * 10;
      ctx.strokeStyle = glow;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(stemX, y);
      ctx.quadraticCurveTo(stemX - 5, y - height * 0.55, stemX + Math.sin(time * 0.001 + i) * 4, y - height);
      ctx.stroke();
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(stemX, y - height, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  const accent = level.id === 'polar' ? 'rgba(205, 239, 239, .5)' : 'rgba(151, 205, 185, .34)';
  for (let i = 0; i < 6; i += 1) {
    const stemX = x + 30 + ((i * 61 + seed * 23) % Math.max(65, width - 60));
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(stemX, y);
    ctx.lineTo(stemX + (i % 2 ? 9 : -7), y - 32 - (i % 3) * 12);
    ctx.stroke();
  }
}

function drawBackgroundFormations(ctx: CanvasRenderingContext2D, level: Level, time: number) {
  const formations = [
    { x: -90, y: 530, width: 500, height: 250 },
    { x: 560, y: 890, width: 430, height: 225 },
    { x: 1280, y: 600, width: 520, height: 285 },
    { x: 2110, y: 1010, width: 560, height: 270 },
    { x: 120, y: 1450, width: 470, height: 245 },
    { x: 900, y: 1720, width: 540, height: 280 },
    { x: 1760, y: 1510, width: 430, height: 230 },
    { x: 2350, y: 1940, width: 520, height: 285 },
  ];

  ctx.save();
  formations.forEach((formation, index) => {
    const top = formation.y;
    const base = formation.y + formation.height;
    ctx.fillStyle = index % 2 ? `${level.floor}70` : `${level.floor}58`;
    ctx.beginPath();
    ctx.moveTo(formation.x, base + 190);
    ctx.lineTo(formation.x + 30, top + 58);
    ctx.quadraticCurveTo(formation.x + formation.width * 0.22, top - 22, formation.x + formation.width * 0.43, top + 18);
    ctx.quadraticCurveTo(formation.x + formation.width * 0.68, top - 42, formation.x + formation.width - 18, top + 42);
    ctx.lineTo(formation.x + formation.width, base + 190);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(210, 235, 213, .08)';
    ctx.beginPath();
    ctx.moveTo(formation.x + 32, top + 58);
    ctx.quadraticCurveTo(formation.x + formation.width * 0.34, top - 8, formation.x + formation.width * 0.67, top + 22);
    ctx.lineTo(formation.x + formation.width * 0.58, top + 48);
    ctx.quadraticCurveTo(formation.x + formation.width * 0.3, top + 22, formation.x + 46, top + 82);
    ctx.closePath();
    ctx.fill();

    drawFormationGrowth(ctx, level, formation.x + 12, top + 12, formation.width - 24, index, time);
  });
  ctx.restore();
}

function drawEnvironment(ctx: CanvasRenderingContext2D, level: Level, time: number) {
  const floorY = WORLD.height - 135;
  ctx.fillStyle = level.floor;
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  for (let x = 0; x <= WORLD.width; x += 90) {
    ctx.lineTo(x, floorY + Math.sin(x * 0.009 + LEVELS.indexOf(level)) * 28);
  }
  ctx.lineTo(WORLD.width, WORLD.height);
  ctx.lineTo(0, WORLD.height);
  ctx.fill();

  const ledges = [
    { x: 90, y: 780, width: 360 },
    { x: 2160, y: 1280, width: 470 },
    { x: 450, y: 1760, width: 420 },
    { x: 1700, y: 2050, width: 360 },
  ];
  ledges.forEach((ledge, index) => {
    ctx.fillStyle = index % 2 ? `${level.floor}dd` : `${level.floor}ee`;
    ctx.beginPath();
    ctx.moveTo(ledge.x, ledge.y);
    ctx.quadraticCurveTo(ledge.x + ledge.width * 0.45, ledge.y - 30, ledge.x + ledge.width, ledge.y);
    ctx.lineTo(ledge.x + ledge.width - 55, ledge.y + 72);
    ctx.lineTo(ledge.x + 35, ledge.y + 58);
    ctx.closePath();
    ctx.fill();
  });

  const rockBeds = [
    { x: 210, y: floorY - 8 }, { x: 560, y: 778 }, { x: 980, y: floorY + 3 },
    { x: 1390, y: floorY - 5 }, { x: 1800, y: 2048 }, { x: 2220, y: 1278 },
    { x: 2600, y: floorY - 2 }, { x: 720, y: 1758 }, { x: 1540, y: floorY + 5 },
  ];
  rockBeds.forEach(({ x, y }, index) => {
    ctx.fillStyle = index % 2 ? `${level.floor}f2` : `${level.floor}cc`;
    for (let stone = 0; stone < 3; stone += 1) {
      ctx.beginPath();
      ctx.ellipse(x + stone * 29, y - stone * 4, 31 - stone * 5, 18 + stone * 3, stone * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(220, 238, 205, .12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x - 6, y - 5, 14, Math.PI * 1.08, Math.PI * 1.72);
    ctx.stroke();
  });

  if (level.id === 'freshwater') {
    for (let x = 120; x < WORLD.width; x += 270) {
      ctx.fillStyle = '#678e65';
      ctx.beginPath();
      ctx.ellipse(x, 560 + (x % 3) * 80, 70, 18, -0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#80a975';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x, 720);
      ctx.quadraticCurveTo(x - 18, 650, x + 4, 560 + (x % 3) * 80);
      ctx.stroke();
    }
    for (let x = 250; x < WORLD.width; x += 430) {
      ctx.fillStyle = '#789182';
      ctx.beginPath();
      ctx.ellipse(x, floorY, 58, 26, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (level.id === 'mangrove') {
    for (let x = 70; x < WORLD.width; x += 230) {
      ctx.strokeStyle = x % 460 ? '#665b43' : '#79684a';
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 80, 220, x - 60, 510, x + 35, 820 + (x % 170));
      ctx.stroke();
      ctx.strokeStyle = 'rgba(167, 151, 94, .45)';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    for (let x = 100; x < WORLD.width; x += 145) {
      ctx.strokeStyle = '#6f8d55';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.quadraticCurveTo(x - 22, floorY - 90, x + Math.sin(x) * 16, floorY - 150 - (x % 90));
      ctx.stroke();
    }
  } else if (level.id === 'kelp') {
    for (let x = 42; x < WORLD.width; x += 76) {
      const h = 520 + ((x * 13) % 780);
      const sway = Math.sin(time * 0.0007 + x) * 32;
      ctx.strokeStyle = x % 152 ? '#597b48' : '#719253';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.bezierCurveTo(x - 40, floorY - h * 0.35, x + sway + 30, floorY - h * 0.72, x + sway, floorY - h);
      ctx.stroke();
      ctx.fillStyle = 'rgba(152, 174, 87, .58)';
      for (let leaf = 0; leaf < 4; leaf += 1) {
        const leafY = floorY - h * (0.45 + leaf * 0.15);
        const leafX = x + sway * (0.45 + leaf * 0.14);
        ctx.beginPath();
        ctx.ellipse(leafX + (leaf % 2 ? 24 : -20), leafY, 30, 11, leaf % 2 ? 0.35 : -0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (level.id === 'polar') {
    ctx.fillStyle = 'rgba(211, 240, 239, .72)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= WORLD.width; x += 150) ctx.lineTo(x, 90 + (x % 300 ? 55 : 140));
    ctx.lineTo(WORLD.width, 0);
    ctx.fill();
    for (let x = 160; x < WORLD.width; x += 390) {
      ctx.fillStyle = '#6f8791';
      ctx.beginPath();
      ctx.ellipse(x, floorY, 85, 38, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (level.id === 'deepsea' || level.id === 'vents') {
    for (let x = 160; x < WORLD.width; x += 340) {
      ctx.fillStyle = level.id === 'vents' ? (x % 680 ? '#343344' : '#403c4a') : (x % 680 ? '#23344b' : '#2d3c54');
      ctx.beginPath();
      ctx.moveTo(x - 90, floorY);
      ctx.lineTo(x - 18, floorY - 160 - (x % 140));
      ctx.lineTo(x + 75, floorY);
      ctx.fill();
      const glow = level.id === 'vents' ? 'rgba(241, 139, 91, .62)' : 'rgba(112, 230, 195, .54)';
      for (let i = 0; i < 3; i += 1) {
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x - 22 + i * 14, floorY - 90 - i * 19, 3.5 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
      if (level.id === 'vents') {
        ctx.fillStyle = 'rgba(158, 177, 169, .12)';
        for (let i = 0; i < 5; i += 1) {
          const rise = (time * 0.02 + i * 55 + x) % 430;
          ctx.beginPath();
          ctx.arc(x - 10 + Math.sin(rise) * 15, floorY - 220 - rise, 12 + i * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  } else if (level.id === 'saltwater' || level.id === 'reef') {
    for (let x = 80; x < WORLD.width; x += level.id === 'reef' ? 140 : 190) {
      const h = 70 + ((x * 17) % 100);
      ctx.strokeStyle = level.id === 'reef' ? (x % 280 ? '#3f9b82' : '#86b45d') : (x % 380 ? '#3e8f7e' : '#7fae72');
      ctx.lineWidth = 13;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.bezierCurveTo(x - 25, floorY - 50, x + 28, floorY - 90, x + Math.sin(x) * 18, floorY - h);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(194, 229, 145, .36)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  } else if (level.id === 'openocean') {
    ctx.strokeStyle = 'rgba(202, 241, 238, .12)';
    ctx.lineWidth = 2;
    for (let y = 430; y < floorY; y += 420) {
      ctx.beginPath();
      ctx.bezierCurveTo(0, y + 30, WORLD.width * 0.45, y - 35, WORLD.width, y + 10);
      ctx.stroke();
    }
  }

  if (level.id === 'freshwater' || level.id === 'mangrove' || level.id === 'saltwater' || level.id === 'reef') {
    const gardens = [520, 1130, 1620, 2470];
    gardens.forEach((gardenX, gardenIndex) => {
      const gardenY = gardenIndex === 1 ? 780 : gardenIndex === 2 ? 1760 : floorY;
      for (let blade = 0; blade < 7; blade += 1) {
        const x = gardenX + blade * 15;
        const h = 72 + (blade % 3) * 24;
        const sway = Math.sin(time * 0.001 + blade + gardenIndex) * 12;
        ctx.strokeStyle = level.id === 'saltwater' || level.id === 'reef' ? 'rgba(113, 157, 92, .72)' : 'rgba(92, 132, 78, .76)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, gardenY);
        ctx.quadraticCurveTo(x - 12, gardenY - h * 0.55, x + sway, gardenY - h);
        ctx.stroke();
      }
    });
  }

  if (level.id !== 'saltwater' && level.id !== 'reef') return;
  const coral = [
    [310, floorY, '#f18b78'], [740, 780, '#e6a96f'], [1230, floorY, '#d87882'],
    [1700, 2050, '#d799bd'], [2240, 1280, '#ef9a75'], [2600, floorY, '#ddbb6a'],
    ...(level.id === 'reef' ? [
      [520, floorY, '#d979ac'], [980, floorY, '#f0b759'], [1450, floorY, '#e88069'],
      [1940, floorY, '#b982bd'], [2440, floorY, '#ef8d8a'],
    ] as const : []),
  ] as const;
  coral.forEach(([x, y, color]) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 80);
    ctx.moveTo(x, y - 50);
    ctx.lineTo(x - 30, y - 78);
    ctx.moveTo(x, y - 35);
    ctx.lineTo(x + 35, y - 68);
    ctx.stroke();
  });
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchInput = useRef({ x: 0, y: 0, cleaning: false, feeding: false });
  const audioRef = useRef<{ context: AudioContext; gain: GainNode; timer: number } | null>(null);
  const journalRef = useRef<JournalData>(EMPTY_JOURNAL);
  const menuOpenRef = useRef(false);
  const travelOpenRef = useRef(false);
  const travelCloseTimer = useRef<number | null>(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [cleaned, setCleaned] = useState(0);
  const [nearAlgae, setNearAlgae] = useState(false);
  const [nearbyCreature, setNearbyCreature] = useState('');
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(false);
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [depthMeters, setDepthMeters] = useState(0);
  const [depthZone, setDepthZone] = useState('');
  const [feeding, setFeeding] = useState(false);
  const [feedingMessage, setFeedingMessage] = useState('');
  const [snacksShared, setSnacksShared] = useState(0);
  const [journal, setJournal] = useState<JournalData>(EMPTY_JOURNAL);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalPage, setJournalPage] = useState(0);
  const [travelOpen, setTravelOpen] = useState(false);
  const [travelClosing, setTravelClosing] = useState(false);
  const level = LEVELS[levelIndex];

  const setTouchDirection = (x: number, y: number) => {
    touchInput.current.x = x;
    touchInput.current.y = y;
  };

  const toggleSound = () => {
    if (audioRef.current) {
      const activeAudio = audioRef.current;
      activeAudio.gain.gain.setTargetAtTime(0, activeAudio.context.currentTime, 0.08);
      window.clearInterval(activeAudio.timer);
      window.setTimeout(() => void activeAudio.context.close(), 180);
      audioRef.current = null;
      setSoundOn(false);
      return;
    }
    const AudioContextClass = window.AudioContext;
    const context = new AudioContextClass();
    const gain = context.createGain();
    gain.gain.value = 0.035;
    gain.connect(context.destination);
    const hum = context.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 110;
    const humGain = context.createGain();
    humGain.gain.value = 0.16;
    hum.connect(humGain).connect(gain);
    hum.start();
    const timer = window.setInterval(() => {
      const bubble = context.createOscillator();
      const bubbleGain = context.createGain();
      bubble.type = 'sine';
      bubble.frequency.setValueAtTime(280 + Math.random() * 180, context.currentTime);
      bubble.frequency.exponentialRampToValueAtTime(620 + Math.random() * 220, context.currentTime + 0.22);
      bubbleGain.gain.setValueAtTime(0.001, context.currentTime);
      bubbleGain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + 0.03);
      bubbleGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.24);
      bubble.connect(bubbleGain).connect(gain);
      bubble.start();
      bubble.stop(context.currentTime + 0.26);
    }, 2300);
    audioRef.current = { context, gain, timer };
    setSoundOn(true);
  };

  const openJournal = () => {
    if (travelCloseTimer.current !== null) window.clearTimeout(travelCloseTimer.current);
    travelCloseTimer.current = null;
    travelOpenRef.current = false;
    setTravelClosing(false);
    setTravelOpen(false);
    setJournalPage(levelIndex);
    setJournalOpen(true);
  };

  const openTravel = useCallback(() => {
    if (travelCloseTimer.current !== null) window.clearTimeout(travelCloseTimer.current);
    setJournalOpen(false);
    setTravelClosing(false);
    travelOpenRef.current = true;
    setTravelOpen(true);
  }, []);

  const closeTravel = useCallback((destination?: number) => {
    if (!travelOpenRef.current) return;
    if (travelCloseTimer.current !== null) window.clearTimeout(travelCloseTimer.current);
    setTravelClosing(true);
    const closeDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300;
    travelCloseTimer.current = window.setTimeout(() => {
      travelOpenRef.current = false;
      travelCloseTimer.current = null;
      setTravelOpen(false);
      setTravelClosing(false);
      if (destination !== undefined && destination !== levelIndex) setLevelIndex(destination);
    }, closeDuration);
  }, [levelIndex]);

  useEffect(() => {
    menuOpenRef.current = journalOpen || travelOpen;
    travelOpenRef.current = travelOpen;
  }, [journalOpen, travelOpen]);

  useEffect(() => {
    const toggleJournal = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'j' && !event.repeat) {
        setTravelOpen(false);
        setJournalOpen((open) => !open);
      }
      if (event.key.toLowerCase() === 'x' && !event.repeat) {
        setJournalOpen(false);
        if (travelOpenRef.current) closeTravel();
        else openTravel();
      }
      if (event.key === 'Escape' && !event.repeat) {
        setJournalOpen(false);
        closeTravel();
      }
    };
    window.addEventListener('keydown', toggleJournal);
    return () => window.removeEventListener('keydown', toggleJournal);
  }, [closeTravel, openTravel]);

  useEffect(() => () => {
    if (travelCloseTimer.current !== null) window.clearTimeout(travelCloseTimer.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setCleaned(0);
    setNearAlgae(false);
    setNearbyCreature('');
    const savedJournal = readJournal();
    journalRef.current = savedJournal;
    setJournal(savedJournal);
    setDiscovered(savedJournal.creatures[level.id] ?? []);
    setShowLevelIntro(true);
    setDepthMeters(0);
    setDepthZone(level.depthNames[0]);
    setFeeding(false);
    setFeedingMessage('');
    setSnacksShared(0);
    const introTimer = window.setTimeout(() => setShowLevelIntro(false), 2200);
    const player = { x: 470, y: 280, vx: 0, vy: 0, facing: 1 };
    const camera = { x: 0, y: 0 };
    const keys = new Set<string>();
    const species = level.species;
    const personalities: Fish['temperament'][] = ['curious', 'calm', 'playful', 'shy', 'sleepy', 'calm'];
    const urchinPerches = [
      { x: 520, y: 720 },
      { x: 2220, y: 1260 },
      { x: 760, y: 1715 },
      { x: 1810, y: 2040 },
      { x: 2520, y: WORLD.height - 175 },
    ];
    const fish: Fish[] = Array.from({ length: 40 }, (_, i) => {
      const animal = species[i % species.length];
      const isUrchin = animal.kind === 'urchin';
      const isPenguin = animal.kind === 'penguin';
      const perch = urchinPerches[i % urchinPerches.length];
      const largeAnimal = ['ray', 'shark', 'otter', 'penguin'].includes(animal.kind);
      return {
        x: isUrchin ? perch.x : 180 + ((i * 347) % 2450),
        y: isUrchin ? perch.y : isPenguin ? 145 + (i % 3) * 28 : 260 + (i % 3) * 650 + ((i * 173) % 390),
        vx: isUrchin ? 0 : (i % 2 ? -1 : 1) * (0.28 + (i % 4) * 0.07),
        vy: 0,
        size: (largeAnimal ? 42 + (i % 3) * 6 : isUrchin ? 26 + (i % 3) * 3 : 20 + (i % 5) * 3.5) * (animal.scale ?? 1),
        color: animal.color,
        accent: animal.accent,
        kind: animal.kind,
        name: animal.name,
        phase: i * 1.7,
        temperament: personalities[i % personalities.length],
        happy: 0,
        biteCooldown: 0,
        diveClock: (i * 0.17) % 1,
        homeY: isUrchin ? perch.y : isPenguin ? 145 + (i % 3) * 28 : 260 + (i % 3) * 650 + ((i * 173) % 390),
        turnTimer: 35 + ((i * 47) % 130),
        targetVx: (i % 2 ? -1 : 1) * (0.3 + (i % 4) * 0.08),
        targetVy: ((i % 5) - 2) * 0.08,
      };
    });
    const algae: Algae[] = [
      { x: 620, y: 430, size: 58, amount: 1 },
      { x: 1080, y: 680, size: 52, amount: 1 },
      { x: 1510, y: 910, size: 68, amount: 1 },
      { x: 1980, y: 1150, size: 58, amount: 1 },
      { x: 2440, y: 1390, size: 72, amount: 1 },
      { x: 460, y: 1610, size: 62, amount: 1 },
      { x: 1060, y: 1860, size: 56, amount: 1 },
      { x: 1870, y: 2050, size: 64, amount: 1 },
      { x: 2480, y: 2190, size: 70, amount: 1 },
    ];
    const food: FoodPellet[] = [];
    let frame = 0;
    let last = performance.now();
    let active = true;
    let lastProgress = -1;
    let lastNear = false;
    let lastCreature = '';
    let lastDepthMeters = -1;
    let lastDepthZone = '';
    let feedCooldown = 0;
    let lastFeeding = false;
    let feedNotice = 0;
    let snackCount = 0;
    const seen = new Set(savedJournal.creatures[level.id] ?? []);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      keys.add(event.key.toLowerCase());
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key.toLowerCase())) event.preventDefault();
    };
    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    resize();

    const render = (time: number) => {
      if (!active) return;
      const rect = canvas.getBoundingClientRect();
      const dt = Math.min((time - last) / 16.67, 2);
      last = time;

      let mx = 0;
      let my = 0;
      if (!menuOpenRef.current) {
        if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
        if (keys.has('d') || keys.has('arrowright')) mx += 1;
        if (keys.has('w') || keys.has('arrowup')) my -= 1;
        if (keys.has('s') || keys.has('arrowdown')) my += 1;
        mx += touchInput.current.x;
        my += touchInput.current.y;
      }
      if (mx && my) { mx *= 0.707; my *= 0.707; }
      player.vx += mx * 0.32 * dt;
      player.vy += my * 0.28 * dt;
      player.vx *= Math.pow(0.93, dt);
      player.vy *= Math.pow(0.93, dt);
      player.x = Math.max(70, Math.min(WORLD.width - 70, player.x + player.vx * dt));
      player.y = Math.max(110, Math.min(WORLD.height - 190, player.y + player.vy * dt));
      if (Math.abs(player.vx) > 0.2) player.facing = player.vx > 0 ? 1 : -1;

      const targetCameraX = Math.max(0, Math.min(WORLD.width - rect.width, player.x - rect.width * 0.45));
      camera.x += (targetCameraX - camera.x) * 0.055;
      const targetCameraY = Math.max(0, Math.min(WORLD.height - rect.height, player.y - rect.height * 0.48));
      camera.y += (targetCameraY - camera.y) * 0.055;
      const depthRatio = Math.max(0, Math.min(1, (player.y - 110) / (WORLD.height - 300)));
      const currentDepth = Math.round(depthRatio * level.maxDepth);
      const zoneIndex = Math.min(2, Math.floor(depthRatio * 3));
      const currentZone = level.depthNames[zoneIndex];
      if (currentDepth !== lastDepthMeters) { lastDepthMeters = currentDepth; setDepthMeters(currentDepth); }
      if (currentZone !== lastDepthZone) { lastDepthZone = currentZone; setDepthZone(currentZone); }

      const isFeeding = !menuOpenRef.current && (keys.has('f') || touchInput.current.feeding);
      feedCooldown -= dt;
      if (isFeeding && feedCooldown <= 0) {
        feedCooldown = 24;
        for (let i = 0; i < 4; i += 1) {
          food.push({
            x: player.x + player.facing * (38 + i * 6),
            y: player.y - 12 + i * 7,
            vx: player.facing * (0.3 + i * 0.04),
            vy: 0.08 + i * 0.025,
            life: 520,
          });
        }
      }
      if (isFeeding !== lastFeeding) { lastFeeding = isFeeding; setFeeding(isFeeding); }
      for (let i = food.length - 1; i >= 0; i -= 1) {
        const pellet = food[i];
        pellet.vx *= Math.pow(0.985, dt);
        pellet.vy = Math.min(0.48, pellet.vy + 0.004 * dt);
        pellet.x += pellet.vx * dt;
        pellet.y += pellet.vy * dt;
        pellet.life -= dt;
        if (pellet.life <= 0 || pellet.y > WORLD.height - 145) food.splice(i, 1);
      }

      fish.forEach((f) => {
        f.happy = Math.max(0, f.happy - dt);
        f.biteCooldown = Math.max(0, f.biteCooldown - dt);
        const behavior = ANIMAL_BEHAVIORS[f.kind];
        const motionContext = { time, dt };
        behavior.updateNaturalMotion(f, motionContext);
        const dx = f.x - player.x;
        const dy = f.y - player.y;
        const distance = Math.hypot(dx, dy);
        const safeDistance = Math.max(distance, 1);

        if (behavior.allowsSocialResponse && f.temperament === 'curious' && distance < CURIOUS_FOLLOW_RADIUS) {
          if (distance > 74) {
            f.vx += (-dx / safeDistance) * 0.022 * dt;
            f.vy += (-dy / safeDistance) * 0.02 * dt;
          } else {
            f.vx *= Math.pow(0.97, dt);
            f.vy *= Math.pow(0.97, dt);
          }
        } else if (behavior.allowsSocialResponse && f.temperament === 'playful' && distance < 280) {
          f.vx += ((-dx / safeDistance) * 0.009 + (-dy / safeDistance) * 0.012) * dt;
          f.vy += ((-dy / safeDistance) * 0.009 + (dx / safeDistance) * 0.012) * dt;
        } else if (behavior.allowsSocialResponse && f.temperament === 'shy' && distance < 175) {
          f.vx += (dx / safeDistance) * 0.048 * dt;
          f.vy += (dy / safeDistance) * 0.036 * dt;
        } else if (behavior.allowsSocialResponse && f.temperament === 'calm' && distance < 105) {
          f.vx += (dx / safeDistance) * 0.012 * dt;
          f.vy += (dy / safeDistance) * 0.009 * dt;
        }
        if (behavior.allowsFeeding && food.length && Math.sin(f.phase * 2.17) > -0.72) {
          const nearestFood = food.reduce<{ pellet: FoodPellet | null; distance: number; index: number }>((best, pellet, index) => {
            const pelletDistance = Math.hypot(pellet.x - f.x, pellet.y - f.y);
            return pelletDistance < best.distance ? { pellet, distance: pelletDistance, index } : best;
          }, { pellet: null, distance: Infinity, index: -1 });
          if (nearestFood.pellet && nearestFood.distance < 560) {
            const foodDx = nearestFood.pellet.x - f.x;
            const foodDy = nearestFood.pellet.y - f.y;
            const appetite = f.temperament === 'curious' ? 1.18 : f.temperament === 'playful' ? 1.08 : f.temperament === 'sleepy' ? 0.58 : f.temperament === 'shy' ? 0.78 : 1;
            f.vx += (foodDx / Math.max(nearestFood.distance, 1)) * 0.013 * appetite * dt;
            f.vy += (foodDy / Math.max(nearestFood.distance, 1)) * 0.019 * appetite * dt;
            if (nearestFood.distance < Math.max(14, f.size * 0.42) && f.biteCooldown <= 0) {
              food.splice(nearestFood.index, 1);
              f.happy = 100;
              f.biteCooldown = 42;
              snackCount += 1;
              setSnacksShared(snackCount);
              setFeedingMessage(`${f.name} enjoyed a bite`);
              feedNotice = 135;
            }
          }
        }
        const isFollowing = behavior.allowsSocialResponse && f.temperament === 'curious' && distance < CURIOUS_FOLLOW_RADIUS;
        behavior.move(f, motionContext, isFollowing);
      });
      if (feedNotice > 0) {
        feedNotice -= dt;
        if (feedNotice <= 0) setFeedingMessage('');
      }

      const closestFish = fish.reduce<{ fish: Fish | null; distance: number }>((best, candidate) => {
        const distance = Math.hypot(candidate.x - player.x, candidate.y - player.y);
        return distance < best.distance ? { fish: candidate, distance } : best;
      }, { fish: null, distance: Infinity });
      const creatureName = closestFish.fish && closestFish.distance < 125 ? closestFish.fish.name : '';
      if (creatureName && !seen.has(creatureName)) {
        seen.add(creatureName);
        const creatures = { ...journalRef.current.creatures, [level.id]: Array.from(seen) };
        const nextJournal = { ...journalRef.current, creatures };
        journalRef.current = nextJournal;
        setJournal(nextJournal);
        writeJournal(nextJournal);
        setDiscovered(Array.from(seen));
      }
      const creatureLabel = closestFish.fish && closestFish.distance < 125
        ? `${closestFish.fish.temperament} · ${closestFish.fish.name}`
        : '';
      if (creatureLabel !== lastCreature) { lastCreature = creatureLabel; setNearbyCreature(creatureLabel); }

      const nearest = algae.reduce<{ patch: Algae | null; distance: number }>((best, patch) => {
        const distance = Math.hypot(patch.x - player.x, patch.y - player.y);
        return patch.amount > 0.02 && distance < best.distance ? { patch, distance } : best;
      }, { patch: null, distance: Infinity });
      const isNear = nearest.distance < 105;
      const cleaning = !menuOpenRef.current && isNear && (keys.has(' ') || touchInput.current.cleaning);
      if (cleaning && nearest.patch) {
        nearest.patch.amount = Math.max(0, nearest.patch.amount - 0.008 * dt);
        if (nearest.patch.amount < 0.02) nearest.patch.amount = 0;
      }

      const progress = Math.round((1 - algae.reduce((sum, patch) => sum + patch.amount, 0) / algae.length) * 100);
      if (progress !== lastProgress) { lastProgress = progress; setCleaned(progress); }
      if (isNear !== lastNear) { lastNear = isNear; setNearAlgae(isNear); }

      const ocean = ctx.createLinearGradient(0, 0, 0, rect.height);
      ocean.addColorStop(0, level.colors[0]);
      ocean.addColorStop(0.48, level.colors[1]);
      ocean.addColorStop(1, level.colors[2]);
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.save();
      ctx.translate(-camera.x, -camera.y);
      for (let i = 0; i < (level.id === 'deepsea' || level.id === 'vents' ? 0 : 9); i += 1) {
        ctx.fillStyle = `rgba(225, 255, 245, ${(0.07 + (i % 2) * 0.025) * (1 - depthRatio * 0.82)})`;
        ctx.beginPath();
        ctx.moveTo(i * 390 - 180, 0);
        ctx.lineTo(i * 390 + 75, 0);
        ctx.lineTo(i * 390 + 500, WORLD.height);
        ctx.lineTo(i * 390 + 260, WORLD.height);
        ctx.fill();
      }

      drawBackgroundFormations(ctx, level, time);

      ctx.fillStyle = level.id === 'deepsea' ? 'rgba(117, 241, 210, .48)' : 'rgba(218, 249, 234, .34)';
      for (let i = 0; i < 70; i += 1) {
        const bx = (i * 173 + time * (0.009 + (i % 3) * 0.004)) % WORLD.width;
        const by = 70 + ((i * 113 - time * 0.016) % (WORLD.height - 190) + (WORLD.height - 190)) % (WORLD.height - 190);
        ctx.beginPath();
        ctx.arc(bx, by, 1.5 + (i % 4), 0, Math.PI * 2);
        ctx.fill();
      }

      drawEnvironment(ctx, level, time);
      algae.forEach((patch) => {
        if (patch.amount <= 0.01) return;
        ctx.fillStyle = `rgba(${level.growth}, ${0.13 + patch.amount * 0.42})`;
        for (let i = 0; i < 7; i += 1) {
          const angle = i * 2.4;
          ctx.beginPath();
          ctx.arc(patch.x + Math.cos(angle) * patch.size * 0.28, patch.y + Math.sin(angle) * patch.size * 0.2, patch.size * (0.25 + (i % 3) * 0.08) * patch.amount, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      food.forEach((pellet, index) => {
        const shimmer = 0.72 + Math.sin(time * 0.008 + index) * 0.18;
        ctx.fillStyle = `rgba(244, 211, 116, ${shimmer})`;
        ctx.shadowColor = 'rgba(255, 226, 137, .55)';
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.arc(pellet.x, pellet.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      fish.forEach((f) => {
        drawFish(ctx, f, time);
        drawHappyReaction(ctx, f);
      });
      drawDiver(ctx, player.x, player.y, player.facing, cleaning, time);

      if (cleaning && nearest.patch) {
        ctx.fillStyle = 'rgba(255, 246, 180, .85)';
        for (let i = 0; i < 5; i += 1) {
          const angle = time * 0.008 + i * 1.26;
          ctx.beginPath();
          ctx.arc(nearest.patch.x + Math.cos(angle) * 38, nearest.patch.y + Math.sin(angle) * 30, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      ctx.fillStyle = `rgba(3, 10, 27, ${depthRatio * 0.3})`;
      ctx.fillRect(0, 0, rect.width, rect.height);

      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.clearTimeout(introTimer);
    };
  }, [level]);

  useEffect(() => () => {
    if (!audioRef.current) return;
    window.clearInterval(audioRef.current.timer);
    void audioRef.current.context.close();
  }, []);

  const journalHabitat = LEVELS[journalPage];
  const journalCreatures = new Set(journal.creatures[journalHabitat.id] ?? []);
  const totalCreatureEntries = LEVELS.reduce((sum, habitat) => sum + (journal.creatures[habitat.id]?.length ?? 0), 0);
  const totalCreatureCount = LEVELS.reduce((sum, habitat) => sum + habitat.species.length, 0);

  return (
    <main className="game-shell">
      <canvas ref={canvasRef} className="aquarium" aria-label="A cozy aquarium where you can swim among fish and clean algae" />
      <header className="game-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">○</span>
          <div><h1>Drift &amp; Dapple</h1><p>aquarium care</p></div>
        </div>
        <div className="tank-label"><span /> {level.name} · {level.moment}</div>
        <button className={`sound-button ${soundOn ? 'active' : ''}`} type="button" onClick={toggleSound} aria-label={soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on'}>{soundOn ? '♫' : '♪'}</button>
      </header>

      <aside className="care-card" aria-live="polite">
        <div className="care-row"><span>Tank care</span><strong>{cleaned}%</strong></div>
        <div className="progress-track"><span style={{ width: `${cleaned}%` }} /></div>
        <p>{cleaned >= 100 ? 'This habitat feels fresh and bright.' : level.note}</p>
      </aside>

      <aside className="field-card" aria-live="polite">
        <span className="eyebrow">Field notes</span>
        <strong>{discovered.length}<small> / {level.species.length} friends met</small></strong>
        <p>40 animals · 3 depth zones{snacksShared > 0 ? ` · ${snacksShared} snacks` : ''}</p>
        <div className="species-dots" aria-label={`${discovered.length} of ${level.species.length} species discovered`}>
          {level.species.map(({ name }) => <i key={name} className={discovered.includes(name) ? 'found' : ''} title={discovered.includes(name) ? name : 'Undiscovered'} />)}
        </div>
        <button className="journal-button" type="button" onClick={openJournal}><kbd>J</kbd> Open journal</button>
      </aside>

      <nav className="level-map" aria-label="Aquarium journey">
        {LEVELS.map((item, index) => <span key={item.id} className={index === levelIndex ? 'current' : index < levelIndex ? 'visited' : ''} title={item.name} />)}
      </nav>

      <aside className="depth-card" aria-live="polite">
        <div className="depth-copy"><span>Depth</span><strong>{depthMeters}<small> m</small></strong><p>{depthZone}</p></div>
        <div className="depth-line"><i style={{ top: `${Math.min(100, (depthMeters / level.maxDepth) * 100)}%` }} /></div>
      </aside>

      <div className={`creature-label ${nearbyCreature ? 'visible' : ''}`}>
        <span>friend nearby</span><strong>{nearbyCreature}</strong>
      </div>

      <div className={`clean-prompt ${nearAlgae ? 'visible' : ''}`}>
        <kbd>Space</kbd><span>hold to gently brush</span>
      </div>

      <div className={`feed-prompt ${feeding || feedingMessage ? 'visible' : ''}`} aria-live="polite">
        <span className="pellet-mark" aria-hidden="true">•••</span>
        <span>{feedingMessage || 'Nearby animals are following the food'}</span>
      </div>

      <div className="controls-card">
        <span><kbd>WASD</kbd> or <kbd>↑ ↓ ← →</kbd> to swim</span>
        <i />
        <span><kbd>Space</kbd> to brush</span>
        <i />
        <span><kbd>F</kbd> to feed</span>
        <i />
        <span><kbd>J</kbd> journal · <kbd>X</kbd> travel</span>
      </div>

      <button className="travel-button" type="button" onClick={openTravel} aria-label="Choose an aquarium to travel to">
        <kbd>X</kbd><span><small>aquarium map</small>Choose habitat</span>
      </button>

      <div className="touch-controls" aria-label="Touch controls">
        <div className="direction-pad">
          <button type="button" aria-label="Swim up" onPointerDown={() => setTouchDirection(0, -1)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>↑</button>
          <button type="button" aria-label="Swim left" onPointerDown={() => setTouchDirection(-1, 0)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>←</button>
          <button type="button" aria-label="Swim down" onPointerDown={() => setTouchDirection(0, 1)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>↓</button>
          <button type="button" aria-label="Swim right" onPointerDown={() => setTouchDirection(1, 0)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>→</button>
        </div>
        <div className="touch-actions">
          <button className="touch-journal-button" type="button" aria-label="Open field journal" onClick={openJournal}>journal</button>
          <button className="next-button" type="button" aria-label="Choose an aquarium to travel to" onClick={openTravel}>travel</button>
          <button className="feed-button" type="button" aria-label="Feed nearby animals" onPointerDown={() => { touchInput.current.feeding = true; }} onPointerUp={() => { touchInput.current.feeding = false; }} onPointerCancel={() => { touchInput.current.feeding = false; }}>feed</button>
          <button className="brush-button" type="button" aria-label="Gently brush algae" onPointerDown={() => { touchInput.current.cleaning = true; }} onPointerUp={() => { touchInput.current.cleaning = false; }} onPointerCancel={() => { touchInput.current.cleaning = false; }}>brush</button>
        </div>
      </div>

      <div className={`completion-card ${cleaned >= 100 ? 'visible' : ''}`} role="status">
        <span>✦</span><div><strong>{level.name} is glowing</strong><p>Stay awhile, or press X when you feel ready to wander on.</p></div>
      </div>

      <div className={`level-intro ${showLevelIntro ? 'visible' : ''}`} aria-live="polite">
        <span>Habitat {levelIndex + 1} of {LEVELS.length}</span>
        <strong>{level.name}</strong>
        <p>{level.moment} · three layers to explore</p>
      </div>
      {journalOpen && (
        <div className="journal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setJournalOpen(false); }}>
          <section className="journal-panel" role="dialog" aria-modal="true" aria-labelledby="journal-title">
            <header className="journal-header">
              <div><span>Saved on this device</span><h2 id="journal-title">Field journal</h2></div>
              <button type="button" onClick={() => setJournalOpen(false)} aria-label="Close field journal">×</button>
            </header>
            <div className="journal-totals">
              <p><strong>{totalCreatureEntries}</strong><span>of {totalCreatureCount}<br />creatures</span></p>
            </div>
            <nav className="journal-tabs" aria-label="Journal habitats">
              {LEVELS.map((habitat, index) => (
                <button key={habitat.id} type="button" aria-label={`Open ${habitat.name} journal page`} className={journalPage === index ? 'active' : ''} onClick={() => setJournalPage(index)}>
                  {index + 1}<span>{habitat.name}</span>
                </button>
              ))}
            </nav>
            <div className="journal-page">
              <div className="journal-page-title"><div><span>{journalHabitat.moment}</span><h3>{journalHabitat.name}</h3></div><p>{journalCreatures.size} of {journalHabitat.species.length} creatures</p></div>
              <div className="journal-columns">
                <section>
                  <h4>Creature sightings</h4>
                  <ol className="journal-list creature-list">
                    {journalHabitat.species.map((species) => {
                      const found = journalCreatures.has(species.name);
                      return <li key={species.name} className={found ? 'found' : ''}><span className="journal-swatch" style={{ background: found ? species.color : undefined }} /> <div><strong>{found ? species.name : 'Unrecorded creature'}</strong><small>{found ? species.kind : 'Swim nearby to meet it'}</small></div></li>;
                    })}
                  </ol>
                </section>
                <section>
                  <h4>Habitat layers</h4>
                  <ol className="habitat-layer-list">
                    {journalHabitat.depthNames.map((depth, index) => <li key={depth}><span>{index + 1}</span><strong>{depth}</strong></li>)}
                  </ol>
                  <div className="personality-note"><span>Animal moods</span><p><b>Curious</b> friends come closer and may follow. <b>Playful</b> ones loop around you, while sleepy, calm, and shy neighbors keep their own pace.</p></div>
                </section>
              </div>
            </div>
          </section>
        </div>
      )}
      {travelOpen && (
        <div className={`travel-backdrop ${travelClosing ? 'closing' : ''}`} onMouseDown={(event) => { if (event.currentTarget === event.target) closeTravel(); }}>
          <section className="travel-panel" role="dialog" aria-modal="true" aria-labelledby="travel-title">
            <header className="travel-header">
              <div><span>Aquarium map</span><h2 id="travel-title">Where would you like to swim?</h2></div>
              <button type="button" onClick={() => closeTravel()} aria-label="Close aquarium map">×</button>
            </header>
            <div className="travel-grid">
              {LEVELS.map((habitat, index) => {
                const sightings = journal.creatures[habitat.id]?.length ?? 0;
                const isCurrent = index === levelIndex;
                return (
                  <button key={habitat.id} type="button" className={isCurrent ? 'current' : ''} onClick={() => closeTravel(index)}>
                    <i className="travel-palette" style={{ background: `linear-gradient(135deg, ${habitat.colors[0]}, ${habitat.colors[2]})` }} />
                    <span className="travel-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="travel-copy"><small>{habitat.moment}</small><strong>{habitat.name}</strong><em>{habitat.depthNames.join(' · ')}</em></span>
                    <span className="travel-progress"><b>{sightings}</b>/{habitat.species.length}{isCurrent && <small>you are here</small>}</span>
                  </button>
                );
              })}
            </div>
            <p className="travel-hint"><kbd>X</kbd> or <kbd>Esc</kbd> closes the map</p>
          </section>
        </div>
      )}
    </main>
  );
}
