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
/* Latest accepted projections are fetched at view time from Agent Memory main.
   No Actions job or scheduled cross-repository snapshot sync is required. */
const LIVE="https://raw.githubusercontent.com/MythologIQ-Labs-LLC/agent-memory/main/reports/benchmarks/ui/";
const SNAPSHOT_FALLBACK="./benchmark-snapshot.json";
const invariant=(ok,reason)=>{if(!ok)throw Error("Live evidence refused: "+reason)};
function fromFrontier(frontier){
  invariant(frontier&&frontier.schema_version==="0.2.0"&&frontier.authority_effect==="none"&&frontier.aggregate_score===null,"schema or authority");
  invariant(typeof frontier.snapshot_id==="string"&&frontier.snapshot_id&&Array.isArray(frontier.leaderboards)&&Array.isArray(frontier.metric_coverage),"missing projection identity");
  const commit=frontier.snapshot?.evidence_revision;
  invariant(typeof commit==="string"&&/^[a-f0-9]{40}$/.test(commit),"missing immutable accepted evidence commit");
  const rows=[];
  for(const r of frontier.leaderboards){
    if(r.ranking_state!=="ranked")continue;
    invariant(r.evidence_class==="same_harness"&&r.comparison_state==="exact"&&Array.isArray(r.ranking)&&r.ranking.length>=2&&
      Number.isFinite(r.gap_to_leader_native)&&r.gap_to_leader_native>=0&&
      typeof r.metric_key==="string"&&typeof r.comparison_set_id==="string"&&
      ["higher_better","lower_better","zero_target"].includes(r.direction)&&
      r.adequacy?.state==="threshold_not_established","ineligible row presented as ranked");
    const observed=r.ranking.map(x=>{
      invariant(x&&["subject","external_competitor","control"].includes(x.role)&&typeof x.system_id==="string"&&
        Number.isFinite(x.value)&&x.value>=0&&Number.isInteger(x.rank)&&x.rank>=1&&
        typeof x.revision==="string"&&x.revision,"invalid ranked system");
      const source=(x.evidence||[]).find(e=>typeof e.uri==="string"&&escapeSourcePath(e.uri));
      return {id:x.system_id,role:x.role,value:x.value,rank:x.rank,revision:x.revision,source:source?.uri||null};
    });
    invariant(observed.filter(s=>s.role==="subject").length===1,"ranked row requires one Agent Memory subject");
    const values=observed.map(s=>s.value);
    const best=r.direction==="higher_better"?Math.max(...values):Math.min(...values);
    const agent=observed.find(s=>s.role==="subject").value;
    const gap=r.direction==="higher_better"?best-agent:agent-best;
    invariant(Math.abs(gap-r.gap_to_leader_native)<1e-7,"native frontier gap inconsistent");
    rows.push({
      id:r.metric_key+"|"+r.comparison_set_id,
      benchmark:r.benchmark_id,profile:r.task_profile,dimension:r.dimension,metric:r.metric_id,
      unit:r.unit,direction:r.direction,gap:r.gap_to_leader_native,
      competitive_state:r.competitive_state,leader_state:r.leader_state,
      currency:r.currency?.state,co_leaders:r.co_leaders||[],systems:observed,
      context:{sample_count:r.sample_count,selection_id:r.selection_id,input_sha256:r.input_sha256,
        comparison_set_id:r.comparison_set_id,adequacy:r.adequacy.state}
    });
  }
  invariant(rows.length>0&&new Set(rows.map(r=>r.id)).size===rows.length,"empty or duplicated ranked rows");
  const coverage=frontier.metric_coverage.map(x=>({
    id:x.metric_key,benchmark:(x.benchmark_profile_id||"").split(":")[0],
    dimension:x.dimension,metric:x.metric_id,state:x.state,
  }));
  invariant(coverage.every(x=>typeof x.id==="string"&&x.id),"invalid coverage registry");
  return {schema_version:"public-docs-1",snapshot_id:frontier.snapshot_id,
    source_commit:commit,source_projection_sha:"live-from-repository-main",
    source_url:"https://github.com/MythologIQ-Labs-LLC/agent-memory/blob/main/reports/benchmarks/ui/frontier-leaderboards.json",
    publication_note:"Read-only accepted same-harness projection fetched on page load; not a universal best-in-class claim.",
    ranked_count:rows.length,metric_coverage_count:coverage.length,
    comparison_row_counts:frontier.summary?.ranking_states||{},
    ranked:rows,coverage};
}
async function fetchCurrent(){
  try{
    const response=await fetch(LIVE+"frontier-leaderboards.json",{cache:"no-store"});
    if(!response.ok)throw Error("Live projection HTTP "+response.status);
    const converted=fromFrontier(await response.json()); // Invalid live evidence never silently falls back.
    return {data:converted,live:true};
  }catch(error){
    if(String(error.message).startsWith("Live evidence refused:"))throw error;
    const fallback=await fetch(SNAPSHOT_FALLBACK,{cache:"no-store"});
    if(!fallback.ok)throw Error("Live projection unavailable and historical fallback missing.");
    return {data:await fallback.json(),live:false,reason:String(error.message)};
  }
}
async function refreshSourceStatus(data){
  const state=$("benchmark-source-state");
  if(!state)return;
  const get=await fetch(LIVE+"refresh-status.json",{cache:"no-store"}).catch(()=>null);
  if(!get||!get.ok){state.textContent+=" Refresh manifest unavailable; newest remote evidence cannot be confirmed.";return;}
  const manifest=await get.json();
  if(manifest.schema_version!=="benchmark-refresh-status/1"||manifest.catalog_snapshot_id!==data.snapshot_id||
     manifest.authority_effect!=="none"||manifest.accepted_evidence_only_in_rankings!==true){
    state.textContent+=" Refresh manifest mismatch; additional evidence may not be reflected.";return;
  }
  state.textContent+=" Unregistered raw evidence sources: "+manifest.unregistered_source_count+
   " (not counted as competitor wins). Manifest matches the accepted projection, but this is not live runtime verification.";
}

