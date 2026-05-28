import Phaser from 'phaser';
// PreloadScene.js — loads every asset, shows a loading bar, then the PC/SP mode select.
import { ATLASES, IMAGES, SOUNDS, RECIPE, SCENES, GAME_WIDTH, CENTER_X, CENTER_Y, LANG } from '../constants.js';
import { gameState, loadHighScore } from '../state.js';
import { Button } from '../ui/Button.js';
import * as Sound from '../sound.js';

export class PreloadScene extends Phaser.Scene {
  constructor() { super(SCENES.PRELOAD); }

  preload() {
    const barBg = this.add.rectangle(CENTER_X, CENTER_Y, 180, 10, 0x333333);
    const bar = this.add.rectangle(CENTER_X - 90, CENTER_Y, 0, 8, 0xffffff).setOrigin(0, 0.5);
    this.load.on('progress', (p) => { bar.width = 180 * p; });
    this.load.on('complete', () => { barBg.destroy(); bar.destroy(); });

    for (const key in ATLASES) this.load.atlas(key, ATLASES[key][1], ATLASES[key][0]);
    for (const key in IMAGES) this.load.image(key, IMAGES[key]);
    this.load.json(RECIPE.key, RECIPE.path);
    for (const key in SOUNDS) this.load.audio(key, SOUNDS[key]);
  }

  create() {
    loadHighScore();
    this.title = this.add.image(CENTER_X, 100, 'title_ui', 'modeSelectTxt.gif').setOrigin(0.5);

    this.pcBtn = new Button(this, 'title_ui', ['playBtnPc0.gif', 'playBtnPc1.gif'], () => this.choose(false), { origin: 0.5 });
    this.pcBtn.setPosition(CENTER_X, 170);
    this.pcTxt = this.add.image(CENTER_X, 205, 'title_ui', 'playBtnPcTxt.gif').setOrigin(0.5);

    this.spBtn = new Button(this, 'title_ui', ['playBtnSp0.gif', 'playBtnSp1.gif'], () => this.choose(true), { origin: 0.5 });
    this.spBtn.setPosition(CENTER_X, 255);
    this.spTxt = this.add.image(CENTER_X, 290, 'title_ui', 'playBtnSpTxt.gif').setOrigin(0.5);

    const recFrame = `recommendBtn0${LANG === 'ja' ? '' : '_en'}.gif`;
    this.recBtn = new Button(this, 'title_ui', [recFrame], () => this.openRecommend(), { origin: 0.5 });
    this.recBtn.setPosition(CENTER_X, 350);
  }

  openRecommend() {
    const frame = `recommendModal${LANG === 'ja' ? '' : '_en'}.gif`;
    const modal = this.add.image(CENTER_X, CENTER_Y, 'title_ui', frame).setOrigin(0.5).setDepth(100).setScale(0);
    const close = this.add.image(modal.x + modal.width / 2 - 4, modal.y - modal.height / 2 + 4, 'title_ui', 'recommendModalCloseBtn.gif')
      .setOrigin(1, 0).setDepth(101).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: modal, scale: 1, duration: 200, ease: 'Back.easeOut' });
    close.on('pointerup', () => { modal.destroy(); close.destroy(); });
  }

  choose(lowMode) {
    gameState.lowModeFlg = lowMode;
    this.scene.start(SCENES.TITLE);
  }
}
