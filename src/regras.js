const Regras = (() => {
  function emUso(db, ent, id) {
    if (ent === 'npcs') return db.missoes.some(m => m.npc == id) || db.sessoes.some(s => s.npcs.includes(id));
    if (ent === 'locais') return db.npcs.some(n => n.local == id) || db.missoes.some(m => m.local == id) || db.sessoes.some(s => s.locais.includes(id));
    return false;
  }
  function validarSessao(s) {
    if (!s.data || !String(s.resumo || '').trim()) return { ok: false, erro: 'Informe a data e o resumo da sessão para continuar.' };
    const n = Number(s.nivel);
    if (!Number.isInteger(n) || n < 1 || n > 20) return { ok: false, erro: 'O nível do grupo deve ser um número inteiro entre 1 e 20.' };
    return { ok: true };
  }
  function aplicarSessao(db, s, id) {
    const ms = Object.keys(s.mis || {}).filter(k => s.mis[k]).map(k => ({ id: Number(k), status: s.mis[k] }));
    ms.forEach(x => { const m = db.missoes.find(m => m.id == x.id); if (m) m.status = x.status; });
    const sessao = { id, data: s.data, nivel: s.nivel, resumo: s.resumo, npcs: s.npcs, locais: s.locais, missoes: ms };
    db.sessoes.push(sessao);
    return sessao;
  }
  function filtrar(lista, q, campo) {
    const t = (q.txt || '').toLowerCase();
    return lista.filter(o => (!t || (o.nome || o.titulo).toLowerCase().includes(t)) && (!q.f || o[campo] == q.f));
  }
  function ordenarDiario(ss) { return [...ss].sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id); }
  return { emUso, validarSessao, aplicarSessao, filtrar, ordenarDiario };
})();
if (typeof module !== 'undefined') module.exports = Regras;
