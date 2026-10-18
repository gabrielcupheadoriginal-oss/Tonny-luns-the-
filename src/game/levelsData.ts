import type { LevelConfig, Platform, WindZone, Collectible, Enemy, Vehicle, Boss } from '../types/game.ts';

export function createSkyLevel(levelNum: number): LevelConfig {
  const titles: Record<number, { title: string; subtitle: string }> = {
    101: { title: 'Fase 101: A Subida para o Céu', subtitle: 'A escalada vertical pelas primeiras correntes aéreas de HollyTonny' },
    102: { title: 'Fase 102: Ilhas Flutuantes', subtitle: 'Atravesse arquipélagos celestes repletos de vegetação e caminhos secretos' },
    103: { title: 'Fase 103: Ponte das Nuvens', subtitle: 'Pontes de corda suspensas e nuvens brancas saltitantes' },
    104: { title: 'Fase 104: Dirigível Abandonado', subtitle: 'Embarque em uma gigantesca nave a vapor esquecida nas alturas' },
    105: { title: 'Fase 105: Guardião das Nuvens', subtitle: 'Enfrente o colossal protetor alado do Céu de HollyTonny' },
    106: { title: 'Fase 106: Ruínas Suspensas', subtitle: 'Misteriosas estruturas de pedra antiga que flutuam sobre o abismo' },
    107: { title: 'Fase 107: Corrida dos Balões', subtitle: 'Use os balões aerostáticos para saltar de cúpula em cúpula velozmente' },
    108: { title: 'Fase 108: Tempestade de HollyTonny', subtitle: 'Rajadas violentas de vento e nuvens de tempestade carregadas de energia' },
    109: { title: 'Fase 109: Fortaleza Voadora', subtitle: 'Invada o bastião mecânico blindado que comanda os céus' },
    110: { title: 'Fase 110: Chefe Final do Céu', subtitle: 'A batalha definitiva nas alturas contra o Supremo Núcleo da Fortaleza' },
  };

  const meta = titles[levelNum] || {
    title: `Fase ${levelNum}: Exploração Celeste`,
    subtitle: 'Navegação pelas ilhas aéreas de HollyTonny',
  };

  const targetDistance = levelNum === 105 || levelNum === 110 ? 1200 : 2800 + (levelNum - 100) * 200;
  const platforms: Platform[] = [];
  const collectibles: Collectible[] = [];
  const enemies: Enemy[] = [];
  const vehicles: Vehicle[] = [];
  const windZones: WindZone[] = [];
  let boss: Boss | undefined = undefined;

  // Base starting platform
  platforms.push({
    id: `start-plat-${levelNum}`,
    x: 0,
    y: 420,
    width: 320,
    height: 60,
    type: 'island',
  });

  // Level specific generation
  if (levelNum === 105) {
    // Boss Guardião das Nuvens Arena
    platforms.push(
      { id: 'b-p1', x: 260, y: 350, width: 180, height: 28, type: 'cloud', isBouncy: true },
      { id: 'b-p2', x: 500, y: 280, width: 220, height: 28, type: 'moving_h', minX: 420, maxX: 680, vx: 50 },
      { id: 'b-p3', x: 780, y: 360, width: 200, height: 28, type: 'bridge' },
      { id: 'b-ground', x: 200, y: 460, width: 900, height: 60, type: 'island' }
    );

    boss = {
      id: 'guardian',
      name: 'Guardião das Nuvens',
      type: 'guardian_clouds',
      x: 820,
      y: 200,
      width: 72,
      height: 72,
      vx: 60,
      vy: 40,
      hp: 300,
      maxHp: 300,
      phase: 1,
      maxPhases: 2,
      attackTimer: 1.8,
      attackPattern: 0,
      state: 'idle',
      facing: -1,
      telegraphTimer: 0,
    };

    // Secret coin hidden high above on a bouncy cloud
    collectibles.push(
      { id: 'c-secret-1', x: 600, y: 120, type: 'secret_coin', collected: false, isSecret: true },
      { id: 'c-heart-1', x: 300, y: 300, type: 'heart', collected: false },
      { id: 'c-heart-2', x: 860, y: 310, type: 'heart', collected: false }
    );
  } else if (levelNum === 110) {
    // Boss Final Fortaleza Voadora Arena
    platforms.push(
      { id: 'f-ground', x: 100, y: 460, width: 1000, height: 60, type: 'fortress' },
      { id: 'f-p1', x: 220, y: 340, width: 140, height: 24, type: 'moving_h', minX: 180, maxX: 380, vx: 60 },
      { id: 'f-p2', x: 480, y: 260, width: 180, height: 24, type: 'vanishing', vanishInterval: 2.8, isVisible: true },
      { id: 'f-p3', x: 740, y: 340, width: 140, height: 24, type: 'moving_h', minX: 680, maxX: 880, vx: -60 },
      { id: 'f-p4', x: 480, y: 150, width: 120, height: 24, type: 'cloud', isBouncy: true }
    );

    boss = {
      id: 'fortress_core',
      name: 'Supremo Titã da Fortaleza',
      type: 'fortress_boss',
      x: 780,
      y: 190,
      width: 88,
      height: 88,
      vx: 75,
      vy: 30,
      hp: 450,
      maxHp: 450,
      phase: 1,
      maxPhases: 3,
      attackTimer: 2.0,
      attackPattern: 0,
      state: 'idle',
      facing: -1,
      telegraphTimer: 0,
    };

    collectibles.push(
      { id: 'c-secret-110', x: 530, y: 90, type: 'star_relic', collected: false, isSecret: true },
      { id: 'c-heart-110', x: 140, y: 410, type: 'heart', collected: false }
    );
  } else {
    // Procedurally generated tailored adventure level
    let currentX = 260;
    let currentY = 400;

    // Place vehicle in specific levels
    if (levelNum === 104 || levelNum === 107) {
      vehicles.push({
        id: `veh-${levelNum}`,
        type: levelNum === 104 ? 'dirigivel' : 'balao',
        x: 480,
        y: 280,
        width: 80,
        height: 50,
        vx: 0,
        vy: 0,
        isOccupied: false,
        maxSpeed: 280,
        acceleration: 380,
        minX: 300,
        maxX: targetDistance + 300,
        minY: 80,
        maxY: 460,
      });
    } else if (levelNum === 109) {
      vehicles.push({
        id: `veh-aero`,
        type: 'aeronave',
        x: 600,
        y: 260,
        width: 70,
        height: 38,
        vx: 0,
        vy: 0,
        isOccupied: false,
        maxSpeed: 380,
        acceleration: 520,
        minX: 400,
        maxX: targetDistance + 400,
        minY: 60,
        maxY: 450,
      });
    }

    // Add wind zones for levels like 103, 108
    if (levelNum === 108) {
      windZones.push(
        { x: 500, y: 50, width: 800, height: 400, forceX: 140, forceY: -40 },
        { x: 1600, y: 50, width: 800, height: 400, forceX: -160, forceY: -60 }
      );
    } else if (levelNum === 103) {
      windZones.push({ x: 800, y: 100, width: 600, height: 350, forceX: 90, forceY: -20 });
    }

    let pIndex = 0;
    while (currentX < targetDistance) {
      pIndex++;
      const gap = 140 + Math.random() * 80;
      currentX += gap;
      currentY = Math.max(160, Math.min(430, currentY + (Math.random() * 140 - 70)));

      const types: ('island' | 'bridge' | 'cloud' | 'moving_h' | 'vanishing' | 'ruins')[] = [
        'island',
        'bridge',
        'cloud',
        'moving_h',
        'vanishing',
        'ruins',
      ];
      const pType = types[pIndex % types.length];
      const pWidth = pType === 'bridge' ? 180 : pType === 'cloud' ? 110 : 140 + Math.floor(Math.random() * 60);

      const plat: Platform = {
        id: `p-${levelNum}-${pIndex}`,
        x: currentX,
        y: currentY,
        width: pWidth,
        height: pType === 'cloud' ? 22 : 30,
        type: pType,
        isBouncy: pType === 'cloud',
        isVisible: true,
      };

      if (pType === 'moving_h') {
        plat.minX = currentX - 60;
        plat.maxX = currentX + 90;
        plat.vx = 45;
      } else if (pType === 'vanishing') {
        plat.vanishInterval = 2.4;
      }

      platforms.push(plat);

      // Collectibles
      if (Math.random() > 0.3) {
        collectibles.push({
          id: `c-${levelNum}-${pIndex}`,
          x: currentX + pWidth / 2,
          y: currentY - 32,
          type: 'coin',
          collected: false,
        });
      }

      // Enemies
      if (Math.random() > 0.45 && currentX > 450) {
        enemies.push({
          id: `e-${levelNum}-${pIndex}`,
          type: Math.random() > 0.5 ? 'sky_crow' : 'cloud_bat',
          x: currentX + pWidth / 2,
          y: currentY - 45,
          width: 32,
          height: 32,
          vx: Math.random() > 0.5 ? 50 : -50,
          vy: 0,
          hp: 25,
          maxHp: 25,
          patrolMinX: currentX + 10,
          patrolMaxX: currentX + pWidth - 10,
          facing: 1,
        });
      }
    }

    // Secret areas with secret coins
    collectibles.push(
      { id: `sec-1-${levelNum}`, x: 850, y: 110, type: 'secret_coin', collected: false, isSecret: true },
      { id: `sec-2-${levelNum}`, x: targetDistance - 350, y: 100, type: 'star_relic', collected: false, isSecret: true }
    );
    // Secret platform high up
    platforms.push(
      { id: `sec-plat-1`, x: 800, y: 140, width: 100, height: 20, type: 'ruins' },
      { id: `sec-plat-2`, x: targetDistance - 390, y: 130, width: 110, height: 20, type: 'cloud', isBouncy: true }
    );

    // Goal platform
    platforms.push({
      id: `goal-plat-${levelNum}`,
      x: targetDistance + 40,
      y: 380,
      width: 260,
      height: 60,
      type: 'island',
    });
  }

  return {
    id: levelNum,
    title: meta.title,
    subtitle: meta.subtitle,
    biome: 'sky',
    targetDistance,
    gravity: 1000,
    windZones,
    platforms,
    collectibles,
    enemies,
    vehicles,
    boss,
    secretCount: 2,
  };
}

