import Phaser from 'phaser';
// GameoverScene.js — brief GAME OVER, then results.
import { SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_X, CENTER_Y } from '../constants.js';
import * as Sound from '../sound.js';

export class GameoverScene extends Phaser.Scene {
  constructor() { super(SCENES.GAMEOVER); }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0);
    this.add.image(CENTER_X, CENTER_Y, 'game_ui', 'continueGameOver.gif').setOrigin(0.5);
    Sound.play('voice_gameover');
    Sound.bgmPlay('bgm_gameover');
    this.time.delayedCall(3000, () => { Sound.stopBgm('bgm_gameover'); this.scene.start(SCENES.RESULT); });
  }
}
