// Audio and Text-To-Speech helper utilities

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ===== Text-To-Speech voice selection =====
// 浏览器默认会用系统 locale 的声线朗读英文（在中文系统上经常被降级成中文声线，
// 听起来非常怪）。这里显式挑选一个高质量的英文声线，按优先级匹配。

let cachedVoice: SpeechSynthesisVoice | null = null;

/** 高质量英文声线优先级列表（名称需与 SpeechSynthesisVoice.name 严格匹配） */
const PREFERRED_VOICE_NAMES = [
  'Google US English',                                    // Chrome 云端声线，最自然
  'Google UK English Female',
  'Google UK English Male',
  'Samantha',                                             // macOS / iOS 内置女声
  'Alex',                                                 // macOS 高级男声
  'Karen',                                                // macOS 澳式女声
  'Daniel',                                               // macOS 英式男声
  'Microsoft Aria Online (Natural) - English (United States)', // Edge 自然声线
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Zira - English (United States)',             // Windows 10 女声
  'Microsoft David - English (United States)',            // Windows 10 男声
];

function pickBestEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const enVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  if (enVoices.length === 0) return null;

  // 1. 优先按名称精确匹配高质量声线
  for (const name of PREFERRED_VOICE_NAMES) {
    const v = enVoices.find((v) => v.name === name);
    if (v) return v;
  }

  // 2. 优先 en-US
  const enUS = enVoices.find((v) => v.lang.toLowerCase() === 'en-us');
  if (enUS) return enUS;

  // 3. 优先本地声线（离线可用，延迟低）
  const local = enVoices.find((v) => v.localService);
  if (local) return local;

  // 4. 退化到任意英文声线
  return enVoices[0];
}

function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  // 每次调用都尝试刷新缓存：iOS Safari 上 voices 可能延迟到首次用户交互后才可用
  if (!cachedVoice) {
    cachedVoice = pickBestEnglishVoice();
  }
  return cachedVoice;
}

// 监听 voices 加载完成事件（Chrome 上 getVoices() 首次返回空数组）
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = pickBestEnglishVoice();
  };
  // 尝试首次加载
  cachedVoice = pickBestEnglishVoice();
}

export function speakEnglishWord(word: string, enabled = true): void {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(word);

    const voice = getBestEnglishVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.92;  // 略慢于默认，更清晰
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech errors gracefully
  }
}

export function playCorrectSound(enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Arpeggio chime E5 -> B5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignore web audio errors
  }
}

export function playErrorSound(enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, ctx.currentTime); // Low A3
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore web audio errors
  }
}

export function playTapSound(enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore web audio errors
  }
}
