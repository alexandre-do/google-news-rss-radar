import { useEffect, useState } from "react";
import { searchArticles, getArticle, getSources } from "../api.js";
import SearchBar from "../components/SearchBar.jsx";
import FilterBar from "../components/FilterBar.jsx";
import ArticleTable from "../components/ArticleTable.jsx";
import Pagination from "../components/Pagination.jsx";

const PAGE_SIZE = 20;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sources, setSources] = useState([]);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0 });
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSources().then(setSources).catch(() => setSources([]));
  }, []);

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, source, from, to]);

  async function runSearch() {
    try {
      setError(null);
      const data = await searchArticles({ q: query, source, from, to, page, pageSize: PAGE_SIZE });
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSearchSubmit() {
    setPage(1);
    runSearch();
  }

  async function handleSelect(uuid) {
    try {
      const article = await getArticle(uuid);
      setSelected(article);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <h1>Search Article</h1>
      <SearchBar value={query} onChange={setQuery} onSubmit={handleSearchSubmit} />
      <FilterBar
        sources={sources}
        source={source}
        onSourceChange={(v) => {
          setPage(1);
          setSource(v);
        }}
        from={from}
        to={to}
        onFromChange={(v) => {
          setPage(1);
          setFrom(v);
        }}
        onToChange={(v) => {
          setPage(1);
          setTo(v);
        }}
      />
      {error && <p className="error">{error}</p>}
      <ArticleTable articles={result.items} onSelect={handleSelect} />
      <Pagination page={page} pageSize={PAGE_SIZE} total={result.total} onPageChange={setPage} />

      {selected && (
        <div className="detail-panel">
          <button onClick={() => setSelected(null)}>Close</button>
          <h2>{selected.extraction?.title || selected.rss?.title}</h2>
          <p className="detail-meta">
            {selected.extraction?.author || "Unknown author"} ·{" "}
            {selected.rss?.source?.title || "Unknown source"}
          </p>
          <a href={selected.url} target="_blank" rel="noreferrer">
            {selected.url}
          </a>
          <p>{selected.extraction?.excerpt || selected.rss?.summary}</p>
        </div>
      )}
    </div>
  );
}
