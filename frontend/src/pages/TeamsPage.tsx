import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTeams } from "../api";
import type { TeamList } from "../types";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [league, setLeague] = useState<"NBA" | "ABA" | "">("");
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState("1");
  const [pageTimer, setPageTimer] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const navigate = useNavigate();
  const PAGE_SIZE = 100;

  useEffect(() => {
    setLoading(true);
    getTeams({ search, league: league || undefined, page })
      .then((data) => {
        setTeams(data.results);
        setTotalCount(data.count);
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load teams.");
        setLoading(false);
      });
  }, [search, league, page]);

  useEffect(() => {
    setInputPage(String(page));
  }, [page]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCount.toLocaleString()} teams</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={league}
            onChange={(e) => { setLeague(e.target.value as "NBA" | "ABA" | ""); setPage(1); }}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All Leagues</option>
            <option value="NBA">NBA</option>
            <option value="ABA">ABA</option>
          </select>
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-64 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Table */}
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Team</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">League</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                    Loading teams...
                  </td>
                </tr>
              ) : teams.map((team) => (
                <tr
                  key={team.id}
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {team.city} {team.name}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      team.league === "NBA"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {team.league}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      team.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {team.is_active ? "Active" : "Disbanded"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!error && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <p>Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrev}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={inputPage}
              onChange={(e) => {
                setInputPage(e.target.value);
                const val = parseInt(e.target.value);
                if (val >= 1 && val <= totalPages) {
                  clearTimeout(pageTimer);
                  setPageTimer(setTimeout(() => setPage(val), 1500));
                }
              }}
              onBlur={(e) => {
                const val = parseInt(e.target.value);
                if (val >= 1 && val <= totalPages) setPage(val);
                else setInputPage(String(page));
              }}
              className="w-16 px-2 py-2 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}