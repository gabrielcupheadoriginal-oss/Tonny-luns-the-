import React, { useState } from 'react';
import { sound } from '../utils/audio.ts';
import type { GameSaveData } from '../types/game.ts';
import { Star, X, Cloud, Compass, Skull, Trophy } from 'lucide-react';

interface LevelSelectModalProps {
  saveData: GameSaveData;
  onSelectLevel: (levelId: number | string) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  saveData,
  onSelectLevel,
  onClose,
}) => {
  const [worldTab, setWorldTab] = useState<'sky' | 'classic'>('sky');

  const skyLevels = [
    { id: 101, name: 'Fase 101', title: 'A Subida para o Céu', type: 'escalada' },
    { id: 102, name: 'Fase 102', title: 'Ilhas Flutuantes', type: 'exploração' },
    { id: 103, name: 'Fase 103', title: 'Ponte das Nuvens', type: 'plataformas' },
    { id: 104, name: 'Fase 104', title: 'Dirigível Abandonado', type: 'veículo' },
    { id: 105, name: 'Fase 105', title: 'Boss: Guardião das Nuvens', type: 'chefe' },
    { id: 106, name: 'Fase 106', title: 'Ruínas Suspensas', type: 'segredos' },
    { id: 107, name: 'Fase 107', title: 'Corrida dos Balões', type: 'veículo' },
    { id: 108, name: 'Fase 108', title: 'Tempestade de HollyTonny', type: 'vento' },
    { id: 109, name: 'Fase 109', title: 'Fortaleza Voadora', type: 'invasão' },
    { id: 110, name: 'Fase 110', title: 'Boss Final do Céu', type: 'chefe_final' },
  ];

  // Classic milestone representation for stages 1 to 100
  const classicLevels = [
    { id: 1, name: 'Fase 1', title: 'Primeiros Saltos em HollyTonny', type: 'cidade' },
    { id: 2, name: 'Fase 2', title: 'Avenidas e Becos', type: 'cidade' },
    { id: 3, name: 'Fase 3', title: 'Parque Central', type: 'cidade' },
    { id: 10, name: 'Fase 10', title: 'Telhados da Cidade', type: 'cidade' },
    { id: 25, name: 'Fase 25', title: 'Boss: Pizza Lord', type: 'chefe' },
    { id: 50, name: 'Fase 50', title: 'Boss: Roy, o Guaxinim', type: 'chefe' },
    { id: 75, name: 'Fase 75', title: 'Distrito Industrial', type: 'cidade' },
    { id: 100, name: 'Fase 100', title: 'Boss: Caminhão de Sorvete', type: 'chefe' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border-2 border-sky-400 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Compass className="text-sky-400" size={24} />
            <div>
              <h2 className="font-pixel text-base text-sky-400">MAPA DE EXPANSÕES & FASES</h2>
              <p className="text-xs text-slate-400">Escolha seu destino em HollyTonny</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playJump();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            aria-label="Fechar mapa"
          >
            <X size={20} />
          </button>
        </div>

        {/* World Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60">
          <button
            onClick={() => {
              sound.playJump();
              setWorldTab('sky');
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-pixel text-xs transition border-b-2 ${
              worldTab === 'sky'
                ? 'border-sky-400 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud size={16} /> Céu de HollyTonny (101 — 110)
          </button>
          <button
            onClick={() => {
              sound.playJump();
              setWorldTab('classic');
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-pixel text-xs transition border-b-2 ${
              worldTab === 'classic'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy size={16} /> Campanha Clássica (1 — 100)
          </button>
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(worldTab === 'sky' ? skyLevels : classicLevels).map((lvl) => {
            const stars = saveData.levelStars[String(lvl.id)] || 0;
            const secrets = saveData.secretsFound[String(lvl.id)] || 0;
            const isCompleted = saveData.completedLevels.includes(lvl.id);
            const isBoss = lvl.type.includes('chefe');

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  sound.playJump();
                  onSelectLevel(lvl.id);
                }}
                className={`p-4 rounded-xl border-2 text-left transition flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] ${
                  isBoss
                    ? 'border-red-500/80 bg-red-950/20 hover:border-red-400'
                    : isCompleted
                    ? 'border-sky-400/80 bg-slate-800/60 hover:border-sky-300'
                    : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-pixel text-xs text-sky-300 font-bold">{lvl.name}</span>
                    {isBoss && (
                      <span className="flex items-center gap-1 font-pixel text-[9px] text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                        <Skull size={10} /> CHEFE
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-white mb-2 leading-tight">{lvl.title}</h3>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        size={14}
                        className={
                          starIdx <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }
                      />
                    ))}
                  </div>

                  {secrets > 0 && (
                    <span className="text-[10px] text-purple-300 font-mono">
                      ⭐ {secrets} segredos
                    </span>
                  )}

                  <span className="font-pixel text-[9px] text-sky-400 uppercase">JOGAR ▶</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
