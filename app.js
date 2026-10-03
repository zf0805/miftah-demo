/* Miftah — démonstration locale. Aucune donnée réelle, aucun service bancaire. */
(function(){
'use strict';
const KEY='miftah-demo-v1', SESSION='miftah-session-v1';
const ACCOUNTS={
  agent:{id:'agent',label:'Chargé de crédit',name:'Ahmed Bensalem',initials:'AB',username:'ahmed.bensalem',password:'Miftah2026!',icon:'✍',agency:'Casablanca Centre'},
  manager:{id:'manager',label:'Responsable bancaire',name:'Khalid Amrani',initials:'KA',username:'k.amrani',password:'Miftah2026!',icon:'✓',agency:'Hay Hassani'},
  public:{id:'public',label:'Vérification publique',name:'Visiteur',initials:'V',icon:'◇'}
};
const PARTNERS=['Banque tierce','Tribunal','Notaire','Service des Mines','Conservation foncière','Douanes','Particulier'];
const STATUS={draft:'Brouillon',submitted:'En attente de décision',approved:'Approuvée · signatures en cours',issued:'Attestation émise',rejected:'Rejetée'};
const NAV={
 agent:[['dashboard','Vue d’ensemble','⌂'],['cases','Mes dossiers','▤'],['certificates','Attestations','◇'],['activity','Journal d’activité','◷']],
 manager:[['dashboard','Vue d’ensemble','⌂'],['queue','File de décision','▤'],['history','Décisions','✓'],['analytics','Statistiques','▥']],
 public:[['verify','Vérifier un document','◇'],['examples','Références de test','▤'],['guide','Comment ça marche','◎']]
};
const seed=[
 {id:'MLV-2026-0142',name:'Karim Mansouri',kind:'particulier',identity:'AB123456',email:'karim.mansouri@example.test',phone:'0600000142',credit:'Crédit automobile',creditRef:'DOS-2024-00789',collateral:'Véhicule',assetRef:'1234 A 56',amount:125000,paid:'2026-09-12',docs:['Quittance de remboursement','Attestation de clôture'],status:'issued',agentSigned:true,managerSigned:true,created:'2026-09-15T10:10:00',updated:'2026-09-18T14:20:00',motif:'',code:'MF-26-KM142'},
 {id:'MLV-2026-0141',name:'Fatima Zahra El Alami',kind:'particulier',identity:'EE789012',email:'fatima.elalami@example.test',phone:'0600000141',credit:'Crédit immobilier',creditRef:'DOS-2023-01741',collateral:'Bien immobilier',assetRef:'TF-11478/C',amount:780000,paid:'2026-09-19',docs:['Quittance de remboursement','Attestation de clôture'],status:'submitted',agentSigned:false,managerSigned:false,created:'2026-09-22T09:30:00',updated:'2026-09-23T15:00:00',motif:'',code:''},
 {id:'MLV-2026-0140',name:'SARL Al Nour',kind:'entreprise',identity:'RC-00789',email:'contact@alnour.example.test',phone:'0520000140',credit:'Crédit professionnel',creditRef:'DOS-2022-00441',collateral:'Bien immobilier',assetRef:'TF-12004/A',amount:450000,paid:'2026-08-29',docs:['Quittance de remboursement','Attestation de clôture'],status:'issued',agentSigned:true,managerSigned:true,created:'2026-09-01T10:00:00',updated:'2026-09-04T11:15:00',motif:'',code:'MF-26-AN140'},
 {id:'MLV-2026-0138',name:'SCI Palmier Verde',kind:'entreprise',identity:'RC-01234',email:'contact@palmier.example.test',phone:'0520000138',credit:'Crédit immobilier',creditRef:'DOS-2021-01822',collateral:'Bien immobilier',assetRef:'TF-12345/C',amount:1200000,paid:'2026-09-08',docs:['Quittance de remboursement','Attestation de clôture'],status:'approved',agentSigned:true,managerSigned:false,created:'2026-09-14T09:00:00',updated:'2026-09-16T16:30:00',motif:'',code:'MF-26-PV138'},
 {id:'MLV-2026-0136',name:'Mohamed Benchrif',kind:'particulier',identity:'CD456789',email:'mohamed.benchrif@example.test',phone:'0600000136',credit:'Crédit automobile',creditRef:'DOS-2025-00271',collateral:'Véhicule',assetRef:'4567 B 23',amount:87000,paid:'2026-09-01',docs:['Quittance de remboursement'],status:'rejected',agentSigned:false,managerSigned:false,created:'2026-09-06T08:10:00',updated:'2026-09-08T12:40:00',motif:'Attestation de clôture manquante.',code:''},
 {id:'MLV-2026-0144',name:'Hassan Alaoui',kind:'particulier',identity:'FF654321',email:'hassan.alaoui@example.test',phone:'0600000144',credit:'Crédit automobile',creditRef:'DOS-2025-01910',collateral:'Véhicule',assetRef:'7890 C 11',amount:52000,paid:'2026-09-26',docs:[],status:'draft',agentSigned:false,managerSigned:false,created:'2026-09-28T11:00:00',updated:'2026-09-28T11:00:00',motif:'',code:''}
];
function defaultData(){return {version:1,cases:JSON.parse(JSON.stringify(seed)),events:[
 {caseId:'MLV-2026-0142',text:'Attestation émise pour Karim Mansouri',who:'Khalid Amrani',at:'2026-09-18T14:20:00'},
 {caseId:'MLV-2026-0138',text:'Dossier approuvé, cosignature en attente',who:'Khalid Amrani',at:'2026-09-16T16:30:00'},
 {caseId:'MLV-2026-0141',text:'Dossier transmis au responsable',who:'Ahmed Bensalem',at:'2026-09-23T15:00:00'}
]};}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.version===1&&Array.isArray(d.cases)&&Array.isArray(d.events))return d;}catch(_){}return defaultData();}
let db=load();
function save(){localStorage.setItem(KEY,JSON.stringify(db));render();}
let session=null;try{session=JSON.parse(sessionStorage.getItem(SESSION));}catch(_){}
if(!session||!ACCOUNTS[session.role])session=null;
let selectedRole='agent',view='',currentId='',query='',filter='all',verifyQuery='',verifyState='idle',formStep=0,formDraft=null,editingId=null,toastTimer=0;
const $=id=>document.getElementById(id);
const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>new Intl.NumberFormat('fr-MA').format(Number(value)||0)+' MAD';
const date=value=>value?new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value)):'—';
const normal=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const byId=id=>db.cases.find(c=>c.id===id);
const icon=key=>({draft:'◌',submitted:'◷',approved:'✓',issued:'◇',rejected:'×'}[key]||'•');
function badge(status){return '<span class="badge '+esc(status)+'">'+icon(status)+' &nbsp;'+esc(STATUS[status]||status)+'</span>';}
function now(){return new Date().toISOString();}
function addEvent(c,text){db.events.unshift({caseId:c.id,text,who:session.role==='agent'?ACCOUNTS.agent.name:session.role==='manager'?ACCOUNTS.manager.name:'Démonstration',at:now()});db.events=db.events.slice(0,80);}
function toast(text){const el=$('toast');el.textContent=text;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3500);}
function setSession(role,partner){session={role,partner:partner||PARTNERS[0]};sessionStorage.setItem(SESSION,JSON.stringify(session));view=role==='public'?'verify':'dashboard';currentId='';render();}
function signOut(){session=null;sessionStorage.removeItem(SESSION);render();}
function renderLogin(){
 $('login-screen').hidden=false;$('workspace').hidden=true;$('switch-account').hidden=true;
 $('role-choices').innerHTML=Object.values(ACCOUNTS).map(a=>'<button class="role-choice '+(selectedRole===a.id?'active':'')+'" data-role="'+a.id+'" type="button"><span class="role-icon">'+a.icon+'</span><b>'+esc(a.label)+'</b></button>').join('');
 $('login-form').hidden=selectedRole==='public';$('public-login').hidden=selectedRole!=='public';
 if(selectedRole!=='public'){$('login-user').value=ACCOUNTS[selectedRole].username;$('login-password').value=ACCOUNTS[selectedRole].password;$('login-hint').innerHTML='Accès fictif prérempli : <code>'+esc(ACCOUNTS[selectedRole].username)+'</code> / <code>'+esc(ACCOUNTS[selectedRole].password)+'</code>';}
 $('partner-kind').innerHTML=PARTNERS.map(x=>'<option>'+esc(x)+'</option>').join('');
}
function renderShell(){
 $('login-screen').hidden=true;$('workspace').hidden=false;$('switch-account').hidden=false;
 const role=session.role,acc=ACCOUNTS[role];
 $('space-name').textContent=role==='public'?session.partner.toUpperCase():acc.label.toUpperCase();
 $('switch-account').textContent=(role==='public'?session.partner:acc.name)+'  ⌄';
 const pending=db.cases.filter(c=>c.status==='submitted').length;
 $('main-nav').innerHTML=NAV[role].map(n=>'<button class="nav-btn '+(view===n[0]?'active':'')+'" data-nav="'+n[0]+'" type="button"><span class="nav-icon">'+n[2]+'</span><span class="nav-text">'+n[1]+'</span>'+(n[0]==='queue'&&pending?'<span class="nav-count">'+pending+'</span>':'')+'</button>').join('');
}
function setPage(crumb,title,subtitle,action){$('breadcrumb').textContent=crumb;$('page-title').textContent=title;$('page-subtitle').textContent=subtitle;$('page-action').innerHTML=action||'';}
function render(){if(!session){renderLogin();return;}renderShell();if(currentId){renderDetail();return;}if(session.role==='public'){if(view==='examples')renderExamples();else if(view==='guide')renderGuide();else renderVerify();return;}if(view==='dashboard')renderDashboard();else if(view==='cases'||view==='queue'||view==='history'||view==='certificates')renderList();else if(view==='analytics')renderAnalytics();else if(view==='activity')renderActivity();else {view='dashboard';renderDashboard();}}
function kpi(label,value,note,tone){return '<div class="card stat '+(tone||'')+'"><span class="label">'+label+'</span><strong>'+value+'</strong><small>'+note+'</small></div>';}
function rows(items){if(!items.length)return '<div class="empty">Aucun dossier pour cette sélection.</div>';return '<div class="table-wrap"><table class="data-table"><thead><tr><th>Référence</th><th>Titulaire</th><th>Engagement</th><th>Statut</th><th>Action</th></tr></thead><tbody>'+items.map(c=>'<tr><td><span class="ref">'+esc(c.id)+'</span></td><td class="name-cell"><b>'+esc(c.name)+'</b><small>'+esc(c.identity)+'</small></td><td>'+money(c.amount)+'<br><small style="color:var(--muted)">'+esc(c.credit)+'</small></td><td>'+badge(c.status)+'</td><td><button class="text-button" data-open="'+esc(c.id)+'" type="button">Ouvrir →</button></td></tr>').join('')+'</tbody></table></div>';}
function recent(){return db.events.slice(0,5).map(e=>'<div class="activity-item"><span class="activity-dot">↗</span><div><b>'+esc(e.text)+'</b><p>'+esc(e.who)+' · '+date(e.at)+'</p></div></div>').join('');}
function renderDashboard(){
 const role=session.role,pending=db.cases.filter(c=>c.status==='submitted'),issued=db.cases.filter(c=>c.status==='issued'),draft=db.cases.filter(c=>c.status==='draft'),approved=db.cases.filter(c=>c.status==='approved');
 const title=role==='agent'?'Bonjour Ahmed,':'Bonjour Khalid,';
 setPage('Tableau de bord',title,role==='agent'?'Vos mainlevées, de la préparation à l’attestation.':'Les dossiers à décider et les attestations à cosigner.',role==='agent'?'<button class="btn primary" data-new type="button">＋ Nouvelle mainlevée</button>':'<button class="btn primary" data-nav="queue" type="button">Traiter la file →</button>');
 $('view').innerHTML='<div class="stats">'+kpi('Dossiers suivis',db.cases.length,'portefeuille de démonstration','teal')+kpi('En attente',pending.length,'à examiner par le responsable','red')+kpi('Attestations émises',issued.length,'vérifiables publiquement','blue')+kpi('Signatures en cours',approved.length,'avant émission définitive','')+'</div><div class="cols"><div class="card"><div class="card-pad card-head"><h2>'+(role==='agent'?'Dossiers récents':'File de décision')+'</h2><button class="text-button" data-nav="'+(role==='agent'?'cases':'queue')+'" type="button">Voir tout →</button></div>'+rows((role==='agent'?db.cases:pending).slice().sort((a,b)=>b.updated.localeCompare(a.updated)).slice(0,5))+'</div><div><div class="card card-pad"><div class="card-head"><h2>Activité récente</h2></div><div class="activity-list">'+recent()+'</div></div><div class="soft-panel section-gap"><h3>Un circuit, trois regards</h3><p>La transmission rend le dossier disponible au responsable. Après approbation et deux signatures simulées, l’attestation devient vérifiable par référence.</p></div></div></div>';
}
function listConfig(){const r=session.role;
 if(view==='queue')return ['File de décision','Demandes transmises','Examinez les justificatifs et motivez chaque décision.',db.cases.filter(c=>c.status==='submitted')];
 if(view==='history')return ['Historique','Décisions prises','Consultez les dossiers approuvés et rejetés.',db.cases.filter(c=>['approved','issued','rejected'].includes(c.status))];
 if(view==='certificates')return ['Attestations','À signer et émises','Suivez les signatures et ouvrez les attestations.',db.cases.filter(c=>['approved','issued'].includes(c.status))];
 return ['Portefeuille','Mes dossiers','Préparez, transmettez et suivez vos mainlevées.',db.cases];}
