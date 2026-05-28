import Phaser from 'phaser';
// Player.js — the World President. Moves horizontally, auto-fires, can carry a barrier.
import { BaseUnit, EVT } from './BaseUnit.js';
import { SHOOT_MODES, SHOOT_SPEEDS, ITEM_TYPES, GAME_WIDTH, GAME_HEIGHT, CENTER_X } from '../constants.js';
import { gameState } from '../state.js';
import { ensureAnim, speedToFps } from '../anims.js';
import * as Sound from '../sound.js';

export class Player extends BaseUnit {
  constructor(scene, data) {
    super(scene, 'game_asset', data.texture, {
      explosionFrames: data.explosion,
      animationSpeed: 0.35,
    });
    this.maxHp = gameState.playerMaxHp || data.maxHp;
    this.hp = data.hp ?? this.maxHp;
    this._percent = this.hp / this.maxHp;

    const hit = data.hit || null;
    const guard = data.guard || null;
    const mk = (s, speed) => ({ ...s, atlasKey: 'game_asset', explosion: hit, guard, speed: s.speed ?? speed });
    this.shootNormalData = mk(data.shootNormal, 8);
    this.shootBigData = mk(data.shootBig, 6);
    this.shoot3wayData = { ...mk(data.shoot3way, 8), texture: data.shootNormal.texture };

    // Barrier visuals
    if (data.barrier && data.barrier.texture) {
      const bAnim = ensureAnim(scene, 'game_asset', data.barrier.texture, { fps: speedToFps(0.15) });
      this.barrier = scene.add.sprite(0, 0, 'game_asset', data.barrier.texture[0]).setOrigin(0.5);
      this.barrier.play(bAnim);
      this.barrier.setVisible(false);
      this.add(this.barrier);
    }
    if (data.barrierEffect) {
      this.barrierEffect = scene.add.sprite(0, 0, 'game_asset', data.barrierEffect).setOrigin(0.5);
      this.barrierEffect.setVisible(false);
      this.add(this.barrierEffect);
    }

    this.shootOn = false;
    this.bulletFrameCnt = 0;
    this.bulletIdCnt = 0;
    this.shootSpeedBoost = 0;
    this.shootIntervalBase = 0;
    this.shootMode = SHOOT_MODES.NORMAL;
    this.unitX = CENTER_X;
    this.shadowOffsetY = 5;

    this.damageAnimationFlg = false;
    this.barrierFlg = false;
    this.keyLeft = false;
    this.keyRight = false;

    const w = this.character.width, h = this.character.height;
    this.hitArea = { x: -w / 2 + 7, y: -h / 2 + 20, width: w - 14, height: h - 40 };
    this.updateShootData();
  }

  get percent() { return this._percent; }

  loop(delta) {
    if (this.deadFlg) return;
    if (this.keyLeft) this.unitX -= 6 * delta;
    if (this.keyRight) this.unitX += 6 * delta;
    const half = this.hitArea.width / 2;
    this.unitX = Phaser.Math.Clamp(this.unitX, half, GAME_WIDTH - half);
    this.x += 0.09 * delta * (this.unitX - this.x);

    if (this.barrier) { this.barrier.x = 0; this.barrier.y = -this.character.height / 2 + this.barrier.height / 2 - 15; }
    this.updateShadowPosition();

    this.bulletFrameCnt += delta;
    const interval = this.shootIntervalBase - this.shootSpeedBoost;
    if (this.shootOn && interval > 0 && this.bulletFrameCnt >= interval) {
      this.shoot();
      this.bulletFrameCnt = 0;
    }
  }

  shoot() {
    const bullets = [];
    const up = -Math.PI / 2;
    const cw = this.character.width, ch = this.character.height;
    if (this.shootMode === SHOOT_MODES.NORMAL) {
      const d = { ...this.shootNormalData, id: this.bulletIdCnt++, rotation: up };
      d.startX = Math.cos(up + Math.PI / 2) * 5 + 14 - cw / 2;
      d.startY = Math.sin(up + Math.PI / 2) * 5 + 11 - ch / 2;
      bullets.push(d);
      Sound.stop('se_shoot'); Sound.play('se_shoot');
    } else if (this.shootMode === SHOOT_MODES.BIG) {
      const d = { ...this.shootBigData, id: this.bulletIdCnt++, rotation: up };
      d.startX = Math.cos(up + Math.PI / 2) * 5 + 10 - cw / 2;
      d.startY = Math.sin(up + Math.PI / 2) * 5 + 22 - ch / 2;
      bullets.push(d);
      Sound.stop('se_shoot_b'); Sound.play('se_shoot_b');
    } else if (this.shootMode === SHOOT_MODES.THREE_WAY) {
      const angles = [-100, -90, -80];
      const off = [{ x: 6, y: 11 }, { x: 10, y: 11 }, { x: 14, y: 11 }];
      angles.forEach((a, i) => {
        const r = (a * Math.PI) / 180;
        const d = { ...this.shoot3wayData, id: this.bulletIdCnt++, rotation: r };
        d.startX = Math.cos(r + Math.PI / 2) * 5 + off[i].x - cw / 2;
        d.startY = Math.sin(r + Math.PI / 2) * 5 + off[i].y - ch / 2;
        bullets.push(d);
      });
      Sound.stop('se_shoot'); Sound.play('se_shoot');
    }
    this.emit(EVT.BULLET_ADD, bullets);
  }

