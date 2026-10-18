import React, { useEffect, useRef, useState, useCallback } from 'react';
import type {
  LevelConfig,
  PlayerState,
  GameSaveData,
  Projectile,
  Enemy,
  Boss,
  Vehicle,
  Platform,
  Collectible,
} from '../types/game.ts';
import {
  checkAABB,
  resolvePlatformLanding,
  calculateNetWind,
  performJump,
  performDash,
  updateVehiclePhysics,
  calculateChaseProgress,
} from '../game/physics.ts';
import { pixelRenderer } from '../game/pixelArtRenderer.ts';
import { WEAPONS_DATABASE, SKINS_DATABASE } from '../game/weaponsAndSkins.ts';
import { sound } from '../utils/audio.ts';
import { TouchControls } from './TouchControls.tsx';
import { Heart, Coins, Sparkles, Pause, Play, RotateCcw, Home, Car } from 'lucide-react';

interface GameCanvasProps {
  levelConfig: LevelConfig;
  saveData: GameSaveData;
  onVictory: (stars: number, coins: number, secrets: number) => void;
  onGameOver: (progressPercent: number) => void;
  onExitToMenu: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  levelConfig,
  saveData,
  onVictory,
  onGameOver,
  onExitToMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Discrete HUD state for React
  const [hudHp, setHudHp] = useState(3);
  const [hudCoins, setHudCoins] = useState(0);
  const [hudSecrets, setHudSecrets] = useState(0);
  const [chaseDist, setChaseDist] = useState(45);
  const [chaseProg, setChaseProg] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(levelConfig.timeLimit || null);
  const [isPaused, setIsPaused] = useState(false);
  const [nearVehicle, setNearVehicle] = useState(false);

  // Active simulation refs to decouple 60fps loop from React reconciliation
  const isPausedRef = useRef(false);
  const keysHeld = useRef<Record<string, boolean>>({});
  const jumpJustPressed = useRef(false);
  const dashJustPressed = useRef(false);
  const shootJustPressed = useRef(false);
  const interactJustPressed = useRef(false);

  // Audio trigger
  useEffect(() => {
    if (levelConfig.biome === 'city_1980') {
      sound.playBgm('noir_chase');
    } else if (levelConfig.boss) {
      sound.playBgm('boss');
    } else {
      sound.playBgm('sky');
    }
    return () => {
      sound.stopBgm();
    };
  }, [levelConfig]);

