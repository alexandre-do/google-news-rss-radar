import CollectTool from "../components/CollectTool.jsx";
import DownloadTool from "../components/DownloadTool.jsx";
import ResetTool from "../components/ResetTool.jsx";

export default function PipelinePage() {
  return (
    <div className="page">
      <h1>Data Ingestion</h1>
      <p className="page-subtitle">
        Run the collection pipeline in order: search Google News RSS for new articles, then download and
        enrich them so they show up with entities on the Look Up Data page.
      </p>
      <div className="tool-grid">
        <CollectTool />
        <DownloadTool />
      </div>

      <h2 className="section-heading">Danger zone</h2>
      <div className="tool-grid">
        <ResetTool />
      </div>
    </div>
  );
}
