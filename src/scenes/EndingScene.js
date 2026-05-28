import Phaser from 'phaser';
// EndingScene.js — thank-you screen, then results.
import { SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_X, CENTER_Y } from '../constants.js';
import * as Sound from '../sound.js';

export class EndingScene extends Phaser.Scene {
  constructor() { super(SCENES.ENDING); }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0);
    this.add.image(CENTER_X, CENTER_Y, 'game_ui', 'advBgDone.gif').setOrigin(0.5);
    Sound.play('voice_thankyou');
    this.time.delayedCall(4000, () => this.scene.start(SCENES.RESULT));
  }
}
