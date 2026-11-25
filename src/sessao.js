/* Interface: fluxo principal "registrar uma sessão" em 4 etapas. */
function newSess(){w={s:1,data:new Date().toISOString().slice(0,10),nivel:1,resumo:'',npcs:[],locais:[],mis:{}};view='sessao';draw()}
function wiz(){
const s=w.s,bar=`<div class="steps">${[1,2,3,4].map(i=>`<span class="${i<=s?'on':''}"></span>`).join('')}</div>`;
let b='';
if(s==1)b=`<h3>Dados da sessão</h3><label>Data *</label><input type="date" id="wd" value="${esc(w.data)}"><label>Nível do grupo</label><input type="number" id="wn" min="1" max="20" value="${w.nivel}"><label>Resumo *</label><textarea id="wr">${esc(w.resumo)}</textarea>`;
if(s==2)b=`<h3>NPCs e locais que apareceram</h3>${ck('npcs','NPCs')}${ck('locais','Locais')}`;
if(s==3)b=`<h3>Missões que avançaram</h3>`+(db.missoes.length?db.missoes.map(m=>`<label>${esc(m.titulo)} <span class="mut">(atual: ${m.status})</span></label><select onchange="w.mis[${m.id}]=this.value"><option value="">Sem alteração</option>${ST.filter(x=>x!=m.status).map(x=>`<option ${w.mis[m.id]==x?'selected':''}>${x}</option>`).join('')}</select>`).join(''):'<p class="mut">Nenhuma missão cadastrada. Você pode seguir.</p>');
if(s==4){const mm=Object.keys(w.mis).filter(k=>w.mis[k]);
b=`<h3>Revisão</h3><p><b>${fdate(w.data)}</b> · nível ${w.nivel}</p><p>${esc(w.resumo)}</p><p>NPCs: ${w.npcs.map(i=>esc(nm('npcs',i))).join(', ')||'nenhum'}</p><p>Locais: ${w.locais.map(i=>esc(nm('locais',i))).join(', ')||'nenhum'}</p><p>Missões: ${mm.map(k=>esc(nm('missoes',k))+' → '+w.mis[k]).join('; ')||'nenhuma alteração'}</p>`}
return `<h2>Nova sessão <span class="mut" style="font-size:15px">— etapa ${s} de 4</span></h2>${bar}<div class="card">${b}<div class="acts"><button class="btn" onclick="next()">${s==4?'Salvar sessão':'Avançar'}</button>${s>1?'<button class="btn s" onclick="back()">Voltar</button>':''}<button class="btn d" onclick="go(\'painel\')">Cancelar</button></div></div>`}
function ck(l,t){return `<label>${t}</label>`+(db[l].length?db[l].map(o=>`<label class="ck"><input type="checkbox" ${w[l].includes(o.id)?'checked':''} onchange="tg('${l}',${o.id},this.checked)">${esc(o.nome)}</label>`).join(''):`<p class="mut">Nenhum cadastrado.</p>`)}
function tg(l,id,on){w[l]=on?[...w[l],id]:w[l].filter(x=>x!=id)}
function rd(){if(w.s==1){w.data=$('#wd').value;w.nivel=Number($('#wn').value)||1;w.resumo=$('#wr').value.trim()}}
function back(){rd();w.s--;draw()}
function next(){
rd();
if(w.s==1){const v=Regras.validarSessao(w);if(!v.ok){say(v.erro,1);draw();return}}
if(w.s<4){w.s++;draw();return}
Regras.aplicarSessao(db,w,uid());
save();w=null;view='diario';say('Sessão salva no diário.');draw()}
