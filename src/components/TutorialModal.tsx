import React from 'react';
import { sound } from '../utils/audio.ts';
import { BookOpen, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TutorialModalProps {
  onStartInteractive: () => void;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  onStartInteractive,
  onClose,
}) => {
  const tutorialItems = [
    {
      title: '1. PLATAFORMAS SUSPENSAS E NUVENS',
      desc: 'Nuvens brancas são macias e oferecem super pulo elástico! Plataformas roxas cintilantes desaparecem periodicamente, então cronometre seus passos com precisão.',
    },
    {
      title: '2. SALTO DUPLO E DASH AÉREO',
      desc: 'Pressione PULO novamente no ar para executar o Salto Duplo com giros e estrelas. Use o DASH (Shift / K / Botão Dash) para cruzar grandes abismos em linha reta!',
    },
    {
      title: '3. VEÍCULOS AÉREOS DE HOLLYTONNY',
      desc: 'Aproxime-se de Dirigíveis, Balões ou Aeronaves e pressione [E] (ou toque no botão de Veículo) para assumir o controle. Dirigíveis e naves possuem propulsão completa!',
    },
    {
      title: '4. SEGREDOS E RELÍQUIAS ESCONDIDAS',
      desc: 'Siga correntes de ar ascendentes e caminhos superiores para encontrar Moedas Secretas Roxas e Relíquias Estelares ocultas nas ruínas!',
    },
    {
      title: '5. COMBATE CONTRA CHEFES AÉREOS',
      desc: 'Observe os círculos vermelhos e rugidos de alerta antes dos ataques do Guardião das Nuvens. Desvie com pulo duplo e contra-ataque com suas armas de brinquedo!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-sky-400 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <BookOpen className="text-sky-400" size={24} />
            <div>
              <h2 className="font-pixel text-base text-sky-400">MANUAL DE EXPLORAÇÃO CELESTE</h2>
              <p className="text-xs text-slate-400">Domine as alturas de HollyTonny</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playJump();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            aria-label="Fechar tutorial"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {tutorialItems.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 size={16} className="text-sky-400" />
                <h3 className="font-pixel text-xs text-amber-300">{item.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              sound.playJump();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs transition"
          >
            FECHAR
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onStartInteractive();
            }}
            className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-pixel text-xs font-bold flex items-center gap-2 shadow-lg transition active:scale-95"
          >
            JOGAR FASE TUTORIAL <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
