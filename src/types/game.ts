export type GameScreen = 
  | 'title' 
  | 'playing' 
  | 'paused' 
  | 'gameover' 
  | 'victory' 
  | 'level_select' 
  | 'shop' 
  | 'challenges' 
  | 'cinematic_1980' 
  | 'tutorial';

export type WeaponType = 
  | 'bubble'     // Lançador de bolhas
  | 'foam'       // Lançador de espuma
  | 'star'       // Atirador de estrelas
  | 'wind'       // Lançador de vento
  | 'slingshot'  // Clássico
  | 'laser'      // Laser de brinquedo
  | 'carrot';    // Canhão de cenoura

export type SkinType = 
  | 'tonny_classic'    // Tonny clássico: pele laranja, luvas brancas, nariz vermelho
  | 'tonny_explorer'   // Tonny Coelho Explorador
  | 'tonny_celestial'  // Tonny Coelho Celeste
  | 'james_pilot'      // James Tonny Piloto
  | 'deise_adventurer' // Deise Aventureira
  | 'roy_flying';      // Roy Voador

export type VehicleType = 
  | 'dirigivel'     // Dirigível
  | 'balao'         // Balão de exploração
  | 'aeronave'      // Aeronave de HollyTonny
  | 'plataforma';   // Plataforma voadora

export interface Vehicle {
  id: string;
  type: VehicleType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  isOccupied: boolean;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  maxSpeed: number;
  acceleration: number;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'island' | 'bridge' | 'cloud' | 'moving_h' | 'moving_v' | 'vanishing' | 'ruins' | 'fortress';
  vx?: number;
  vy?: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  vanishTimer?: number;
  vanishInterval?: number;
  isVisible?: boolean;
  isBouncy?: boolean;
}

export interface WindZone {
  x: number;
  y: number;
  width: number;
  height: number;
  forceX: number;
  forceY: number;
  activeTimer?: number;
  gustInterval?: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'coin' | 'secret_coin' | 'heart' | 'star_relic';
  collected: boolean;
  isSecret?: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  fromPlayer: boolean;
  weaponType?: WeaponType;
  life: number;
  color: string;
  effect?: 'trap' | 'slow' | 'pierce' | 'knockback' | 'normal';
}

export interface Enemy {
  id: string;
  type: 'sky_crow' | 'cloud_bat' | 'wind_golem' | 'sky_drone' | 'roy_runner' | 'coffin_thief';
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  patrolMinX: number;
  patrolMaxX: number;
  facing: 1 | -1;
  shootCooldown?: number;
  isDefeated?: boolean;
  defeatTimer?: number;
  carriesCoffin?: boolean;
}

export interface Boss {
  id: string;
  name: string;
  type: 'guardian_clouds' | 'fortress_boss' | 'pizza_lord' | 'roy_raccoon' | 'ice_cream_truck';
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  phase: number;
  maxPhases: number;
  attackTimer: number;
  attackPattern: number;
  state: 'idle' | 'telegraph' | 'attack' | 'dive' | 'hurt' | 'defeated';
  facing: 1 | -1;
  telegraphTimer: number;
}

export interface LevelConfig {
  id: number | string;
  title: string;
  subtitle: string;
  biome: 'sky' | 'city_1980' | 'classic';
  targetDistance: number;
  gravity: number;
  windZones: WindZone[];
  platforms: Platform[];
  collectibles: Collectible[];
  enemies: Enemy[];
  vehicles: Vehicle[];
  boss?: Boss;
  hasTimer?: boolean;
  timeLimit?: number; // seconds
  secretCount: number;
  isChaseRoy?: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  jumpsRemaining: number;
  maxJumps: number;
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  invulnerableTimer: number;
  selectedWeapon: WeaponType;
  selectedSkin: SkinType;
  inVehicle: boolean;
  vehicleId?: string;
  shootCooldown: number;
}

export interface GameSaveData {
  coins: number;
  unlockedSkins: SkinType[];
  unlockedWeapons: WeaponType[];
  selectedSkin: SkinType;
  selectedWeapon: WeaponType;
  completedLevels: (number | string)[];
  levelStars: Record<string, number>; // levelId -> 1..3 stars
  secretsFound: Record<string, number>; // levelId -> number
  chase1980Completed: boolean;
  challengeScores: Record<string, number>;
  tutorialCompleted: boolean;
}
