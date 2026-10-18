import React from 'react';
import { sound } from '../utils/audio.ts';
import { Flame, Wind, Timer, Search, X, ShieldAlert } from 'lucide-react';

interface ChallengeSelectModalProps {
  onSelectChallenge: (type: 'aereo' | 'dirigivel' | 'segredos' | 'tempestade') => void;
  onClose: () => void;
}

export const ChallengeSelectModal: React.FC<ChallengeSelectModalProps> = ({
  onSelectChallenge,
  onClose,
}) => {
  const challenges = [
    {
      type: 'aereo' as const,
      name: 'Desafio Aéreo',
      icon: <Wind className="text-sky-400" size={24} />,
      desc: 'Atravesse uma longa sequência de plataformas suspensas e móveis sem cair no abismo!',
      badge: 'Destreza de Salto',
      reward: '150 Moedas',
    },
    {
      type: 'dirigivel' as const,
      name: 'Corrida dos Dirigíveis',
      icon: <Timer className="text-amber-400" size={24} />,
      desc: 'Pilote o dirigível a toda velocidade e atravesse os aros de moedas antes do cronômetro zerar!',
      badge: 'Contra o Relógio',
      reward: '200 Moedas',
    },
    {
      type: 'segredos' as const,
      name: 'Caça aos Segredos',
      icon: <Search className="text-purple-400" size={24} />,
      desc: 'Explore ilhas aéreas e ruínas ocultas para desenterrar todas as 5 relíquias estelares escondidas!',
      badge: 'Exploração Total',
      reward: '250 Moedas',
    },
    {
      type: 'tempestade' as const,
      name: 'Tempestade Difícil',
      icon: <ShieldAlert className="text-red-400" size={24} />,
      desc: 'Enfrente ventos fortes contrários, plataformas que desaparecem rapidamente e perigos intensos!',
      badge: 'Modo Extremo',
      reward: '300 Moedas',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Flame className="text-amber-400" size={24} />
            <div>
              <h2 className="font-pixel text-base text-amber-400">MODOS DE DESAFIO</h2>
              <p className="text-xs text-slate-400">Provas especiais nas alturas de HollyTonny</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playJump();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            aria-label="Fechar desafios"
          >
            <X size={20} />
          </button>
        </div>

        {/* Challenge list */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {challenges.map((c) => (
            <div
              key={c.type}
              className="p-4 rounded-xl border border-slate-700 bg-slate-800/40 hover:border-amber-400/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 mt-1 sm:mt-0">
                  {c.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-pixel text-xs text-white">{c.name}</h3>
                    <span className="font-pixel text-[9px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                      {c.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">{c.desc}</p>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">
                    Recompensa: {c.reward}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playJump();
                  onSelectChallenge(c.type);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold whitespace-nowrap active:scale-95 transition"
              >
                DESAFIAR ▶
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
