import Phaser from 'phaser';
// AdvScene.js — short story interlude before each stage. Tap / space to continue.
import { SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_X, CENTER_Y } from '../constants.js';
import { gameState } from '../state.js';
import * as Sound from '../sound.js';

export class AdvScene extends Phaser.Scene {
  constructor() { super(SCENES.ADV); }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0);
    Sound.bgmPlay('adventure_bgm');
    Sound.play('g_adbenture_voice0');

    this.panels = gameState.stageId === 0
      ? ['advBg0.gif', 'advBg1.gif', 'advBg2.gif', 'advBg3.gif']
      : [`advBg${Math.min(gameState.stageId, 3)}.gif`];
    this.index = 0;
    this.panel = this.add.image(CENTER_X, CENTER_Y, 'game_ui', this.panels[0]).setOrigin(0.5);
    this.hint = this.add.image(GAME_WIDTH - 6, GAME_HEIGHT - 6, 'game_ui', 'advBgDone.gif').setOrigin(1, 1);

    this.input.on('pointerup', () => this.next());
    this.input.keyboard.on('keydown-SPACE', () => this.next());
  }

  next() {
    Sound.play('se_decision');
    this.index++;
    if (this.index >= this.panels.length) { this.finish(); return; }
    this.panel.setTexture('game_ui', this.panels[this.index]);
  }

  finish() {
    Sound.stopBgm('adventure_bgm');
    this.scene.start(SCENES.GAME);
  }
}
