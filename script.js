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
const privacyConsentVersion = '2026.08.28';

function getKoreanTimestamp() {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(new Date()) + ' KST';
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {}
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch (_) {}
  textarea.remove();
  return copied;
}

document.querySelectorAll('.lead-form').forEach((form) => {
  const message = form.querySelector('.form-message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.classList.remove('error');

    if (!form.checkValidity()) {
      form.reportValidity();
      showMessage(message, '병원명, 원장님 성함, 희망 지역, 진료과목과 개인정보 동의를 확인해주세요.', true);
      return;
    }

    const data = new FormData(form);
    if (form.id === 'quote') {
      showMessage(message, '서진메디텍 대표 전화로 연결합니다.');
      window.setTimeout(() => { window.location.href = 'tel:028417525'; }, 350);
      return;
    }

    const body = [
      '[서진메디텍 방문 데모 신청]',
      `병원명: ${data.get('clinic')}`,
      `원장님 성함: ${data.get('director')}`,
      data.get('region') ? `희망 지역: ${data.get('region')}` : '',
      `진료과목: ${data.get('department')}`,
      `개인정보 수집·이용 동의: 동의함 (방침 v${privacyConsentVersion})`,
      `동의 일시: ${getKoreanTimestamp()}`,
      '방문 가능 일정과 제품 자료를 안내해주세요.'
    ].filter(Boolean).join('\n');

    const copied = await copyText(body);
    if (!copied) {
      showMessage(message, '상담 내용을 자동으로 복사하지 못했습니다. 카카오톡 상담 버튼으로 이동해 병원명과 희망 지역을 직접 보내주세요.', true);
      return;
    }

    showMessage(message, '상담 내용이 복사되었습니다. 카카오톡 상담창에서 붙여넣어 전송해주세요.');
    window.setTimeout(() => { window.location.href = kakaoChatUrl; }, 650);
  });
});

function showMessage(message, text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
  message.style.display = 'block';
}
