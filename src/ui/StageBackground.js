import Phaser from 'phaser';
// StageBackground.js — vertically scrolling stage backdrop.
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export class StageBackground extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    this.bg = scene.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'stage_loop0').setOrigin(0, 0);
    this.add(this.bg);
    scene.add.existing(this);
  }

  init(stageId) {
    const key = `stage_loop${stageId}`;
    if (this.scene.textures.exists(key)) this.bg.setTexture(key);
  }

  loop(scroll) {
    this.bg.tilePositionY -= scroll;
  }

  bossScene() {
    // Transition handled visually by BGM/boss entry; keep the loop scrolling.
  }

  akebonofinish() {
    const flash = this.scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xffffff).setOrigin(0, 0);
    this.add(flash);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: 600, onComplete: () => flash.destroy() });
  }

  akebonoGokifinish() { this.akebonofinish(); }
}
