const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error || `Request to ${path} failed with status ${res.status}`);
  }
  return res.json();
}

export function searchArticles({ q, source, from, to, page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (source) params.set("source", source);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  params.set("page", page);
  params.set("pageSize", pageSize);
  return request(`/api/articles?${params.toString()}`);
}

export function getArticle(uuid) {
  return request(`/api/articles/${uuid}`);
}

export function getSources() {
  return request("/api/sources");
}

export function getTrends({ dimension = "day", from, to, source } = {}) {
  const params = new URLSearchParams({ dimension });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (source) params.set("source", source);
  return request(`/api/trends?${params.toString()}`);
}

// Pipeline stage triggers ---------------------------------------------

// Collect stage: search Google News RSS for a keyword/date range.
export function collectArticles({ keywords, dateFrom, dateTo, timeDelta }) {
  return request("/api/pipeline/collect", {
    method: "POST",
    body: { keywords, dateFrom, dateTo, timeDelta },
  });
}

// Download -> extract -> enrich (NER) chain over pending articles. Runs as
// a background job on the server; poll getDownloadStatus() for progress.
export function startDownload({ limit, concurrency, retryFailed } = {}) {
  return request("/api/pipeline/download", {
    method: "POST",
    body: { limit, concurrency, retryFailed },
  });
}

export function getDownloadStatus() {
  return request("/api/pipeline/download/status");
}

// Deletes every article, resetting the app back to empty.
export function resetArticles() {
  return request("/api/pipeline/reset", {
    method: "POST",
    body: { confirm: "RESET" },
  });
}
