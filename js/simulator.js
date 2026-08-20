/* =========================================================
   SIMULATOR.JS - IMMERSIVE FULLSCREEN AUTO-SIMULATION ENGINE
   ========================================================= */
'use strict';

class AppSimulator {
  constructor(config) {
    this.screenId = config.screenId;
    this.steps = config.steps;
    this.stepTitleId = config.stepTitleId || 'sim-title';
    this.stepBadgeId = config.stepBadgeId || 'sim-badge';
    this.fingerId = config.fingerId || 'sim-finger';
    this.playBtnId = config.playBtnId || 'sim-btn-play';
    this.autoStart = config.autoStart !== false; // Default true
    this.current = 0;
    this.isPlaying = false;
    this.autoTimer = null;
    this.progressInterval = null;
    this.stepDuration = config.defaultDuration || 5500;
    this.progressElapsed = 0;

    this.init();
  }

  init() {
    this.screen = document.getElementById(this.screenId);
    this.finger = document.getElementById(this.fingerId);
    this.stepTitle = document.getElementById(this.stepTitleId);
    this.stepBadge = document.getElementById(this.stepBadgeId);
    this.playBtn = document.getElementById(this.playBtnId);

    // Click on screen advances step
    if (this.screen) {
      this.screen.onclick = () => {
        this.next();
      };
    }

    // Set globally on window.sim
    window.sim = this;

    // Show initial step
    this.showStep(0, false);

    // Auto-start immediately if enabled
    if (this.autoStart) {
      setTimeout(() => {
        this.play();
      }, 600);
    }
  }

  showStep(idx, speak = true) {
    if (idx < 0 || idx >= this.steps.length) return;
    this.current = idx;
    const step = this.steps[idx];

    // 1. Update Title & Badge in Top Bar
    if (this.stepTitle) this.stepTitle.textContent = step.title;
    if (this.stepBadge) this.stepBadge.textContent = 'Bước ' + (idx + 1) + ' / ' + this.steps.length;

    // 2. Render Screen Content
    if (this.screen && step.render) {
      this.screen.innerHTML = step.render();
    }

    // 3. Move Finger to Target Position
    if (this.finger) {
      if (step.finger) {
        this.finger.style.display = 'flex';
        this.finger.style.left = step.finger.x + '%';
        this.finger.style.top = step.finger.y + '%';
      } else {
        this.finger.style.display = 'none';
      }
    }

    // 4. Voice Speaking
    if (speak && window.Voice && step.voice) {
      window.Voice.speak(step.voice);
    }

    // 5. If Playing Auto-run, start countdown timer & top progress bar
    this.resetTimers();
    if (this.isPlaying) {
      this.startCountdown(step.duration || this.stepDuration);
    }
  }

  startCountdown(totalDuration) {
    this.resetTimers();
    this.progressElapsed = 0;
    const intervalMs = 40;
    const pFill = document.getElementById('sim-top-progress-fill');

    this.progressInterval = setInterval(() => {
      this.progressElapsed += intervalMs;
      const pct = Math.min(100, (this.progressElapsed / totalDuration) * 100);
      if (pFill) pFill.style.width = pct + '%';

      if (this.progressElapsed >= totalDuration) {
        this.resetTimers();
        this.next();
      }
    }, intervalMs);
  }

  resetTimers() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    if (this.autoTimer) {
      clearTimeout(this.autoTimer);
      this.autoTimer = null;
    }
    const pFill = document.getElementById('sim-top-progress-fill');
    if (pFill) pFill.style.width = '0%';
  }

  next() {
    let nextIdx = this.current + 1;
    if (nextIdx >= this.steps.length) {
      nextIdx = 0;
      if (this.isPlaying) {
        this.pause();
        if (window.Voice) window.Voice.speak('Đã hoàn thành các bước mô phỏng. Ông Bà có thể nhấn Tự Động Chạy để xem lại bất cứ lúc nào!');
        return;
      }
    }
    this.showStep(nextIdx, true);
  }

  prev() {
    let prevIdx = this.current - 1;
    if (prevIdx < 0) prevIdx = this.steps.length - 1;
    this.showStep(prevIdx, true);
  }

  play() {
    this.isPlaying = true;
    if (this.playBtn) {
      this.playBtn.innerHTML = '⏸ Tạm Dừng';
      this.playBtn.style.background = '#f59e0b';
    }
    this.showStep(this.current, true);
  }

  pause() {
    this.isPlaying = false;
    this.resetTimers();
    if (this.playBtn) {
      this.playBtn.innerHTML = '▶ Tiếp Tục';
      this.playBtn.style.background = '#10b981';
    }
    if (window.Voice) window.Voice.stop();
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  replayVoice() {
    const step = this.steps[this.current];
    if (step && window.Voice && step.voice) {
      window.Voice.speak(step.voice);
    }
  }

  exit() {
    if (window.Voice) window.Voice.stop();
    window.location.href = 'index.html';
  }
}