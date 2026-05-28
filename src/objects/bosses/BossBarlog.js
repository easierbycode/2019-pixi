// BossBarlog.js — stage 1. Aimed claw projectiles.
import { Boss } from './Boss.js';
import * as Sound from '../../sound.js';

export class BossBarlog extends Boss {
  shootStart() { super.shootStart(); Sound.play('boss_barlog_voice_add'); }

  attack() {
    Sound.play('boss_barlog_voice_tama');
    this.fire(this.data.bulletData, 'aimed', 'shoot');
  }

  onDead() { Sound.play('boss_barlog_voice_ko'); }
}
