import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTeam, getTeamRoster } from "../api";
import type { Team, PlayerSeasonList } from "../types";

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [allRoster, setAllRoster] = useState<PlayerSeasonList[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableSeasons = [...new Set(allRoster.map((r) => r.season_year))].sort((a, b) => b - a);
  const roster = selectedSeason
    ? allRoster.filter((r) => r.season_year === selectedSeason)
    : allRoster;

  useEffect(() => {
    if (!id) return;
    Promise.all([getTeam(Number(id)), getTeamRoster(Number(id))])
      .then(([teamData, rosterData]) => {
        setTeam(teamData);
        setAllRoster(rosterData);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load team.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!team) return <p className="p-6 text-gray-500">Team not found.</p>;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {team.city} {team.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                team.league === "NBA"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {team.league}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                team.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {team.is_active ? "Active" : "Disbanded"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Founded</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{team.founded ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Disbanded</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{team.disbanded ?? "—"}</p>
          </div>
          {team.previous_name && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Previously</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {team.previous_city} {team.previous_name}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Roster</h2>
        {availableSeasons.length > 0 && (
          <select
            value={selectedSeason ?? ""}
            onChange={(e) => setSelectedSeason(e.target.value ? Number(e.target.value) : undefined)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All Seasons</option>
            {availableSeasons.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>

      {roster.length === 0 ? (
        <p className="text-gray-500">No roster data available.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Player</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Season</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">League</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">GP</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">PPG</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">RPG</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">APG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roster.map((entry) => (
                <tr
                  key={entry.id}
                  onClick={() => navigate(`/players/${entry.player.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {entry.player.first_name} {entry.player.last_name}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{entry.season_year}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      entry.league === "NBA"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {entry.league}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{entry.games_played}</td>
                  <td className="px-6 py-3 text-gray-600">{entry.points_per_game ?? "—"}</td>
                  <td className="px-6 py-3 text-gray-600">{entry.rebounds_per_game ?? "—"}</td>
                  <td className="px-6 py-3 text-gray-600">{entry.assists_per_game ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}