function renderList(){
 const cfg=listConfig();
 setPage(cfg[0],cfg[1],cfg[2],session.role==='agent'?'<button class="btn primary" data-new type="button">＋ Nouvelle mainlevée</button>':view==='history'?'<button class="btn secondary" data-export type="button">↓ Exporter CSV</button>':'');
 const list=cfg[3].filter(c=>(filter==='all'||c.status===filter)&&(!query||normal([c.id,c.name,c.identity,c.credit,c.assetRef].join(' ')).includes(normal(query)))).sort((a,b)=>b.updated.localeCompare(a.updated));
 $('view').innerHTML='<div class="filter-bar"><input id="case-search" class="search-input" type="search" placeholder="Référence, nom, CIN, bien…" value="'+esc(query)+'" aria-label="Rechercher un dossier"><select id="status-filter" class="filter-select" aria-label="Filtrer par statut"><option value="all">Tous les statuts</option>'+Object.entries(STATUS).map(x=>'<option value="'+x[0]+'" '+(filter===x[0]?'selected':'')+'>'+x[1]+'</option>').join('')+'</select></div><div class="card"><div class="card-pad card-head"><h2>'+list.length+' dossier'+(list.length>1?'s':'')+'</h2><small>Cliquer pour consulter</small></div>'+rows(list)+'</div><p class="footer-note">Les recherches et filtres portent sur le jeu de démonstration de ce navigateur.</p>';
}
function renderActivity(){setPage('Traçabilité','Journal d’activité','Chaque étape simulée laisse une trace consultable.','');$('view').innerHTML='<div class="card card-pad"><div class="timeline">'+db.events.map(e=>'<div class="timeline-item"><b>'+esc(e.text)+'</b><small>'+esc(e.caseId)+' · '+esc(e.who)+' · '+date(e.at)+'</small></div>').join('')+'</div></div>';}
function renderAnalytics(){const total=db.cases.length;const counts=Object.keys(STATUS).map(s=>[s,db.cases.filter(c=>c.status===s).length]);setPage('Pilotage','Statistiques','Une lecture en temps réel du jeu de démonstration.','<button class="btn secondary" data-export type="button">↓ Exporter CSV</button>');$('view').innerHTML='<div class="stats">'+kpi('Total',total,'dossiers')+kpi('En attente',counts[1][1],'à décider','red')+kpi('Émises',counts[3][1],'attestations','teal')+kpi('Montant traité',money(db.cases.reduce((a,c)=>a+Number(c.amount||0),0)),'crédits concernés','blue')+'</div><div class="card card-pad"><div class="card-head"><h2>Répartition par étape</h2></div><div class="metrics-bars">'+counts.map(x=>'<div class="metric-row"><span>'+STATUS[x[0]]+'</span><span class="bar"><i style="width:'+Math.round(x[1]/Math.max(total,1)*100)+'%"></i></span><b>'+x[1]+'</b></div>').join('')+'</div></div>';}

