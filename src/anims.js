// anims.js — helpers to register Phaser animations from atlas frame-name lists.
// PIXI AnimatedSprite.animationSpeed (fraction/tick @60fps) maps to frameRate = speed*60.

export function speedToFps(animationSpeed) {
  return Math.max(1, Math.round(animationSpeed * 60));
}

let autoId = 0;

// Register an animation (idempotent) and return its key.
// The default key stays compact (first frame + count + cadence) instead of joining every frame name.
export function ensureAnim(scene, atlasKey, frameNames, { fps = 12, repeat = -1, key } = {}) {
  const animKey = key
    || `${atlasKey}:${frameNames[0]}:${frameNames.length}:${fps}:${repeat}`;
  if (!scene.anims.exists(animKey)) {
    scene.anims.create({
      key: animKey,
      frames: frameNames.map((frame) => ({ key: atlasKey, frame })),
      frameRate: fps,
      repeat,
    });
  }
  return animKey;
}

// Build a list of frame names "<base><i>.gif" for i in [0,count).
export function frameRange(base, count, pad = 0) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(`${base}${String(i).padStart(pad, '0')}.gif`);
  }
  return out;
}

export function nextAnimId() {
  return ++autoId;
}
