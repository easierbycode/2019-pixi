import Phaser from 'phaser';
// Boss.js — base class for the six stage bosses.
import { BaseUnit, EVT } from '../BaseUnit.js';
import { GAME_HEIGHT, CENTER_X } from '../../constants.js';
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
    this.data = data;

    this.animKeys = {};
    for (const key in data.anim) {
      this.animKeys[key] = ensureAnim(scene, 'game_asset', data.anim[key], { fps: speedToFps(0.15) });
    }

    // Danger balloon
    const dangerFrames = frameRange('boss_dengerous', 3);
    if (scene.textures.get('game_asset').has(dangerFrames[0])) {
      const dKey = ensureAnim(scene, 'game_asset', dangerFrames, { fps: speedToFps(0.2) });
      this.dengerousBalloon = scene.add.sprite(0, 0, 'game_asset', dangerFrames[0]).setOrigin(0.5, 1);
      this.dengerousBalloon.play(dKey);
      this.dengerousBalloon.setScale(0).setVisible(false);
      this.add(this.dengerousBalloon);
    }

    this.shadowReverse = data.shadowReverse !== undefined ? data.shadowReverse : true;
    this.shadowOffsetY = data.shadowOffsetY || 0;
    this.shootOn = false;
    this.bulletFrameCnt = 0;
    this.moveFlg = false;
    this.dengerousFlg = false;
    this.explotionCnt = 0;
    this.frozen = false;
    this.appearDuration = 6.0;

    const w = this.character.width, h = this.character.height;
    this.hitArea = { x: -w / 2 + 5, y: -h / 2 + 5, width: w - 10, height: h - 10 };
    this.updateShadowPosition();
  }

  enter() {
    this.x = CENTER_X;
    this.y = -this.character.height;
    this.moveFlg = true;
    this.deadFlg = false;
    this.dengerousFlg = false;
  }

  loop(delta) {
    if (this.deadFlg || this.frozen) return;
    if (this.moveFlg) {
      const targetY = GAME_HEIGHT / 4;
      this.y += 1 * delta;
      if (this.y >= targetY) {
        this.y = targetY;
        this.moveFlg = false;
        this.shootStart();
      }
      this.updateShadowPosition();
      return;
    }
    this.bulletFrameCnt += delta;
    if (this.shootOn && this.interval > 0 && this.bulletFrameCnt >= this.interval) {
      this.attack();
      this.bulletFrameCnt = 0;
    }
    this.updateShadowPosition();
  }

  shootStart() { this.shootOn = true; }

  // Subclasses override. Default: aimed single shot if it has bullets.
  attack() {
    if (!this.bulletData) return;
    this.fire(this.bulletData, 'aimed', 'shoot');
  }

  // Emit a TAMA_ADD with the chosen bullet recipe + spawn pattern for the scene to spawn.
  fire(bulletData, pattern, animName) {
    this.bulletData = bulletData;
    this.pattern = pattern;
    if (animName) this.playAnim(animName, false);
    this.emit(EVT.TAMA_ADD, this);
  }

  playAnim(name, loop = true) {
    const key = this.animKeys[name];
    if (!key) return;
    this.character.play({ key, repeat: loop ? -1 : 0 });
    if (this.shadow.visible) this.shadow.play({ key, repeat: loop ? -1 : 0 });
    if (!loop) {
      this.character.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        if (!this.deadFlg) this.playAnim('idle', true);
      });
    }
  }

  onTheWorld(freeze) {
    this.frozen = freeze;
    if (freeze) { this.character.anims.pause(); }
    else if (this.hp > 0 && !this.deadFlg) { this.character.anims.resume(); }
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
    const ex = this.scene.add.sprite(0, 0, 'game_asset', this.data.explosion[0]).setOrigin(0.5);
    const exAnim = ensureAnim(this.scene, 'game_asset', this.data.explosion, { fps: speedToFps(0.15), repeat: 0 });
    ex.x = (Math.random() - 0.5) * this.hitArea.width;
    ex.y = (Math.random() - 0.5) * this.hitArea.height;
    this.add(ex);
    ex.play(exAnim);
    Sound.play('se_explosion');
    ex.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      ex.destroy();
      this.explotionCnt++;
      if (isLast) this.finishDead();
    });
  }

  finishDead() {
    this.setVisible(false);
    this.emit(EVT.DEAD_COMPLETE, this);
  }

  onDead() {}
}