/**
 * Creates the Special Narrative Chapter: O Roubo do Caixão (Março de 1980)
 */
export function createChapter1980Level(): LevelConfig {
  const targetDistance = 3400;
  const platforms: Platform[] = [];
  const collectibles: Collectible[] = [];
  const enemies: Enemy[] = [];

  // Ground platforms: HollyTonny 1980 streets, fire escapes, vintage rooftops
  for (let x = 0; x < targetDistance + 400; x += 320) {
    platforms.push({
      id: `street-${x}`,
      x,
      y: 430,
      width: 320,
      height: 70,
      type: 'fortress', // used for brick pavement
    });
  }

  // Elevated fire escapes, vintage brick roofs, lamp poles
  for (let x = 400; x < targetDistance; x += 280) {
    const elevatedY = 280 + (Math.sin(x) * 40);
    platforms.push({
      id: `rooftop-${x}`,
      x,
      y: elevatedY,
      width: 140,
      height: 24,
      type: 'bridge',
    });

    collectibles.push({
      id: `coin-1980-${x}`,
      x: x + 60,
      y: elevatedY - 30,
      type: 'coin',
      collected: false,
    });
  }

  // Secret relics from 1980
  collectibles.push(
    { id: 'sec-1980-1', x: 1200, y: 180, type: 'secret_coin', collected: false, isSecret: true },
    { id: 'sec-1980-2', x: 2600, y: 190, type: 'star_relic', collected: false, isSecret: true }
  );

  // Roy fleeing with the coffin as a live target ahead of James
  enemies.push({
    id: 'roy_with_coffin',
    type: 'roy_runner',
    x: 480,
    y: 380,
    width: 48,
    height: 48,
    vx: 190,
    vy: 0,
    hp: 9999, // Defeated by catching up, not shooting
    maxHp: 9999,
    patrolMinX: 0,
    patrolMaxX: targetDistance + 500,
    facing: 1,
    carriesCoffin: true,
  });

  return {
    id: 'chase_1980',
    title: 'Capítulo Especial: O Roubo do Caixão',
    subtitle: 'HollyTonny, Março de 1980 — James Tonny persegue Roy pelas ruas enevoadas',
    biome: 'city_1980',
    targetDistance,
    gravity: 1100,
    windZones: [],
    platforms,
    collectibles,
    enemies,
    vehicles: [],
    secretCount: 2,
    isChaseRoy: true,
  };
}

