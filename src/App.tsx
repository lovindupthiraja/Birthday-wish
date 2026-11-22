import React, { useState, useCallback } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { AvatarExpression, Stage } from './types';
import { AmbientBackground, SparkleOverlay } from './components/SparkleEffects';
import { TopBar } from './components/TopBar';
import { AvatarGuide } from './components/PixelAvatar';
import { IntroSplash } from './components/IntroSplash';
import { Stage2Intro } from './components/Stage2Intro';
import { Stage3Letter } from './components/Stage3Letter';
import { Stage4Cake } from './components/Stage4Cake';
import { StagePicPrompt } from './components/StagePicPrompt';
import { Stage5Photobooth } from './components/Stage5Photobooth';
import { Stage6Bye } from './components/Stage6Bye';
import { soundEngine } from './utils/soundEngine';

const STAGE_DIALOGUE: Record<Stage, { expression: AvatarExpression; text: string }> = {
  1: {
    expression: 'happy',
    text: "Hey Thenumi! Happy 15th Birthday! Since today's your special day, I made a little surprise just for you. 🎀",
  },
  2: {
    expression: 'wink',
    text: 'Untie the cute bow first, Thenumi... I wrote you a quick note.',
  },
  3: {
    expression: 'excited',
    text: 'Tap the candles on the cake to put them out! 🎂',
  },
  4: {
    expression: 'warm',
    text: 'Wait—before we wrap up, wanna take a cute birthday pic, Thenumi? 📸',
  },
  5: {
    expression: 'wink',
    text: 'Okay, Thenumi check! Snap a cute Polaroid—you can also save it.',
  },
  6: {
    expression: 'warm',
    text: "That's a wrap, Thenumi! Have the happiest 15th birthday ever—bye for now! 🎀✨",
  },
};

const resetScrollTop = () => {
  if (typeof window !== 'undefined' && window.scrollY > 4) {
    window.scrollTo(0, 0);
  }
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [stage, setStage] = useState<Stage>(1);
  const [guideOpen, setGuideOpen] = useState(true);
  const [muted, setMuted] = useState(false);

  // Interactive states that reset on replay
  const [letterUntied, setLetterUntied] = useState(false);
  const [replaySeed, setReplaySeed] = useState(0);

  // Visual confetti trigger
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const triggerConfetti = useCallback(() => {
    setConfettiTrigger((c) => c + 1);
  }, []);

  const goToStage = useCallback((next: Stage) => {
    soundEngine.unlockAudio();
    setStage(next);
    resetScrollTop();
  }, []);

  const handleOpenSurprise = useCallback(() => {
    soundEngine.unlockAudio();
    setShowIntro(false);
    setStage(1);
    triggerConfetti();
    resetScrollTop();
  }, [triggerConfetti]);

  const handleReplay = useCallback(() => {
    soundEngine.unlockAudio();
    setLetterUntied(false);
    setReplaySeed((s) => s + 1);
    setStage(1);
    setShowIntro(true);
    triggerConfetti();
    resetScrollTop();
  }, [triggerConfetti]);

  const handleToggleMute = useCallback(() => {
    soundEngine.unlockAudio();
    const isNowMuted = soundEngine.toggleMute();
    setMuted(isNowMuted);
  }, []);

  const { expression, text: dialogue } = STAGE_DIALOGUE[stage];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-[100dvh] w-full flex justify-center overflow-x-clip">
        {/* Soft-Pink Coquette Ambient Background */}
        <AmbientBackground nightMode={false} />

        {/* Global Interactive Sparkle Trail + Confetti */}
        <SparkleOverlay
          confettiTrigger={confettiTrigger}
          burstPoint={null}
          darkMode={false}
        />

        {/* Mobile-First 9:16 Vertical Container (max-width 430px centered on desktop) */}
        <div className="relative z-10 w-full max-w-[430px] min-h-[100dvh] flex flex-col sm:my-4 sm:min-h-[calc(100dvh-2rem)] sm:rounded-[38px] sm:border sm:border-white/75 sm:bg-white/30 sm:shadow-[0_24px_70px_-18px_rgba(212,88,135,0.28)]">
          {/* Persistent Top Bar (hidden on opening splash cover) */}
          {!showIntro && (
            <TopBar
              stage={stage}
              guideOpen={guideOpen}
              muted={muted}
              onToggleMute={handleToggleMute}
              onToggleGuide={() => {
                soundEngine.unlockAudio();
                soundEngine.playTap();
                setGuideOpen((g) => !g);
              }}
              onJumpStage={(s) => {
                soundEngine.playTransition();
                goToStage(s);
              }}
            />
          )}

          {/* Main Content Area */}
          <main className="flex-1 px-3.5 sm:px-4 pt-1 pb-10 flex flex-col">
            {/* Guide System */}
            {!showIntro && (
              <AvatarGuide
                visible={guideOpen}
                expression={expression}
                mode="reveal"
                dialogue={dialogue}
              />
            )}

            {/* Intro Screen + 6-Step Stage Viewport (direct keyed children for true mode="wait" transitions) */}
            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {showIntro && (
                  <IntroSplash
                    key={`intro-splash-${replaySeed}`}
                    onStart={handleOpenSurprise}
                  />
                )}

                {!showIntro && stage === 1 && (
                  <Stage2Intro
                    key={`stage-1-${replaySeed}`}
                    onNext={() => goToStage(2)}
                  />
                )}

                {!showIntro && stage === 2 && (
                  <Stage3Letter
                    key={`stage-2-${replaySeed}`}
                    untied={letterUntied}
                    onUntie={() => {
                      setLetterUntied(true);
                      soundEngine.playConfetti();
                      triggerConfetti();
                    }}
                    onNext={() => goToStage(3)}
                  />
                )}

                {!showIntro && stage === 3 && (
                  <Stage4Cake
                    key={`stage-3-${replaySeed}`}
                    onCelebrated={triggerConfetti}
                    onNext={() => goToStage(4)}
                  />
                )}

                {!showIntro && stage === 4 && (
                  <StagePicPrompt
                    key={`stage-4-${replaySeed}`}
                    onYesSnap={() => goToStage(5)}
                    onSkipToBye={() => goToStage(6)}
                  />
                )}

                {!showIntro && stage === 5 && (
                  <Stage5Photobooth
                    key={`stage-5-${replaySeed}`}
                    onFinish={() => goToStage(6)}
                  />
                )}

                {!showIntro && stage === 6 && (
                  <Stage6Bye
                    key={`stage-6-${replaySeed}`}
                    onReplay={handleReplay}
                  />
                )}
              </AnimatePresence>
            </div>

            <footer className="mt-5 pt-2 text-center select-none pointer-events-none">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#6E3D52]/80">
                Produced by BOOCHI
              </p>
            </footer>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