function detailActions(c){
 if(session.role==='agent'){
  if(c.status==='draft'||c.status==='rejected')return '<button class="btn secondary" data-edit="'+esc(c.id)+'" type="button">Modifier</button> <button class="btn primary" data-submit="'+esc(c.id)+'" type="button">Transmettre au responsable →</button>';
  if(c.status==='approved'&&!c.agentSigned)return '<button class="btn primary" data-sign-agent="'+esc(c.id)+'" type="button">Signer l’attestation</button>';
 }
 if(session.role==='manager'){
  if(c.status==='submitted')return '<button class="btn primary" data-approve="'+esc(c.id)+'" type="button">✓ Approuver</button> <button class="btn danger" data-reject="'+esc(c.id)+'" type="button">× Rejeter</button>';
  if(c.status==='approved'&&!c.managerSigned&&c.agentSigned)return '<button class="btn primary" data-sign-manager="'+esc(c.id)+'" type="button">Cosigner et émettre</button>';
 }
 if(c.status==='issued')return '<button class="btn secondary" data-certificate="'+esc(c.id)+'" type="button">Voir l’attestation →</button>';
 return '';
}
function renderDetail(){
 const c=byId(currentId);if(!c){currentId='';render();return;}
 setPage('Dossier · '+c.id,c.name,c.id+' · créé le '+date(c.created),'<button class="btn ghost" data-back type="button">← Retour</button>');
 let alert='';
 if(c.status==='rejected')alert='<div class="error-box"><b>Rejet motivé :</b> '+esc(c.motif)+'</div>';
 if(c.status==='approved')alert='<div class="warning-box">Décision favorable. La signature de l’initiateur puis la cosignature du responsable sont nécessaires avant la vérification publique.</div>';
 if(c.status==='issued')alert='<div class="success-box">Attestation émise. Référence de contrôle : <b>'+esc(c.code)+'</b></div>';
 const signs=c.status==='approved'||c.status==='issued'?'<div class="section-title">Signature de l’attestation</div><div class="doc-list"><div class="doc-item">✍ &nbsp; Ahmed Bensalem <span>'+(c.agentSigned?'✓ Signée':'En attente')+'</span></div><div class="doc-item">✍ &nbsp; Khalid Amrani <span>'+(c.managerSigned?'✓ Cosignée':'En attente')+'</span></div></div>':'';
 $('view').innerHTML='<div class="detail-grid"><div class="card card-pad">'+alert+'<div class="detail-hero"><div><div class="eyebrow">'+esc(c.id)+'</div><h2>'+esc(c.name)+'</h2><p>'+esc(c.kind==='entreprise'?'Personne morale':'Personne physique')+' · '+esc(c.identity)+'</p></div>'+badge(c.status)+'</div><div class="section-title">Débiteur</div><dl class="info-grid"><div class="info"><dt>Identifiant CIN / RC</dt><dd>'+esc(c.identity)+'</dd></div><div class="info"><dt>Contact fictif</dt><dd>'+esc(c.email||'—')+'</dd></div></dl><div class="section-title">Engagement remboursé</div><dl class="info-grid"><div class="info"><dt>Nature du crédit</dt><dd>'+esc(c.credit)+'</dd></div><div class="info"><dt>Montant initial</dt><dd>'+money(c.amount)+'</dd></div><div class="info"><dt>Référence dossier crédit</dt><dd>'+esc(c.creditRef)+'</dd></div><div class="info"><dt>Date de remboursement final</dt><dd>'+date(c.paid)+'</dd></div><div class="info"><dt>Garantie à libérer</dt><dd>'+esc(c.collateral)+'</dd></div><div class="info"><dt>Immatriculation / titre</dt><dd>'+esc(c.assetRef)+'</dd></div></dl><div class="section-title">Justificatifs déclarés</div><div class="doc-list">'+(c.docs.length?c.docs.map(d=>'<div class="doc-item">▧ &nbsp; '+esc(d)+' <span>Déclaré présent</span></div>').join(''):'<div class="doc-item">Aucun justificatif déclaré</div>')+'</div>'+signs+'</div><div><div class="card card-pad"><div class="card-head"><h2>Prochaine étape</h2></div><p style="color:var(--muted);font-size:12px;line-height:1.7">'+({draft:'Complétez le dossier puis transmettez-le.',submitted:'Le responsable consulte les éléments et rend une décision.',approved:'Terminez les deux signatures simulées pour émettre l’attestation.',issued:'Le document peut être contrôlé avec sa référence.',rejected:'Corrigez le motif puis soumettez à nouveau.'}[c.status])+'</p><div class="decision-actions">'+detailActions(c)+'</div></div><div class="card card-pad section-gap"><div class="card-head"><h2>Traçabilité</h2></div><div class="timeline">'+db.events.filter(e=>e.caseId===c.id).map(e=>'<div class="timeline-item"><b>'+esc(e.text)+'</b><small>'+esc(e.who)+' · '+date(e.at)+'</small></div>').join('')+'<div class="timeline-item"><b>Dossier créé</b><small>'+date(c.created)+'</small></div></div></div></div></div>';
}
function verifyLink(ref){const u=new URL(window.location.href);u.search='?verify='+encodeURIComponent(ref);u.hash='';return u.href;}
function renderVerify(){
 setPage('Portail de contrôle','Vérifier une mainlevée','Une recherche par référence unique ou identité. Seules les attestations émises sont reconnues.','');
 const candidate=db.cases.find(c=>c.status==='issued'&&(normal(c.id)===normal(verifyQuery)||normal(c.code)===normal(verifyQuery)||normal(c.identity)===normal(verifyQuery)));
 let result='';
 if(verifyState==='idle')result='<div class="verify-result"><span class="verify-icon">◇</span><h2>Une réponse claire, en quelques secondes.</h2><p>Saisissez une référence MLV, un code de contrôle ou un identifiant CIN / RC fictif pour consulter le statut d’une attestation.</p></div>';
 else if(!candidate)result='<div class="verify-result"><span class="verify-icon" style="color:var(--red)">×</span><h2>Aucune attestation valide</h2><p>Aucun document émis ne correspond à cette saisie dans cette démonstration. Vérifiez la référence. Un dossier simplement approuvé reste invisible jusqu’à sa cosignature.</p></div>';
 else result='<div class="verify-result" style="text-align:left;align-items:stretch"><span class="badge issued" style="align-self:flex-start">✓ Attestation authentique · démo</span><h2>'+esc(candidate.name)+'</h2><div class="info-grid"><dl class="info"><dt>Référence MLV</dt><dd>'+esc(candidate.id)+'</dd></dl><dl class="info"><dt>Code de contrôle</dt><dd>'+esc(candidate.code)+'</dd></dl><dl class="info"><dt>Crédit</dt><dd>'+esc(candidate.credit)+'</dd></dl><dl class="info"><dt>Bien libéré</dt><dd>'+esc(candidate.assetRef)+'</dd></dl><dl class="info"><dt>Émission</dt><dd>'+date(candidate.updated)+'</dd></dl></div><div class="qr" id="verify-qr"></div><div class="decision-actions"><button class="btn secondary" data-certificate="'+esc(candidate.id)+'" type="button">Ouvrir l’attestation</button><button class="btn ghost" data-copy="'+esc(candidate.id)+'" type="button">Copier le lien</button></div></div>';
 $('view').innerHTML='<div class="verify-hero"><div class="eyebrow light">Portail ouvert aux partenaires</div><h2>Contrôler avant d’agir</h2><p>Banques, tribunaux, notaires, services des Mines, conservation foncière, douanes et particuliers disposent de la même preuve consultable.</p></div><div class="verify-layout"><div class="card card-pad"><div class="card-head"><h2>Rechercher</h2></div><label class="field">Référence ou identifiant<input id="verify-input" value="'+esc(verifyQuery)+'" placeholder="MLV-2026-0142" autocomplete="off"></label><button class="btn primary wide section-gap" data-verify type="button">Vérifier <span>→</span></button><div class="soft-panel section-gap"><h3>Référence de démonstration</h3><p>Essayez <button class="text-button" data-sample="MLV-2026-0142" type="button">MLV-2026-0142</button> ou le code <b>MF-26-KM142</b>.</p></div></div><div class="card">'+result+'</div></div><p class="footer-note">En production, la vérification devrait être appuyée par un serveur et un registre d’émission. Cette page utilise uniquement des données fictives locales.</p>';
 if(candidate&&verifyState!=='idle')drawQR('verify-qr',verifyLink(candidate.id));
}
function drawQR(id,text){const el=$(id);if(!el)return;el.innerHTML='';if(window.QRCode){new window.QRCode(el,{text,width:132,height:132,colorDark:'#123a3b',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M});}else{el.innerHTML='<span style="font-size:11px;color:var(--muted)">QR indisponible hors connexion. Le lien de vérification reste utilisable.</span>';}}
function renderExamples(){setPage('Découvrir','Références de test','Des attestations fictives pour explorer le portail.','');const issued=db.cases.filter(c=>c.status==='issued');$('view').innerHTML='<div class="card card-pad"><div class="card-head"><h2>Documents émis</h2></div><p class="sub" style="color:var(--muted)">Ces références renvoient un résultat authentique dans la démonstration.</p>'+issued.map(c=>'<div class="doc-item"><span class="ref">'+esc(c.id)+'</span> &nbsp; '+esc(c.name)+' <button class="text-button" data-sample="'+esc(c.id)+'" type="button">Vérifier →</button></div>').join('')+'</div><div class="soft-panel section-gap"><h3>Test négatif</h3><p>Essayez <button class="text-button" data-sample="MLV-2026-9999" type="button">MLV-2026-9999</button> pour voir la réponse quand aucune attestation n’est émise.</p></div>';}
function renderGuide(){setPage('Comprendre','Comment ça marche','Le circuit métier repris du POC d’origine.','');$('view').innerHTML='<div class="card card-pad"><div class="timeline">'+[['01','Initiation','Le chargé renseigne le débiteur, le crédit remboursé et les justificatifs.'],['02','Décision','Le responsable lit le dossier, puis approuve ou rejette avec un motif.'],['03','Génération','L’approbation produit une référence de contrôle.'],['04','Attestation','Le chargé signe, le responsable cosigne : l’attestation est émise.'],['05','Vérification','Un tiers saisit la référence et consulte uniquement les documents émis.']].map(x=>'<div class="timeline-item"><b>'+x[0]+' · '+x[1]+'</b><small>'+x[2]+'</small></div>').join('')+'</div></div>';}
function renderCertificate(c){const link=verifyLink(c.id);setPage('Attestation · '+c.id,'Attestation de mainlevée',c.status==='issued'?'Document fictif émis · vérifiable':'Aperçu du dossier approuvé','<button class="btn ghost no-print" data-back type="button">← Retour au dossier</button>');$('view').innerHTML='<div class="toolbar no-print" style="margin-bottom:15px"><button class="btn primary" data-print type="button">↧ Imprimer / PDF</button><button class="btn secondary" data-copy="'+esc(c.id)+'" type="button">Copier le lien de vérification</button></div><article class="attestation"><div class="attestation-top"><div class="brand"><img src="./logo.svg" width="35" height="35" alt=""><span><strong>Miftah</strong><small>Attestation de démonstration</small></span></div>'+badge(c.status)+'</div><div class="eyebrow" style="margin-top:22px">Référence '+esc(c.id)+'</div><h2>Attestation de mainlevée</h2><p>Il est attesté, dans le cadre de cette démonstration, que le crédit <b>'+esc(c.credit)+'</b> référencé <b>'+esc(c.creditRef)+'</b> au nom de <b>'+esc(c.name)+'</b> a été déclaré intégralement remboursé le <b>'+date(c.paid)+'</b>.</p><p>La garantie portant sur <b>'+esc(c.collateral.toLowerCase())+'</b>, référence <b>'+esc(c.assetRef)+'</b>, peut faire l’objet d’une mainlevée selon le circuit présenté.</p><div class="info-grid"><dl class="info"><dt>Identifiant</dt><dd>'+esc(c.identity)+'</dd></dl><dl class="info"><dt>Montant initial</dt><dd>'+money(c.amount)+'</dd></dl><dl class="info"><dt>Code de vérification</dt><dd>'+esc(c.code||'En attente')+'</dd></dl><dl class="info"><dt>Date d’émission</dt><dd>'+date(c.updated)+'</dd></dl></div><div class="attestation-signs"><div class="signature">Initiateur<b>'+esc(c.agentSigned?'✓ Ahmed Bensalem':'Signature en attente')+'</b></div><div class="signature">Responsable bancaire<b>'+esc(c.managerSigned?'✓ Khalid Amrani':'Cosignature en attente')+'</b></div></div><div class="qr" id="certificate-qr"></div><p style="font-size:10px;color:var(--muted)">Document fictif sans valeur bancaire ou juridique. Vérification : '+esc(link)+'</p></article>';if(c.status==='issued')drawQR('certificate-qr',link);}

