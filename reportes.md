---
title: "Reportes"
permalink: /reportes/
layout: single
---

<style>
/* estilos básicos del form */
.kz-form{max-width:900px;margin:0 auto}
.kz-field{margin:12px 0}
.kz-label{display:block;margin-bottom:6px;opacity:.9}
.kz-input,.kz-select,.kz-textarea{
  width:100%;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.12);
  background:#0f1320;color:#fff
}
.kz-textarea{min-height:160px;resize:vertical}
.kz-btn{padding:12px 16px;border-radius:12px;border:0;background:#ff9a3c;color:#1b1f2a;font-weight:700;cursor:pointer}
.kz-msg{margin-top:12px}
.kz-msg.ok{color:#74d99f}
.kz-msg.err{color:#ff6b6b;white-space:pre-wrap}
</style>

<div class="kz-form">
  <h2>Reportar jugador</h2>

  <div class="kz-field">
    <label class="kz-label">Tu Nick de Minecraft *</label>
    <input id="r_nick" class="kz-input" placeholder="Tu nick">
  </div>

  <div class="kz-field">
    <label class="kz-label">Nick del reportado *</label>
    <input id="r_accused" class="kz-input" placeholder="Jugador reportado">
  </div>

  <div class="kz-field">
    <label class="kz-label">Tu correo electrónico *</label>
    <input id="r_email" class="kz-input" placeholder="tunick@correo.com">
  </div>

  <div class="kz-field">
    <label class="kz-label">Modalidad/Servidor *</label>
    <select id="r_mode" class="kz-select">
      <option value="Coliseo PVP">Coliseo PVP</option>
      <option value="Full PVP">Full PVP</option>
      <option value="Survival">Survival</option>
    </select>
  </div>

  <div class="kz-field">
    <label class="kz-label">Tipo *</label>
    <select id="r_type" class="kz-select">
      <option value="Hacks">Hacks</option>
      <option value="Bugs">Bugs</option>
      <option value="Toxicidad">Toxicidad</option>
      <option value="Otros">Otros</option>
    </select>
  </div>

  <div class="kz-field">
    <label class="kz-label">Descripción del reporte *</label>
    <textarea id="r_desc" class="kz-textarea" placeholder="Cuéntanos qué pasó…"></textarea>
  </div>

  <div class="kz-field">
    <label class="kz-label">Pruebas (archivo máx. 20MB) — opcional</label>
    <input id="r_file" type="file" class="kz-input" accept="image/*,video/*,.mp4,.mov,.mkv,.webm,.png,.jpg,.jpeg">
  </div>

  <div class="kz-field">
    <label class="kz-label">Link a prueba (opcional)</label>
    <input id="r_link" class="kz-input" placeholder="https://…">
  </div>

  <div class="kz-field">
    <label class="kz-label">Tu Discord (opcional)</label>
    <input id="r_discord" class="kz-input" placeholder="usuario#0000">
  </div>

  <button id="r_send" class="kz-btn">Enviar reporte</button>
  <div id="r_msg" class="kz-msg"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
// ==== CONFIGURA ESTO ====
const sb = supabase.createClient("TU_SUPABASE_URL","TU_SUPABASE_ANON_KEY");
const BUCKET = 'evidence'; // nombre del bucket de Storage

// refs
const $ = id => document.getElementById(id);
const btn = $('r_send');
const msg = $('r_msg');

function showErr(t){ msg.className='kz-msg err'; msg.textContent=t; }
function showOk(t){ msg.className='kz-msg ok'; msg.textContent=t; }

btn.addEventListener('click', async ()=>{
  msg.textContent=''; msg.className='kz-msg';

  const reporter_nick = $('r_nick').value.trim();
  const accused_nick  = $('r_accused').value.trim();
  const player_email  = $('r_email').value.trim();
  const mode          = $('r_mode').value;
  const rtype         = $('r_type').value;
  const description   = $('r_desc').value.trim();
  const linkInput     = $('r_link').value.trim();
  const reporter_discord = $('r_discord').value.trim();
  const fileInput = $('r_file');

  // Validaciones mínimas que coinciden con RLS
  if (reporter_nick.length < 3) return showErr('Tu nick es muy corto.');
  if (accused_nick.length  < 3) return showErr('El nick reportado es muy corto.');
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(player_email)) return showErr('Correo inválido.');
  if (description.length  < 6) return showErr('Descripción demasiado corta.');

  btn.disabled = true; btn.textContent = 'Enviando…';

  let evidence_path = null;
  let evidence_url  = linkInput || null; // si el usuario pegó link, úsalo

  try{
    // Si NO hay link y SÍ hay archivo, subimos archivo
    if (!evidence_url && fileInput.files.length){
      const f = fileInput.files[0];
      if (f.size > 20*1024*1024){
        throw new Error('El archivo supera 20MB. Sube un link en su lugar.');
      }
      const filename = `${crypto.randomUUID()}_${f.name}`;
      const up = await sb.storage.from(BUCKET).upload(filename, f, { upsert:false });
      if (up.error) throw up.error;
      evidence_path = up.data.path;

      // URL pública
      const pub = sb.storage.from(BUCKET).getPublicUrl(evidence_path);
      evidence_url = pub.data.publicUrl;
    }

    // Insertar el reporte
    const ins = await sb.from('reports').insert({
      reporter_nick, accused_nick, player_email,
      mode, rtype, description,
      evidence_url, evidence_path,
      reporter_discord
    }).select('id').single();

    if (ins.error){
      // si falló el insert, borra el archivo subido para no dejar basura
      if (evidence_path) await sb.storage.from(BUCKET).remove([evidence_path]);
      throw ins.error;
    }

    showOk('¡Reporte enviado! Gracias por tu ayuda.');
    // limpiar form
    $('r_nick').value=''; $('r_accused').value=''; $('r_email').value='';
    $('r_desc').value=''; $('r_link').value=''; $('r_discord').value='';
    $('r_file').value='';

  }catch(err){
    showErr(err.message || String(err));
  }finally{
    btn.disabled = false; btn.textContent = 'Enviar reporte';
  }
});
</script>
