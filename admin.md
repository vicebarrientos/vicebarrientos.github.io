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
  const SUPABASE_URL = "https://azcjmmgblcohyzrzsqtr.supabase.co";
  const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6Y2ptbWdibGNvaHl6cnpzcXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTA5ODIsImV4cCI6MjA3NjcyNjk4Mn0.774kuEsyQouXklSW0DvLU44u0u7umH9x1f4tERC-YOk";
  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  const authBox = document.getElementById('auth');
  const panel   = document.getElementById('panel');
  const list    = document.getElementById('list');
  const statusFilter = document.getElementById('statusFilter');
  const aMsg    = document.getElementById('auth-msg');
  const dbg     = document.getElementById('admin-debug');

  document.getElementById('login').onclick = async () => {
    aMsg.textContent = "Ingresando...";
    dbg.textContent = "";
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { aMsg.textContent = "❌ " + error.message; return; }
    aMsg.textContent = "";
    authBox.style.display='none';
    panel.style.display='block';
    await load();
  };

  document.getElementById('reload').onclick = load;
  statusFilter.onchange = load;

  async function load() {
    list.textContent = 'Cargando...';
    dbg.textContent = '';
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
        <p><b>Nick:</b> ${r.player_nick} · <b>Email:</b> ${r.player_email}</p>
        <p><b>Modo:</b> ${r.server_mode} · <b>Estado:</b> <span class="status">${r.status}</span></p>
        ${r.evidence_url ? `<p><b>Evidencia:</b> <a href="${r.evidence_url}" target="_blank">${r.evidence_url}</a></p>` : ''}
        <p>${r.description.replaceAll('<','&lt;')}</p>
        ${r.admin_reply ? `<p><b>Respuesta:</b> ${r.admin_reply}</p>` : ''}
        <div class="actions">
          <select class="set-status">
            <option value="">Cambiar estado…</option>
            <option>nuevo</option>
            <option>en_progreso</option>
            <option>resuelto</option>
            <option>archivado</option>
          </select>
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
  }
</script>