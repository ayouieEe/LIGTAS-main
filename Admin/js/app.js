// GLOBAL LIGTAS UI HANDLERS
function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
document.querySelectorAll('.modal-backdrop').forEach(m=>{m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')})});
function showToast(msg,type='info'){
  const t=document.createElement('div');
  const icons={success:'\u2713',info:'\u2139',error:'\u2715',warning:'\u26A0'};
  t.className=`toast ${type}`;t.innerHTML=`<span>${icons[type]||'\u2139'}</span><span>${msg}</span>`;
  document.getElementById('toast-wrap').appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(20px)';t.style.transition='.2s';setTimeout(()=>t.remove(),200)},3200);
}
function updateTime(){
  const now=new Date();
  const d=now.toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'});
  const t=now.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const el=document.getElementById('live-time');if(el)el.textContent=d+' Â· '+t;
}
setInterval(updateTime,1000);updateTime();
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-backdrop.open').forEach(m=>m.classList.remove('open'))});