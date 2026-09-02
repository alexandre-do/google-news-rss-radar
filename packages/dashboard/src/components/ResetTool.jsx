import { useState } from "react";
import { resetArticles } from "../api.js";

const CONFIRM_PHRASE = "RESET";

export default function ResetTool() {
  const [confirmText, setConfirmText] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (confirmText !== CONFIRM_PHRASE) return;

    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const { deleted } = await resetArticles();
      setResult(deleted);
      setConfirmText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="tool-card tool-card-danger">
      <h2>Reset all data</h2>
      <p className="tool-description">
        Permanently deletes every collected article — collected, downloaded, extracted, and enriched. This
        cannot be undone.
      </p>
      <form className="tool-form" onSubmit={handleSubmit}>
        <label>
          Type {CONFIRM_PHRASE} to confirm
          <input
            type="text"
            placeholder={CONFIRM_PHRASE}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </label>
        <button type="submit" className="btn-danger" disabled={running || confirmText !== CONFIRM_PHRASE}>
          {running ? "Deleting…" : "Delete all articles"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {result !== null && (
        <p className="tool-result tool-result-danger">
          Deleted <strong>{result}</strong> article{result === 1 ? "" : "s"}.
        </p>
      )}
    </section>
  );
}
