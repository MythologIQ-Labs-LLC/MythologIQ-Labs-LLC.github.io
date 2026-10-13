"use strict";
/* Evidence-bound SVG-free horizontal bar charts; every displayed value comes from the pinned snapshot. */
(async function(){
const grid=document.getElementById("benchmark-grid");if(!grid)return;
const $=id=>document.getElementById(id),E=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
const headline=(n,label)=>{const box=E("div","stat");box.append(E("strong","",n),E("span","",label));return box};
const benchmarkNames={"amb-precisionmembench":"PrecisionMemBench","longmemeval":"LongMemEval S"};
const friendlySystem=id=>({"agent-memory":"Agent Memory","mem0-oss":"Mem0 OSS","bm25":"BM25","lexical_overlap":"Lexical baseline"}[id]||id.replaceAll("-"," "));
const friendlyMetric=s=>s.replaceAll("_"," ").replace(/\bndcg\b/ig,"nDCG").replace(/\bms\b/g,"ms").replace(/\brecall\b/ig,"Recall").replace(/\bpasses\b/ig,"Passes").replace(/\blatest gold\b/ig,"Latest gold");
const ratio=r=>r.unit==="ratio";
const fmt=(v,unit)=>{if(!Number.isFinite(v))return"Unavailable";if(unit==="ratio")return(v*100).toFixed(2)+"%";if(unit==="count")return String(v);return v.toLocaleString(undefined,{maximumFractionDigits:3})+" "+unit};
const escapeSourcePath=p=>typeof p==="string" && /^(reports|reference)\/[a-zA-Z0-9_./-]+$/.test(p) && !p.split("/").includes("..");
function statState(row){if(row.competitive_state==="leading_vs_external")return"Leads measured external peers";if(row.competitive_state==="behind_external")return"Behind measured external peer";if(row.competitive_state==="leading_vs_controls_only")return"Leads controls only";if(row.competitive_state==="behind_control")return"Behind lexical control";if(row.competitive_state==="tied_leader")return"Tied within measured lane";return"Ranked within this lane"}
function addMetric(row,data,showControls){
  const box=E("article","metric-card");
  const header=E("header"),intro=E("div");intro.append(E("h3","",friendlyMetric(row.metric)),E("div","meta",(benchmarkNames[row.benchmark]||row.benchmark)+" · "+row.dimension+" · "+row.profile+" · "+(row.direction==="lower_better"?"Lower is better":"Higher is better")));
  header.append(intro,E("span","metric-state",row.currency==="superseded"?"Historical / superseded":"Historical evidence"));box.append(header);
  const bars=E("div","metric-bars");
  const visible=row.systems.filter(s=>showControls||s.role!=="control");
  const max=Math.max(ratio(row)?1:0,...row.systems.map(s=>s.value));
  for(const system of visible){
    if(typeof system.value!=="number"||!Number.isFinite(system.value)||system.value<0)continue;
    const item=E("div","bar-row");item.dataset.role=system.role;
    const lab=E("span","bar-label",friendlySystem(system.id));const track=E("div","bar-track");const bar=E("span","bar-fill");
    const percent=max>0?Math.min(100,Math.max(0,100*system.value/max)):0;
    bar.style.width=percent+"%";
    track.setAttribute("role","img");track.setAttribute("aria-label",friendlySystem(system.id)+": "+fmt(system.value,row.unit)+", rank "+system.rank+" in this comparison");
    track.append(bar);item.append(lab,track,E("span","bar-value",fmt(system.value,row.unit)));bars.append(item);
  }
  box.append(bars);
  const foot=E("div","metric-foot");
  const status=E("span","",statState(row));
  const delta=row.gap===0?"0 "+(ratio(row)?"pp":row.unit)+" deficit":(ratio(row)?(row.gap*100).toFixed(2)+" pp":fmt(row.gap,row.unit))+" behind leader";
  const deficit=E("strong",row.gap>0?"deficit":"lead",delta);foot.append(status,deficit);box.append(foot);
  const info=E("details");info.append(E("summary","","Evidence and exact comparison identity"));
  const dl=E("dl"),attrs=[
   ["Comparison",row.context.comparison_set_id],
   ["Input SHA-256",row.context.input_sha256],
   ["Selection",row.context.selection_id],
   ["Sample size",row.context.sample_count],
   ["Agent Memory revision",row.systems.find(s=>s.role==="subject")?.revision],
   ["Absolute adequacy",row.context.adequacy],
   ["Leader(s)",(row.co_leaders||[]).map(friendlySystem).join(", ")],
   ["Interpretation","Rankings valid only inside this exact frozen comparison."]
  ];
  for(const [k,v] of attrs){dl.append(E("dt","",k),E("dd","",v??"Not recorded"))}
  info.append(dl);
  const links=E("div","");for(const sys of row.systems){if(!escapeSourcePath(sys.source))continue;const a=E("a","",friendlySystem(sys.id)+" source ↗");a.href="https://github.com/MythologIQ-Labs-LLC/agent-memory/blob/"+encodeURIComponent(data.source_commit)+"/"+sys.source;a.rel="noopener noreferrer";links.append(a,E("span",""," · "))}info.append(links);box.append(info);return box;
}
function selectOptions(select,values,pretty){for(const v of [...new Set(values)].filter(Boolean).sort()){const item=E("option","",pretty?pretty(v):v);item.value=v;select.append(item)}}
try{
 const response=await fetch("./benchmark-snapshot.json",{cache:"no-store"});if(!response.ok)throw Error("Evidence snapshot could not be loaded (HTTP "+response.status+").");
 const data=await response.json();
 if(data.schema_version!=="public-docs-1"||typeof data.snapshot_id!=="string"||data.ranked_count!==58||!Array.isArray(data.ranked)||data.ranked.length!==58||!Array.isArray(data.coverage)||!/^([a-f0-9]{40})$/.test(data.source_commit))throw Error("Malformed or unexpected evidence snapshot, refused.");
 if(data.ranked.some(r=>r.systems.length<2||r.systems.some(s=>!Number.isFinite(s.value)||s.value<0)||!Number.isFinite(r.gap)||r.gap<0||r.context?.adequacy!=="threshold_not_established"))throw Error("Snapshot contains unqualified numerical claims, refused.");
 selectOptions($("benchmark-family"),data.ranked.map(r=>r.benchmark),v=>benchmarkNames[v]||v);
 selectOptions($("benchmark-dimension"),data.ranked.map(r=>r.dimension));
 const versions=data.ranked.map(r=>Number((r.profile.match(/-v(\d+)/)||[])[1]||0));const latest=Math.max(...versions);
 const systemIds=(role,rows)=>new Set(rows.flatMap(r=>r.systems.filter(s=>s.role===role).map(s=>s.id)));
 const external=systemIds("external_competitor",data.ranked),controls=systemIds("control",data.ranked);
 const stat=$("benchmark-stats");stat.append(headline(external.size,"Distinct external memory systems"),headline(controls.size,"Non-product control baselines"),headline(data.ranked.length,"Ranked historical metric contexts"),headline(new Set(data.ranked.map(r=>r.benchmark)).size,"Measured benchmark families"),headline(data.metric_coverage_count,"Catalog metric definitions"));
 const summary=$("benchmark-peer-coverage");
 summary.textContent=external.size+" distinct external memory "+(external.size===1?"system has":"systems have")+" accepted same-harness comparisons in this historical snapshot: "+([...external].map(friendlySystem).join(", ")||"none")+". "+controls.size+" non-product control "+(controls.size===1?"baseline is":"baselines are")+" tracked separately.";
 const families=$("benchmark-peer-by-family");
 for(const family of [...new Set(data.ranked.map(r=>r.benchmark))].sort()){
   const rows=data.ranked.filter(r=>r.benchmark===family);
   const peers=systemIds("external_competitor",rows),baselines=systemIds("control",rows);
   families.append(E("p","subtle",(benchmarkNames[family]||family)+": "+rows.length+" eligible metric charts · "+peers.size+" distinct external peer"+(peers.size===1?"":"s")+" ("+([...peers].map(friendlySystem).join(", ")||"none")+") · "+baselines.size+" control "+(baselines.size===1?"system":"systems")));
 }
 function render(){
   const fam=$("benchmark-family").value,dim=$("benchmark-dimension").value,lane=$("benchmark-lanes").value,query=$("benchmark-search").value.trim().toLowerCase(),showControls=$("benchmark-controls").checked;
   const rows=data.ranked.filter(r=>(!fam||r.benchmark===fam)&&(!dim||r.dimension===dim)&&(lane==="all"||Number((r.profile.match(/-v(\d+)/)||[])[1]||0)===latest)&&(!query||[r.metric,r.profile,r.benchmark,...r.systems.map(s=>s.id)].join(" ").toLowerCase().includes(query)));
   grid.replaceChildren();for(const row of rows)grid.append(addMetric(row,data,showControls));
   if(!rows.length)grid.append(E("p","empty","No accepted direct comparisons match these filters. This does not mean a score of zero."));
   $("benchmark-count").textContent=rows.length+" metric charts shown · "+(lane==="latest"?"latest registered generation v"+latest+" in the historical snapshot":"all accepted historical generations")+" · "+(showControls?"including lexical controls":"lexical controls hidden");
 }
 for(const id of ["benchmark-family","benchmark-dimension","benchmark-lanes","benchmark-controls"])$(id).addEventListener("change",render);
 $("benchmark-search").addEventListener("input",render);render();
 const unmatched=data.coverage.filter(x=>x.state!=="has_accepted_comparison");
 $("benchmark-coverage-summary").textContent=unmatched.length+" registered metric definitions lack an accepted comparison in this snapshot. Other unranked comparison contexts also exist; they are not rendered as bars.";
 const list=$("benchmark-coverage-list");for(const x of unmatched.slice(0,40))list.append(E("p","subtle",(x.benchmark||"Unassigned")+" · "+x.dimension+" · "+x.metric+" · "+x.state));
 if(unmatched.length>40)list.append(E("p","muted","Showing first 40 definitions. Consult the source catalog for the complete inventory."));
}catch(err){grid.replaceChildren(E("p","empty","Evidence unavailable: "+String(err.message)+". No charts are displayed without a qualified snapshot."));$("benchmark-count").textContent="Benchmark evidence could not be loaded.";}
})();
