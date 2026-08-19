/* ================================================
   DEMO.JS - Auto-playing phone animation system
   Tự động chạy animation qua từng bước
   ================================================ */
'use strict';

class PhoneDemo {
  constructor(containerId, steps) {
    this.container = document.getElementById(containerId);
    this.steps = steps;
    this.current = 0;
    this.timer = null;
    this.paused = false;
    if (this.container) this.init();
  }

  init() {
    this.render();
    this.showStep(0);
    this.container.addEventListener('click', () => {
      if (this.paused) { this.paused = false; this.autoNext(); }
      else { this.paused = true; clearTimeout(this.timer); }
    });
  }

  render() {
    this.container.innerHTML = 
      <div class="pd-wrapper">
        <div class="pd-phone">
          <div class="pd-notch"></div>
          <div class="pd-screen" id="-screen"></div>
          <div class="pd-tap" id="-tap">
            <div class="pd-tap-ring"></div>
            <div class="pd-tap-finger">👆</div>
          </div>
        </div>
        <div class="pd-info">
          <div class="pd-step-num" id="-num">Bước 1</div>
          <div class="pd-caption" id="-caption"></div>
          <div class="pd-dots" id="-dots"></div>
          <div class="pd-controls">
            <button class="pd-btn pd-prev" onclick="__demos[''].prev()">◀ Trước</button>
            <button class="pd-btn pd-next" onclick="__demos[''].next()">Tiếp ▶</button>
          </div>
        </div>
      </div>
    ;

    // dots
    const dotsEl = document.getElementById(this.container.id + '-dots');
    if (dotsEl) {
      dotsEl.innerHTML = this.steps.map((_, i) =>
        <span class="pd-dot" id="-dot-" onclick="__demos[''].goTo()"></span>
      ).join('');
    }

    if (!window.__demos) window.__demos = {};
    window.__demos[this.container.id] = this;
  }

