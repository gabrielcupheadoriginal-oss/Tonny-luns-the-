import type { PlayerState, Platform, Collectible, Projectile, Enemy, Boss, Vehicle, WindZone } from '../types/game.ts';

export class PixelArtRenderer {
  /**
   * Draws the atmospheric parallax sky background for Céu de HollyTonny
   */
  public drawSkyBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cameraX: number,
    gameTime: number
  ) {
    // Gradient sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.5, '#7dd3fc');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Sun / Celestial glow
    ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.22, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.22, 40, 0, Math.PI * 2);
    ctx.fill();

    // Far distant mountain silhouettes and floating castles (slow parallax: factor 0.08)
    const farOffsetX = (cameraX * 0.08) % 600;
    ctx.fillStyle = '#93c5fd';
    for (let x = -600; x < width + 600; x += 300) {
      const drawX = x - farOffsetX;
      // Distant floating spire
      ctx.fillRect(drawX + 80, height * 0.45, 36, 120);
      ctx.beginPath();
      ctx.moveTo(drawX + 68, height * 0.45);
      ctx.lineTo(drawX + 98, height * 0.35);
      ctx.lineTo(drawX + 128, height * 0.45);
      ctx.fill();
      // Distant hill
      ctx.beginPath();
      ctx.arc(drawX + 150, height * 0.7, 140, Math.PI, 0);
      ctx.fill();
    }

    // Mid-ground drifting fluffy clouds (medium parallax: factor 0.2)
    const midOffsetX = ((cameraX * 0.2) + gameTime * 20) % 500;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let x = -500; x < width + 500; x += 250) {
      const cx = x - midOffsetX;
      const cy = height * 0.28 + Math.sin(x * 0.01) * 30;
      this.drawPuffyCloud(ctx, cx, cy, 70, 28);
    }
  }

  /**
   * Draws the atmospheric 1980 noir city backdrop
   */
  public drawCity1980Background(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cameraX: number,
    gameTime: number
  ) {
    // Night sky gradient
    const nightGrad = ctx.createLinearGradient(0, 0, 0, height);
    nightGrad.addColorStop(0, '#020617');
    nightGrad.addColorStop(0.6, '#0f172a');
    nightGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = nightGrad;
    ctx.fillRect(0, 0, width, height);

    // Moody 1980 Moon with misty ring
    ctx.fillStyle = 'rgba(226, 232, 240, 0.15)';
    ctx.beginPath();
    ctx.arc(width * 0.25, height * 0.2, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(width * 0.25, height * 0.2, 32, 0, Math.PI * 2);
    ctx.fill();

    // Silhouetted 1980 buildings (parallax factor 0.1)
    const buildOffsetX = (cameraX * 0.1) % 400;
    ctx.fillStyle = '#090d16';
    for (let x = -400; x < width + 400; x += 180) {
      const bx = x - buildOffsetX;
      const bHeight = 160 + ((x * 13) % 120);
      ctx.fillRect(bx, height - bHeight - 60, 150, bHeight + 60);

      // Lit windows
      ctx.fillStyle = '#fbbf24';
      for (let wy = height - bHeight - 40; wy < height - 80; wy += 32) {
        for (let wx = bx + 16; wx < bx + 130; wx += 28) {
          if ((wx + wy) % 3 === 0) {
            ctx.fillRect(wx, wy, 12, 16);
          }
        }
      }
      ctx.fillStyle = '#090d16';
    }

    // Street Fog
    ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
    for (let f = 0; f < 3; f++) {
      const fogX = (gameTime * 35 + f * 300) % (width + 200) - 100;
      ctx.fillRect(fogX, height * 0.6 + f * 40, 240, 50);
    }
  }

  /**
   * Helper to draw puffy clouds
   */
  public drawPuffyCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.beginPath();
    ctx.arc(x, y, h * 0.9, 0, Math.PI * 2);
    ctx.arc(x + w * 0.35, y - h * 0.3, h * 1.1, 0, Math.PI * 2);
    ctx.arc(x + w * 0.7, y, h * 0.85, 0, Math.PI * 2);
    ctx.arc(x + w * 0.35, y + h * 0.2, h * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draws platforms with bespoke textures
   */
  public drawPlatform(ctx: CanvasRenderingContext2D, plat: Platform, cameraX: number, gameTime: number) {
    const screenX = plat.x - cameraX;
    const { y, width, height, type } = plat;

    ctx.save();
    if (type === 'island') {
      // Grass top, earth underneath, hanging vines
      ctx.fillStyle = '#4ade80'; // Lush grass
      ctx.fillRect(screenX, y, width, 8);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(screenX, y + 8, width, 4);

      // Rock/earth underside
      ctx.fillStyle = '#78350f';
      ctx.fillRect(screenX, y + 12, width, height - 12);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(screenX + 8, y + height - 8, width - 16, 8);

      // Little flower / grass tufts
      ctx.fillStyle = '#facc15';
      ctx.fillRect(screenX + 16, y - 4, 4, 4);
      ctx.fillRect(screenX + width - 24, y - 4, 4, 4);

      // Hanging vine roots
      ctx.fillStyle = '#15803d';
      ctx.fillRect(screenX + 24, y + height, 4, 14);
      ctx.fillRect(screenX + width - 40, y + height, 4, 18);
    } else if (type === 'bridge') {
      // Suspension rope and wooden planks
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screenX, y);
      ctx.quadraticCurveTo(screenX + width / 2, y + 12, screenX + width, y);
      ctx.stroke();

      // Wooden planks
      for (let px = screenX + 6; px < screenX + width - 6; px += 14) {
        ctx.fillStyle = '#d97706';
        ctx.fillRect(px, y + 2, 10, 8);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(px + 1, y + 8, 8, 4);
      }
    } else if (type === 'cloud') {
      // Fluffy bouncy cloud platform with subtle pulsing
      const bouncePulse = Math.sin(gameTime * 4 + plat.x) * 2;
      ctx.fillStyle = '#ffffff';
      this.drawPuffyCloud(ctx, screenX + 10, y + 12 + bouncePulse, width - 20, height * 0.7);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(screenX + 8, y + height - 4 + bouncePulse, width - 16, 4);
    } else if (type === 'vanishing') {
      // Shimmering crystalline platform
      const alpha = plat.isVisible === false ? 0.25 : 0.85;
      ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
      ctx.fillRect(screenX, y, width, height);
      ctx.strokeStyle = `rgba(238, 242, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, y, width, height);
    } else if (type === 'fortress') {
      // Heavy metallic riveted platform
      ctx.fillStyle = '#475569';
      ctx.fillRect(screenX, y, width, height);
      ctx.fillStyle = '#334155';
      ctx.fillRect(screenX, y + height - 6, width, 6);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(screenX, y, width, 4);
      // Rivets
      ctx.fillStyle = '#cbd5e1';
      for (let rx = screenX + 10; rx < screenX + width; rx += 20) {
        ctx.fillRect(rx, y + 10, 3, 3);
      }
    } else {
      // Ancient sky ruins
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(screenX, y, width, height);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(screenX + 4, y + 6, width - 8, height - 6);
      ctx.fillStyle = '#22c55e'; // Moss
      ctx.fillRect(screenX + 12, y, 16, 3);
      ctx.fillRect(screenX + width - 24, y, 12, 3);
    }
    ctx.restore();
  }

  /**
   * Draws Wind Zones with animated breeze lines
   */
  public drawWindZones(ctx: CanvasRenderingContext2D, windZones: WindZone[], cameraX: number, gameTime: number) {
    ctx.save();
    for (const zone of windZones) {
      const screenX = zone.x - cameraX;
      if (screenX + zone.width < 0 || screenX > 1400) continue;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      const speed = zone.forceX * 0.8;
      for (let i = 0; i < 5; i++) {
        const lineOffset = (gameTime * speed + i * 120) % zone.width;
        const ly = zone.y + 40 + i * 50;
        const lx = screenX + lineOffset;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + 50, ly);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Draws Vehicles (Dirigível, Balão, Aeronave, Plataforma Voadora)
   */
  public drawVehicle(ctx: CanvasRenderingContext2D, vehicle: Vehicle, cameraX: number, gameTime: number) {
    const screenX = vehicle.x - cameraX;
    const { y, width, height, type, isOccupied } = vehicle;

    ctx.save();
    if (type === 'dirigivel') {
      // Steampunk Dirigível
      // Envelope
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(screenX + width / 2, y + height * 0.35, width * 0.5, height * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(screenX + width * 0.25, y + height * 0.25, width * 0.5, 6);

      // Wooden Gondola below
      ctx.fillStyle = '#78350f';
      ctx.fillRect(screenX + width * 0.3, y + height * 0.75, width * 0.4, height * 0.25);

      // Spinning propeller at back
      const propSpin = Math.sin(gameTime * 25) * 8;
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(screenX + 4, y + height * 0.35 + propSpin, 6, 16);
    } else if (type === 'balao') {
      // Hot air balloon
      // Balloon dome
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(screenX + width / 2, y + height * 0.35, width * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(screenX + width / 2, y + height * 0.35, width * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Flame
      ctx.fillStyle = '#f97316';
      ctx.fillRect(screenX + width / 2 - 3, y + height * 0.65, 6, 8);

      // Basket
      ctx.fillStyle = '#92400e';
      ctx.fillRect(screenX + width * 0.38, y + height * 0.78, width * 0.24, height * 0.22);
    } else if (type === 'aeronave') {
      // Sky Jet / Aeronave de HollyTonny
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(screenX + width, y + height / 2);
      ctx.lineTo(screenX + width * 0.2, y);
      ctx.lineTo(screenX, y + height / 2);
      ctx.lineTo(screenX + width * 0.2, y + height);
      ctx.closePath();
      ctx.fill();

      // Cockpit windshield
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(screenX + width * 0.5, y + height * 0.3, 14, 8);

      // Jet Thruster flame
      if (isOccupied) {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(screenX - 10, y + height * 0.35, 12, 8);
      }
    } else {
      // Plataforma voadora
      ctx.fillStyle = '#64748b';
      ctx.fillRect(screenX, y, width, height);
      // Twin propellers
      const propAngle = Math.sin(gameTime * 30) * 10;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(screenX + 8, y + height + propAngle, 14, 4);
      ctx.fillRect(screenX + width - 22, y + height + propAngle, 14, 4);
    }

    // Interactive Prompt when close
    if (!isOccupied) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[E] PILOTAR', screenX + width / 2, y - 8);
    }
    ctx.restore();
  }

  /**
   * Draws the Player Character based on selected skin and animation state
   * Explicitly honors Tonny: Orange rabbit, white velvet gloves, red button nose, tall ears!
   */
  public drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    cameraX: number,
    gameTime: number
  ) {
    if (player.inVehicle) return; // Player is inside vehicle cockpit

    const screenX = player.x - cameraX;
    const { y, width, height, facing, selectedSkin, isGrounded, isDashing, vx, invulnerableTimer } = player;

    // Hit flash flicker
    if (invulnerableTimer > 0 && Math.floor(gameTime * 20) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(screenX + width / 2, y + height / 2);
    ctx.scale(facing, 1);

    // Squash & stretch on jump/landing
    const runBob = isGrounded && Math.abs(vx) > 10 ? Math.sin(gameTime * 14) * 2 : 0;
    const legSwing = isGrounded && Math.abs(vx) > 10 ? Math.sin(gameTime * 14) * 5 : 0;

    // Dash trail effect
    if (isDashing) {
      ctx.fillStyle = 'rgba(249, 115, 22, 0.4)';
      ctx.fillRect(-width * 0.8, -height * 0.5, width, height);
    }

    const skin = selectedSkin;

    if (skin === 'roy_flying') {
      // Roy Guaxinim Voador
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-12, -14 + runBob, 24, 26);
      // Raccoon black eye mask
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, -10 + runBob, 12, 6);
      // Cute eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, -9 + runBob, 4, 4);
      // Bushy striped tail
      ctx.fillStyle = '#475569';
      ctx.fillRect(-22, 0 + runBob, 12, 8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-18, 0 + runBob, 4, 8);
      // Propeller cap
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-8, -20 + runBob, 16, 6);
      const prop = Math.sin(gameTime * 30) * 10;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-14 + prop, -23 + runBob, 28, 3);
    } else if (skin === 'james_pilot') {
      // James Tonny Piloto
      // Brown fur, bomber jacket, aviator goggles
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-11, -12 + runBob, 22, 24);
      // Aviator goggles
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, -9 + runBob, 11, 6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-12, -8 + runBob, 24, 3);
      // Leather jacket
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-11, 2 + runBob, 22, 12);
      // Ears
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-8, -24 + runBob, 6, 12);
      ctx.fillRect(0, -24 + runBob, 6, 12);
    } else if (skin === 'deise_adventurer') {
      // Deise Aventureira
      // Tan/cream fur, pink bandana
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-11, -12 + runBob, 22, 24);
      // Magenta bandana
      ctx.fillStyle = '#db2777';
      ctx.fillRect(-12, -14 + runBob, 24, 6);
      ctx.fillRect(-14, -10 + runBob, 6, 8);
      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(3, -7 + runBob, 4, 5);
      // Ears
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-7, -24 + runBob, 5, 12);
      ctx.fillRect(1, -24 + runBob, 5, 12);
      // Boots
      ctx.fillStyle = '#be185d';
      ctx.fillRect(-8 - legSwing, 12, 7, 7);
      ctx.fillRect(2 + legSwing, 12, 7, 7);
    } else {
      // TONNY COELHO (Clássico, Explorador ou Celeste)
      // VIBRANT ORANGE FUR
      ctx.fillStyle = '#f97316';
      // Body
      ctx.fillRect(-11, -4 + runBob, 22, 18);
      // Head
      ctx.fillRect(-10, -16 + runBob, 20, 14);

      // TALL RABBIT EARS
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-8, -30 + runBob, 6, 15);
      ctx.fillRect(2, -30 + runBob, 6, 15);
      // Pink ear interiors
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(-6, -28 + runBob, 3, 11);
      ctx.fillRect(4, -28 + runBob, 3, 11);

      // CELESTE SKIN: Angel Wings & Halo
      if (skin === 'tonny_celestial') {
        // Golden halo
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -34 + runBob, 10, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Feather wings
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-10, -2 + runBob);
        ctx.lineTo(-24, -14 + runBob);
        ctx.lineTo(-12, 6 + runBob);
        ctx.fill();
      }

      // EXPLORER SKIN: Safari Hat
      if (skin === 'tonny_explorer') {
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-14, -20 + runBob, 28, 5);
        ctx.fillRect(-9, -24 + runBob, 18, 5);
      }

      // BIG EXPRESSIVE EYES
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, -12 + runBob, 6, 7);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, -10 + runBob, 3, 4);

      // BRIGHT RED BUTTON NOSE
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(7, -8 + runBob, 4, 4);

      // CUTE CHEEKS / SMILE
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(3, -5 + runBob, 6, 2);

      // WHITE VELVET GLOVES
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, 0 + runBob, 6, 6);
      ctx.fillRect(6, 0 + runBob, 7, 7);

      // Feet / Running legs
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-9 - legSwing, 12, 7, 6);
      ctx.fillRect(2 + legSwing, 12, 7, 6);
    }

    ctx.restore();
  }

  /**
   * Draws Enemies, including Roy carrying the stolen coffin in 1980 Chapter
   */
  public drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[], cameraX: number, gameTime: number) {
    ctx.save();
    for (const enemy of enemies) {
      const screenX = enemy.x - cameraX;
      const { y, width, height, type, carriesCoffin, isDefeated } = enemy;

      if (screenX + width < -50 || screenX > 1400) continue;

      if (isDefeated) {
        // Falling defeated effect
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.fillRect(screenX, y + 10, width, height * 0.5);
        continue;
      }

      if (carriesCoffin) {
        // ROY RUNNING AND DRAGGING / CARRYING THE COFFIN
        const runBob = Math.sin(gameTime * 16) * 3;

        // Roy sprite
        ctx.fillStyle = '#475569';
        ctx.fillRect(screenX + 16, y - 6 + runBob, 26, 32);
        // Mask
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(screenX + 30, y - 2 + runBob, 12, 7);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(screenX + 34, y - 1 + runBob, 4, 4);
        // Raccoon tail
        ctx.fillStyle = '#334155';
        ctx.fillRect(screenX + 6, y + 12 + runBob, 12, 8);

        // THE ORNATE WOODEN COFFIN WITH BRASS TRIMS
        ctx.fillStyle = '#451a03'; // Rich dark mahogany wood
        ctx.beginPath();
        // Coffin polygon silhouette
        const cofX = screenX - 22;
        const cofY = y + 4 + runBob;
        ctx.moveTo(cofX, cofY + 10);
        ctx.lineTo(cofX + 12, cofY);
        ctx.lineTo(cofX + 40, cofY + 2);
        ctx.lineTo(cofX + 46, cofY + 26);
        ctx.lineTo(cofX + 38, cofY + 36);
        ctx.lineTo(cofX + 4, cofY + 32);
        ctx.closePath();
        ctx.fill();

        // Brass handles and cross/crest trim
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cofX + 18, cofY + 12, 14, 3);
        ctx.fillRect(cofX + 23, cofY + 6, 4, 15);
      } else if (type === 'sky_crow') {
        // Flapping sky bird
        const wing = Math.sin(gameTime * 12) * 8;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(screenX + 6, y + 8, 20, 16);
        // Wings
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(screenX, y + 4 + wing, 10, 8);
        ctx.fillRect(screenX + 22, y + 4 + wing, 10, 8);
        // Beak
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(screenX + 24, y + 12, 8, 5);
      } else if (type === 'cloud_bat') {
        // Puffy cloud bat
        const wing = Math.sin(gameTime * 14) * 6;
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(screenX + 8, y + 8, 16, 16);
        ctx.fillStyle = '#4338ca';
        ctx.fillRect(screenX, y + 2 + wing, 8, 14);
        ctx.fillRect(screenX + 24, y + 2 + wing, 8, 14);
        // Red glowing eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(screenX + 12, y + 12, 3, 3);
        ctx.fillRect(screenX + 18, y + 12, 3, 3);
      }
    }
    ctx.restore();
  }

  /**
   * Draws Bosses (Guardião das Nuvens, Fortaleza Voadora, Pizza Lord, Roy, Sorvete)
   */
  public drawBoss(ctx: CanvasRenderingContext2D, boss: Boss, cameraX: number, gameTime: number) {
    const screenX = boss.x - cameraX;
    const { y, width, height, type, state, hp, maxHp, telegraphTimer } = boss;

    ctx.save();
    const bob = Math.sin(gameTime * 3) * 6;

    // Boss Telegraph Flash
    if (telegraphTimer > 0) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.arc(screenX + width / 2, y + height / 2, width * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    if (type === 'guardian_clouds') {
      // Colossal Cloud Guardian
      // Fluffy cloud wings
      const wingFlap = Math.sin(gameTime * 8) * 12;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(screenX - 10, y + 20 + wingFlap, 26, 0, Math.PI * 2);
      ctx.arc(screenX + width + 10, y + 20 + wingFlap, 26, 0, Math.PI * 2);
      ctx.fill();

      // Golden Armor body
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(screenX + 12, y + 10 + bob, width - 24, height - 20);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(screenX + 16, y + 20 + bob, width - 32, height - 32);

      // Celestial Crest Crown
      ctx.fillStyle = '#facc15';
      ctx.fillRect(screenX + 20, y - 6 + bob, width - 40, 14);
      ctx.fillRect(screenX + 28, y - 14 + bob, 16, 10);

      // Glowing Cyan Guardian Eyes
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(screenX + 24, y + 22 + bob, 8, 8);
      ctx.fillRect(screenX + width - 32, y + 22 + bob, 8, 8);
    } else if (type === 'fortress_boss') {
      // Steampunk Fortress Core Titan
      ctx.fillStyle = '#334155';
      ctx.fillRect(screenX, y + bob, width, height);

      // Rotating gear shield
      const gearSpin = gameTime * 4;
      ctx.save();
      ctx.translate(screenX + width / 2, y + height / 2 + bob);
      ctx.rotate(gearSpin);
      ctx.fillStyle = '#64748b';
      for (let g = 0; g < 4; g++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(-width * 0.45, -6, width * 0.9, 12);
      }
      ctx.restore();

      // Reactor Eye Core
      ctx.fillStyle = boss.phase === 1 ? '#eab308' : '#ef4444';
      ctx.beginPath();
      ctx.arc(screenX + width / 2, y + height / 2 + bob, 22, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'pizza_lord') {
      // Pizza Lord
      ctx.fillStyle = '#f59e0b'; // Crust
      ctx.beginPath();
      ctx.arc(screenX + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626'; // Pepperoni
      ctx.beginPath();
      ctx.arc(screenX + 22, y + 26, 8, 0, Math.PI * 2);
      ctx.arc(screenX + width - 24, y + 34, 8, 0, Math.PI * 2);
      ctx.arc(screenX + width / 2, y + height - 20, 8, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(screenX + 24, y + 16, 6, 6);
      ctx.fillRect(screenX + width - 30, y + 16, 6, 6);
    } else {
      // Generic Boss
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(screenX, y + bob, width, height);
    }

    // Boss Name & HP Bar
    const barWidth = 260;
    const barX = ctx.canvas.width / 2 - barWidth / 2;
    const barY = 24;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(barX - 4, barY - 4, barWidth + 8, 24);

    const hpPercent = Math.max(0, hp / maxHp);
    ctx.fillStyle = hpPercent > 0.4 ? '#ef4444' : '#dc2626';
    ctx.fillRect(barX, barY, barWidth * hpPercent, 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${boss.name} [${Math.round(hp)}/${maxHp}]`, ctx.canvas.width / 2, barY + 12);

    ctx.restore();
  }

  /**
   * Draws Projectiles with weapon-specific visual styling
   */
  public drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[], cameraX: number, gameTime: number) {
    ctx.save();
    for (const p of projectiles) {
      const screenX = p.x - cameraX;
      if (screenX < -20 || screenX > 1400) continue;

      if (p.weaponType === 'bubble') {
        // Translucent shimmering bubble
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Bubble shine glint
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(screenX - p.radius * 0.4, p.y - p.radius * 0.4, 3, 3);
      } else if (p.weaponType === 'foam') {
        // Sticky fluffy foam blob
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(screenX, p.y, p.radius, 0, Math.PI * 2);
        ctx.arc(screenX - 4, p.y + 2, p.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.weaponType === 'star') {
        // Spinning four-pointed star
        ctx.save();
        ctx.translate(screenX, p.y);
        ctx.rotate(gameTime * 20);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-p.radius, -2, p.radius * 2, 4);
        ctx.fillRect(-2, -p.radius, 4, p.radius * 2);
        ctx.restore();
      } else if (p.weaponType === 'wind') {
        // Wind whirl blast
        ctx.strokeStyle = '#a7f3d0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, p.y, p.radius, 0, Math.PI * 1.5);
        ctx.stroke();
      } else {
        // Default or enemy projectile
        ctx.fillStyle = p.color || '#ef4444';
        ctx.beginPath();
        ctx.arc(screenX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /**
   * Draws Collectibles (Coins, Secrets, Hearts)
   */
  public drawCollectibles(ctx: CanvasRenderingContext2D, items: Collectible[], cameraX: number, gameTime: number) {
    ctx.save();
    for (const item of items) {
      if (item.collected) continue;
      const screenX = item.x - cameraX;
      if (screenX < -30 || screenX > 1400) continue;

      const bob = Math.sin(gameTime * 6 + item.x) * 4;
      const cy = item.y + bob;

      if (item.type === 'coin') {
        // Spinning golden coin
        const coinW = Math.abs(Math.cos(gameTime * 6 + item.x)) * 12 + 2;
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(screenX, cy, coinW / 2, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(screenX, cy, (coinW / 2) * 0.6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'secret_coin') {
        // Large glowing purple/blue secret coin
        ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.beginPath();
        ctx.arc(screenX, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(screenX, cy, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('S', screenX, cy + 3);
      } else if (item.type === 'star_relic') {
        // Glowing celestial star relic
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(screenX, cy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(screenX, cy, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'heart') {
        // Red vitality heart
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(screenX - 4, cy - 2, 5, 0, Math.PI * 2);
        ctx.arc(screenX + 4, cy - 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(screenX - 9, cy);
        ctx.lineTo(screenX + 9, cy);
        ctx.lineTo(screenX, cy + 9);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

export const pixelRenderer = new PixelArtRenderer();