/**
 * Creates Challenge levels
 */
export function createChallengeLevel(challengeType: 'aereo' | 'dirigivel' | 'segredos' | 'tempestade'): LevelConfig {
  const titles = {
    aereo: { title: 'Desafio Aéreo', subtitle: 'Atravesse a sequência de plataformas suspensas sem cair no abismo!' },
    dirigivel: { title: 'Corrida dos Dirigíveis', subtitle: 'Alcance a linha de chegada antes que o tempo esgote!' },
    segredos: { title: 'Caça aos Segredos', subtitle: 'Explore e encontre todas as 5 relíquias secretas escondidas!' },
    tempestade: { title: 'Tempestade Difícil', subtitle: 'Sobreviva a ventos ciclônicos extremos e plataformas velozes!' },
  };

  const meta = titles[challengeType];
  const targetDistance = challengeType === 'dirigivel' ? 3200 : 2200;
  const platforms: Platform[] = [];
  const collectibles: Collectible[] = [];
  const vehicles: Vehicle[] = [];
  const windZones: WindZone[] = [];

  platforms.push({
    id: 'start-c',
    x: 0,
    y: 420,
    width: 250,
    height: 60,
    type: 'island',
  });

  if (challengeType === 'dirigivel') {
    vehicles.push({
      id: 'dirigivel-race',
      type: 'dirigivel',
      x: 100,
      y: 320,
      width: 80,
      height: 50,
      vx: 0,
      vy: 0,
      isOccupied: true, // starts piloted!
      maxSpeed: 360,
      acceleration: 480,
      minX: 50,
      maxX: targetDistance + 200,
      minY: 60,
      maxY: 440,
    });

    // Coin trails in the sky
    for (let x = 300; x < targetDistance; x += 140) {
      collectibles.push({
        id: `coin-race-${x}`,
        x,
        y: 180 + Math.sin(x / 180) * 80,
        type: 'coin',
        collected: false,
      });
    }
  } else if (challengeType === 'aereo') {
    // Narrow moving & vanishing platforms
    for (let x = 280; x < targetDistance; x += 180) {
      const isVanishing = (x / 180) % 2 === 0;
      platforms.push({
        id: `aero-${x}`,
        x,
        y: 350 + Math.sin(x) * 60,
        width: 75,
        height: 20,
        type: isVanishing ? 'vanishing' : 'moving_h',
        minX: x - 40,
        maxX: x + 40,
        vx: 50,
        vanishInterval: 2.0,
      });
      collectibles.push({
        id: `c-aero-${x}`,
        x: x + 30,
        y: 280,
        type: 'coin',
        collected: false,
      });
    }
  } else if (challengeType === 'tempestade') {
    windZones.push({
      x: 200,
      y: 0,
      width: targetDistance,
      height: 500,
      forceX: -190, // heavy headwind pushing back!
      forceY: -30,
    });
    for (let x = 280; x < targetDistance; x += 190) {
      platforms.push({
        id: `storm-${x}`,
        x,
        y: 360,
        width: 90,
        height: 24,
        type: 'cloud',
        isBouncy: true,
      });
    }
  } else {
    // Caça aos segredos
    for (let x = 300; x < targetDistance; x += 220) {
      platforms.push({
        id: `sec-hunt-${x}`,
        x,
        y: 340 + (x % 3 === 0 ? -120 : 0),
        width: 110,
        height: 26,
        type: 'island',
      });
    }
    for (let s = 1; s <= 5; s++) {
      collectibles.push({
        id: `secret-hunt-${s}`,
        x: 350 * s,
        y: 140,
        type: 'star_relic',
        collected: false,
        isSecret: true,
      });
    }
  }

  // End platform
  platforms.push({
    id: 'end-plat',
    x: targetDistance + 40,
    y: 400,
    width: 250,
    height: 60,
    type: 'island',
  });

  return {
    id: `challenge_${challengeType}`,
    title: meta.title,
    subtitle: meta.subtitle,
    biome: 'sky',
    targetDistance,
    gravity: 1000,
    windZones,
    platforms,
    collectibles,
    enemies: [],
    vehicles,
    secretCount: challengeType === 'segredos' ? 5 : 2,
    hasTimer: challengeType === 'dirigivel',
    timeLimit: challengeType === 'dirigivel' ? 35 : undefined,
  };
}

