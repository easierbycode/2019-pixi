// Enemy.js — standard enemies and obstacles.
import { BaseUnit, EVT } from './BaseUnit.js';
import { GAME_WIDTH, GAME_HEIGHT, CENTER_X } from '../constants.js';
import { gameState } from '../state.js';
import { AnimatedItem } from './AnimatedItem.js';
import * as Sound from '../sound.js';

export class Enemy extends BaseUnit {
  constructor(scene, data) {
    super(scene, 'game_asset', data.texture, {
      explosionFrames: data.explosion,
      animationSpeed: 0.1,
    });
    this.name = data.name;
    this.interval = data.interval;
    this.score = data.score;
    this.hp = data.hp === 'infinity' ? Infinity : data.hp;
    this.speed = data.speed;
    this.cagage = data.spgage ?? data.cagage ?? 0;
    this.bulletData = data.bulletData;
    this.itemName = data.itemName || null;
    this.itemFrames = data.itemTexture || null;

    this.shadowReverse = data.shadowReverse !== undefined ? data.shadowReverse : true;
    this.shadowOffsetY = data.shadowOffsetY || 0;
    this.shootFlg = true;
    this.hardleFlg = data.interval <= -1;
    this.bulletFrameCnt = 0;
    this.posName = null;

    const w = this.character.width, h = this.character.height;
    if (this.name === 'baraA' || this.name === 'baraB') {
      this.shadow.setVisible(false);
      this.hitArea = { x: -w / 2, y: -h / 2, width: w, height: h };
    } else if (this.name === 'drum') {
      this.hitArea = { x: -w / 2 + 7, y: -h / 2 + 2, width: w - 14, height: h - 4 };
    } else if (this.name === 'launchpad') {
      this.hitArea = { x: -w / 2 + 8, y: -h / 2, width: w - 16, height: h };
    } else {
      this.hitArea = { x: -w / 2, y: -h / 2, width: w, height: h };
    }
    this.updateShadowPosition();
  }

  loop(delta, scroll = 0) {
    if (this.deadFlg) return;
    this.bulletFrameCnt += delta;
    if (this.shootFlg && !this.hardleFlg && this.interval > 0 && this.bulletFrameCnt >= this.interval) {
      this.shoot();
      this.bulletFrameCnt = 0;
    }
    // Enemies fall at their own speed; the stage scroll is purely a background visual
    // (matches the original). Adding `scroll` here made them descend ~1.9x too fast, so
    // they reached the bottom before their fire interval elapsed and barely shot.
    this.y += this.speed * delta;

    if (this.name === 'soliderA') {
      if (this.y >= GAME_HEIGHT / 1.5 && gameState.playerRef) {
        this.x += 0.005 * (gameState.playerRef.x - this.x) * delta;
      }
    } else if (this.name === 'soliderB') {
      if (this.y <= 10) {
        if (this.posName === null) {
          this.posName = this.x >= CENTER_X ? 'right' : 'left';
          this.x = this.posName === 'right' ? GAME_WIDTH + this.character.width / 2 : -this.character.width / 2;
        }
      } else if (this.y >= GAME_HEIGHT / 3) {
        const hs = 1 * delta;
        if (this.posName === 'right') this.x -= hs;
        else if (this.posName === 'left') this.x += hs;
      }
    }
    this.updateShadowPosition();
  }

  shoot() {
    if (!this.bulletData) return;
    this.emit(EVT.TAMA_ADD, this);
    Sound.stop('se_shoot'); Sound.play('se_shoot');
  }

  onDamage(amount) {
    if (this.deadFlg) return;
    if (this.hp === Infinity) {
      this.character.setTintFill(0xffffff);
      this.scene.time.delayedCall(100, () => this.character && this.character.clearTint());
      return;
    }
    this.hp -= amount;
    if (this.hp <= 0) this.dead();
    else this.flashTint();
  }

  dead() {
    if (this.deadFlg || this.hp === Infinity) return;
    this.deadFlg = true;
    this.shootFlg = false;
    this.emit(EVT.DEAD, this);
    this.character.setVisible(false);
    this.shadow.setVisible(false);
    if (this.explosion) {
      this.explosion.setPosition(0, 0);
      Sound.stop('se_damage'); Sound.play('se_explosion');
      this.playExplosion(() => this.explosionComplete());
    } else {
      this.explosionComplete();
    }
  }

  explosionComplete() {
    if (this.explosion) this.explosion.setVisible(false);
    this.setVisible(false);
    this.emit(EVT.DEAD_COMPLETE, this);
  }

  dropItem() {
    if (this.itemName && this.itemFrames) {
      const item = new AnimatedItem(this.scene, this.itemFrames, this.itemName);
      item.setPosition(this.x, this.y);
      return item;
    }
    return null;
  }
}
