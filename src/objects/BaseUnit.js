import Phaser from 'phaser';
// BaseUnit.js — Phaser Container base for player/enemy/bullet/boss.
// Holds an animated `character` sprite, a mirrored `shadow`, an optional
// `explosion` sprite, and an AABB `hitArea` rectangle (local, centre-relative).
import { ensureAnim, speedToFps } from '../anims.js';

export const EVT = {
  DEAD: 'unit:dead',
  DEAD_COMPLETE: 'unit:deadComplete',
  TAMA_ADD: 'unit:tamaAdd',
  BULLET_ADD: 'unit:bulletAdd',
};

export class BaseUnit extends Phaser.GameObjects.Container {
  constructor(scene, atlasKey, frameNames, opts = {}) {
    super(scene, 0, 0);
    this.atlasKey = atlasKey;
    this.shadowReverse = true;
    this.shadowOffsetY = 0;
    this.speed = 0;
    this.hp = 1;
    this.deadFlg = false;

    const fps = speedToFps(opts.animationSpeed ?? 0.1);
    const animKey = ensureAnim(scene, atlasKey, frameNames, { fps });

    this.shadow = scene.add.sprite(0, 0, atlasKey, frameNames[0]).setOrigin(0.5);
    this.shadow.setTint(0x000000).setAlpha(0.5);
    this.shadow.play(animKey);

    this.character = scene.add.sprite(0, 0, atlasKey, frameNames[0]).setOrigin(0.5);
    this.character.play(animKey);

    this.add([this.shadow, this.character]);

    const w = this.character.width;
    const h = this.character.height;
    this.hitArea = { x: -w / 2, y: -h / 2, width: w, height: h };

    if (opts.explosionFrames && opts.explosionFrames.length) {
      this.explosion = scene.add.sprite(0, 0, atlasKey, opts.explosionFrames[0]).setOrigin(0.5);
      this.explosionAnim = ensureAnim(scene, atlasKey, opts.explosionFrames, {
        fps: speedToFps(0.4), repeat: 0,
      });
      this.explosion.setVisible(false);
      const scaleFactor = Math.min(1, (h + 50) / this.explosion.height) + 0.2;
      this.explosion.setScale(scaleFactor);
      this.add(this.explosion);
    } else {
      this.explosion = null;
    }

    this.updateShadowPosition();
    scene.add.existing(this);
  }

  updateShadowPosition() {
    if (!this.shadow) return;
    this.shadow.x = this.character.x;
    this.shadow.flipY = this.shadowReverse;
    this.shadow.y = this.character.y + this.character.displayHeight - this.shadowOffsetY;
  }

  // Brief red hit flash, restored after `delayMs`.
  flashTint(color = 0xff0000, delayMs = 100) {
    if (!this.character) return;
    this.character.setTint(color);
    this.scene.time.delayedCall(delayMs, () => this.character && this.character.clearTint());
  }

  playExplosion(onDone) {
    if (!this.explosion) { onDone && onDone(); return; }
    this.explosion.setVisible(true);
    this.explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.explosion && this.explosion.setVisible(false);
      onDone && onDone();
    });
    this.explosion.play(this.explosionAnim);
  }

  destroy(fromScene) {
    this.character = null;
    this.shadow = null;
    this.explosion = null;
    super.destroy(fromScene);
  }
}
