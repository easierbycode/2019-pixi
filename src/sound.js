// sound.js — thin wrapper over Phaser's global sound manager.
// Replaces the original pixi-sound based soundManager.
import { VOLUMES, BGM_INFO } from './constants.js';
import { gameState } from './state.js';

let manager = null;
const cache = new Map(); // key -> Phaser.Sound.BaseSound
const bgmKeys = new Set();

export function initSound(game) {
  manager = game.sound;
}

function get(key) {
  if (!manager) return null;
  if (cache.has(key)) return cache.get(key);
  if (!manager.game.cache.audio.has(key)) return null;
  const snd = manager.add(key, { volume: VOLUMES[key] ?? 1 });
  cache.set(key, snd);
  return snd;
}

export function play(key) {
  if (gameState.lowModeFlg) return null;
  const snd = get(key);
  if (!snd) return null;
  try { snd.play(); } catch (e) { /* autoplay may be blocked until first gesture */ }
  return snd;
}

export function stop(key) {
  const snd = cache.get(key);
  if (snd && snd.isPlaying) snd.stop();
}

// Play once from the top, then loop the [start,end] region (microseconds in BGM_INFO).
export function bgmPlay(key) {
  if (gameState.lowModeFlg) return;
  const snd = get(key);
  if (!snd) return;
  bgmKeys.add(key);
  const info = BGM_INFO[key];
  if (info) {
    const startSec = info.start / 1e6;
    const endSec = info.end / 1e6;
    snd.addMarker({ name: 'loop', start: startSec, duration: endSec - startSec, config: { loop: true } });
    snd.once('complete', () => { if (bgmKeys.has(key)) snd.play('loop'); });
  } else {
    snd.setLoop?.(true);
  }
  try { snd.play(); } catch (e) { /* gesture-gated */ }
}

export function stopBgm(key) {
  bgmKeys.delete(key);
  stop(key);
}

export function stopAll() {
  if (gameState.lowModeFlg) return;
  bgmKeys.clear();
  if (manager) manager.stopAll();
}

export function pauseAll() { if (manager && !gameState.lowModeFlg) manager.pauseAll(); }
export function resumeAll() { if (manager && !gameState.lowModeFlg) manager.resumeAll(); }
