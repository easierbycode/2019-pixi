import Phaser from 'phaser';
// TitleScene.js — title screen with intro animation and start button.
import { SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_X, LANG } from '../constants.js';
import { gameState, resetRun } from '../state.js';
import { NumberDisplay } from '../ui/NumberDisplay.js';
import { Button } from '../ui/Button.js';
import * as Sound from '../sound.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super(SCENES.TITLE); }

  create() {
    this.bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'title_bg').setOrigin(0, 0);

    this.titleG = this.add.image(CENTER_X, 40, 'game_ui', 'titleG.gif').setOrigin(0.5);
    this.logo = this.add.image(CENTER_X, 90, 'game_ui', 'logo.gif').setOrigin(0.5);
    this.subTitle = this.add.image(CENTER_X, 140, 'game_ui', LANG === 'ja' ? 'subTitle.gif' : 'subTitleEn.gif').setOrigin(0.5);

    this.belt = this.add.rectangle(0, GAME_HEIGHT - 120, GAME_WIDTH, 120, 0x000000).setOrigin(0, 0);
    this.copyright = this.add.image(CENTER_X, GAME_HEIGHT - 10, 'game_ui', 'titleCopyright.gif').setOrigin(0.5, 1);

    // Hi-score
    this.add.image(32, GAME_HEIGHT - 70, 'game_ui', 'hiScoreTxt.gif').setOrigin(0, 0.5);
    this.hiNum = new NumberDisplay(this, { prefix: 'bigNum' });
    this.hiNum.setPosition(90, GAME_HEIGHT - 80);
    this.hiNum.setNum(gameState.highScore);

    this.startBtn = this.add.image(CENTER_X, 330, 'game_ui', 'titleStartText.gif').setOrigin(0.5).setAlpha(0);

    // Intro animation
    this.logo.setScale(2).y = 60;
    this.tweens.add({ targets: this.logo, scale: 1, y: 90, duration: 900, ease: 'Quint.easeIn' });
    this.tweens.add({
      targets: this.startBtn, alpha: 1, delay: 1100, duration: 200,
      onComplete: () => {
        Sound.play('voice_titlecall');
        this.enableStart();
        this.tweens.add({ targets: this.startBtn, scale: 1.08, duration: 600, yoyo: true, repeat: -1 });
      },
    });

    // Buttons
    this.twitterBtn = new Button(this, 'game_ui', ['twitterBtn0.gif', 'twitterBtn1.gif', 'twitterBtn2.gif'],
      () => this.tweet(), { origin: 0.5 });
    this.twitterBtn.setPosition(CENTER_X, GAME_HEIGHT - 30);
    this.howtoBtn = new Button(this, 'game_ui', ['howtoBtn0.gif', 'howtoBtn1.gif', 'howtoBtn2.gif'],
      () => window.howtoModalOpen && window.howtoModalOpen(), { origin: 0 });
    this.howtoBtn.setPosition(12, 10);
  }

  enableStart() {
    this.startBtn.setInteractive({ useHandCursor: true });
    this.startBtn.once('pointerup', () => this.titleStart());
    this.input.keyboard.once('keydown-SPACE', () => this.titleStart());
    this.input.keyboard.once('keydown-ENTER', () => this.titleStart());
  }

  tweet() {
    const url = encodeURIComponent('https://game.capcom.com/cfn/sfv/aprilfool/2019/');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent('APRIL FOOL 2019 WORLD PRESIDENT\nBEST:' + gameState.highScore)}`, '_blank');
  }

  titleStart() {
    Sound.play('se_decision');
    resetRun();
    const fade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0).setAlpha(0).setDepth(999);
    this.tweens.add({ targets: fade, alpha: 1, duration: 800, onComplete: () => this.scene.start(SCENES.ADV) });
  }

  update(time, delta) {
    if (this.bg) this.bg.tilePositionX += 0.5;
  }
}
