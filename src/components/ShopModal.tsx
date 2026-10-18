import React, { useState } from 'react';
import { WEAPONS_DATABASE, SKINS_DATABASE } from '../game/weaponsAndSkins.ts';
import { loadGameData, purchaseItem } from '../game/storage.ts';
import { sound } from '../utils/audio.ts';
import type { WeaponType, SkinType, GameSaveData } from '../types/game.ts';
import { Coins, Check, Lock, Sparkles, X, Shield, Zap, Crosshair } from 'lucide-react';

interface ShopModalProps {
  onClose: () => void;
  onDataUpdated: (data: GameSaveData) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ onClose, onDataUpdated }) => {
  const [saveData, setSaveData] = useState<GameSaveData>(() => loadGameData());
  const [activeTab, setActiveTab] = useState<'weapons' | 'skins'>('weapons');
  const [message, setMessage] = useState<string | null>(null);

  const handleBuyOrEquip = (type: 'weapon' | 'skin', id: string, price: number) => {
    sound.playJump();
    const result = purchaseItem(type, id, price);

    if (result.success) {
      sound.playCoin();
      const updated = loadGameData();
      setSaveData(updated);
      onDataUpdated(updated);
      setMessage('Item equipado com sucesso!');
      setTimeout(() => setMessage(null), 2500);
    } else {
      sound.playHurt();
      setMessage(result.reason || 'Saldo insuficiente!');
      setTimeout(() => setMessage(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-500 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Sparkles className="text-amber-400" size={24} />
            <div>
              <h2 className="font-pixel text-base text-amber-400">LOJA DE BRINQUEDOS & SKINS</h2>
              <p className="text-xs text-slate-400">Céu de HollyTonny · Gabriel Enedino</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40">
              <Coins className="text-amber-400" size={18} />
              <span className="font-pixel text-sm text-amber-300 font-bold tabular-nums">
                {saveData.coins}
              </span>
            </div>
            <button
              onClick={() => {
                sound.playJump();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              aria-label="Fechar loja"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Status notification toast */}
        {message && (
          <div className="bg-amber-500/20 text-amber-300 px-4 py-2 text-center font-pixel text-xs border-b border-amber-500/30">
            {message}
          </div>
        )}

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => {
              sound.playJump();
              setActiveTab('weapons');
            }}
            className={`flex-1 py-3 font-pixel text-xs transition border-b-2 ${
              activeTab === 'weapons'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🔫 ARMAS DE BRINQUEDO ({Object.keys(WEAPONS_DATABASE).length})
          </button>
          <button
            onClick={() => {
              sound.playJump();
              setActiveTab('skins');
            }}
            className={`flex-1 py-3 font-pixel text-xs transition border-b-2 ${
              activeTab === 'skins'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🐰 SKINS DE PERSONAGEM ({Object.keys(SKINS_DATABASE).length})
          </button>
        </div>

        {/* Content catalog */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTab === 'weapons' ? (
            Object.values(WEAPONS_DATABASE).map((w) => {
              const isUnlocked = saveData.unlockedWeapons.includes(w.id);
              const isSelected = saveData.selectedWeapon === w.id;
              const canAfford = saveData.coins >= w.price;

              return (
                <div
                  key={w.id}
                  className={`p-4 rounded-xl border-2 transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950/20'
                      : isUnlocked
                      ? 'border-slate-700 bg-slate-800/40'
                      : 'border-slate-800 bg-slate-950/60 opacity-90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: w.color }}
                        />
                        <h3 className="font-pixel text-xs text-white">{w.name}</h3>
                      </div>
                      {isSelected ? (
                        <span className="flex items-center gap-1 font-pixel text-[10px] text-emerald-400">
                          <Check size={14} /> EQUIPADO
                        </span>
                      ) : isUnlocked ? (
                        <span className="font-pixel text-[10px] text-slate-400">DESBLOQUEADO</span>
                      ) : (
                        <span className="flex items-center gap-1 font-pixel text-[10px] text-amber-400">
                          <Coins size={12} /> {w.price} MOEDAS
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mb-3">{w.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Zap size={12} className="text-amber-400" />
                        <span>Dano: <strong className="text-white">{w.damage}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Crosshair size={12} className="text-sky-400" />
                        <span>Vel: <strong className="text-white">{w.speed}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 col-span-2">
                        <Shield size={12} className="text-purple-400" />
                        <span>Munição: <strong className="text-emerald-400">Infinita</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isSelected || (!isUnlocked && !canAfford)}
                    onClick={() => handleBuyOrEquip('weapon', w.id, w.price)}
                    className={`w-full py-2 px-3 rounded-lg font-pixel text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : isUnlocked
                        ? 'bg-sky-600 hover:bg-sky-500 text-white'
                        : canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? (
                      'EM USO'
                    ) : isUnlocked ? (
                      'EQUIPAR'
                    ) : canAfford ? (
                      <>COMPRAR POR {w.price} MOEDAS</>
                    ) : (
                      <>
                        <Lock size={12} /> BLOQUEADO ({w.price} M)
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            Object.values(SKINS_DATABASE).map((s) => {
              const isUnlocked = saveData.unlockedSkins.includes(s.id);
              const isSelected = saveData.selectedSkin === s.id;
              const canAfford = saveData.coins >= s.price;

              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border-2 transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950/20'
                      : isUnlocked
                      ? 'border-slate-700 bg-slate-800/40'
                      : 'border-slate-800 bg-slate-950/60 opacity-90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: s.accentColor }}
                        />
                        <h3 className="font-pixel text-xs text-white">{s.name}</h3>
                      </div>
                      {isSelected ? (
                        <span className="flex items-center gap-1 font-pixel text-[10px] text-emerald-400">
                          <Check size={14} /> EQUIPADO
                        </span>
                      ) : isUnlocked ? (
                        <span className="font-pixel text-[10px] text-slate-400">DESBLOQUEADO</span>
                      ) : (
                        <span className="flex items-center gap-1 font-pixel text-[10px] text-amber-400">
                          <Coins size={12} /> {s.price} MOEDAS
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mb-2">{s.description}</p>
                    <p className="text-[11px] text-amber-300/80 mb-3">
                      Desbloqueio: <em>{s.unlockCondition}</em>
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-3">
                      <div>
                        Velocidade: <strong className="text-white">x{s.speedMultiplier}</strong>
                      </div>
                      <div>
                        Salto: <strong className="text-white">x{s.jumpMultiplier}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isSelected || (!isUnlocked && !canAfford)}
                    onClick={() => handleBuyOrEquip('skin', s.id, s.price)}
                    className={`w-full py-2 px-3 rounded-lg font-pixel text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : isUnlocked
                        ? 'bg-sky-600 hover:bg-sky-500 text-white'
                        : canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? (
                      'EM USO'
                    ) : isUnlocked ? (
                      'EQUIPAR'
                    ) : canAfford ? (
                      <>COMPRAR POR {s.price} MOEDAS</>
                    ) : (
                      <>
                        <Lock size={12} /> BLOQUEADO ({s.price} M)
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
