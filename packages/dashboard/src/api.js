const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
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
