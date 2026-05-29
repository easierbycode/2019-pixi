import Phaser from 'phaser';
// AdvScene.js — story interlude before each stage. Faithful layout: background image
// anchored top-left (256x220), foreground cover below it, and a dialogue box in the
// lower half that types out the stage's scenario text. Tap / space advances.
import { SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_Y } from '../constants.js';
import { gameState } from '../state.js';
import { SCENARIO_EN } from '../scenario.js';
import * as Sound from '../sound.js';

export class AdvScene extends Phaser.Scene {
  constructor() { super(SCENES.ADV); }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0);
    Sound.bgmPlay('adventure_bgm');

    const key = `stage${gameState.stageId}`;
    this.parts = (SCENARIO_EN[key] || SCENARIO_EN.stage0).part;
    this.partNum = 0;

    // Background image (top-left origin, 256x220)
    this.bgSprite = this.add.image(0, 0, 'game_ui', 'advBg0.gif').setOrigin(0, 0);

    // Foreground overlay tiled below the background
    this.cover = this.add.tileSprite(0, 220, GAME_WIDTH, GAME_HEIGHT - 220, 'game_asset', 'stagebgOver.gif').setOrigin(0, 0);

    // Dialogue box (drawn first, behind the name box)
    this.txtBox = this.add.graphics();
    this.txtBox.lineStyle(2, 0xffffff, 1).fillStyle(0x000000, 1);
    this.txtBox.fillRoundedRect(8, CENTER_Y + 7, GAME_WIDTH - 16, 180, 6).strokeRoundedRect(8, CENTER_Y + 7, GAME_WIDTH - 16, 180, 6);
    this.txt = this.add.text(15, CENTER_Y + 30, '', {
      fontFamily: 'sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#ffffff', lineSpacing: 4,
      wordWrap: { width: 230 },
    }).setOrigin(0, 0);

    // Name box ("G") — on top of the dialogue box
    this.nameBox = this.add.graphics();
    this.nameBox.lineStyle(2, 0xffffff, 1).fillStyle(0x000000, 1);
    this.nameBox.fillRoundedRect(16, CENTER_Y - 5, 80, 24, 6).strokeRoundedRect(16, CENTER_Y - 5, 80, 24, 6);
    this.add.text(50, CENTER_Y - 4, 'G', { fontFamily: 'sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0, 0);

    // Blinking "continue" indicator at the bottom of the dialogue box.
    this.hint = this.add.text(GAME_WIDTH - 26, CENTER_Y + 165, '▼', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5).setVisible(false);
    this.tweens.add({ targets: this.hint, alpha: 0.2, duration: 450, yoyo: true, repeat: -1 });

    this.input.on('pointerup', () => this.advance());
    this.input.keyboard.on('keydown-SPACE', () => this.advance());

    this.showPart();
  }

  showPart() {
    const part = this.parts[this.partNum];
    const bgFrame = `advBg${part.background}.gif`;
    if (this.textures.get('game_ui').has(bgFrame)) this.bgSprite.setTexture('game_ui', bgFrame);
    if (part.background === 'Done') Sound.play('g_adbenture_voice0');

    this.full = part.text;
    this.shown = 0;
    this.txt.setText('');
    this.complete = false;
    this.hint.setVisible(false);

    if (this.typer) this.typer.remove();
    this.typer = this.time.addEvent({
      delay: 33, loop: true,
      callback: () => {
        if (this.shown >= this.full.length) {
          this.complete = true;
          this.hint.setVisible(true);
          this.typer.remove();
          return;
        }
        this.shown++;
        this.txt.setText(this.full.slice(0, this.shown));
      },
    });
  }

  advance() {
    if (!this.complete) {
      // First tap: reveal the whole line instantly.
      this.shown = this.full.length;
      this.txt.setText(this.full);
      this.complete = true;
      this.hint.setVisible(true);
      if (this.typer) this.typer.remove();
      return;
    }
    Sound.play('se_cursor_sub');
    this.partNum++;
    if (this.partNum >= this.parts.length) { this.finish(); return; }
    this.showPart();
  }

  finish() {
    Sound.play('se_correct');
    Sound.stopBgm('adventure_bgm');
    this.scene.start(SCENES.GAME);
  }
}
