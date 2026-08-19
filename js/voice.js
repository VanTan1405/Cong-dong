/* ================================================
   VOICE.JS - Text-to-Speech + Voice Search
   Tiếng Việt, highlight từng bước khi đọc
   ================================================ */
'use strict';

const Voice = (() => {
  let synth = window.speechSynthesis;
  let recognition = null;
  let viVoice = null;
  let isSpeaking = false;
  let stepQueue = [];
  let currentStepIdx = 0;

  // Lấy giọng tiếng Việt
  function loadVoices() {
    const voices = synth.getVoices();
    viVoice = voices.find(v => v.lang.startsWith('vi'))
           || voices.find(v => v.lang.startsWith('zh'))
           || voices[0];
  }
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
  loadVoices();

  function speak(text, onEnd) {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    u.rate = 0.82;
    u.pitch = 1.05;
    u.volume = 1;
    if (viVoice) u.voice = viVoice;
    if (onEnd) u.onend = onEnd;
    synth.speak(u);
    isSpeaking = true;
  }

  function stop() {
    synth.cancel();
    isSpeaking = false;
    clearHighlights();
    clearPointer();
  }

  function clearHighlights() {
    document.querySelectorAll('.step-speaking').forEach(el => el.classList.remove('step-speaking'));
    document.querySelectorAll('.step-done').forEach(el => {});
  }

  function clearPointer() {
    const p = document.getElementById('voice-pointer');
    if (p) p.style.opacity = '0';
  }

  // Đọc tất cả các bước - nói tới đâu highlight tới đó
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
      speak('Hướng dẫn đã hoàn thành! Ông Bà có thể xem lại bất cứ lúc nào.');
      return;
    }
    const step = stepQueue[currentStepIdx];
    const el = typeof step.el === 'string' ? document.querySelector(step.el) : step.el;

    clearHighlights();
    if (el) {
      el.classList.add('step-speaking');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Hiện pointer
      if (step.pointTo) showPointerAt(step.pointTo);
    }

    // Update bước hiện tại trên UI
    updateStepIndicator(currentStepIdx, stepQueue.length);

    speak(step.text, () => {
      if (el) {
        el.classList.remove('step-speaking');
        el.classList.add('step-done');
      }
      currentStepIdx++;
      setTimeout(nextStep, 600);
    });
  }

  function showPointerAt(selector) {
    const target = typeof selector === 'string' ? document.querySelector(selector) : selector;
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
    pointer.style.top = (rect.top + window.scrollY - 20) + 'px';
    pointer.style.opacity = '1';
  }

  function updateStepIndicator(idx, total) {
    const bar = document.getElementById('voice-step-bar');
    if (bar) bar.style.width = ((idx / total) * 100) + '%';
    const label = document.getElementById('voice-step-label');
    if (label) label.textContent = Bước  / ;
  }

  function showSpeakingUI(show) {
    let ui = document.getElementById('voice-ui');
    if (!ui) return;
    if (show) {
      ui.classList.add('active');
    } else {
      ui.classList.remove('active');
    }
  }

  // Tìm kiếm bằng giọng nói
  function startVoiceSearch(inputEl, onResult) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      speak('Trình duyệt chưa hỗ trợ tìm kiếm bằng giọng nói. Ông Bà hãy thử Chrome nhé.');
      return;
    }
    if (recognition) recognition.abort();
    recognition = new SR();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = true;

    const btn = document.getElementById('voice-search-btn');
    if (btn) btn.classList.add('listening');

    recognition.onstart = () => {
      if (inputEl) inputEl.placeholder = '🎙️ Đang nghe... Hãy nói to lên!';
    };
    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('');
      if (inputEl) inputEl.value = text;
      if (e.results[e.results.length - 1].isFinal) {
        if (onResult) onResult(text);
        if (btn) btn.classList.remove('listening');
      }
    };
    recognition.onerror = () => {
      if (inputEl) inputEl.placeholder = 'Gõ từ khoá...';
      if (btn) btn.classList.remove('listening');
      speak('Không nhận được giọng nói. Ông Bà hãy thử lại nhé!');
    };
    recognition.onend = () => {
      if (inputEl) inputEl.placeholder = 'Gõ từ khoá...';
      if (btn) btn.classList.remove('listening');
    };
    recognition.start();
  }

  function stopVoiceSearch() {
    if (recognition) { recognition.abort(); recognition = null; }
  }

  return { speak, stop, readSteps, startVoiceSearch, stopVoiceSearch, get isSpeaking() { return isSpeaking; } };
})();

