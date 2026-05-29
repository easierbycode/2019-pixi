// constants.js — game-wide constants, asset manifest, audio config.

export const LANG = (() => {
  if (typeof document !== 'undefined') {
    return document.documentElement.lang === 'ja' ? 'ja' : 'en';
  }
  return 'en';
})();

export const BASE_PATH = (() => {
  let base = '';
  if (typeof window !== 'undefined' && 'baseUrl' in window) base = window.baseUrl;
  return base.replace(/^https?:\/\/[^/]+/, '').replace(/\/api\/$/, '');
})();

export const GAME_WIDTH = 256;
export const GAME_HEIGHT = 480;
export const CENTER_X = GAME_WIDTH / 2;
export const CENTER_Y = GAME_HEIGHT / 2;
export const FPS = 30;

export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  TITLE: 'TitleScene',
  ADV: 'AdvScene',
  GAME: 'GameScene',
  CONTINUE: 'ContinueScene',
  GAMEOVER: 'GameoverScene',
  RESULT: 'ResultScene',
  CONGRA: 'CongraScene',
  ENDING: 'EndingScene',
};

export const STAGE = { PROLOGUE: 0, ENDING: 4 };

// BGM loop region markers (microseconds in the original; converted to seconds at play time).
export const BGM_INFO = {
  boss_bison_bgm: { name: 'boss_bison_bgm', start: 914888, end: 6111881 },
  boss_barlog_bgm: { name: 'boss_barlog_bgm', start: 782400, end: 4315201 },
  boss_sagat_bgm: { name: 'boss_sagat_bgm', start: 1635142, end: 6883739 },
  boss_vega_bgm: { name: 'boss_vega_bgm', start: 513529, end: 4325295 },
  boss_goki_bgm: { name: 'boss_goki_bgm', start: 864000, end: 6130287 },
  boss_fang_bgm: { name: 'boss_fang_bgm', start: 888672, end: 5802799 },
};

// Texture atlases (TexturePacker JSON Hash) — { key: [json, png] }
export const ATLASES = {
  game_ui: ['assets/game_ui.json', 'assets/img/game_ui.png'],
  game_asset: ['assets/game_asset.json', 'assets/img/game_asset.png'],
  title_ui: ['assets/title_ui.json', 'assets/img/title_ui.png'],
};

// Plain images — { key: path }
export const IMAGES = {
  title_bg: 'assets/img/title_bg.jpg',
  // loading_bg / loading0-2 are loaded up-front by BootScene.
  stage_loop0: 'assets/img/stage/stage_loop0.png',
  stage_loop1: 'assets/img/stage/stage_loop1.png',
  stage_loop2: 'assets/img/stage/stage_loop2.png',
  stage_loop3: 'assets/img/stage/stage_loop3.png',
  stage_loop4: 'assets/img/stage/stage_loop4.png',
  stage_end0: 'assets/img/stage/stage_end0.png',
  stage_end1: 'assets/img/stage/stage_end1.png',
  stage_end2: 'assets/img/stage/stage_end2.png',
  stage_end3: 'assets/img/stage/stage_end3.png',
  stage_end4: 'assets/img/stage/stage_end4.png',
};

// game.json holds stage layouts + player/enemy/boss recipes; loaded as the `recipe` JSON.
export const RECIPE = { key: 'recipe', path: 'assets/game.json' };

