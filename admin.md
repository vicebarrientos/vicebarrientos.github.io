---
title: "Panel de Reportes"
permalink: /admin/
layout: single
classes: wide
---

<div id="auth">
  <h3>Acceso Staff</h3>
  <input id="email" type="email" placeholder="correo">
  <input id="password" type="password" placeholder="contraseña">
  <button id="login" class="btn btn--primary">Ingresar</button>
  <p id="auth-msg"></p>
</div>

<div id="panel" style="display:none">
  <h3>Reportes</h3>
  <div id="filters" style="margin-bottom:.5rem">
    <select id="statusFilter">
      <option value="">Todos</option>
      <option>nuevo</option>
      <option>en_progreso</option>
      <option>resuelto</option>
      <option>archivado</option>
    </select>
    <button id="reload">Recargar</button>
  </div>
  <div id="list"></div>
  <pre id="admin-debug" style="white-space:pre-wrap;font-size:.9rem;opacity:.8"></pre>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const SUPABASE_URL = "TU_SUPABASE_URL";
  const SUPABASE_ANON = "TU_SUPABASE_ANON_KEY";
  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  let currentUser = null;

  const authBox = document.getElementById('auth');
  const panel   = document.getElementById('panel');
  const list    = document.getElementById('list');
  const statusFilter = document.getElementById('statusFilter');
  const aMsg    = document.getElementById('auth-msg');

  document.getElementById('login').onclick = async () => {
    aMsg.textContent = "Ingresando...";
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { aMsg.textContent = "❌ " + error.message; return; }
    currentUser = data.user;
    aMsg.textContent = "";
    authBox.style.display='none';
    panel.style.display='block';
    await load();
  };

  document.getElementById('reload').onclick = load;
  statusFilter.onchange = load;

  async function load() {
    list.textContent = 'Cargando...';
    let q = sb.from('reports').select('*').order('created_at', { ascending:false });
    if (statusFilter.value) q = q.eq('status', statusFilter.value);
    const { data, error } = await q;
    if (error) { list.textContent = '❌ ' + error.message; return; }
    list.innerHTML = data.map(render).join('');
    bindActions();
  }

  function render(r) {
    return `
      <div class="card" data-id="${r.id}">
        <h4>${r.category} — <small>${new Date(r.created_at).toLocaleString()}</small></h4>
        <p><b>Nick:</b> ${r.player_nick} · <b>Email:</b> <span class="email">${r.player_email}</span></p>
        <p><b>Modo:</b> ${r.server_mode} · <b>Estado:</b> <span class="status">${r.status}</span></p>
        ${r.evidence_url ? `<p><b>Evidencia:</b> <a href="${r.evidence_url}" target="_blank">${r.evidence_url}</a></p>` : ''}
        <p>${r.description.replaceAll('<','&lt;')}</p>
        ${r.admin_reply ? `<p><b>Última respuesta:</b> ${r.admin_reply} <small>(${r.replied_at ?? ''})</small></p>` : ''}
        <div class="actions">
          <select class="set-status">
            <option value="">Cambiar estado…</option>
            <option>nuevo</option>
            <option>en_progreso</option>
            <option>resuelto</option>
            <option>archivado</option>
          </select>
          <button class="reply">Responder (email)</button>
          <button class="delete">Eliminar</button>
        </div>
      </div>`;
  }

  function bindActions() {
    document.querySelectorAll('.set-status').forEach(sel => {
      sel.onchange = async (e) => {
        const card = e.target.closest('.card');
        const id = card.dataset.id;
        const status = e.target.value;
        if (!status) return;
        const { error } = await sb.from('reports').update({ status }).eq('id', id);
        if (error) alert('❌ ' + error.message);
        else card.querySelector('.status').textContent = status;
      };
    });

    document.querySelectorAll('.delete').forEach(btn => {
      btn.onclick = async (e) => {
        const card = e.target.closest('.card');
        if (!confirm('¿Eliminar reporte?')) return;
        const { error } = await sb.from('reports').delete().eq('id', card.dataset.id);
        if (error) alert('❌ ' + error.message);
        else card.remove();
      };
    });

    document.querySelectorAll('.reply').forEach(btn => {
      btn.onclick = async (e) => {
        const card = e.target.closest('.card');
        const id = card.dataset.id;
        const email = card.querySelector('.email').textContent.trim();
        const subject = prompt('Asunto del correo:', 'Respuesta a tu reporte — Kronos Zone');
        if (!subject) return;
        const message = prompt('Mensaje (puedes usar saltos de línea):', '¡Gracias por tu reporte! Hemos tomado acción.');
        if (!message) return;

        // Estado post-respuesta (puedes cambiarlo a 'resuelto' o 'en_progreso')
        const nextStatus = confirm('¿Marcar como RESUELTO? Aceptar=Sí / Cancelar=No') ? 'resuelto' : undefined;

        const { error } = await sb.functions.invoke('send-reply', {
          body: {
            to: email,
            subject,
            message,
            report_id: id,
            status: nextStatus,
            replied_by: currentUser?.email || 'admin'
          }
        });

        if (error) alert('❌ ' + error.message);
        else {
          alert('✅ Correo enviado');
          if (nextStatus) card.querySelector('.status').textContent = nextStatus;
          // (Opcional) recargar para ver admin_reply/replied_at actualizados
          load();
        }
      };
    });
  }
</script>