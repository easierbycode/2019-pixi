import Phaser from 'phaser';
// ContinueScene.js — countdown + Yes/No continue prompt.
import { SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_X, CENTER_Y } from '../constants.js';
import { gameState } from '../state.js';
import { Button } from '../ui/Button.js';
import * as Sound from '../sound.js';

export class ContinueScene extends Phaser.Scene {
  constructor() { super(SCENES.CONTINUE); }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0);
    Sound.bgmPlay('bgm_continue');
    this.add.image(CENTER_X, 70, 'game_ui', 'continueTitle.gif').setOrigin(0.5);
    this.add.image(CENTER_X, 150, 'game_ui', 'continueFace0.gif').setOrigin(0.5);
    this.add.image(CENTER_X, CENTER_Y, 'game_ui', 'countdownBg.gif').setOrigin(0.5);
    this.num = this.add.image(CENTER_X, CENTER_Y, 'game_ui', 'countdown9.gif').setOrigin(0.5);

    this.yesBtn = new Button(this, 'game_ui', ['continueYes.gif', 'continueYesOver.gif', 'continueYesDown.gif'],
      () => this.continueYes(), { origin: 0.5 });
    this.yesBtn.setPosition(CENTER_X - 50, GAME_HEIGHT - 80);
    this.noBtn = new Button(this, 'game_ui', ['continueNo.gif', 'continueNoOver.gif', 'continueNoDown.gif'],
      () => this.continueNo(), { origin: 0.5 });
    this.noBtn.setPosition(CENTER_X + 50, GAME_HEIGHT - 80);

    this.count = 9;
    this.decided = false;
    this.timer = this.time.addEvent({ delay: 1000, repeat: 9, callback: () => this.tick() });
  }

  tick() {
    if (this.decided) return;
    this.count--;
    if (this.count >= 0) { this.num.setTexture('game_ui', `countdown${this.count}.gif`); Sound.play(`voice_countdown${this.count}`); }
    if (this.count <= 0) this.continueNo();
  }

  continueYes() {
    if (this.decided) return;
    this.decided = true;
    Sound.play('g_continue_yes_voice0');
    Sound.stopBgm('bgm_continue');
    gameState.continueCnt++;
    gameState.playerHp = gameState.playerMaxHp;
    gameState.combo = 0;
    this.scene.start(SCENES.GAME);
  }

  continueNo() {
    if (this.decided) return;
    this.decided = true;
    Sound.play('g_continue_no_voice0');
    Sound.stopBgm('bgm_continue');
    this.scene.start(SCENES.GAMEOVER);
  }
}
