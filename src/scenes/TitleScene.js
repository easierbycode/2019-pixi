import Phaser from 'phaser';
// TitleScene.js — title screen. Origins/positions match the original PixiJS layout:
// titleG slides in, logo + subtitle scale down, start button flashes, side buttons pop in.
import { SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_X, LANG } from '../constants.js';
import { gameState, resetRun } from '../state.js';
import { NumberDisplay } from '../ui/NumberDisplay.js';
import { Button } from '../ui/Button.js';
import { StaffrollPanel } from '../ui/StaffrollPanel.js';
import * as Sound from '../sound.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super(SCENES.TITLE); }

  create() {
    // Scrolling background
    this.bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'title_bg').setOrigin(0, 0);

    // titleG art lives in a wrapper that slides in from the right (top-left origin)
    this.titleGWrap = this.add.container(GAME_WIDTH, 100);
    this.titleG = this.add.image(0, 0, 'game_ui', 'titleG.gif').setOrigin(0, 0);
    this.titleGWrap.add(this.titleG);

    // Logo + subtitle (centre origin, start big/high then settle)
    this.logo = this.add.image(0, 0, 'game_ui', 'logo.gif').setOrigin(0.5);
    this.logo.setPosition(this.logo.width / 2, -this.logo.height / 2).setScale(2);
    const subFrame = LANG === 'ja' ? 'subTitle.gif' : 'subTitleEn.gif';
    this.subTitle = this.add.image(0, 0, 'game_ui', subFrame).setOrigin(0.5);
    this.subTitle.setPosition(this.subTitle.width / 2, -this.logo.height / 2).setScale(3);

    // Bottom black belt
    this.belt = this.add.rectangle(0, GAME_HEIGHT - 120, GAME_WIDTH, 120, 0x000000).setOrigin(0, 0);

    // Start button (centre origin), hidden until intro completes
    this.startBtn = this.add.image(CENTER_X, 330, 'game_ui', 'titleStartText.gif').setOrigin(0.5).setAlpha(0);

    // Copyright (bottom-left, top-left origin)
    this.copyright = this.add.image(0, 0, 'game_ui', 'titleCopyright.gif').setOrigin(0, 0);
    this.copyright.setPosition(0, GAME_HEIGHT - this.copyright.height - 6);

    // Hi-score (top-left origin at x=32)
    this.scoreTitleTxt = this.add.image(32, this.copyright.y - 66, 'game_ui', 'hiScoreTxt.gif').setOrigin(0, 0);
    this.hiNum = new NumberDisplay(this, { prefix: 'bigNum' });
    this.hiNum.setPosition(this.scoreTitleTxt.x + this.scoreTitleTxt.width + 3, this.scoreTitleTxt.y - 2);
    this.hiNum.setNum(gameState.highScore);

    // Twitter button (centre)
    this.twitterBtn = new Button(this, 'game_ui', ['twitterBtn0.gif', 'twitterBtn1.gif', 'twitterBtn2.gif'],
      () => this.tweet(), { origin: 0.5 });
    this.twitterBtn.setPosition(CENTER_X, this.copyright.y - this.twitterBtn.img.height / 2 - 14);

    // How-to (top-left) and Staff-roll (top-right) buttons, scaled flat then popped in
    this.howtoBtn = new Button(this, 'game_ui', ['howtoBtn0.gif', 'howtoBtn1.gif', 'howtoBtn2.gif'],
      () => window.howtoModalOpen && window.howtoModalOpen(), { origin: 0 });
    this.howtoBtn.setPosition(15, 10).setScale(1, 0);

    this.staffrollBtn = new Button(this, 'game_ui', ['staffrollBtn0.gif', 'staffrollBtn1.gif', 'staffrollBtn2.gif'],
      () => this.showStaffroll(), { origin: 0 });
    this.staffrollBtn.setPosition(GAME_WIDTH - this.staffrollBtn.img.width - 15, 10).setScale(1, 0);

    // Foreground overlay
    this.cover = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'game_asset', 'stagebgOver.gif').setOrigin(0, 0);

    this.startEnabled = false;
    this.playIntro();
  }

  playIntro() {
    this.tweens.add({
      targets: this.titleGWrap, x: CENTER_X - this.titleG.width / 2 + 5, y: 20,
      duration: 2000, ease: 'Quint.easeOut',
    });
    this.tweens.add({ targets: this.logo, y: 75, scaleX: 1, scaleY: 1, delay: 1200, duration: 900, ease: 'Quint.easeIn' });
    this.tweens.add({ targets: this.subTitle, y: 130, scaleX: 1, scaleY: 1, delay: 1280, duration: 900, ease: 'Quint.easeIn' });

    this.time.delayedCall(1900, () => Sound.play('voice_titlecall'));
    this.tweens.add({
      targets: this.startBtn, alpha: 1, delay: 2200, duration: 100,
      onComplete: () => {
        this.enableStart();
        this.tweens.add({ targets: this.startBtn, scale: 1.08, duration: 600, yoyo: true, repeat: -1 });
      },
    });
    this.tweens.add({ targets: this.howtoBtn, scaleY: 1, delay: 2400, duration: 300, ease: 'Elastic.easeOut' });
    this.tweens.add({ targets: this.staffrollBtn, scaleY: 1, delay: 2550, duration: 300, ease: 'Elastic.easeOut' });
  }

  enableStart() {
    this.startEnabled = true;
    this.startBtn.setInteractive({ useHandCursor: true });
    this.startBtn.once('pointerup', () => this.titleStart());
    this.input.keyboard.once('keydown-SPACE', () => this.titleStart());
    this.input.keyboard.once('keydown-ENTER', () => this.titleStart());
  }

  showStaffroll() {
    if (this.staffroll && this.staffroll.active) return;
    Sound.play('se_decision');
    this.staffroll = new StaffrollPanel(this);
    this.staffroll.setDepth(1000);
  }

  tweet() {
    const url = encodeURIComponent('https://game.capcom.com/cfn/sfv/aprilfool/2019/');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent('APRIL FOOL 2019 WORLD PRESIDENT\nBEST:' + gameState.highScore)}`, '_blank');
  }

  titleStart() {
    if (!this.startEnabled) return;
    this.startEnabled = false;
    Sound.play('se_decision');
    resetRun();
    const fade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0).setAlpha(0).setDepth(2000);
    this.tweens.add({ targets: fade, alpha: 1, duration: 800, onComplete: () => this.scene.start(SCENES.ADV) });
  }

  update() {
    if (this.bg) this.bg.tilePositionX += 0.5;
  }
}