/**
 * Creates interactive Sky Tutorial level
 */
export function createTutorialLevel(): LevelConfig {
  const platforms: Platform[] = [
    { id: 'tut-1', x: 0, y: 420, width: 380, height: 60, type: 'island' },
    { id: 'tut-2', x: 440, y: 360, width: 140, height: 26, type: 'cloud', isBouncy: true },
    { id: 'tut-3', x: 640, y: 310, width: 160, height: 26, type: 'moving_h', minX: 620, maxX: 780, vx: 50 },
    { id: 'tut-4', x: 880, y: 260, width: 130, height: 24, type: 'vanishing', vanishInterval: 2.5 },
    { id: 'tut-5', x: 1080, y: 220, width: 150, height: 26, type: 'bridge' },
    { id: 'tut-sec', x: 1300, y: 120, width: 120, height: 24, type: 'ruins' },
    { id: 'tut-end', x: 1350, y: 400, width: 300, height: 60, type: 'island' },
  ];

  const vehicles: Vehicle[] = [
    {
      id: 'tut-balloon',
      type: 'balao',
      x: 1060,
      y: 280,
      width: 70,
      height: 45,
      vx: 0,
      vy: 0,
      isOccupied: false,
      maxSpeed: 200,
      acceleration: 300,
      minX: 900,
      maxX: 1400,
      minY: 80,
      maxY: 420,
    },
  ];

  const collectibles: Collectible[] = [
    { id: 'tut-c1', x: 480, y: 300, type: 'coin', collected: false },
    { id: 'tut-c2', x: 700, y: 240, type: 'coin', collected: false },
    { id: 'tut-sec-1', x: 1350, y: 80, type: 'star_relic', collected: false, isSecret: true },
  ];

  return {
    id: 'tutorial_sky',
    title: 'Tutorial: Céu de HollyTonny',
    subtitle: 'Aprenda salto duplo, dash, plataformas móveis, segredos e veículos',
    biome: 'sky',
    targetDistance: 1500,
    gravity: 1000,
    windZones: [{ x: 500, y: 100, width: 300, height: 300, forceX: 60, forceY: -20 }],
    platforms,
    collectibles,
    enemies: [],
    vehicles,
    secretCount: 1,
  };
}

