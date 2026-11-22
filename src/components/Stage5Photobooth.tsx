import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  CameraOff,
  Download,
  ImagePlus,
  RotateCcw,
  Sparkles,
  Check,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react';
import {
  FilterId,
  FrameStyleId,
  PlacedEmoji,
  StickerId,
} from '../types';
import {
  PHOTO_W,
  PHOTO_H,
  applyPixelFilter,
  drawDemoPortrait,
  exportIgStoryPng,
} from '../utils/photoboothCanvas';
import { soundEngine } from '../utils/soundEngine';

interface Stage5PhotoboothProps {
  onFinish: () => void;
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'softpink', label: '🎀 Soft Pink' },
  { id: 'peachglow', label: '🌸 Peach Glow' },
  { id: 'fairydust', label: '🧚 Fairy Sparkle' },
  { id: 'y2k', label: '📷 Y2K Digicam' },
  { id: 'normal', label: 'Normal' },
  { id: 'pixel', label: '👾 Pixel' },
  { id: 'vector', label: '🎨 Vector Pop' },
  { id: 'bw', label: '🖤 Classic B&W' },
  { id: 'glitch', label: '📺 Glitch' },
];

const FRAME_STYLES: { id: FrameStyleId; label: string; previewClass: string }[] = [
  { id: 'classic', label: 'Classic', previewClass: 'bg-white border-[#FFC2D8]' },
  { id: 'blush', label: 'Blush', previewClass: 'bg-[#FFE3EE] border-[#EB7CA4]' },
  { id: 'gingham', label: 'Gingham', previewClass: 'bg-[#FFF5F9] border-[#EB7CA4]' },
  { id: 'holo', label: 'Holo', previewClass: 'bg-gradient-to-br from-[#FFE3EE] via-[#F3E5FF] to-[#FFF7D6] border-[#EB7CA4]' },
  { id: 'polka', label: 'Polka', previewClass: 'bg-[#FFFDF9] border-[#EB7CA4]' },
  { id: 'y2kblack', label: 'Y2K Dark', previewClass: 'bg-[#1E131B] border-[#EB7CA4] text-white' },
];

const STICKERS: { id: StickerId; label: string }[] = [
  { id: 'bows', label: '🎀 Bows' },
  { id: 'sparkles', label: '✨ Sparkles' },
  { id: '15th', label: '🎂 15th' },
  { id: 'iconic', label: '🤍 Iconic' },
];

// 120+ Emoji Library across categories + custom keyboard input
const EMOJI_BANK: { label: string; items: string[] }[] = [
  {
    label: '🎀 Coquette',
    items: [
      '🎀', '🩷', '🤍', '💕', '💖', '💗', '💓', '💞', '💘', '💝',
      '🩰', '🦢', '🌸', '🌷', '🌺', '🌹', '🦋', '🕊️', '💌', '🪞',
      '👑', '💎', '💍', '🧸', '🍰', '🧁', '🍓', '🍒', '🍑', '🍭',
    ],
  },
  {
    label: '🎂 Birthday',
    items: [
      '🎂', '🎉', '🎊', '🎈', '🎁', '🥳', '🕯️', '✨', '🌟', '💫',
      '⭐', '🥂', '🍾', '🎆', '🎇', '🪄', '🪩', '💃', '🎶', '🎵',
      '📸', '🎞️', '📹', '💿', '🎧', '1️⃣', '5️⃣', '🔞', '🏆', '🥇',
    ],
  },
  {
    label: '😍 Faces',
    items: [
      '🥹', '🥰', '😘', '😍', '🤩', '🥳', '😜', '🤪', '😝', '😛',
      '🤭', '🫣', '🤫', '😌', '😏', '😎', '🤓', '🧐', '🥺', '😭',
      '😂', '🤣', '💀', '🫠', '🫡', '🫶', '✌️', '🤞', '🫰', '💋',
    ],
  },
  {
    label: '🐾 Cute & Vibes',
    items: [
      '🐱', '🐰', '🐻', '🐶', '🦊', '🐼', '🐸', '🐥', '🦄', '🐝',
      '🌈', '☁️', '🌙', '☀️', '⚡', '🔥', '💦', '🫧', '🍀', '🌿',
      '🧋', '🍦', '🍩', '🍪', '🍫', '🍕', '🍟', '🍿', '👽', '👻',
    ],
  },
];

