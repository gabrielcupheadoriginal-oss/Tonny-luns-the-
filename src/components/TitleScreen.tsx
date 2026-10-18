import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../utils/audio.ts';
import type { GameSaveData } from '../types/game.ts';
import { Play, Film, Map, ShoppingBag, Flame, BookOpen, Volume2, VolumeX, Coins } from 'lucide-react';

interface TitleScreenProps {
  saveData: GameSaveData;
  onStartCampaign: () => void;
  onOpenCinematic1980: () => void;
  onOpenLevelSelect: () => void;
  onOpenShop: () => void;
  onOpenChallenges: () => void;
  onOpenTutorial: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  saveData,
  onStartCampaign,
  onOpenCinematic1980,
  onOpenLevelSelect,
  onOpenShop,
  onOpenChallenges,
  onOpenTutorial,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  useEffect(() => {
    sound.playBgm('menu');
    return () => {
      // Audio managed seamlessly
    };
  }, []);

  // Keyboard shortcut for Enter/Space to start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStartCampaign();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartCampaign]);

  // Live background animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;

      // Azure gradient sky
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Distant floating castles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 4; i++) {
        const cx = ((i * 320 + t * 15) % (w + 200)) - 100;
        const cy = h * 0.35 + Math.sin(t + i) * 12;
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.arc(cx + 25, cy - 8, 45, 0, Math.PI * 2);
        ctx.arc(cx + 55, cy, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating islands with lush grass
      const isleX = w * 0.5 + Math.sin(t * 0.8) * 15;
      const isleY = h * 0.72 + Math.cos(t * 0.8) * 8;

      ctx.fillStyle = '#4ade80'; // grass
      ctx.fillRect(isleX - 120, isleY, 240, 14);
      ctx.fillStyle = '#78350f'; // rock
      ctx.beginPath();
      ctx.moveTo(isleX - 120, isleY + 14);
      ctx.lineTo(isleX, isleY + 90);
      ctx.lineTo(isleX + 120, isleY + 14);
      ctx.closePath();
      ctx.fill();

      // Tonny Bunny pixel mascot on island (Orange fur, tall ears, red nose, white gloves)
      const masX = isleX - 10;
      const masY = isleY - 32 + Math.sin(t * 4) * 3;

      ctx.fillStyle = '#f97316'; // Orange fur body
      ctx.fillRect(masX, masY + 8, 20, 24);
      ctx.fillRect(masX + 1, masY - 4, 18, 14);
      // Ears
      ctx.fillRect(masX + 3, masY - 18, 5, 14);
      ctx.fillRect(masX + 12, masY - 18, 5, 14);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(masX + 4, masY - 16, 3, 10);
      ctx.fillRect(masX + 13, masY - 16, 3, 10);
      // Eye & Red Nose
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(masX + 11, masY - 1, 5, 6);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(masX + 13, masY + 1, 3, 3);
      ctx.fillStyle = '#ef4444'; // Red button nose
      ctx.fillRect(masX + 16, masY + 3, 4, 4);
      // White Gloves
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(masX - 3, masY + 14, 6, 6);
      ctx.fillRect(masX + 17, masY + 14, 6, 6);

      // Drifting Dirigível in sky
      const diriX = ((t * 40) % (w + 240)) - 120;
      const diriY = h * 0.22;
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(diriX, diriY, 55, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(diriX - 30, diriY - 4, 60, 4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(diriX - 15, diriY + 18, 30, 10);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center select-none overflow-hidden bg-slate-950 p-4">
      {/* Background Animated Canvas */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="absolute inset-0 w-full h-full object-cover pixelated"
      />

      {/* Top Bar: Creator Branding, Coin balance, Sound toggle */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-white/20">
          <span className="font-pixel text-[10px] text-amber-300">CRIADOR DO UNIVERSO:</span>
          <span className="font-pixel text-[10px] text-white font-bold">GABRIEL ENEDINO</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-amber-500/40">
            <Coins className="text-amber-400" size={16} />
            <span className="font-pixel text-xs text-amber-300 tabular-nums font-bold">
              {saveData.coins}
            </span>
          </div>
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-950/70 border border-white/20 text-white hover:text-amber-300 transition"
            aria-label="Som"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Center Lockup: Inline SVG Title Logo */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        <div className="mb-2">
          {/* Bespoke inline SVG Title Lockup */}
          <svg viewBox="0 0 640 120" className="w-[88vw] max-w-[560px] drop-shadow-2xl">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>
              <linearGradient id="skyGradText" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <filter id="shadow">
                <feDropShadow dx="3" dy="5" stdDeviation="0" floodColor="#090d16" />
              </filter>
            </defs>

            {/* Main Title: TONNY LUNS RUN */}
            <text
              x="50%"
              y="60"
              textAnchor="middle"
              filter="url(#shadow)"
              fill="url(#titleGrad)"
              stroke="#0f172a"
              strokeWidth="6"
              fontFamily="'Press Start 2P', monospace"
              fontSize="34"
              fontWeight="900"
              letterSpacing="2"
            >
              TONNY LUNS RUN
            </text>

            {/* Subtitle Banner: CEU DE HOLLYTONNY */}
            <rect x="110" y="76" width="420" height="32" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <text
              x="50%"
              y="97"
              textAnchor="middle"
              fill="url(#skyGradText)"
              fontFamily="'Press Start 2P', monospace"
              fontSize="12"
              fontWeight="700"
              letterSpacing="1"
            >
              CEU DE HOLLYTONNY - EXPANSÃO 3
            </text>
          </svg>
        </div>

        {/* Primary Start CTA Button */}
        <button
          data-start="true"
          onClick={() => {
            sound.playJump();
            onStartCampaign();
          }}
          className="mt-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-pixel text-xs font-black tracking-wider shadow-2xl border-2 border-amber-200 active:scale-95 transition flex items-center gap-3 cursor-pointer"
        >
          <Play size={18} className="fill-slate-950" /> JOGAR EXPANSAO [ESPACO]
        </button>

        {/* Secondary Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5 w-full max-w-xl px-2">
          <button
            onClick={() => {
              sound.playJump();
              onOpenCinematic1980();
            }}
            className="p-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-amber-500/60 text-amber-300 font-pixel text-[10px] flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Film size={14} /> CAPITULO 1980
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onOpenLevelSelect();
            }}
            className="p-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-sky-400/60 text-sky-300 font-pixel text-[10px] flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Map size={14} /> FASES (101-110)
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onOpenShop();
            }}
            className="p-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-purple-400/60 text-purple-300 font-pixel text-[10px] flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <ShoppingBag size={14} /> LOJA & SKINS
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onOpenChallenges();
            }}
            className="p-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-orange-500/60 text-orange-300 font-pixel text-[10px] flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Flame size={14} /> DESAFIOS
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onOpenTutorial();
            }}
            className="p-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-emerald-400/60 text-emerald-300 font-pixel text-[10px] flex items-center justify-center gap-2 active:scale-95 transition col-span-2 sm:col-span-1"
          >
            <BookOpen size={14} /> TUTORIAL
          </button>
        </div>
      </div>

      {/* Bottom Flat Control Hint Line */}
      <div className="relative z-10 py-1.5 px-4 rounded-xl bg-slate-950/80 border border-white/10 text-slate-300 font-pixel text-[9px] tracking-wide text-center">
        WASD / Setas: Mover · Barra Espaço: Pulo / Pulo Duplo · K / Shift: Dash · J / Z: Atirar · E: Veículo · P: Pausa
      </div>
    </div>
  );
};
