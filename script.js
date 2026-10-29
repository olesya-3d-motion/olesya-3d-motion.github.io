(() => {
 const video=document.querySelector('#heroVideo');
 const fallback=document.querySelector('#heroPlay');
 if(video&&fallback){
  video.muted=true;video.defaultMuted=true;
  async function start(){try{await video.play();fallback.hidden=true}catch(e){fallback.hidden=false}}
  fallback.addEventListener('click',start);
  video.addEventListener('playing',()=>{fallback.hidden=true});
  video.addEventListener('error',()=>{fallback.hidden=false});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!video.paused)return; if(!document.hidden)start()});
  start();
 }
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver'in window){
  const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.09});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
 }else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'))}
})();


// Services details remain independent of the new linked portfolio galleries
const detailButtons = document.querySelectorAll('.direction-card__details-button');
detailButtons.forEach(button=>button.addEventListener('click',()=>{
 const panel=document.getElementById(button.getAttribute('aria-controls'));
 const open=button.getAttribute('aria-expanded')==='true';
 button.setAttribute('aria-expanded',String(!open));
 button.closest('.direction-card').classList.toggle('is-open',!open);
 panel.hidden=open;
 const label=button.querySelector('.more-label');if(label)label.textContent=open?'Подробнее об услугах':'Свернуть описание';
}));
// A subtle pink pointer halo, never intercepting clicks
const halo=document.getElementById('cursorGlow');
if(halo && window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches){
 let x=-100,y=-100,raf=0;
 const paint=()=>{halo.style.transform=`translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;raf=0};
 document.addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;halo.classList.add('is-active');if(!raf)raf=requestAnimationFrame(paint)},{passive:true});
 document.addEventListener('pointerleave',()=>halo.classList.remove('is-active'));
 document.addEventListener('pointerover',e=>halo.classList.toggle('is-hovering',!!e.target.closest('a,button,summary')));
}

/* Contact form — show the actual FormSubmit result without leaving this site. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('portfolioContactForm');
  const button = document.getElementById('contactSubmitButton');
  const status = document.getElementById('contactFormStatus');
  const fallback = document.getElementById('contactEmailFallback');
  if (!form || !button || !status) return;
  form.addEventListener('invalid', () => {
    status.dataset.state = 'error';
    status.textContent = 'Заполните имя, email и описание проекта — все три поля обязательны';
  }, true);
  form.addEventListener('input', () => {
    if (status.dataset.state === 'error') {
      status.textContent = 'Проверьте данные и попробуйте отправить заявку ещё раз';
      status.dataset.state = '';
    }
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      status.textContent = 'Пожалуйста, заполните все поля и укажите корректный email';
      status.dataset.state = 'error';
      return;
    }

    const data = new FormData(form);
    const draft = 'Имя: ' + (data.get('name') || '') +
      '\nEmail: ' + (data.get('email') || '') +
      '\n\nО проекте:\n' + (data.get('message') || '');
    if (fallback) {
      fallback.href = 'mailto:oleskurguzova@gmail.com?subject=' +
        encodeURIComponent('Заявка с сайта: 2D / 3D / AI') +
        '&body=' + encodeURIComponent(draft);
    }

    button.disabled = true;
    button.textContent = 'Отправляем…';
    form.setAttribute('aria-busy', 'true');
    status.dataset.state = 'pending';
    status.textContent = 'Отправляем заявку — проверяем ответ сервиса…';

    try {
      const response = await fetch('https://formsubmit.co/ajax/oleskurguzova@gmail.com', {
        method: 'POST',
        headers: {'Accept': 'application/json'},
        body: new URLSearchParams(data)
      });
      const reply = await response.json();
      // FormSubmit can return the strings "true" and "false": never coerce them.
      const successful = response.ok && (reply.success === true || reply.success === 'true');
      const providerMessage = String(reply.message || '');
      if (successful) {
        status.dataset.state = 'success';
        status.textContent = 'Спасибо! Заявка отправлена — отвечу на указанный email';
        form.reset();
      } else if (/activat|confirm|подтвержд/i.test(providerMessage)) {
        status.dataset.state = 'error';
        status.textContent = 'Форма ожидает подтверждения почты владельцем сайта — пока можно написать напрямую по ссылке ниже';
      } else {
        status.dataset.state = 'error';
        status.textContent = 'Сервис не принял заявку — используйте ссылку «Написать напрямую» ниже';
      }
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = 'Не удалось связаться с почтовым сервисом — напишите напрямую по ссылке ниже, текст заявки уже подготовлен';
    } finally {
      form.removeAttribute('aria-busy');
      button.disabled = false;
      button.textContent = 'Отправить заявку ↗︎';
    }
  });
});
