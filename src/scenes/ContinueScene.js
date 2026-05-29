import Phaser from 'phaser';
// ContinueScene.js — countdown + Yes/No continue prompt. On No (or timeout) the
// GAME OVER result is shown in place, as in the original: the President greys out,
// a GAME OVER stamp drops in, then "SCORE n", NEW RECORD, a Tweet button and
// Go To Title. (The original has no separate game-over/result scene for the death path.)
import { SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_X, CENTER_Y, LANG } from '../constants.js';
import { gameState, saveHighScore } from '../state.js';
import { ensureAnim, speedToFps } from '../anims.js';
import { NumberDisplay } from '../ui/NumberDisplay.js';
import { Button } from '../ui/Button.js';
import * as Sound from '../sound.js';

export class ContinueScene extends Phaser.Scene {
  constructor() { super(SCENES.CONTINUE); }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0);
    Sound.bgmPlay('bgm_continue');

    // Layout mirrors the original (PixiJS anchors are top-left): a full-width title
    // at y=70, the President's animated face on the left, and the dot-matrix
    // countdown to his right.
    const title = this.add.image(0, 70, 'game_ui', 'continueTitle.gif').setOrigin(0, 0);

    const faceAnim = ensureAnim(this, 'game_ui', ['continueFace0.gif', 'continueFace1.gif'],
      { fps: speedToFps(0.05), key: 'continueLoseFace' });
    this.face = this.add.sprite(20, title.y + title.height + 38, 'game_ui', 'continueFace0.gif')
      .setOrigin(0, 0).play(faceAnim);

    const bg = this.add.image(0, 0, 'game_ui', 'countdownBg.gif').setOrigin(0, 0);
    bg.setPosition(bg.width + 20, title.y + title.height + 30);
    this.num = this.add.image(bg.x, bg.y, 'game_ui', 'countdown9.gif').setOrigin(0, 0);

    // Yes / No centred at (CENTER_X +/- 50, CENTER_Y + 70), as in the original.
    this.yesBtn = new Button(this, 'game_ui', ['continueYes.gif', 'continueYesOver.gif', 'continueYesDown.gif'],
      () => this.continueYes(), { origin: 0.5 });
    this.yesBtn.setPosition(CENTER_X - 50, CENTER_Y + 70);
    this.noBtn = new Button(this, 'game_ui', ['continueNo.gif', 'continueNoOver.gif', 'continueNoDown.gif'],
      () => this.continueNo(), { origin: 0.5 });
    this.noBtn.setPosition(CENTER_X + 50, CENTER_Y + 70);

    // Random continue tip near the bottom (centre-top origin), as in the original.
    const recipe = this.cache.json.get('recipe') || {};
    const tips = recipe[LANG === 'ja' ? 'continueComment' : 'continueCommentEn'] || [];
    if (tips.length) {
      const tip = tips[Math.floor(Math.random() * tips.length)];
      this.tip = this.add.text(CENTER_X, GAME_HEIGHT - 120, tip, {
        fontFamily: 'sans-serif', fontSize: '15px', fontStyle: 'bold',
        color: '#ffffff', align: 'center', lineSpacing: 2, wordWrap: { width: 230 },
      }).setOrigin(0.5, 0);
    }

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
    if (this.timer) this.timer.remove();
    Sound.play('g_continue_yes_voice0');
    Sound.stopBgm('bgm_continue');
    gameState.continueCnt++;
    gameState.playerHp = gameState.playerMaxHp;
    gameState.combo = 0;
    this.scene.start(SCENES.GAME);
  }

  // No / timeout: drop the prompt and reveal the GAME OVER result in place.
  continueNo() {
    if (this.decided) return;
    this.decided = true;
    if (this.timer) this.timer.remove();
    gameState.playerHp = 0;

    Sound.stop(`voice_countdown${Math.max(0, this.count)}`);
    Sound.stopBgm('bgm_continue');
    Sound.play('voice_gameover');
    Sound.bgmPlay('bgm_gameover');
    Sound.play('g_continue_no_voice0');

    // Grey the President, dim the counter to 0, and remove the prompt elements.
    this.face.stop();
    this.face.setTexture('game_ui', 'continueFace2.gif');
    this.num.setTexture('game_ui', 'countdown0.gif').setAlpha(0.2);
    if (this.tip) this.tip.destroy();
    this.yesBtn.destroy();
    this.noBtn.destroy();
    this.cameras.main.shake(300, 0.008);

    const newRecord = gameState.score > gameState.beforeHighScore;
    saveHighScore();

    // GAME OVER stamp fades in over the (now grey) continue screen.
    const over = this.add.image(CENTER_X, CENTER_Y - 35, 'game_ui', 'continueGameOver.gif')
      .setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: over, alpha: 1, duration: 800, delay: 300 });

    // Then the score block, anchored below the face exactly as the original does.
    const faceBottom = this.face.y + this.face.height;
    this.time.delayedCall(1200, () => {
      if (newRecord) this.add.image(0, faceBottom + 10, 'game_ui', 'continueNewrecord.gif').setOrigin(0, 0);

      const scoreTxt = this.add.image(32, faceBottom + 30, 'game_ui', 'scoreTxt.gif').setOrigin(0, 0);
      const num = new NumberDisplay(this, { prefix: 'bigNum' });
      num.setNum(gameState.score);
      num.setPosition(scoreTxt.x + scoreTxt.width + 3, scoreTxt.y - 2);

      const tw = new Button(this, 'game_ui', ['twitterBtn0.gif', 'twitterBtn1.gif', 'twitterBtn2.gif'],
        () => this.tweet(), { origin: 0.5 });
      tw.setPosition(CENTER_X, scoreTxt.y + tw.img.height / 2 + 20);

      const back = new Button(this, 'game_ui', ['gotoTitleBtn0.gif', 'gotoTitleBtn1.gif', 'gotoTitleBtn2.gif'],
        () => this.goToTitle(), { origin: 0.5 });
      back.setPosition(CENTER_X, CENTER_Y + 160);
    });
  }

  goToTitle() {
    Sound.stopBgm('bgm_gameover');
    this.scene.start(SCENES.TITLE);
  }

  tweet() {
    const url = encodeURIComponent('https://game.capcom.com/cfn/sfv/aprilfool/2019/');
    const hashtags = encodeURIComponent('ShadalooCRI,SFVAE,aprilfool');
    const text = encodeURIComponent(
      `APRIL FOOL 2019 WORLD PRESIDENT CHALLENGES A STG\nSCORE:${gameState.score}\nBEST:${gameState.highScore}\n`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&hashtags=${hashtags}&text=${text}`, '_blank');
  }
}
