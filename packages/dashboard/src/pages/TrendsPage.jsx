import { useEffect, useState } from "react";
import { getTrends } from "../api.js";

export default function TrendsPage() {
  const [dimension, setDimension] = useState("day");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTrends({ dimension })
      .then(setRows)
      .catch((err) => setError(err.message));
  }, [dimension]);

  return (
    <div className="page">
      <h1>Trends</h1>
      <div className="filter-bar">
        <label>
          Group by
          <select value={dimension} onChange={(e) => setDimension(e.target.value)}>
            <option value="day">Day</option>
            <option value="source">Source</option>
          </select>
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <table className="article-table">
        <thead>
          <tr>
            <th>{dimension === "day" ? "Date" : "Source"}</th>
            <th>Article count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.date || row.source}>
              <td>{row.date || row.source}</td>
              <td>{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && !error && <p className="empty-state">No data yet — run the pipeline first.</p>}
    </div>
  );
}
