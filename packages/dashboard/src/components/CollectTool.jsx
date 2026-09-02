import { useState } from "react";
import { collectArticles } from "../api.js";

export default function CollectTool() {
  const [keywords, setKeywords] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!keywords || !dateFrom || !dateTo) return;

    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const { collected } = await collectArticles({ keywords, dateFrom, dateTo });
      setResult({ collected, keywords, dateFrom, dateTo });
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="tool-card">
      <h2>Search Google News</h2>
      <p className="tool-description">
        Query Google News RSS for a keyword over a date range and store matching articles.
      </p>
      <form className="tool-form" onSubmit={handleSubmit}>
        <label>
          Keywords
          <input
            type="text"
            placeholder="e.g. climate change"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            required
          />
        </label>
        <label>
          From
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required />
        </label>
        <label>
          To
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} required />
        </label>
        <button type="submit" disabled={running}>
          {running ? "Searching…" : "Run search"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {result && (
        <p className="tool-result">
          Collected <strong>{result.collected}</strong> article{result.collected === 1 ? "" : "s"} for “
          {result.keywords}” between {result.dateFrom} and {result.dateTo}.
        </p>
      )}
    </section>
  );
}
