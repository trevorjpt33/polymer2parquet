import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PlayersPage from "./pages/PlayersPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import ComparePage from "./pages/ComparePage";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-gray-900 text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
            polymer2parquet
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/players">Players</NavLink>
            <NavLink to="/teams">Teams</NavLink>
            <NavLink to="/compare">Compare</NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:id" element={<PlayerDetailPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}