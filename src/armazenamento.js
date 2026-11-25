const Armazenamento = (() => {
  const CHAVE = 'cronica';
  const vazio = () => ({ campanha: { nome: '', desc: '', inicio: '' }, npcs: [], locais: [], missoes: [], sessoes: [], seq: 1 });
  const padrao = () => { try { return localStorage; } catch (e) { return null; } };
  function carregar(store = padrao()) {
    try { return JSON.parse(store.getItem(CHAVE)) || vazio(); } catch (e) { return vazio(); }
  }
  function salvar(db, store = padrao()) {
    try { store.setItem(CHAVE, JSON.stringify(db)); return true; } catch (e) { return false; }
  }
  return { carregar, salvar, vazio };
})();
if (typeof module !== 'undefined') module.exports = Armazenamento;
