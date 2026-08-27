const progressBar = document.querySelector('.scroll-progress span');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressBar.style.width = `${progress}%`;
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

document.querySelectorAll('.reveal').forEach((element) => {
  if (reduceMotion) element.classList.add('visible');
  else revealObserver.observe(element);
});

document.querySelectorAll('.quote-link').forEach((link) => {
  link.addEventListener('click', () => {
    window.setTimeout(() => document.querySelector('#quote input')?.focus({ preventScroll: true }), 650);
  });
});

const quoteForm = document.querySelector('#quote');
const message = quoteForm.querySelector('.form-message');

quoteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  message.classList.remove('error');

  if (!quoteForm.checkValidity()) {
    quoteForm.reportValidity();
    showMessage('병원명, 원장님 성함, 진료과목, 연락처와 개인정보 동의를 확인해주세요.', true);
    return;
  }

  const data = new FormData(quoteForm);
  const digits = String(data.get('phone') ?? '').replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 11) {
    showMessage('연락 가능한 전화번호를 확인해주세요.', true);
    quoteForm.elements.phone.focus();
    return;
  }

  const subject = `[방문 데모 신청] ${data.get('clinic')} / ${data.get('director')}`;
  const body = [
    '서진메디텍 BTL CRYOTHERAPY 방문 데모를 신청합니다.',
    '',
    `병원명: ${data.get('clinic')}`,
    `원장님 성함: ${data.get('director')}`,
    `진료과목: ${data.get('department')}`,
    `연락처: ${data.get('phone')}`,
    '',
    '방문 가능 일정과 제품 자료를 안내해주세요.'
  ].join('\n');

  showMessage('신청 내용이 작성된 이메일 창을 여는 중입니다. 이메일 앱이 열리지 않으면 02-841-7525로 연락해주세요.');
  window.location.href = `mailto:zeuswave@naver.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
  message.style.display = 'block';
}
