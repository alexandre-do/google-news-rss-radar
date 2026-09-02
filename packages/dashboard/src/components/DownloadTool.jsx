import { useEffect, useRef, useState } from "react";
import { startDownload, getDownloadStatus } from "../api.js";

const STAGE_LABELS = {
  download: "Downloading HTML…",
  extract: "Extracting text…",
  enrich: "Running NER…",
};

const POLL_INTERVAL_MS = 800;

export default function DownloadTool() {
  const [limit, setLimit] = useState(20);
  const [retryFailed, setRetryFailed] = useState(false);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  function poll() {
    pollRef.current = setInterval(async () => {
      try {
        const status = await getDownloadStatus();
        setJob(status);
        if (status.status !== "running") {
          clearInterval(pollRef.current);
        }
      } catch (err) {
        clearInterval(pollRef.current);
        setError(err.message);
      }
    }, POLL_INTERVAL_MS);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setJob({ status: "running", stage: null, current: 0, total: 0 });
    try {
      await startDownload({ limit: Number(limit) || 0, retryFailed });
      poll();
    } catch (err) {
      setError(err.message);
      setJob(null);
    }
  }

  const running = job?.status === "running";
  const pct = job?.total ? Math.round((job.current / job.total) * 100) : running ? 0 : null;

  return (
    <section className="tool-card">
      <h2>Download &amp; enrich</h2>
      <p className="tool-description">
        Fetches HTML for collected articles, extracts their text, then runs NER on that text — this is what
        gives the entities column real values, since the enrichment stage has nothing to analyze until an
        article has been downloaded and extracted.
      </p>
      <form className="tool-form" onSubmit={handleSubmit}>
        <label>
          Batch size
          <input
            type="number"
            min="0"
            placeholder="0 = no limit"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={retryFailed} onChange={(e) => setRetryFailed(e.target.checked)} />
          Retry previously failed
        </label>
        <button type="submit" disabled={running}>
          {running ? "Running…" : "Run download"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {job && pct !== null && (
        <div className="progress">
          <div className="progress-label">
            <span>{running ? STAGE_LABELS[job.stage] || "Starting…" : "Done"}</span>
            <span>
              {job.total ? `${job.current} / ${job.total}` : ""} {pct}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {job?.status === "done" && (
        <p className="tool-result">
          Downloaded <strong>{job.results.downloaded}</strong> · Extracted{" "}
          <strong>{job.results.extracted}</strong> · Enriched (NER) <strong>{job.results.enriched}</strong>
        </p>
      )}
      {job?.status === "error" && <p className="error">{job.error}</p>}
    </section>
  );
}
