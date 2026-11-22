import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  color: string;
  kind: 'star' | 'dot' | 'confetti' | 'heart';
  w?: number;
  h?: number;
  gravity?: number;
}

const SPARKLE_COLORS = ['#FFB6D2', '#FF8BB8', '#FFF7FA', '#FFE3EE', '#EB7CA4'];
const CONFETTI_COLORS = ['#FF8BB8', '#FFC2D8', '#EB7CA4', '#D45887', '#FFFDF9', '#FFE3EE'];
const TRAIL_COLORS_LIGHT = ['#EB7CA4', '#FFC2D8', '#D45887', '#FFE3EE'];

/**
 * Full-screen non-blocking canvas overlay with an on-demand rAF loop:
 * Runs only while particles are active so idle frames cost 0% CPU/GPU on older phones.
 */
export const SparkleOverlay: React.FC<{
  confettiTrigger: number;
  burstPoint: { x: number; y: number; key: number } | null;
  darkMode?: boolean;
}> = ({ confettiTrigger, burstPoint, darkMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const startLoopRef = useRef<(() => void) | null>(null);

  // Spawn confetti burst when confettiTrigger increments
  useEffect(() => {
    if (confettiTrigger <= 0) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const centerX = w / 2;
    const originY = h * 0.38;

    for (let i = 0; i < 48; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8.5;
      particlesRef.current.push({
        x: centerX + (Math.random() - 0.5) * 80,
        y: originY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4.2,
        size: 6 + Math.random() * 6,
        w: 6 + Math.random() * 5,
        h: 4 + Math.random() * 4,
        alpha: 1,
        decay: 0.014 + Math.random() * 0.008,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.22,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        kind: i % 5 === 0 ? 'heart' : i % 3 === 0 ? 'star' : 'confetti',
        gravity: 0.22,
      });
    }
    startLoopRef.current?.();
  }, [confettiTrigger]);

  // Spawn sparkle burst at specific tap point
  useEffect(() => {
    if (!burstPoint) return;
    for (let i = 0; i < 32; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.4 + Math.random() * 5.8;
      particlesRef.current.push({
        x: burstPoint.x,
        y: burstPoint.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        size: 5 + Math.random() * 8,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.01,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.14,
        color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
        kind: i % 2 === 0 ? 'star' : 'dot',
        gravity: 0.04,
      });
    }
    startLoopRef.current?.();
  }, [burstPoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let rafId = 0;
    let running = false;

    const resize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const drawFourPointStar = (x: number, y: number, r: number, rot: number) => {
      const inner = r * 0.32;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = rot + (i * Math.PI) / 2;
        const nextA = a + Math.PI / 4;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
        ctx.lineTo(x + Math.cos(nextA) * inner, y + Math.sin(nextA) * inner);
      }
      ctx.closePath();
      ctx.fill();
    };

    const drawHeart = (x: number, y: number, size: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      const s = size * 0.55;
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(-s, -s * 0.4, -s * 1.1, s * 0.7, 0, s * 1.2);
      ctx.bezierCurveTo(s * 1.1, s * 0.7, s, -s * 0.4, 0, s * 0.35);
      ctx.fill();
      ctx.restore();
    };

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(2.2, Math.max(0.5, (now - lastTime) / 16.667));
      lastTime = now;

      ctx.clearRect(0, 0, vw, vh);
      const list = particlesRef.current;

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += (p.gravity ?? 0.03) * dt;
        p.vx *= 0.99;
        p.rotation += p.vRot * dt;
        p.alpha -= p.decay * dt;

        if (p.alpha <= 0) {
          list.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.kind === 'star') {
          drawFourPointStar(p.x, p.y, p.size, p.rotation);
        } else if (p.kind === 'heart') {
          drawHeart(p.x, p.y, p.size, p.rotation);
        } else if (p.kind === 'confetti') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillRect(-(p.w || 6) / 2, -(p.h || 4) / 2, p.w || 6, p.h || 4);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (list.length > 0) {
        rafId = requestAnimationFrame(render);
      } else {
        running = false;
        rafId = 0;
      }
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(render);
    };
    startLoopRef.current = startLoop;

    const spawnTrail = (x: number, y: number, count = 2) => {
      const palette = darkMode ? SPARKLE_COLORS : TRAIL_COLORS_LIGHT;
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 14,
          y: y + (Math.random() - 0.5) * 14,
          vx: (Math.random() - 0.5) * 1.4,
          vy: -0.6 - Math.random() * 1.2,
          size: 4 + Math.random() * 6,
          alpha: 0.95,
          decay: 0.032 + Math.random() * 0.02,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.12,
          color: palette[Math.floor(Math.random() * palette.length)],
          kind: Math.random() > 0.35 ? 'star' : 'dot',
          gravity: 0.02,
        });
      }
      if (particlesRef.current.length > 160) {
        particlesRef.current.splice(0, particlesRef.current.length - 160);
      }
      startLoop();
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawnRef.current < 38) return;
      lastSpawnRef.current = now;
      spawnTrail(e.clientX, e.clientY, 1);
    };

    const handlePointerDown = (e: PointerEvent) => {
      spawnTrail(e.clientX, e.clientY, 4);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Kick off once if particles were queued before mount effect ran
    if (particlesRef.current.length > 0) {
      startLoop();
    }

    return () => {
      startLoopRef.current = null;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
};

/**
 * Cute floating SVG coquette bow motif for background ambience
 */
const CoquetteBowSvg: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 44" fill="none" className={className}>
    <path
      d="M31 21C22 10 8 5 5 13C2 21 15 28 31 23C47 28 60 21 57 13C54 5 40 10 31 21Z"
      fill="#FFC2D8"
      stroke="#EB7CA4"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M29 23C25 31 19 37 14 40L21 41L27 31"
      stroke="#EB7CA4"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M33 23C37 31 43 37 48 40L41 41L35 31"
      stroke="#EB7CA4"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="31" cy="22" r="4.5" fill="#FFE3EE" stroke="#EB7CA4" strokeWidth="2" />
  </svg>
);