// All audio — { key: path }
export const SOUNDS = {
  voice_titlecall: 'assets/sounds/scene_title/voice_titlecall.mp3',
  se_decision: 'assets/sounds/ui/se_decision.mp3',
  se_correct: 'assets/sounds/ui/se_correct.mp3',
  se_cursor_sub: 'assets/sounds/ui/se_cursor_sub.mp3',
  se_cursor: 'assets/sounds/ui/se_cursor.mp3',
  se_over: 'assets/sounds/ui/se_over.mp3',
  adventure_bgm: 'assets/sounds/scene_adventure/adventure_bgm.mp3',
  g_adbenture_voice0: 'assets/sounds/scene_adventure/g_adbenture_voice0.mp3',
  voice_thankyou: 'assets/sounds/voice_thankyou.mp3',
  se_explosion: 'assets/sounds/se_explosion.mp3',
  se_shoot: 'assets/sounds/se_shoot.mp3',
  se_shoot_b: 'assets/sounds/se_shoot_b.mp3',
  se_ca: 'assets/sounds/se_ca.mp3',
  se_ca_explosion: 'assets/sounds/se_ca_explosion.mp3',
  se_damage: 'assets/sounds/se_damage.mp3',
  se_guard: 'assets/sounds/se_guard.mp3',
  se_finish_akebono: 'assets/sounds/se_finish_akebono.mp3',
  se_barrier_start: 'assets/sounds/se_barrier_start.mp3',
  se_barrier_end: 'assets/sounds/se_barrier_end.mp3',
  voice_round0: 'assets/sounds/voice_round0.mp3',
  voice_round1: 'assets/sounds/voice_round1.mp3',
  voice_round2: 'assets/sounds/voice_round2.mp3',
  voice_round3: 'assets/sounds/voice_round3.mp3',
  voice_fight: 'assets/sounds/voice_fight.mp3',
  voice_ko: 'assets/sounds/voice_ko.mp3',
  voice_another_fighter: 'assets/sounds/voice_another_fighter.mp3',
  g_stage_voice_0: 'assets/sounds/scene_game/g_stage_voice_0.mp3',
  g_stage_voice_1: 'assets/sounds/scene_game/g_stage_voice_1.mp3',
  g_stage_voice_2: 'assets/sounds/scene_game/g_stage_voice_2.mp3',
  g_stage_voice_3: 'assets/sounds/scene_game/g_stage_voice_3.mp3',
  g_stage_voice_4: 'assets/sounds/scene_game/g_stage_voice_4.mp3',
  g_damage_voice: 'assets/sounds/g_damage_voice.mp3',
  g_powerup_voice: 'assets/sounds/g_powerup_voice.mp3',
  g_ca_voice: 'assets/sounds/g_ca_voice.mp3',
  boss_bison_bgm: 'assets/sounds/boss_bison_bgm.mp3',
  boss_bison_voice_add: 'assets/sounds/boss_bison_voice_add.mp3',
  boss_bison_voice_ko: 'assets/sounds/boss_bison_voice_ko.mp3',
  boss_bison_voice_faint: 'assets/sounds/boss_bison_voice_faint.mp3',
  boss_bison_voice_faint_punch: 'assets/sounds/boss_bison_voice_faint_punch.mp3',
  boss_bison_voice_punch: 'assets/sounds/boss_bison_voice_punch.mp3',
  boss_barlog_bgm: 'assets/sounds/boss_barlog_bgm.mp3',
  boss_barlog_voice_add: 'assets/sounds/boss_barlog_voice_add.mp3',
  boss_barlog_voice_ko: 'assets/sounds/boss_barlog_voice_ko.mp3',
  boss_barlog_voice_tama: 'assets/sounds/boss_barlog_voice_tama.mp3',
  boss_barlog_voice_barcelona: 'assets/sounds/boss_barlog_voice_barcelona.mp3',
  boss_sagat_bgm: 'assets/sounds/boss_sagat_bgm.mp3',
  boss_sagat_voice_add: 'assets/sounds/boss_sagat_voice_add.mp3',
  boss_sagat_voice_ko: 'assets/sounds/boss_sagat_voice_ko.mp3',
  boss_sagat_voice_tama0: 'assets/sounds/boss_sagat_voice_tama0.mp3',
  boss_sagat_voice_tama1: 'assets/sounds/boss_sagat_voice_tama1.mp3',
  boss_sagat_voice_kick: 'assets/sounds/boss_sagat_voice_kick.mp3',
  boss_vega_bgm: 'assets/sounds/boss_vega_bgm.mp3',
  boss_vega_voice_add: 'assets/sounds/boss_vega_voice_add.mp3',
  boss_vega_voice_ko: 'assets/sounds/boss_vega_voice_ko.mp3',
  boss_vega_voice_crusher: 'assets/sounds/boss_vega_voice_crusher.mp3',
  boss_vega_voice_warp: 'assets/sounds/boss_vega_voice_warp.mp3',
  boss_vega_voice_tama: 'assets/sounds/boss_vega_voice_tama.mp3',
  boss_vega_voice_shoot: 'assets/sounds/boss_vega_voice_shoot.mp3',
  boss_goki_bgm: 'assets/sounds/boss_goki_bgm.mp3',
  boss_goki_voice_add: 'assets/sounds/boss_goki_voice_add.mp3',
  boss_goki_voice_ko: 'assets/sounds/boss_goki_voice_ko.mp3',
  boss_goki_voice_tama0: 'assets/sounds/boss_goki_voice_tama0.mp3',
  boss_goki_voice_tama1: 'assets/sounds/boss_goki_voice_tama1.mp3',
  boss_goki_voice_ashura: 'assets/sounds/boss_goki_voice_ashura.mp3',
  boss_goki_voice_syungokusatu0: 'assets/sounds/boss_goki_voice_syungokusatu0.mp3',
  boss_goki_voice_syungokusatu1: 'assets/sounds/boss_goki_voice_syungokusatu1.mp3',
  boss_fang_bgm: 'assets/sounds/boss_fang_bgm.mp3',
  boss_fang_voice_add: 'assets/sounds/boss_fang_voice_add.mp3',
  boss_fang_voice_ko: 'assets/sounds/boss_fang_voice_ko.mp3',
  boss_fang_voice_beam0: 'assets/sounds/boss_fang_voice_beam0.mp3',
  boss_fang_voice_beam1: 'assets/sounds/boss_fang_voice_beam1.mp3',
  boss_fang_voice_tama: 'assets/sounds/boss_fang_voice_tama.mp3',
  bgm_continue: 'assets/sounds/scene_continue/bgm_continue.mp3',
  bgm_gameover: 'assets/sounds/scene_continue/bgm_gameover.mp3',
  voice_countdown0: 'assets/sounds/scene_continue/voice_countdown0.mp3',
  voice_countdown1: 'assets/sounds/scene_continue/voice_countdown1.mp3',
  voice_countdown2: 'assets/sounds/scene_continue/voice_countdown2.mp3',
  voice_countdown3: 'assets/sounds/scene_continue/voice_countdown3.mp3',
  voice_countdown4: 'assets/sounds/scene_continue/voice_countdown4.mp3',
  voice_countdown5: 'assets/sounds/scene_continue/voice_countdown5.mp3',
  voice_countdown6: 'assets/sounds/scene_continue/voice_countdown6.mp3',
  voice_countdown7: 'assets/sounds/scene_continue/voice_countdown7.mp3',
  voice_countdown8: 'assets/sounds/scene_continue/voice_countdown8.mp3',
  voice_countdown9: 'assets/sounds/scene_continue/voice_countdown9.mp3',
  voice_gameover: 'assets/sounds/scene_continue/voice_gameover.mp3',
  g_continue_yes_voice0: 'assets/sounds/scene_continue/g_continue_yes_voice0.mp3',
  g_continue_yes_voice1: 'assets/sounds/scene_continue/g_continue_yes_voice1.mp3',
  g_continue_yes_voice2: 'assets/sounds/scene_continue/g_continue_yes_voice2.mp3',
  g_continue_no_voice0: 'assets/sounds/scene_continue/g_continue_no_voice0.mp3',
  g_continue_no_voice1: 'assets/sounds/scene_continue/g_continue_no_voice1.mp3',
  voice_congra: 'assets/sounds/scene_clear/voice_congra.mp3',
};

