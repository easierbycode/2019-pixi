// BossFang.js — final boss. Fast shots, slow heavy swarm, and spread smoke.
import { Boss } from './Boss.js';
import * as Sound from '../../sound.js';

export class BossFang extends Boss {
  shootStart() { super.shootStart(); this.toggle = 0; Sound.play('boss_fang_voice_add'); }

  attack() {
    this.toggle = (this.toggle + 1) % 3;
    if (this.toggle === 0) {
      Sound.play('boss_fang_voice_beam0');
      this.fire(this.bossData.bulletDataA, 'spread', 'shoot');
    } else if (this.toggle === 1) {
      Sound.play('boss_fang_voice_tama');
      this.fire(this.bossData.bulletDataB, 'aimed', 'charge');
    } else {
      Sound.play('boss_fang_voice_beam1');
      this.fire(this.bossData.bulletDataC, 'ring', 'shoot');
    }
  }

  onDead() { Sound.play('boss_fang_voice_ko'); }
}
