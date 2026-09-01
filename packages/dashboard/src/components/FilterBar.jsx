export default function FilterBar({ sources, source, onSourceChange, from, to, onFromChange, onToChange }) {
  return (
    <div className="filter-bar">
      <label>
        Source
        <select value={source} onChange={(e) => onSourceChange(e.target.value)}>
          <option value="">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label>
        From
        <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} />
      </label>
      <label>
        To
        <input type="date" value={to} onChange={(e) => onToChange(e.target.value)} />
      </label>
    </div>
  );
}
