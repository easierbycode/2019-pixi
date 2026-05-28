// BossGoki.js — hidden boss. Aimed/heavy shots plus a grab (handled by the scene on contact).
import { Boss } from './Boss.js';
import * as Sound from '../../sound.js';

export class BossGoki extends Boss {
  shootStart() { super.shootStart(); this.toggle = 0; }

  toujou() { Sound.play('boss_goki_voice_add'); }

  attack() {
    this.toggle = (this.toggle + 1) % 2;
    if (this.toggle === 0) {
      Sound.play('boss_goki_voice_tama0');
      this.fire(this.data.bulletDataA, 'spread', 'shootA');
    } else {
      Sound.play('boss_goki_voice_tama1');
      this.fire(this.data.bulletDataB, 'aimed', 'shootB');
    }
  }

  shungokusatsu() {
    Sound.play('boss_goki_voice_syungokusatu0');
    this.playAnim('syngoku', false);
  }

  onDead() { Sound.play('boss_goki_voice_ko'); }
}
