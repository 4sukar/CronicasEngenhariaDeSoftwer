const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs"),
  path = require("path");
const { JSDOM } = require("jsdom");
const root = path.join(__dirname, "..");
function abrir() {
  let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  html = html
    .replace(/<link[^>]*googleapis[^>]*>/, "")
    .replace(
      /<script src="([^"]+)"><\/script>/g,
      (m, s) =>
        "<script>" + fs.readFileSync(path.join(root, s), "utf8") + "</script>",
    );
  const w = new JSDOM(html, {
    runScripts: "dangerously",
    url: "http://localhost/",
  }).window;
  w.seed();
  return w;
}
const texto = (w, sel) => w.document.querySelector(sel)?.textContent || "";
test("U01 Painel exibe os dados de exemplo e o botão Nova sessão", () => {
  const w = abrir();
  assert.ok(texto(w, "#app").includes("Nova sessão"));
  assert.ok(texto(w, "#tit").includes("Pedraverde"));
});
test("U02 RF02: lista de NPCs mostra os 2 NPCs cadastrados", () => {
  const w = abrir();
  w.go("npcs");
  assert.strictEqual(w.document.querySelectorAll("#lista .card").length, 2);
});
test("U03 RF10: excluir NPC vinculado a missão é bloqueado com mensagem", () => {
  const w = abrir();
  w.go("npcs");
  w.del("npcs", 3);
  assert.ok(texto(w, ".msg.er").includes("Não é possível excluir"));
  assert.strictEqual(w.document.querySelectorAll("#lista .card").length, 2);
});
test("U04 RF10: excluir NPC sem vínculo funciona", () => {
  const w = abrir();
  w.go("npcs");
  w.del("npcs", 4);
  assert.strictEqual(w.document.querySelectorAll("#lista .card").length, 1);
});
test("U05 HU01-CA2: sessão sem resumo mostra erro e não avança", () => {
  const w = abrir();
  w.newSess();
  w.next();
  assert.ok(texto(w, ".msg.er").includes("Informe a data e o resumo"));
  assert.ok(texto(w, "#app").includes("etapa 1 de 4"));
});
test("U06 HU01 / fluxo principal: registrar sessão do início ao fim", () => {
  const w = abrir();
  w.newSess();
  w.document.querySelector("#wr").value = "O grupo explorou a mina.";
  w.next();
  w.tg("npcs", 3, true);
  w.tg("locais", 1, true);
  w.next();
  w.eval("w.mis[5]='Em andamento'");
  w.next();
  assert.ok(texto(w, "#app").includes("Revisão"));
  w.next();
  assert.ok(texto(w, ".msg").includes("Sessão salva no diário"));
  assert.ok(texto(w, "#app").includes("O grupo explorou a mina."));
  assert.ok(texto(w, "#app").includes("Mirela"));
  assert.strictEqual(w.eval("db.missoes[0].status"), "Em andamento");
});
test("U07 HU03: filtro de missões por status", () => {
  const w = abrir();
  w.go("missoes");
  w.eval("q.f='Concluída'");
  w.lista();
  assert.ok(texto(w, "#lista").includes("Nenhum resultado"));
});
test("U08 RNF02: dados ficam gravados no armazenamento do navegador", () => {
  const w = abrir();
  assert.strictEqual(
    JSON.parse(w.localStorage.getItem("cronica")).npcs.length,
    2,
  );
});
test("U09 RF06: nível 99 na tela mostra erro e não avança", () => {
  const w = abrir();
  w.newSess();
  w.document.querySelector("#wr").value = "x";
  w.document.querySelector("#wn").value = "99";
  w.next();
  assert.ok(texto(w, ".msg.er").includes("entre 1 e 20"));
  assert.ok(texto(w, "#app").includes("etapa 1 de 4"));
});
test("U10 Diário: excluir uma sessão a remove da lista e do armazenamento", () => {
  const w = abrir();
  w.newSess();
  w.document.querySelector("#wr").value = "Sessão para excluir";
  w.next();
  w.next();
  w.next();
  w.next();
  assert.ok(texto(w, "#app").includes("Sessão para excluir"));
  w.delSess(w.eval("db.sessoes[0].id"));
  assert.ok(!texto(w, "#app").includes("Sessão para excluir"));
  assert.strictEqual(
    JSON.parse(w.localStorage.getItem("cronica")).sessoes.length,
    0,
  );
});
test('U11 Concordância: tela de missões usa "Nova missão" e NPCs usa "Novo NPC"', () => {
  const w = abrir();
  w.go("missoes");
  assert.ok(texto(w, "#app").includes("Nova missão"));
  assert.ok(!texto(w, "#app").includes("Novo missão"));
  w.go("npcs");
  assert.ok(texto(w, "#app").includes("Novo NPC"));
});
