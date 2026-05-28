import Phaser from 'phaser';
// AnimatedItem.js — falling power-up dropped by enemies.
import { ensureAnim, speedToFps } from '../anims.js';

export class AnimatedItem extends Phaser.GameObjects.Container {
  constructor(scene, frameNames, itemName) {
    super(scene, 0, 0);
    this.itemName = itemName;
    const animKey = ensureAnim(scene, 'game_asset', frameNames, { fps: speedToFps(0.15) });
    this.sprite = scene.add.sprite(0, 0, 'game_asset', frameNames[0]).setOrigin(0.5);
    this.sprite.play(animKey);
    this.add(this.sprite);
    const w = this.sprite.width, h = this.sprite.height;
    this.hitArea = { x: -w / 2, y: -h / 2, width: w, height: h };
    scene.add.existing(this);
  }

  loop() { /* falling handled by scene */ }
}