function dialogClose(){const d=$('case-dialog');if(d.open)d.close();}
function openForm(id){
 editingId=id||null;const c=id?byId(id):null;
 if(c&&!['draft','rejected'].includes(c.status)){toast('Ce dossier n’est plus modifiable.');return;}
 formDraft=c?JSON.parse(JSON.stringify(c)):{name:'',kind:'particulier',identity:'',email:'',phone:'',credit:'Crédit automobile',creditRef:'',collateral:'Véhicule',assetRef:'',amount:'',paid:'',docs:[]};
 formStep=0;$('dialog-eyebrow').textContent=id?'Corriger le dossier':'Nouvelle mainlevée';$('dialog-title').textContent=id?'Modifier '+id:'Constituer un dossier';renderForm();$('case-dialog').showModal();
}
function field(label,key,type,placeholder,extra){
 const v=formDraft[key]||'';return '<label class="field '+(extra||'')+'">'+label+'<input data-field="'+key+'" type="'+(type||'text')+'" value="'+esc(v)+'" placeholder="'+esc(placeholder||'')+'"></label>';
}
function optionField(label,key,options){
 return '<label class="field">'+label+'<select data-field="'+key+'">'+options.map(x=>'<option '+(formDraft[key]===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label>';
}
function renderForm(){
 const progress='<div class="stepper">'+[0,1,2,3].map(i=>'<span class="'+(i<=formStep?'on':'')+'"></span>').join('')+'</div>';
 let content='';
 if(formStep===0)content='<div class="form-section">01 · Débiteur</div><div class="form-grid">'+optionField('Type de débiteur','kind',['particulier','entreprise'])+field('Nom complet / dénomination','name','text','Ex. Amina Lahlou')+field('CIN / registre de commerce','identity','text','Ex. AB123456')+field('Téléphone fictif','phone','tel','Ex. 0600000000')+field('Email fictif','email','email','Ex. client@example.test','full')+'</div>';
 if(formStep===1)content='<div class="form-section">02 · Crédit et garantie</div><div class="form-grid">'+optionField('Nature du crédit','credit',['Crédit automobile','Crédit immobilier','Crédit consommation','Crédit professionnel'])+field('Référence du crédit','creditRef','text','DOS-2026-00123')+optionField('Garantie à libérer','collateral',['Véhicule','Bien immobilier','Autre garantie'])+field('Immatriculation / titre foncier','assetRef','text','1234 A 56 ou TF-12345/C')+field('Montant initial en MAD','amount','number','125000')+field('Remboursement final','paid','date','')+'</div>';
 if(formStep===2)content='<div class="form-section">03 · Justificatifs</div><p style="color:var(--muted);font-size:12px">Pour cette démo, signalez les pièces disponibles. Aucun fichier réel n’est envoyé ou stocké.</p>'+['Quittance de remboursement','Attestation de clôture'].map(x=>'<label class="check-row"><input type="checkbox" data-doc="'+esc(x)+'" '+(formDraft.docs.includes(x)?'checked':'')+'> <span>'+x+'</span></label>').join('')+'<div class="soft-panel"><h3>Contrôle de complétude</h3><p>Les deux pièces sont requises avant transmission au responsable.</p></div>';
 if(formStep===3)content='<div class="form-section">04 · Récapitulatif</div><div class="info-grid"><dl class="info"><dt>Débiteur</dt><dd>'+esc(formDraft.name)+'</dd></dl><dl class="info"><dt>CIN / RC</dt><dd>'+esc(formDraft.identity)+'</dd></dl><dl class="info"><dt>Crédit</dt><dd>'+esc(formDraft.credit)+'</dd></dl><dl class="info"><dt>Montant</dt><dd>'+money(formDraft.amount)+'</dd></dl><dl class="info"><dt>Garantie</dt><dd>'+esc(formDraft.assetRef)+'</dd></dl><dl class="info"><dt>Pièces</dt><dd>'+formDraft.docs.length+'/2 déclarées</dd></dl></div><div class="warning-box section-gap">L’enregistrement conserve un brouillon. La transmission est une action séparée, depuis le dossier.</div>';
 $('dialog-body').innerHTML=progress+content+'<p class="form-error" id="form-error" role="alert"></p><div class="form-actions"><button class="btn ghost" data-form-back type="button">'+(formStep===0?'Annuler':'← Précédent')+'</button><button class="btn primary" data-form-next type="button">'+(formStep===3?'Enregistrer le dossier':'Continuer →')+'</button></div>';
}
function collectStep(){
 document.querySelectorAll('[data-field]').forEach(el=>formDraft[el.dataset.field]=el.value.trim());
 if(formStep===2)formDraft.docs=Array.from(document.querySelectorAll('[data-doc]:checked')).map(el=>el.dataset.doc);
}
function advanceForm(){
 collectStep();let error='';
 if(formStep===0){if(formDraft.name.length<3)error='Indiquez un nom d’au moins 3 caractères.';else if(formDraft.identity.length<5)error='Indiquez une CIN ou un registre de commerce.';else if(formDraft.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formDraft.email))error='Adresse email invalide.';}
 if(formStep===1){if(formDraft.creditRef.length<5)error='Indiquez la référence du crédit.';else if(formDraft.assetRef.length<3)error='Indiquez la référence de la garantie.';else if(!(Number(formDraft.amount)>0))error='Le montant doit être supérieur à zéro.';else if(!formDraft.paid)error='Indiquez la date de remboursement final.';}
 if(error){$('form-error').textContent=error;return;}
 if(formStep<3){formStep++;renderForm();return;}
 const stamp=now();
 if(editingId){const c=byId(editingId);Object.assign(c,formDraft,{amount:Number(formDraft.amount),status:'draft',motif:'',agentSigned:false,managerSigned:false,code:'',updated:stamp});addEvent(c,'Dossier corrigé et enregistré en brouillon');currentId=c.id;}
 else{const seq=Math.max(144,...db.cases.map(x=>Number(x.id.match(/\d+$/)?.[0]||0)))+1;const c=Object.assign({id:'MLV-2026-'+String(seq).padStart(4,'0'),status:'draft',agentSigned:false,managerSigned:false,motif:'',code:'',created:stamp,updated:stamp},formDraft,{amount:Number(formDraft.amount)});db.cases.unshift(c);addEvent(c,'Nouveau dossier créé en brouillon');currentId=c.id;}
 dialogClose();save();toast('Dossier enregistré. Vous pouvez maintenant le transmettre.');
}
function ensureDocs(c){return c.docs.includes('Quittance de remboursement')&&c.docs.includes('Attestation de clôture');}
function submitCase(id){const c=byId(id);if(session.role!=='agent'||!c||!['draft','rejected'].includes(c.status))return;if(!ensureDocs(c)){toast('Les deux justificatifs doivent être déclarés avant transmission.');return;}c.status='submitted';c.updated=now();c.motif='';addEvent(c,'Dossier transmis au responsable bancaire');save();toast('Dossier transmis dans la file du responsable.');}
function approveCase(id){const c=byId(id);if(session.role!=='manager'||!c||c.status!=='submitted')return;c.status='approved';c.updated=now();c.code='MF-26-'+String(c.id.slice(-4))+'-'+Math.random().toString(36).slice(2,6).toUpperCase();addEvent(c,'Mainlevée approuvée, signatures en attente');save();toast('Décision favorable enregistrée.');}
function rejectDialog(id){const c=byId(id);if(session.role!=='manager'||!c||c.status!=='submitted')return;$('dialog-eyebrow').textContent='Décision responsable';$('dialog-title').textContent='Rejeter '+id;$('dialog-body').innerHTML='<p style="color:var(--muted);font-size:12px">Le motif sera visible dans l’espace du chargé pour permettre la correction.</p><label class="field">Motif détaillé<textarea id="reject-reason" placeholder="Expliquez les pièces ou données à corriger."></textarea></label><p class="form-error" id="form-error" role="alert"></p><div class="form-actions"><button class="btn ghost" data-dialog-cancel type="button">Annuler</button><button class="btn danger" data-confirm-reject="'+esc(id)+'" type="button">Confirmer le rejet</button></div>';$('case-dialog').showModal();}
function rejectCase(id){const c=byId(id),reason=$('reject-reason').value.trim();if(reason.length<8){$('form-error').textContent='Expliquez le motif en au moins 8 caractères.';return;}if(session.role!=='manager'||!c||c.status!=='submitted')return;c.status='rejected';c.motif=reason;c.updated=now();addEvent(c,'Dossier rejeté : '+reason);dialogClose();save();toast('Rejet motivé enregistré.');}
function signCase(id,who){const c=byId(id);if(!c||c.status!=='approved')return;if(who==='agent'&&session.role==='agent'&&!c.agentSigned){c.agentSigned=true;addEvent(c,'Attestation signée par le chargé');}else if(who==='manager'&&session.role==='manager'&&c.agentSigned&&!c.managerSigned){c.managerSigned=true;c.status='issued';addEvent(c,'Attestation cosignée et émise');}else return;c.updated=now();save();toast(c.status==='issued'?'Attestation émise et vérifiable.':'Signature enregistrée, cosignature en attente.');}
function exportCSV(){const head=['Référence','Titulaire','CIN/RC','Crédit','Montant MAD','Garantie','Statut','Motif'];const values=db.cases.map(c=>[c.id,c.name,c.identity,c.credit,c.amount,c.assetRef,STATUS[c.status],c.motif]);const csv='\uFEFF'+[head,...values].map(row=>row.map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='miftah-demo-dossiers.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('Export CSV créé.');}
async function copyLink(id){const link=verifyLink(id);try{await navigator.clipboard.writeText(link);toast('Lien de vérification copié.');}catch(_){toast('Copie indisponible. Lien : '+link);}}
document.addEventListener('click',function(e){
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.role){selectedRole=b.dataset.role;$('login-error').textContent='';renderLogin();return;}
 if(b.dataset.nav){view=b.dataset.nav;currentId='';query='';filter='all';render();return;}
 if(b.dataset.new!==undefined){openForm(null);return;}
 if(b.dataset.open){currentId=b.dataset.open;render();return;}
 if(b.dataset.edit){openForm(b.dataset.edit);return;}
 if(b.dataset.submit){submitCase(b.dataset.submit);return;}
 if(b.dataset.approve){approveCase(b.dataset.approve);return;}
 if(b.dataset.reject){rejectDialog(b.dataset.reject);return;}
 if(b.dataset.confirmReject){rejectCase(b.dataset.confirmReject);return;}
 if(b.dataset.signAgent){signCase(b.dataset.signAgent,'agent');return;}
 if(b.dataset.signManager){signCase(b.dataset.signManager,'manager');return;}
 if(b.dataset.certificate){const c=byId(b.dataset.certificate);if(c&&c.status==='issued')renderCertificate(c);return;}
 if(b.dataset.back!==undefined){if($('page-title').textContent==='Attestation de mainlevée')renderDetail();else{currentId='';render();}return;}
 if(b.dataset.verify!==undefined){verifyQuery=$('verify-input').value.trim();verifyState='searched';renderVerify();return;}
 if(b.dataset.sample){verifyQuery=b.dataset.sample;verifyState='searched';view='verify';render();return;}
 if(b.dataset.copy){copyLink(b.dataset.copy);return;}
 if(b.dataset.print!==undefined){window.print();return;}
 if(b.dataset.export!==undefined){exportCSV();return;}
 if(b.dataset.formBack!==undefined){if(formStep===0)dialogClose();else{collectStep();formStep--;renderForm();}return;}
 if(b.dataset.formNext!==undefined){advanceForm();return;}
 if(b.dataset.dialogCancel!==undefined){dialogClose();return;}
});
$('login-form').addEventListener('submit',function(e){e.preventDefault();const a=ACCOUNTS[selectedRole];if(a&&a.username===$('login-user').value.trim()&&a.password===$('login-password').value){setSession(selectedRole);return;}$('login-error').textContent='Identifiant ou mot de passe de démonstration incorrect.';});
$('public-enter').addEventListener('click',()=>setSession('public',$('partner-kind').value));
$('switch-account').addEventListener('click',signOut);
$('dialog-close').addEventListener('click',dialogClose);
$('reset-demo').addEventListener('click',()=>{if(!window.confirm('Réinitialiser les données fictives de ce navigateur ?'))return;db=defaultData();localStorage.setItem(KEY,JSON.stringify(db));currentId='';view=session.role==='public'?'verify':'dashboard';verifyState='idle';render();toast('Démonstration réinitialisée.');});
document.addEventListener('input',e=>{if(e.target.id==='case-search'){query=e.target.value;const pos=e.target.selectionStart;renderList();$('case-search').focus();$('case-search').setSelectionRange(pos,pos);}});
document.addEventListener('change',e=>{if(e.target.id==='status-filter'){filter=e.target.value;renderList();}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='verify-input'){e.preventDefault();verifyQuery=e.target.value.trim();verifyState='searched';renderVerify();}});
window.addEventListener('storage',e=>{if(e.key===KEY){db=load();render();}});
const direct=new URLSearchParams(window.location.search).get('verify');
if(direct){verifyQuery=direct;verifyState='searched';session={role:'public',partner:'Vérification par lien'};view='verify';}
render();
})();
