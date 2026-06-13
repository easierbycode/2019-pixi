// BossBison.js — stage 0 boss. No projectiles: psycho-crusher dives and
// zigzag faints, ported from the original timeline (2019-es7 src/bosses/BossBison.js).
import { Boss } from './Boss.js';
import { GAME_WIDTH, GAME_HEIGHT, CENTER_X } from '../../constants.js';
import * as Sound from '../../sound.js';

export class BossBison extends Boss {
  constructor(scene, data) {
    super(scene, data);
    const w = this.character.width, h = this.character.height;
    this.hitArea = { x: -w / 2 + 10, y: -h / 2 + 20, width: w - 20, height: h - 30 };
    if (this.dengerousBalloon) this.dengerousBalloon.setPosition(-w / 2, 20 - h / 2);
    this.addVoice = 'boss_bison_voice_add';
  }

  shootStart() {
    const h = this.character.height;
    const upY = this.cyt(GAME_HEIGHT / 4);
    const downY = this.cyt(GAME_HEIGHT - h + 30);
    const seed = Math.random();

    if (seed <= 0.6) {
      // Straight dive: slide to a spot, rise slightly, crash straight down.
      const hw = this.hitArea.width;
      const targetX = Math.random() > 0.6
        ? this.cxl(CENTER_X - hw / 2)
        : this.cxl((GAME_WIDTH - hw) * Math.random());
      this.startTimeline([
        this.tlMove({ x: targetX }, 0.3),
        this.tlCall(0.01, () => this.playAnim('attack')),
        this.tlMove({ y: upY - 10 }, 0.5),
        this.tlCall(0.01, () => Sound.play('boss_bison_voice_punch')),
        this.tlMove({ y: downY }, 0.35),
        this.tlMove({ y: upY }, 0.2),
        this.tlCall(0.05, () => this.playAnim('idle')),
        this.tlCall(0.5),
      ]);
      return;
    }

    // Zigzag faint, then a corner dive (two mirrored variants).
    const nearX = seed <= 0.8 ? this.cxl(0) : this.cxl(170);
    const farX = seed <= 0.8 ? this.cxl(170) : this.cxl(0);
    this.startTimeline([
      this.tlMove({ x: nearX, y: upY - 20 }, 0.4),
      this.tlCall(0.2, () => Sound.play('boss_bison_voice_faint')),
      this.tlMove({ x: farX, y: upY }, 0.4),
      this.tlMove({ x: nearX, y: upY + 30 }, 0.4),
      this.tlMove({ x: farX, y: upY + 60 }, 0.4),
      this.tlCall(0.01, () => {
        this.playAnim('attack');
        Sound.play('boss_bison_voice_faint_punch');
      }),
      this.tlCall(0.2),
      this.tlMove({ y: downY }, 0.3),
      this.tlMove({ y: upY }, 0.2),
      this.tlCall(0.05, () => this.playAnim('idle')),
      this.tlCall(1),
    ]);
  }

  onDead() { Sound.play('boss_bison_voice_ko'); }
}
