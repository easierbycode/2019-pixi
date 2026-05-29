import Phaser from 'phaser';
// PreloadScene.js — plays the original loading spinner while downloading every asset,
// then shows the PC/SP mode select (left-aligned, matching the original layout).
import { ATLASES, IMAGES, SOUNDS, RECIPE, SCENES, CENTER_X, CENTER_Y, LANG } from '../constants.js';
import { gameState, loadHighScore } from '../state.js';
import { Button } from '../ui/Button.js';
import * as Sound from '../sound.js';

export class PreloadScene extends Phaser.Scene {
  constructor() { super(SCENES.PRELOAD); }

  create() {
    // Original loading visuals: faint flipping backdrop + animated spinner.
    this.loadingBg = this.add.image(CENTER_X, CENTER_Y, 'loading_bg').setOrigin(0.5).setAlpha(0.09);
    this.flipCnt = 0;
    if (!this.anims.exists('loadingSpin')) {
      this.anims.create({
        key: 'loadingSpin',
        frames: [{ key: 'loading0' }, { key: 'loading1' }, { key: 'loading2' }],
        frameRate: 9,
        repeat: -1,
      });
    }
    this.loadingG = this.add.sprite(CENTER_X, CENTER_Y, 'loading0').setOrigin(0.5).play('loadingSpin');

    // Queue the full asset set and run the loader (scene is live, so update() ticks).
    for (const key in ATLASES) this.load.atlas(key, ATLASES[key][1], ATLASES[key][0]);
    for (const key in IMAGES) this.load.image(key, IMAGES[key]);
    this.load.json(RECIPE.key, RECIPE.path);
    for (const key in SOUNDS) this.load.audio(key, SOUNDS[key]);
    this.load.once('complete', () => this.showModeSelect());
    this.load.start();
  }

  update() {
    // Subtle backdrop flip every ~6 frames, as in the original.
    if (!this.loadingBg) return;
    this.flipCnt++;
    if (this.flipCnt % 6 === 0) this.loadingBg.flipX = !this.loadingBg.flipX;
  }

  showModeSelect() {
    loadHighScore();
    if (this.loadingG) { this.loadingG.destroy(); this.loadingG = null; }
    if (this.loadingBg) { this.loadingBg.destroy(); this.loadingBg = null; }

    this.title = this.add.image(44, 83, 'title_ui', 'modeSelectTxt.gif').setOrigin(0, 0);

    this.pcBtn = new Button(this, 'title_ui', ['playBtnPc0.gif', 'playBtnPc1.gif'], () => this.choose(false), { origin: 0 });
    this.pcBtn.setPosition(44, this.title.y + this.title.height + 40);
    this.pcTxt = this.add.image(44, this.pcBtn.y + this.pcBtn.img.height + 2, 'title_ui', 'playBtnPcTxt.gif').setOrigin(0, 0);

    this.spBtn = new Button(this, 'title_ui', ['playBtnSp0.gif', 'playBtnSp1.gif'], () => this.choose(true), { origin: 0 });
    this.spBtn.setPosition(44, this.pcTxt.y + 20);
    this.spTxt = this.add.image(44, this.spBtn.y + this.spBtn.img.height + 2, 'title_ui', 'playBtnSpTxt.gif').setOrigin(0, 0);

    const recFrame = `recommendBtn0${LANG === 'ja' ? '' : '_en'}.gif`;
    this.recBtn = new Button(this, 'title_ui', [recFrame], () => this.openRecommend(), { origin: 0 });
    this.recBtn.setPosition(40, this.spTxt.y + 100);
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
    Sound.play('se_decision');
    gameState.lowModeFlg = lowMode;
    this.scene.start(SCENES.TITLE);
  }
}
