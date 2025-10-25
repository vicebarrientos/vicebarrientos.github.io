---
title: "Panel de Reportes"
permalink: /admin/
layout: single
classes: wide
---

<div id="auth" style="margin-bottom:1rem">
  <h3>Acceso Staff</h3>
  <div>
    <button id="show-login" class="btn">Login</button>
    <button id="show-register" class="btn">Registro</button>
  </div>
  <div id="login-box" style="margin-top:.5rem">
    <input id="email" type="email" placeholder="correo">
    <input id="password" type="password" placeholder="contraseña">
    <button id="login" class="btn btn--primary">Ingresar</button>
  </div>
  <div id="register-box" style="display:none; margin-top:.5rem">
    <input id="r-username" placeholder="username (único)">
    <input id="r-email" type="email" placeholder="correo">
    <input id="r-password" type="password" placeholder="contraseña">
    <select id="r-role">
      <option value="mod">Mod</option>
      <option value="mod_plus">Mod+</option>
      <option value="admin">Admin</option>
      <option value="admin_plus">Admin+</option>
    </select>
    <button id="register" class="btn btn--primary">Crear cuenta</button>
  </div>
  <p id="auth-msg"></p>
</div>

<div id="panel" style="display:none">
  <div style="display:flex;gap:8px;align-items:center">
    <strong id="whoami"></strong>
    <button id="logout" class="btn">Salir</button>
  </div>

  <!-- Pestañas tipo inbox -->
  <div style="margin:1rem 0; display:flex; gap:.5rem;">
    <button class="tab btn btn--primary" data-tab="reports">Reportes</button>
    <button class="tab btn" data-tab="support">Soporte</button>
    <button class="tab btn" data-tab="users">Usuarios</button>
  </div>

  <!-- Controles comunes -->
  <div id="toolbar" style="display:flex; gap:.5rem; align-items:center; margin-bottom:.5rem">
    <select id="statusFilter">
      <option value="">Todos</option>
      <option value="sin_leer">Sin leer</option>
      <option value="en_progreso">En progreso</option>
      <option value="cerrado">Cerrado</option>
    </select>
    <button id="reload">Recargar</button>
    <select id="fromAlias">
      <option value="soporte">Enviar como soporte@</option>
      <option value="administracion">Enviar como administracion@</option>
    </select>
  </div>

  <div id="list"></div>
  <pre id="dbg" style="white-space:pre-wrap;font-size:.9rem;opacity:.7"></pre>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const sb = supabase.createClient("TU_SUPABASE_URL","TU_SUPABASE_ANON_KEY");
  const authMsg = document.getElementById('auth-msg');
  const panel = document.getElementById('panel');
  const list  = document.getElementById('list');
  const dbg   = document.getElementById('dbg');
  const who   = document.getElementById('whoami');
  const statusFilter = document.getElementById('statusFilter');
  const fromAlias = document.getElementById('fromAlias');
  let currentUser=null, currentTab='reports', myProfile=null;

  // toggles
  document.getElementById('show-login').onclick = ()=>{document.getElementById('login-box').style.display='block';document.getElementById('register-box').style.display='none';}
  document.getElementById('show-register').onclick = ()=>{document.getElementById('login-box').style.display='none';document.getElementById('register-box').style.display='block';}

  // registro (crea auth user + fila en staff_profiles con approved=false)
  document.getElementById('register').onclick = async ()=>{
    authMsg.textContent="Creando cuenta...";
    const email = document.getElementById('r-email').value.trim();
    const password = document.getElementById('r-password').value.trim();
    const username = document.getElementById('r-username').value.trim();
    const role = document.getElementById('r-role').value;
    try{
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      // crea perfil
      const { error: e2 } = await sb.from('staff_profiles').insert({
        user_id: data.user.id, username, role, approved: false
      });
      if (e2) throw e2;
      authMsg.textContent="✅ Cuenta creada. Espera aprobación de un Admin.";
    }catch(err){ authMsg.textContent="❌ "+(err.message||err); }
  };

  // login
  document.getElementById('login').onclick = async ()=>{
    authMsg.textContent="Ingresando...";
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { authMsg.textContent="❌ "+error.message; return; }
    currentUser = data.user;
    await afterLogin();
  };

  async function afterLogin(){
    // buscar perfil
    const { data: prof, error: e1 } = await sb.from('staff_profiles').select('*').eq('user_id', currentUser.id).single();
    if (e1){ authMsg.textContent="❌ "+e1.message; return; }
    myProfile = prof;
    if (!prof.approved){ authMsg.textContent="⚠️ Tu cuenta está pendiente de aprobación."; return; }
    document.getElementById('auth').style.display='none';
    panel.style.display='block';
    who.textContent = `${prof.username} (${prof.role})`;
    load();
  }

  document.getElementById('logout').onclick = async ()=>{ await sb.auth.signOut(); location.reload(); };

  // pestañas
  document.querySelectorAll('.tab').forEach(btn=>{
    btn.onclick=()=>{ document.querySelectorAll('.tab').forEach(b=>b.classList.remove('btn--primary')); btn.classList.add('btn--primary'); currentTab=btn.dataset.tab; load(); }
  });

  document.getElementById('reload').onclick=load;
  statusFilter.onchange=load;

  async function load(){
    list.textContent='Cargando...'; dbg.textContent='';
    try{
      if (currentTab==='users') { await loadUsers(); return; }
      const table = currentTab==='reports' ? 'reports' : 'support_tickets';
      let q = sb.from(table).select('*').order('created_at',{ascending:false});
      if (statusFilter.value) q = q.eq('status', statusFilter.value);
      const { data, error } = await q;
      if (error) throw error;
      list.innerHTML = data.map(render).join('');
      bindActions(table);
    }catch(err){ list.textContent='❌ '+(err.message||err); }
  }

  function render(r){
    return `
      <div class="card" data-id="${r.id}">
        <h4>${r.status.toUpperCase()} — <small>${new Date(r.created_at).toLocaleString()}</small></h4>
        ${r.reporter_nick ? `<p><b>Reporte de:</b> ${r.reporter_nick} → <b>Acusado:</b> ${r.accused_nick}</p>` : `<p><b>Ticket de:</b> ${r.nick}</p>`}
        <p><b>Email:</b> <span class="email">${r.player_email||r.email}</span></p>
        ${r.mode ? `<p><b>Modo:</b> ${r.mode} · <b>Tipo:</b> ${r.rtype}</p>` : `<p><b>Tipo:</b> ${r.ttype}</p>`}
        ${r.evidence_url ? `<p><b>Evidencia:</b> <a href="${r.evidence_url}" target="_blank">${r.evidence_url}</a></p>` : ``}
        <p>${(r.description||'').replaceAll('<','&lt;')}</p>
        ${r.updated_by_name ? `<p><small>Último cambio por: ${r.updated_by_name}</small></p>` : ``}
        <div class="actions">
          <select class="set-status">
            <option value="">Cambiar estado…</option>
            <option value="sin_leer">Sin leer</option>
            <option value="en_progreso">En progreso</option>
            <option value="cerrado">Cerrado</option>
          </select>
          <button class="reply">Responder (email)</button>
          <button class="delete">Eliminar</button>
        </div>
      </div>`;
  }

  function bindActions(table){
    document.querySelectorAll('.set-status').forEach(sel=>{
      sel.onchange = async (e)=>{
        const card = e.target.closest('.card'); const id=card.dataset.id; const status=e.target.value;
        if (!status) return;
        const patch = { status, updated_by: currentUser.id, updated_by_name: myProfile.username };
        const { error } = await sb.from(table).update(patch).eq('id', id);
        if (error) alert('❌ '+error.message); else load();
      };
    });
    document.querySelectorAll('.delete').forEach(btn=>{
      btn.onclick = async (e)=>{
        const card=e.target.closest('.card');
        if (!confirm('¿Eliminar?')) return;
        const { error } = await sb.from(table).delete().eq('id', card.dataset.id);
        if (error) alert('❌ '+error.message); else card.remove();
      }
    });
    document.querySelectorAll('.reply').forEach(btn=>{
      btn.onclick = async (e)=>{
        const card = e.target.closest('.card');
        const id = card.dataset.id;
        const email = card.querySelector('.email').textContent.trim();
        const subject = prompt('Asunto:', 'Kronos Zone — Respuesta a tu caso');
        if (!subject) return;
        const message = prompt('Mensaje:','¡Gracias por tu reporte! Hemos tomado acción.');
        if (!message) return;
        const nextStatus = confirm('¿Marcar como EN PROCESO? Aceptar=Sí · Cancelar=No') ? 'en_progreso' : undefined;

        const { error } = await sb.functions.invoke('send-reply', {
          body: {
            to: email,
            subject, message,
            report_id: id,
            table: (table),
            status: nextStatus,
            replied_by: myProfile.username,
            from_alias: document.getElementById('fromAlias').value
          }
        });
        if (error) alert('❌ '+error.message); else { alert('✅ Enviado'); load(); }
      };
    });
  }

  async function loadUsers(){
    // Solo admins pueden ver
    const { data: me } = await sb.from('staff_profiles').select('role').eq('user_id', currentUser.id).single();
    if (!['admin','admin_plus'].includes(me.role)){ list.textContent='Solo Admin'; return; }
    const { data, error } = await sb.from('staff_profiles').select('*').order('created_at',{ascending:false});
    if (error){ list.textContent='❌ '+error.message; return;}
    list.innerHTML = data.map(u=>{
      return `<div class="card">
        <p><b>${u.username}</b> — ${u.role} — ${u.approved ? 'Aprobado ✅' : 'Pendiente ⏳'}</p>
        <div class="actions">
          <button data-id="${u.user_id}" class="approve">Aprobar</button>
          <button data-id="${u.user_id}" class="deny">Rechazar</button>
          <select data-id="${u.user_id}" class="chg-role">
            <option ${u.role==='mod'?'selected':''} value="mod">Mod</option>
            <option ${u.role==='mod_plus'?'selected':''} value="mod_plus">Mod+</option>
            <option ${u.role==='admin'?'selected':''} value="admin">Admin</option>
            <option ${u.role==='admin_plus'?'selected':''} value="admin_plus">Admin+</option>
          </select>
        </div>
      </div>`;
    }).join('');
    // bind
    list.querySelectorAll('.approve').forEach(b=>b.onclick=async()=>{
      const id=b.dataset.id; const { error } = await sb.from('staff_profiles').update({approved:true}).eq('user_id',id);
      if (error) alert(error.message); else loadUsers();
    });
    list.querySelectorAll('.deny').forEach(b=>b.onclick=async()=>{
      const id=b.dataset.id; const { error } = await sb.from('staff_profiles').delete().eq('user_id',id);
      if (error) alert(error.message); else loadUsers();
    });
    list.querySelectorAll('.chg-role').forEach(s=>s.onchange=async(e)=>{
      const id=s.dataset.id; const role=e.target.value;
      const { error } = await sb.from('staff_profiles').update({role}).eq('user_id',id);
      if (error) alert(error.message); else loadUsers();
    });
  }
</script>
