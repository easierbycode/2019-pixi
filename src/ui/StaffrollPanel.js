import Phaser from 'phaser';
// StaffrollPanel.js — overlay shown from the title's staff-roll button.
import { GAME_WIDTH, GAME_HEIGHT, CENTER_X, CENTER_Y } from '../constants.js';
import { ensureAnim, speedToFps, frameRange } from '../anims.js';
import * as Sound from '../sound.js';

export class StaffrollPanel extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    this.cover = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.92).setOrigin(0, 0).setInteractive();
    this.add(this.cover);

    const frames = frameRange('staffrollG', 8);
    const anim = ensureAnim(scene, 'game_ui', frames, { fps: speedToFps(0.12) });
    this.logo = scene.add.sprite(CENTER_X, CENTER_Y - 40, 'game_ui', frames[0]).setOrigin(0.5).play(anim);
    this.nameImg = scene.add.image(CENTER_X, CENTER_Y + 60, 'game_ui', 'staffrollName.gif').setOrigin(0.5);
    this.add([this.logo, this.nameImg]);

    this.closeBtn = scene.add.image(GAME_WIDTH - 12, 12, 'game_ui', 'staffrollCloseBtn.gif')
      .setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.closeBtn.on('pointerup', () => { Sound.play('se_cursor_sub'); this.close(); });
    this.add(this.closeBtn);

    scene.add.existing(this);
  }

  close() { this.destroy(); }
}
