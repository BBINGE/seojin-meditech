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
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => {
  if (reduceMotion) element.classList.add('visible');
  else revealObserver.observe(element);
});

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting || reduceMotion) return;
    const target = entry.target;
    const end = Number(target.dataset.count);
    const started = performance.now();
    const animate = (time) => {
      const ratio = Math.min((time - started) / 700, 1);
      target.textContent = Math.round(end * ratio);
      if (ratio < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    countObserver.unobserve(target);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach((element) => {
  if (reduceMotion) element.textContent = element.dataset.count;
  else countObserver.observe(element);
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
    message.textContent = '필수 항목과 개인정보 동의를 확인해주세요.';
    message.classList.add('error');
    message.style.display = 'block';
    return;
  }

  const data = new FormData(quoteForm);
  message.innerHTML = `<strong>${escapeText(data.get('clinic'))}</strong>의 ${escapeText(data.get('interest'))} 상담 조건이 정리되었습니다.<br>현재는 프로토타입이므로 실제 전송되지 않습니다. 담당 연락처와 접수 시스템 연결 후 바로 사용할 수 있습니다.`;
  message.style.display = 'block';
});

function escapeText(value) {
  const node = document.createElement('span');
  node.textContent = String(value ?? '');
  return node.innerHTML;
}

document.querySelectorAll('details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('details[open]').forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});
