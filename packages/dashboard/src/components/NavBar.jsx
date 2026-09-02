import { NavLink } from "react-router-dom";

function RssIcon() {
  return (
    <svg
      className="navbar-icon"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
    </svg>
  );
}

export default function NavBar() {
  return (
    <nav className="navbar">
      <span className="navbar-title">
        <RssIcon />
        Google News RSS Search Engine
      </span>
      <NavLink to="/pipeline" className={({ isActive }) => (isActive ? "active" : "")}>
        Data Ingestion
      </NavLink>
      <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
        Look Up Data
      </NavLink>
      <NavLink to="/trends" className={({ isActive }) => (isActive ? "active" : "")}>
        Data Analyst
      </NavLink>
    </nav>
  );
}