  updateShootData() {
    const map = {
      [SHOOT_MODES.NORMAL]: this.shootNormalData,
      [SHOOT_MODES.BIG]: this.shootBigData,
      [SHOOT_MODES.THREE_WAY]: this.shoot3wayData,
    };
    this.shootIntervalBase = (map[this.shootMode] || {}).interval || 20;
  }

  shootModeChange(mode) {
    if (this.shootMode === mode) return;
    this.shootMode = mode;
    this.updateShootData();
    Sound.play('g_powerup_voice');
  }

  shootSpeedChange(speedMode) {
    const boost = speedMode === SHOOT_SPEEDS.HIGH ? 15 : 0;
    if (this.shootSpeedBoost === boost) return;
    this.shootSpeedBoost = boost;
    Sound.play('g_powerup_voice');
  }

  setUp(hp, shootMode, shootSpeedMode) {
    this.maxHp = gameState.playerMaxHp;
    this.hp = hp;
    this._percent = this.hp / this.maxHp;
    this.shootMode = shootMode;
    this.updateShootData();
    if (shootSpeedMode === SHOOT_SPEEDS.HIGH) this.shootSpeedBoost = 15;
    this.deadFlg = false;
    this.damageAnimationFlg = false;
    this.character.clearTint();
    this.character.setAlpha(1);
  }

  shootStop() { this.shootOn = false; }
  shootStart() { this.shootOn = true; this.bulletFrameCnt = 0; }

  barrierStart() {
    if (!this.barrier || this.barrierFlg) return;
    Sound.play('se_barrier_start');
    this.barrierFlg = true;
    this.barrier.setAlpha(0).setVisible(true);
    if (this.barrierEffect) {
      this.barrierEffect.setPosition(this.barrier.x, this.barrier.y).setAlpha(1).setVisible(true).setScale(0.5);
      this.scene.tweens.add({ targets: this.barrierEffect, scale: 1, duration: 400, ease: 'Quint.easeOut' });
      this.scene.tweens.add({ targets: this.barrierEffect, alpha: 0, duration: 500 });
    }
    const dur = (this.barrierTime || 4) * 1000;
    this.scene.tweens.add({ targets: this.barrier, alpha: 1, duration: 300 });
    this.scene.time.delayedCall(dur, () => {
      if (!this.barrier) return;
      this.scene.tweens.add({
        targets: this.barrier, alpha: 0, duration: 100, yoyo: true, repeat: 8,
        onComplete: () => {
          if (this.barrier) this.barrier.setVisible(false);
          this.barrierFlg = false;
          Sound.play('se_barrier_end');
        },
      });
    });
  }

  barrierHitEffect() {
    if (!this.barrier) return;
    this.barrier.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => this.barrier && this.barrier.clearTint());
    Sound.play('se_guard');
  }

  onDamage(amount) {
    if (this.barrierFlg || this.damageAnimationFlg || this.deadFlg) {
      if (this.barrierFlg) this.barrierHitEffect();
      return;
    }
    this.hp = Math.max(0, this.hp - amount);
    this._percent = this.hp / this.maxHp;
    this.damageAnimationFlg = true;
    if (this.hp <= 0) { this.dead(); return; }
    this.scene.tweens.add({
      targets: this.character, alpha: 0.2, duration: 100, yoyo: true, repeat: 5,
      onStart: () => this.character.setTint(0xff0000),
      onComplete: () => { this.character.clearTint(); this.character.setAlpha(1); this.damageAnimationFlg = false; },
    });
    Sound.play('g_damage_voice');
    Sound.play('se_damage');
  }

  dead() {
    if (this.deadFlg) return;
    this.deadFlg = true;
    this.emit(EVT.DEAD, this);
    this.shootStop();
    this.character.setVisible(false);
    this.shadow.setVisible(false);
    Sound.play('se_explosion');
    Sound.play('g_continue_no_voice0');
    if (this.explosion) {
      this.explosion.setPosition(0, 0);
      this.playExplosion(() => this.explosionComplete());
    } else {
      this.explosionComplete();
    }
  }

  explosionComplete() {
    if (this.explosion) this.explosion.setVisible(false);
    this.emit(EVT.DEAD_COMPLETE, this);
  }
}
