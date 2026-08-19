/* ============================================
   CONG NGHE VUI - MAIN.JS
   ============================================ */

// Back to top
window.addEventListener('scroll', () => {
  const btn = document.getElementById('backTop');
  if (btn) {
    if (window.scrollY > 300) btn.classList.add('show');
    else btn.classList.remove('show');
  }
});

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Modal quick tips data
const quickTips = {
  zoom: {
    title: '🔍 Cach Phong To Chu Tren Dien Thoai',
    steps: [
      { num: 1, head: 'Vao Cai Dat', body: 'Tim bieu tuong "Cai dat" (hinh banh rang) tren man hinh chinh cua dien thoai.' },
      { num: 2, head: 'Chon "Man hinh"', body: 'Vuot xuong tim muc "Man hinh" hoac "Hien thi" roi nhan vao.' },
      { num: 3, head: 'Chon "Co chu"', body: 'Tim muc "Co chu" hoac "Kich thuoc van ban" roi keo thanh truot sang phai de chu to hon.' },
      { num: 4, head: 'Chon muc to', body: 'Nhan "Lon" hoac "Rat lon" la duoc! Chu se to hon ngay lap tuc.' },
    ],
    tip: '💡 Meo: Tren trang web, Ong Ba co the dung 2 ngon tay "doang ra" de phong to bat ky anh hay chu nao!'
  },
  call: {
    title: '📞 Cach Goi Video Cho Con Chau',
    steps: [
      { num: 1, head: 'Mo Facebook hoac Zalo', body: 'Tim bieu tuong ung dung tren man hinh chinh va nhan vao.' },
      { num: 2, head: 'Tim ten nguoi muon goi', body: 'Nhan vao o tim kiem (hinh kinh lup) va gõ ten con/chau.' },
      { num: 3, head: 'Nhan vao ten ho', body: 'Khi thay ten hien ra, nhan vao de mo cua so chat.' },
      { num: 4, head: 'Nhan nut goi video', body: 'Tim bieu tuong may quay phim nho va nhan vao. Doi ho nghe may la duoc!' },
    ],
    tip: '💡 Meo: Neu con chau dang ban, chung se goi lai sau. Ong Ba cu binh tinh cho nhe!'
  },
  photo: {
    title: '📷 Cach Chup Anh Bang Dien Thoai',
    steps: [
      { num: 1, head: 'Mo May Anh', body: 'Tim bieu tuong may anh (hinh chiec may anh) tren man hinh chinh va nhan vao.' },
      { num: 2, head: 'Huong camera', body: 'Huong mat sau dien thoai vao vat/nguoi can chup. Nhin vao man hinh.' },
      { num: 3, head: 'Giu yen tay', body: 'Giu dien thoai that chat bang ca 2 tay de anh khong bi mo.' },
      { num: 4, head: 'Nhan nut chup', body: 'Nhan vao nut tron lon mau trang o giua man hinh la chup duoc anh roi!' },
    ],
    tip: '💡 Meo: Nhan va GIU nut tron de chup nhieu anh lien tiep cung duoc!'
  },
  share: {
    title: '📤 Cach Chia Se Anh/Video Cho Nguoi Than',
    steps: [
      { num: 1, head: 'Mo anh can chia se', body: 'Vao Thu vien anh hoac Facebook, tim anh/video muon gui.' },
      { num: 2, head: 'Nhan nut Chia se', body: 'Tim bieu tuong mui ten len (↑) hoac ba cham (...) roi nhan vao.' },
      { num: 3, head: 'Chon cach gui', body: 'Chon "Gui tin nhan" de gui rieng, hoac "Dang len" de moi nguoi cung xem.' },
      { num: 4, head: 'Chon nguoi nhan', body: 'Gõ ten nguoi can gui, nhan vao ten ho roi nhan "Gui". Xong!' },
    ],
    tip: '💡 Meo: Co the chia se cho nhieu nguoi cung mot luc bang cach chon nhieu ten!'
  },
  search: {
    title: '🔎 Cach Tim Kiem Tren Dien Thoai',
    steps: [
      { num: 1, head: 'Mo trinh duyet', body: 'Tim bieu tuong Chrome (hinh vong tron mau) hoac Safari tren man hinh chinh.' },
      { num: 2, head: 'Nhan vao o tim kiem', body: 'Nhan vao thanh dia chi tren cung man hinh, ban phim se hien ra.' },
      { num: 3, head: 'Gõ tu khoa', body: 'Gõ nhung gi muon tim, vi du: "nau canh chua" hoac "bai hat que huong".' },
      { num: 4, head: 'Nhan Tim kiem', body: 'Nhan phim "Tim kiem" hoac "Go" mau xanh tren ban phim la hien ket qua ngay!' },
    ],
    tip: '💡 Meo: Cung co the nhan vao bieu tuong mic (hinh cai mic) de noi bang giong noi thay vi gõ!'
  },
  volume: {
    title: '🔊 Cach Tang Am Luong',
    steps: [
      { num: 1, head: 'Tim nut am luong', body: 'Nhan sang canh dien thoai (thuong o canh ben trai hoac ben phai).' },
      { num: 2, head: 'Nhan nut (+)', body: 'Nhan nut dau (+) hoac mui ten len de tang am thanh.' },
      { num: 3, head: 'Kiem tra man hinh', body: 'Man hinh se hien thanh truot am luong. Ong Ba co the keo thanh truot sang phai de to hon.' },
      { num: 4, head: 'Them meo', body: 'Vao Cai dat > Am thanh de chinh nhieu loai am luong khac nhau: chuong, noi chuyen, nhac.' },
    ],
    tip: '💡 Meo: Neu nghe qua nho, hay thu tai nghe hoac loa Bluetooth de nghe ro hon nhe!'
  }
};

function showQuick(key) {
  const data = quickTips[key];
  if (!data) return;
  const stepsHtml = data.steps.map(s => `
    <div class="modal-step">
      <div class="step-num">${s.num}</div>
      <div class="step-text">
        <strong>${s.head}</strong>
        <span>${s.body}</span>
      </div>
    </div>
  `).join('');
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-title">${data.title}</div>
    ${stepsHtml}
    <div class="demo-tip">
      <div class="demo-tip-icon">💡</div>
      <div>${data.tip}</div>
    </div>
  `;
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// Accordion for step blocks
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.step-header').forEach(header => {
    header.addEventListener('click', () => {
      const block = header.parentElement;
      const isOpen = block.classList.contains('open');
      document.querySelectorAll('.step-block').forEach(b => b.classList.remove('open'));
      if (!isOpen) block.classList.add('open');
    });
  });

  // Open first step by default
  const firstBlock = document.querySelector('.step-block');
  if (firstBlock) firstBlock.classList.add('open');

  // Animate progress bars
  document.querySelectorAll('.progress-fill').forEach(bar => {
    const w = bar.dataset.width || '0';
    setTimeout(() => { bar.style.width = w + '%'; }, 500);
  });

  // Intersection Observer for fade-in animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'slide-up 0.5s ease forwards';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.app-card, .tip-card, .step-block, .vid-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });
});

// CSS animation injection
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);