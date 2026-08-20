/* ================================================
   VOICE.JS - Multi-Engine Audio & Speech System
   Hỗ trợ 100% tiếng Việt mọi thiết bị (Online TTS + SpeechSynthesis + Web Audio)
   ================================================ */
'use strict';

const Voice = (function() {
  let synth = window.speechSynthesis;
  let recognition = null;
  let viVoice = null;
  let isSpeaking = false;
  let stepQueue = [];
  let currentStepIdx = 0;
  let currentAudio = null;
  let audioCtx = null;
  let isAudioUnlocked = false;

  // Mở khóa âm thanh trên điện thoại khi người dùng chạm màn hình lần đầu
  function unlockAudio() {
    if (isAudioUnlocked) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
      }
      if (synth && synth.resume) synth.resume();
      isAudioUnlocked = true;
    } catch (e) {
      console.warn('Audio unlock error:', e);
    }
  }

  document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  document.addEventListener('click', unlockAudio, { once: true, passive: true });

  // Khởi tạo âm thanh hiệu ứng (Chime)
  function playChime(callback) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) { if (callback) callback(); return; }
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach(function(f, i) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.22);
      });
      setTimeout(function() { if (callback) callback(); }, 260);
    } catch (e) {
      if (callback) callback();
    }
  }

  // Lấy giọng trình duyệt
  function loadBrowserVoices() {
    if (!synth) return;
    const voices = synth.getVoices();
    viVoice = voices.find(function(v) { return v.lang.startsWith('vi') || v.lang.includes('Vietnam'); })
           || voices.find(function(v) { return v.name.includes('Vietnamese') || v.name.includes('Linh') || v.name.includes('An'); });
  }
  if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadBrowserVoices;
  loadBrowserVoices();

  // Phát âm thanh tiếng Việt: Ưu tiên Online Audio TTS chuẩn 100% tiếng Việt
  function speak(text, onEnd) {
    stop();
    if (!text || !text.trim()) { if (onEnd) onEnd(); return; }
    isSpeaking = true;
    showSpeakingStatus(true, text);

    playChime(function() {
      // Làm sạch chuỗi trước khi đọc
      const cleanText = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();

      // CÁCH 1: Thử Online Google TTS
      const encoded = encodeURIComponent(cleanText.substring(0, 190));
      const onlineAudioUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=' + encoded;

      currentAudio = new Audio(onlineAudioUrl);
      currentAudio.playbackRate = 0.95;

      let fallbackTriggered = false;
      const doFallback = function() {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        speakWithBrowserSpeech(cleanText, onEnd);
      };

      currentAudio.onended = function() {
        isSpeaking = false;
        showSpeakingStatus(false);
        if (onEnd) onEnd();
      };

      currentAudio.onerror = function() {
        doFallback();
      };

      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(function() {
          doFallback();
        });
      }
    });
  }

  // CÁCH 2: Dự phòng bằng Web Speech Synthesis của trình duyệt
  function speakWithBrowserSpeech(text, onEnd) {
    if (!synth) {
      isSpeaking = false;
      showSpeakingStatus(false);
      if (onEnd) onEnd();
      return;
    }
    synth.cancel();
    if (synth.paused) synth.resume();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    u.rate = 0.85;
    u.pitch = 1.0;
    u.volume = 1.0;
    if (viVoice) u.voice = viVoice;

    let ended = false;
    const finish = function() {
      if (ended) return;
      ended = true;
      isSpeaking = false;
      showSpeakingStatus(false);
      if (onEnd) onEnd();
    };

    u.onend = finish;
    u.onerror = finish;

    setTimeout(function() {
      if (isSpeaking && !ended) finish();
    }, (text.length * 150) + 3000);

    synth.speak(u);
  }

  function stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if (synth) {
      synth.cancel();
    }
    isSpeaking = false;
    showSpeakingStatus(false);
  }

  function showSpeakingStatus(show, text) {
    let indicator = document.getElementById('voice-speaking-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'voice-speaking-indicator';
      indicator.innerHTML = '<div class="vsi-wave"><span></span><span></span><span></span><span></span></div><span id="vsi-text">Đang phát âm thanh...</span>';
      document.body.appendChild(indicator);
    }
    if (show) {
      indicator.classList.add('show');
      const txtEl = document.getElementById('vsi-text');
      if (txtEl && text) txtEl.textContent = text.length > 32 ? text.substring(0, 32) + '...' : text;
    } else {
      indicator.classList.remove('show');
    }
  }

  // Nhận diện giọng nói tiếng Việt
  function startVoiceSearch(inputEl, onResult) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      speak('Trình duyệt chưa hỗ trợ tìm kiếm bằng giọng nói. Ông Bà hãy dùng Google Chrome nhé!');
      return;
    }
    if (recognition) recognition.abort();
    recognition = new SR();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = function() {
      speak('Ông Bà hãy nói to điều muốn tìm kiếm nhé!');
      if (inputEl) inputEl.placeholder = '🎙️ Đang nghe... Hãy nói to lên!';
    };
    recognition.onresult = function(e) {
      const text = Array.from(e.results).map(function(r) { return r[0].transcript; }).join('');
      if (inputEl) inputEl.value = text;
      if (e.results[e.results.length - 1].isFinal) {
        if (onResult) onResult(text);
      }
    };
    recognition.onerror = function() {
      if (inputEl) inputEl.placeholder = 'Nói hoặc gõ từ khoá...';
      speak('Chưa nhận được giọng nói. Ông Bà vui lòng nhấn lại nút micro và nói to hơn nhé!');
    };
    recognition.onend = function() {
      if (inputEl) inputEl.placeholder = 'Nói hoặc gõ từ khoá...';
    };
    recognition.start();
  }

  return {
    speak: speak,
    stop: stop,
    startVoiceSearch: startVoiceSearch,
    unlockAudio: unlockAudio,
    get isSpeaking() { return isSpeaking; }
  };
})();

// Inject speaking indicator styles
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.textContent = 
    '#voice-speaking-indicator {' +
    '  position: fixed; top: 75px; left: 50%; transform: translateX(-50%) translateY(-120px);' +
    '  background: rgba(15, 23, 42, 0.95); color: white; padding: 8px 18px;' +
    '  border-radius: 50px; display: flex; align-items: center; gap: 10px;' +
    '  box-shadow: 0 8px 30px rgba(0,0,0,0.4); z-index: 10000;' +
    '  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);' +
    '  backdrop-filter: blur(8px); border: 2px solid #f59e0b;' +
    '  max-width: 90vw; pointer-events: none;' +
    '}' +
    '#voice-speaking-indicator.show { transform: translateX(-50%) translateY(0); }' +
    '.vsi-wave { display: flex; align-items: center; gap: 3px; height: 14px; }' +
    '.vsi-wave span { display: block; width: 3px; background: #f59e0b; border-radius: 3px; animation: vsi-wave 0.8s ease-in-out infinite alternate; }' +
    '.vsi-wave span:nth-child(1) { height: 4px; animation-delay: 0.1s; }' +
    '.vsi-wave span:nth-child(2) { height: 14px; animation-delay: 0.3s; }' +
    '.vsi-wave span:nth-child(3) { height: 8px; animation-delay: 0.2s; }' +
    '.vsi-wave span:nth-child(4) { height: 12px; animation-delay: 0.4s; }' +
    '@keyframes vsi-wave { 0% { height: 3px; } 100% { height: 14px; } }' +
    '#vsi-text { font-size: 0.85rem; font-weight: 700; color: #fef3c7; white-space: nowrap; }';
  document.head.appendChild(style);
});