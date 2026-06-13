// Bullet.js — projectile fired by player or enemies.
import { BaseUnit, EVT } from './BaseUnit.js';
import { SHOOT_MODES } from '../constants.js';
import { gameState } from '../state.js';
import * as Sound from '../sound.js';

// Bullet art is normally drawn pointing RIGHT (0 rad), so rotating by the travel
// angle aims the nose along its path. A few sprites are drawn facing another way;
// record the angle their art already points at rest so we don't over-rotate them.
// `normalProjectile` (soldierA's shot) is drawn already pointing DOWN, so the generic
// "points right" assumption spun it an extra 90° and left it facing left. Keyed by
// frame name minus its trailing index/extension ("normalProjectile0.gif" -> "normalProjectile").
const ART_REST_ANGLE = { normalProjectile: Math.PI / 2 }; // drawn pointing down

export class Bullet extends BaseUnit {
  constructor(scene, data) {
    super(scene, data.atlasKey || 'game_asset', data.texture, {
      explosionFrames: data.explosion,
      animationSpeed: 0.1,
    });
    this.name = data.name;
    this.damage = data.damage;
    this.speed = data.speed ?? 3;
    this.hp = data.hp;
    this.score = data.score;
    this.cagage = data.cagage ?? data.spgage ?? 0;
    this.guardFrames = data.guard || null;
    this.id = data.id ?? 0;
    this.deadFlg = false;
    this.shadow.setVisible(false);

    this.rot = data.rotation ?? 0; // movement angle (radians)
    this.rotX = undefined;
    this.rotY = undefined;
    this.targetX = null;
    this.cont = 0;
    this.start = data.start || 0;

    const w = this.character.width, h = this.character.height;
    this.hitArea = { x: -w / 2, y: -h / 2, width: w, height: h };

    // Only bullets that pass an explicit rotation get their art rotated — the
    // original rotates player shots to fly up but uses enemy/boss projectile
    // art exactly as drawn (Fang's beams get their rotation set at spawn).
    if (data.rotation != null) {
      const frame0 = (Array.isArray(data.texture) ? data.texture[0] : data.texture) || '';
      const artBase = String(frame0).replace(/\d+\.\w+$/, '');
      const artRest = ART_REST_ANGLE[artBase] ?? 0;
      this.character.setRotation(this.rot - artRest);
      this.shadow.setRotation(this.rot - artRest);
    }
  }

  loop(delta) {
    if (this.deadFlg) return;
    if (this.rotX !== undefined && this.rotY !== undefined) {
      this.x += this.rotX * this.speed * delta;
      this.y += this.rotY * this.speed * delta;
    } else if (this.name === 'meka') {
      this.cont++;
      if (this.cont >= this.start) {
        if (this.targetX === null && gameState.playerRef) this.targetX = gameState.playerRef.x;
        if (this.targetX !== null) this.x += 0.009 * (this.targetX - this.x) * delta;
        this.y += (Math.cos(this.cont / 5) + 2.5 * this.speed) * delta;
      }
    } else {
      this.x += Math.cos(this.rot) * this.speed * delta;
      this.y += Math.sin(this.rot) * this.speed * delta;
    }
  }

  onDamage(amount, hitType = 'normal') {
    if (this.deadFlg) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.dead(hitType);
      return;
    }
    this.flashTint();
    if (hitType === 'infinity') { Sound.stop('se_guard'); Sound.play('se_guard'); }
    else { Sound.stop('se_damage'); Sound.play('se_damage'); }
  }

  dead(hitType) {
    if (this.deadFlg) return;
    this.deadFlg = true;
    this.emit(EVT.DEAD, this);
    this.character.setVisible(false);
    this.shadow.setVisible(false);
    if (this.explosion && hitType !== 'infinity') {
      this.playExplosion(() => this.explosionComplete());
    } else {
      if (hitType === 'infinity') { Sound.stop('se_guard'); Sound.play('se_guard'); }
      this.explosionComplete();
    }
  }

  explosionComplete() {
    if (this.explosion) this.explosion.setVisible(false);
    this.emit(EVT.DEAD_COMPLETE, this);
  }
}