// Inject voice UI và pointer styles
document.addEventListener('DOMContentLoaded', () => {
  // Floating voice control bar
  const ui = document.createElement('div');
  ui.id = 'voice-ui';
  ui.innerHTML = 
    <div class="vui-inner">
      <button class="vui-btn vui-play" id="vui-play-btn" title="Nghe hướng dẫn">
        🔊 <span>Nghe</span>
      </button>
      <div class="vui-progress">
        <div class="vui-bar-bg"><div class="vui-bar-fill" id="voice-step-bar"></div></div>
        <div class="vui-label" id="voice-step-label">Nhấn để nghe</div>
      </div>
      <button class="vui-btn vui-stop" id="vui-stop-btn" title="Dừng">⏹</button>
    </div>
  ;
  document.body.appendChild(ui);

  // Pointer styles
  const style = document.createElement('style');
  style.textContent = 
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
    @keyframes vp-tap { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

    /* Step highlight khi đọc tới */
    .step-speaking {
      outline: 4px solid #f59e0b !important;
      outline-offset: 4px !important;
      border-radius: 16px !important;
      background: #fffbeb !important;
      box-shadow: 0 0 0 8px rgba(245,158,11,0.15) !important;
      transition: all 0.3s ease !important;
      position: relative;
    }
    .step-speaking::before {
      content: '🔊 Đang đọc...';
      position: absolute; top: -32px; left: 0;
      background: #f59e0b; color: white; padding: 4px 12px;
      border-radius: 20px; font-size: 0.8rem; font-weight: 800;
      white-space: nowrap; z-index: 10;
    }
    .step-done { opacity: 0.7; }

    /* Voice UI bar */
    #voice-ui {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: white; border-top: 3px solid #f59e0b;
      padding: 12px 20px; z-index: 500;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
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

    /* Voice search button */
    #voice-search-btn {
      background: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 50%;
      width: 44px; height: 44px; font-size: 1.2rem; cursor: pointer;
      transition: all 0.2s; flex-shrink: 0;
    }
    #voice-search-btn.listening {
      background: #fee2e2; border-color: #ef4444;
      animation: mic-pulse 0.8s ease-in-out infinite;
    }
    @keyframes mic-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
  ;
  document.head.appendChild(style);

  // Wire up buttons
  const playBtn = document.getElementById('vui-play-btn');
  const stopBtn = document.getElementById('vui-stop-btn');
  if (playBtn) playBtn.addEventListener('click', () => {
    if (window.PAGE_STEPS) Voice.readSteps(window.PAGE_STEPS);
    else Voice.speak('Trang này chưa có hướng dẫn bằng giọng nói.');
  });
  if (stopBtn) stopBtn.addEventListener('click', () => {
    Voice.stop();
    document.getElementById('voice-ui').classList.remove('active');
  });

  // Floating "Nghe hướng dẫn" button (visible always)
  const floatBtn = document.createElement('button');
  floatBtn.id = 'float-voice-btn';
  floatBtn.innerHTML = '🔊 Nghe hướng dẫn';
  floatBtn.style.cssText = 'position:fixed;bottom:80px;left:16px;z-index:400;background:#f59e0b;color:white;border:none;border-radius:50px;padding:12px 20px;font-size:1rem;font-weight:800;cursor:pointer;box-shadow:0 4px 20px rgba(245,158,11,0.4);transition:all 0.2s;';
  floatBtn.addEventListener('click', () => {
    const ui = document.getElementById('voice-ui');
    ui.classList.add('active');
    if (window.PAGE_STEPS) Voice.readSteps(window.PAGE_STEPS);
    else Voice.speak('Chào Ông Bà! Nhấn vào ứng dụng muốn học để bắt đầu.');
  });
  document.body.appendChild(floatBtn);
});