  showStep(idx) {
    if (idx < 0 || idx >= this.steps.length) return;
    this.current = idx;
    const s = this.steps[idx];
    const screen = document.getElementById(this.container.id + '-screen');
    const tap = document.getElementById(this.container.id + '-tap');
    const caption = document.getElementById(this.container.id + '-caption');
    const num = document.getElementById(this.container.id + '-num');

    if (!screen) return;

    // Animate screen change
    screen.style.opacity = '0';
    screen.style.transform = 'scale(0.95)';
    setTimeout(() => {
      screen.innerHTML = s.screen;
      screen.style.opacity = '1';
      screen.style.transform = 'scale(1)';
    }, 200);

    // Caption
    if (caption) caption.textContent = s.caption;
    if (num) num.textContent = Bước  / ;

    // Tap indicator
    if (tap && s.tap) {
      tap.style.left = s.tap.x + '%';
      tap.style.top = s.tap.y + '%';
      tap.style.display = 'flex';
      tap.style.animation = 'none';
      setTimeout(() => {
        tap.style.animation = 'pd-tap-anim 0.6s ease forwards';
      }, 300);
    } else if (tap) {
      tap.style.display = 'none';
    }

    // Update dots
    document.querySelectorAll(#-dots .pd-dot).forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    // Speak if Voice is available
    if (window.Voice && s.audio) {
      Voice.speak(s.audio);
    }

    // Auto advance
    clearTimeout(this.timer);
    if (!this.paused) {
      this.timer = setTimeout(() => this.next(), s.duration || 4000);
    }
  }

  next() { this.goTo((this.current + 1) % this.steps.length); }
  prev() { this.goTo((this.current - 1 + this.steps.length) % this.steps.length); }
  goTo(idx) { clearTimeout(this.timer); this.showStep(idx); }
  pause() { clearTimeout(this.timer); this.paused = true; }
  resume() { this.paused = false; this.autoNext(); }
  autoNext() { this.timer = setTimeout(() => this.next(), this.steps[this.current].duration || 4000); }
}

// CSS cho phone demo
const demoStyle = document.createElement('style');
demoStyle.textContent = 
  .pd-wrapper {
    display: flex; gap: 32px; align-items: center;
    justify-content: center; padding: 24px; flex-wrap: wrap;
  }
  .pd-phone {
    width: 220px; height: 440px; background: #1e293b;
    border-radius: 40px; padding: 14px 10px; position: relative;
    box-shadow: 0 24px 60px rgba(0,0,0,0.35);
    flex-shrink: 0;
  }
  .pd-notch {
    width: 70px; height: 18px; background: #1e293b;
    border-radius: 0 0 14px 14px; margin: 0 auto 6px;
  }
  .pd-screen {
    background: #fff; border-radius: 28px;
    height: calc(100% - 32px); overflow: hidden;
    transition: opacity 0.2s ease, transform 0.2s ease;
    position: relative;
  }
  .pd-tap {
    position: absolute; display: flex; flex-direction: column;
    align-items: center; pointer-events: none;
    transform: translate(-50%, -50%);
  }
  .pd-tap-ring {
    width: 44px; height: 44px; border: 4px solid #f59e0b;
    border-radius: 50%; position: absolute;
    animation: pd-ring 1s ease-in-out infinite;
  }
  .pd-tap-finger { font-size: 1.8rem; position: relative; animation: pd-tap-anim 1s ease-in-out infinite; }
  @keyframes pd-ring { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.4); opacity:0.3; } }
  @keyframes pd-tap-anim { 0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); } }

  .pd-info { flex: 1; min-width: 200px; max-width: 320px; }
  .pd-step-num {
    font-size: 0.85rem; font-weight: 800; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
  }
  .pd-caption {
    font-size: 1.3rem; font-weight: 800; color: #1e293b;
    line-height: 1.5; margin-bottom: 20px; min-height: 60px;
  }
  .pd-dots { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .pd-dot {
    width: 12px; height: 12px; border-radius: 50%;
    background: #e2e8f0; cursor: pointer; transition: all 0.3s;
  }
  .pd-dot.active { background: #1877f2; transform: scale(1.3); }
  .pd-controls { display: flex; gap: 12px; }
  .pd-btn {
    padding: 12px 24px; border: 3px solid #e2e8f0; background: white;
    border-radius: 50px; font-size: 1rem; font-weight: 800;
    cursor: pointer; transition: all 0.2s; color: #1e293b;
  }
  .pd-btn:hover, .pd-btn:active { background: #1877f2; color: white; border-color: #1877f2; }

  /* Screen content styles */
  .sc { width: 100%; height: 100%; display: flex; flex-direction: column; }
  .sc-topbar { padding: 10px 12px; font-weight: 900; font-size: 0.95rem; display: flex; align-items: center; justify-content: space-between; }
  .sc-fb-top { background: #1877f2; color: white; }
  .sc-tt-top { background: #010101; color: white; }
  .sc-yt-top { background: #ff0000; color: white; }
  .sc-body { flex: 1; padding: 12px; overflow: hidden; }
  .sc-home { background: linear-gradient(135deg, #e0f2fe, #f0fdf4); display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 12px; }
  .sc-app-icon { width: 72px; height: 72px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: 0 4px 16px rgba(0,0,0,0.15); animation: sc-bounce 2s ease-in-out infinite; }
  @keyframes sc-bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
  .sc-app-label { font-weight: 800; font-size: 1rem; color: #1e293b; }
  .sc-hint { font-size: 0.75rem; color: #64748b; animation: sc-blink 1.2s ease-in-out infinite; }
  @keyframes sc-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  .sc-form { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .sc-form-field { border: 2px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 0.85rem; color: #64748b; }
  .sc-form-field.active { border-color: #1877f2; background: #eff6ff; color: #1e293b; animation: sc-type 0.5s ease; }
  @keyframes sc-type { from { opacity: 0.5; } to { opacity: 1; } }
  .sc-form-btn { background: #1877f2; color: white; border: none; border-radius: 10px; padding: 12px; font-size: 0.9rem; font-weight: 800; text-align: center; animation: sc-glow 1.5s ease-in-out infinite; }
  @keyframes sc-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(24,119,242,0.4); } 50% { box-shadow: 0 0 0 8px rgba(24,119,242,0); } }

  .sc-post { padding: 10px; }
  .sc-post-hd { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
  .sc-avatar { font-size: 1.5rem; }
  .sc-post-name { font-weight: 800; font-size: 0.85rem; }
  .sc-post-time { font-size: 0.7rem; color: #94a3b8; }
  .sc-post-text { font-size: 0.85rem; margin-bottom: 8px; line-height: 1.5; }
  .sc-post-img { background: linear-gradient(135deg, #a8edea, #fed6e3); border-radius: 10px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 8px; }
  .sc-post-actions { display: flex; gap: 4px; border-top: 1px solid #f1f5f9; padding-top: 8px; }
  .sc-action { flex: 1; text-align: center; font-size: 0.75rem; font-weight: 700; padding: 6px; border-radius: 8px; cursor: pointer; transition: background 0.2s; color: #64748b; }
  .sc-action:hover { background: #f1f5f9; }
  .sc-like-active { color: #1877f2; font-weight: 900; }

  .sc-msg { height: 100%; display: flex; flex-direction: column; }
  .sc-msg-list { flex: 1; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
  .sc-bubble { padding: 8px 12px; border-radius: 16px; font-size: 0.8rem; max-width: 80%; }
  .sc-bubble.in { background: #f1f5f9; align-self: flex-start; }
  .sc-bubble.out { background: #1877f2; color: white; align-self: flex-end; }
  .sc-msg-input { display: flex; gap: 6px; padding: 8px; border-top: 1px solid #f1f5f9; }
  .sc-msg-input input { flex: 1; border: 1px solid #e2e8f0; border-radius: 20px; padding: 6px 10px; font-size: 0.8rem; }
  .sc-send { background: #1877f2; color: white; border: none; border-radius: 50%; width: 28px; height: 28px; font-size: 0.8rem; cursor: pointer; }

  .sc-search { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
  .sc-search-bar { display: flex; gap: 6px; align-items: center; background: #f1f5f9; border-radius: 20px; padding: 8px 12px; font-size: 0.8rem; color: #64748b; }
  .sc-vid-item { display: flex; gap: 8px; align-items: center; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
  .sc-vid-thumb { width: 50px; height: 35px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
  .sc-vid-info { flex: 1; }
  .sc-vid-title { font-size: 0.75rem; font-weight: 700; }
  .sc-vid-sub { font-size: 0.65rem; color: #94a3b8; }

  .sc-swipe { height: 100%; position: relative; overflow: hidden; }
  .sc-swipe-vid { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-size: 0.85rem; text-align: center; padding: 12px; }
  .sc-swipe-arrow { position: absolute; bottom: 12px; right: 8px; font-size: 1.5rem; animation: sc-arrow 1s ease-in-out infinite; }
  @keyframes sc-arrow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

  @media (max-width: 600px) {
    .pd-wrapper { gap: 16px; padding: 16px 12px; }
    .pd-phone { width: 180px; height: 360px; }
    .pd-info { max-width: 100%; width: 100%; }
    .pd-caption { font-size: 1.1rem; min-height: 48px; }
  }
;
document.head.appendChild(demoStyle);