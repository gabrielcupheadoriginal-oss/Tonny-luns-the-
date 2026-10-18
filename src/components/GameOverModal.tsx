import React from 'react';
import { sound } from '../utils/audio.ts';
import { Skull, RotateCcw, Home } from 'lucide-react';

interface GameOverModalProps {
  levelTitle: string;
  progressPercent: number;
  onRetry: () => void;
  onReturnToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  levelTitle,
  progressPercent,
  onRetry,
  onReturnToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-red-500 rounded-3xl shadow-2xl p-6 text-center">
        {/* Skull Icon */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-red-950 border border-red-500/50 flex items-center justify-center">
          <Skull className="text-red-400" size={36} />
        </div>

        <h2 className="font-pixel text-xl text-red-500 tracking-wider mb-1">FIM DE JOGO</h2>
        <p className="text-xs text-slate-400 mb-4">{levelTitle}</p>

        {/* Progress Bar */}
        <div className="mb-6 p-3 rounded-xl bg-slate-950 border border-slate-800 text-left">
          <div className="flex justify-between items-center mb-1 text-[11px] font-pixel text-slate-300">
            <span>PROGRESSO ALCANÇADO</span>
            <span className="text-red-400 tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              sound.playJump();
              onReturnToMenu();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs flex items-center justify-center gap-2 transition"
          >
            <Home size={14} /> MENU
          </button>

          <button
            data-start="true"
            onClick={() => {
              sound.playJump();
              onRetry();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-pixel text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
          >
            <RotateCcw size={14} /> TENTAR NOVAMENTE
          </button>
        </div>
      </div>
    </div>
  );
};
