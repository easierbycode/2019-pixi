// BossVega.js — stage 3. Radial psycho-field bursts and aimed shots.
// May be the pre-Goki form (gokiFlg); emits GOKI once near death to trigger the swap.
import { Boss } from './Boss.js';
import { EVT } from '../BaseUnit.js';
import * as Sound from '../../sound.js';

export const EVT_GOKI = 'vega:goki';

export class BossVega extends Boss {
  constructor(scene, data) {
    super(scene, data);
    this.gokiFlg = false;
    this.toggle = 0;
  }

  shootStart() { super.shootStart(); Sound.play('boss_vega_voice_add'); }

  attack() {
    this.toggle = (this.toggle + 1) % 2;
    if (this.toggle === 0) {
      Sound.play('boss_vega_voice_tama');
      this.fire(this.bossData.bulletDataA, 'ring', 'shoot');
    } else {
      Sound.play('boss_vega_voice_shoot');
      this.fire(this.bossData.bulletDataB, 'aimed', 'shoot');
    }
  }

  onDamage(amount) {
    if (this.gokiFlg && this.hp - amount <= this.hp * 0.4 && !this._gokiFired) {
      this._gokiFired = true;
      this.emit(EVT_GOKI, this);
      return;
    }
    super.onDamage(amount);
  }

  onDead() { Sound.play('boss_vega_voice_ko'); }
}
