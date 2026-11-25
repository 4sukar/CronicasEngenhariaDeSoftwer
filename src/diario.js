function delSess(id) {
  db.sessoes = db.sessoes.filter((s) => s.id != id);
  save();
  say("Sessão excluída.");
  draw();
}
function diario() {
  const r = Regras.ordenarDiario(db.sessoes);
  return (
    `<div class="top"><h2>Diário da campanha</h2><button class="btn" onclick="newSess()">Nova sessão</button></div>` +
    (r.length
      ? r
          .map(
            (s, i) =>
              `<details class="card" ${i == 0 ? "open" : ""}><summary>${fdate(s.data)} <span class="mut" style="font-weight:400">· nível ${s.nivel}</span></summary><p>${esc(s.resumo)}</p><p><b>NPCs:</b> ${s.npcs.map((i) => esc(nm("npcs", i) || "(removido)")).join(", ") || "—"}</p><p><b>Locais:</b> ${s.locais.map((i) => esc(nm("locais", i) || "(removido)")).join(", ") || "—"}</p><p><b>Missões:</b> ${s.missoes.map((m) => esc(nm("missoes", m.id) || "(removida)") + " → " + m.status).join("; ") || "—"}</p><button class="btn d sm" onclick="delSess(${s.id})">Excluir sessão</button></details>`,
          )
          .join("")
      : '<div class="card mut">Nenhuma sessão registrada. Use “Nova sessão” para registrar a primeira.</div>')
  );
}
