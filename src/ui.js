const RACAS=['Anão','Elfo','Halfling','Humano','Draconato','Gnomo','Meio-elfo','Meio-orc','Tiefling'];
const ST=['Disponível','Em andamento','Concluída','Falhou'];
const ENT={
npcs:{t:'NPC',lc:'NPC',tp:'NPCs',f:[{k:'nome',l:'Nome',req:1},{k:'raca',l:'Raça',sel:RACAS},{k:'papel',l:'Papel (ex.: ferreiro, vilão)'},{k:'atitude',l:'Atitude',sel:['Aliado','Neutro','Hostil']},{k:'local',l:'Local habitual',ref:'locais'}],flt:'atitude',fl:'Atitude'},
locais:{t:'Local',lc:'local',tp:'Locais',f:[{k:'nome',l:'Nome',req:1},{k:'tipo',l:'Tipo',sel:['Cidade','Masmorra','Taverna','Floresta','Outro']},{k:'desc',l:'Descrição',area:1}],flt:'tipo',fl:'Tipo'},
missoes:{t:'Missão',tp:'Missões',fem:1,lc:'missão',f:[{k:'titulo',l:'Título',req:1},{k:'desc',l:'Descrição',area:1},{k:'status',l:'Status',sel:ST,nb:1},{k:'npc',l:'NPC que oferece',ref:'npcs'},{k:'local',l:'Local relacionado',ref:'locais'}],flt:'status',fl:'Status'}
};
let db,view='painel',edit=null,q={txt:'',f:''},w=null,msg=null;
db=Armazenamento.carregar();
const save=()=>Armazenamento.salvar(db);
const uid=()=>db.seq++;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nm=(l,id)=>{const x=db[l].find(o=>o.id==id);return x?(x.nome||x.titulo):null};
const fdate=d=>d?d.split('-').reverse().join('/'):'';
const $=s=>document.querySelector(s);
function say(t,er){msg={t,er}}
function go(v){view=v;edit=null;q={txt:'',f:''};w=null;msg=null;draw()}
function draw(){
$('#tit').textContent=db.campanha.nome||'Crônica';
$('#sub').textContent=db.campanha.nome?'Crônica — gerenciador de campanhas de D&D':'Gerenciador de campanhas de D&D';
const tabs=[['painel','Painel'],['npcs','NPCs'],['locais','Locais'],['missoes','Missões'],['diario','Diário']];
$('#nav').innerHTML=tabs.map(t=>`<button class="${view==t[0]||(view=='sessao'&&t[0]=='painel')?'on':''}" onclick="go('${t[0]}')">${t[1]}</button>`).join('');
let h=msg?`<div class="msg ${msg.er?'er':''}" role="status">${esc(msg.t)}</div>`:'';
msg=null;
if(view=='painel')h+=painel();else if(view=='sessao')h+=wiz();else if(view=='diario')h+=diario();else h+=crud(view);
$('#app').innerHTML=h;
if(ENT[view])lista();
}
function painel(){
const c=db.campanha,ativas=db.missoes.filter(m=>m.status=='Em andamento').length;
return `<h2>Painel da campanha</h2>
<div class="card"><form onsubmit="return saveCamp(event)"><label>Nome da campanha</label><input name="nome" value="${esc(c.nome)}">
<label>Descrição</label><textarea name="desc">${esc(c.desc)}</textarea>
<label>Data de início</label><input type="date" name="inicio" value="${esc(c.inicio)}">
<div class="acts"><button class="btn">Salvar campanha</button></div></form></div>
<div class="stats"><div class="card"><b>${db.npcs.length}</b>NPCs</div><div class="card"><b>${db.locais.length}</b>Locais</div><div class="card"><b>${ativas}</b>Missões em andamento</div><div class="card"><b>${db.sessoes.length}</b>Sessões</div></div>
<div class="acts"><button class="btn" onclick="newSess()">Nova sessão</button>${db.npcs.length+db.locais.length+db.missoes.length+db.sessoes.length?'':'<button class="btn s" onclick="seed()">Carregar dados de exemplo</button>'}</div>`}
function saveCamp(e){e.preventDefault();const f=new FormData(e.target);db.campanha={nome:f.get('nome').trim(),desc:f.get('desc').trim(),inicio:f.get('inicio')};save();say('Campanha salva.');draw();return false}
function seed(){
db.locais.push({id:1,nome:'Vila de Pedraverde',tipo:'Cidade',desc:'Vila mineradora ao pé das montanhas.'},{id:2,nome:'Taverna do Corvo Cego',tipo:'Taverna',desc:'Ponto de encontro dos aventureiros.'});
db.npcs.push({id:3,nome:'Mirela Ferroquente',raca:'Anão',papel:'Ferreira',atitude:'Aliado',local:1},{id:4,nome:'Dalen Voss',raca:'Humano',papel:'Contrabandista',atitude:'Neutro',local:2});
db.missoes.push({id:5,titulo:'A mina silenciosa',desc:'Os mineiros sumiram na galeria norte.',status:'Disponível',npc:3,local:1});
db.seq=6;if(!db.campanha.nome)db.campanha={nome:'As Minas de Pedraverde',desc:'Campanha de exemplo.',inicio:''};
save();say('Dados de exemplo carregados.');draw()}