try{
 const loaded=await fetchCurrent();
 const data=loaded.data;
 const indicator=$("benchmark-source-state");
 if(indicator) indicator.textContent=loaded.live?
    "Latest accepted projection requested directly from Agent Memory main on this page load.":
    "Historical fallback snapshot in use. Live projection unavailable ("+loaded.reason+"). Results may be stale.";
 if(loaded.live) refreshSourceStatus(data).catch(err=>{if(indicator)indicator.textContent+=" Refresh status unavailable: "+String(err.message)});

 if(data.schema_version!=="public-docs-1"||typeof data.snapshot_id!=="string"||!Array.isArray(data.ranked)||!data.ranked.length||data.ranked_count!==data.ranked.length||!Array.isArray(data.coverage)||!/^([a-f0-9]{40})$/.test(data.source_commit))throw Error("Malformed or unexpected evidence snapshot, refused.");
 if(data.ranked.some(r=>r.systems.length<2||r.systems.some(s=>!Number.isFinite(s.value)||s.value<0)||!Number.isFinite(r.gap)||r.gap<0||r.context?.adequacy!=="threshold_not_established"))throw Error("Snapshot contains unqualified numerical claims, refused.");
 selectOptions($("benchmark-family"),data.ranked.map(r=>r.benchmark),v=>benchmarkNames[v]||v);
 selectOptions($("benchmark-dimension"),data.ranked.map(r=>r.dimension));
 const laneVersion=r=>Number((r.profile.match(/-v(\d+)/)||[])[1]||0);
 const laneFamily=r=>[r.benchmark,r.profile.replace(/-v\d+(?=[:/]|$)/,"-v*"),r.dimension,r.metric].join("|");
 const latestPerLane=new Map();
 for(const row of data.ranked){const key=laneFamily(row);latestPerLane.set(key,Math.max(latestPerLane.get(key)||0,laneVersion(row)));}
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
   const rows=data.ranked.filter(r=>(!fam||r.benchmark===fam)&&(!dim||r.dimension===dim)&&(lane==="all"||laneVersion(r)===latestPerLane.get(laneFamily(r)))&&(!query||[r.metric,r.profile,r.benchmark,...r.systems.map(s=>s.id)].join(" ").toLowerCase().includes(query)));
   grid.replaceChildren();for(const row of rows)grid.append(addMetric(row,data,showControls));
   if(!rows.length)grid.append(E("p","empty","No accepted direct comparisons match these filters. This does not mean a score of zero."));
   $("benchmark-count").textContent=rows.length+" metric charts shown · "+(lane==="latest"?"latest accepted generation per native metric in the historical snapshot":"all accepted historical generations")+" · "+(showControls?"including lexical controls":"lexical controls hidden");
 }
 for(const id of ["benchmark-family","benchmark-dimension","benchmark-lanes","benchmark-controls"])$(id).addEventListener("change",render);
 $("benchmark-search").addEventListener("input",render);render();
 const unmatched=data.coverage.filter(x=>x.state!=="has_accepted_comparison");
 $("benchmark-coverage-summary").textContent=unmatched.length+" registered metric definitions lack an accepted comparison in this snapshot. Other unranked comparison contexts also exist; they are not rendered as bars.";
 const list=$("benchmark-coverage-list");for(const x of unmatched.slice(0,40))list.append(E("p","subtle",(x.benchmark||"Unassigned")+" · "+x.dimension+" · "+x.metric+" · "+x.state));
 if(unmatched.length>40)list.append(E("p","muted","Showing first 40 definitions. Consult the source catalog for the complete inventory."));
}catch(err){grid.replaceChildren(E("p","empty","Evidence unavailable: "+String(err.message)+". No charts are displayed without a qualified snapshot."));$("benchmark-count").textContent="Benchmark evidence could not be loaded.";}
})();
