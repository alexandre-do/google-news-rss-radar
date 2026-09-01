function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
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
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {articles.map((article) => (
          <tr key={article.uuid} onClick={() => onSelect(article.uuid)}>
            <td>{article.extraction?.title || article.rss?.title || "Untitled"}</td>
            <td>{article.rss?.source?.title || "—"}</td>
            <td>{formatDate(article.extraction?.publishedDate || article.rss?.publishedParsed)}</td>
            <td>{article.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
