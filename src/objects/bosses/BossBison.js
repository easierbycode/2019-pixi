// BossBison.js — stage 0 boss. Melee charger (no projectiles).
import { Boss } from './Boss.js';
import { gameState } from '../../state.js';
import { GAME_HEIGHT } from '../../constants.js';
import * as Sound from '../../sound.js';

export class BossBison extends Boss {
  shootStart() { super.shootStart(); Sound.play('boss_bison_voice_add'); }

  attack() {
    if (this.lunging) return;
    this.lunging = true;
    this.playAnim('attack', false);
    Sound.play('boss_bison_voice_punch');
    const baseY = this.y;
    const targetX = gameState.playerRef ? gameState.playerRef.x : this.x;
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        { x: targetX, y: GAME_HEIGHT - 120, duration: 350, ease: 'Quad.easeIn' },
        { y: baseY, duration: 600, ease: 'Quad.easeOut' },
      ],
      onComplete: () => { this.lunging = false; this.playAnim('idle', true); },
    });
  }

  onDead() { Sound.play('boss_bison_voice_ko'); }
}
