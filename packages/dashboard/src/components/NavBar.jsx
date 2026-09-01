import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="navbar">
      <span className="navbar-title">News Scraping</span>
      <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
        Search
      </NavLink>
      <NavLink to="/trends" className={({ isActive }) => (isActive ? "active" : "")}>
        Trends
      </NavLink>
    </nav>
  );
}
