/**
 * Backend do Quiz Resolume — Vídeo Engenharia (banco de dados = Planilha Google)
 * Um único endpoint (Web App) que:
 *   ?action=save   -> grava a nota do aluno (chamado automaticamente pelo quiz)
 *   ?action=global -> devolve o resultado GERAL anônimo (para o Painel do Instrutor)
 *   ?action=admin&pass=SENHA -> devolve as notas INDIVIDUAIS (só o admin)
 * Todas as respostas usam JSONP (parâmetro callback) para evitar problemas de CORS.
 *
 * INSTALAÇÃO:
 * 1) Crie uma Planilha Google. Copie o ID da URL (entre /d/ e /edit) e cole em SHEET_ID.
 * 2) Defina a senha do administrador em ADMIN_PASS.
 * 3) Extensões > Apps Script: apague tudo e cole este arquivo.
 * 4) Implantar > Nova implantação > "App da Web".
 *    Executar como: Eu.  Quem tem acesso: Qualquer pessoa.
 * 5) Copie a URL do App da Web e cole:
 *    - em CONFIG.BACKEND_URL no quiz.html
 *    - no campo "URL do backend" do painel_instrutor.html e do admin.html
 */
const SHEET_ID  = "COLE_O_ID_DA_PLANILHA_AQUI";
const ADMIN_PASS = "veng2026";  // TROQUE a senha do administrador

function doGet(e){
  const p = e.parameter || {};
  let out;
  try{
    if      (p.action === "save")   out = save(p);
    else if (p.action === "global") out = global_();
    else if (p.action === "admin")  out = (p.pass === ADMIN_PASS) ? {ok:true, rows: rows()} : {error:"senha"};
    else if (p.action === "reset")  out = (p.pass === ADMIN_PASS) ? reset_() : {error:"senha"};
    else out = {error:"acao invalida"};
  }catch(err){ out = {error:String(err)}; }
  const body = JSON.stringify(out);
  const cb = p.callback;
  return ContentService.createTextOutput(cb ? cb + "(" + body + ")" : body)
     .setMimeType(cb ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
function doPost(e){ return doGet(e); }

function sheet(){
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName("Respostas");
  if(!sh){ sh = ss.insertSheet("Respostas"); }
  if(sh.getLastRow() === 0)
    sh.appendRow(["Data/Hora","Nome","Turma","Etapa","Acertos","Total","Percentual"]);
  return sh;
}
function save(p){
  sheet().appendRow([new Date(), p.nome||"", p.turma||"", p.etapa||"", Number(p.score||0), Number(p.total||0), Number(p.pct||0)]);
  return {ok:true};
}
function rows(){
  const sh = sheet(); const last = sh.getLastRow(); if(last<2) return [];
  const v = sh.getRange(2,1,last-1,7).getValues();
  return v.map(r=>({data: Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "dd/MM HH:mm"),
    nome:r[1], turma:r[2], etapa:String(r[3]), score:r[4], total:r[5], pct:r[6]}));
}
function reset_(){
  const sh = sheet(); const last = sh.getLastRow();
  if(last > 1) sh.deleteRows(2, last-1);   // apaga tudo, mantém o cabeçalho
  return {ok:true};
}
function global_(){
  const all = rows(); const res = {};
  ["1","2"].forEach(et=>{
    const g = all.filter(r=>String(r.etapa)===et);
    if(!g.length){ res[et] = {count:0, avg:0, dist:{alto:0,medio:0,baixo:0}}; return; }
    let sum=0, alto=0, medio=0, baixo=0;
    g.forEach(r=>{ const pct=Number(r.pct); sum+=pct; if(pct>=80)alto++; else if(pct>=60)medio++; else baixo++; });
    res[et] = {count:g.length, avg:Math.round(sum/g.length), dist:{alto,medio,baixo}};
  });
  return res;
}
