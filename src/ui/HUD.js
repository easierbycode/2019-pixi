import Phaser from 'phaser';
// HUD.js — top status bar (HP / score / combo) and the mid-right Critical Art (CA) button.
// Layout mirrors the original: hudBg0 bar at (0,0); hpBar @ (49,7); score @ (30,25);
// combo @ (149,32)/(194,19); CA button group @ (GAME_WIDTH-70, GAME_HEIGHT/2+15).
import { NumberDisplay } from './NumberDisplay.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import * as Sound from '../sound.js';

export const HUD_EVT = { CA_FIRE: 'hud:caFire' };
const MAX_CAGAGE = 100;

export class HUD extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    this._score = 0;
    this._combo = 0;
    this._maxCombo = 0;
    this._cagage = 0;
    this.highScore = 0;
    this.cagageFlg = false;
    this.caFireFlg = false;
    this.comboTimeCnt = 0;

    // Top bar background + damage flash overlay
    this.hudBg = scene.add.image(0, 0, 'game_ui', 'hudBg0.gif').setOrigin(0, 0);
    this.hudDamageBg = scene.add.image(0, 0, 'game_ui', 'hudBg1.gif').setOrigin(0, 0).setAlpha(0);
    this.add([this.hudBg, this.hudDamageBg]);

    // HP bar (scaleX = percent)
    this.hpBar = scene.add.image(49, 7, 'game_ui', 'hpBar.gif').setOrigin(0, 0);
    this.hpBarFull = this.hpBar.width;
    this.add(this.hpBar);

    // Score
    this.scoreLabel = scene.add.image(30, 25, 'game_ui', 'smallScoreTxt.gif').setOrigin(0, 0);
    this.add(this.scoreLabel);
    this.scoreNum = new NumberDisplay(scene, { prefix: 'smallNum' });
    this.scoreNum.setPosition(30 + this.scoreLabel.width + 2, 25);
    this.add(this.scoreNum);

    // Combo
    this.comboBar = scene.add.image(149, 32, 'game_ui', 'comboBar.gif').setOrigin(0, 0).setVisible(false);
    this.add(this.comboBar);
    this.comboNum = new NumberDisplay(scene, { prefix: 'comboNum' });
    this.comboNum.setPosition(194, 19);
    this.comboNum.setVisible(false);
    this.add(this.comboNum);

    // CA button group (glow ring concentric with the 67x67 button)
    this.caBtn = scene.add.container(GAME_WIDTH - 70, GAME_HEIGHT / 2 + 15);
    this.caGlow = scene.add.image(33, 33, 'game_ui', 'hudCabtnBg0.gif').setOrigin(0.5).setAlpha(0);
    this.caFace = scene.add.image(0, 0, 'game_ui', 'hudCabtn100per.gif').setOrigin(0, 0);
    this.caBtn.add([this.caGlow, this.caFace]);
    this.add(this.caBtn);
    this.caFace.setInteractive({ useHandCursor: true });
    this.caFace.on('pointerup', () => {
      if (this.cagageFlg && this.caActive) this.emit(HUD_EVT.CA_FIRE);
    });
    this.caActive = false;

    scene.add.existing(this);
  }

  get scoreCount() { return this._score; }
  set scoreCount(v) {
    this._score = Math.floor(v);
    this.scoreNum.setNum(this._score);
    if (this._score > this.highScore) this.highScore = this._score;
  }

  get comboCount() { return this._combo; }
  set comboCount(v) {
    this._combo = v;
    this.comboTimeCnt = 0;
    if (this._combo > this._maxCombo) this._maxCombo = this._combo;
    const show = this._combo > 1;
    this.comboBar.setVisible(show);
    this.comboNum.setVisible(show);
    if (show) this.comboNum.setNum(this._combo);
  }

  get maxCombCount() { return this._maxCombo; }
  set maxCombCount(v) { this._maxCombo = v; }

  get cagageCount() { return this._cagage; }
  set cagageCount(v) {
    this._cagage = Phaser.Math.Clamp(v, 0, MAX_CAGAGE);
    const ready = this._cagage >= MAX_CAGAGE;
    if (ready && !this.cagageFlg) Sound.play('g_powerup_voice');
    this.cagageFlg = ready;
    this.caFace.setTexture('game_ui', ready ? 'hudCabtn0per.gif' : 'hudCabtn100per.gif');
    if (ready && this.caActive) this.pulseGlow(true);
    else this.pulseGlow(false);
  }

  pulseGlow(on) {
    if (this._glowTween) { this._glowTween.stop(); this._glowTween = null; }
    if (on) {
      this.caGlow.setAlpha(0);
      this._glowTween = this.scene.tweens.add({ targets: this.caGlow, alpha: 1, duration: 400, yoyo: true, repeat: -1 });
    } else {
      this.caGlow.setAlpha(0);
    }
  }

  setPercent(p) { this.onDamage(p); }
  onDamage(percent) {
    this.hpBar.scaleX = Phaser.Math.Clamp(percent, 0, 1);
    this.hudDamageBg.setAlpha(1);
    this.scene.tweens.add({ targets: this.hudDamageBg, alpha: 0, duration: 250 });
  }

  caBtnActive() { this.caActive = true; this.caFace.setAlpha(1); if (this.cagageFlg) this.pulseGlow(true); }
  caBtnDeactive(permanent = false) {
    this.caActive = false;
    this.caFace.setAlpha(permanent ? 0 : 0.5);
    this.pulseGlow(false);
    if (permanent) this.caGlow.setAlpha(0);
  }

  scoreView(enemy) {
    if (!enemy) return;
    const pop = new NumberDisplay(this.scene, { prefix: 'smallNum' });
    pop.setNum(enemy.score);
    pop.setPosition(enemy.x, enemy.y);
    pop.setDepth(this.depth);
    this.scene.tweens.add({
      targets: pop, y: enemy.y - 20, alpha: 0, duration: 700,
      onComplete: () => pop.destroy(),
    });
  }

  updateComboTimer(delta) {
    if (this._combo > 0) {
      this.comboTimeCnt += delta;
      if (this.comboTimeCnt > 120) { this._combo = 0; this.comboBar.setVisible(false); this.comboNum.setVisible(false); }
    }
  }
}
