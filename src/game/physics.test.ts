import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkAABB,
  resolvePlatformLanding,
  calculateNetWind,
  performJump,
  performDash,
  updateVehiclePhysics,
  calculateChaseProgress,
} from './physics.ts';

test('checkAABB correctly detects intersecting and non-intersecting boxes', () => {
  const boxA = { x: 10, y: 10, width: 20, height: 20 };
  const boxB = { x: 25, y: 25, width: 20, height: 20 }; // Overlaps
  const boxC = { x: 50, y: 50, width: 20, height: 20 }; // Disjoint

  assert.equal(checkAABB(boxA, boxB), true);
  assert.equal(checkAABB(boxA, boxC), false);
});

test('resolvePlatformLanding detects downward landing and blocks landing when invisible', () => {
  const platform = {
    id: 'p1',
    x: 100,
    y: 200,
    width: 100,
    height: 20,
    type: 'island' as const,
  };

  // Falling down onto platform: player was at y: 160 (feet at 192), moving to y: 172 (feet at 204)
  const playerLanding = {
    x: 120,
    y: 172,
    width: 24,
    height: 32,
    vy: 120,
    prevY: 160,
  };

  const res = resolvePlatformLanding(playerLanding, platform);
  assert.equal(res.landed, true);
  assert.equal(res.newY, 200 - 32);

  // When platform is invisible vanishing platform
  const vanishingPlatform = {
    ...platform,
    type: 'vanishing' as const,
    isVisible: false,
  };
  const resVanishing = resolvePlatformLanding(playerLanding, vanishingPlatform);
  assert.equal(resVanishing.landed, false);
});

test('calculateNetWind aggregates active wind forces in overlapping zones', () => {
  const windZones = [
    { x: 0, y: 0, width: 100, height: 100, forceX: 120, forceY: -50 },
    { x: 50, y: 0, width: 100, height: 100, forceX: 80, forceY: 0 },
  ];

  // Inside both zones
  const netWindInsideBoth = calculateNetWind(60, 20, 20, 20, windZones);
  assert.equal(netWindInsideBoth.windX, 200);
  assert.equal(netWindInsideBoth.windY, -50);

  // Outside all zones
  const netWindOutside = calculateNetWind(200, 200, 20, 20, windZones);
  assert.equal(netWindOutside.windX, 0);
  assert.equal(netWindOutside.windY, 0);
});

test('performJump correctly handles normal jump and double jump consumption', () => {
  const firstJump = performJump(2);
  assert.equal(firstJump.canJump, true);
  assert.equal(firstJump.jumpsRemaining, 1);
  assert.equal(firstJump.vy, -490);

  const doubleJump = performJump(firstJump.jumpsRemaining);
  assert.equal(doubleJump.canJump, true);
  assert.equal(doubleJump.jumpsRemaining, 0);
  assert.equal(doubleJump.vy, -440);

  const thirdAttempt = performJump(doubleJump.jumpsRemaining);
  assert.equal(thirdAttempt.canJump, false);
  assert.equal(thirdAttempt.jumpsRemaining, 0);
});

test('performDash applies impulse velocity and starts timer', () => {
  const dashRight = performDash(true, 1, 700, 0.2, 0.6);
  assert.equal(dashRight.isDashing, true);
  assert.equal(dashRight.vx, 700);
  assert.equal(dashRight.dashTimer, 0.2);

  const dashLeft = performDash(true, -1, 700, 0.2, 0.6);
  assert.equal(dashLeft.vx, -700);

  const blockedDash = performDash(false, 1);
  assert.equal(blockedDash.isDashing, false);
  assert.equal(blockedDash.vx, 0);
});

test('updateVehiclePhysics clamps speeds and respects boundaries', () => {
  const vehicle = {
    id: 'v1',
    type: 'aeronave' as const,
    x: 100,
    y: 100,
    width: 60,
    height: 30,
    vx: 0,
    vy: 0,
    isOccupied: true,
    maxSpeed: 300,
    acceleration: 400,
    minX: 50,
    maxX: 500,
  };

  const moved = updateVehiclePhysics(vehicle, 0.1, { x: 1, y: 0 });
  assert.ok(moved.vx > 0);
  assert.ok(moved.x > 100);

  // Test boundary clamping
  const atMax = { ...vehicle, x: 495, vx: 200 };
  const clamped = updateVehiclePhysics(atMax, 0.1, { x: 1, y: 0 });
  assert.equal(clamped.x, 500);
});

test('calculateChaseProgress outputs accurate meters, progress percentage, and catch trigger', () => {
  const early = calculateChaseProgress(0, 450, 450, 3000);
  assert.equal(early.progressPercent, 0);
  assert.equal(early.caught, false);
  assert.equal(early.distanceMeters, 45);

  const midpoint = calculateChaseProgress(1500, 1600, 450, 3000);
  assert.equal(midpoint.progressPercent, 50);
  assert.equal(midpoint.distanceMeters, 10);
  assert.equal(midpoint.caught, false);

  const caught = calculateChaseProgress(2950, 2970, 450, 3000);
  assert.equal(caught.caught, true);
});
