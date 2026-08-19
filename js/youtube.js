/* YouTube page interactions */

let ytPlaying = false;
let ytProgress = 0;
let ytTimer = null;
let ytDemoPlaying = false;
let ytDemoTimer = null;
let ytCtrlPlaying = false;
let ctrlTimer = null;

function playYTDemo() {
    const overlay = document.getElementById('yt-play-overlay');
    const playing = document.getElementById('yt-playing');
    const bar = document.getElementById('yt-progress-bar');
    const timeEl = document.getElementById('yt-time');
    if (overlay) overlay.style.display = 'none';
    if (playing) playing.style.display = 'flex';
    if (bar) {
        bar.style.width = '0%';
        let p = 0;
        const iv = setInterval(() => {
            p += 0.5;
            bar.style.width = Math.min(p, 100) + '%';
            const cur = Math.floor(p * 7.54);
            const m = Math.floor(cur / 60);
            const s = cur % 60;
            if (timeEl) timeEl.textContent = `${m}:${s.toString().padStart(2,'0')} / 12:34`;
            if (p >= 100) clearInterval(iv);
        }, 300);
    }
    const playBtn = document.getElementById('yt-play-pause');
    if (playBtn) playBtn.textContent = '&#9646;&#9646;';
}

function togglePlay() {
    ytPlaying = !ytPlaying;
    const btn = document.getElementById('yt-play-pause');
    if (btn) btn.innerHTML = ytPlaying ? '&#9646;&#9646;' : '&#9654;';
}

function toggleMute() { /* demo only */ }
function changeVol(v) { /* demo */ }
function toggleFullscreen() {
    const feedback = document.getElementById('yt-demo-feedback');
    if (feedback) feedback.textContent = 'Xoay dien thoai ngang de xem toan man hinh! &#8635;';
}

function openYTDemo() {
    const res = document.getElementById('yt-open-result');
    if (res) {
        res.innerHTML = 'Dang mo YouTube...';
        setTimeout(() => { res.innerHTML = '&#9989; YouTube da mo! Rat nhieu video dang cho Ong Ba!'; }, 1500);
    }
}

function openYTSearch() {
    const box = document.getElementById('yt-search-box');
    if (box) {
        box.style.display = box.style.display === 'none' ? 'flex' : 'none';
        if (box.style.display === 'flex') {
            const inp = document.getElementById('yt-search-inp');
            if (inp) inp.focus();
        }
    }
}

function ytSearch(val) {
    const res = document.getElementById('yt-search-results');
    if (!res || !val || val.length < 2) { if (res) res.innerHTML = ''; return; }
    res.innerHTML = '&#128269; Dang tim kiem...';
    setTimeout(() => {
        res.innerHTML = `&#9989; Tim thay ${Math.floor(Math.random()*900)+100} ket qua cho "<strong>${val}</strong>"!`;
    }, 1000);
}

function ytQuickSearch(term) {
    const box = document.getElementById('yt-search-box');
    const inp = document.getElementById('yt-search-inp');
    if (box) box.style.display = 'flex';
    if (inp) { inp.value = term; ytSearch(term); }
}

function toggleYTDemo() {
    ytDemoPlaying = !ytDemoPlaying;
    const overlay = document.getElementById('yt-demo-overlay');
    const btn = document.getElementById('yt-big-play');
    const feedback = document.getElementById('yt-demo-feedback');
    if (overlay) overlay.innerHTML = ytDemoPlaying ? '&#9646;&#9646;' : '&#9654;';
    if (btn) btn.innerHTML = ytDemoPlaying ? '&#9646;&#9646; Tam dung' : '&#9654; Phat';
    if (feedback) feedback.textContent = ytDemoPlaying ? '&#127897; Video dang phat!' : '&#9646;&#9646; Video tam dung.';
}

function ytGoBack() {
    const feedback = document.getElementById('yt-demo-feedback');
    if (feedback) feedback.textContent = '&#9194; Tua lui 10 giay!';
}

function ytGoForward() {
    const feedback = document.getElementById('yt-demo-feedback');
    if (feedback) feedback.textContent = '&#9193; Tua len 10 giay!';
}

function ytVolChange(val) {
    const num = document.getElementById('yt-vol-num');
    if (num) num.textContent = val + '%';
}

function setSpeed(s) {
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    const active = document.getElementById('sp-' + String(s).replace('.', ''));
    if (active) active.classList.add('active');
    const feedback = document.getElementById('yt-demo-feedback');
    const labels = { 0.75: 'Cham (de nghe ro hon)', 1: 'Binh thuong', 1.25: 'Nhanh hon' };
    if (feedback) feedback.textContent = `Toc do: ${s}x - ${labels[s] || ''}`;
}

function ytLike(btn) {
    btn.classList.toggle('liked');
    btn.innerHTML = btn.classList.contains('liked') ? '&#128077; Da Thich (45K+)' : '&#128077; Thich (45K)';
}

function ytSave() {
    const feedback = document.getElementById('yt-demo-feedback');
    if (!feedback) return;
    feedback.textContent = '&#128190; Da luu vao "Xem ve sau"!';
}

function ytShare() {
    const feedback = document.getElementById('yt-demo-feedback');
    if (!feedback) return;
    feedback.textContent = '&#8635; Link video da duoc sao chep! Dan vao Zalo/Facebook de chia se!';
}

function ytSubscribe() {
    const btn = document.getElementById('yt-sub-btn');
    const res = document.getElementById('yt-sub-result');
    if (!btn) return;
    const subbed = btn.classList.contains('subscribed');
    if (subbed) {
        btn.classList.remove('subscribed');
        btn.innerHTML = '&#128276; Dang ky';
        btn.style.background = 'var(--yt)';
        if (res) res.innerHTML = '';
    } else {
        btn.classList.add('subscribed');
        btn.innerHTML = '&#10003; Da dang ky';
        btn.style.background = 'var(--gray)';
        btn.style.color = 'var(--text2)';
        if (res) res.innerHTML = '<div style="padding:10px 16px;">&#127881; Da dang ky! Ong Ba se nhan thong bao khi co video moi!</div>';
    }
}

const newVideos = [
    { icon: '&#127868;', name: 'Cach Nau Banh Canh Cha Ca' },
    { icon: '&#127926;', name: 'Top 10 Bai Hat Que Huong Hay Nhat' },
    { icon: '&#127884;', name: 'Bai Tap Tay Cho Nguoi Cao Tuoi' },
    { icon: '&#127792;', name: 'Cach Trong Rau Muong Sach' },
];
let plCount = 2;

function addToPlaylist() {
    const list = document.getElementById('yt-pl-list');
    const res = document.getElementById('yt-pl-result');
    if (!list) return;
    if (plCount >= newVideos.length + 2) {
        res.innerHTML = 'Danh sach phat da day! &#128078;';
        return;
    }
    const v = newVideos[plCount - 2];
    const item = document.createElement('div');
    item.className = 'yt-pl-item';
    item.innerHTML = `<div class="yt-pl-thumb">${v.icon}</div><span>${v.name}</span><button class="yt-pl-remove" onclick="removeFromPlaylist(this)">&#10005;</button>`;
    list.appendChild(item);
    if (res) res.innerHTML = `&#9989; Da them "${v.name}"!`;
    plCount++;
    setTimeout(() => { if (res) res.innerHTML = ''; }, 2000);
}

function removeFromPlaylist(btn) {
    const item = btn.closest('.yt-pl-item');
    if (item) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'all 0.3s ease';
        setTimeout(() => { item.remove(); }, 300);
    }
}