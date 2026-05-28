import Phaser from 'phaser';
// CutinContainer.js — Critical Art cut-in animation (cutin0..8).
import { CENTER_X, CENTER_Y } from '../constants.js';
import { ensureAnim, speedToFps, frameRange } from '../anims.js';

export class CutinContainer extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    const frames = frameRange('cutin', 9);
    this.anim = ensureAnim(scene, 'game_asset', frames, { fps: speedToFps(0.25), repeat: 0 });
    this.sprite = scene.add.sprite(CENTER_X, CENTER_Y, 'game_asset', frames[0]).setOrigin(0.5);
    this.add(this.sprite);
    this.setVisible(false);
    scene.add.existing(this);
  }

  start() {
    this.setVisible(true);
    this.sprite.play(this.anim);
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.setVisible(false));
  }
}
