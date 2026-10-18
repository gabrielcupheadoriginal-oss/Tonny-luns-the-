import type { Platform, WindZone, Vehicle, PlayerState } from '../types/game.ts';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Checks whether two 2D Axis-Aligned Bounding Boxes intersect
 */
export function checkAABB(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Resolves player collision with a platform from above (landing)
 */
export function resolvePlatformLanding(
  player: { x: number; y: number; width: number; height: number; vy: number; prevY: number },
  platform: Platform
): { landed: boolean; newY: number; bounceVy?: number } {
  // If vanishing and invisible, cannot land
  if (platform.type === 'vanishing' && platform.isVisible === false) {
    return { landed: false, newY: player.y };
  }

  const footPrevY = player.prevY + player.height;
  const footCurrY = player.y + player.height;
  const platTopY = platform.y;

  const withinX =
    player.x + player.width * 0.8 > platform.x &&
    player.x + player.width * 0.2 < platform.x + platform.width;

  // Player must be falling downwards and crossing the top edge of the platform
  if (withinX && player.vy >= 0 && footPrevY <= platTopY + 16 && footCurrY >= platTopY - 2) {
    const bounceVy = platform.isBouncy ? -620 : undefined;
    return {
      landed: true,
      newY: platTopY - player.height,
      bounceVy,
    };
  }

  return { landed: false, newY: player.y };
}

/**
 * Calculates net wind acceleration on an entity based on active wind zones
 */
export function calculateNetWind(
  x: number,
  y: number,
  width: number,
  height: number,
  windZones: WindZone[]
): { windX: number; windY: number } {
  let windX = 0;
  let windY = 0;

  const box = { x, y, width, height };
  for (const zone of windZones) {
    if (checkAABB(box, zone)) {
      windX += zone.forceX;
      windY += zone.forceY;
    }
  }

  return { windX, windY };
}

/**
 * Applies jump intent logic
 */
export function performJump(
  jumpsRemaining: number,
  baseJumpForce = -490,
  doubleJumpForce = -440
): { canJump: boolean; vy: number; jumpsRemaining: number } {
  if (jumpsRemaining <= 0) {
    return { canJump: false, vy: 0, jumpsRemaining: 0 };
  }

  const isDoubleJump = jumpsRemaining === 1;
  const vy = isDoubleJump ? doubleJumpForce : baseJumpForce;
  return {
    canJump: true,
    vy,
    jumpsRemaining: jumpsRemaining - 1,
  };
}

/**
 * Applies dash intent logic
 */
export function performDash(
  canDash: boolean,
  facing: 1 | -1,
  dashSpeed = 750,
  dashDuration = 0.22,
  dashCooldown = 0.7
): { isDashing: boolean; vx: number; dashTimer: number; dashCooldown: number } {
  if (!canDash) {
    return { isDashing: false, vx: 0, dashTimer: 0, dashCooldown: 0 };
  }

  return {
    isDashing: true,
    vx: facing * dashSpeed,
    dashTimer: dashDuration,
    dashCooldown,
  };
}

/**
 * Updates vehicle position and velocity with bounds checking
 */
export function updateVehiclePhysics(
  vehicle: Vehicle,
  dt: number,
  input: { x: number; y: number }
): Vehicle {
  const updated = { ...vehicle };

  // Apply acceleration towards input
  if (input.x !== 0) {
    updated.vx += input.x * updated.acceleration * dt;
  } else {
    // Deceleration
    updated.vx *= Math.pow(0.1, dt);
  }

  if (input.y !== 0) {
    updated.vy += input.y * updated.acceleration * dt;
  } else {
    // Slight air drag or float
    if (updated.type === 'balao') {
      // Gentle natural buoyancy
      updated.vy += (Math.sin(Date.now() / 600) * 8 - updated.vy) * dt;
    } else {
      updated.vy *= Math.pow(0.1, dt);
    }
  }

  // Speed clamping
  const speed = Math.hypot(updated.vx, updated.vy);
  if (speed > updated.maxSpeed) {
    const scale = updated.maxSpeed / speed;
    updated.vx *= scale;
    updated.vy *= scale;
  }

  // Position update
  updated.x += updated.vx * dt;
  updated.y += updated.vy * dt;

  // Bounds
  if (updated.minX !== undefined && updated.x < updated.minX) {
    updated.x = updated.minX;
    updated.vx = 0;
  }
  if (updated.maxX !== undefined && updated.x > updated.maxX) {
    updated.x = updated.maxX;
    updated.vx = 0;
  }
  if (updated.minY !== undefined && updated.y < updated.minY) {
    updated.y = updated.minY;
    updated.vy = 0;
  }
  if (updated.maxY !== undefined && updated.y > updated.maxY) {
    updated.y = updated.maxY;
    updated.vy = 0;
  }

  return updated;
}

/**
 * Calculates chase distance & progress percentage in 1980 Roy chase
 */
export function calculateChaseProgress(
  playerX: number,
  royX: number,
  startDistance = 450,
  targetDistance = 3200
): { distanceMeters: number; progressPercent: number; caught: boolean } {
  const dist = Math.max(0, royX - playerX);
  const progress = Math.min(100, Math.max(0, (playerX / targetDistance) * 100));
  const caught = dist <= 42 || playerX >= targetDistance;

  return {
    distanceMeters: Math.round(dist / 10),
    progressPercent: Math.round(progress),
    caught,
  };
}
