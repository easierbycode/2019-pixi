// main.js — Phaser game bootstrap.
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import { initSound } from './sound.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { AdvScene } from './scenes/AdvScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ContinueScene } from './scenes/ContinueScene.js';
import { GameoverScene } from './scenes/GameoverScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { CongraScene } from './scenes/CongraScene.js';
import { EndingScene } from './scenes/EndingScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'canvas',
  backgroundColor: '#000000',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene, PreloadScene, TitleScene, AdvScene, GameScene,
    ContinueScene, GameoverScene, ResultScene, CongraScene, EndingScene,
  ],
};

const game = new Phaser.Game(config);
initSound(game);

// Expose for the how-to modal handlers in index.html.
window.__game = game;
