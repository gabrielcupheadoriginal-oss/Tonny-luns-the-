import React from 'react';
import { sound } from '../utils/audio.ts';
import { Trophy, Star, Coins, Sparkles, RotateCcw, ArrowRight, Map } from 'lucide-react';

interface VictoryModalProps {
  levelTitle: string;
  isSpecial1980: boolean;
  isFinalSkyBoss: boolean;
  starsEarned: number;
  coinsEarned: number;
  secretsFound: number;
  totalSecrets: number;
  onNextLevel: () => void;
  onRestart: () => void;
  onReturnToMap: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelTitle,
  isSpecial1980,
  isFinalSkyBoss,
  starsEarned,
  coinsEarned,
  secretsFound,
  totalSecrets,
  onNextLevel,
  onRestart,
  onReturnToMap,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-400 rounded-3xl shadow-2xl overflow-hidden p-6 text-center">
        {/* Fanfare Icon */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
          <Trophy className="text-amber-400" size={36} />
        </div>

        <h2 className="font-pixel text-lg text-amber-400 tracking-wider mb-1">
          {isSpecial1980
            ? 'CAIXÃO RECUPERADO!'
            : isFinalSkyBoss
            ? 'CÉU DE HOLLYTONNY CONCLUÍDO!'
            : 'FASE CONCLUÍDA!'}
        </h2>
        <p className="text-xs text-slate-300 mb-4">{levelTitle}</p>

        {/* Narrative Box for Chapter 1980 */}
        {isSpecial1980 && (
          <div className="p-4 mb-4 rounded-xl bg-slate-950/80 border border-amber-500/40 text-left">
            <h4 className="font-pixel text-[11px] text-amber-300 mb-1">MISTÉRIO DO CAIXÃO:</h4>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              James Tonny conseguiu alcançar Roy e resgatar o caixão de latão! Porém, nas sombras da neblina de 1980, Roy sussurra: 
              <em> "Você ainda não sabe o que está guardado aqui dentro, Tonny..."</em> e foge pelos telhados. 
              O enigma continua no próximo capítulo!
            </p>
          </div>
        )}

        {/* Expansion completion celebration for Level 110 */}
        {isFinalSkyBoss && (
          <div className="p-4 mb-4 rounded-xl bg-sky-950/60 border border-sky-400/50 text-left">
            <h4 className="font-pixel text-[11px] text-sky-300 mb-1">EXPANSÃO CONCLUÍDA COM SUCESSO!</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Parabéns! Você libertou as ilhas flutuantes e derrotou a Fortaleza Voadora. Os céus de HollyTonny estão em paz!
            </p>
          </div>
        )}

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              size={32}
              className={
                star <= starsEarned
                  ? 'text-amber-400 fill-amber-400 animate-bounce'
                  : 'text-slate-700'
              }
            />
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center gap-2">
            <Coins className="text-amber-400" size={20} />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-pixel">MOEDAS</span>
              <strong className="font-pixel text-sm text-white tabular-nums">+{coinsEarned}</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center gap-2">
            <Sparkles className="text-purple-400" size={20} />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-pixel">SEGREDOS</span>
              <strong className="font-pixel text-sm text-purple-300 tabular-nums">
                {secretsFound} / {totalSecrets}
              </strong>
            </div>
          </div>
        </div>

        {/* Functional action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={() => {
              sound.playJump();
              onReturnToMap();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Map size={14} /> MAPA
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onRestart();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw size={14} /> REPETIR
          </button>

          <button
            data-start="true"
            onClick={() => {
              sound.playJump();
              onNextLevel();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition"
          >
            PRÓXIMA FASE <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