/**
 * Classic Level generator (for stages 1-100 preview)
 */
export function createClassicLevel(levelNum: number): LevelConfig {
  const targetDistance = 2400;
  const platforms: Platform[] = [];
  const collectibles: Collectible[] = [];
  const enemies: Enemy[] = [];
  let boss: Boss | undefined = undefined;

  // Classic bosses on level 25, 50, 100
  if (levelNum === 25) {
    boss = {
      id: 'pizza_lord',
      name: 'Pizza Lord',
      type: 'pizza_lord',
      x: 800,
      y: 260,
      width: 76,
      height: 76,
      vx: 60,
      vy: 0,
      hp: 200,
      maxHp: 200,
      phase: 1,
      maxPhases: 2,
      attackTimer: 2.2,
      attackPattern: 0,
      state: 'idle',
      facing: -1,
      telegraphTimer: 0,
    };
  } else if (levelNum === 50) {
    boss = {
      id: 'roy_classic',
      name: 'Roy, o Guaxinim',
      type: 'roy_raccoon',
      x: 800,
      y: 280,
      width: 60,
      height: 60,
      vx: 80,
      vy: 0,
      hp: 250,
      maxHp: 250,
      phase: 1,
      maxPhases: 2,
      attackTimer: 2.0,
      attackPattern: 0,
      state: 'idle',
      facing: -1,
      telegraphTimer: 0,
    };
  } else if (levelNum === 100) {
    boss = {
      id: 'ice_cream',
      name: 'Caminhão de Sorvete Monstro',
      type: 'ice_cream_truck',
      x: 800,
      y: 290,
      width: 90,
      height: 60,
      vx: 70,
      vy: 0,
      hp: 350,
      maxHp: 350,
      phase: 1,
      maxPhases: 3,
      attackTimer: 2.2,
      attackPattern: 0,
      state: 'idle',
      facing: -1,
      telegraphTimer: 0,
    };
  }

  // Classic terrain
  for (let x = 0; x < targetDistance + 400; x += 260) {
    platforms.push({
      id: `classic-p-${x}`,
      x,
      y: 420,
      width: 230,
      height: 50,
      type: 'island',
    });
    if (x > 200 && x < targetDistance) {
      collectibles.push({
        id: `classic-c-${x}`,
        x: x + 80,
        y: 380,
        type: 'coin',
        collected: false,
      });
    }
  }

  return {
    id: levelNum,
    title: `Fase Clássica ${levelNum}: Cidade de HollyTonny`,
    subtitle: boss ? `Batalha Clássica: ${boss.name}` : 'A rota clássica das ruas e parques de HollyTonny',
    biome: 'classic',
    targetDistance,
    gravity: 1050,
    windZones: [],
    platforms,
    collectibles,
    enemies,
    vehicles: [],
    boss,
    secretCount: 1,
  };
}