export const VOLUMES = {
  voice_titlecall: 0.7, se_decision: 0.75, se_correct: 0.9,
  se_cursor_sub: 0.9, se_cursor: 0.9, se_over: 0.9,
  adventure_bgm: 0.2, g_adbenture_voice0: 0.5, voice_thankyou: 0.7,
  se_explosion: 0.35, se_shoot: 0.3, se_shoot_b: 0.3, se_ca: 0.8,
  se_ca_explosion: 0.9, se_damage: 0.15, se_guard: 0.2,
  se_finish_akebono: 0.9, se_barrier_start: 0.9, se_barrier_end: 0.9,
  voice_round0: 0.7, voice_round1: 0.7, voice_round2: 0.7, voice_round3: 0.7,
  voice_fight: 0.7, voice_ko: 0.7, voice_another_fighter: 0.7,
  g_stage_voice_0: 0.55, g_stage_voice_1: 0.7, g_stage_voice_2: 0.45,
  g_stage_voice_3: 0.45, g_stage_voice_4: 0.55, g_damage_voice: 0.7,
  g_powerup_voice: 0.55, g_ca_voice: 0.7, boss_bison_bgm: 0.4,
  boss_bison_voice_add: 0.65, boss_bison_voice_ko: 0.9, boss_bison_voice_faint: 0.55,
  boss_bison_voice_faint_punch: 0.65, boss_bison_voice_punch: 0.65,
  boss_barlog_bgm: 0.4, boss_barlog_voice_add: 0.7, boss_barlog_voice_ko: 0.9,
  boss_barlog_voice_tama: 0.6, boss_barlog_voice_barcelona: 0.7,
  boss_sagat_bgm: 0.4, boss_sagat_voice_add: 0.9, boss_sagat_voice_ko: 0.9,
  boss_sagat_voice_tama0: 0.45, boss_sagat_voice_tama1: 0.65, boss_sagat_voice_kick: 0.65,
  boss_vega_bgm: 0.3, boss_vega_voice_add: 0.7, boss_vega_voice_ko: 0.9,
  boss_vega_voice_crusher: 0.7, boss_vega_voice_warp: 0.7, boss_vega_voice_tama: 0.7,
  boss_vega_voice_shoot: 0.7, boss_goki_bgm: 0.4, boss_goki_voice_add: 0.7,
  boss_goki_voice_ko: 0.9, boss_goki_voice_tama0: 0.7, boss_goki_voice_tama1: 0.7,
  boss_goki_voice_ashura: 0.7, boss_goki_voice_syungokusatu0: 0.7,
  boss_goki_voice_syungokusatu1: 0.7, boss_fang_bgm: 0.4, boss_fang_voice_add: 0.6,
  boss_fang_voice_ko: 0.9, boss_fang_voice_beam0: 0.6, boss_fang_voice_beam1: 0.6,
  boss_fang_voice_tama: 0.6, bgm_continue: 0.25, bgm_gameover: 0.3,
  voice_countdown0: 0.7, voice_countdown1: 0.7, voice_countdown2: 0.7,
  voice_countdown3: 0.7, voice_countdown4: 0.7, voice_countdown5: 0.7,
  voice_countdown6: 0.7, voice_countdown7: 0.7, voice_countdown8: 0.7,
  voice_countdown9: 0.7, voice_gameover: 0.7, g_continue_yes_voice0: 0.7,
  g_continue_yes_voice1: 0.7, g_continue_yes_voice2: 0.7,
  g_continue_no_voice0: 0.7, g_continue_no_voice1: 0.7, voice_congra: 0.7,
};

export const SHOOT_MODES = { NORMAL: 'normal', BIG: 'big', THREE_WAY: '3way' };
export const SHOOT_SPEEDS = { NORMAL: 'speed_normal', HIGH: 'speed_high' };
export const ITEM_TYPES = { BARRIER: 'barrier' };
