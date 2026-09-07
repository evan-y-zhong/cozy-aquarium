'use client';

import { useEffect, useRef, useState } from 'react';

type Fish = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  accent: string;
  kind: 'tang' | 'clown' | 'butterfly' | 'puffer' | 'ray' | 'jelly' | 'angelfish' | 'eel' | 'seahorse' | 'shark' | 'angler' | 'koi';
  phase: number;
  temperament: 'shy' | 'curious' | 'calm';
  name: string;
};

type Algae = { x: number; y: number; amount: number; size: number };

type Level = {
  id: 'freshwater' | 'mangrove' | 'saltwater' | 'kelp' | 'openocean' | 'polar' | 'deepsea' | 'vents';
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

const WORLD = { width: 2800, height: 2400 };
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
    name: 'Sunlit Reef',
    moment: 'Noon',
    note: 'Brush the coral shelves until they glow.',
    depthNames: ['Coral crest', 'Blue reef wall', 'Sandy lagoon'],
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

  if (fish.kind === 'jelly') {
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
    for (let x = 55; x < WORLD.width; x += 105) {
      const h = 520 + ((x * 13) % 780);
      const sway = Math.sin(time * 0.0007 + x) * 32;
      ctx.strokeStyle = x % 210 ? '#597b48' : '#719253';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.bezierCurveTo(x - 40, floorY - h * 0.35, x + sway + 30, floorY - h * 0.72, x + sway, floorY - h);
      ctx.stroke();
      ctx.fillStyle = 'rgba(152, 174, 87, .58)';
      ctx.beginPath();
      ctx.ellipse(x + sway - 10, floorY + 20 - h, 34, 14, -0.4, 0, Math.PI * 2);
      ctx.fill();
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
  } else if (level.id === 'saltwater') {
    for (let x = 80; x < WORLD.width; x += 190) {
      const h = 70 + ((x * 17) % 100);
      ctx.strokeStyle = x % 380 ? '#3e8f7e' : '#7fae72';
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

  if (level.id !== 'saltwater') return;
  const coral = [
    [310, floorY, '#f18b78'], [740, 780, '#e6a96f'], [1230, floorY, '#d87882'],
    [1700, 2050, '#d799bd'], [2240, 1280, '#ef9a75'], [2600, floorY, '#ddbb6a'],
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
  const touchInput = useRef({ x: 0, y: 0, cleaning: false, next: false });
  const audioRef = useRef<{ context: AudioContext; gain: GainNode; timer: number } | null>(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [cleaned, setCleaned] = useState(0);
  const [nearAlgae, setNearAlgae] = useState(false);
  const [nearbyCreature, setNearbyCreature] = useState('');
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(false);
  const [nextProgress, setNextProgress] = useState(0);
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [depthMeters, setDepthMeters] = useState(0);
  const [depthZone, setDepthZone] = useState('');
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setCleaned(0);
    setNearAlgae(false);
    setNearbyCreature('');
    setDiscovered([]);
    setNextProgress(0);
    setShowLevelIntro(true);
    setDepthMeters(0);
    setDepthZone(level.depthNames[0]);
    const introTimer = window.setTimeout(() => setShowLevelIntro(false), 2200);
    const player = { x: 470, y: 280, vx: 0, vy: 0, facing: 1 };
    const camera = { x: 0, y: 0 };
    const keys = new Set<string>();
    const species = level.species;
    const fish: Fish[] = Array.from({ length: 40 }, (_, i) => ({
      x: 180 + ((i * 347) % 2450),
      y: 260 + (i % 3) * 650 + ((i * 173) % 390),
      vx: (i % 2 ? -1 : 1) * (0.28 + (i % 4) * 0.07),
      vy: 0,
      size: (['ray', 'shark'].includes(species[i % species.length].kind) ? 42 + (i % 3) * 6 : 20 + (i % 5) * 3.5) * (species[i % species.length].scale ?? 1),
      color: species[i % species.length].color,
      accent: species[i % species.length].accent,
      kind: species[i % species.length].kind,
      name: species[i % species.length].name,
      phase: i * 1.7,
      temperament: i % 5 === 0 ? 'curious' : i % 3 === 0 ? 'shy' : 'calm',
    }));
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
    let frame = 0;
    let last = performance.now();
    let active = true;
    let lastProgress = -1;
    let lastNear = false;
    let lastCreature = '';
    let levelHold = 0;
    let lastLevelHold = -1;
    let lastDepthMeters = -1;
    let lastDepthZone = '';
    const seen = new Set<string>();

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
      if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
      if (keys.has('d') || keys.has('arrowright')) mx += 1;
      if (keys.has('w') || keys.has('arrowup')) my -= 1;
      if (keys.has('s') || keys.has('arrowdown')) my += 1;
      mx += touchInput.current.x;
      my += touchInput.current.y;
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

      fish.forEach((f) => {
        const dx = f.x - player.x;
        const dy = f.y - player.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 155) {
          const reaction = f.temperament === 'curious' ? -0.012 : f.temperament === 'shy' ? 0.045 : 0.02;
          f.vx += (dx / Math.max(distance, 1)) * reaction * dt;
          f.vy += (dy / Math.max(distance, 1)) * reaction * 0.72 * dt;
        }
        f.vy += Math.sin(time * 0.001 + f.phase) * 0.002;
        f.vx = Math.max(-0.9, Math.min(0.9, f.vx));
        f.vy *= 0.98;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        if (f.x < 80 || f.x > WORLD.width - 80) f.vx *= -1;
        if (f.y < 160 || f.y > WORLD.height - 210) f.vy *= -1;
      });

      const closestFish = fish.reduce<{ fish: Fish | null; distance: number }>((best, candidate) => {
        const distance = Math.hypot(candidate.x - player.x, candidate.y - player.y);
        return distance < best.distance ? { fish: candidate, distance } : best;
      }, { fish: null, distance: Infinity });
      const creatureName = closestFish.fish && closestFish.distance < 125 ? closestFish.fish.name : '';
      if (creatureName && !seen.has(creatureName)) {
        seen.add(creatureName);
        setDiscovered(Array.from(seen));
      }
      if (creatureName !== lastCreature) { lastCreature = creatureName; setNearbyCreature(creatureName); }

      const nearest = algae.reduce<{ patch: Algae | null; distance: number }>((best, patch) => {
        const distance = Math.hypot(patch.x - player.x, patch.y - player.y);
        return patch.amount > 0.02 && distance < best.distance ? { patch, distance } : best;
      }, { patch: null, distance: Infinity });
      const isNear = nearest.distance < 105;
      const cleaning = isNear && (keys.has(' ') || touchInput.current.cleaning);
      if (cleaning && nearest.patch) {
        nearest.patch.amount = Math.max(0, nearest.patch.amount - 0.008 * dt);
        if (nearest.patch.amount < 0.02) nearest.patch.amount = 0;
      }

      const progress = Math.round((1 - algae.reduce((sum, patch) => sum + patch.amount, 0) / algae.length) * 100);
      if (progress !== lastProgress) { lastProgress = progress; setCleaned(progress); }
      if (isNear !== lastNear) { lastNear = isNear; setNearAlgae(isNear); }

      if (keys.has('x') || touchInput.current.next) {
        levelHold = Math.min(100, levelHold + 1.4 * dt);
      } else {
        levelHold = Math.max(0, levelHold - 2.5 * dt);
      }
      const roundedHold = Math.round(levelHold);
      if (roundedHold !== lastLevelHold) { lastLevelHold = roundedHold; setNextProgress(roundedHold); }
      if (levelHold >= 100) {
        active = false;
        setLevelIndex((current) => (current + 1) % LEVELS.length);
        return;
      }

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
      fish.forEach((f) => drawFish(ctx, f, time));
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
        <p>40 animals · 3 depth zones</p>
        <div className="species-dots" aria-label={`${discovered.length} of ${level.species.length} species discovered`}>
          {level.species.map(({ name }) => <i key={name} className={discovered.includes(name) ? 'found' : ''} title={discovered.includes(name) ? name : 'Undiscovered'} />)}
        </div>
      </aside>

      <nav className="level-map" aria-label="Aquarium journey">
        {LEVELS.map((item, index) => <span key={item.id} className={index === levelIndex ? 'current' : index < levelIndex ? 'visited' : ''} title={item.name} />)}
      </nav>

      <aside className="depth-card" aria-live="polite">
        <div className="depth-copy"><span>Depth</span><strong>{depthMeters}<small> m</small></strong><p>{depthZone}</p></div>
        <div className="depth-line"><i style={{ top: `${Math.min(100, (depthMeters / level.maxDepth) * 100)}%` }} /></div>
      </aside>

      <div className={`creature-label ${nearbyCreature ? 'visible' : ''}`}>
        <span>new friend nearby</span><strong>{nearbyCreature}</strong>
      </div>

      <div className={`clean-prompt ${nearAlgae ? 'visible' : ''}`}>
        <kbd>Space</kbd><span>hold to gently brush</span>
      </div>

      <div className="controls-card">
        <span><kbd>WASD</kbd> or <kbd>↑ ↓ ← →</kbd> to swim</span>
        <i />
        <span><kbd>Space</kbd> to brush</span>
        <i />
        <span><kbd>↓</kbd> dive deeper</span>
      </div>

      <div className={`next-card ${nextProgress > 0 ? 'holding' : ''}`}>
        <div className="next-copy"><kbd>X</kbd><span><small>hold to travel</small>{LEVELS[(levelIndex + 1) % LEVELS.length].name}</span></div>
        <div className="next-track"><span style={{ width: `${nextProgress}%` }} /></div>
      </div>

      <div className="touch-controls" aria-label="Touch controls">
        <div className="direction-pad">
          <button type="button" aria-label="Swim up" onPointerDown={() => setTouchDirection(0, -1)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>↑</button>
          <button type="button" aria-label="Swim left" onPointerDown={() => setTouchDirection(-1, 0)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>←</button>
          <button type="button" aria-label="Swim down" onPointerDown={() => setTouchDirection(0, 1)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>↓</button>
          <button type="button" aria-label="Swim right" onPointerDown={() => setTouchDirection(1, 0)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>→</button>
        </div>
        <div className="touch-actions">
          <button className="next-button" type="button" aria-label="Hold to travel to the next aquarium" onPointerDown={() => { touchInput.current.next = true; }} onPointerUp={() => { touchInput.current.next = false; }} onPointerCancel={() => { touchInput.current.next = false; }}>next</button>
          <button className="brush-button" type="button" aria-label="Gently brush algae" onPointerDown={() => { touchInput.current.cleaning = true; }} onPointerUp={() => { touchInput.current.cleaning = false; }} onPointerCancel={() => { touchInput.current.cleaning = false; }}>brush</button>
        </div>
      </div>

      <div className={`completion-card ${cleaned >= 100 ? 'visible' : ''}`} role="status">
        <span>✦</span><div><strong>{level.name} is glowing</strong><p>Stay awhile, or hold X when you feel ready to wander on.</p></div>
      </div>

      <div className={`level-intro ${showLevelIntro ? 'visible' : ''}`} aria-live="polite">
        <span>Habitat {levelIndex + 1} of {LEVELS.length}</span>
        <strong>{level.name}</strong>
        <p>{level.moment} · three layers to explore</p>
      </div>
      <div className="transition-wash" style={{ opacity: nextProgress / 100 }} />
    </main>
  );
}
