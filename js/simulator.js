/* =========================================================
   SIMULATOR.JS - AUTOMATIC INTERACTIVE APP SIMULATION ENGINE
   Handles Finger Animations, Screen States, and Audio Sync
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
    this.timer = null;
    this.duration = config.defaultDuration || 4500;

    this.init();
  }

  init() {
    this.screen = document.getElementById(this.screenId);
    this.finger = document.getElementById(this.fingerId);
    this.stepTitle = document.getElementById(this.stepTitleId);
    this.stepBadge = document.getElementById(this.stepBadgeId);
    this.playBtn = document.getElementById(this.playBtnId);

    if (!this.screen) return;

    this.showStep(0);
  }

  showStep(idx, speak = true) {
    if (idx < 0 || idx >= this.steps.length) return;
    this.current = idx;
    const step = this.steps[idx];

    // 1. Update Title & Badge
    if (this.stepTitle) this.stepTitle.textContent = step.title;
    if (this.stepBadge) this.stepBadge.textContent = 'Bước ' + (idx + 1) + ' / ' + this.steps.length;

    // 2. Render Screen HTML
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

    // 4. Run step specific interactive triggers
    if (step.onEnter) {
      step.onEnter(this.screen);
    }

    // 5. Voice Speaking
    if (speak && window.Voice && step.voice) {
      window.Voice.speak(step.voice);
    }

    // 6. If Auto-playing, schedule next step
    clearTimeout(this.timer);
    if (this.isPlaying) {
      const time = step.duration || this.duration;
      this.timer = setTimeout(() => {
        this.next();
      }, time);
    }
  }

  next() {
    let nextIdx = this.current + 1;
    if (nextIdx >= this.steps.length) {
      nextIdx = 0; // Loop back
      if (this.isPlaying) {
        this.pause();
        if (window.Voice) window.Voice.speak('Đã hoàn thành các bước hướng dẫn. Ông Bà có thể xem lại bất cứ lúc nào!');
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
    clearTimeout(this.timer);
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