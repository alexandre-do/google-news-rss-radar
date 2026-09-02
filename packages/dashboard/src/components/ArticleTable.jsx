const MAX_ENTITIES = 4;

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function formatStatus(status) {
  return (status || "").replace(/_/g, " ");
}

function EntityTags({ entities }) {
  if (!entities?.length) {
    return <span className="empty-state">—</span>;
  }

  const named = entities.filter((e) => e.type !== "keyword");
  const shown = (named.length ? named : entities).slice(0, MAX_ENTITIES);
  const remaining = (named.length ? named : entities).length - shown.length;

  return (
    <div className="entity-tags">
      {shown.map((entity, i) => (
        <span key={`${entity.text}-${i}`} className={`entity-tag entity-${entity.type}`}>
          {entity.text}
        </span>
      ))}
      {remaining > 0 && <span className="entity-tag entity-more">+{remaining}</span>}
    </div>
  );
}

export default function ArticleTable({ articles, onSelect }) {
  if (!articles.length) {
    return <p className="empty-state">No articles found.</p>;
  }

  return (
    <table className="article-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Source</th>
          <th>Published</th>
          <th>Entities</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {articles.map((article) => (
          <tr key={article.uuid} onClick={() => onSelect(article.uuid)}>
            <td className="col-title">{article.extraction?.title || article.rss?.title || "Untitled"}</td>
            <td>{article.rss?.source?.title || "—"}</td>
            <td>{formatDate(article.extraction?.publishedDate || article.rss?.publishedParsed)}</td>
            <td>
              <EntityTags entities={article.enrichment?.entities} />
            </td>
            <td>
              <span className={`status-badge status-${article.status}`}>{formatStatus(article.status)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
