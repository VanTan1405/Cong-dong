/* =========================================================
   SIMULATOR.JS - ROCK SOLID AUTOMATIC INTERACTIVE APP SIMULATION
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
    this.current = 0;
    this.isPlaying = false;
    this.autoTimer = null;
    this.progressInterval = null;
    this.stepDuration = config.defaultDuration || 5000;
    this.progressElapsed = 0;

    this.init();
  }

  init() {
    this.screen = document.getElementById(this.screenId);
    this.finger = document.getElementById(this.fingerId);
    this.stepTitle = document.getElementById(this.stepTitleId);
    this.stepBadge = document.getElementById(this.stepBadgeId);
    this.playBtn = document.getElementById(this.playBtnId);

    // Inject visual progress bar if not present
    this.injectProgressBar();

    // Attach click events on phone screen for manual tap progression
    if (this.screen) {
      this.screen.onclick = (e) => {
        this.next();
      };
    }

    // Set globally on window.sim
    window.sim = this;

    // Show initial step
    this.showStep(0, false);
  }

  injectProgressBar() {
    const ctrl = document.querySelector('.sim-controller');
    if (ctrl && !document.getElementById('sim-auto-progress-bar')) {
      const pWrap = document.createElement('div');
      pWrap.style.cssText = 'height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; margin: 12px 0 16px; position: relative;';
      pWrap.innerHTML = '<div id="sim-auto-progress-fill" style="height:100%; width:0%; background: linear-gradient(90deg, #10b981, #3b82f6); border-radius:10px; transition: width 0.1s linear;"></div>';
      
      const titleEl = document.getElementById(this.stepTitleId);
      if (titleEl && titleEl.parentNode) {
        titleEl.parentNode.insertBefore(pWrap, titleEl.nextSibling);
      }
    }
  }

  showStep(idx, speak = true) {
    if (idx < 0 || idx >= this.steps.length) return;
    this.current = idx;
    const step = this.steps[idx];

    // 1. Update Title & Badge
    if (this.stepTitle) this.stepTitle.textContent = step.title;
    if (this.stepBadge) this.stepBadge.textContent = 'Bước ' + (idx + 1) + ' / ' + this.steps.length;

    // 2. Render Screen Content
    if (this.screen && step.render) {
      this.screen.innerHTML = step.render();
    }

    // 3. Move Finger to Target Position with spring animation
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

    // 5. If Playing Auto-run, start countdown timer & progress bar
    this.resetTimers();
    if (this.isPlaying) {
      this.startCountdown(step.duration || this.stepDuration);
    }
  }

  startCountdown(totalDuration) {
    this.resetTimers();
    this.progressElapsed = 0;
    const intervalMs = 50;
    const pFill = document.getElementById('sim-auto-progress-fill');

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
    const pFill = document.getElementById('sim-auto-progress-fill');
    if (pFill) pFill.style.width = '0%';
  }

  next() {
    let nextIdx = this.current + 1;
    if (nextIdx >= this.steps.length) {
      nextIdx = 0;
      if (this.isPlaying) {
        this.pause();
        if (window.Voice) window.Voice.speak('Đã hoàn thành các bước mô phỏng. Ông Bà có thể xem lại bất cứ lúc nào!');
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
      this.playBtn.innerHTML = '▶ Tự Động Chạy';
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
}