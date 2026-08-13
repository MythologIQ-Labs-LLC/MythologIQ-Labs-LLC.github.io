const stateClass = value => `status-${String(value || "unknown").toLowerCase().replace(/\s+/g, "-")}`;

const status = value => `<span class="mini-status ${stateClass(value)}">${escapeHtml(value)}</span>`;
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

const pct = value => Math.max(0, Math.min(100, Number(value || 0)));
const formatObserved = iso => new Intl.DateTimeFormat(undefined, {
  month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
}).format(new Date(iso));

const planeMeta = {
  overview: ["Organization overview", "A public-safe view of software governance posture."],
  oversight: ["Oversight", "Attention, freshness, provenance, and source health."],
  compliance: ["Compliance", "Evidence posture, gaps, relevance, and export readiness."],
  repositories: ["Repositories", "The repositories admitted to this reference projection."]
};

const response = await fetch("./data/reference-fixture.json");
if (!response.ok) throw new Error(`Unable to load reference fixture (${response.status})`);
const data = await response.json();

document.querySelector("#observed-at").textContent = formatObserved(data.observedAt);
document.querySelector("#repo-count").textContent = data.repositories.length;
document.querySelector("#source-count").textContent = data.summary.evidenceSources;
document.querySelector("#overall-status").textContent = data.summary.overall;
document.querySelector("#overall-status").className = `status-pill ${stateClass(data.summary.overall)}`;

function metric(label, value, note) {
  return `<article class="metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`;
}

document.querySelector("#overview-metrics").innerHTML = [
  metric("Healthy sources", `${data.summary.healthySources}/${data.summary.evidenceSources}`, "Source observations available"),
  metric("Needs attention", data.summary.needsAttention, "Repositories with routed attention"),
  metric("Evidence coverage", `${data.summary.evidenceCoverage}%`, "Reference fixture coverage"),
  metric("Unknown states", data.summary.unknownStates, "Intentionally unresolved")
].join("");

const attentionSorted = [...data.repositories].sort((a, b) => b.oversight.attentionScore - a.oversight.attentionScore);
document.querySelector("#attention-list").innerHTML = attentionSorted.slice(0, 4).map(repo => `
  <article class="attention-item">
    <div><strong>${escapeHtml(repo.name)}</strong>${status(repo.oversight.state)}</div>
    <p>${escapeHtml(repo.oversight.reason)}</p>
  </article>
`).join("");

const dimensions = ["documentation", "implementation", "operating", "effectiveness"];
document.querySelector("#evidence-summary").innerHTML = dimensions.map(dimension => {
  const values = data.repositories.map(repo => repo.compliance.evidence[dimension]);
  const complete = values.filter(value => value === "complete").length;
  return `<article class="evidence-row">
    <div><strong>${escapeHtml(dimension)}</strong><span>${complete}/${values.length} complete</span></div>
    <p>${values.filter(value => value !== "complete").length} repository states remain partial, missing, stale, or unknown.</p>
  </article>`;
}).join("");

function overviewRows(repos) {
  return repos.map(repo => `<tr>
    <td>${escapeHtml(repo.name)}</td>
    <td>${status(repo.oversight.state)}</td>
    <td>${status(repo.oversight.freshness)}</td>
    <td>${status(repo.compliance.state)}</td>
    <td>${repo.compliance.coverage}%</td>
  </tr>`).join("");
}
document.querySelector("#overview-repository-rows").innerHTML = overviewRows(data.repositories);

const oversightMetrics = [
  metric("Fresh", data.repositories.filter(repo => repo.oversight.freshness === "fresh").length, "Repository observations"),
  metric("Stale", data.repositories.filter(repo => repo.oversight.freshness === "stale").length, "Require refreshed evidence"),
  metric("Source health", `${data.repositories.filter(repo => repo.oversight.sourceHealth === "healthy").length}/${data.repositories.length}`, "Healthy repository sources"),
  metric("Attention routed", data.repositories.filter(repo => repo.oversight.attentionScore >= 50).length, "Score ≥ 50 in fixture")
];
document.querySelector("#oversight-metrics").innerHTML = oversightMetrics.join("");

