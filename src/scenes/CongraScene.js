import Phaser from 'phaser';
// CongraScene.js — congratulations on clearing the final stage.
import { SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_X, CENTER_Y } from '../constants.js';
import * as Sound from '../sound.js';

export class CongraScene extends Phaser.Scene {
  constructor() { super(SCENES.CONGRA); }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0);
    this.add.image(CENTER_X, CENTER_Y - 40, 'game_ui', 'congraBg0.gif').setOrigin(0.5);
    this.add.image(CENTER_X, CENTER_Y + 60, 'game_ui', 'congraTxt0.gif').setOrigin(0.5);
    Sound.play('voice_congra');
    this.input.once('pointerup', () => this.scene.start(SCENES.ENDING));
    this.time.delayedCall(5000, () => this.scene.start(SCENES.ENDING));
  }
}