  // Keyboard input listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        isPausedRef.current = !isPausedRef.current;
        setIsPaused(isPausedRef.current);
        return;
      }

      if (isPausedRef.current) return;

      keysHeld.current[e.code] = true;

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        jumpJustPressed.current = true;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') {
        dashJustPressed.current = true;
      }
      if (e.code === 'KeyJ' || e.code === 'KeyZ') {
        shootJustPressed.current = true;
      }
      if (e.code === 'KeyE') {
        interactJustPressed.current = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeld.current[e.code] = false;
    };

    const onBlur = () => {
      keysHeld.current = {};
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Main 60fps simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let gameTime = 0;
    let cameraX = 0;
    let hitstopTimer = 0;
    let screenShake = 0;

    // Clone initial level elements
    const platforms: Platform[] = JSON.parse(JSON.stringify(levelConfig.platforms));
    const collectibles: Collectible[] = JSON.parse(JSON.stringify(levelConfig.collectibles));
    const enemies: Enemy[] = JSON.parse(JSON.stringify(levelConfig.enemies));
    const vehicles: Vehicle[] = JSON.parse(JSON.stringify(levelConfig.vehicles));
    let boss: Boss | undefined = levelConfig.boss ? JSON.parse(JSON.stringify(levelConfig.boss)) : undefined;

    const projectiles: Projectile[] = [];

    const skinInfo = SKINS_DATABASE[saveData.selectedSkin] || SKINS_DATABASE.tonny_classic;
    const weaponInfo = WEAPONS_DATABASE[saveData.selectedWeapon] || WEAPONS_DATABASE.bubble;

    // Player state
    const player: PlayerState = {
      x: 60,
      y: 350,
      width: 24,
      height: 34,
      vx: 0,
      vy: 0,
      isGrounded: false,
      jumpsRemaining: 2,
      maxJumps: 2,
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      facing: 1,
      hp: 3,
      maxHp: 3,
      invulnerableTimer: 0,
      selectedWeapon: saveData.selectedWeapon,
      selectedSkin: saveData.selectedSkin,
      inVehicle: false,
      vehicleId: undefined,
      shootCooldown: 0,
    };

    // Auto-board vehicle if challenge requires it (e.g. Corrida de Dirigíveis)
    if (vehicles.length > 0 && vehicles[0].isOccupied) {
      player.inVehicle = true;
      player.vehicleId = vehicles[0].id;
    }

    let sessionCoins = 0;
    let sessionSecrets = 0;
    let remainingTime = levelConfig.timeLimit || 0;
    let hasEnded = false;

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      if (!isPausedRef.current && !hasEnded) {
        gameTime += dt;

        // Challenge countdown timer
        if (levelConfig.hasTimer && remainingTime > 0) {
          remainingTime -= dt;
          setTimeRemaining(Math.max(0, Math.ceil(remainingTime)));
          if (remainingTime <= 0) {
            hasEnded = true;
            sound.playGameOver();
            onGameOver(Math.round((player.x / levelConfig.targetDistance) * 100));
            return;
          }
        }

        // Hitstop freeze
        if (hitstopTimer > 0) {
          hitstopTimer -= dt;
        } else {
          // --- PLAYER & WORLD SIMULATION ---
          // Decay screen shake
          if (screenShake > 0) {
            screenShake = Math.max(0, screenShake - dt * 25);
          }

          // Invulnerability timer decay
          if (player.invulnerableTimer > 0) {
            player.invulnerableTimer -= dt;
          }

          // Shoot cooldown decay
          if (player.shootCooldown > 0) {
            player.shootCooldown -= dt;
          }

          // Dash timer and cooldown decay
          if (player.dashCooldown > 0) {
            player.dashCooldown -= dt;
          }
          if (player.isDashing) {
            player.dashTimer -= dt;
            if (player.dashTimer <= 0) {
              player.isDashing = false;
            }
          }

          // Input reading
          const moveLeft = keysHeld.current['KeyA'] || keysHeld.current['ArrowLeft'];
          const moveRight = keysHeld.current['KeyD'] || keysHeld.current['ArrowRight'];
          const moveUp = keysHeld.current['KeyW'] || keysHeld.current['ArrowUp'];
          const moveDown = keysHeld.current['KeyS'] || keysHeld.current['ArrowDown'];

          let inputX = 0;
          let inputY = 0;
          if (moveLeft) inputX -= 1;
          if (moveRight) inputX += 1;
          if (moveUp) inputY -= 1;
          if (moveDown) inputY += 1;

          if (inputX !== 0) {
            player.facing = inputX > 0 ? 1 : -1;
          }

          // VEHICLE INTERACTION
          const pilotedVehicle = vehicles.find((v) => v.id === player.vehicleId);

          // Check proximity to any vehicle
          let closeToVehicle = false;
          for (const v of vehicles) {
            if (Math.hypot(player.x - v.x, player.y - v.y) < 110) {
              closeToVehicle = true;
              break;
            }
          }
          setNearVehicle(closeToVehicle || player.inVehicle);

          if (interactJustPressed.current) {
            interactJustPressed.current = false;
            if (player.inVehicle && pilotedVehicle) {
              // Dismount
              sound.playVehicleMount();
              player.inVehicle = false;
              player.vehicleId = undefined;
              pilotedVehicle.isOccupied = false;
              player.x = pilotedVehicle.x + pilotedVehicle.width / 2;
              player.y = pilotedVehicle.y - player.height - 4;
              player.vy = -200;
            } else {
              // Board nearest
              for (const v of vehicles) {
                if (Math.hypot(player.x - v.x, player.y - v.y) < 110) {
                  sound.playVehicleMount();
                  player.inVehicle = true;
                  player.vehicleId = v.id;
                  v.isOccupied = true;
                  break;
                }
              }
            }
          }

          // Update Vehicle Physics
          for (let i = 0; i < vehicles.length; i++) {
            const v = vehicles[i];
            const vInput = v.isOccupied ? { x: inputX, y: inputY } : { x: 0, y: 0 };
            vehicles[i] = updateVehiclePhysics(v, dt, vInput);
          }

          if (player.inVehicle && pilotedVehicle) {
            // Player rides inside vehicle
            player.x = pilotedVehicle.x + pilotedVehicle.width * 0.25;
            player.y = pilotedVehicle.y + pilotedVehicle.height * 0.25;
            player.vx = pilotedVehicle.vx;
            player.vy = pilotedVehicle.vy;
          } else {
            // REGULAR ON-FOOT MOVEMENT & PHYSICS
            const speed = 260 * skinInfo.speedMultiplier;

            if (!player.isDashing) {
              if (inputX !== 0) {
                player.vx = inputX * speed;
              } else {
                player.vx *= Math.pow(0.005, dt);
              }
            }

            // Wind zones effect
            const netWind = calculateNetWind(player.x, player.y, player.width, player.height, levelConfig.windZones);
            player.vx += netWind.windX * dt;
            player.vy += netWind.windY * dt;

            // Jump handling
            if (jumpJustPressed.current) {
              jumpJustPressed.current = false;
              const jumpRes = performJump(player.jumpsRemaining);
              if (jumpRes.canJump) {
                player.vy = jumpRes.vy * skinInfo.jumpMultiplier;
                player.jumpsRemaining = jumpRes.jumpsRemaining;
                player.isGrounded = false;
                if (player.jumpsRemaining === 0) {
                  sound.playDoubleJump();
                } else {
                  sound.playJump();
                }
              }
            }

            // Variable jump cut: if jump released early while ascending, cut upward velocity
            if (!moveUp && !keysHeld.current['Space'] && player.vy < -120) {
              player.vy *= 0.55;
            }

            // Dash handling
            if (dashJustPressed.current) {
              dashJustPressed.current = false;
              if (player.dashCooldown <= 0) {
                sound.playDash();
                const dashRes = performDash(true, player.facing);
                player.isDashing = true;
                player.vx = dashRes.vx;
                player.dashTimer = dashRes.dashTimer;
                player.dashCooldown = dashRes.dashCooldown;
              }
            }

            // Gravity
            if (!player.isDashing) {
              player.vy += levelConfig.gravity * dt;
            }

            // Update player position
            const prevY = player.y;
            player.x += player.vx * dt;
            player.y += player.vy * dt;

            // Platform collisions
            let groundedThisFrame = false;

            // Update moving and vanishing platforms
            for (const plat of platforms) {
              if (plat.type === 'moving_h' && plat.vx && plat.minX !== undefined && plat.maxX !== undefined) {
                plat.x += plat.vx * dt;
                if (plat.x < plat.minX) {
                  plat.x = plat.minX;
                  plat.vx = Math.abs(plat.vx);
                } else if (plat.x > plat.maxX) {
                  plat.x = plat.maxX;
                  plat.vx = -Math.abs(plat.vx);
                }
              }

              if (plat.type === 'vanishing' && plat.vanishInterval) {
                const cycle = gameTime % plat.vanishInterval;
                plat.isVisible = cycle < plat.vanishInterval * 0.65;
              }

              // Landing check
              const landing = resolvePlatformLanding(
                { x: player.x, y: player.y, width: player.width, height: player.height, vy: player.vy, prevY },
                plat
              );

              if (landing.landed) {
                player.y = landing.newY;
                if (landing.bounceVy) {
                  // Cloud bounce!
                  player.vy = landing.bounceVy;
                  player.jumpsRemaining = 1;
                  sound.playDoubleJump();
                } else {
                  player.vy = 0;
                  player.isGrounded = true;
                  player.jumpsRemaining = player.maxJumps;
                  groundedThisFrame = true;

                  // Move with moving platform
                  if (plat.type === 'moving_h' && plat.vx) {
                    player.x += plat.vx * dt;
                  }
                }
              }
            }

            if (!groundedThisFrame && !player.isGrounded) {
              player.isGrounded = false;
            }

            // Pit death check (falling off sky)
            if (player.y > 620) {
              player.hp = 0;
              setHudHp(0);
              hasEnded = true;
              sound.playGameOver();
              onGameOver(Math.round((player.x / levelConfig.targetDistance) * 100));
              return;
            }
          }

          // SHOOTING ACTION (Toy Blasters)
          if (shootJustPressed.current) {
            shootJustPressed.current = false;
            if (player.shootCooldown <= 0) {
              player.shootCooldown = weaponInfo.cooldown;
              sound.playShoot(weaponInfo.id);

              projectiles.push({
                id: `p-${Math.random()}`,
                x: player.x + (player.facing > 0 ? player.width + 4 : -4),
                y: player.y + player.height * 0.45,
                vx: player.facing * weaponInfo.speed,
                vy: weaponInfo.id === 'wind' ? (Math.random() * 40 - 20) : 0,
                radius: weaponInfo.id === 'bubble' ? 10 : weaponInfo.id === 'star' ? 8 : 6,
                damage: weaponInfo.damage,
                fromPlayer: true,
                weaponType: weaponInfo.id,
                life: 1.6,
                color: weaponInfo.color,
                effect: weaponInfo.effect,
              });
            }
          }

          // UPDATE PROJECTILES
          for (let pIdx = projectiles.length - 1; pIdx >= 0; pIdx--) {
            const p = projectiles[pIdx];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;

            const pBox = { x: p.x - p.radius, y: p.y - p.radius, width: p.radius * 2, height: p.radius * 2 };

            // Player projectile hitting enemies
            if (p.fromPlayer) {
              for (const enemy of enemies) {
                if (!enemy.isDefeated && checkAABB(pBox, enemy)) {
                  enemy.hp -= p.damage;
                  p.life = 0; // consume
                  sound.playEnemyDefeat();
                  hitstopTimer = 0.04;
                  screenShake = 4;

                  if (enemy.hp <= 0) {
                    enemy.isDefeated = true;
                    sessionCoins += 10;
                    setHudCoins(sessionCoins);
                  }
                  break;
                }
              }

              // Player projectile hitting boss
              if (boss && boss.state !== 'defeated' && checkAABB(pBox, boss)) {
                boss.hp -= p.damage;
                p.life = 0;
                sound.playEnemyDefeat();
                hitstopTimer = 0.06;
                screenShake = 6;

                // Boss phase transition
                if (boss.hp <= boss.maxHp * 0.5 && boss.phase === 1) {
                  boss.phase = 2;
                  sound.playBossTelegraph();
                }

                if (boss.hp <= 0) {
                  boss.state = 'defeated';
                  sound.playVictory();
                  setTimeout(() => {
                    hasEnded = true;
                    onVictory(3, sessionCoins + 100, sessionSecrets);
                  }, 1200);
                }
              }
            } else {
              // Enemy/Boss projectile hitting player
              if (!player.inVehicle && player.invulnerableTimer <= 0 && checkAABB(pBox, player)) {
                player.hp -= 1;
                player.invulnerableTimer = 1.2;
                p.life = 0;
                sound.playHurt();
                setHudHp(player.hp);
                screenShake = 8;
                hitstopTimer = 0.05;

                if (player.hp <= 0) {
                  hasEnded = true;
                  sound.playGameOver();
                  onGameOver(Math.round((player.x / levelConfig.targetDistance) * 100));
                  return;
                }
              }
            }

            if (p.life <= 0) {
              projectiles.splice(pIdx, 1);
            }
          }

          // UPDATE ENEMIES
          for (const enemy of enemies) {
            if (enemy.isDefeated) continue;

            if (enemy.carriesCoffin) {
              // Roy running ahead in 1980 chase
              enemy.x += enemy.vx * dt;
              // Hop animation
              enemy.y = 390 + Math.sin(gameTime * 8) * 10;
            } else {
              // Patrol
              enemy.x += enemy.vx * dt;
              if (enemy.x < enemy.patrolMinX) {
                enemy.x = enemy.patrolMinX;
                enemy.vx = Math.abs(enemy.vx);
              } else if (enemy.x > enemy.patrolMaxX) {
                enemy.x = enemy.patrolMaxX;
                enemy.vx = -Math.abs(enemy.vx);
              }

              // Collision with player
              if (!player.inVehicle && player.invulnerableTimer <= 0 && checkAABB(enemy, player)) {
                player.hp -= 1;
                player.invulnerableTimer = 1.2;
                sound.playHurt();
                setHudHp(player.hp);
                screenShake = 7;

                if (player.hp <= 0) {
                  hasEnded = true;
                  sound.playGameOver();
                  onGameOver(Math.round((player.x / levelConfig.targetDistance) * 100));
                  return;
                }
              }
            }
          }

          // UPDATE BOSS (Guardião das Nuvens / Titã da Fortaleza)
          if (boss && boss.state !== 'defeated') {
            boss.attackTimer -= dt;

            // Boss movement
            boss.x += boss.vx * dt;
            boss.y += boss.vy * dt;
            if (boss.x < 700) {
              boss.x = 700;
              boss.vx = Math.abs(boss.vx);
            } else if (boss.x > 950) {
              boss.x = 950;
              boss.vx = -Math.abs(boss.vx);
            }
            if (boss.y < 120) {
              boss.y = 120;
              boss.vy = Math.abs(boss.vy);
            } else if (boss.y > 280) {
              boss.y = 280;
              boss.vy = -Math.abs(boss.vy);
            }

            // Telegraph & Attack
            if (boss.attackTimer <= 0.6 && boss.telegraphTimer <= 0) {
              boss.telegraphTimer = 0.6;
              sound.playBossTelegraph();
            }

            if (boss.attackTimer <= 0) {
              boss.attackTimer = boss.phase === 1 ? 2.4 : 1.6;
              boss.telegraphTimer = 0;

              // Fire celestial attack orbs
              const targetDir = Math.atan2(player.y - boss.y, player.x - boss.x);
              const orbSpeed = 240;

              projectiles.push({
                id: `boss-p-${Math.random()}`,
                x: boss.x + boss.width / 2,
                y: boss.y + boss.height / 2,
                vx: Math.cos(targetDir) * orbSpeed,
                vy: Math.sin(targetDir) * orbSpeed,
                radius: 10,
                damage: 1,
                fromPlayer: false,
                life: 3.5,
                color: boss.phase === 1 ? '#38bdf8' : '#ef4444',
              });

              if (boss.phase === 2) {
                // Secondary projectile
                projectiles.push({
                  id: `boss-p2-${Math.random()}`,
                  x: boss.x + boss.width / 2,
                  y: boss.y + boss.height / 2,
                  vx: Math.cos(targetDir + 0.3) * orbSpeed,
                  vy: Math.sin(targetDir + 0.3) * orbSpeed,
                  radius: 8,
                  damage: 1,
                  fromPlayer: false,
                  life: 3.5,
                  color: '#facc15',
                });
              }
            }
          }

          // COLLECTIBLES CHECK
          for (const item of collectibles) {
            if (!item.collected && checkAABB(player, { x: item.x - 10, y: item.y - 10, width: 20, height: 20 })) {
              item.collected = true;
              if (item.type === 'coin') {
                sessionCoins += 5;
                sound.playCoin();
                setHudCoins(sessionCoins);
              } else if (item.type === 'secret_coin' || item.type === 'star_relic') {
                sessionSecrets += 1;
                sessionCoins += 25;
                sound.playSecret();
                setHudSecrets(sessionSecrets);
                setHudCoins(sessionCoins);
              } else if (item.type === 'heart') {
                player.hp = Math.min(player.maxHp, player.hp + 1);
                sound.playCoin();
                setHudHp(player.hp);
              }
            }
          }

          // 1980 SPECIAL MISSION: CHASE ROY
          if (levelConfig.isChaseRoy) {
            const roy = enemies.find((e) => e.type === 'roy_runner');
            if (roy) {
              const chase = calculateChaseProgress(player.x, roy.x, 450, levelConfig.targetDistance);
              setChaseDist(chase.distanceMeters);
              setChaseProg(chase.progressPercent);

              if (chase.caught) {
                hasEnded = true;
                sound.playVictory();
                onVictory(3, sessionCoins + 150, sessionSecrets);
                return;
              }
            }
          }

          // GOAL REACHED (for non-boss levels)
          if (!levelConfig.boss && !levelConfig.isChaseRoy && player.x >= levelConfig.targetDistance) {
            hasEnded = true;
            sound.playVictory();
            const stars = sessionSecrets >= 1 && sessionCoins >= 30 ? 3 : sessionCoins >= 15 ? 2 : 1;
            onVictory(stars, sessionCoins, sessionSecrets);
            return;
          }

          // Camera smoothly follows player with lead
          const targetCamX = Math.max(0, player.x - 240);
          cameraX += (targetCamX - cameraX) * 0.12;
        }
      }

      // --- RENDERING PASS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply screen shake
      if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
      }

      // Background
      if (levelConfig.biome === 'city_1980') {
        pixelRenderer.drawCity1980Background(ctx, canvas.width, canvas.height, cameraX, gameTime);
      } else {
        pixelRenderer.drawSkyBackground(ctx, canvas.width, canvas.height, cameraX, gameTime);
      }

      // Wind zones
      pixelRenderer.drawWindZones(ctx, levelConfig.windZones, cameraX, gameTime);

      // Platforms
      for (const plat of platforms) {
        pixelRenderer.drawPlatform(ctx, plat, cameraX, gameTime);
      }

      // Vehicles
      for (const veh of vehicles) {
        pixelRenderer.drawVehicle(ctx, veh, cameraX, gameTime);
      }

      // Collectibles
      pixelRenderer.drawCollectibles(ctx, collectibles, cameraX, gameTime);

      // Enemies & Roy
      pixelRenderer.drawEnemies(ctx, enemies, cameraX, gameTime);

      // Boss
      if (boss) {
        pixelRenderer.drawBoss(ctx, boss, cameraX, gameTime);
      }

      // Projectiles
      pixelRenderer.drawProjectiles(ctx, projectiles, cameraX, gameTime);

      // Player
      pixelRenderer.drawPlayer(ctx, player, cameraX, gameTime);

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [levelConfig, saveData, onVictory, onGameOver]);

  // Touch control handlers
  const handleTouchStart = useCallback((action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'dash' | 'attack' | 'interact') => {
    if (action === 'left') keysHeld.current['ArrowLeft'] = true;
    if (action === 'right') keysHeld.current['ArrowRight'] = true;
    if (action === 'up') keysHeld.current['ArrowUp'] = true;
    if (action === 'down') keysHeld.current['ArrowDown'] = true;
    if (action === 'jump') jumpJustPressed.current = true;
    if (action === 'dash') dashJustPressed.current = true;
    if (action === 'attack') shootJustPressed.current = true;
    if (action === 'interact') interactJustPressed.current = true;
  }, []);

  const handleTouchEnd = useCallback((action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'dash' | 'attack' | 'interact') => {
    if (action === 'left') keysHeld.current['ArrowLeft'] = false;
    if (action === 'right') keysHeld.current['ArrowRight'] = false;
    if (action === 'up') keysHeld.current['ArrowUp'] = false;
    if (action === 'down') keysHeld.current['ArrowDown'] = false;
  }, []);

  const weaponInfo = WEAPONS_DATABASE[saveData.selectedWeapon] || WEAPONS_DATABASE.bubble;

  // Dynamic canvas sizing to ensure crisp pixel ratio and zero cropping on mobile
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* 60fps Responsive Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block pixelated"
      />

      {/* World-Matched Low-Occlusion HUD Overlay (<15% viewport) */}
      <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-3">
        {/* Top Bar Cluster */}
        <div className="flex items-center justify-between w-full">
          {/* Health & Vitality Pips */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 pointer-events-auto">
            <span className="font-pixel text-[9px] text-slate-400 mr-1">VIDA</span>
            {[1, 2, 3].map((pip) => (
              <Heart
                key={pip}
                size={18}
                className={
                  pip <= hudHp
                    ? 'text-red-500 fill-red-500 drop-shadow'
                    : 'text-slate-700'
                }
              />
            ))}
          </div>

          {/* 1980 Chase Roy Indicator or Challenge Timer */}
          {levelConfig.isChaseRoy ? (
            <div className="px-4 py-1.5 rounded-xl bg-slate-950/85 border border-amber-500/70 flex flex-col items-center">
              <span className="font-pixel text-[9px] text-amber-300">
                DISTÂNCIA DO ROY: <strong className="text-white tabular-nums">{chaseDist}m</strong>
              </span>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-amber-400 transition-all duration-200"
                  style={{ width: `${chaseProg}%` }}
                />
              </div>
            </div>
          ) : timeRemaining !== null ? (
            <div className="px-4 py-1.5 rounded-xl bg-slate-950/85 border border-amber-500/70">
              <span className="font-pixel text-xs text-amber-300 tabular-nums">
                TEMPO: {timeRemaining}s
              </span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-700/60 hidden sm:block">
              <span className="font-pixel text-[10px] text-slate-300">{levelConfig.title}</span>
            </div>
          )}

          {/* Coins, Secrets & Utilities */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40">
              <Coins className="text-amber-400" size={16} />
              <span className="font-pixel text-xs text-amber-300 tabular-nums font-bold">
                {hudCoins}
              </span>
            </div>

            {/* Secrets Found */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-purple-500/40">
              <Sparkles className="text-purple-400" size={16} />
              <span className="font-pixel text-xs text-purple-300 tabular-nums font-bold">
                {hudSecrets}/{levelConfig.secretCount}
              </span>
            </div>

            {/* Weapon Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-sky-400/40">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: weaponInfo.color }} />
              <span className="font-pixel text-[9px] text-sky-200 hidden sm:inline">{weaponInfo.name}</span>
              <span className="font-pixel text-[8px] text-emerald-400">∞</span>
            </div>

            {/* Pause Button */}
            <button
              onClick={() => {
                sound.playJump();
                isPausedRef.current = !isPausedRef.current;
                setIsPaused(isPausedRef.current);
              }}
              className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-white border border-slate-700 transition"
              aria-label="Pausar jogo"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          </div>
        </div>

        {/* Empty bottom spacer to keep playfield clear */}
        <div className="h-20" />
      </div>

      {/* On-screen touch controls for mobile */}
      <TouchControls
        onInputStart={handleTouchStart}
        onInputEnd={handleTouchEnd}
        canInteractVehicle={nearVehicle}
      />

      {/* Pause Modal */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl text-center">
            <h3 className="font-pixel text-lg text-amber-400 mb-2">JOGO PAUSADO</h3>
            <p className="text-xs text-slate-300 mb-6">{levelConfig.title}</p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  sound.playJump();
                  isPausedRef.current = false;
                  setIsPaused(false);
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Play size={16} /> CONTINUAR
              </button>

              <button
                onClick={() => {
                  sound.playJump();
                  isPausedRef.current = false;
                  setIsPaused(false);
                  window.location.reload();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs transition flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} /> REINICIAR FASE
              </button>

              <button
                onClick={() => {
                  sound.playJump();
                  isPausedRef.current = false;
                  setIsPaused(false);
                  onExitToMenu();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs transition flex items-center justify-center gap-2"
              >
                <Home size={14} /> VOLTAR AO MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
