import Phaser from 'phaser';
// Boss.js — base class for the six stage bosses.
// Movement/attack patterns are ports of the original GSAP timelines
// (2019-es7 src/bosses/*.js): ~1s after the boss settles it starts a pattern
// timeline that re-chains itself forever, re-rolling a random pattern each
// cycle. The original positions units by their top-left corner; this port uses
// centre-origin containers — cxl()/cyt() convert original corner coordinates.
import { BaseUnit, EVT } from '../BaseUnit.js';
import { GAME_WIDTH, GAME_HEIGHT, CENTER_X } from '../../constants.js';
import { gameState } from '../../state.js';
import { ensureAnim, speedToFps, frameRange } from '../../anims.js';
import * as Sound from '../../sound.js';

export class Boss extends BaseUnit {
  constructor(scene, data) {
    const idle = data.anim.idle;
    super(scene, 'game_asset', idle, {
      explosionFrames: data.explosion,
      animationSpeed: 0.15,
    });
    this.bossName = data.name;
    this.interval = data.interval;
    this.score = data.score;
    this.hp = data.hp;
    this.cagage = data.spgage ?? 0;
    this.bulletData = data.bulletDataA || data.bulletData || null;
    this.bossData = data;

    this.animKeys = {};
    for (const key in data.anim) {
      this.animKeys[key] = ensureAnim(scene, 'game_asset', data.anim[key], { fps: speedToFps(0.15) });
    }

    // Danger balloon
    const dangerFrames = frameRange('boss_dengerous', 3);
    if (scene.textures.get('game_asset').has(dangerFrames[0])) {
      const dKey = ensureAnim(scene, 'game_asset', dangerFrames, { fps: speedToFps(0.2) });
      this.dengerousBalloon = scene.add.sprite(0, 0, 'game_asset', dangerFrames[0]).setOrigin(0, 1);
      this.dengerousBalloon.play(dKey);
      this.dengerousBalloon.setScale(0).setVisible(false);
      this.add(this.dengerousBalloon);
    }

    this.shadowReverse = data.shadowReverse !== undefined ? data.shadowReverse : true;
    this.shadowOffsetY = data.shadowOffsetY || 0;
    this.shootOn = true; // cadence arms as soon as the boss settles (as in the original)
    this.bulletFrameCnt = 0;
    this.moveFlg = false;
    this.dengerousFlg = false;
    this.explotionCnt = 0;
    this.frozen = false;
    this.appearDuration = 6.0;
    this.enterSpeed = 1;
    // Original: boss settles with its top edge at GAME_HEIGHT/4.
    this.restY = GAME_HEIGHT / 4 + this.character.height / 2;
    this.addVoice = null; // per-boss "here I come" voice, played at the attack cue
    this.tlShoot = null;

    const w = this.character.width, h = this.character.height;
    this.hitArea = { x: -w / 2 + 5, y: -h / 2 + 5, width: w - 10, height: h - 10 };
    this.updateShadowPosition();
  }

  // Convert original top-left-corner coordinates to centre coordinates.
  cxl(leftX) { return leftX + this.character.width / 2; }
  cyt(topY) { return topY + this.character.height / 2; }

  enter() {
    this.x = CENTER_X;
    this.y = this.cyt(-298); // original castAdded: top edge at -298
    this.moveFlg = true;
    this.deadFlg = false;
    this.dengerousFlg = false;
  }

  loop(delta) {
    if (this.deadFlg || this.frozen) return;
    if (this.moveFlg) {
      this.y += this.enterSpeed * delta;
      if (this.y >= this.restY) {
        this.y = this.restY;
        this.moveFlg = false;
      }
      this.updateShadowPosition();
      return;
    }
    // Original cadence: cnt starts at 0, so the first settled step cues the
    // attack; the timeline then re-chains itself and shootOn stays false.
    if (this.shootOn && this.bulletFrameCnt % this.interval < delta) {
      this.shootOn = false;
      this.attackCue();
    }
    this.bulletFrameCnt += delta;
    this.updateShadowPosition();
  }

  attackCue() {
    if (this.addVoice) Sound.play(this.addVoice);
    this.scene.time.delayedCall(1000, () => {
      if (!this.deadFlg && this.active) this.shootStart();
    });
  }

  // Per-boss: build and start the pattern timeline.
  shootStart() {}

  // ---- timeline helpers (GSAP TimelineMax → Phaser tween chain) ----
  tlMove(props, seconds, onStart) {
    return {
      targets: this, ...props, duration: seconds * 1000, ease: 'Quad.easeOut',
      ...(onStart ? { onStart } : {}),
    };
  }

