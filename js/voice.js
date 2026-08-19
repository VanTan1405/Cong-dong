/* ================================================
   VOICE.JS - Multi-Engine Audio & Speech System
   Hỗ trợ 100% tiếng Việt mọi thiết bị (Online TTS + SpeechSynthesis + Web Audio)
   ================================================ */
'use strict';

const Voice = (() => {
  let synth = window.speechSynthesis;
  let recognition = null;
  let viVoice = null;
  let isSpeaking = false;
  let stepQueue = [];
  let currentStepIdx = 0;
  let currentAudio = null;
  let audioCtx = null;

  // Khởi tạo âm thanh hiệu ứng (Chime)
  function playChime(callback) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) { if (callback) callback(); return; }
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      // Nốt Đồ - Mi - Sol êm dịu
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.15, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
      setTimeout(() => { if (callback) callback(); }, 280);
    } catch (e) {
      if (callback) callback();
    }
  }

  // Lấy giọng trình duyệt
  function loadBrowserVoices() {
    if (!synth) return;
    const voices = synth.getVoices();
    viVoice = voices.find(v => v.lang.startsWith('vi') || v.lang.includes('Vietnam'))
           || voices.find(v => v.name.includes('Vietnamese') || v.name.includes('Linh') || v.name.includes('An'));
  }
  if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadBrowserVoices;
  loadBrowserVoices();

  // Phát âm thanh tiếng Việt: Ưu tiên Online Audio TTS chuẩn 100% tiếng Việt
  function speak(text, onEnd) {
    stop();
    if (!text || !text.trim()) { if (onEnd) onEnd(); return; }
    isSpeaking = true;
    showSpeakingStatus(true, text);

    playChime(() => {
      // Làm sạch chuỗi trước khi đọc
      const cleanText = text.replace(/[\\u{1F300}-\\u{1F9FF}]/gu, '').replace(/[^\p{L}\p{N}\s,.\?!]/gu, '').trim();

      // CÁCH 1: Thử Online Google TTS (Giọng Việt chuẩn tự nhiên, không cần cài đặt gì trên máy tính)
      const encoded = encodeURIComponent(cleanText.substring(0, 190));
      const onlineAudioUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=' + encoded;

      currentAudio = new Audio(onlineAudioUrl);
      currentAudio.playbackRate = 0.95;

      let fallbackTriggered = false;
      const doFallback = () => {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        speakWithBrowserSpeech(cleanText, onEnd);
      };

      currentAudio.onended = () => {
        isSpeaking = false;
        showSpeakingStatus(false);
        if (onEnd) onEnd();
      };

      currentAudio.onerror = () => {
        // Nếu mạng lỗi hoặc bị chặn, chuyển sang trình đọc của trình duyệt
        doFallback();
      };

      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Trình duyệt chặn autoplay hoặc lỗi audio -> Dùng SpeechSynthesis
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
    const finish = () => {
      if (ended) return;
      ended = true;
      isSpeaking = false;
      showSpeakingStatus(false);
      if (onEnd) onEnd();
    };

    u.onend = finish;
    u.onerror = finish;

    // Timeout phòng ngừa trình duyệt bị treo
    setTimeout(() => {
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
    clearHighlights();
    clearPointer();
  }

  function clearHighlights() {
    document.querySelectorAll('.step-speaking').forEach(el => el.classList.remove('step-speaking'));
  }

  function clearPointer() {
    const p = document.getElementById('voice-pointer');
    if (p) p.style.opacity = '0';
  }

  // Đọc danh sách các bước tuần tự (Nói tới đâu - Chỉ tới đó)
  function readSteps(stepsData, startIdx = 0) {
    stop();
    stepQueue = stepsData;
    currentStepIdx = startIdx;
    showSpeakingUI(true);
    nextStep();
  }

  function nextStep() {
    if (currentStepIdx >= stepQueue.length) {
      showSpeakingUI(false);
      speak('Đã hoàn thành hướng dẫn! Ông Bà có thể nhấn nghe lại bất cứ lúc nào.');
      return;
    }
    const step = stepQueue[currentStepIdx];
    const el = typeof step.el === 'string' ? document.querySelector(step.el) : step.el;

    clearHighlights();
    if (el) {
      el.classList.add('step-speaking');
      // Mở accordion nếu là step-block
      if (el.classList.contains('step-block')) el.classList.add('open');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showPointerAt(el);
    }

    updateStepIndicator(currentStepIdx, stepQueue.length);

    speak(step.text, () => {
      if (el) {
        el.classList.remove('step-speaking');
      }
      currentStepIdx++;
      setTimeout(nextStep, 700);
    });
  }

  function showPointerAt(target) {
    if (!target) return;
    let pointer = document.getElementById('voice-pointer');
    if (!pointer) {
      pointer = document.createElement('div');
      pointer.id = 'voice-pointer';
      pointer.innerHTML = '<div class="vp-ring"></div><div class="vp-dot">👆</div>';
      document.body.appendChild(pointer);
    }
    const rect = target.getBoundingClientRect();
    pointer.style.left = (rect.left + rect.width / 2 + window.scrollX) + 'px';
    pointer.style.top = (rect.top + window.scrollY - 15) + 'px';
    pointer.style.opacity = '1';
  }

  function updateStepIndicator(idx, total) {
    const bar = document.getElementById('voice-step-bar');
    if (bar) bar.style.width = (((idx + 1) / total) * 100) + '%';
    const label = document.getElementById('voice-step-label');
    if (label) label.textContent = 'Đang đọc bước ' + (idx + 1) + ' / ' + total;
  }

  function showSpeakingUI(show) {
    const ui = document.getElementById('voice-ui');
    if (!ui) return;
    if (show) ui.classList.add('active');
    else ui.classList.remove('active');
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
      if (txtEl && text) txtEl.textContent = text.length > 35 ? text.substring(0, 35) + '...' : text;
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

    const btns = document.querySelectorAll('#voice-search-btn, #voice-search-btn-tt, #voice-search-btn-yt');
    btns.forEach(b => b.classList.add('listening'));

    recognition.onstart = () => {
      speak('Ông Bà hãy nói to điều muốn tìm kiếm nhé!');
      if (inputEl) inputEl.placeholder = '🎙️ Đang nghe... Hãy nói to lên!';
    };
    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('');
      if (inputEl) inputEl.value = text;
      if (e.results[e.results.length - 1].isFinal) {
        if (onResult) onResult(text);
        btns.forEach(b => b.classList.remove('listening'));
      }
    };
    recognition.onerror = () => {
      if (inputEl) inputEl.placeholder = 'Nói hoặc gõ từ khoá...';
      btns.forEach(b => b.classList.remove('listening'));
      speak('Chưa nhận được giọng nói. Ông Bà vui lòng nhấn lại nút micro và nói to hơn nhé!');
    };
    recognition.onend = () => {
      if (inputEl) inputEl.placeholder = 'Nói hoặc gõ từ khoá...';
      btns.forEach(b => b.classList.remove('listening'));
    };
    recognition.start();
  }

  return { speak, stop, readSteps, startVoiceSearch, playChime, get isSpeaking() { return isSpeaking; } };
})();

// Giao diện điều khiển âm thanh
document.addEventListener('DOMContentLoaded', () => {
  // Thanh thông báo đang phát âm thanh
  const style = document.createElement('style');
  style.textContent = 
    #voice-speaking-indicator {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%) translateY(-100px);
      background: rgba(30, 41, 59, 0.95); color: white; padding: 10px 20px;
      border-radius: 50px; display: flex; align-items: center; gap: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3); z-index: 10000;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(8px); border: 2px solid #f59e0b;
      max-width: 90vw;
    }
    #voice-speaking-indicator.show { transform: translateX(-50%) translateY(0); }
    .vsi-wave { display: flex; align-items: center; gap: 3px; height: 16px; }
    .vsi-wave span { display: block; width: 3px; background: #f59e0b; border-radius: 3px; animation: vsi-wave 0.8s ease-in-out infinite alternate; }
    .vsi-wave span:nth-child(1) { height: 6px; animation-delay: 0.1s; }
    .vsi-wave span:nth-child(2) { height: 16px; animation-delay: 0.3s; }
    .vsi-wave span:nth-child(3) { height: 10px; animation-delay: 0.2s; }
    .vsi-wave span:nth-child(4) { height: 14px; animation-delay: 0.4s; }
    @keyframes vsi-wave { 0% { height: 4px; } 100% { height: 16px; } }
    #vsi-text { font-size: 0.95rem; font-weight: 700; color: #fef3c7; }

    #voice-pointer {
      position: absolute; z-index: 9998; transition: all 0.5s cubic-bezier(.4,0,.2,1);
      opacity: 0; pointer-events: none; transform: translate(-50%, -100%);
    }
    .vp-ring {
      width: 48px; height: 48px; border: 4px solid #f59e0b;
      border-radius: 50%; animation: vp-pulse 0.8s ease-in-out infinite;
      position: absolute; top: -4px; left: -4px;
    }
    .vp-dot { font-size: 2rem; text-align: center; animation: vp-tap 0.8s ease-in-out infinite; }
    @keyframes vp-pulse { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.3); opacity:0.5; } }
    @keyframes vp-tap { 0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); } }

    .step-speaking {
      outline: 4px solid #f59e0b !important;
      outline-offset: 4px !important;
      border-radius: 16px !important;
      background: #fffbeb !important;
      box-shadow: 0 0 0 8px rgba(245,158,11,0.2) !important;
      transition: all 0.3s ease !important;
    }

    #voice-ui {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: white; border-top: 3px solid #f59e0b;
      padding: 12px 20px; z-index: 500;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
      transform: translateY(100%); transition: transform 0.4s cubic-bezier(.4,0,.2,1);
    }
    #voice-ui.active { transform: translateY(0); }
    #voice-ui .vui-inner { display: flex; align-items: center; gap: 14px; max-width: 800px; margin: 0 auto; }
    .vui-btn {
      border: none; border-radius: 50px; padding: 10px 18px;
      font-size: 1rem; font-weight: 800; cursor: pointer; transition: all 0.2s;
      white-space: nowrap;
    }
    .vui-play { background: #f59e0b; color: white; }
    .vui-stop { background: #ef4444; color: white; min-width: 44px; }
    .vui-progress { flex: 1; }
    .vui-bar-bg { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 4px; }
    .vui-bar-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #ef4444); border-radius: 4px; width: 0%; transition: width 0.5s ease; }
    .vui-label { font-size: 0.85rem; font-weight: 700; color: #64748b; }

    .listening {
      background: #fee2e2 !important; border-color: #ef4444 !important;
      animation: mic-pulse 0.8s ease-in-out infinite !important;
    }
    @keyframes mic-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
  ;
  document.head.appendChild(style);

  // Thêm thanh điều khiển giọng nói ở đáy
  const ui = document.createElement('div');
  ui.id = 'voice-ui';
  ui.innerHTML = 
    <div class="vui-inner">
      <button class="vui-btn vui-play" id="vui-play-btn" title="Nghe lại">🔊 <span>Nghe lại</span></button>
      <div class="vui-progress">
        <div class="vui-bar-bg"><div class="vui-bar-fill" id="voice-step-bar"></div></div>
        <div class="vui-label" id="voice-step-label">Đang chuẩn bị giọng đọc...</div>
      </div>
      <button class="vui-btn vui-stop" id="vui-stop-btn" title="Dừng đọc">⏹ Dừng</button>
    </div>
  ;
  document.body.appendChild(ui);

  document.getElementById('vui-play-btn')?.addEventListener('click', () => {
    if (window.PAGE_STEPS) Voice.readSteps(window.PAGE_STEPS);
    else Voice.speak('Chào Ông Bà! Hãy nhấn vào biểu tượng ứng dụng muốn học.');
  });
  document.getElementById('vui-stop-btn')?.addEventListener('click', () => {
    Voice.stop();
    document.getElementById('voice-ui').classList.remove('active');
  });

  // Nút nổi "🔊 Nghe Hướng Dẫn" ở góc trái
  const floatBtn = document.createElement('button');
  floatBtn.id = 'float-voice-btn';
  floatBtn.innerHTML = '🔊 Nghe hướng dẫn';
  floatBtn.style.cssText = 'position:fixed;bottom:80px;left:16px;z-index:400;background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border:none;border-radius:50px;padding:12px 20px;font-size:1rem;font-weight:800;cursor:pointer;box-shadow:0 4px 20px rgba(245,158,11,0.4);transition:all 0.2s;display:flex;align-items:center;gap:6px;';
  floatBtn.addEventListener('click', () => {
    if (window.PAGE_STEPS) Voice.readSteps(window.PAGE_STEPS);
    else Voice.speak('Chào Ông Bà! Chào mừng Ông Bà đến với trang hướng dẫn Công Nghệ Vui.');
  });
  document.body.appendChild(floatBtn);
});