const AMBIENT_ITEMS = [
  { id: 1, type: 'bow', top: '8%', left: '8%', size: 'w-9', delay: '0s', opacity: 'opacity-45' },
  { id: 2, type: 'sparkle', top: '16%', right: '10%', size: 'w-5', delay: '1.1s', opacity: 'opacity-60' },
  { id: 3, type: 'bow', top: '42%', right: '6%', size: 'w-8', delay: '2.2s', opacity: 'opacity-35' },
  { id: 4, type: 'sparkle', top: '58%', left: '7%', size: 'w-4', delay: '0.6s', opacity: 'opacity-55' },
  { id: 5, type: 'bow', bottom: '16%', left: '10%', size: 'w-10', delay: '1.8s', opacity: 'opacity-40' },
  { id: 6, type: 'sparkle', bottom: '24%', right: '12%', size: 'w-5', delay: '2.9s', opacity: 'opacity-55' },
];

const STAR_ITEMS = [
  { top: '9%', left: '14%', size: 4, delay: '0s' },
  { top: '14%', left: '78%', size: 6, delay: '0.7s' },
  { top: '22%', left: '42%', size: 3, delay: '1.4s' },
  { top: '28%', left: '86%', size: 5, delay: '0.4s' },
  { top: '34%', left: '18%', size: 5, delay: '1.9s' },
  { top: '44%', left: '72%', size: 4, delay: '1.1s' },
  { top: '54%', left: '11%', size: 6, delay: '0.2s' },
  { top: '62%', left: '84%', size: 3, delay: '1.6s' },
  { top: '71%', left: '28%', size: 5, delay: '0.9s' },
  { top: '78%', left: '66%', size: 4, delay: '2.1s' },
  { top: '86%', left: '16%', size: 4, delay: '1.3s' },
  { top: '89%', left: '80%', size: 5, delay: '0.5s' },
];

export const AmbientBackground: React.FC<{ nightMode: boolean }> = ({ nightMode }) => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        background: nightMode
          ? 'radial-gradient(circle at 50% 35%, #2A1324 0%, #1B0B17 55%, #140812 100%)'
          : 'radial-gradient(circle at 18% 12%, #FFE3EE 0%, #FFF7FA 48%, #FFEAF2 100%)',
      }}
    >
      {!nightMode ? (
        <>
          {/* Zero-cost radial-gradient soft pink ambient glow orbs (replaces heavy CSS blur-3xl) */}
          <div
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255,194,216,0.42) 0%, rgba(255,194,216,0) 70%)',
            }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(235,124,164,0.28) 0%, rgba(235,124,164,0) 70%)',
            }}
          />
          {AMBIENT_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`absolute animate-float-slow ${item.opacity}`}
              style={{
                top: item.top,
                bottom: item.bottom,
                left: item.left,
                right: item.right,
                animationDelay: item.delay,
              }}
            >
              {item.type === 'bow' ? (
                <CoquetteBowSvg className={item.size} />
              ) : (
                <svg viewBox="0 0 24 24" className={`${item.size} text-[#EB7CA4]`} fill="currentColor">
                  <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
                </svg>
              )}
            </div>
          ))}
        </>
      ) : (
        <>
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(235,124,164,0.16) 0%, rgba(235,124,164,0) 70%)',
            }}
          />
          {STAR_ITEMS.map((star, idx) => (
            <div
              key={idx}
              className="absolute animate-twinkle text-[#FFD5E6]"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size * 3}px`,
                height: `${star.size * 3}px`,
                animationDelay: star.delay,
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
              </svg>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
