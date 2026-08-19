/* TikTok page interactions */

const ttVideos = [
    { emoji: '&#127859;', text: 'Cach lam Canh Chua Ca<br><small>@amthuc_viet</small>', bg: ['#1a1a2e','#16213e'] },
    { emoji: '&#127926;', text: 'Dan Ca Quan Ho Bac Ninh<br><small>@dancaviet</small>', bg: ['#0f3460','#533483'] },
    { emoji: '&#127884;', text: 'Bai Tap The Duc Sang Som<br><small>@suckhoeviet</small>', bg: ['#004d00','#006400'] },
    { emoji: '&#127810;', text: 'Trong Rau Muong Tai Nha<br><small>@vuonrau</small>', bg: ['#1b4332','#2d6a4f'] },
    { emoji: '&#128516;', text: 'Video Hai Huoc - Khi Con<br><small>@funviet</small>', bg: ['#3d0066','#6600cc'] },
];
let currentVidIdx = 0;

function nextTTVideo() {
    currentVidIdx = (currentVidIdx + 1) % ttVideos.length;
    const v = ttVideos[currentVidIdx];
    const content = document.querySelector('.tt-video-content');
    if (content) {
        content.style.opacity = '0';
        content.style.transform = 'translateY(30px)';
        setTimeout(() => {
            content.querySelector('.tt-video-emoji').innerHTML = v.emoji;
            content.querySelector('.tt-video-text').innerHTML = v.text;
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        }, 200);
        const bg = document.querySelector('.tt-video-bg');
        if (bg) bg.style.background = `linear-gradient(180deg, ${v.bg[0]}, ${v.bg[1]})`;
    }
}

const swipeVideos = [
    { emoji: '&#127859;', text: 'Cach lam Pho Bo<br><small>@amthuc_viet</small>' },
    { emoji: '&#127926;', text: 'Hat Bolero Buoi Toi<br><small>@nhacviet</small>' },
    { emoji: '&#127884;', text: 'Yoga Cho Nguoi Cao Tuoi<br><small>@suckhoeviet</small>' },
    { emoji: '&#127810;', text: 'Trong Cay Kieu Viet Nam<br><small>@vuonviet</small>' },
    { emoji: '&#128516;', text: 'Vui Cuoi Moi Ngay<br><small>@haihuoc</small>' },
];
let swipeIdx = 0;

function swipeUp() {
    swipeIdx = (swipeIdx + 1) % swipeVideos.length;
    const video = document.querySelector('.swipe-video');
    if (!video) return;
    video.style.transform = 'translateY(-100%)';
    video.style.opacity = '0';
    setTimeout(() => {
        const v = swipeVideos[swipeIdx];
        video.querySelector('.vid-content').innerHTML = `<div style="font-size:2.5rem">${v.emoji}</div><p>${v.text}</p>`;
        video.style.transition = 'none';
        video.style.transform = 'translateY(100%)';
        video.style.opacity = '0';
        setTimeout(() => {
            video.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            video.style.transform = 'translateY(0)';
            video.style.opacity = '1';
        }, 50);
    }, 300);
}

// Style for swipe video
document.addEventListener('DOMContentLoaded', () => {
    const sv = document.querySelector('.swipe-video');
    if (sv) sv.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    const ttContent = document.querySelector('.tt-video-content');
    if (ttContent) ttContent.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
});

function ttSearch(val) {
    const res = document.getElementById('tt-search-result');
    if (!res) return;
    if (val.length > 2) {
        res.innerHTML = `&#128269; Tim kiem: "${val}" - Dang tai ket qua...`;
        setTimeout(() => {
            res.innerHTML = `&#9989; Tim thay 128 video cho "${val}"`;
        }, 800);
    } else {
        res.innerHTML = '';
    }
}

function fillSearch(text) {
    const inp = document.getElementById('tt-search-input');
    if (inp) { inp.value = text; ttSearch(text); }
}

let ttLiked = false;
let ttLikeNum = 12500;

function ttLikeToggle() {
    ttLiked = !ttLiked;
    const btn = document.getElementById('tt-like-btn');
    const count = document.getElementById('tt-like-count');
    const feedback = document.getElementById('tt-feedback');
    if (!btn || !count) return;
    if (ttLiked) {
        btn.classList.add('liked');
        btn.querySelector('span').style.color = '#fe2c55';
        ttLikeNum++;
        feedback.textContent = '&#10084; Da thich video nay!';
    } else {
        btn.classList.remove('liked');
        btn.querySelector('span').style.color = 'white';
        ttLikeNum--;
        feedback.textContent = 'Da bo thich.';
    }
    count.textContent = (ttLikeNum / 1000).toFixed(1) + 'K';
}

function ttComment() {
    const feedback = document.getElementById('tt-feedback');
    if (feedback) feedback.textContent = '&#128172; Binh luan: "Hay qua! Cam on ban!" - Da gui!';
}

function ttShare() {
    const feedback = document.getElementById('tt-feedback');
    if (feedback) feedback.textContent = '&#8635; Da copy link video! Dan vao Zalo/Facebook de chia se!';
}

function ttSave() {
    const feedback = document.getElementById('tt-feedback');
    if (feedback) feedback.textContent = '&#128190; Da luu vao Yeu thich! Xem lai bat cu luc nao!';
}

function followChannel(btn, id) {
    if (btn.classList.contains('following')) {
        btn.classList.remove('following');
        btn.textContent = '+ Theo doi';
    } else {
        btn.classList.add('following');
        btn.textContent = '&#10003; Dang theo doi';
        btn.style.background = 'var(--green)';
    }
}

function demoInstall(btn) {
    btn.disabled = true;
    btn.textContent = '...';
    const prog = document.getElementById('install-progress');
    const text = document.getElementById('install-text');
    if (prog) {
        prog.style.display = 'block';
        const fill = prog.querySelector('.progress-fill');
        fill.style.width = '0%';
        setTimeout(() => { fill.style.transition = 'width 2s ease'; fill.style.width = '100%'; }, 100);
        setTimeout(() => { text.innerHTML = '&#9989; Da cai dat thanh cong!'; text.style.color = 'var(--green)'; }, 2200);
        setTimeout(() => { btn.textContent = '&#9989; Mo'; btn.style.background = 'var(--green)'; btn.disabled = false; }, 2500);
    }
}

function ttLike(el) {
    el.style.color = el.style.color === 'rgb(254, 44, 85)' ? 'white' : '#fe2c55';
}