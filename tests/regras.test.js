const { test } = require("node:test");
const assert = require("node:assert");
const Regras = require("../src/regras.js");
const Armazenamento = require("../src/armazenamento.js");
const base = () => ({
  npcs: [
    { id: 3, nome: "Mirela", local: 1 },
    { id: 4, nome: "Dalen", local: "" },
  ],
  locais: [
    { id: 1, nome: "Vila" },
    { id: 2, nome: "Taverna" },
  ],
  missoes: [
    { id: 5, titulo: "A mina", status: "Disponível", npc: 3, local: 1 },
    { id: 6, titulo: "O corvo", status: "Em andamento", npc: "", local: "" },
  ],
  sessoes: [],
});
test("T01 RF10: NPC vinculado a missão está em uso", () =>
  assert.strictEqual(Regras.emUso(base(), "npcs", 3), true));
test("T02 RF10: NPC sem vínculos não está em uso", () =>
  assert.strictEqual(Regras.emUso(base(), "npcs", 4), false));
test("T03 RF10: local vinculado a NPC está em uso", () =>
  assert.strictEqual(Regras.emUso(base(), "locais", 1), true));
test("T04 RF06: sessão sem resumo é inválida", () =>
  assert.strictEqual(
    Regras.validarSessao({ data: "2026-11-01", resumo: "  " }).ok,
    false,
  ));
test("T05 RF06: sessão sem data é inválida", () =>
  assert.strictEqual(
    Regras.validarSessao({ data: "", resumo: "x" }).ok,
    false,
  ));
test("T06 RF06: sessão com data, resumo e nível válidos é aceita", () =>
  assert.strictEqual(
    Regras.validarSessao({ data: "2026-11-01", resumo: "x", nivel: 5 }).ok,
    true,
  ));
test("T15 RF06: nível do grupo acima de 20 é rejeitado", () =>
  assert.strictEqual(
    Regras.validarSessao({ data: "2026-11-01", resumo: "x", nivel: 99 }).ok,
    false,
  ));
test("T16 RF06: nível do grupo abaixo de 1 é rejeitado", () =>
  assert.strictEqual(
    Regras.validarSessao({ data: "2026-11-01", resumo: "x", nivel: 0 }).ok,
    false,
  ));
test("T07 RF05: sessão atualiza o status da missão marcada", () => {
  const db = base();
  Regras.aplicarSessao(
    db,
    {
      data: "2026-11-01",
      nivel: 3,
      resumo: "x",
      npcs: [],
      locais: [],
      mis: { 5: "Concluída" },
    },
    10,
  );
  assert.strictEqual(db.missoes[0].status, "Concluída");
  assert.strictEqual(db.missoes[1].status, "Em andamento");
});
test("T08 RF07: sessão guarda NPCs, locais e missões vinculados", () => {
  const db = base();
  const s = Regras.aplicarSessao(
    db,
    {
      data: "2026-11-01",
      nivel: 3,
      resumo: "x",
      npcs: [3],
      locais: [1],
      mis: { 5: "Em andamento" },
    },
    10,
  );
  assert.deepStrictEqual(
    [s.npcs, s.locais, s.missoes],
    [[3], [1], [{ id: 5, status: "Em andamento" }]],
  );
  assert.strictEqual(db.sessoes.length, 1);
});
test("T09 RF09: busca por nome ignora maiúsculas", () =>
  assert.deepStrictEqual(
    Regras.filtrar(base().npcs, { txt: "MIRE" }, "atitude").map((n) => n.id),
    [3],
  ));
test("T10 RF09: filtro por status", () =>
  assert.deepStrictEqual(
    Regras.filtrar(base().missoes, { f: "Em andamento" }, "status").map(
      (m) => m.id,
    ),
    [6],
  ));
test("T11 RF08: diário ordena da sessão mais recente para a mais antiga", () =>
  assert.deepStrictEqual(
    Regras.ordenarDiario([
      { id: 1, data: "2026-10-01" },
      { id: 2, data: "2026-11-01" },
    ]).map((s) => s.id),
    [2, 1],
  ));
test("T12 RNF04: filtrar 500 registros leva menos de 1 segundo", () => {
  const lista = Array.from({ length: 500 }, (_, i) => ({
    id: i,
    nome: "NPC " + i,
    atitude: i % 2 ? "Aliado" : "Hostil",
  }));
  const t0 = Date.now();
  const r = Regras.filtrar(lista, { txt: "npc 4", f: "Aliado" }, "atitude");
  assert.ok(Date.now() - t0 < 1000);
  assert.ok(r.length > 0);
});
test("T13 RNF02: dados gravados podem ser lidos de volta", () => {
  const mem = {};
  const store = {
    getItem: (k) => (k in mem ? mem[k] : null),
    setItem: (k, v) => {
      mem[k] = v;
    },
  };
  const db = Armazenamento.vazio();
  db.npcs.push({ id: 1, nome: "Teste" });
  assert.strictEqual(Armazenamento.salvar(db, store), true);
  assert.deepStrictEqual(Armazenamento.carregar(store).npcs, [
    { id: 1, nome: "Teste" },
  ]);
});
test("T14 RNF02: armazenamento indisponível não quebra o sistema", () => {
  const quebrado = {
    getItem() {
      throw new Error("x");
    },
    setItem() {
      throw new Error("x");
    },
  };
  assert.strictEqual(Armazenamento.salvar({}, quebrado), false);
  assert.deepStrictEqual(Armazenamento.carregar(quebrado).npcs, []);
});
