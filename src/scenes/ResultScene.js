import Phaser from 'phaser';
// ResultScene.js — final score / hi-score, NEW RECORD, back to title.
import { SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_X } from '../constants.js';
import { gameState, saveHighScore } from '../state.js';
import { NumberDisplay } from '../ui/NumberDisplay.js';
import { Button } from '../ui/Button.js';
import * as Sound from '../sound.js';

export class ResultScene extends Phaser.Scene {
  constructor() { super(SCENES.RESULT); }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0);
    const newRecord = gameState.score > gameState.beforeHighScore;
    saveHighScore();

    this.add.image(CENTER_X, 60, 'game_ui', 'scoreTxt.gif').setOrigin(0.5);
    const score = new NumberDisplay(this, { prefix: 'bigNum' });
    score.setNum(gameState.score);
    score.setPosition(CENTER_X - score.totalWidth / 2, 80);

    this.add.image(CENTER_X, 140, 'game_ui', 'hiScoreTxt.gif').setOrigin(0.5);
    const hi = new NumberDisplay(this, { prefix: 'bigNum' });
    hi.setNum(gameState.highScore);
    hi.setPosition(CENTER_X - hi.totalWidth / 2, 160);

    if (newRecord) this.add.image(CENTER_X, 210, 'game_ui', 'continueNewrecord.gif').setOrigin(0.5);

    const back = new Button(this, 'game_ui', ['gotoTitleBtn0.gif', 'gotoTitleBtn1.gif', 'gotoTitleBtn2.gif'],
      () => this.scene.start(SCENES.TITLE), { origin: 0.5 });
    back.setPosition(CENTER_X, GAME_HEIGHT - 60);

    gameState.playerHp = 0;
  }
}
