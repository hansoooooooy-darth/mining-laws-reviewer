
const $ = s => document.querySelector(s);
const state = JSON.parse(localStorage.getItem("mineleState")||'{"reviewed":[],"bookmarks":[],"mistakes":[],"stats":{"attempted":0,"correct":0},"flash":{}}');
const save=()=>localStorage.setItem("mineleState",JSON.stringify(state));
const pages=[
 ["home","HOME"],["map","LAW MAP"],["review","REVIEW"],["topics","TOPICS"],["agencies","WHO REGULATES?"],["apply","WHICH LAW APPLIES?"],["timeline","TIMELINE"],["compare","COMPARE"],
 ["standards","STANDARDS"],["numbers","NUMBERS"],["flashcards","FLASHCARDS"],["quiz","QUIZ"],["mock","MOCK EXAM"],
 ["mistakes","MISTAKES"],["bookmarks","BOOKMARKS"],["sources","SOURCES"]
];
let current="home", flashIndex=0, quizSet=[], quizIndex=0, quizAnswers={}, mockTimer=null;

function yBadge(y){return `<span class="pill y-${y}">${y==="red"?"🔴 VERY HIGH":y==="orange"?"🟠 HIGH":"🟡 SUPPORTING"}</span>`}
function setPage(id){current=id; document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.id===id)); render()}
function nav(){ $("#nav").innerHTML=pages.map(p=>`<button data-id="${p[0]}">${p[1]}</button>`).join(""); document.querySelectorAll("#nav button").forEach(b=>b.onclick=()=>setPage(b.dataset.id)); }
function progress(){ let a=state.stats.attempted||0; return a?Math.round((state.stats.correct||0)/a*100):0 }
function home(){
 const weak=state.mistakes.length? "Review Mistake Bank":"No weak topic yet";
 return `<h2>MinELE Laws Dashboard</h2><p class="subtitle">Mining + environmental regulation + professional ethics in one reviewer.</p>
 <div class="grid">
  <div class="card span-3 stat"><strong>${state.reviewed.length}</strong><span>Laws reviewed</span></div>
  <div class="card span-3 stat"><strong>${DB.flashcards.length}</strong><span>Flashcards available</span></div>
  <div class="card span-3 stat"><strong>${progress()}%</strong><span>Quiz accuracy</span></div>
  <div class="card span-3 stat"><strong>${state.mistakes.length}</strong><span>Mistakes saved</span></div>
  <div class="card span-8"><h3>Recommended next topic</h3><p>${weak}</p><div class="row"><button class="btn" onclick="setPage('review')">Continue Review</button><button class="btn alt" onclick="setPage('quiz')">Quick Quiz</button><button class="btn light" onclick="exportProgress()">Export Progress</button><button class="btn light" onclick="importProgress()">Import Progress</button></div></div>
  <div class="card span-4"><h3>Coverage</h3><p><b>${DB.laws.length}</b> core laws/issuances</p><p><b>${DB.questions.length}</b> verified-core questions</p><p><b>${DB.standards.length}</b> standards/parameter records</p></div>
  <div class="card span-12 good"><b>Build rule:</b> current and amended rules are kept distinguishable. The reviewer does not silently replace an older statutory provision with a later administrative update.</div>
 </div>`}
function mapPage(){
 return `<h2>Law Map</h2><p class="subtitle">Tap any branch in Review for detailed notes.</p>
 <div class="grid">
 <div class="card span-4"><h3>Mining framework</h3><p>1987 Constitution</p><p>↓</p><p>CA 137 → PD 463 → EO 279</p><p>↓</p><p><b>RA 7942</b></p><p>↓</p><p>DAO 2010-21 → EO 79 → EO 130</p><p>↓</p><p><b>RA 12253 + EO 122, s. 2026</b></p></div>
 <div class="card span-4"><h3>Environment</h3><p>PD 1586 → PEISS</p><p>RA 9275 → Water</p><p>RA 8749 → Air</p><p>RA 6969 → Hazardous waste/chemicals</p><p>RA 9003 → Solid waste</p><p>RA 11038 / RA 9147 → Protected areas & wildlife</p></div>
 <div class="card span-4"><h3>People + profession</h3><p>RA 8371 → IPRA / FPIC</p><p>RA 7160 → LGU powers</p><p>RA 7076 → Small-scale mining</p><p>RA 4274 → Mining Engineering Law</p></div>
 </div>`}
