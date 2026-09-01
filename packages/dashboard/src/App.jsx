import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import TrendsPage from "./pages/TrendsPage.jsx";

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/trends" element={<TrendsPage />} />
        </Routes>
      </main>
    </>
  );
}
