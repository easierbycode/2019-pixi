// BossVega.js — stage 3. Teleport warps, psycho-shot volleys, the psycho-field
// ring, and the crusher dive. Timeline ported from the original
// (2019-es7 src/bosses/BossVega.js). With gokiFlg set he never attacks: the
// first attack cue emits GOKI and the scene swaps him out.
import { Boss } from './Boss.js';
import { GAME_WIDTH, GAME_HEIGHT, CENTER_X } from '../../constants.js';
import * as Sound from '../../sound.js';

export const EVT_GOKI = 'vega:goki';

export class BossVega extends Boss {
  constructor(scene, data) {
    if (data.bulletDataB) data.bulletDataB.name = 'psychoField';
    super(scene, data);
    const w = this.character.width, h = this.character.height;
    this.hitArea = { x: -w / 2 + 20, y: -h / 2 + 13, width: w - 40, height: h - 20 };
    if (this.dengerousBalloon) this.dengerousBalloon.setPosition(-w / 2, 15 - h / 2);
    this.addVoice = 'boss_vega_voice_add';
    this.gokiFlg = false;
  }

  attackCue() {
    if (this.gokiFlg) {
      this.emit(EVT_GOKI, this);
      return;
    }
    super.attackCue();
  }

  // The original blurs him out, teleports, and blurs back in (BlurFilter).
  // Phaser has no cheap blur, so a quick alpha dip stands in for it.
  tlWarpTo(fn) {
    return [
      this.tlMove({ alpha: 0.25 }, 0.1),
      this.tlCall(0.01, fn),
      this.tlMove({ alpha: 1 }, 0.1),
    ];
  }

  shootStart() {
    const w = this.character.width;
    const baseY = this.cyt(GAME_HEIGHT / 4);
    const seed = Math.random();

    if (seed <= 0.1) {
      // Warp taunt: blink to the left edge, right edge, then somewhere random.
      this.startTimeline([
        ...this.tlWarpTo(() => {
          Sound.play('boss_vega_voice_warp');
          this.x = this.cxl(0);
        }),
        this.tlCall(0.2),
        ...this.tlWarpTo(() => { this.x = this.cxl(GAME_WIDTH - w); }),
        this.tlCall(0.2),
        ...this.tlWarpTo(() => { this.x = this.cxl(Math.random() * (GAME_WIDTH - w)); }),
        this.tlCall(0.5),
      ]);
      return;
    }

    if (seed <= 0.4) {
      // Psycho-shot volley: teleport across seven spots, dropping a slow orb at each.
      const spots = [0, 160, 16, 128, 32, 96, CENTER_X - w / 2];
      const tweens = [];
      spots.forEach((left, i) => {
        tweens.push(...this.tlWarpTo(() => {
          this.x = this.cxl(left);
          if (i % 3 === 0) Sound.play('boss_vega_voice_tama');
          this.fire(this.bossData.bulletDataA);
        }));
        tweens.push(this.tlCall(0.3));
      });
      tweens.push(this.tlCall(4));
      this.startTimeline(tweens);
      return;
    }

    if (seed <= 0.7) {
      // Psycho field: park centre and pump out five 72-shot rings.
      const tweens = [
        this.tlMove({ x: CENTER_X, y: baseY + 10 }, 0.3),
        this.tlCall(0.5, () => {
          this.playAnim('shoot');
          Sound.play('boss_vega_voice_shoot');
        }),
        this.tlCall(0.3, () => this.fire(this.bossData.bulletDataB)),
      ];
      for (let i = 0; i < 4; i++) {
        tweens.push(this.tlCall(1, () => this.fire(this.bossData.bulletDataB)));
      }
      tweens.push(this.tlCall(0.01, () => this.playAnim('idle')));
      tweens.push(this.tlCall(3));
      this.startTimeline(tweens);
      return;
    }

    // Crusher: warp above the player, dive past the floor, re-enter from the top.
    this.startTimeline([
      ...this.tlWarpTo(() => { this.x = this.chaseX(); }),
      this.tlMove({ y: baseY - 20 }, 0.2),
      this.tlCall(0.01, () => {
        this.playAnim('attack');
        Sound.play('boss_vega_voice_crusher');
      }),
      this.tlMove({ y: this.cyt(GAME_HEIGHT - 15) }, 0.9),
      this.tlCall(0.01, () => {
        this.playAnim('idle');
        this.x = CENTER_X;
        this.y = this.cyt(-this.character.height);
      }),
      this.tlMove({ y: baseY }, 1),
      this.tlCall(1),
    ]);
  }

  onDead() { Sound.play('boss_vega_voice_ko'); }
}
