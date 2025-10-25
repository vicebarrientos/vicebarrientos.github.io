---
title: "Soporte"
permalink: /soporte/
layout: single
classes: wide
---

<form id="ticket-form">
  <div class="form-group"><label>Tu Nick</label><input id="nick" required></div>
  <div class="form-group"><label>Tu correo</label><input id="email" type="email" required></div>
  <div class="form-group"><label>Tipo de ayuda</label><input id="ttype" placeholder="p.ej. Problemas de login" required></div>
  <div class="form-group"><label>Descripción</label><textarea id="description" rows="5" required></textarea></div>
  <div class="form-group"><label>Tu Discord (opcional)</label><input id="discord"></div>
  <button class="btn btn--primary" type="submit">Enviar</button>
  <p id="msg"></p><pre id="dbg" style="white-space:pre-wrap;font-size:.9rem;opacity:.8"></pre>
</form>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const sb = supabase.createClient("https://azcjmmgblcohyzrzsqtr.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6Y2ptbWdibGNvaHl6cnpzcXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTA5ODIsImV4cCI6MjA3NjcyNjk4Mn0.774kuEsyQouXklSW0DvLU44u0u7umH9x1f4tERC-YOk");
  const f = document.getElementById('ticket-form'), msg=document.getElementById('msg'), dbg=document.getElementById('dbg');
  f.addEventListener('submit', async (e)=>{
    e.preventDefault(); msg.textContent="Enviando..."; dbg.textContent="";
    try{
      const payload = {
        nick: document.getElementById('nick').value.trim(),
        email: document.getElementById('email').value.trim(),
        ttype: document.getElementById('ttype').value.trim(),
        description: document.getElementById('description').value.trim(),
        discord: document.getElementById('discord').value.trim() || null
      };
      const { data, error } = await sb.from('support_tickets').insert(payload).select('id');
      if (error) throw error;
      msg.textContent = "✅ Ticket enviado"; dbg.textContent = "ID: " + data[0].id; f.reset();
    }catch(err){ msg.textContent="❌ Error"; dbg.textContent=String(err.message||err); }
  });
</script>
