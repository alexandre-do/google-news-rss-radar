import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import PipelinePage from "./pages/PipelinePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import TrendsPage from "./pages/TrendsPage.jsx";

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/" element={<SearchPage />} />
          <Route path="/trends" element={<TrendsPage />} />
        </Routes>
      </main>
    </>
  );
}
