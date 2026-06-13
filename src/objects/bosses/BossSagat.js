// BossSagat.js — stage 2. Tiger-shot barrages, a charged big shot, and the
// tiger-knee dive. Timeline ported from the original (2019-es7 src/bosses/BossSagat.js).
import { Boss } from './Boss.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../../constants.js';
import * as Sound from '../../sound.js';

export class BossSagat extends Boss {
  constructor(scene, data) {
    super(scene, data);
    const w = this.character.width, h = this.character.height;
    this.hitArea = { x: -w / 2 + 20, y: -h / 2 + 20, width: w - 40, height: h - 20 };
    this.addVoice = 'boss_sagat_voice_add';
  }

  fireTiger() {
    this.playAnim('shoot');
    this.fire(this.bossData.bulletDataA);
    Sound.play('boss_sagat_voice_tama0');
  }

  shootStart() {
    const w = this.character.width, h = this.character.height;
    const baseY = this.cyt(GAME_HEIGHT / 4);
    const seed = Math.random();

    if (seed <= 0.3) {
      // Walking barrage: six tiger shots marching across the screen.
      const stops = [-20, 10, 35, 80, 120, 160];
      const tweens = [];
      for (const left of stops) {
        tweens.push(this.tlMove({ x: this.cxl(left) }, 0.25));
        tweens.push(this.tlCall(0.01, () => this.playAnim('charge')));
        tweens.push(this.tlCall(0.25, () => this.fireTiger()));
      }
      tweens.push(this.tlCall(0.3, () => this.playAnim('idle')));
      this.startTimeline(tweens);
      return;
    }

    if (seed <= 0.6) {
      // Standing barrage: seven tiger shots from one random spot.
      const randX = this.cxl(Math.random() * (GAME_WIDTH - w));
      const tweens = [
        this.tlMove({ x: randX }, 0.25),
        this.tlCall(0.01, () => this.playAnim('charge')),
      ];
      for (let i = 0; i < 7; i++) {
        tweens.push(this.tlCall(0.2, () => this.fireTiger()));
        tweens.push(this.tlCall(0.2, () => this.playAnim('charge')));
      }
      tweens.push(this.tlCall(0.3, () => this.playAnim('idle')));
      this.startTimeline(tweens);
      return;
    }

    if (seed <= 0.8) {
      // Charged big tiger shot.
      const randX = this.cxl(Math.random() * (GAME_WIDTH - w));
      this.startTimeline([
        this.tlMove({ x: randX }, 0.25),
        this.tlCall(0.01, () => this.playAnim('charge')),
        this.tlCall(1.3, () => {
          this.playAnim('shoot');
          this.fire(this.bossData.bulletDataB);
          Sound.play('boss_sagat_voice_tama1');
        }),
        this.tlCall(0.3, () => this.playAnim('idle')),
      ]);
      return;
    }

    // Tiger knee: chase the player, hop, dive to the floor.
    this.startTimeline([
      this.tlMove({ x: this.chaseX(), y: baseY - 20 }, 0.4),
      this.tlCall(0.01, () => this.playAnim('attack', false)),
      this.tlCall(0.5),
      this.tlMove({ y: this.cyt(GAME_HEIGHT - h + 70) }, 0.3, () => Sound.play('boss_sagat_voice_kick')),
      this.tlCall(0.05),
      this.tlMove({ y: baseY }, 0.2),
      this.tlCall(0.01, () => this.playAnim('idle')),
    ]);
  }

  onDead() { Sound.play('boss_sagat_voice_ko'); }
}
