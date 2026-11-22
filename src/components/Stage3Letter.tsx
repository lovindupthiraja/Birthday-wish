import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../utils/soundEngine';

interface Stage3LetterProps {
  untied: boolean;
  onUntie: () => void;
  onNext: () => void;
}

const SPARKLE_BURSTS = [
  { x: -58, y: -42, char: '✨', delay: 0 },
  { x: 58, y: -40, char: '🎀', delay: 0.04 },
  { x: -66, y: 26, char: '🩷', delay: 0.06 },
  { x: 64, y: 30, char: '✨', delay: 0.03 },
  { x: 0, y: -62, char: '🤍', delay: 0.05 },
];

export const Stage3Letter: React.FC<Stage3LetterProps> = ({
  untied,
  onUntie,
  onNext,
}) => {
  const [phase, setPhase] = useState<'tied' | 'untying' | 'flapOpen'>('tied');
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const handleTapBow = () => {
    if (untied || phase !== 'tied') return;
    soundEngine.playRibbonUntie();
    setPhase('untying');

    // Beat 2: Envelope flap lifts gracefully after ribbons uncurl & glide away
    const t1 = window.setTimeout(() => {
      setPhase('flapOpen');
    }, 680);

    // Beat 3: Letter rises and unfolds smoothly
    const t2 = window.setTimeout(() => {
      onUntie();
      setPhase('tied');
    }, 1150);

    timersRef.current.push(t1, t2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="w-full will-change-transform"
    >
      <AnimatePresence mode="wait">
        {!untied ? (
          <motion.div
            key="wrapped-envelope"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="coquette-card rounded-3xl p-5 flex flex-col items-center will-change-transform"
          >
            <p className="font-serif-coquette text-xl font-semibold text-[#4A2334] mb-3">
              A Ribbon-Tied Note
            </p>

            {/* Blush-pink Scalloped Envelope with Silky Lace Ribbons & Plush Bow */}
            <div
              className="relative w-full aspect-[4/3] max-w-[336px] rounded-[22px] bg-gradient-to-br from-[#FFE8F1] via-[#FFD4E4] to-[#FFC2D8] border-2 border-[#FFB2CE] shadow-[0_14px_32px_-10px_rgba(212,88,135,0.32)] flex items-center justify-center overflow-hidden"
              style={{ perspective: 900 }}
            >
              {/* Subtle dotted lace border inside envelope */}
              <div className="absolute inset-2 rounded-[16px] border border-dashed border-white/65 pointer-events-none" />

              {/* Inner letter peeking out during flapOpen */}
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={
                  phase === 'flapOpen'
                    ? { y: -20, opacity: 1, scale: 1.02 }
                    : { y: 16, opacity: 0 }
                }
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="absolute inset-x-6 top-5 bottom-6 rounded-xl bg-[#FFFDF9] border border-[#FFC2D8] shadow-md flex flex-col items-center justify-center gap-1"
              >
                <span className="font-hand-coquette text-2xl text-[#D45887]">
                  For Thenumi 🎀
                </span>
                <span className="text-[11px] font-medium text-[#A46B80]">
                  Opening note...
                </span>
              </motion.div>

              {/* Envelope body pocket lines */}
              <svg
                viewBox="0 0 320 240"
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 240 L125 126 M320 240 L195 126"
                  stroke="#EB7CA4"
                  strokeWidth="1.4"
                  strokeOpacity="0.32"
                />
              </svg>

              {/* 3D Animated Top Envelope Flap */}
              <motion.div
                animate={
                  phase === 'flapOpen'
                    ? { rotateX: 165, opacity: 0.65 }
                    : { rotateX: 0, opacity: 1 }
                }
                transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'top center' }}
                className="absolute inset-x-0 top-0 h-[56%] pointer-events-none z-[2]"
              >
                <svg
                  viewBox="0 0 320 135"
                  className="w-full h-full drop-shadow-sm"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 2 L160 128 L318 2 Z"
                    fill="#FFF5F9"
                    fillOpacity="0.78"
                    stroke="#EB7CA4"
                    strokeWidth="1.8"
                    strokeOpacity="0.55"
                  />
                </svg>
              </motion.div>

              {/* Cute Stitched Horizontal Satin Ribbons (slide & uncurl softly outward) */}
              <motion.div
                animate={
                  phase !== 'tied'
                    ? { x: '-115%', scaleY: 0.78, opacity: 0 }
                    : { x: '0%', scaleY: 1, opacity: 1 }
                }
                transition={{ duration: 0.65, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 right-1/2 top-1/2 -translate-y-1/2 h-8 bg-gradient-to-b from-[#FFB4D0] via-[#EB7CA4] to-[#D45887] shadow-md border-y border-white/75 z-[3] flex items-center"
              >
                <div className="w-full h-[2px] border-t border-dashed border-white/75" />
              </motion.div>
              <motion.div
                animate={
                  phase !== 'tied'
                    ? { x: '115%', scaleY: 0.78, opacity: 0 }
                    : { x: '0%', scaleY: 1, opacity: 1 }
                }
                transition={{ duration: 0.65, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-8 bg-gradient-to-b from-[#FFB4D0] via-[#EB7CA4] to-[#D45887] shadow-md border-y border-white/75 z-[3] flex items-center"
              >
                <div className="w-full h-[2px] border-t border-dashed border-white/75" />
              </motion.div>

              {/* Cute Stitched Vertical Satin Ribbons */}
              <motion.div
                animate={
                  phase !== 'tied'
                    ? { y: '-115%', scaleX: 0.78, opacity: 0 }
                    : { y: '0%', scaleX: 1, opacity: 1 }
                }
                transition={{ duration: 0.65, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-0 bottom-1/2 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-[#FFB4D0] via-[#EB7CA4] to-[#D45887] shadow-md border-x border-white/75 z-[3] flex justify-center"
              >
                <div className="h-full w-[2px] border-l border-dashed border-white/75" />
              </motion.div>
              <motion.div
                animate={
                  phase !== 'tied'
                    ? { y: '115%', scaleX: 0.78, opacity: 0 }
                    : { y: '0%', scaleX: 1, opacity: 1 }
                }
                transition={{ duration: 0.65, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1/2 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-[#FFB4D0] via-[#EB7CA4] to-[#D45887] shadow-md border-x border-white/75 z-[3] flex justify-center"
              >
                <div className="h-full w-[2px] border-l border-dashed border-white/75" />
              </motion.div>

              {/* Sparkle & mini-heart pop burst when untied */}
              {phase === 'untying' &&
                SPARKLE_BURSTS.map((sp, i) => (
                  <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0.3, opacity: 1 }}
                    animate={{ x: sp.x, y: sp.y, scale: 1.15, opacity: 0 }}
                    transition={{
                      duration: 0.68,
                      delay: sp.delay,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="absolute z-20 text-lg pointer-events-none select-none"
                  >
                    {sp.char}
                  </motion.span>
                ))}

              {/* Plush Multi-Layered Coquette Satin Bow with Pearl Heart Charm */}
              <button
                type="button"
                onClick={handleTapBow}
                aria-label="Tap the bow to untie the ribbon and open the letter"
                className="relative z-10 w-44 h-36 flex flex-col items-center justify-center cursor-pointer focus-visible:outline-none"
              >
                <svg
                  viewBox="0 0 160 126"
                  className="w-36 h-28 overflow-visible drop-shadow-[0_8px_16px_rgba(212,88,135,0.38)]"
                >
                  <defs>
                    <linearGradient id="bowLoopGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFC7DC" />
                      <stop offset="55%" stopColor="#FF96BE" />
                      <stop offset="100%" stopColor="#EB7CA4" />
                    </linearGradient>
                    <linearGradient id="bowTailGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EB7CA4" />
                      <stop offset="100%" stopColor="#D45887" />
                    </linearGradient>
                  </defs>

                  {/* Flowing Swallowtail Left Tail */}
                  <motion.path
                    d="M75 58 C62 80, 44 96, 26 112 L38 106 L44 117 C58 98, 69 80, 79 62 Z"
                    fill="url(#bowTailGrad)"
                    stroke="#FFF7FA"
                    strokeWidth="1.4"
                    animate={
                      phase !== 'tied'
                        ? { x: -38, y: 28, rotate: -26, opacity: 0 }
                        : { x: 0, y: 0, rotate: [0, -2.5, 0], opacity: 1 }
                    }
                    transition={
                      phase !== 'tied'
                        ? { duration: 0.62, ease: [0.16, 1, 0.3, 1] }
                        : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
                    }
                    style={{ transformOrigin: '76px 58px' }}
                  />
                  {/* Flowing Swallowtail Right Tail */}
                  <motion.path
                    d="M85 58 C98 80, 116 96, 134 112 L122 106 L116 117 C102 98, 91 80, 81 62 Z"
                    fill="url(#bowTailGrad)"
                    stroke="#FFF7FA"
                    strokeWidth="1.4"
                    animate={
                      phase !== 'tied'
                        ? { x: 38, y: 28, rotate: 26, opacity: 0 }
                        : { x: 0, y: 0, rotate: [0, 2.5, 0], opacity: 1 }
                    }
                    transition={
                      phase !== 'tied'
                        ? { duration: 0.62, ease: [0.16, 1, 0.3, 1] }
                        : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
                    }
                    style={{ transformOrigin: '84px 58px' }}
                  />

                  {/* Left Plush Bow Loop + Inner Glossy Fold */}
                  <motion.g
                    animate={
                      phase !== 'tied'
                        ? { x: -34, y: -12, rotate: -26, scale: 0.84, opacity: 0 }
                        : { x: 0, y: 0, rotate: [0, -2.2, 0], scale: 1, opacity: 1 }
                    }
                    transition={
                      phase !== 'tied'
                        ? { duration: 0.56, delay: 0.05, ease: [0.16, 1, 0.3, 1] }
                        : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
                    }
                    style={{ transformOrigin: '78px 54px' }}
                  >
                    <path
                      d="M78 52 C56 14, 12 14, 14 44 C16 74, 54 69, 78 58 Z"
                      fill="url(#bowLoopGrad)"
                      stroke="#FFFDF9"
                      strokeWidth="2.2"
                    />
                    <path
                      d="M72 53 C54 30, 26 30, 26 45 C26 59, 52 58, 72 55 Z"
                      fill="#FFE4EF"
                      fillOpacity="0.6"
                    />
                    <path
                      d="M74 54 C59 49, 44 47, 36 47"
                      stroke="#D45887"
                      strokeWidth="1.4"
                      strokeOpacity="0.45"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </motion.g>

                  {/* Right Plush Bow Loop + Inner Glossy Fold */}
                  <motion.g
                    animate={
                      phase !== 'tied'
                        ? { x: 34, y: -12, rotate: 26, scale: 0.84, opacity: 0 }
                        : { x: 0, y: 0, rotate: [0, 2.2, 0], scale: 1, opacity: 1 }
                    }
                    transition={
                      phase !== 'tied'
                        ? { duration: 0.56, delay: 0.05, ease: [0.16, 1, 0.3, 1] }
                        : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
                    }
                    style={{ transformOrigin: '82px 54px' }}
                  >
                    <path
                      d="M82 52 C104 14, 148 14, 146 44 C144 74, 106 69, 82 58 Z"
                      fill="url(#bowLoopGrad)"
                      stroke="#FFFDF9"
                      strokeWidth="2.2"
                    />
                    <path
                      d="M88 53 C106 30, 134 30, 134 45 C134 59, 108 58, 88 55 Z"
                      fill="#FFE4EF"
                      fillOpacity="0.6"
                    />
                    <path
                      d="M86 54 C101 49, 116 47, 124 47"
                      stroke="#D45887"
                      strokeWidth="1.4"
                      strokeOpacity="0.45"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </motion.g>

                  {/* Center Satin Knot + Pearl Heart Charm */}
                  <motion.g
                    animate={
                      phase !== 'tied'
                        ? { scale: 1.35, opacity: 0 }
                        : { scale: [1, 1.05, 1], opacity: 1 }
                    }
                    transition={
                      phase !== 'tied'
                        ? { duration: 0.36, ease: 'easeOut' }
                        : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                    }
                    style={{ transformOrigin: '80px 55px' }}
                  >
                    <rect
                      x="68"
                      y="43"
                      width="24"
                      height="24"
                      rx="9"
                      fill="#EB7CA4"
                      stroke="#FFFDF9"
                      strokeWidth="2.2"
                    />
                    {/* Tiny pearl heart charm */}
                    <path
                      d="M80 61 C80 61, 73 56.5, 73 52.5 C73 50.2, 75 48.8, 77.2 49.5 C78.5 49.9, 79.5 51, 80 51.8 C80.5 51, 81.5 49.9, 82.8 49.5 C85 48.8, 87 50.2, 87 52.5 C87 56.5, 80 61, 80 61 Z"
                      fill="#FFFDF9"
                    />
                  </motion.g>
                </svg>

                {phase === 'tied' && (
                  <span className="px-3 py-1 rounded-full bg-white/95 border border-[#FFC2D8] text-[10px] font-bold uppercase tracking-wider text-[#D45887] shadow-sm -mt-1">
                    Tap bow to untie
                  </span>
                )}
              </button>
            </div>

            <p className="mt-4 text-xs font-medium text-[#8C566B]">
              Untie the pink bow to unfold what&apos;s inside
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="unfolded-letter"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="coquette-card rounded-3xl p-4 sm:p-5 flex flex-col will-change-transform"
          >
            {/* Handwritten Lined Letter Paper */}
            <div className="letter-paper rounded-2xl border border-[#FFC2D8] p-5 shadow-inner relative">
              <div className="flex items-center justify-between mb-3">
                <span className="font-hand-coquette text-lg font-semibold text-[#D45887]">
                  For Thenumi 🎀
                </span>
                <span className="text-xs font-medium text-[#A46B80]">
                  15th ✨
                </span>
              </div>

              <div className="font-hand-coquette text-[20px] leading-[32px] text-[#4A2334] space-y-3">
                <p>Happy 15th Birthday, Thenumi!</p>
                <p>
                  Wishing you a year full of soft mornings, genuine laughs, good
                  vibes, and everything you&apos;ve been quietly hoping for.
                </p>
                <p className="text-right pt-1 text-[#D45887]">
                  — With lots of birthday wishes 🎀
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => {
                soundEngine.playTransition();
                onNext();
              }}
              className="btn-spring mt-4 w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#EB7CA4] to-[#D45887] hover:brightness-105 text-white font-semibold text-base shadow-[0_10px_24px_-8px_rgba(212,88,135,0.55)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Time for Cake 🎂</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
