import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../utils/audio.ts';
import { FastForward, Volume2, VolumeX } from 'lucide-react';

interface Cinematic1980Props {
  onComplete: () => void;
}

export const Cinematic1980: React.FC<Cinematic1980Props> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sceneStep, setSceneStep] = useState(0);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  const scriptSteps = [
    {
      title: 'HOLLYTONNY — MARÇO DE 1980',
      subtitle: 'Uma noite fria e enevoada sob os postes de luz âmbar...',
      dialogue: 'James Tonny está sozinho na praça antiga da cidade. Sem a esposa ao seu lado, o silêncio é quase ensurdecedor.',
      royVisible: false,
      coffinStolen: false,
    },
    {
      title: 'UM MISTÉRIO INESPERADO',
      subtitle: 'Ao lado do antigo coreto...',
      dialogue: 'James guarda com reverência um misterioso e ornado caixão de mogno com travas de latão.',
      royVisible: false,
      coffinStolen: false,
    },
    {
      title: 'O ATAQUE FURTIVO!',
      subtitle: 'Passos rápidos nas sombras!',
      dialogue: 'De repente, entre as névoas dos becos, surge Roy, o Guaxinim!',
      royVisible: true,
      coffinStolen: false,
    },
    {
      title: 'O ROUBO DO CAIXÃO!',
      subtitle: 'Sem dizer uma única palavra...',
      dialogue: 'Roy agarra as alças de latão do caixão com toda a força e sai em disparada pelas ruas escuras!',
      royVisible: true,
      coffinStolen: true,
    },
    {
      title: 'A PERSEGUIÇÃO COMEÇA!',
      subtitle: 'James Tonny não deixará Roy escapar!',
      dialogue: 'James: "Ei! Roy! Largue esse caixão agora mesmo!" — James ajusta seus óculos de aviador e parte em perseguição implacável!',
      royVisible: true,
      coffinStolen: true,
    },
  ];

  useEffect(() => {
    sound.playBgm('noir_chase');
    return () => {
      // Keep or cleanup handled
    };
  }, []);

  // Canvas pixel-art animated scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Dark noir sky
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Moon
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(w * 0.8, h * 0.2, 28, 0, Math.PI * 2);
      ctx.fill();

      // Street silhouette & Brick buildings
      ctx.fillStyle = '#090d16';
      ctx.fillRect(40, h - 220, 140, 220);
      ctx.fillRect(200, h - 280, 180, 280);
      ctx.fillRect(400, h - 200, 150, 200);
      ctx.fillRect(570, h - 250, 200, 250);

      // Windows
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(70, h - 180, 14, 20);
      ctx.fillRect(110, h - 180, 14, 20);
      ctx.fillRect(240, h - 240, 16, 24);
      ctx.fillRect(300, h - 240, 16, 24);

      // Cobblestone street ground
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, h - 70, w, 70);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, h - 70, w, 4);

      // Streetlamp with warm conical light beam
      const lampX = 360;
      ctx.fillStyle = '#475569';
      ctx.fillRect(lampX - 3, h - 190, 6, 120);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(lampX - 10, h - 196, 20, 10);

      // Light glow
      const lampGlow = ctx.createRadialGradient(lampX, h - 180, 5, lampX, h - 70, 120);
      lampGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      lampGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = lampGlow;
      ctx.beginPath();
      ctx.arc(lampX, h - 120, 100, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric drifting fog
      ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
      const fogX = (t * 25) % (w + 100) - 50;
      ctx.fillRect(fogX, h - 90, 220, 35);

      // Actors:
      // James Tonny (alone under streetlamp)
      const jamesX = 310;
      const jamesY = h - 125;
      const bob = Math.sin(t * 3) * 2;

      // James body (Brown rabbit, aviator jacket, goggles)
      ctx.fillStyle = '#b45309';
      ctx.fillRect(jamesX, jamesY + bob, 22, 26);
      ctx.fillRect(jamesX + 2, jamesY - 12 + bob, 18, 14);
      // Ears
      ctx.fillRect(jamesX + 4, jamesY - 26 + bob, 5, 14);
      ctx.fillRect(jamesX + 11, jamesY - 26 + bob, 5, 14);
      // Aviator goggles
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(jamesX + 8, jamesY - 8 + bob, 10, 6);
      // Leather jacket
      ctx.fillStyle = '#78350f';
      ctx.fillRect(jamesX, jamesY + 8 + bob, 22, 14);

      const curStep = scriptSteps[sceneStep];

      // Ornate wooden coffin with brass trim
      if (!curStep.coffinStolen) {
        // Coffin beside James
        const cofX = jamesX + 35;
        const cofY = h - 110;
        ctx.fillStyle = '#451a03';
        ctx.fillRect(cofX, cofY, 38, 22);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cofX + 8, cofY + 4, 22, 3);
        ctx.fillRect(cofX + 17, cofY + 1, 4, 18);
      }

      // Roy the Raccoon
      if (curStep.royVisible) {
        const royRun = curStep.coffinStolen ? (t * 80) % 200 : 0;
        const royX = curStep.coffinStolen ? 460 + royRun : 430;
        const royY = h - 120 + Math.sin(t * 8) * 3;

        // Roy body
        ctx.fillStyle = '#475569';
        ctx.fillRect(royX, royY, 24, 24);
        // Mask
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(royX + 12, royY + 4, 10, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(royX + 16, royY + 5, 3, 3);
        // Tail
        ctx.fillStyle = '#334155';
        ctx.fillRect(royX - 10, royY + 12, 10, 6);

        // If stolen, Roy is dragging the coffin behind him!
        if (curStep.coffinStolen) {
          const cofX = royX - 32;
          const cofY = royY + 2;
          ctx.fillStyle = '#451a03';
          ctx.fillRect(cofX, cofY, 34, 18);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(cofX + 6, cofY + 4, 20, 2);
          ctx.fillRect(cofX + 14, cofY + 1, 3, 14);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [sceneStep]);

  const handleNext = () => {
    sound.playJump();
    if (sceneStep < scriptSteps.length - 1) {
      setSceneStep(sceneStep + 1);
    } else {
      onComplete();
    }
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const current = scriptSteps[sceneStep];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between bg-black p-4 select-none">
      {/* Top Bar with Skip and Mute */}
      <div className="w-full flex items-center justify-between z-10 px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-xs text-amber-400 tracking-wider">CENA CINEMATOGRÁFICA</span>
          <span className="text-xs text-slate-400">({sceneStep + 1}/{scriptSteps.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            className="p-2 rounded bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
            aria-label="Mudo"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-amber-600 text-white font-pixel text-[10px] border border-amber-500/50 transition"
          >
            <FastForward size={14} /> PULAR CENA
          </button>
        </div>
      </div>

      {/* Visual Canvas Viewport */}
      <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-2 rounded-xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full object-cover pixelated"
        />
      </div>

      {/* Narrative Dialogue Box */}
      <div className="w-full max-w-4xl bg-slate-900/95 border-2 border-amber-500/70 rounded-xl p-4 shadow-xl z-10">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-pixel text-sm text-amber-400 tracking-wide">{current.title}</h2>
          <span className="text-xs text-slate-400 italic">{current.subtitle}</span>
        </div>

        <p className="text-slate-200 text-sm md:text-base leading-relaxed my-2 font-mono">
          {current.dialogue}
        </p>

        <div className="flex items-center justify-end mt-3">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold tracking-wider shadow-lg transition active:scale-95"
          >
            {sceneStep < scriptSteps.length - 1 ? 'AVANÇAR ▶' : 'INICIAR PERSEGUIÇÃO 🏃'}
          </button>
        </div>
      </div>
    </div>
  );
};
