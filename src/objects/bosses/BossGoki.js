// BossGoki.js — hidden boss (replaces Vega on a no-continue run). Fireball
// volleys, the big gohadoken, ashura-senku warps, and the shun-goku-satsu grab.
// Ported from the original (2019-es7 src/bosses/BossGoki.js). He has no
// entrance cadence: the scene calls shootStart() after the swap-in.
import Phaser from 'phaser';
import { Boss } from './Boss.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../../constants.js';
import { ensureAnim, speedToFps, frameRange } from '../../anims.js';
import * as Sound from '../../sound.js';

export class BossGoki extends Boss {
  constructor(scene, data) {
    super(scene, data);
    const w = this.character.width, h = this.character.height;
    this.hitArea = { x: -w / 2 + 15, y: -h / 2 + 20, width: w - 30, height: h - 24 };
    if (this.dengerousBalloon) this.dengerousBalloon.setPosition(5 - w / 2, 20 - h / 2);
    this.playAnim('syngoku', false); // appears mid-warp, holding the ashura pose
  }

  toujou() { Sound.play('boss_goki_voice_add'); }

  // No self-arming cadence (original loop() is empty) — patterns only move him.
  loop(delta) {
    if (this.deadFlg || this.frozen) return;
    this.updateShadowPosition();
  }

  shootStart() {
    const w = this.character.width, h = this.character.height;
    const seed = Math.random();

    if (seed <= 0.34) {
      // Six air fireballs while tracking the player.
      const tweens = [this.tlMove({ x: this.chaseX() }, 0.4)];
      for (let i = 0; i < 6; i++) {
        tweens.push(this.tlCall(0.01, () => this.playAnim('shootA', false)));
        tweens.push(this.tlCall(0.32, () => {
          if (i % 2 === 0) Sound.play('boss_goki_voice_tama0');
          this.fire(this.bossData.bulletDataA);
        }));
      }
      tweens.push(this.tlCall(0.3, () => this.playAnim('idle')));
      this.startTimeline(tweens);
      return;
    }

    if (seed <= 0.64) {
      // One big gohadoken.
      this.startTimeline([
        this.tlMove({ x: this.chaseX() }, 0.4),
        this.tlCall(0.01, () => {
          this.playAnim('shootB', false);
          Sound.play('boss_goki_voice_tama1');
        }),
        this.tlCall(0.4, () => this.fire(this.bossData.bulletDataB)),
        this.tlCall(0.8, () => this.playAnim('idle')),
      ]);
      return;
    }

    if (seed <= 0.89) {
      // Ashura senku: slide down the screen, then warp back up to a random spot.
      this.startTimeline([
        this.tlCall(0.4, () => {
          this.playAnim('syngoku', false);
          Sound.play('boss_goki_voice_ashura');
        }),
        this.tlMove({ y: this.cyt(GAME_HEIGHT - h + 80) }, 1.2),
        this.tlCall(0.2),
        this.tlMove({ x: this.cxl(Math.random() * (GAME_WIDTH - w)), y: this.cyt(GAME_HEIGHT / 4) }, 0.7),
        this.tlCall(0.3, () => this.playAnim('idle')),
      ]);
      return;
    }

    // Short ashura reposition.
    this.startTimeline([
      this.tlCall(0.01, () => {
        this.playAnim('syngoku', false);
        Sound.play('boss_goki_voice_ashura');
      }),
      this.tlMove({ x: this.cxl(Math.random() * (GAME_WIDTH - w)), y: this.cyt(GAME_HEIGHT / 4) }, 0.7),
      this.tlCall(0.3, () => this.playAnim('idle')),
    ]);
  }

  // The grab cinematic: blackout, ten flash-hits on the player, finish pose.
  // The scene orchestrates the gameplay side (player alpha/damage/title).
  shungokusatsu(targetUnit, isFinalTen = true) {
    this.killTimeline();
    Sound.play('boss_goki_voice_syungokusatu0');

    const scene = this.scene;
    const blackout = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setOrigin(0, 0).setDepth(100);
    const flash = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xffffff)
      .setOrigin(0, 0).setDepth(101).setAlpha(0);
    this.setDepth(102); // Goki stays visible above his own blackout, as in the original

    const hitFrames = frameRange('hit', 5);
    const hitAnim = ensureAnim(scene, 'game_asset', hitFrames, { fps: speedToFps(0.15), repeat: 0 });
    for (let i = 0; i < 10; i++) {
      scene.time.delayedCall(50 + i * 110, () => {
        const fx = scene.add.sprite(
          targetUnit.x - 16 + Math.random() * 32,
          targetUnit.y - 25 + Math.random() * 25,
          'game_asset', hitFrames[0],
        ).setDepth(103);
        fx.play(hitAnim);
        fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => fx.destroy());
        Sound.play('se_damage');
        flash.setAlpha(0.2);
        scene.time.delayedCall(60, () => flash.setAlpha(0));
      });
    }

    scene.time.delayedCall(1150, () => {
      this.playAnim(isFinalTen ? 'syngokuFinishTen' : 'syngokuFinish', false);
    });
    scene.time.delayedCall(1950, () => Sound.play('boss_goki_voice_syungokusatu1'));
    scene.time.delayedCall(1850, () => {
      scene.tweens.add({
        targets: blackout, alpha: 0, duration: 300,
        onComplete: () => { blackout.destroy(); flash.destroy(); },
      });
    });
    scene.time.delayedCall(3600, () => {
      if (!this.deadFlg) this.playAnim('idle');
    });
  }

  onDead() { Sound.play('boss_goki_voice_ko'); }
}
