import Phaser from 'phaser';
// NumberDisplay.js — renders a number using atlas digit frames (bigNum/smallNum/comboNum/countdown).
export class NumberDisplay extends Phaser.GameObjects.Container {
  constructor(scene, { prefix = 'bigNum', atlas = 'game_ui', digits = 1, spacing = 0 } = {}) {
    super(scene, 0, 0);
    this.prefixKey = prefix;
    this.atlas = atlas;
    this.digits = digits;
    this.spacing = spacing;
    this.sprites = [];
    scene.add.existing(this);
    this.setNum(0);
  }

  setNum(value) {
    const str = Math.max(0, Math.floor(value)).toString().padStart(this.digits, '0');
    this.sprites.forEach((s) => s.destroy());
    this.sprites = [];
    let x = 0;
    for (const ch of str) {
      const frame = `${this.prefixKey}${ch}.gif`;
      const sp = this.scene.add.image(x, 0, this.atlas, frame).setOrigin(0, 0);
      this.add(sp);
      this.sprites.push(sp);
      x += sp.width + this.spacing;
    }
    this.totalWidth = x;
  }
}
