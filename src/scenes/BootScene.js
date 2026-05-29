import Phaser from 'phaser';
// BootScene.js — loads just the loading-screen visuals so PreloadScene can animate
// the original spinner while the bulk of the assets download.
import { SCENES } from '../constants.js';

export class BootScene extends Phaser.Scene {
  constructor() { super(SCENES.BOOT); }

  preload() {
    this.load.image('loading_bg', 'assets/img/loading/loading_bg.png');
    this.load.image('loading0', 'assets/img/loading/loading0.gif');
    this.load.image('loading1', 'assets/img/loading/loading1.gif');
    this.load.image('loading2', 'assets/img/loading/loading2.gif');
  }

  create() {
    this.scene.start(SCENES.PRELOAD);
  }
}
