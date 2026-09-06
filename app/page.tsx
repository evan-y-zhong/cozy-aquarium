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
  kind: 'tang' | 'clown' | 'butterfly' | 'puffer' | 'ray' | 'jelly';
  phase: number;
  temperament: 'shy' | 'curious' | 'calm';
};

type Algae = { x: number; y: number; amount: number; size: number };

const WORLD = { width: 2800, height: 1050 };
const SPECIES = {
  tang: 'Blue tang',
  clown: 'Clownfish',
  butterfly: 'Butterflyfish',
  puffer: 'Honey puffer',
  ray: 'Reef ray',
  jelly: 'Moon jelly',
} as const;

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
    ctx.fillStyle = '#557e83';
    ctx.beginPath();
    ctx.moveTo(fish.size * 0.74, 0);
    ctx.quadraticCurveTo(0, -fish.size * 0.58, -fish.size * 0.82, 0);
    ctx.quadraticCurveTo(0, fish.size * 0.58, fish.size * 0.74, 0);
    ctx.fill();
    ctx.strokeStyle = '#557e83';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-fish.size * 0.7, 0);
    ctx.quadraticCurveTo(-fish.size * 1.2, fish.size * 0.15, -fish.size * 1.55, fish.size * 0.05);
    ctx.stroke();
    ctx.fillStyle = '#d8e4d4';
    ctx.beginPath();
    ctx.arc(fish.size * 0.35, -fish.size * 0.08, 2.4, 0, Math.PI * 2);
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
  ctx.ellipse(0, 0, fish.size * (fish.kind === 'puffer' ? 0.58 : 0.72), fish.size * (fish.kind === 'puffer' ? 0.55 : 0.42), 0, 0, Math.PI * 2);
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
  } else if (fish.kind !== 'puffer') {
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

function drawReef(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#326d75';
  ctx.beginPath();
  ctx.moveTo(0, 900);
  for (let x = 0; x <= WORLD.width; x += 90) {
    ctx.lineTo(x, 880 + Math.sin(x * 0.009) * 28);
  }
  ctx.lineTo(WORLD.width, WORLD.height);
  ctx.lineTo(0, WORLD.height);
  ctx.fill();

  for (let x = 80; x < WORLD.width; x += 190) {
    const h = 70 + ((x * 17) % 100);
    ctx.strokeStyle = x % 380 ? '#3e8f7e' : '#7fae72';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, 910);
    ctx.bezierCurveTo(x - 25, 860, x + 28, 820, x + Math.sin(x) * 18, 910 - h);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(194, 229, 145, .36)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  const coral = [
    [310, 900, '#f18b78'], [740, 910, '#e6a96f'], [1230, 895, '#d87882'],
    [1700, 915, '#d799bd'], [2240, 900, '#ef9a75'], [2600, 905, '#ddbb6a'],
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
  const touchInput = useRef({ x: 0, y: 0, cleaning: false });
  const audioRef = useRef<{ context: AudioContext; gain: GainNode; timer: number } | null>(null);
  const [cleaned, setCleaned] = useState(0);
  const [nearAlgae, setNearAlgae] = useState(false);
  const [nearbyCreature, setNearbyCreature] = useState('');
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(false);

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

    const player = { x: 470, y: 500, vx: 0, vy: 0, facing: 1 };
    const camera = { x: 0, y: 0 };
    const keys = new Set<string>();
    const kinds: Fish['kind'][] = ['clown', 'tang', 'butterfly', 'puffer', 'ray', 'jelly'];
    const fish: Fish[] = Array.from({ length: 27 }, (_, i) => ({
      x: 180 + ((i * 347) % 2450),
      y: 180 + ((i * 137) % 570),
      vx: (i % 2 ? -1 : 1) * (0.28 + (i % 4) * 0.07),
      vy: 0,
      size: kinds[i % kinds.length] === 'ray' ? 45 + (i % 3) * 7 : 22 + (i % 5) * 4,
      color: i % 3 === 0 ? '#ef8b62' : i % 3 === 1 ? '#65b8b0' : '#f3cf69',
      accent: i % 2 ? '#315b83' : '#fff0ae',
      kind: kinds[i % kinds.length],
      phase: i * 1.7,
      temperament: i % 5 === 0 ? 'curious' : i % 3 === 0 ? 'shy' : 'calm',
    }));
    const algae: Algae[] = [
      { x: 620, y: 730, size: 62, amount: 1 },
      { x: 1050, y: 310, size: 52, amount: 1 },
      { x: 1510, y: 700, size: 68, amount: 1 },
      { x: 1980, y: 410, size: 58, amount: 1 },
      { x: 2440, y: 740, size: 72, amount: 1 },
    ];
    let frame = 0;
    let last = performance.now();
    let active = true;
    let lastProgress = -1;
    let lastNear = false;
    let lastCreature = '';
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
      player.y = Math.max(100, Math.min(850, player.y + player.vy * dt));
      if (Math.abs(player.vx) > 0.2) player.facing = player.vx > 0 ? 1 : -1;

      const targetCameraX = Math.max(0, Math.min(WORLD.width - rect.width, player.x - rect.width * 0.45));
      camera.x += (targetCameraX - camera.x) * 0.055;
      camera.y = Math.max(0, (WORLD.height - rect.height) * 0.4);

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
        if (f.y < 120 || f.y > 820) f.vy *= -1;
      });

      const closestFish = fish.reduce<{ fish: Fish | null; distance: number }>((best, candidate) => {
        const distance = Math.hypot(candidate.x - player.x, candidate.y - player.y);
        return distance < best.distance ? { fish: candidate, distance } : best;
      }, { fish: null, distance: Infinity });
      const creatureName = closestFish.fish && closestFish.distance < 125 ? SPECIES[closestFish.fish.kind] : '';
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

      const ocean = ctx.createLinearGradient(0, 0, 0, rect.height);
      ocean.addColorStop(0, '#53b8bd');
      ocean.addColorStop(0.48, '#247f8b');
      ocean.addColorStop(1, '#145567');
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.save();
      ctx.translate(-camera.x, -camera.y);
      for (let i = 0; i < 9; i += 1) {
        ctx.fillStyle = `rgba(225, 255, 245, ${0.07 + (i % 2) * 0.025})`;
        ctx.beginPath();
        ctx.moveTo(i * 390 - 180, 0);
        ctx.lineTo(i * 390 + 75, 0);
        ctx.lineTo(i * 390 + 500, WORLD.height);
        ctx.lineTo(i * 390 + 260, WORLD.height);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(218, 249, 234, .34)';
      for (let i = 0; i < 70; i += 1) {
        const bx = (i * 173 + time * (0.009 + (i % 3) * 0.004)) % WORLD.width;
        const by = 70 + ((i * 113 - time * 0.016) % 760 + 760) % 760;
        ctx.beginPath();
        ctx.arc(bx, by, 1.5 + (i % 4), 0, Math.PI * 2);
        ctx.fill();
      }

      drawReef(ctx);
      algae.forEach((patch) => {
        if (patch.amount <= 0.01) return;
        ctx.fillStyle = `rgba(70, 119, 76, ${0.13 + patch.amount * 0.42})`;
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

      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

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
        <div className="tank-label"><span /> Sunlit Reef · Morning</div>
        <button className={`sound-button ${soundOn ? 'active' : ''}`} type="button" onClick={toggleSound} aria-label={soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on'}>{soundOn ? '♫' : '♪'}</button>
      </header>

      <aside className="care-card" aria-live="polite">
        <div className="care-row"><span>Tank care</span><strong>{cleaned}%</strong></div>
        <div className="progress-track"><span style={{ width: `${cleaned}%` }} /></div>
        <p>{cleaned >= 100 ? 'The reef feels fresh and bright.' : 'Take your time. The fish don’t mind.'}</p>
      </aside>

      <aside className="field-card" aria-live="polite">
        <span className="eyebrow">Field notes</span>
        <strong>{discovered.length}<small> / 6 friends met</small></strong>
        <div className="species-dots" aria-label={`${discovered.length} of 6 species discovered`}>
          {Object.values(SPECIES).map((name) => <i key={name} className={discovered.includes(name) ? 'found' : ''} title={discovered.includes(name) ? name : 'Undiscovered'} />)}
        </div>
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
        <span>Find the soft green algae</span>
      </div>

      <div className="touch-controls" aria-label="Touch controls">
        <div className="direction-pad">
          <button type="button" aria-label="Swim up" onPointerDown={() => setTouchDirection(0, -1)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>↑</button>
          <button type="button" aria-label="Swim left" onPointerDown={() => setTouchDirection(-1, 0)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>←</button>
          <button type="button" aria-label="Swim down" onPointerDown={() => setTouchDirection(0, 1)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>↓</button>
          <button type="button" aria-label="Swim right" onPointerDown={() => setTouchDirection(1, 0)} onPointerUp={() => setTouchDirection(0, 0)} onPointerCancel={() => setTouchDirection(0, 0)}>→</button>
        </div>
        <button className="brush-button" type="button" aria-label="Gently brush algae" onPointerDown={() => { touchInput.current.cleaning = true; }} onPointerUp={() => { touchInput.current.cleaning = false; }} onPointerCancel={() => { touchInput.current.cleaning = false; }}>brush</button>
      </div>

      <div className={`completion-card ${cleaned >= 100 ? 'visible' : ''}`} role="status">
        <span>✦</span><div><strong>The reef is glowing</strong><p>Stay awhile. There’s nowhere else you need to be.</p></div>
      </div>
    </main>
  );
}
