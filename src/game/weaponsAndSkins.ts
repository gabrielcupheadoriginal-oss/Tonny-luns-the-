import type { WeaponType, SkinType } from '../types/game.ts';

export interface WeaponInfo {
  id: WeaponType;
  name: string;
  description: string;
  price: number;
  damage: number;
  speed: number;
  cooldown: number; // seconds
  color: string;
  effect: 'trap' | 'slow' | 'pierce' | 'knockback' | 'normal';
}

export interface SkinInfo {
  id: SkinType;
  name: string;
  description: string;
  price: number;
  unlockCondition: string;
  speedMultiplier: number;
  jumpMultiplier: number;
  accentColor: string;
}

export const WEAPONS_DATABASE: Record<WeaponType, WeaponInfo> = {
  bubble: {
    id: 'bubble',
    name: 'Lançador de Bolhas',
    description: 'Dispara bolhas aéreas flutuantes que envolvem e estouram sobre os inimigos.',
    price: 0,
    damage: 15,
    speed: 420,
    cooldown: 0.22,
    color: '#38bdf8',
    effect: 'trap',
  },
  foam: {
    id: 'foam',
    name: 'Lançador de Espuma',
    description: 'Dispara jatos de espuma adesiva que reduzem a velocidade e causam impacto contínuo.',
    price: 150,
    damage: 22,
    speed: 380,
    cooldown: 0.28,
    color: '#fef08a',
    effect: 'slow',
  },
  star: {
    id: 'star',
    name: 'Atirador de Estrelas',
    description: 'Dispara estrelas cintilantes de alta velocidade que perfuram múltiplos obstáculos.',
    price: 250,
    damage: 30,
    speed: 550,
    cooldown: 0.25,
    color: '#facc15',
    effect: 'pierce',
  },
  wind: {
    id: 'wind',
    name: 'Lançador de Vento',
    description: 'Dispara fortes redemoinhos de ar que empurram inimigos para longe com grande impacto.',
    price: 350,
    damage: 28,
    speed: 460,
    cooldown: 0.32,
    color: '#a7f3d0',
    effect: 'knockback',
  },
  slingshot: {
    id: 'slingshot',
    name: 'Estilingue Clássico',
    description: 'A clássica arma de infância de HollyTonny com munição infinita e ricochete suave.',
    price: 0,
    damage: 12,
    speed: 450,
    cooldown: 0.2,
    color: '#f97316',
    effect: 'normal',
  },
  laser: {
    id: 'laser',
    name: 'Laser de Brinquedo',
    description: 'Emite pulsos ópticos futuristas super rápidos para combate aéreo preciso.',
    price: 200,
    damage: 24,
    speed: 680,
    cooldown: 0.24,
    color: '#ec4899',
    effect: 'normal',
  },
  carrot: {
    id: 'carrot',
    name: 'Canhão de Cenoura',
    description: 'Lança projéteis em formato de cenoura com impacto pesado e raio de explosão.',
    price: 300,
    damage: 35,
    speed: 390,
    cooldown: 0.4,
    color: '#ea580c',
    effect: 'knockback',
  },
};

export const SKINS_DATABASE: Record<SkinType, SkinInfo> = {
  tonny_classic: {
    id: 'tonny_classic',
    name: 'Tonny Coelho Clássico',
    description: 'O querido coelho de pele laranja vibrante, luvas brancas de veludo e nariz vermelho.',
    price: 0,
    unlockCondition: 'Inicial',
    speedMultiplier: 1.0,
    jumpMultiplier: 1.0,
    accentColor: '#f97316',
  },
  tonny_explorer: {
    id: 'tonny_explorer',
    name: 'Tonny Explorador',
    description: 'Equipado com chapéu cáqui de safári e binóculos para mapear as ilhas voadoras.',
    price: 0,
    unlockCondition: 'Inicial',
    speedMultiplier: 1.05,
    jumpMultiplier: 1.05,
    accentColor: '#ca8a04',
  },
  tonny_celestial: {
    id: 'tonny_celestial',
    name: 'Tonny Celeste',
    description: 'Com asas divinas de anjo das nuvens e auréola dourada brilhante.',
    price: 400,
    unlockCondition: 'Loja ou Colete 10 Estrelas Celestes',
    speedMultiplier: 1.1,
    jumpMultiplier: 1.12,
    accentColor: '#38bdf8',
  },
  james_pilot: {
    id: 'james_pilot',
    name: 'James Tonny Piloto',
    description: 'O experiente piloto vestindo jaqueta de couro retrô e óculos de voo vintage.',
    price: 300,
    unlockCondition: 'Loja ou Complete o Dirigível Abandonado',
    speedMultiplier: 1.08,
    jumpMultiplier: 1.02,
    accentColor: '#78350f',
  },
  deise_adventurer: {
    id: 'deise_adventurer',
    name: 'Deise Aventureira',
    description: 'A destemida heroína de bandana magenta e botas ágeis para saltos suspensos.',
    price: 250,
    unlockCondition: 'Loja ou Encontre 5 Segredos',
    speedMultiplier: 1.12,
    jumpMultiplier: 1.08,
    accentColor: '#db2777',
  },
  roy_flying: {
    id: 'roy_flying',
    name: 'Roy Voador',
    description: 'O esperto guaxinim com capacete de hélice acrobática e cachecol esvoaçante.',
    price: 500,
    unlockCondition: 'Loja ou Conclua o Capítulo Especial de 1980',
    speedMultiplier: 1.15,
    jumpMultiplier: 1.1,
    accentColor: '#64748b',
  },
};