document.querySelector("#oversight-repositories").innerHTML = data.repositories.map(repo => `
  <article class="repo-card">
    <div class="repo-card-header">
      <div><h3>${escapeHtml(repo.name)}</h3><div class="repo-meta">${escapeHtml(repo.id)}</div></div>
      ${status(repo.oversight.state)}
    </div>
    <div class="detail-grid">
      <div class="detail"><span>Freshness</span><strong>${status(repo.oversight.freshness)}</strong></div>
      <div class="detail"><span>Source health</span><strong>${status(repo.oversight.sourceHealth)}</strong></div>
      <div class="detail"><span>Attention</span><strong>${repo.oversight.attentionScore}/100</strong></div>
      <div class="detail"><span>Provenance</span><strong>${escapeHtml(repo.oversight.provenance)}</strong></div>
    </div>
    <div class="progress" aria-label="Attention score ${repo.oversight.attentionScore} percent"><span style="width:${pct(repo.oversight.attentionScore)}%"></span></div>
    <p class="muted">${escapeHtml(repo.oversight.reason)}</p>
  </article>
`).join("");

document.querySelector("#compliance-metrics").innerHTML = [
  metric("Complete", data.repositories.filter(repo => repo.compliance.state === "complete").length, "Repository evidence postures"),
  metric("Partial", data.repositories.filter(repo => repo.compliance.state === "partial").length, "More evidence required"),
  metric("Average coverage", `${Math.round(data.repositories.reduce((sum, repo) => sum + repo.compliance.coverage, 0) / data.repositories.length)}%`, "Across fixture repositories"),
  metric("Export ready", data.repositories.filter(repo => repo.compliance.exportReadiness === "ready").length, "Evidence packages")
].join("");

document.querySelector("#compliance-repositories").innerHTML = data.repositories.map(repo => `
  <article class="repo-card">
    <div class="repo-card-header">
      <div><h3>${escapeHtml(repo.name)}</h3><div class="repo-meta">Control map ${escapeHtml(repo.compliance.mappingVersion)}</div></div>
      ${status(repo.compliance.state)}
    </div>
    <div class="detail-grid">
      <div class="detail"><span>Coverage</span><strong>${repo.compliance.coverage}%</strong></div>
      <div class="detail"><span>Control relevance</span><strong>${escapeHtml(repo.compliance.controlRelevance)}</strong></div>
      <div class="detail"><span>Export</span><strong>${status(repo.compliance.exportReadiness)}</strong></div>
      <div class="detail"><span>Evidence refs</span><strong>${repo.compliance.evidenceRefs}</strong></div>
    </div>
    <div class="evidence-dimensions">
      ${Object.entries(repo.compliance.evidence).map(([name, value]) => `
        <div class="dimension-row"><span>${escapeHtml(name)}</span>${status(value)}</div>
      `).join("")}
    </div>
  </article>
`).join("");

function repositoryRows(repos) {
  return repos.map(repo => `
    <article class="repository-row">
      <div><strong>${escapeHtml(repo.name)}</strong><small>${escapeHtml(repo.id)}</small></div>
      <div><span class="cell-label">Oversight</span>${status(repo.oversight.state)}</div>
      <div><span class="cell-label">Compliance</span>${status(repo.compliance.state)}</div>
      <div><span class="cell-label">Freshness</span>${status(repo.oversight.freshness)}</div>
      <div><span class="cell-label">Coverage</span><strong>${repo.compliance.coverage}%</strong></div>
    </article>
  `).join("");
}

const repositoryList = document.querySelector("#repository-list");
const filterCount = document.querySelector("#filter-count");
function renderRepositoryFilter(query = "") {
  const normalized = query.trim().toLowerCase();
  const repos = data.repositories.filter(repo => JSON.stringify(repo).toLowerCase().includes(normalized));
  repositoryList.innerHTML = repositoryRows(repos);
  filterCount.textContent = `${repos.length} of ${data.repositories.length}`;
}
renderRepositoryFilter();
document.querySelector("#repo-filter").addEventListener("input", event => renderRepositoryFilter(event.target.value));

function activatePlane(name) {
  document.querySelectorAll("[data-plane-panel]").forEach(panel => {
    const active = panel.dataset.planePanel === name;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  document.querySelectorAll("[data-plane]").forEach(button => {
    const active = button.dataset.plane === name;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  const [title, subtitle] = planeMeta[name];
  document.querySelector("#page-title").textContent = title;
  document.querySelector("#page-subtitle").textContent = subtitle;
  history.replaceState(null, "", `#${name}`);
}
document.querySelectorAll("[data-plane]").forEach(button => button.addEventListener("click", () => activatePlane(button.dataset.plane)));
document.querySelectorAll("[data-jump]").forEach(button => button.addEventListener("click", () => activatePlane(button.dataset.jump)));

const requestedPlane = location.hash.slice(1);
if (planeMeta[requestedPlane]) activatePlane(requestedPlane);

const themeToggle = document.querySelector("#theme-toggle");
const storedTheme = localStorage.getItem("qortara-reference-theme");
if (storedTheme) document.documentElement.dataset.theme = storedTheme;
themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("qortara-reference-theme", next);
});
