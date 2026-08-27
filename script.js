const progressBar = document.querySelector('.scroll-progress span');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressBar.style.width = `${progress}%`;
  document.body.classList.toggle('is-scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.pain-grid, .profit-cards, .region-list, .benefit-copy ul, .product-points').forEach((group) => {
  [...group.children].forEach((element, index) => {
    element.classList.add('reveal-item');
    element.style.setProperty('--reveal-delay', `${index * 90}ms`);
  });
});

document.querySelectorAll('.reveal, .reveal-item').forEach((element) => {
  if (reduceMotion) element.classList.add('visible');
  else revealObserver.observe(element);
});

document.querySelectorAll('.pain-grid article, .profit-cards article, .network-card, .benefit-banner, .product-visual').forEach((card) => {
  card.classList.add('interactive-card');
  card.addEventListener('pointermove', (event) => {
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--my', `${event.clientY - bounds.top}px`);
  });
});

document.querySelectorAll('.quote-link').forEach((link) => {
  link.addEventListener('click', () => {
    window.setTimeout(() => document.querySelector('#quote input')?.focus({ preventScroll: true }), 650);
  });
});

const kakaoChatUrl = 'https://pf.kakao.com/_xojxkbxj/chat';

document.querySelectorAll('.lead-form').forEach((form) => {
  const message = form.querySelector('.form-message');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    message.classList.remove('error');

    if (!form.checkValidity()) {
      form.reportValidity();
      showMessage(message, '병원명, 원장님 성함, 진료과목, 연락처와 개인정보 동의를 확인해주세요.', true);
      return;
    }

    const data = new FormData(form);
    const digits = String(data.get('phone') ?? '').replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 11) {
      showMessage(message, '연락 가능한 전화번호를 확인해주세요.', true);
      form.elements.phone.focus();
      return;
    }

    const body = [
      '[서진메디텍 방문 데모 신청]',
      `병원명: ${data.get('clinic')}`,
      `원장님 성함: ${data.get('director')}`,
      data.get('region') ? `희망 지역: ${data.get('region')}` : '',
      `진료과목: ${data.get('department')}`,
      `연락처: ${data.get('phone')}`,
      '방문 가능 일정과 제품 자료를 안내해주세요.'
    ].filter(Boolean).join('\n');

    navigator.clipboard?.writeText(body).catch(() => {});
    showMessage(message, '상담 내용이 복사되었습니다. 카카오톡 상담창에서 붙여넣어 전송해주세요.');
    window.setTimeout(() => { window.location.href = kakaoChatUrl; }, 350);
  });
});

function showMessage(message, text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
  message.style.display = 'block';
}
