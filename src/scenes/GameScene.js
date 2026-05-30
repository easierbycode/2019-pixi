import Phaser from 'phaser';
// GameScene.js — core gameplay: waves, bullets, collisions, boss fight, scene transitions.
import {
  SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_X,
  SHOOT_MODES, SHOOT_SPEEDS, ITEM_TYPES, BGM_INFO,
} from '../constants.js';
import { gameState, saveHighScore } from '../state.js';
import { frameRange } from '../anims.js';
import { hitTest } from '../hit.js';
import * as Sound from '../sound.js';
import { Player } from '../objects/Player.js';
import { Enemy } from '../objects/Enemy.js';
import { Bullet } from '../objects/Bullet.js';
import { EVT } from '../objects/BaseUnit.js';
import { HUD, HUD_EVT } from '../ui/HUD.js';
import { NumberDisplay } from '../ui/NumberDisplay.js';
import { GameTitle, GAMETITLE_EVT } from '../ui/GameTitle.js';
import { StageBackground } from '../ui/StageBackground.js';
import { CutinContainer } from '../ui/CutinContainer.js';
import { BossBison } from '../objects/bosses/BossBison.js';
import { BossBarlog } from '../objects/bosses/BossBarlog.js';
import { BossSagat } from '../objects/bosses/BossSagat.js';
import { BossVega, EVT_GOKI } from '../objects/bosses/BossVega.js';
import { BossGoki } from '../objects/bosses/BossGoki.js';
import { BossFang } from '../objects/bosses/BossFang.js';

const DEPTH = { BG: 0, UNIT: 10, ITEM: 11, BULLET: 12, HUD: 20, OVERLAY: 30 };

export class GameScene extends Phaser.Scene {
  constructor() { super(SCENES.GAME); }

  create() {
    this.recipe = this.cache.json.get('recipe');
    this.waveInterval = 80;
    this.waveCount = 0;
    this.frameCnt = 0;
    this.stageScrollSpeed = 0.7;
    this.enemyWaveFlg = false;
    this.theWorldFlg = false;
    this.sceneSwitch = 0;
    this.boss = null;
    this.bossTimerStartFlg = false;
    this.bossTimerCountDown = 99;
    this.bossTimerFrameCnt = 0;

    this.enemies = [];
    this.items = [];
    this.playerBullets = [];
    this.enemyBullets = [];

    this.explosionFrames = frameRange('explosion', 7, 2);
    this.itemFramesMap = {
      [SHOOT_MODES.BIG]: frameRange('powerupBig', 2),
      [SHOOT_MODES.THREE_WAY]: frameRange('powerup3way', 2),
      [ITEM_TYPES.BARRIER]: frameRange('barrierItem', 2),
      [SHOOT_SPEEDS.HIGH]: frameRange('speedupItem', 2),
    };

    // Stage background
    this.stageBg = new StageBackground(this);
    this.stageBg.init(gameState.stageId);
    this.stageBg.setDepth(DEPTH.BG);

    // Player & state
    const playerData = { ...this.recipe.playerData };
    gameState.playerMaxHp = playerData.maxHp;
    gameState.caDamage = playerData.spDamage;
    if (!gameState.playerHp) gameState.playerHp = playerData.maxHp;
    playerData.explosion = this.explosionFrames;
    playerData.hit = frameRange('hit', 5);
    playerData.guard = frameRange('guard', 5);
    playerData.barrierEffect = 'barrierEffect.gif';

    this.player = new Player(this, playerData);
    this.player.setDepth(DEPTH.UNIT);
    this.player.barrierTime = playerData.barrier ? playerData.barrier.time : 4;
    this.player.on(EVT.BULLET_ADD, (list) => this.handlePlayerShoot(list));
    this.player.on(EVT.DEAD, () => this.gameover());
    this.player.on(EVT.DEAD_COMPLETE, () => this.gameoverComplete());
    gameState.playerRef = this.player;
    this.player.setUp(gameState.playerHp, gameState.shootMode, gameState.shootSpeed);
    this.player.setPosition(CENTER_X, GAME_HEIGHT - this.player.character.height - 30);
    this.player.unitX = this.player.x;

    // HUD
    this.hud = new HUD(this);
    this.hud.setDepth(DEPTH.HUD);
    this.hud.on(HUD_EVT.CA_FIRE, () => this.caFire());
    this.hud.setPercent(this.player.percent);
    this.hud.scoreCount = gameState.score;
    this.hud.highScore = gameState.highScore;
    this.hud.maxCombCount = gameState.maxCombo;
    this.hud.cagageCount = gameState.cagage;
    this.hud.caBtnDeactive();

    // Overlays
    this.gameTitle = new GameTitle(this);
    this.gameTitle.setDepth(DEPTH.OVERLAY);
    this.gameTitle.on(GAMETITLE_EVT.START, () => this.gameStart());
    this.cutin = new CutinContainer(this);
    this.cutin.setDepth(DEPTH.OVERLAY + 1);

    // Stage enemy layout
    const stageData = this.recipe[`stage${gameState.stageId}`];
    this.stageEnemyPositionList = stageData && stageData.enemylist ? [...stageData.enemylist].reverse() : [];

    // BGM
    const bossData = this.recipe.bossData[`boss${gameState.stageId}`];
    this.stageBgmName = bossData ? `boss_${bossData.name}_bgm` : '';
    if (BGM_INFO[this.stageBgmName]) {
      if (gameState.stageId === 4) this.time.delayedCall(3000, () => Sound.bgmPlay(this.stageBgmName));
      else Sound.bgmPlay(this.stageBgmName);
    }

    // Input — keyboard (arrows move, Space fires CA) mirrors the pointer drag.
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keyup-SPACE', () => this.hud.requestCaFire());
    this.input.on('pointerdown', (p) => { this.dragging = true; this.player.unitX = p.x; });
    this.input.on('pointermove', (p) => { if (this.dragging) this.player.unitX = p.x; });
    this.input.on('pointerup', () => { this.dragging = false; });

    // Start round animation
    this.gameTitle.gameStart(gameState.stageId);
    this.time.delayedCall(2600, () => {
      Sound.play(`g_stage_voice_${gameState.stageId}`);
      this.hud.caBtnActive();
    });

    this.events.once('shutdown', () => this.cleanup());
  }

