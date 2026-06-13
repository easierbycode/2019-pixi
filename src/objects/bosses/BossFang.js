// BossFang.js — final boss. Parked at the top: angled twin beams, a homing
// drone swarm, and drifting poison smoke. Ported from the original
// (2019-es7 src/bosses/BossFang.js).
import { Boss } from './Boss.js';
import * as Sound from '../../sound.js';

export class BossFang extends Boss {
  constructor(scene, data) {
    // The original tags his three projectile recipes with the spawn-pattern names.
    if (data.bulletDataA) { data.bulletDataA.name = 'beam'; data.bulletDataA.cnt = 0; }
    if (data.bulletDataB) data.bulletDataB.name = 'smoke';
    if (data.bulletDataC) data.bulletDataC.name = 'meka';
    super(scene, data);
    const w = this.character.width, h = this.character.height;
    this.hitArea = { x: -w / 2 + 35, y: -h / 2 + 55, width: w - 70, height: h - 70 };
    if (this.dengerousBalloon) this.dengerousBalloon.setPosition(70 - w / 2, 40 - h / 2);
    this.addVoice = 'boss_fang_voice_add';
    this.shadow.setVisible(false); // the original removes his shadow
    this.enterSpeed = 0.7;
    this.restY = this.cyt(48); // parks high, just under the HUD
  }

  enter() {
    super.enter();
    this.y = this.cyt(-249); // original castAdded start
  }

  shootStart() {
    const seed = Math.random();

    if (seed <= 0.3) {
      // Twin angled beams, three volleys (the spawn cycles 105°/90°/75°).
      const tweens = [this.tlCall(0.01, () => this.playAnim('charge'))];
      for (let i = 0; i < 3; i++) {
        tweens.push(this.tlCall(0.5, () => {
          this.playAnim('shoot', false);
          this.fire(this.bossData.bulletDataA);
          Sound.play('boss_fang_voice_beam0');
        }));
      }
      tweens.push(this.tlCall(0.3, () => this.playAnim('idle')));
      tweens.push(this.tlCall(1));
      this.startTimeline(tweens);
      return;
    }

    if (seed <= 0.7) {
      // Homing drone swarm.
      Sound.play('boss_fang_voice_beam1');
      this.startTimeline([
        this.tlCall(0.01, () => this.fire(this.bossData.bulletDataC)),
        this.tlCall(0.5, () => this.playAnim('wait')),
        this.tlCall(4),
      ]);
      return;
    }

    // Poison smoke: twelve drifting clouds.
    const tweens = [
      this.tlCall(0.01, () => Sound.play('boss_fang_voice_tama')),
      this.tlCall(1, () => this.playAnim('wait')),
    ];
    for (let i = 0; i < 12; i++) {
      tweens.push(this.tlCall(0.3, () => this.fire(this.bossData.bulletDataB)));
    }
    tweens.push(this.tlCall(7));
    this.startTimeline(tweens);
  }

  onDead() { Sound.play('boss_fang_voice_ko'); }
}
