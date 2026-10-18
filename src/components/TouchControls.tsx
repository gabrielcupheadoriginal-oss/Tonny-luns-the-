import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Zap, Target, Car } from 'lucide-react';

interface TouchControlsProps {
  onInputStart: (action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'dash' | 'attack' | 'interact') => void;
  onInputEnd: (action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'dash' | 'attack' | 'interact') => void;
  canInteractVehicle: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputStart,
  onInputEnd,
  canInteractVehicle,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none touch-none flex flex-col justify-between p-2 sm:p-4">
      {/* Top spacer */}
      <div className="h-10" />

      {/* Bottom control clusters */}
      <div className="flex items-end justify-between w-full">
        {/* Left D-Pad */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onInputStart('left');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onInputEnd('left');
            }}
            onMouseDown={() => onInputStart('left')}
            onMouseUp={() => onInputEnd('left')}
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-900/85 border-2 border-sky-400/60 active:bg-sky-500/40 text-white flex items-center justify-center shadow-lg active:scale-95 transition"
            aria-label="Mover para a esquerda"
          >
            <ArrowLeft size={24} />
          </button>

          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onInputStart('right');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onInputEnd('right');
            }}
            onMouseDown={() => onInputStart('right')}
            onMouseUp={() => onInputEnd('right')}
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-900/85 border-2 border-sky-400/60 active:bg-sky-500/40 text-white flex items-center justify-center shadow-lg active:scale-95 transition"
            aria-label="Mover para a direita"
          >
            <ArrowRight size={24} />
          </button>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-end gap-1.5 sm:gap-2.5 pointer-events-auto">
          {canInteractVehicle && (
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onInputStart('interact');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                onInputEnd('interact');
              }}
              onMouseDown={() => onInputStart('interact')}
              onMouseUp={() => onInputEnd('interact')}
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-amber-600/85 border-2 border-amber-300 active:bg-amber-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition mb-1 sm:mb-2"
              aria-label="Entrar ou Sair do Veículo"
            >
              <Car size={18} />
            </button>
          )}

          {/* Dash */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onInputStart('dash');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onInputEnd('dash');
            }}
            onMouseDown={() => onInputStart('dash')}
            onMouseUp={() => onInputEnd('dash')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-900/85 border-2 border-purple-400 active:bg-purple-600 text-purple-200 flex flex-col items-center justify-center shadow-lg active:scale-95 transition"
            aria-label="Dash"
          >
            <Zap size={18} />
            <span className="font-pixel text-[7px] sm:text-[8px] mt-0.5">DASH</span>
          </button>

          {/* Attack */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onInputStart('attack');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onInputEnd('attack');
            }}
            onMouseDown={() => onInputStart('attack')}
            onMouseUp={() => onInputEnd('attack')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-red-900/85 border-2 border-red-400 active:bg-red-600 text-red-200 flex flex-col items-center justify-center shadow-lg active:scale-95 transition"
            aria-label="Atacar"
          >
            <Target size={18} />
            <span className="font-pixel text-[7px] sm:text-[8px] mt-0.5">TIRO</span>
          </button>

          {/* Jump */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onInputStart('jump');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onInputEnd('jump');
            }}
            onMouseDown={() => onInputStart('jump')}
            onMouseUp={() => onInputEnd('jump')}
            className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-sky-600/90 border-2 sm:border-3 border-sky-300 active:bg-sky-400 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition"
            aria-label="Pular"
          >
            <ArrowUp size={22} />
            <span className="font-pixel text-[8px] sm:text-[9px] mt-0.5">PULO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
