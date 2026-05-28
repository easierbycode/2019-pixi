// BossSagat.js — stage 2. Alternates fast low tiger shots and big aimed shots.
import { Boss } from './Boss.js';
import * as Sound from '../../sound.js';

export class BossSagat extends Boss {
  shootStart() { super.shootStart(); this.toggle = 0; Sound.play('boss_sagat_voice_add'); }

  attack() {
    this.toggle = (this.toggle + 1) % 3;
    if (this.toggle === 0) {
      Sound.play('boss_sagat_voice_tama1');
      this.fire(this.data.bulletDataB, 'aimed', 'shoot');
    } else {
      Sound.play('boss_sagat_voice_tama0');
      this.fire(this.data.bulletDataA, 'spread', 'shoot');
    }
  }

  onDead() { Sound.play('boss_sagat_voice_ko'); }
}
