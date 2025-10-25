---
title: "Reportes"
permalink: /reportes/
layout: single
classes: wide
---

<form id="report-form">
  <div class="form-group"><label>Tu Nick de Minecraft</label><input id="reporter_nick" required></div>
  <div class="form-group"><label>Nick del reportado</label><input id="accused_nick" required></div>
  <div class="form-group"><label>Tu correo electrónico</label><input id="player_email" type="email" required></div>
  <div class="form-group">
    <label>Modalidad</label>
    <select id="mode" required>
      <option>Coliseo PVP</option><option>Full PVP</option><option>Survival</option>
    </select>
  </div>
  <div class="form-group">
    <label>Tipo</label>
    <select id="rtype" required>
      <option>Hacks</option><option>Bugs</option><option>Toxicidad</option><option>Otros</option>
    </select>
  </div>
  <div class="form-group"><label>Descripción del reporte</label><textarea id="description" rows="5" required></textarea></div>
  <div class="form-group"><label>Pruebas (archivo máx. 20MB) — opcional</label><input id="evidence_file" type="file" accept="image/*,video/*"></div>
  <div class="form-group"><label>Link a prueba (opcional)</label><input id="evidence_url" placeholder="https://..."></div>
  <div class="form-group"><label>Tu Discord (opcional)</label><input id="reporter_discord" placeholder="usuario#0000"></div>

  <button class="btn btn--primary" type="submit">Enviar reporte</button>
  <p id="msg"></p>
  <pre id="dbg" style="white-space:pre-wrap;font-size:.9rem;opacity:.8"></pre>
</form>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const sb = supabase.createClient("TU_SUPABASE_URL","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6Y2ptbWdibGNvaHl6cnpzcXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTA5ODIsImV4cCI6MjA3NjcyNjk4Mn0.774kuEsyQouXklSW0DvLU44u0u7umH9x1f4tERC-YOk");
  const form = document.getElementById('report-form');
  const msg  = document.getElementById('msg');
  const dbg  = document.getElementById('dbg');

  async function uploadEvidence(file) {
    if (!file) return { path: null };
    if (file.size > 20 * 1024 * 1024) throw new Error("Archivo supera 20MB");
    const filename = `${crypto.randomUUID()}_${file.name.replace(/[^a-z0-9.\-_]/gi,'_')}`;
    const { data, error } = await sb.storage.from('evidence').upload(filename, file, { upsert:false });
    if (error) throw error;
    const { data: pub } = sb.storage.from('evidence').getPublicUrl(filename);
    return { path: data.path, publicUrl: pub.publicUrl };
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = "Enviando...";
    dbg.textContent = "";
    try {
      let evPath = null, evUrl = (document.getElementById('evidence_url').value.trim() || null);
      const file = document.getElementById('evidence_file').files[0];
      if (file) {
        const up = await uploadEvidence(file);
        evPath = up.path;
        if (!evUrl) evUrl = up.publicUrl;
      }

      const payload = {
        reporter_nick: document.getElementById('reporter_nick').value.trim(),
        accused_nick:  document.getElementById('accused_nick').value.trim(),
        player_email:  document.getElementById('player_email').value.trim(),
        mode:          document.getElementById('mode').value,
        rtype:         document.getElementById('rtype').value,
        description:   document.getElementById('description').value.trim(),
        evidence_url:  evUrl,
        evidence_path: evPath,
        reporter_discord: document.getElementById('reporter_discord').value.trim() || null
      };

      const { data, error } = await sb.from('reports').insert(payload).select('id');
      if (error) throw error;
      msg.textContent = "✅ ¡Reporte enviado!";
      dbg.textContent = "ID: " + data[0].id;
      form.reset();
    } catch (err) {
      msg.textContent = "❌ Error al enviar";
      dbg.textContent = String(err.message || err);
    }
  });
</script>
