const KEY="dbmanage.projects.v1";
let projects=JSON.parse(localStorage.getItem(KEY)||"[]");
const $=id=>document.getElementById(id);
const formPanel=$("formPanel"), form=$("projectForm");

function save(){localStorage.setItem(KEY,JSON.stringify(projects));render();}
function money(n){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(n)||0)}
function pct(p){return ({'Create Design':25,'In Progress':50,'Start Printing':75,'Done':100}[p]||0)}
function openForm(item=null){
  formPanel.classList.add("open"); $("formTitle").textContent=item?"Edit Project":"New Project";
  $("editId").value=item?.id||"";$("client").value=item?.client||"";$("project").value=item?.project||"";
  $("vehicle").value=item?.vehicle||"";$("progress").value=item?.progress||"Create Design";$("amount").value=item?.amount??"";
  $("date").value=item?.date||new Date().toISOString().slice(0,10);$("notes").value=item?.notes||"";
  window.scrollTo({top:0,behavior:"smooth"});$("client").focus();
}
function closeForm(){formPanel.classList.remove("open");form.reset();$("editId").value=""}
$("addTopBtn").onclick=()=>openForm();$("emptyBtn").onclick=()=>openForm();$("closeForm").onclick=closeForm;$("cancelBtn").onclick=closeForm;
form.onsubmit=e=>{e.preventDefault();const id=$("editId").value||crypto.randomUUID();const item={id,client:$("client").value.trim(),project:$("project").value.trim(),vehicle:$("vehicle").value,progress:$("progress").value,amount:Number($("amount").value)||0,date:$("date").value,notes:$("notes").value.trim()};const i=projects.findIndex(x=>x.id===id);if(i>=0)projects[i]=item;else projects.unshift(item);save();closeForm()};
$("search").oninput=render;
function render(){
 const q=$("search").value.toLowerCase().trim(), list=projects.filter(x=>[x.client,x.project,x.vehicle,x.progress,x.notes].join(" ").toLowerCase().includes(q));
 const total=projects.reduce((s,x)=>s+Number(x.amount||0),0), completion=projects.length?Math.round(projects.reduce((s,x)=>s+pct(x.progress),0)/projects.length):0;
 const now=new Date(), start=new Date(now); start.setDate(now.getDate()-now.getDay()); start.setHours(0,0,0,0);
 const weekly=projects.filter(x=>x.date&&new Date(x.date+"T00:00:00")>=start).reduce((s,x)=>s+Number(x.amount||0),0);
 $("projectCount").textContent=projects.length;$("completion").textContent=completion+"%";$("weeklyTotal").textContent=money(weekly);
 $("projectSubtitle").textContent=projects.length===1?"1 project":projects.length+" projects";$("empty").style.display=list.length?"none":"block";
 $("projectList").innerHTML=list.map(x=>{const p=pct(x.progress);return `<article class="project ${p===100?"done":""}">
 <div class="project-main"><div class="client-row"><h3>${esc(x.client)}</h3><span class="badge">${esc(x.vehicle)}</span><span class="badge">${esc(x.progress)}</span></div>
 <div class="project-name">${esc(x.project)}</div><div class="meta"><span>📅 ${x.date?fmtDate(x.date):"No date"}</span></div>
 <div class="progress-wrap"><div class="progress-top"><span>Progress</span><b>${p}%</b></div><div class="bar"><div class="fill" style="width:${p}%"></div></div></div>
 ${x.notes?`<div class="notes">${esc(x.notes)}</div>`:""}</div>
 <div class="project-side"><div class="amount">${money(x.amount)}</div><div class="actions"><button class="small-btn" onclick="editProject('${x.id}')">Edit</button><button class="small-btn" onclick="deleteProject('${x.id}')">Delete</button></div></div></article>`}).join("");
}
function editProject(id){openForm(projects.find(x=>x.id===id))}
function deleteProject(id){if(confirm("Delete this project?")){projects=projects.filter(x=>x.id!==id);save()}}
function fmtDate(s){return new Date(s+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
render();

if ("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
