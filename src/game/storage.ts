import type { GameSaveData, SkinType, WeaponType } from '../types/game.ts';

const STORAGE_KEY = 'tonny_luns_run_save_v3';

const DEFAULT_SAVE: GameSaveData = {
  coins: 350,
  unlockedSkins: ['tonny_classic', 'tonny_explorer'],
  unlockedWeapons: ['bubble', 'slingshot'],
  selectedSkin: 'tonny_classic',
  selectedWeapon: 'bubble',
  completedLevels: [1, 2, 3], // Preserved classic history
  levelStars: {
    '1': 3,
    '2': 3,
    '3': 2,
  },
  secretsFound: {
    '1': 1,
    '2': 1,
  },
  chase1980Completed: false,
  challengeScores: {},
  tutorialCompleted: false,
};

export function loadGameData(): GameSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveGameData(DEFAULT_SAVE);
      return DEFAULT_SAVE;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      unlockedSkins: Array.from(new Set([...DEFAULT_SAVE.unlockedSkins, ...(parsed.unlockedSkins || [])])),
      unlockedWeapons: Array.from(new Set([...DEFAULT_SAVE.unlockedWeapons, ...(parsed.unlockedWeapons || [])])),
    };
  } catch {
    return DEFAULT_SAVE;
  }
}

export function saveGameData(data: GameSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or disabled
  }
}

export function addCoins(amount: number): number {
  const data = loadGameData();
  data.coins = Math.max(0, data.coins + amount);
  saveGameData(data);
  return data.coins;
}

export function purchaseItem(
  type: 'weapon' | 'skin',
  itemId: string,
  price: number
): { success: boolean; remainingCoins: number; reason?: string } {
  const data = loadGameData();

  if (type === 'weapon') {
    if (data.unlockedWeapons.includes(itemId as WeaponType)) {
      data.selectedWeapon = itemId as WeaponType;
      saveGameData(data);
      return { success: true, remainingCoins: data.coins };
    }
    if (data.coins < price) {
      return { success: false, remainingCoins: data.coins, reason: 'Moedas insuficientes!' };
    }
    data.coins -= price;
    data.unlockedWeapons.push(itemId as WeaponType);
    data.selectedWeapon = itemId as WeaponType;
    saveGameData(data);
    return { success: true, remainingCoins: data.coins };
  } else {
    if (data.unlockedSkins.includes(itemId as SkinType)) {
      data.selectedSkin = itemId as SkinType;
      saveGameData(data);
      return { success: true, remainingCoins: data.coins };
    }
    if (data.coins < price) {
      return { success: false, remainingCoins: data.coins, reason: 'Moedas insuficientes!' };
    }
    data.coins -= price;
    data.unlockedSkins.push(itemId as SkinType);
    data.selectedSkin = itemId as SkinType;
    saveGameData(data);
    return { success: true, remainingCoins: data.coins };
  }
}

export function saveLevelResult(
  levelId: string | number,
  stars: number,
  secrets: number,
  coinsEarned: number
): void {
  const data = loadGameData();
  const idStr = String(levelId);

  if (!data.completedLevels.includes(levelId)) {
    data.completedLevels.push(levelId);
  }

  const prevStars = data.levelStars[idStr] || 0;
  if (stars > prevStars) {
    data.levelStars[idStr] = stars;
  }

  const prevSecrets = data.secretsFound[idStr] || 0;
  if (secrets > prevSecrets) {
    data.secretsFound[idStr] = secrets;
  }

  data.coins += coinsEarned;
  saveGameData(data);
}