type StudioTab = 'filters' | 'frames' | 'emojis';

export const Stage5Photobooth: React.FC<Stage5PhotoboothProps> = ({ onFinish }) => {
  const [cameraState, setCameraState] = useState<
    'loading' | 'live' | 'denied' | 'demo' | 'captured'
  >('loading');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>('softpink');
  const [frameStyle, setFrameStyle] = useState<FrameStyleId>('classic');
  const [stickers, setStickers] = useState<StickerId[]>(['bows', 'sparkles']);

  const [studioTab, setStudioTab] = useState<StudioTab>('filters');
  const [emojiCatIdx, setEmojiCatIdx] = useState(0);
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const [placedEmojis, setPlacedEmojis] = useState<PlacedEmoji[]>([]);
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const liveRafRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const countdownTimersRef = useRef<number[]>([]);

  // Drag state for emojis
  const draggingEmojiRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origXPct: number;
    origYPct: number;
  } | null>(null);

  const clearCountdownTimers = useCallback(() => {
    countdownTimersRef.current.forEach((id) => window.clearTimeout(id));
    countdownTimersRef.current = [];
  }, []);

  const stopCamera = useCallback(() => {
    if (liveRafRef.current) cancelAnimationFrame(liveRafRef.current);
    liveRafRef.current = 0;
    lastVideoTimeRef.current = -1;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraState('loading');
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API unavailable');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 900 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState('live');
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      const msg =
        name === 'NotAllowedError' || name === 'PermissionDeniedError'
          ? 'Camera permission was denied. Allow camera access in your browser settings to take a live birthday pic.'
          : 'Camera access was not granted or no camera was detected.';
      setCameraError(msg);
      setCameraState('denied');
    }
  }, []);

  // Request camera permission automatically when arriving on the Polaroid camera page
  useEffect(() => {
    startCamera();
    return () => {
      clearCountdownTimers();
      stopCamera();
    };
  }, [startCamera, stopCamera, clearCountdownTimers]);

  useEffect(() => {
    if (!rawCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = PHOTO_W;
      c.height = PHOTO_H;
      rawCanvasRef.current = c;
    }
  }, []);

  // Helper to composite filter onto displayCanvas
  const renderToDisplay = useCallback((filterId: FilterId) => {
    const raw = rawCanvasRef.current;
    const display = displayCanvasRef.current;
    if (!raw || !display) return;
    applyPixelFilter(raw, display, filterId);
  }, []);

  // Live rendering loop
  useEffect(() => {
    if (cameraState === 'captured') return;

    const raw = rawCanvasRef.current;
    const display = displayCanvasRef.current;
    if (!raw || !display) return;

    if (cameraState === 'demo') {
      drawDemoPortrait(raw);
      renderToDisplay(filter);
      return;
    }

    if (cameraState !== 'live') return;

    let active = true;
    lastVideoTimeRef.current = -1;
    const tick = () => {
      if (!active) return;
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const vw = video.videoWidth || PHOTO_W;
        const vh = video.videoHeight || PHOTO_H;
        const targetRatio = PHOTO_W / PHOTO_H;
        const srcRatio = vw / vh;

        let sx = 0;
        let sy = 0;
        let sw = vw;
        let sh = vh;
        if (srcRatio > targetRatio) {
          sw = vh * targetRatio;
          sx = (vw - sw) / 2;
        } else {
          sh = vw / targetRatio;
          sy = (vh - sh) / 2;
        }

        const rCtx = raw.getContext('2d', { willReadFrequently: true });
        if (rCtx) {
          rCtx.save();
          rCtx.translate(PHOTO_W, 0);
          rCtx.scale(-1, 1);
          rCtx.drawImage(video, sx, sy, sw, sh, 0, 0, PHOTO_W, PHOTO_H);
          rCtx.restore();
          renderToDisplay(filter);
        }
      }
      liveRafRef.current = requestAnimationFrame(tick);
    };
    liveRafRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (liveRafRef.current) cancelAnimationFrame(liveRafRef.current);
    };
  }, [cameraState, filter, renderToDisplay]);

  // Re-render captured photo whenever filter changes post-snap
  useEffect(() => {
    if (cameraState === 'captured') {
      renderToDisplay(filter);
    }
  }, [filter, cameraState, renderToDisplay]);

  const performSnap = useCallback(() => {
    soundEngine.playShutter();
    setFlash(true);
    const fTimer = window.setTimeout(() => setFlash(false), 260);
    countdownTimersRef.current.push(fTimer);

    if (cameraState === 'demo' && rawCanvasRef.current) {
      drawDemoPortrait(rawCanvasRef.current);
    }
    renderToDisplay(filter);
    stopCamera();
    setCameraState('captured');
  }, [cameraState, filter, renderToDisplay, stopCamera]);

  const handleTakeSnap = () => {
    if (countdown !== null) return;
    clearCountdownTimers();
    soundEngine.playTap(2);
    setCountdown(3);
    const t1 = window.setTimeout(() => {
      soundEngine.playTap(3);
      setCountdown(2);
    }, 750);
    const t2 = window.setTimeout(() => {
      soundEngine.playTap(4);
      setCountdown(1);
    }, 1500);
    const t3 = window.setTimeout(() => {
      setCountdown(null);
      performSnap();
    }, 2200);
    countdownTimersRef.current.push(t1, t2, t3);
  };

  const handleUseDemo = () => {
    soundEngine.playTap();
    stopCamera();
    setCameraError(null);
    setCameraState('demo');
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const raw = rawCanvasRef.current;
      if (raw) {
        const ctx = raw.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          const targetRatio = PHOTO_W / PHOTO_H;
          const imgRatio = img.width / img.height;
          let sx = 0;
          let sy = 0;
          let sw = img.width;
          let sh = img.height;
          if (imgRatio > targetRatio) {
            sw = img.height * targetRatio;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / targetRatio;
            sy = (img.height - sh) / 2;
          }
          ctx.clearRect(0, 0, PHOTO_W, PHOTO_H);
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, PHOTO_W, PHOTO_H);
          stopCamera();
          setCameraError(null);
          renderToDisplay(filter);
          setCameraState('captured');
          soundEngine.playShutter();
        }
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
    e.target.value = '';
  };

  const handleRetake = () => {
    soundEngine.playTap();
    setSavedNotice(false);
    startCamera();
  };

  const toggleSticker = (id: StickerId) => {
    soundEngine.playTap(1);
    setStickers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const addEmojiStamp = (emojiStr: string) => {
    const clean = emojiStr.trim();
    if (!clean) return;
    soundEngine.playTap(3);
    const id = `em-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const offset = (placedEmojis.length % 5) * 6 - 12;
    const newItem: PlacedEmoji = {
      id,
      emoji: clean,
      xPct: Math.min(84, Math.max(16, 50 + offset)),
      yPct: Math.min(84, Math.max(16, 50 + (placedEmojis.length % 3) * 7 - 7)),
      scale: 1,
      rotation: (Math.random() - 0.5) * 16,
    };
    setPlacedEmojis((prev) => [...prev, newItem]);
    setSelectedEmojiId(id);
  };

  const handleAddCustomEmoji = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmojiInput.trim()) return;
    addEmojiStamp(customEmojiInput);
    setCustomEmojiInput('');
  };

  // Dragging logic for placed emoji stamps
  const handleEmojiPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    item: PlacedEmoji
  ) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSelectedEmojiId(item.id);
    draggingEmojiRef.current = {
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      origXPct: item.xPct,
      origYPct: item.yPct,
    };
  };

  const handleEmojiPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = draggingEmojiRef.current;
    const box = viewportRef.current;
    if (!drag || !box) return;
    const rect = box.getBoundingClientRect();
    const dxPct = ((e.clientX - drag.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.startY) / rect.height) * 100;

    setPlacedEmojis((prev) =>
      prev.map((em) =>
        em.id === drag.id
          ? {
              ...em,
              xPct: Math.min(94, Math.max(6, drag.origXPct + dxPct)),
              yPct: Math.min(94, Math.max(6, drag.origYPct + dyPct)),
            }
          : em
      )
    );
  };

  const handleEmojiPointerUp = () => {
    draggingEmojiRef.current = null;
  };

  const updateSelectedEmojiScale = (delta: number) => {
    if (!selectedEmojiId) return;
    soundEngine.playTap();
    setPlacedEmojis((prev) =>
      prev.map((em) =>
        em.id === selectedEmojiId
          ? { ...em, scale: Math.min(2.2, Math.max(0.55, em.scale + delta)) }
          : em
      )
    );
  };

  const removeSelectedEmoji = () => {
    if (!selectedEmojiId) return;
    soundEngine.playTap(-2);
    setPlacedEmojis((prev) => prev.filter((em) => em.id !== selectedEmojiId));
    setSelectedEmojiId(null);
  };

  const handleDownloadStory = () => {
    const raw = rawCanvasRef.current;
    if (!raw) return;
    const cleanFiltered = document.createElement('canvas');
    applyPixelFilter(raw, cleanFiltered, filter);

    exportIgStoryPng({
      filteredPhoto: cleanFiltered,
      frameStyle,
      stickers,
      placedEmojis,
    });
    soundEngine.playSuccess();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Polaroid preview frame style classes
  const getPolaroidFrameStyle = (): React.CSSProperties => {
    if (frameStyle === 'blush') return { backgroundColor: '#FFE3EE' };
    if (frameStyle === 'y2kblack') return { backgroundColor: '#1E131B' };
    if (frameStyle === 'holo') {
      return {
        background: 'linear-gradient(135deg, #FFE3EE 0%, #F5E6FF 50%, #FFF7DC 100%)',
      };
    }
    if (frameStyle === 'gingham') {
      return {
        backgroundColor: '#FFF8FB',
        backgroundImage:
          'linear-gradient(90deg, rgba(255,194,216,0.45) 50%, transparent 50%), linear-gradient(rgba(255,194,216,0.45) 50%, transparent 50%)',
        backgroundSize: '20px 20px',
      };
    }
    if (frameStyle === 'polka') {
      return {
        backgroundColor: '#FFFDF9',
        backgroundImage:
          'radial-gradient(rgba(235,124,164,0.38) 22%, transparent 23%), radial-gradient(rgba(235,124,164,0.38) 22%, transparent 23%)',
        backgroundSize: '22px 22px',
        backgroundPosition: '0 0, 11px 11px',
      };
    }
    return { backgroundColor: '#FFFFFF' };
  };

  const selectedEmoji = placedEmojis.find((e) => e.id === selectedEmojiId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="coquette-card rounded-3xl p-2.5 sm:p-3.5 flex flex-col items-center w-full will-change-transform"
    >
      {/* Privacy Notice */}
      <p className="text-[11px] font-semibold text-[#8C566B] text-center mb-2.5 px-2 leading-snug">
        🔒 100% Private — photos stay on your phone and are never uploaded anywhere.
      </p>

      <video ref={videoRef} playsInline muted className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUploadPhoto}
        className="hidden"
      />

      {/* Larger Pastel-Pink Retro Digicam Shell */}
      <div className="relative w-full max-w-[392px] rounded-[28px] p-3.5 bg-gradient-to-b from-[#FFE6F0] via-[#FFD3E4] to-[#FFC2D8] border-2 border-white shadow-[0_16px_36px_-10px_rgba(212,88,135,0.38)]">
        <div className="flex items-center justify-between px-1.5 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                cameraState === 'denied' ? 'bg-[#C93B6B]' : 'bg-[#D45887]'
              }`}
            />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#9E5270]">
              {cameraState === 'captured'
                ? 'POLAROID · 15TH'
                : cameraState === 'denied'
                ? 'CAMERA OFF'
                : 'Y2K DIGICAM'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-3.5 rounded-full bg-white/85 border border-[#EB7CA4]/40" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#4A2334]/80 border border-white/80" />
          </div>
        </div>

        {/* Larger Polaroid Frame (adapts live to chosen FrameStyle!) */}
        <div
          style={getPolaroidFrameStyle()}
          className="relative rounded-2xl p-3 pb-10 shadow-md transition-all duration-300"
          onClick={() => setSelectedEmojiId(null)}
        >
          <div
            ref={viewportRef}
            className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#FFF0F6]"
          >
            <canvas
              ref={displayCanvasRef}
              className="w-full h-full object-cover block"
            />

            {/* Draggable Placed Emoji Stamps */}
            {placedEmojis.map((item) => {
              const isSelected = item.id === selectedEmojiId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onPointerDown={(e) => handleEmojiPointerDown(e, item)}
                  onPointerMove={handleEmojiPointerMove}
                  onPointerUp={handleEmojiPointerUp}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEmojiId(item.id);
                  }}
                  style={{
                    left: `${item.xPct}%`,
                    top: `${item.yPct}%`,
                    transform: `translate(-50%, -50%) scale(${item.scale}) rotate(${item.rotation}deg)`,
                  }}
                  className={`absolute touch-none select-none cursor-grab active:cursor-grabbing text-4xl leading-none p-1 rounded-xl ${
                    isSelected ? 'ring-2 ring-[#D45887] bg-white/30' : ''
                  }`}
                >
                  {item.emoji}
                </button>
              );
            })}

            {/* Loading State while browser prompt is open */}
            {cameraState === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFF0F6] text-[#8C566B] text-xs font-semibold gap-2 px-4 text-center">
                <Camera className="w-7 h-7 text-[#EB7CA4] animate-pulse" />
                <span>Asking for camera access...</span>
              </div>
            )}

            {/* Prominent Visible Notice Inside Polaroid Viewport when Camera Access is Not Granted */}
            {cameraState === 'denied' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF5F9] to-[#FFE0EC] px-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#EB7CA4] shadow-sm flex items-center justify-center mb-3">
                  <CameraOff className="w-7 h-7 text-[#C93B6B]" />
                </div>
                <p className="font-serif-coquette text-2xl font-semibold text-[#4A2334]">
                  Camera Permission Needed
                </p>
                <p className="mt-1.5 text-xs font-medium text-[#7D4B61] leading-relaxed max-w-[245px]">
                  {cameraError ||
                    'Camera access is not granted yet. Allow camera access in your browser to take a live pic.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playTap();
                      startCamera();
                    }}
                    className="btn-spring min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#D45887] text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Allow Camera 🔄
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="btn-spring min-h-[38px] px-3 py-1.5 rounded-xl bg-white border border-[#FFC2D8] text-[#4A2334] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ImagePlus className="w-3.5 h-3.5 text-[#D45887]" />
                    <span>Upload Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseDemo();
                    }}
                    className="btn-spring min-h-[38px] px-3 py-1.5 rounded-xl bg-white/85 border border-[#FFC2D8] text-[#7D4B61] text-xs font-semibold cursor-pointer"
                  >
                    Demo Photo
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence>
              {countdown !== null && (
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center bg-[#2A1324]/35 will-change-transform"
                >
                  <span className="font-serif-coquette text-7xl font-bold text-white drop-shadow-lg">
                    {countdown}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {flash && (
                <motion.div
                  initial={{ opacity: 0.95 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="absolute inset-0 bg-white pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Polaroid Corner Stickers */}
          {stickers.includes('bows') && (
            <>
              <span className="absolute -top-2 -left-1.5 text-2xl select-none pointer-events-none drop-shadow">
                🎀
              </span>
              <span className="absolute bottom-1 right-2 text-xl select-none pointer-events-none drop-shadow">
                🎀
              </span>
            </>
          )}
          {stickers.includes('sparkles') && (
            <>
              <span className="absolute -top-1.5 -right-1 text-xl select-none pointer-events-none drop-shadow">
                ✨
              </span>
              <span className="absolute bottom-2 left-2 text-lg select-none pointer-events-none drop-shadow">
                ✨
              </span>
            </>
          )}
          {stickers.includes('15th') && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FFE3EE]/95 border border-[#EB7CA4] text-[10px] font-bold text-[#D45887] shadow-sm rotate-6 pointer-events-none">
              🎂 15th
            </span>
          )}
          {stickers.includes('iconic') && (
            <span className="absolute bottom-9 left-2 px-2 py-0.5 rounded-full bg-white/95 border border-[#FFC2D8] text-[10px] font-bold text-[#D45887] shadow-sm -rotate-6 pointer-events-none">
              🤍 iconic
            </span>
          )}

          {/* Polaroid Caption */}
          <p
            className={`font-hand-coquette text-2xl text-center mt-2.5 -mb-7 ${
              frameStyle === 'y2kblack' ? 'text-[#FFE3EE]' : 'text-[#4A2334]'
            }`}
          >
            Happy Birthday Thenumi ✨
          </p>
        </div>
      </div>

      {/* Selected Emoji Mini Controls */}
      {selectedEmoji && (
        <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-[#FFC2D8] shadow-sm text-xs">
          <span className="text-base">{selectedEmoji.emoji}</span>
          <span className="text-[11px] font-semibold text-[#8C566B]">Drag on photo</span>
          <button
            type="button"
            onClick={() => updateSelectedEmojiScale(-0.18)}
            aria-label="Shrink emoji"
            className="w-7 h-7 rounded-full bg-[#FFF0F6] text-[#D45887] flex items-center justify-center cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateSelectedEmojiScale(0.18)}
            aria-label="Enlarge emoji"
            className="w-7 h-7 rounded-full bg-[#FFF0F6] text-[#D45887] flex items-center justify-center cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={removeSelectedEmoji}
            aria-label="Delete emoji"
            className="w-7 h-7 rounded-full bg-[#FFE3EE] text-[#D45887] flex items-center justify-center cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {cameraState === 'denied' && (
        <div className="mt-2.5 w-full rounded-xl bg-[#FFE3EE] border border-[#EB7CA4] px-3 py-2 text-center">
          <p className="text-[11px] font-bold text-[#B83265]">
            📷 Camera access is off — tap &ldquo;Allow Camera&rdquo; or pick Upload / Demo inside the frame.
          </p>
        </div>
      )}

      {/* 3-Tab Photobooth Customizer (Filters, Frames, Emojis) */}
      <div className="w-full mt-3.5">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#FFF0F6] border border-[#FFC2D8]/80 mb-2.5">
          {(
            [
              { id: 'filters', label: 'Filters' },
              { id: 'frames', label: 'Frames' },
              { id: 'emojis', label: 'Emojis' },
            ] as { id: StudioTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                soundEngine.playTap();
                setStudioTab(t.id);
              }}
              className={`min-h-[36px] rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                studioTab === t.id
                  ? 'bg-white text-[#D45887] shadow-sm'
                  : 'text-[#8C566B] hover:text-[#4A2334]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Classic + Funny Filters */}
        {studioTab === 'filters' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playTap(1);
                    setFilter(f.id);
                  }}
                  className={`btn-spring shrink-0 min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#D45887] border-[#D45887] text-white shadow-sm'
                      : 'bg-white/90 border-[#FFC2D8] text-[#4A2334] hover:bg-[#FFF0F6]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 3: Polaroid Frames + Corner Stickers */}
        {studioTab === 'frames' && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {FRAME_STYLES.map((fs) => {
                const active = frameStyle === fs.id;
                return (
                  <button
                    key={fs.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playTap();
                      setFrameStyle(fs.id);
                    }}
                    className={`btn-spring shrink-0 min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap cursor-pointer ${
                      fs.previewClass
                    } ${active ? 'ring-2 ring-[#D45887] scale-[1.03]' : 'opacity-85'}`}
                  >
                    {fs.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {STICKERS.map((s) => {
                const active = stickers.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSticker(s.id)}
                    className={`btn-spring min-h-[36px] px-1.5 py-1 rounded-xl text-[11px] font-semibold border whitespace-nowrap truncate cursor-pointer ${
                      active
                        ? 'bg-[#FFE3EE] border-[#EB7CA4] text-[#D45887]'
                        : 'bg-white/85 border-[#FFC2D8]/80 text-[#7D4B61]'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: 120+ Emoji Picker + Custom Keyboard Input */}
        {studioTab === 'emojis' && (
          <div className="rounded-2xl bg-white/85 border border-[#FFC2D8] p-2.5 space-y-2">
            {/* Native keyboard emoji/text input */}
            <form onSubmit={handleAddCustomEmoji} className="flex items-center gap-1.5">
              <input
                type="text"
                value={customEmojiInput}
                onChange={(e) => setCustomEmojiInput(e.target.value)}
                placeholder="Type any emoji from keyboard..."
                maxLength={12}
                className="flex-1 min-h-[38px] px-3 rounded-xl bg-[#FFF7FA] border border-[#FFC2D8] text-xs text-[#4A2334] placeholder:text-[#A46B80] focus:outline-none focus:border-[#D45887]"
              />
              <button
                type="submit"
                className="btn-spring min-h-[38px] px-3 rounded-xl bg-[#D45887] text-white text-xs font-bold cursor-pointer"
              >
                Add
              </button>
            </form>

            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {EMOJI_BANK.map((cat, idx) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setEmojiCatIdx(idx)}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                    emojiCatIdx === idx
                      ? 'bg-[#FFE3EE] text-[#D45887]'
                      : 'text-[#7D4B61] hover:bg-[#FFF0F6]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Emoji Grid (30 per category = 120 emojis) */}
            <div className="grid grid-cols-6 gap-1 max-h-36 overflow-y-auto no-scrollbar">
              {EMOJI_BANK[emojiCatIdx].items.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => addEmojiStamp(em)}
                  className="btn-spring h-9 rounded-lg hover:bg-[#FFE3EE] text-xl flex items-center justify-center cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full mt-4 space-y-2">
        {cameraState === 'denied' ? (
          <>
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap(2);
                startCamera();
              }}
              className="btn-spring w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#EB7CA4] to-[#D45887] text-white font-semibold text-sm shadow-[0_10px_24px_-8px_rgba(212,88,135,0.55)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Try Camera Access Again 📸</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-spring min-h-[42px] rounded-xl bg-white/85 hover:bg-white border border-[#FFC2D8] text-xs font-semibold text-[#4A2334] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ImagePlus className="w-3.5 h-3.5 text-[#D45887]" />
                <span>Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={handleUseDemo}
                className="btn-spring min-h-[42px] rounded-xl bg-white/85 hover:bg-white border border-[#FFC2D8] text-xs font-semibold text-[#8C566B] cursor-pointer"
              >
                Use Demo Photo
              </button>
            </div>
          </>
        ) : cameraState !== 'captured' ? (
          <>
            <button
              type="button"
              onClick={handleTakeSnap}
              disabled={countdown !== null || cameraState === 'loading'}
              className="btn-spring w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#EB7CA4] to-[#D45887] text-white font-semibold text-sm shadow-[0_10px_24px_-8px_rgba(212,88,135,0.55)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Camera className="w-4 h-4" />
              <span>Take Birthday Snap 📸</span>
            </button>

            {cameraState === 'live' && (
              <button
                type="button"
                onClick={handleUseDemo}
                className="btn-spring w-full min-h-[40px] rounded-xl bg-white/80 hover:bg-white border border-[#FFC2D8] text-xs font-semibold text-[#8C566B] cursor-pointer"
              >
                Use Demo Photo
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleDownloadStory}
              className="btn-spring w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#EB7CA4] to-[#D45887] text-white font-semibold text-sm shadow-[0_10px_24px_-8px_rgba(212,88,135,0.55)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {savedNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Polaroid Saved! 🎀</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Save Polaroid 📥</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleRetake}
                className="btn-spring min-h-[44px] rounded-2xl bg-white/90 hover:bg-white border border-[#FFC2D8] text-xs font-semibold text-[#4A2334] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playTransition();
                  onFinish();
                }}
                className="btn-spring min-h-[44px] rounded-2xl bg-[#FFE3EE] hover:bg-[#FFD4E5] border border-[#EB7CA4] text-xs font-bold text-[#D45887] flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Finish &amp; Bye 🎀</span>
              </button>
            </div>
          </>
        )}

        {cameraState !== 'captured' && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playTransition();
              onFinish();
            }}
            className="w-full py-2 text-xs font-semibold text-[#9E5270] hover:text-[#D45887] flex items-center justify-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Continue to Bye Screen →</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
