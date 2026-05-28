import Phaser from 'phaser';
// GameTitle.js — "ROUND n / FIGHT", stage clear, time over and K.O. overlays.
import { CENTER_X, CENTER_Y } from '../constants.js';
import * as Sound from '../sound.js';

export const GAMETITLE_EVT = { START: 'gametitle:start' };

export class GameTitle extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
  }

  show(frame, y = CENTER_Y, life = 0) {
    const img = this.scene.add.image(CENTER_X, y, 'game_ui', frame).setOrigin(0.5);
    this.add(img);
    if (life > 0) this.scene.time.delayedCall(life, () => img.destroy());
    return img;
  }

  gameStart(stageId) {
    const title = this.show('stageTitle.gif', CENTER_Y - 20);
    const num = this.show(`stageNum${stageId}.gif`, CENTER_Y + 10);
    Sound.play(`voice_round${Math.min(stageId, 3)}`);
    this.scene.time.delayedCall(1200, () => {
      title.destroy();
      num.destroy();
      const fight = this.show('stageFight.gif');
      Sound.play('voice_fight');
      this.scene.time.delayedCall(900, () => {
        this.scene.tweens.add({
          targets: fight, alpha: 0, duration: 300,
          onComplete: () => { fight.destroy(); this.emit(GAMETITLE_EVT.START); },
        });
      });
    });
  }

  stageClear() { this.show('stageclear.gif', CENTER_Y, 0); Sound.play('voice_another_fighter'); }
  timeover() { this.show('stageTimeover.gif'); }

  akebonofinish() {
    const k = this.show('knockoutK.gif', CENTER_Y - 30);
    const o = this.show('knockoutO.gif', CENTER_Y + 30);
    Sound.play('voice_ko');
    [k, o].forEach((s) => {
      s.setScale(3).setAlpha(0);
      this.scene.tweens.add({ targets: s, scale: 1, alpha: 1, duration: 300, ease: 'Back.easeOut' });
    });
  }
}