  // A pure callback `seconds` after the previous step (GSAP "+=s" addCallback).
  // The dummy prop tweens from an explicit 0 so the value always changes —
  // a no-change tween would complete instantly and collapse the delay.
  tlCall(seconds, fn) {
    return {
      targets: this, _tlDummy: { from: 0, to: 1 }, duration: Math.max(1, seconds * 1000),
      ...(fn ? { onComplete: fn } : {}),
    };
  }

  startTimeline(tweens) {
    this.killTimeline();
    this.tlShoot = this.scene.tweens.chain({
      tweens: [this.tlCall(0.5), ...tweens], // original timelines start with delay 0.5
      onComplete: () => { if (!this.deadFlg && this.active) this.shootStart(); },
    });
    return this.tlShoot;
  }

  killTimeline() {
    if (this.tlShoot) { this.tlShoot.destroy(); this.tlShoot = null; }
  }

  // Original player-chase clamp converted to centre coordinates.
  chaseX() {
    const p = gameState.playerRef;
    const px = p ? p.x : CENTER_X;
    return Phaser.Math.Clamp(px, this.hitArea.width / 2, GAME_WIDTH - this.hitArea.width / 2);
  }

  // Emit a TAMA_ADD with the chosen bullet recipe for the scene to spawn.
  fire(bulletData, animName) {
    this.bulletData = bulletData;
    if (animName) this.playAnim(animName, false);
    Sound.stop('se_shoot');
    Sound.play('se_shoot');
    this.emit(EVT.TAMA_ADD, this);
  }

  // loop=false plays once and holds the last frame (patterns restore idle
  // explicitly, as the original timelines do).
  playAnim(name, loop = true) {
    const key = this.animKeys[name];
    if (!key) return;
    this.character.play({ key, repeat: loop ? -1 : 0 });
    if (this.shadow.visible) this.shadow.play({ key, repeat: loop ? -1 : 0 });
  }

  stopAnim() {
    if (this.character.anims) this.character.anims.stop();
    if (this.shadow && this.shadow.anims) this.shadow.anims.stop();
  }

  onTheWorld(freeze) {
    this.frozen = freeze;
    if (freeze) {
      this.character.anims.pause();
      if (this.tlShoot) this.tlShoot.pause();
    } else if (this.hp > 0 && !this.deadFlg) {
      this.character.anims.resume();
      if (this.tlShoot) this.tlShoot.resume();
    }
  }

  onDamage(amount) {
    if (this.deadFlg) return;
    this.hp -= amount;
    if (this.hp <= 0) { this.hp = 0; this.dead(); return; }
    this.character.setTint(0xff8080);
    this.scene.time.delayedCall(200, () => this.character && this.character.clearTint());
    if (this.hp <= gameState.caDamage && !this.dengerousFlg && this.dengerousBalloon) {
      this.dengerousFlg = true;
      this.dengerousBalloon.setVisible(true).setScale(0);
      this.scene.tweens.add({ targets: this.dengerousBalloon, scale: 1, duration: 1000, ease: 'Elastic.easeOut' });
    }
  }

  dead() {
    if (this.deadFlg) return;
    this.deadFlg = true;
    this.shootOn = false;
    this.killTimeline();
    this.emit(EVT.DEAD, this);
    this.character.anims.stop();
    if (this.dengerousBalloon) this.dengerousBalloon.setVisible(false);
    Sound.stop('se_damage');
    this.onDead();

    this.explotionCnt = 0;
    const n = 5;
    for (let i = 0; i < n; i++) {
      this.scene.time.delayedCall(i * 250, () => this.spawnDeathExplosion(i === n - 1));
    }
    const sx = this.x, sy = this.y;
    this.scene.tweens.add({
      targets: this, x: sx + 4, y: sy - 2, duration: 60, yoyo: true, repeat: 8,
      onComplete: () => { this.x = sx; this.y = sy; },
    });
    this.scene.tweens.add({ targets: [this.character, this.shadow], alpha: 0, duration: 1000, delay: 500 });
  }

  spawnDeathExplosion(isLast) {
    if (!this.explosion) { if (isLast) this.finishDead(); return; }
    const ex = this.scene.add.sprite(0, 0, 'game_asset', this.bossData.explosion[0]).setOrigin(0.5);
    const exAnim = ensureAnim(this.scene, 'game_asset', this.bossData.explosion, { fps: speedToFps(0.15), repeat: 0 });
    ex.x = (Math.random() - 0.5) * this.hitArea.width;
    ex.y = (Math.random() - 0.5) * this.hitArea.height;
    this.add(ex);
    ex.play(exAnim);
    Sound.play('se_explosion');
    ex.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      ex.destroy();
      if (isLast) this.finishDead();
    });
  }

  finishDead() {
    this.emit(EVT.DEAD_COMPLETE, this);
  }

  // Subclasses override for their KO voice etc.
  onDead() {}

  destroy(fromScene) {
    this.killTimeline();
    this.dengerousBalloon = null;
    super.destroy(fromScene);
  }
}
