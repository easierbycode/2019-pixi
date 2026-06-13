// BossBarlog.js — stage 1. Roams and drops claw projectiles; Barcelona dive.
// Timeline ported from the original (2019-es7 src/bosses/BossBarlog.js).
import { Boss } from './Boss.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../../constants.js';
import * as Sound from '../../sound.js';

export class BossBarlog extends Boss {
  constructor(scene, data) {
    super(scene, data);
    const w = this.character.width, h = this.character.height;
    this.hitArea = { x: -w / 2 + 30, y: -h / 2 + 20, width: w - 60, height: h - 30 };
    if (this.dengerousBalloon) this.dengerousBalloon.setPosition(30 - w / 2, 20 - h / 2);
    this.addVoice = 'boss_barlog_voice_add';
  }

  attackCue() {
    this.stopAnim(); // original freezes his pose while announcing himself
    super.attackCue();
  }

  shootStart() {
    const w = this.character.width, h = this.character.height;
    const baseY = this.cyt(GAME_HEIGHT / 4);
    const claw = () => {
      this.fire(this.bossData.bulletData);
      Sound.play('boss_barlog_voice_tama');
    };
    const seed = Math.random();

    if (seed <= 0.3) {
      // Drift to a random spot, then a claw shot.
      const randX = this.cxl(Math.random() * (GAME_WIDTH - w));
      const randY = this.cyt(Math.random() * (GAME_HEIGHT - 400) + 60);
      this.startTimeline([
        this.tlMove({ x: randX, y: randY }, 0.6, () => this.playAnim('idle')),
        this.tlCall(0.1, () => this.playAnim('shoot')),
        this.tlCall(0.3, claw),
        this.tlCall(0.3, () => this.stopAnim()),
      ]);
      return;
    }

    if (seed <= 0.8) {
      // Chase the player, then a claw shot.
      this.startTimeline([
        this.tlMove({ x: this.chaseX() }, 0.3, () => this.playAnim('idle')),
        this.tlCall(0.4, () => this.playAnim('shoot')),
        this.tlCall(0.3, claw),
        this.tlCall(0.2, () => this.stopAnim()),
      ]);
      return;
    }

    // Barcelona dive: chase, charge, rise off the cage, crash down.
    this.startTimeline([
      this.tlMove({ x: this.chaseX() }, 0.5, () => this.playAnim('idle')),
      this.tlCall(0.01, () => this.playAnim('charge')),
      this.tlCall(0.7, () => {
        this.playAnim('attack');
        Sound.play('boss_barlog_voice_barcelona');
      }),
      this.tlMove({ y: this.cyt(GAME_HEIGHT / 4 - 70) }, 0.3),
      this.tlCall(0.1),
      this.tlMove({ y: this.cyt(GAME_HEIGHT - h + 34) }, 0.6),
      this.tlMove({ y: baseY }, 0.2),
      this.tlCall(0.01, () => this.stopAnim()),
    ]);
  }

  onDead() { Sound.play('boss_barlog_voice_ko'); }
}
