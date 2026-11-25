function opts(f, v) {
  if (f.ref)
    return (
      (f.nb ? "" : '<option value="">—</option>') +
      db[f.ref]
        .map(
          (o) =>
            `<option value="${o.id}" ${o.id == v ? "selected" : ""}>${esc(o.nome || o.titulo)}</option>`,
        )
        .join("")
    );
  return (
    (f.nb ? "" : '<option value="">—</option>') +
    f.sel
      .map((o) => `<option ${o == v ? "selected" : ""}>${o}</option>`)
      .join("")
  );
}
function crud(en) {
  const E = ENT[en];
  let h = `<div class="top"><h2>${E.tp}</h2><button class="btn" onclick="edit='new';draw()">${E.fem ? "Nova" : "Novo"} ${E.lc}</button></div>`;
  if (edit) {
    const o = edit == "new" ? {} : db[en].find((x) => x.id == edit);
    h +=
      `<div class="card"><h3>${edit == "new" ? (E.fem ? "Nova" : "Novo") : "Editar"} ${E.lc}</h3><form onsubmit="return saveEnt(event,'${en}')">` +
      E.f
        .map((f) => {
          const v =
            o[f.k] != null ? o[f.k] : f.k == "status" ? "Disponível" : "";
          const c = f.area
            ? `<textarea name="${f.k}">${esc(v)}</textarea>`
            : f.sel || f.ref
              ? `<select name="${f.k}">${opts(f, v)}</select>`
              : `<input name="${f.k}" value="${esc(v)}">`;
          return `<label>${f.l}${f.req ? " *" : ""}</label>${c}`;
        })
        .join("") +
      `<div class="acts"><button class="btn">Salvar</button><button type="button" class="btn s" onclick="edit=null;draw()">Cancelar</button></div></form></div>`;
  }
  h += `<div class="row"><input id="busca" placeholder="Buscar por nome" value="${esc(q.txt)}" oninput="q.txt=this.value;lista()" aria-label="Buscar"><select id="flt" onchange="q.f=this.value;lista()" aria-label="${E.fl}"><option value="">${E.fl}: todos</option>${opts({ sel: E.f.find((f) => f.k == E.flt).sel, nb: 1 }, q.f)}</select></div><div id="lista" style="margin-top:12px"></div>`;
  return h;
}
function lista() {
  const en = view,
    E = ENT[en],
    el = $("#lista");
  if (!el) return;
  const r = Regras.filtrar(db[en], q, E.flt);
  el.innerHTML = r.length
    ? r
        .map((o) => {
          const ch = E.f
            .filter(
              (f) =>
                f.k != "nome" && f.k != "titulo" && f.k != "desc" && o[f.k],
            )
            .map(
              (f) =>
                `<span class="chip">${f.ref ? esc(nm(f.ref, o[f.k]) || "(removido)") : esc(o[f.k])}</span>`,
            )
            .join("");
          const st =
            en == "missoes"
              ? `<select style="width:auto" onchange="setSt(${o.id},this.value)" aria-label="Status">${opts({ sel: ST, nb: 1 }, o.status)}</select>`
              : "";
          return `<div class="card"><div class="top"><div><h3>${esc(o.nome || o.titulo)}</h3>${ch}${o.desc ? `<div class="mut">${esc(o.desc)}</div>` : ""}</div>${st}</div><div class="acts"><button class="btn s sm" onclick="edit=${o.id};draw()">Editar</button><button class="btn d sm" onclick="del('${en}',${o.id})">Excluir</button></div></div>`;
        })
        .join("")
    : `<div class="card mut">${db[en].length ? "Nenhum resultado para esse filtro." : `${E.fem ? "Nenhuma" : "Nenhum"} ${E.lc} ${E.fem ? "cadastrada" : "cadastrado"}. Use “${E.fem ? "Nova" : "Novo"} ${E.lc}” para começar.`}</div>`;
}
function saveEnt(e, en) {
  e.preventDefault();
  const E = ENT[en],
    f = new FormData(e.target),
    o = {};
  for (const d of E.f) {
    let v = f.get(d.k).trim();
    if (d.req && !v) {
      say(`Preencha o campo “${d.l}”.`, 1);
      draw();
      return false;
    }
    o[d.k] = d.ref ? Number(v) || "" : v;
  }
  if (edit == "new") {
    o.id = uid();
    db[en].push(o);
  } else
    Object.assign(
      db[en].find((x) => x.id == edit),
      o,
    );
  edit = null;
  save();
  say(`${E.t} ${E.fem ? "salva" : "salvo"}.`);
  draw();
  return false;
}
function setSt(id, v) {
  db.missoes.find((m) => m.id == id).status = v;
  save();
  say("Status atualizado.");
  draw();
}
function used(en, id) {
  return Regras.emUso(db, en, id);
}
function del(en, id) {
  if (used(en, id)) {
    say(
      `Não é possível excluir: este ${ENT[en].lc} está vinculado a missões, NPCs ou sessões. Remova os vínculos antes.`,
      1,
    );
    draw();
    return;
  }
  db[en] = db[en].filter((o) => o.id != id);
  save();
  say(`${ENT[en].t} ${ENT[en].fem ? "excluída" : "excluído"}.`);
  draw();
}
