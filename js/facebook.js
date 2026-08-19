/* Facebook page interactions */

function animateField(id) {
  document.querySelectorAll('.field-input').forEach(f => f.classList.remove('focused'));
  const el = document.querySelector('#' + id + ' .field-input');
  if (el) { el.classList.add('focused'); }
}

function demoRegister() {
  const res = document.getElementById('form-result');
  res.innerHTML = '&#127881; Dang ky thanh cong! Chuc mung Ong Ba!';
  res.style.color = 'green';
  setTimeout(() => { res.innerHTML = ''; }, 3000);
}

function demoAvatar() {
  const av = document.getElementById('avatar-circle');
  if (av) {
    const emojis = ['&#128100;', '&#128518;', '&#128522;', '&#128526;', '&#128578;'];
    let i = 0;
    const iv = setInterval(() => {
      av.innerHTML = emojis[i % emojis.length]; i++;
      if (i >= emojis.length) { clearInterval(iv); av.innerHTML = '&#128522;'; }
    }, 300);
  }
}

function demoEditProfile() {
  alert('Trong ung dung that: Nhan nut "Chinh sua trang ca nhan" mau xanh tren trang ca nhan de them thong tin!');
}

const mockUsers = [
  { name: 'Nguyen Van An', info: 'Ha Noi', emoji: '&#128526;' },
  { name: 'Tran Thi Binh', info: 'Sai Gon', emoji: '&#128578;' },
  { name: 'Le Van Cuong', info: 'Da Nang', emoji: '&#128519;' },
  { name: 'Pham Thi Dung', info: 'Can Tho', emoji: '&#128516;' },
];

function liveSearch(val) {
  const res = document.getElementById('search-results');
  if (!val || val.length < 2) { res.innerHTML = ''; return; }
  const matches = mockUsers.filter(u => u.name.toLowerCase().includes(val.toLowerCase()));
  res.innerHTML = matches.map(u => `
    <div class="search-result-item">
      <div class="sr-avatar">${u.emoji}</div>
      <div class="sr-info"><strong>${u.name}</strong><span>${u.info}</span></div>
      <button class="sr-add" onclick="addFriend(this, '${u.name}')">+ Them</button>
    </div>
  `).join('') || '<div style="padding:14px;color:#94a3b8;font-size:0.95rem">Khong tim thay...</div>';
}

function addFriend(btn, name) {
  btn.textContent = '&#10003; Da gui';
  btn.style.background = 'var(--green)';
  btn.disabled = true;
}

function demoPhoto() {
  const inp = document.getElementById('post-input');
  if (inp) inp.value = '&#128247; [Da chon anh tu thu vien] ';
}

function demoFeeling() {
  const inp = document.getElementById('post-input');
  const feelings = ['&#128522; dang hanh phuc', '&#128526; dang vui ve', '&#128149; dang yeu thuong', '&#128518; dang cuoi'];
  const f = feelings[Math.floor(Math.random() * feelings.length)];
  if (inp) inp.value += ' - cam thay ' + f;
}

function demoPost() {
  const inp = document.getElementById('post-input');
  const res = document.getElementById('post-demo-result');
  if (inp && inp.value.trim()) {
    res.innerHTML = `<div style="background:#e7f0fd;border-radius:10px;padding:10px;margin-top:10px;font-size:0.9rem">&#9989; Bai viet da dang thanh cong!<br><em>"${inp.value}"</em></div>`;
    inp.value = '';
  } else {
    res.innerHTML = '<div style="color:#ef4444;font-size:0.9rem;margin-top:8px">&#9888; Vui long viet noi dung truoc khi dang!</div>';
  }
}

function openChat() {
  const chat = document.getElementById('chat-demo');
  if (chat) chat.style.display = 'flex';
}

function closeChat() {
  const chat = document.getElementById('chat-demo');
  if (chat) chat.style.display = 'none';
}

function sendMsg() {
  const inp = document.getElementById('chat-input-box');
  const msgs = document.getElementById('chat-msgs');
  if (inp && msgs && inp.value.trim()) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble outgoing';
    bubble.textContent = inp.value;
    msgs.appendChild(bubble);
    msgs.scrollTop = msgs.scrollHeight;
    const val = inp.value; inp.value = '';
    setTimeout(() => {
      const rep = document.createElement('div');
      rep.className = 'bubble incoming';
      const replies = ['&#128522; Da nhe Ba!', '&#128149; Con hieu roi!', '&#128077; Duoc Ba oi!', '&#127881; Cam on Ba!'];
      rep.innerHTML = replies[Math.floor(Math.random() * replies.length)];
      msgs.appendChild(rep);
      msgs.scrollTop = msgs.scrollHeight;
    }, 1200);
  }
}

document.addEventListener('keydown', e => {
  const inp = document.getElementById('chat-input-box');
  if (inp && document.activeElement === inp && e.key === 'Enter') sendMsg();
});

function showCallAnim() {
  const overlay = document.getElementById('call-overlay');
  const status = document.getElementById('call-status');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.querySelector('.call-anim-circle').innerHTML = '&#128222;';
    status.textContent = 'Dang goi...';
    setTimeout(() => { status.textContent = 'Dang ket noi...'; }, 1500);
    setTimeout(() => { status.textContent = 'Da ket noi! &#127881;'; }, 3000);
  }
}

function showVideoCallAnim() {
  const overlay = document.getElementById('call-overlay');
  const status = document.getElementById('call-status');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.querySelector('.call-anim-circle').innerHTML = '&#128249;';
    status.textContent = 'Dang goi video...';
    setTimeout(() => { status.textContent = 'Da ket noi video! &#127881;'; }, 2500);
  }
}

function endCall() {
  const overlay = document.getElementById('call-overlay');
  if (overlay) overlay.style.display = 'none';
}

function toggleLike(btn) {
  if (btn.style.color === 'rgb(24, 119, 242)') {
    btn.style.color = ''; btn.innerHTML = '&#128077; Thich';
  } else {
    btn.style.color = '#1877f2'; btn.innerHTML = '&#128077; Da Thich (1)';
  }
}

function showCommentBox() {
  const box = document.getElementById('comment-box');
  if (box) {
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  }
}

function submitComment() {
  const inp = document.getElementById('comment-input');
  const res = document.getElementById('comment-result');
  if (inp && inp.value.trim()) {
    res.innerHTML = `<div style="background:var(--gray);border-radius:10px;padding:8px 12px;margin-top:8px;font-size:0.9rem"><strong>Ong/Ba:</strong> ${inp.value}</div>`;
    inp.value = '';
  }
}

function showReact(label) {
  document.getElementById('react-result').textContent = 'Da chon: ' + label;
}