  gameStart() {
    this.enemyWaveFlg = true;
    this.player.shootStart();
  }

  update(time, delta) {
    const d = delta / (1000 / 60);
    gameState.frame = (gameState.frame + 1) % 60;
    if (this.player) {
      this.player.keyLeft = this.cursors.left.isDown;
      this.player.keyRight = this.cursors.right.isDown;
    }
    if (this.theWorldFlg) return; // "the world": freeze the player (and all gameplay) until it clears

    const scroll = this.stageScrollSpeed * d;
    this.stageBg.loop(scroll);
    this.player.loop(d);
    this.hud.updateComboTimer(d);

    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const b = this.playerBullets[i];
      b.loop(d);
      if (b.y < -b.character.height || b.x < -20 || b.x > GAME_WIDTH + 20) this.removePlayerBullet(b, i);
    }
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      b.loop(d);
      if (b.y > GAME_HEIGHT + 20 || b.y < -40 || b.x < -40 || b.x > GAME_WIDTH + 40) this.removeEnemyBullet(b, i);
    }
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.deadFlg) continue;
      e.loop(d, scroll);
      if (e !== this.boss && (e.y > GAME_HEIGHT + 40 || e.x < -60 || e.x > GAME_WIDTH + 60)) this.removeEnemy(e, i);
    }
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y += (1 + scroll) * d;
      if (it.y > GAME_HEIGHT + 20) this.removeItem(it, i);
    }

    this.checkCollisions();

    if (this.enemyWaveFlg) {
      this.frameCnt += d;
      if (this.frameCnt >= this.waveInterval) { this.enemyWave(); this.frameCnt = 0; }
    }

    if (this.bossTimerStartFlg && this.boss) {
      this.bossTimerFrameCnt += d;
      if (this.bossTimerFrameCnt >= 60) {
        this.bossTimerFrameCnt = 0;
        this.bossTimerCountDown--;
        if (this.bossTimerNum) this.bossTimerNum.setNum(Math.max(0, this.bossTimerCountDown));
        if (this.bossTimerCountDown <= 0) { this.bossTimerStartFlg = false; this.timeover(); }
      }
    }
  }

  // ---- Collisions ----
  checkCollisions() {
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const b = this.playerBullets[i];
      if (b.deadFlg) continue;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (e.deadFlg) continue;
        if (hitTest(b, e)) { this.playerBulletHitEnemy(b, e, i, j); break; }
      }
    }
    if (!this.player.deadFlg && !this.player.barrierFlg) {
      for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        const b = this.enemyBullets[i];
        if (b.deadFlg) continue;
        if (hitTest(b, this.player)) { this.playerDamage(b.damage); b.onDamage(1); }
      }
    }
    if (!this.player.deadFlg) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (e.deadFlg) continue;
        if (this.player.barrierFlg) {
          if (this.player.barrier && hitTest(e, { x: this.player.x, y: this.player.y, hitArea: { x: -16, y: -50, width: 32, height: 40 } })) {
            this.player.barrierHitEffect();
            if (e !== this.boss) { e.onDamage(Infinity); }
          }
        } else if (hitTest(e, this.player)) {
          if (e === this.boss && e.bossName === 'goki') this.handleGokiGrab();
          else { this.playerDamage(1); if (e !== this.boss) e.onDamage(1); }
        }
      }
    }
    if (!this.player.deadFlg) {
      for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i];
        if (hitTest(it, this.player)) this.handleItemPickup(it, i);
      }
    }
  }

  playerBulletHitEnemy(bullet, enemy, bi, ei) {
    const before = enemy.hp;
    enemy.onDamage(bullet.damage);
    bullet.onDamage(1, before > 0 ? 'normal' : 'infinity');
    if (enemy.hp <= 0 && before > 0) this.handleEnemyRemoved(enemy);
  }

  handleItemPickup(item, index) {
    Sound.play('g_powerup_voice');
    switch (item.itemName) {
      case SHOOT_SPEEDS.HIGH: this.player.shootSpeedChange(SHOOT_SPEEDS.HIGH); break;
      case ITEM_TYPES.BARRIER: this.player.barrierStart(); break;
      default:
        if (this.player.shootMode !== item.itemName) this.player.shootSpeedChange(SHOOT_SPEEDS.NORMAL);
        this.player.shootModeChange(item.itemName);
    }
    this.removeItem(item, index);
  }

  handleGokiGrab() {
    if (this.theWorldFlg) return;
    this.theWorldFlg = true;
    this.hud.caBtnDeactive();
    this.boss.shungokusatsu();
    this.player.setAlpha(0);
    this.time.delayedCall(1800, () => this.player && this.player.setAlpha(1));
    this.time.delayedCall(1900, () => this.stageBg.akebonoGokifinish());
    this.time.delayedCall(2700, () => { this.theWorldFlg = false; this.playerDamage(100); });
    this.time.delayedCall(3000, () => this.gameTitle.akebonofinish());
  }

  // ---- Spawning ----
  enemyWave() {
    if (this.waveCount >= this.stageEnemyPositionList.length) {
      if (!this.boss) this.bossAdd();
    } else {
      this.spawnEnemyRow(this.stageEnemyPositionList[this.waveCount]);
      this.waveCount++;
    }
  }

  spawnEnemyRow(row) {
    row.forEach((code, index) => {
      if (code === '00' || typeof code !== 'string') return;
      const typeId = code[0];
      const itemCode = code[1];
      const tmpl = this.recipe.enemyData[`enemy${typeId}`];
      if (!tmpl) return;
      const data = { ...tmpl, explosion: this.explosionFrames };
      if (data.bulletData) data.bulletData = { ...data.bulletData, atlasKey: 'game_asset', explosion: this.explosionFrames };
      const itemName = { 1: SHOOT_MODES.BIG, 2: SHOOT_MODES.THREE_WAY, 3: SHOOT_SPEEDS.HIGH, 9: ITEM_TYPES.BARRIER }[itemCode] || null;
      data.itemName = itemName;
      data.itemTexture = itemName ? this.itemFramesMap[itemName] : null;

      const enemy = new Enemy(this, data);
      enemy.setDepth(DEPTH.UNIT);
      enemy.setPosition(32 * index + 16, -32);
      enemy.on(EVT.DEAD, () => this.handleEnemyRemoved(enemy));
      enemy.on(EVT.DEAD_COMPLETE, () => this.handleEnemyCleanup(enemy));
      enemy.on(EVT.TAMA_ADD, (ctx) => this.handleEnemyShoot(ctx));
      this.enemies.push(enemy);
    });
  }

  bossAdd() {
    this.enemyWaveFlg = false;
    this.stageBg.bossScene();
    const classes = [BossBison, BossBarlog, BossSagat, BossVega, BossFang];
    let dataKey = `boss${gameState.stageId}`;
    let BossClass = classes[gameState.stageId] || BossBison;
    let vegaToGoki = false;
    if (gameState.stageId === 3) { BossClass = BossVega; dataKey = 'boss3'; vegaToGoki = gameState.continueCnt === 0; }
    if (gameState.stageId === 4) { BossClass = BossFang; dataKey = 'boss4'; }

    const data = { ...this.recipe.bossData[dataKey], explosion: this.explosionFrames };
    this.boss = new BossClass(this, data);
    this.boss.setDepth(DEPTH.UNIT);
    this.boss.on(EVT.DEAD, () => this.handleBossRemoved(this.boss));
    this.boss.on(EVT.DEAD_COMPLETE, () => this.handleEnemyCleanup(this.boss));
    this.boss.on(EVT.TAMA_ADD, (ctx) => this.handleEnemyShoot(ctx));
    if (vegaToGoki) { this.boss.gokiFlg = true; this.boss.on(EVT_GOKI, () => this.replaceVegaWithGoki()); }
    this.boss.enter();
    this.enemies.push(this.boss);

    // Boss timer UI
    this.bossTimerText = this.add.image(CENTER_X - 18, 58, 'game_ui', 'timeTxt.gif').setOrigin(1, 0).setDepth(DEPTH.HUD).setAlpha(0);
    this.bossTimerNum = new NumberDisplay(this);
    this.bossTimerNum.setPosition(CENTER_X - 12, 56).setDepth(DEPTH.HUD);
    this.bossTimerNum.setNum(this.bossTimerCountDown);
    this.bossTimerNum.setAlpha(0);
    this.tweens.add({
      targets: [this.bossTimerText, this.bossTimerNum], alpha: 1, delay: (this.boss.appearDuration || 6) * 1000, duration: 200,
      onComplete: () => { this.bossTimerStartFlg = true; this.bossTimerFrameCnt = 0; },
    });
  }

  replaceVegaWithGoki() {
    const vega = this.boss;
    if (!vega || vega.bossName !== 'vega') return;
    this.theWorldFlg = true;
    this.hud.caBtnDeactive();
    const data = { ...this.recipe.bossData.bossExtra, explosion: this.explosionFrames };
    const goki = new BossGoki(this, data);
    goki.setDepth(DEPTH.UNIT);
    goki.setPosition(vega.x, vega.y).setAlpha(0);
    goki.on(EVT.DEAD, () => this.handleBossRemoved(goki));
    goki.on(EVT.DEAD_COMPLETE, () => this.handleEnemyCleanup(goki));
    goki.on(EVT.TAMA_ADD, (ctx) => this.handleEnemyShoot(ctx));
    goki.toujou();
    this.tweens.add({ targets: vega, alpha: 0, duration: 1000, onComplete: () => {
      const idx = this.enemies.indexOf(vega); if (idx > -1) this.enemies.splice(idx, 1);
      vega.destroy();
    } });
    this.tweens.add({ targets: goki, alpha: 1, duration: 500, delay: 500, onComplete: () => {
      this.boss = goki;
      goki.moveFlg = false;
      goki.shootStart();
      this.enemies.push(goki);
      this.theWorldFlg = false;
      this.hud.caBtnActive();
      Sound.stopBgm(this.stageBgmName);
      this.stageBgmName = 'boss_goki_bgm';
      Sound.bgmPlay('boss_goki_bgm');
    } });
  }

  // ---- Bullet spawning ----
  handlePlayerShoot(list) {
    list.forEach((data) => {
      const bullet = new Bullet(this, { ...data, atlasKey: 'game_asset' });
      bullet.setDepth(DEPTH.BULLET);
      bullet.setPosition(this.player.x + data.startX, this.player.y + data.startY);
      bullet.once(EVT.DEAD_COMPLETE, () => {
        const idx = this.playerBullets.indexOf(bullet);
        if (idx > -1) this.removePlayerBullet(bullet, idx);
      });
      this.playerBullets.push(bullet);
    });
  }

  spawnEnemyBullet(data, x, y, rot, opts = {}) {
    const bullet = new Bullet(this, { ...data, atlasKey: 'game_asset', rotation: rot });
    bullet.setDepth(DEPTH.BULLET);
    bullet.setPosition(x, y);
    if (opts.rotX !== undefined) { bullet.rotX = opts.rotX; bullet.rotY = opts.rotY; }
    bullet.once(EVT.DEAD_COMPLETE, () => {
      const idx = this.enemyBullets.indexOf(bullet);
      if (idx > -1) this.removeEnemyBullet(bullet, idx);
    });
    this.enemyBullets.push(bullet);
    return bullet;
  }

  handleEnemyShoot(ctx) {
    const data = ctx.bulletData;
    if (!data || !data.texture) return;
    data.explosion = data.explosion || this.explosionFrames;
    const ox = ctx.x;
    const oy = ctx.y + (ctx.hitArea ? ctx.hitArea.height / 2 : 0);
    const aimAt = () => {
      const p = gameState.playerRef;
      return p ? Math.atan2(p.y - oy, p.x - ox) : Math.PI / 2;
    };
    const pattern = ctx.pattern || 'down';
    if (pattern === 'aimed') {
      this.spawnEnemyBullet(data, ox, oy, aimAt());
    } else if (pattern === 'spread') {
      const base = aimAt();
      [-0.3, 0, 0.3].forEach((off) => this.spawnEnemyBullet(data, ox, oy, base + off));
    } else if (pattern === 'ring') {
      const n = 24;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        this.spawnEnemyBullet(data, ox, oy, a, { rotX: Math.cos(a), rotY: Math.sin(a) });
      }
    } else {
      this.spawnEnemyBullet(data, ox, oy, Math.PI / 2);
    }
  }

  // ---- Death handling ----
  handleEnemyRemoved(enemy) {
    if (!enemy) return;
    this.hud.comboCount += 1;
    this.hud.scoreCount += enemy.score;
    this.hud.cagageCount += enemy.cagage;
    this.hud.scoreView(enemy);
    const item = enemy.dropItem && enemy.dropItem();
    if (item) { item.setDepth(DEPTH.ITEM); this.items.push(item); }
  }

  handleEnemyCleanup(enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx > -1) this.removeEnemy(enemy, idx);
    if (enemy === this.boss) this.bossDefeated();
  }

  handleBossRemoved(boss) {
    if (!boss) return;
    this.theWorldFlg = true;
    this.bossTimerStartFlg = false;
    this.hud.comboCount += 1;
    this.hud.scoreCount += boss.score;
    this.hud.cagageCount += boss.cagage;
    this.hud.scoreView(boss);
    this.hud.caBtnDeactive(true);
    this.player.shootStop();
    this.clearBullets();
  }

  bossDefeated() {
    if (this.bossTimerText) { this.bossTimerText.destroy(); this.bossTimerText = null; }
    if (this.bossTimerNum) { this.bossTimerNum.destroy(); this.bossTimerNum = null; }
    this.time.delayedCall(500, () => {
      if (this.hud.caFireFlg) { this.stageBg.akebonofinish(); this.gameTitle.akebonofinish(); gameState.akebonoCnt++; }
      else this.gameTitle.stageClear();
    });
    this.time.delayedCall(3000, () => this.stageClear());
  }

  // ---- Removal helpers ----
  removeEntity(entity, list, index) {
    if (!entity) return;
    entity.removeAllListeners();
    if (index > -1 && list[index] === entity) list.splice(index, 1);
    entity.destroy();
  }
  removeEnemy(e, i) { this.removeEntity(e, this.enemies, i); }
  removeItem(it, i) { this.removeEntity(it, this.items, i); }
  removePlayerBullet(b, i) { this.removeEntity(b, this.playerBullets, i); }
  removeEnemyBullet(b, i) { this.removeEntity(b, this.enemyBullets, i); }
  clearBullets() {
    [...this.playerBullets].forEach((b) => this.removeEntity(b, this.playerBullets, this.playerBullets.indexOf(b)));
    [...this.enemyBullets].forEach((b) => this.removeEntity(b, this.enemyBullets, this.enemyBullets.indexOf(b)));
  }

  // ---- State transitions ----
  playerDamage(amount) {
    if (!this.player || this.player.deadFlg) return;
    this.cameras.main.shake(120, 0.01);
    this.player.onDamage(amount);
    this.hud.onDamage(this.player.percent);
  }

  caFire() {
    if (this.theWorldFlg || !this.hud.cagageFlg) return;
    this.theWorldFlg = true;
    this.hud.caFireFlg = true;
    if (this.boss) this.boss.onTheWorld(true);
    // Keep the player auto-firing: "the world" freezes the loop (see update), and it
    // resumes shooting when theWorldFlg clears — matching the original (Player.caFire is a no-op).
    this.clearBullets();
    this.cutin.start();
    Sound.play('g_ca_voice');
    const line = this.add.rectangle(this.player.x, this.player.y, 3, 1, 0xff0000).setOrigin(0.5, 1).setDepth(DEPTH.OVERLAY - 1);
    this.tweens.add({ targets: line, scaleY: GAME_HEIGHT * 2, duration: 300, delay: 1900, ease: 'Power1.easeIn',
      onComplete: () => {
        Sound.play('se_ca');
        this.triggerCAExplosions();
        this.applyCADamage();
        this.tweens.add({ targets: line, alpha: 0, duration: 100, onComplete: () => line.destroy() });
        this.time.delayedCall(1000, () => {
          this.theWorldFlg = false;
          this.hud.caFireFlg = false;
          if (this.boss && this.boss.hp > 0) this.boss.onTheWorld(false);
        });
      } });
    this.hud.cagageCount = 0;
  }

  triggerCAExplosions() {
    const frames = frameRange('spExplosion', 8, 2);
    if (!this.anims.exists('ca_spexp')) {
      this.anims.create({ key: 'ca_spexp', frames: frames.map((f) => ({ key: 'game_asset', frame: f })), frameRate: 16, repeat: 0 });
    }
    for (let i = 0; i < 48; i++) {
      const row = Math.floor(i / 8), col = i % 8;
      const x = col * 32 + 16, y = GAME_HEIGHT - 120 - row * 45;
      this.time.delayedCall(i * 10, () => {
        const ex = this.add.sprite(x, y, 'game_asset', frames[0]).setOrigin(0.5).setDepth(DEPTH.OVERLAY);
        ex.play('ca_spexp');
        ex.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => ex.destroy());
        if (i % 16 === 0) Sound.play('se_ca_explosion');
      });
    }
  }

  applyCADamage() {
    [...this.enemies].forEach((e, i) => {
      if (e && !e.deadFlg) this.time.delayedCall(i * 5, () => {
        if (e && !e.deadFlg) { e.onDamage(gameState.caDamage); if (e.hp <= 0) this.handleEnemyRemoved(e); }
      });
    });
  }

  stageClear() {
    if (this.sceneSwitch === 1) return;
    this.sceneSwitch = 1;
    this.theWorldFlg = true;
    gameState.playerHp = this.player.hp;
    gameState.cagage = this.hud.cagageCount;
    gameState.score = this.hud.scoreCount;
    gameState.maxCombo = this.hud.maxCombCount;
    gameState.shootMode = this.player.shootMode;
    gameState.shootSpeed = this.player.shootSpeedBoost === 0 ? SHOOT_SPEEDS.NORMAL : SHOOT_SPEEDS.HIGH;
    this.player.shootStop();
    saveHighScore();
    Sound.stopBgm(this.stageBgmName);
    this.time.delayedCall(2300, () => {
      gameState.stageId++;
      if (gameState.stageId > 4) this.scene.start(SCENES.CONGRA);
      else this.scene.start(SCENES.ADV);
    });
  }

  gameover() {
    if (this.theWorldFlg && this.sceneSwitch !== 0) return;
    this.theWorldFlg = true;
    this.sceneSwitch = 0;
    gameState.score = this.hud.scoreCount;
    gameState.maxCombo = this.hud.maxCombCount;
    this.hud.caBtnDeactive();
    if (this.boss) this.boss.onTheWorld(true);
    saveHighScore();
  }

  gameoverComplete() {
    this.time.delayedCall(1000, () => {
      Sound.stopBgm(this.stageBgmName);
      this.scene.start(SCENES.CONTINUE);
    });
  }

  timeover() {
    if (this.sceneSwitch !== 0) return;
    this.theWorldFlg = true;
    gameState.score = this.hud.scoreCount;
    gameState.maxCombo = this.hud.maxCombCount;
    this.hud.caBtnDeactive();
    if (this.boss) this.boss.onTheWorld(true);
    saveHighScore();
    this.gameTitle.timeover();
    this.time.delayedCall(2000, () => { Sound.stopBgm(this.stageBgmName); this.scene.start(SCENES.CONTINUE); });
  }

  cleanup() {
    if (this.stageBgmName) Sound.stopBgm(this.stageBgmName);
    gameState.playerRef = null;
  }
}
