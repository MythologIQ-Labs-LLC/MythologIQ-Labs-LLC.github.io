"use strict";
/* Static, fail-closed documentation renderer: public catalog values are treated as text. */
(function(){
const all=window.MYTHO_PROJECTS||[];
const root=document.getElementById("project-list");
const detail=document.body.dataset.project;
const el=(tag,klass,text)=>{const n=document.createElement(tag);if(klass)n.className=klass;if(text!==undefined)n.textContent=String(text);return n};
function link(href,label,klass){const a=el("a",klass,label);a.href=href;if(/^https:\/\//.test(href))a.rel="noopener noreferrer";return a}
function projectCard(p){const a=link("./"+p.slug+"/","");a.className="project-card";a.append(el("span","chip",p.category),el("h3","",p.name),el("p","",p.summary),el("span","card-more","Explore documentation →"));return a}
if(root){const search=document.getElementById("project-search"),cat=document.getElementById("project-category");
const categories=[...new Set(all.map(p=>p.category))].sort();
for(const c of categories){const o=el("option","",c);o.value=c;cat.append(o)}
function render(){const q=search.value.trim().toLowerCase(),c=cat.value;root.replaceChildren();const matches=all.filter(p=>(!c||p.category===c)&&(!q||[p.name,p.subtitle,p.category,p.summary,...p.principles,...p.goals].join(" ").toLowerCase().includes(q)));matches.forEach(p=>root.append(projectCard(p)));document.getElementById("count").textContent=matches.length+" of "+all.length+" projects shown";if(!matches.length)root.append(el("p","empty","No projects match this search."))}
search.addEventListener("input",render);cat.addEventListener("change",render);render();}
if(detail){const p=all.find(x=>x.slug===detail);const top=document.getElementById("project-title");if(!p){top.textContent="Project not found";return}
document.title=p.name+" · MythologIQ Labs Documentation";
document.getElementById("project-category").textContent=p.category;
top.textContent=p.name;
document.getElementById("project-subtitle").textContent=p.subtitle;
document.getElementById("project-summary").textContent=p.summary;
const actions=document.getElementById("project-actions");
if(p.repo)actions.append(link("https://github.com/MythologIQ-Labs-LLC/"+encodeURIComponent(p.repo),"View source repository ↗","btn primary"));
if(p.site)actions.append(link(p.site,"Product overview ↗",p.repo?"btn":"btn primary"));
if(p.feature==="benchmarks")actions.append(link("#benchmarks","Explore benchmark leaderboard ↓","btn"));
for(const [key,items] of [["principles",p.principles],["goals",p.goals],["integrations",p.integrations],["benchmark-info",p.benchmarks]]){const target=document.getElementById("list-"+key);for(const v of items)target.append(el("li","",v))}
const links=document.getElementById("source-links");
if(p.repo){links.append(link("https://github.com/MythologIQ-Labs-LLC/"+encodeURIComponent(p.repo),"Repository"));links.append(document.createTextNode(" · "));links.append(link("https://github.com/MythologIQ-Labs-LLC/"+encodeURIComponent(p.repo)+"/issues","Development issues"))}
else{links.append(el("span","muted","Source code is not linked publicly for this product."))}
if(p.feature==="benchmarks"){const section=document.getElementById("benchmarks");section.hidden=false;const script=document.createElement("script");script.src="../benchmark.js";script.defer=true;document.body.append(script)}
}
})();
