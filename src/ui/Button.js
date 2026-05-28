import Phaser from 'phaser';
// Button.js — simple two/three-frame image button.
import * as Sound from '../sound.js';

export class Button extends Phaser.GameObjects.Container {
  constructor(scene, atlas, frames, onUp, { origin = 0 } = {}) {
    super(scene, 0, 0);
    this.frames = frames;
    this.img = scene.add.image(0, 0, atlas, frames[0]).setOrigin(origin);
    this.add(this.img);
    this.img.setInteractive({ useHandCursor: true });
    this.img.on('pointerover', () => { if (frames[1]) this.img.setTexture(atlas, frames[1]); Sound.play('se_cursor'); });
    this.img.on('pointerout', () => this.img.setTexture(atlas, frames[0]));
    this.img.on('pointerdown', () => { if (frames[2] || frames[1]) this.img.setTexture(atlas, frames[2] || frames[1]); });
    this.img.on('pointerup', () => { Sound.play('se_decision'); onUp && onUp(); });
    scene.add.existing(this);
  }

  setEnabled(on) { if (on) this.img.setInteractive(); else this.img.disableInteractive(); }
}
