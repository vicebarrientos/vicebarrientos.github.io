---
title: "Reportes"
permalink: /reportes/
layout: single
classes: wide
---

<form id="report-form">
  <div class="form-group">
    <label>Nick</label>
    <input type="text" id="player_nick" required>
  </div>
  <div class="form-group">
    <label>Correo</label>
    <input type="email" id="player_email" required>
  </div>
  <div class="form-group">
    <label>Categoría</label>
    <select id="category" required>
      <option value="cheats">Cheats</option>
      <option value="abuso_chat">Abuso de chat</option>
      <option value="bug">Bug</option>
      <option value="otro">Otro</option>
    </select>
  </div>
  <div class="form-group">
    <label>Modalidad/Servidor</label>
    <select id="server_mode" required>
      <option>Survival</option>
      <option>SkyPvP</option>
      <option>Minijuegos</option>
      <option>Otro</option>
    </select>
  </div>
  <div class="form-group">
    <label>Descripción</label>
    <textarea id="description" rows="5" required></textarea>
  </div>
  <div class="form-group">
    <label>Evidencia (URL a imagen/video)</label>
    <input type="url" id="evidence_url" placeholder="https://...">
  </div>
  <button type="submit" class="btn btn--primary">Enviar reporte</button>
  <p id="report-msg"></p>
</form>

<script src="https://esm.sh/@supabase/supabase-js@2"></script>
<script>
  const supabaseUrl = "TU_SUPABASE_URL";
  const supabaseAnon = "TU_SUPABASE_ANON_KEY";
  const sb = supabase.createClient(supabaseUrl, supabaseAnon);

  const form = document.getElementById('report-form');
  const msg  = document.getElementById('report-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = "Enviando...";
    const data = {
      player_nick: document.getElementById('player_nick').value.trim(),
      player_email: document.getElementById('player_email').value.trim(),
      category: document.getElementById('category').value,
      server_mode: document.getElementById('server_mode').value,
      description: document.getElementById('description').value.trim(),
      evidence_url: document.getElementById('evidence_url').value.trim() || null
    };
    const { error } = await sb.from('reports').insert(data);
    if (error) {
      msg.textContent = "Error al enviar: " + error.message;
    } else {
      msg.textContent = "¡Reporte enviado! Gracias por tu ayuda.";
      form.reset();
    }
  });
</script>