function review(){
 return `<div class="split"><div><h2>Review</h2><p class="subtitle">Quick + detailed review by law/issuance.</p></div><select id="lawFilter"><option value="">All</option>${[...new Set(DB.laws.map(x=>x.type))].map(x=>`<option>${x}</option>`).join("")}</select></div>
 <div id="lawList" class="law-list">${renderLaws(DB.laws)}</div>`}
function renderLaws(arr){return arr.map(l=>`<div class="card law-item" onclick="openLaw('${l.id}')"><div class="split"><div><div class="tag">${l.type} • ${l.year}</div><h3>${l.number}</h3><p>${l.title}</p></div>${yBadge(l.yield)}</div><p class="muted">${l.summary}</p></div>`).join("")}
window.openLaw=id=>{
 const l=DB.laws.find(x=>x.id===id); if(!l)return;
 if(!state.reviewed.includes(id)){state.reviewed.push(id);save()}
 $("#app").innerHTML=`<button class="btn light" onclick="setPage('review')">← Back</button><div class="card" style="margin-top:12px">
 <div class="split"><div><div class="tag">${l.type} • ${l.year}</div><h2>${l.number}</h2><h3>${l.title}</h3></div>${yBadge(l.yield)}</div>
 <p><b>Status:</b> ${l.status}</p>
 <details open><summary>QUICK REVIEW</summary><p>${l.summary}</p><ul>${l.key.slice(0,4).map(x=>`<li>${x}</li>`).join("")}</ul></details>
 <details><summary>DETAILED REVIEW</summary><p>${l.summary}</p><h3>High-yield rules / requirements</h3><ul>${l.key.map(x=>`<li>${x}</li>`).join("")}</ul><p><b>Topics:</b> ${l.topics.map(x=>`<span class="pill">${x}</span>`).join("")}</p></details>
 ${l.numbers.length?`<h3>Numbers</h3><ul>${l.numbers.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}
 <h3>Related</h3><p>${l.related.map(x=>`<span class="pill">${x}</span>`).join("")}</p>
 <div class="row"><button class="btn" onclick="toggleBookmark('${l.id}')">${state.bookmarks.includes(l.id)?"★ Bookmarked":"☆ Bookmark"}</button></div>
 <p class="source">Source: <a href="${l.source}" target="_blank">${l.source}</a></p></div>`}
window.toggleBookmark=id=>{state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];save();openLaw(id)}

function topics(){
 const defs=[
  ["Mining Law",["RA 7942","EO No. 279","DAO 2010-21","EO No. 130","RA No. 12253","EO No. 122"]],
  ["Small-Scale Mining",["RA No. 7076","DAO 2015-03","EO No. 79"]],
  ["Environmental Impact Assessment",["PD No. 1586","DAO 2003-30","DAO 2015-02"]],
  ["Air Pollution",["RA No. 8749","DAO 2000-81"]],
  ["Water Pollution",["RA No. 9275","DAO 2005-10","DAO 2016-08","DAO 2021-19"]],
  ["Solid Waste",["RA No. 9003"]],
  ["Hazardous and Toxic Substances",["RA No. 6969","DAO 2013-22"]],
  ["Protected Areas",["RA No. 11038"]],
  ["Wildlife",["RA No. 9147"]],
  ["Indigenous Peoples and Ancestral Domains",["RA No. 8371"]],
  ["Climate Change",["RA No. 9729"]],
  ["Mine Environmental Management",["DAO 2010-21","DAO 2015-02","DAO 2018-19"]],
  ["Mine Rehabilitation and Closure",["DAO 2010-21","RA 7942"]],
  ["Executive Policies on Mining",["EO No. 79","EO No. 130","EO No. 122"]],
  ["Professional Regulation and Ethics",["RA No. 4274","Code of Ethics"]]
 ];
 return `<h2>Topic Review</h2><p class="subtitle">Integrated review across laws and DAOs — designed for situation-based board questions.</p>`+
 defs.map(([name,keys])=>{let ls=DB.laws.filter(l=>keys.some(k=>l.number.includes(k)||l.title.includes(k)));return `<details open><summary>${name}</summary>${ls.map(l=>`<div class="card law-item" onclick="openLaw('${l.id}')"><b>${l.number}</b> — ${l.title}<p class="muted">${l.summary}</p></div>`).join("")||"<p class='muted'>Coverage integrated through related laws and review modules.</p>"}</details>`}).join("");
}
function agencies(){
 return `<h2>Who Regulates This?</h2><p class="subtitle">Primary regulatory roles — use this to distinguish MGB, EMB, NCIP, P/CMRB, PAMB, LGUs and fiscal agencies.</p>
 <div class="grid">${DB.agencies.map(a=>`<div class="card span-6"><h3>${a.name}</h3><p>${a.role}</p><p>${a.primary.map(x=>`<span class="pill">${x}</span>`).join("")}</p><div class="trap"><b>Board trap:</b> ${a.trap}</div></div>`).join("")}</div>`;
}
let applyIndex=0, applyAnswered=null;
function applyMode(){
 const s=DB.scenarios[applyIndex%DB.scenarios.length];
 return `<h2>Which Law Applies?</h2><p class="subtitle">Scenario ${applyIndex+1} of ${DB.scenarios.length}</p>
 <div class="card"><div class="tag">APPLICATION TRAINING</div><h3>${s.scenario}</h3><p><b>${s.ask}</b></p>
 ${s.choices.map((c,i)=>`<button class="choice ${applyAnswered!==null?(i===s.answer?'correct':i===applyAnswered?'wrong':''):''}" ${applyAnswered!==null?'disabled':''} onclick="answerApply(${i})">${String.fromCharCode(65+i)}. ${c}</button>`).join("")}
 ${applyAnswered!==null?`<div class="${applyAnswered===s.answer?'good':'trap'}"><b>${applyAnswered===s.answer?'Correct':'Review this'}</b><p>${s.explain}</p></div><button class="btn" onclick="nextApply()">Next scenario</button>`:""}
 </div>`;
}
window.answerApply=i=>{applyAnswered=i;render()}
window.nextApply=()=>{applyIndex=(applyIndex+1)%DB.scenarios.length;applyAnswered=null;render()}

function timeline(){return `<h2>Timeline</h2><div class="timeline">${DB.timeline.map(t=>`<div class="card timeline-item"><b>${t[0]} — ${t[1]}</b><p>${t[2]}</p></div>`).join("")}</div>`}
function compare(){return `<h2>Compare Mode</h2>${DB.comparisons.map(c=>`<details open><summary>${c.title}</summary><div class="table-wrap"><table><tbody>${c.rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`).join("")}`}
function standards(){return `<h2>Standards & Parameters</h2><p class="subtitle">Legal basis + applicability + exam trap.</p><div class="table-wrap"><table><thead><tr><th>Area</th><th>Parameter</th><th>Standard / rule</th><th>Unit</th><th>Basis</th><th>Status</th><th>Trap</th></tr></thead><tbody>${DB.standards.map(s=>`<tr><td>${s.area}</td><td><b>${s.parameter}</b></td><td>${s.standard}</td><td>${s.unit}</td><td>${s.basis}</td><td>${s.status}</td><td>${s.trap}</td></tr>`).join("")}</tbody></table></div>`}
function numbers(){let cats=[...new Set(DB.numbers.map(x=>x.cat))];return `<h2>Numbers You Must Memorize</h2><p class="subtitle">Tap Hide Numbers for active recall.</p><div class="row"><button class="btn" onclick="document.body.classList.toggle('hideNums');document.querySelectorAll('.numv').forEach(e=>e.textContent=e.textContent==='••••'?e.dataset.v:'••••')">Hide / Show Numbers</button></div>${cats.map(c=>`<details open><summary>${c}</summary><div class="table-wrap"><table><tbody>${DB.numbers.filter(n=>n.cat===c).map(n=>`<tr><td class="numv" data-v="${n.value}"><b>${n.value}</b></td><td>${n.meaning}</td><td>${n.law}</td><td>${n.clue}</td></tr>`).join("")}</tbody></table></div></details>`).join("")}`}
function flashcards(){let f=DB.flashcards[flashIndex%DB.flashcards.length];return `<h2>Flashcards</h2><p class="subtitle">Card ${flashIndex+1} of ${DB.flashcards.length}</p><div class="card flash" id="flashCard" onclick="this.classList.toggle('flipped')"><div class="front">${f[0]}</div><div class="back hidden" id="fb">${f[1]}</div></div><div class="row"><button class="btn light" onclick="reveal()">Reveal</button><button class="btn" onclick="rateFlash('know')">Know</button><button class="btn alt" onclick="rateFlash('unsure')">Unsure</button><button class="btn danger" onclick="rateFlash('dont')">Don't Know</button></div>`}
window.reveal=()=>$("#fb").classList.remove("hidden")
window.rateFlash=r=>{state.flash[flashIndex]=r;save();
 const weak=DB.flashcards.map((_,i)=>i).filter(i=>state.flash[i]==="unsure"||state.flash[i]==="dont");
 if((r==="unsure"||r==="dont")&&weak.length){flashIndex=weak[Math.floor(Math.random()*weak.length)]}
 else if(weak.length && Math.random()<0.55){flashIndex=weak[Math.floor(Math.random()*weak.length)]}
 else {flashIndex=(flashIndex+1)%DB.flashcards.length}
 render()}
function startQuiz(n=10,onlyMistakes=false,mode="all"){let src=onlyMistakes?DB.questions.filter(q=>state.mistakes.includes(q.id)):DB.questions;
 if(mode==="hard")src=src.filter(q=>["Hard","HARD","BOARD-LEVEL"].includes(q.difficulty));
 if(mode==="ethics")src=src.filter(q=>q.law.includes("PRC")||q.law.includes("4274"));
 if(mode==="environment")src=src.filter(q=>["RA 9275","RA 8749","RA 6969","RA 9003","RA 8371","RA 11038","RA 9147","PD 1586","DAO 2021-19"].includes(q.law));
 if(mode==="mining")src=src.filter(q=>q.law==="RA 7942"||q.law==="EO 79"||q.law==="RA 7076"||q.law==="Historical");
 quizSet=[...src].sort(()=>Math.random()-.5).slice(0,Math.min(n,src.length));quizIndex=0;quizAnswers={};renderQuizQ()}
function quiz(){return `<h2>Quiz</h2><p class="subtitle">Explanations appear after each answer.</p>
<div class="row">
<button class="btn" onclick="startQuiz(10)">Quick 10</button><button class="btn" onclick="startQuiz(20)">20 Questions</button><button class="btn" onclick="startQuiz(50)">50 Questions</button>
<button class="btn alt" onclick="startQuiz(50,false,'mining')">Mining Laws</button><button class="btn alt" onclick="startQuiz(50,false,'environment')">Environmental</button>
<button class="btn alt" onclick="startQuiz(50,false,'ethics')">Ethics</button><button class="btn alt" onclick="startQuiz(50,false,'hard')">Hard Mode</button>
<button class="btn danger" onclick="startQuiz(100,true)">Mistakes Only</button>
</div><div class="card" style="margin-top:14px"><p>Verified-core bank: <b>${DB.questions.length}</b> questions</p><p>Accuracy: <b>${progress()}%</b></p></div>`}
window.startQuiz=startQuiz;
function renderQuizQ(){
 if(!quizSet.length){$("#app").innerHTML=quiz();return}
 if(quizIndex>=quizSet.length){let c=Object.values(quizAnswers).filter(x=>x.correct).length;$("#app").innerHTML=`<h2>Quiz Complete</h2><div class="card"><h3>${c}/${quizSet.length}</h3><p>${Math.round(c/quizSet.length*100)}%</p><button class="btn" onclick="setPage('mistakes')">Review mistakes</button></div>`;return}
 let q=quizSet[quizIndex], done=quizAnswers[q.id];
 $("#app").innerHTML=`<div class="split"><h2>Question ${quizIndex+1}/${quizSet.length}</h2><span class="pill">${q.difficulty}</span></div><div class="progress"><span style="width:${(quizIndex/quizSet.length)*100}%"></span></div><div class="card" style="margin-top:14px"><div class="tag">${q.law} • ${q.topic}</div><h3>${q.q}</h3>${q.choices.map((c,i)=>`<button class="choice ${done?(i===q.answer?'correct':i===done.pick?'wrong':''):''}" ${done?'disabled':''} onclick="answerQ(${i})">${String.fromCharCode(65+i)}. ${c}</button>`).join("")}${done?`<div class="${done.correct?'good':'trap'}"><b>${done.correct?'Correct':'Incorrect'}</b><p>${q.rationale}</p>${q.whyWrong?`<details><summary>Why the other choices are wrong</summary>${q.choices.map((c,i)=>i===q.answer?'':`<p><b>${String.fromCharCode(65+i)}.</b> ${q.whyWrong[i]||'Not the best answer under the stated rule.'}</p>`).join('')}</details>`:''}<small>Reference: ${q.source}</small></div><button class="btn" onclick="nextQ()">Next</button>`:""}</div>`}
window.answerQ=i=>{let q=quizSet[quizIndex],correct=i===q.answer;quizAnswers[q.id]={pick:i,correct};state.stats.attempted++;if(correct){state.stats.correct++;state.mistakes=state.mistakes.filter(x=>x!==q.id)}else if(!state.mistakes.includes(q.id))state.mistakes.push(q.id);save();renderQuizQ()}
window.nextQ=()=>{quizIndex++;renderQuizQ()}
function mock(){return `<h2>Mock Exam</h2><p class="subtitle">Randomized. No repeated question in one exam. Rationales appear only after submission.</p><div class="row"><button class="btn" onclick="startMock(25)">25</button><button class="btn" onclick="startMock(50)">50</button><button class="btn alt" onclick="startMock(75)">75</button><button class="btn alt" onclick="startMock(100)">100*</button></div><p class="muted">*If the verified bank is smaller than the requested size, all available questions are used.</p>`}
function qGroup(q){
 const l=q.law||"";
 if(l.includes("4274")||l.includes("PRC"))return "Ethics";
 if(l.includes("9275")||l.includes("8749")||l.includes("6969")||l.includes("9003")||l.includes("1586")||l.includes("11038")||l.includes("9147")||l.includes("8371")||l.includes("9729")||l.includes("DAO 20"))return "Environment";
 if(l.includes("7076")||l.includes("EO 79")||l.includes("2015-03"))return "Small-Scale";
 if(l.includes("12253")||l.includes("EO 122")||l.includes("EO 130"))return "Current Policy";
 return "Mining";
}
window.startMock=n=>{
 const groups={}; DB.questions.forEach(q=>(groups[qGroup(q)]??=[]).push(q));
 Object.values(groups).forEach(a=>a.sort(()=>Math.random()-.5));
 let out=[], names=Object.keys(groups), i=0;
 while(out.length<Math.min(n,DB.questions.length)){let g=names[i%names.length];if(groups[g].length)out.push(groups[g].shift());if(names.every(k=>!groups[k].length))break;i++}
 quizSet=out;quizAnswers={};quizIndex=0;mockQ()
}
function mockQ(){if(quizIndex>=quizSet.length){let c=Object.values(quizAnswers).filter(x=>x.correct).length;$("#app").innerHTML=`<h2>Mock Result</h2><div class="card"><h3>${c}/${quizSet.length} — ${Math.round(c/quizSet.length*100)}%</h3>${quizSet.filter(q=>!quizAnswers[q.id]?.correct).map(q=>`<details><summary>${q.q}</summary><p>${q.rationale}</p><small>${q.source}</small></details>`).join("")}</div>`;return}let q=quizSet[quizIndex];$("#app").innerHTML=`<h2>Mock ${quizIndex+1}/${quizSet.length}</h2><div class="card"><div class="tag">${q.topic}</div><h3>${q.q}</h3>${q.choices.map((c,i)=>`<button class="choice ${quizAnswers[q.id]?.pick===i?'selected':''}" onclick="mockAns(${i})">${String.fromCharCode(65+i)}. ${c}</button>`).join("")}<button class="btn" onclick="mockNext()">Save & Next</button></div>`}
window.mockAns=i=>{let q=quizSet[quizIndex];quizAnswers[q.id]={pick:i,correct:i===q.answer};mockQ()}
window.mockNext=()=>{let q=quizSet[quizIndex];if(!quizAnswers[q.id])return alert("Choose an answer first.");let a=quizAnswers[q.id];state.stats.attempted++;if(a.correct){state.stats.correct++;state.mistakes=state.mistakes.filter(x=>x!==q.id)}else if(!state.mistakes.includes(q.id))state.mistakes.push(q.id);save();quizIndex++;mockQ()}
function mistakes(){let qs=DB.questions.filter(q=>state.mistakes.includes(q.id));return `<div class="split"><div><h2>Mistake Bank</h2><p class="subtitle">${qs.length} saved mistakes</p></div><button class="btn" onclick="startQuiz(50,true)">Retry All</button></div>${qs.length?qs.map(q=>`<div class="card"><b>${q.law} • ${q.topic}</b><p>${q.q}</p><p class="muted">${q.rationale}</p></div>`).join(""):`<div class="card good">No saved mistakes.</div>`}`}
function bookmarks(){let ls=DB.laws.filter(l=>state.bookmarks.includes(l.id));return `<h2>Bookmarks</h2>${ls.length?renderLaws(ls):'<div class="card">No bookmarks yet.</div>'}`}
function sources(){return `<h2>Sources</h2><p class="subtitle">Official/primary-source links used by the seeded reviewer.</p>${DB.laws.map(l=>`<div class="card"><b>${l.number} — ${l.title}</b><p class="source"><a href="${l.source}" target="_blank">${l.source}</a></p></div>`).join("")}`}
function render(){let html={home:home,map:mapPage,review,topics,agencies,apply:applyMode,timeline,compare,standards,numbers,flashcards,quiz,mock,mistakes,bookmarks,sources}[current]();$("#app").innerHTML=html; if(current==="review"){let f=$("#lawFilter");f.onchange=()=>$("#lawList").innerHTML=renderLaws(DB.laws.filter(l=>!f.value||l.type===f.value))}}
function doSearch(q){q=q.trim().toLowerCase();let box=$("#searchResults");if(q.length<2){box.classList.add("hidden");return}let hits=[];DB.laws.forEach(l=>{let s=JSON.stringify(l).toLowerCase();if(s.includes(q))hits.push({t:`${l.number} — ${l.title}`,d:l.summary,a:()=>openLaw(l.id)})});DB.questions.forEach(x=>{if(JSON.stringify(x).toLowerCase().includes(q))hits.push({t:`Question: ${x.topic}`,d:x.q,a:()=>{setPage("quiz")}})});DB.standards.forEach(x=>{if(JSON.stringify(x).toLowerCase().includes(q))hits.push({t:`Standard: ${x.parameter}`,d:`${x.area} • ${x.basis}`,a:()=>setPage("standards")})});box.innerHTML=hits.slice(0,12).map((h,i)=>`<div class="search-hit" data-i="${i}"><b>${h.t}</b><p>${h.d}</p></div>`).join("")||"<div class='search-hit'>No result</div>";box.classList.remove("hidden");box.querySelectorAll("[data-i]").forEach(el=>el.onclick=()=>{box.classList.add("hidden");hits[+el.dataset.i].a()})}
nav();render();
$("#globalSearch").oninput=e=>doSearch(e.target.value);
$("#themeToggle").onclick=()=>{let d=document.documentElement;d.dataset.theme=d.dataset.theme==="dark"?"light":"dark";localStorage.setItem("mineleTheme",d.dataset.theme)}
document.documentElement.dataset.theme=localStorage.getItem("mineleTheme")||"light";

window.exportProgress=()=>{
 const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="minele-progress.json"; a.click(); URL.revokeObjectURL(a.href);
};
window.importProgress=()=>{
 const i=document.createElement("input"); i.type="file"; i.accept=".json,application/json";
 i.onchange=()=>{const f=i.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{try{const obj=JSON.parse(r.result); localStorage.setItem("mineleState",JSON.stringify(obj)); location.reload()}catch(e){alert("Invalid progress file.")}};r.readAsText(f)};i.click();
};
