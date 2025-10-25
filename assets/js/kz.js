document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('kz-loaded');
});

// ====== Modal helpers
const modal = document.getElementById('replyModal');
const rm_to = document.getElementById('rm_to');
const rm_subject = document.getElementById('rm_subject');
const rm_message = document.getElementById('rm_message');
const rm_status = document.getElementById('rm_status');
const rm_from = document.getElementById('rm_from');
const rm_msg = document.getElementById('rm_msg');
const btnSend = document.getElementById('replySend');

let RM_CONTEXT = { table: 'reports', id: null };

function openReplyModal({table, id, to, subject='Kronos Zone — Respuesta', message=''}) {
  RM_CONTEXT = { table, id };
  rm_to.value = to;
  rm_subject.value = subject;
  rm_message.value = message;
  rm_status.value = '';
  rm_from.value = document.getElementById('fromAlias')?.value || 'soporte';
  rm_msg.textContent = '';
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden','false');
  rm_subject.focus();
  document.body.style.overflow='hidden';
}

function closeReplyModal(){
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

document.getElementById('replyClose').onclick = closeReplyModal;
document.getElementById('replyCancel').onclick = closeReplyModal;
modal.addEventListener('click', (e)=>{ if(e.target===modal) closeReplyModal(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && modal.style.display==='flex') closeReplyModal(); });

// enviar
btnSend.onclick = async ()=>{
  rm_msg.textContent = '';
  const body = {
    to: rm_to.value.trim(),
    subject: rm_subject.value.trim() || 'Kronos Zone — Respuesta',
    message: rm_message.value.trim(),
    report_id: RM_CONTEXT.id,
    table: RM_CONTEXT.table,
    status: rm_status.value || undefined,
    replied_by: myProfile?.username || 'admin',
    from_alias: rm_from.value
  };
  if (!body.message) { rm_msg.textContent = 'Escribe un mensaje.'; return; }
  btnSend.disabled = true; btnSend.textContent = 'Enviando…';
  const { error } = await sb.functions.invoke('send-reply',{ body });
  btnSend.disabled = false; btnSend.textContent = 'Enviar';
  if (error){ rm_msg.textContent = error.message || String(error); return; }
  closeReplyModal();
  alert('✅ Respuesta enviada');
  load();
};