---
title: "Portal Staff"
permalink: /admin/
layout: single
classes: wide
---

<style>
/* ====== Estilos del panel ====== */
.kz-auth-wrap{
  max-width: 860px; margin: 0 auto; padding: 24px;
}
.kz-row{display:flex; gap:20px; align-items:stretch; flex-wrap:wrap;}
.kz-card{
  flex:1 1 360px; background:#1f242c; border:1px solid rgba(255,255,255,.08);
  border-radius:16px; padding:24px;
  box-shadow: 0 15px 40px rgba(0,0,0,.25);
}
.kz-card h3{margin:0 0 10px 0;}
.kz-input, .kz-select, .kz-btn{
  width:100%; border-radius:12px; border:1px solid rgba(255,255,255,.12);
  background:#0f1320; color:#fff; padding:12px 14px; margin-top:10px;
}
.kz-btn{background:#ff9a3c; color:#1b1f2a; font-weight:700; cursor:pointer; border:none;}
.kz-btn.sec{background:#2a3140; color:#fff;}
.kz-muted{opacity:.8; font-size:.95rem}
.kz-error{color:#ff6b6b; margin-top:10px}
.kz-ok{color:#74d99f; margin-top:10px}
.kz-topbar{display:flex; align-items:center; gap:10px; justify-content:space-between; margin-bottom:16px}
.kz-tabs{display:flex; gap:8px; flex-wrap:wrap;}
.kz-tab{border:none; background:#2a3140; color:#fff; padding:8px 12px; border-radius:10px; cursor:pointer}
.kz-tab.active{background:#ff9a3c; color:#1b1f2a; font-weight:700}
.kz-toolbar{display:flex; gap:10px; align-items:center; margin:12px 0}
.kz-list .kz-item{background:#151a24; border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:14px; margin:10px 0}
.kz-item h4{margin:0 0 6px 0}
.kz-actions{display:flex; gap:8px; flex-wrap:wrap; margin-top:8px}
.kz-badge{display:inline-block; padding:2px 8px; border-radius:999px; font-size:.8rem; border:1px solid rgba(255,255,255,.15)}
.kz-badge.gray{background:#2a3140}
.kz-badge.yellow{background:#ff9a3c; color:#1b1f2a; font-weight:700}
.kz-badge.green{background:#63e6be; color:#103520; font-weight:700}
</style>

<div class="kz-auth-wrap" id="screen-auth">
  <div class="kz-row">
    <div class="kz-card">
      <h3 style="text-align:center;margin-bottom:4px">Login</h3>
      <p class="kz-muted" style="text-align:center;margin:0">Solo personal aprobado</p>
      <input id="login-email" class="kz-input" placeholder="Correo">
      <input id="login-pass" class="kz-input" type="password" placeholder="Contraseña">
      <button id="btn-login" class="kz-btn" style="margin-top:14px">Entrar</button>
      <p id="login-msg" class="kz-error"></p>
      <p class="kz-muted" style="margin-top:8px">¿No tienes cuenta? <a href="#!" id="go-register">Regístrate</a></p>
    </div>

    <div class="kz-card" id="card-register" style="display:none">
      <h3 style="text-align:center;margin-bottom:4px">Registro</h3>
      <p class="kz-muted" style="text-align:center;margin:0">Tu cuenta quedará en revisión</p>
      <input id="r-username" class="kz-input" placeholder="Nombre de cuenta (username)">
      <input id="r-email" class="kz-input" placeholder="Correo">
      <input id="r-pass" class="kz-input" type="password" placeholder="Contraseña">
      <select id="r-role" class="kz-select">
        <option value="mod">Mod</option>
        <option value="mod_plus">Mod+</option>
        <option value="admin">Admin</option>
        <option value="admin_plus">Admin+</option>
      </select>
      <button id="btn-register" class="kz-btn" style="margin-top:14px">Crear cuenta</button>
      <p id="register-msg" class="kz-error"></p>
      <p class="kz-muted" style="margin-top:8px"><a href="#!" id="go-login">Volver a Login</a></p>
    </div>
  </div>
</div>

<div class="kz-auth-wrap" id="screen-panel" style="display:none">
  <div class="kz-topbar">
    <div><strong id="whoami"></strong> <span id="myrole" class="kz-badge gray"></span></div>
    <div>
      <select id="fromAlias" class="kz-select" style="width:auto;display:inline-block">
        <option value="soporte">Enviar como soporte@</option>
        <option value="administracion">Enviar como administracion@</option>
      </select>
      <button id="btn-logout" class="kz-btn sec">Salir</button>
    </div>
  </div>

  <div class="kz-tabs">
    <button class="kz-tab active" data-tab="reports">Reportes</button>
    <button class="kz-tab" data-tab="support">Soporte</button>
    <button class="kz-tab" data-tab="users">Usuarios</button>
  </div>

  <div class="kz-toolbar">
    <select id="statusFilter" class="kz-select" style="width:auto">
      <option value="">Todos</option>
      <option value="sin_leer">Sin leer</option>
      <option value="en_progreso">En progreso</option>
      <option value="cerrado">Cerrado</option>
    </select>
    <button id="btn-reload" class="kz-btn sec">Recargar</button>
  </div>

  <div id="list" class="kz-list"></div>
  <p id="panel-msg" class="kz-error"></p>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
const sb = supabase.createClient("https://azcjmmgblcohyzrzsqtr.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6Y2ptbWdibGNvaHl6cnpzcXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTA5ODIsImV4cCI6MjA3NjcyNjk4Mn0.774kuEsyQouXklSW0DvLU44u0u7umH9x1f4tERC-YOk");

// refs
const scrAuth  = document.getElementById('screen-auth');
const scrPanel = document.getElementById('screen-panel');
const loginMsg = document.getElementById('login-msg');
const regMsg   = document.getElementById('register-msg');
const panelMsg = document.getElementById('panel-msg');
const who      = document.getElementById('whoami');
const myrole   = document.getElementById('myrole');
const statusFilter = document.getElementById('statusFilter');
const listEl   = document.getElementById('list');
let currentUser=null, myProfile=null, currentTab='reports';

document.getElementById('go-register').onclick = ()=>{document.getElementById('card-register').style.display='block'}
document.getElementById('go-login').onclick    = ()=>{document.getElementById('card-register').style.display='none'}

document.getElementById('btn-login').onclick = async ()=>{
  loginMsg.textContent='';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value.trim();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error){ loginMsg.textContent = error.message; return; }
  currentUser = data.user;
  await afterLogin();
};

document.getElementById('btn-register').onclick = async ()=>{
  regMsg.textContent='';
  const email = document.getElementById('r-email').value.trim();
  const password = document.getElementById('r-pass').value.trim();
  const username = document.getElementById('r-username').value.trim();
  const role = document.getElementById('r-role').value;
  try{
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) throw error;
    const uid = data.user?.id;
    const { error: e2 } = await sb.from('staff_profiles')
      .insert({ user_id: uid, email, username, role, approved: false });
    if (e2) throw e2;
    regMsg.className='kz-ok';
    regMsg.textContent='✅ Cuenta creada. Espera aprobación de un Admin.';
  }catch(err){ regMsg.className='kz-error'; regMsg.textContent=err.message || String(err); }
};

document.getElementById('btn-logout').onclick = async ()=>{
  await sb.auth.signOut(); location.reload();
};

async function afterLogin(){
  // perfil
  const { data: prof, error } = await sb.from('staff_profiles')
    .select('*').eq('user_id', currentUser.id).maybeSingle();
  if (error){ loginMsg.textContent = error.message; return; }
  if (!prof){ loginMsg.textContent = 'Tu cuenta no tiene perfil de staff. Regístrate primero.'; return; }
  if (!prof.approved){ loginMsg.textContent = 'Tu cuenta está pendiente de aprobación.'; return; }

  myProfile = prof;
  who.textContent = prof.username;
  myrole.textContent = prof.role;

  scrAuth.style.display='none';
  scrPanel.style.display='block';
  load();
}

document.querySelectorAll('.kz-tab').forEach(btn=>{
  btn.onclick=()=>{ document.querySelectorAll('.kz-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); currentTab=btn.dataset.tab; load(); }
});
document.getElementById('btn-reload').onclick=load;
statusFilter.onchange=load;

async function load(){
  panelMsg.textContent=''; listEl.innerHTML='Cargando...';
  try{
    if (currentTab==='users'){ return loadUsers(); }
    const table = currentTab==='support' ? 'support_tickets' : 'reports';
    let q = sb.from(table).select('*').order('created_at',{ascending:false});
    if (statusFilter.value) q = q.eq('status', statusFilter.value);
    const { data, error } = await q;
    if (error) throw error;
    listEl.innerHTML = data.map(renderItem).join('');
    bindActions(table);
  }catch(err){ listEl.innerHTML=''; panelMsg.textContent = err.message || String(err); }
}

function renderItem(r){
  const statusClass = r.status==='cerrado' ? 'green' : (r.status==='en_progreso' ? 'yellow':'gray');
  return `
    <div class="kz-item" data-id="${r.id}">
      <h4>${r.status.toUpperCase()} <span class="kz-badge ${statusClass}">${r.status}</span></h4>
      <div class="kz-muted">${new Date(r.created_at).toLocaleString()}</div>
      ${r.reporter_nick ? `<p><b>${r.reporter_nick}</b> reportó a <b>${r.accused_nick}</b></p>` : `<p><b>${r.nick}</b> envió un ticket</p>`}
      <p><b>Email:</b> <span class="kz-email">${r.player_email||r.email}</span></p>
      ${r.mode ? `<p><b>Modo:</b> ${r.mode} · <b>Tipo:</b> ${r.rtype}</p>` : `<p><b>Tipo:</b> ${r.question_type||r.ttype||''}</p>`}
      ${r.evidence_url ? `<p><b>Evidencia:</b> <a target="_blank" href="${r.evidence_url}">${r.evidence_url}</a></p>`:''}
      <p>${(r.description||'').replaceAll('<','&lt;')}</p>
      ${r.updated_by_name ? `<p class="kz-muted">Último cambio: ${r.updated_by_name}</p>`:''}
      <div class="kz-actions">
        <select class="kz-select set-status" style="width:auto">
          <option value="">Cambiar estado…</option>
          <option value="sin_leer">Sin leer</option>
          <option value="en_progreso">En progreso</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <button class="kz-btn reply">Responder</button>
        <button class="kz-btn sec del">Eliminar</button>
      </div>
    </div>
  `;
}

function bindActions(table){
  document.querySelectorAll('.set-status').forEach(sel=>{
    sel.onchange = async (e)=>{
      const id = e.target.closest('.kz-item').dataset.id;
      const status = e.target.value; if(!status) return;
      const { error } = await sb.from(table).update({
        status, updated_by: currentUser.id, updated_by_name: myProfile.username
      }).eq('id', id);
      if (error) alert(error.message); else load();
    };
  });

  document.querySelectorAll('.del').forEach(btn=>{
    btn.onclick = async (e)=>{
      const id = e.target.closest('.kz-item').dataset.id;
      if (!confirm('¿Eliminar?')) return;
      const { error } = await sb.from(table).delete().eq('id', id);
      if (error) alert(error.message); else load();
    };
  });

  document.querySelectorAll('.reply').forEach(btn=>{
    btn.onclick = async (e)=>{
      const card = e.target.closest('.kz-item');
      const id = card.dataset.id;
      const email = card.querySelector('.kz-email').textContent.trim();
      const subject = prompt('Asunto','Kronos Zone — Respuesta');
      if (!subject) return;
      const message = prompt('Mensaje','Gracias por tu reporte. Estamos revisando.');
      if (!message) return;
      const nextStatus = confirm('¿Marcar EN PROGRESO? Aceptar=Sí / Cancelar=No') ? 'en_progreso' : undefined;

      const { error } = await sb.functions.invoke('send-reply',{
        body:{
          to: email,
          subject, message,
          report_id: id,
          table: table,
          status: nextStatus,
          replied_by: myProfile.username,
          from_alias: document.getElementById('fromAlias').value
        }
      });
      if (error) alert(error.message); else { alert('Enviado'); load(); }
    };
  });
}

async function loadUsers(){
  // solo admin/admin_plus
  const { data: me } = await sb.from('staff_profiles').select('role').eq('user_id', currentUser.id).single();
  if (!me || !['admin','admin_plus'].includes(me.role)){ listEl.innerHTML='Solo Admin'; return; }

  const { data, error } = await sb.from('staff_profiles').select('*').order('created_at',{ascending:false});
  if (error){ listEl.innerHTML='Error cargando usuarios'; return; }

  listEl.innerHTML = data.map(u=>`
    <div class="kz-item">
      <p><b>${u.username}</b> — ${u.email} — <span class="kz-badge gray">${u.role}</span> — ${u.approved ? 'Aprobado ✅' : 'Pendiente ⏳'}</p>
      <div class="kz-actions">
        <button class="kz-btn sec approve" data-id="${u.user_id}">Aprobar</button>
        <button class="kz-btn sec deny" data-id="${u.user_id}">Eliminar</button>
        <select class="kz-select chgrole" data-id="${u.user_id}" style="width:auto">
          <option value="mod" ${u.role==='mod'?'selected':''}>Mod</option>
          <option value="mod_plus" ${u.role==='mod_plus'?'selected':''}>Mod+</option>
          <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
          <option value="admin_plus" ${u.role==='admin_plus'?'selected':''}>Admin+</option>
        </select>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.approve').forEach(b=>b.onclick=async()=>{
    const id=b.dataset.id; const { error } = await sb.from('staff_profiles').update({approved:true}).eq('user_id',id);
    if (error) alert(error.message); else loadUsers();
  });
  document.querySelectorAll('.deny').forEach(b=>b.onclick=async()=>{
    const id=b.dataset.id; if(!confirm('¿Eliminar?'))return;
    const { error } = await sb.from('staff_profiles').delete().eq('user_id',id);
    if (error) alert(error.message); else loadUsers();
  });
  document.querySelectorAll('.chgrole').forEach(s=>s.onchange=async(e)=>{
    const id=s.dataset.id; const role=e.target.value;
    const { error } = await sb.from('staff_profiles').update({role}).eq('user_id',id);
    if (error) alert(error.message); else loadUsers();
  });
}

// Sesión persistente si ya estaba logueado
sb.auth.getUser().then(async ({ data })=>{
  if (data.user){ currentUser=data.user; await afterLogin(); }
});
</script>
