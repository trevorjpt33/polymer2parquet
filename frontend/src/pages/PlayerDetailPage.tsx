import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlayer, getPlayerSeasons } from "../api";
import type { Player, PlayerSeasonList } from "../types";

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [seasons, setSeasons] = useState<PlayerSeasonList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getPlayer(Number(id)), getPlayerSeasons(Number(id))])
      .then(([playerData, seasonsData]) => {
        setPlayer(playerData);
        setSeasons(seasonsData);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load player.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!player) return <p className="p-6 text-gray-500">Player not found.</p>;

  const heightDisplay = player.height_inches
    ? `${Math.floor(player.height_inches / 12)}'${player.height_inches % 12}"`
    : "—";

  const fmt = (val: number | null, decimals = 1) =>
    val !== null && val !== undefined ? Number(val).toFixed(decimals) : "—";

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        ← Back
      </button>

      {/* Player header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {player.first_name} {player.last_name}
            </h1>
            <p className="text-gray-500 mt-1">
              {player.position ? (
                <>
                  <span className="font-semibold text-gray-900">{player.position.split(",")[0]}</span>
                  {player.position.split(",").slice(1).join(",") && (
                    <span className="text-gray-400">{","}{player.position.split(",").slice(1).join(",")}</span>
                  )}
                </>
              ) : "—"}
            </p>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            player.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}>
            {player.is_active ? "Active" : "Retired"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Country</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{player.country || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">College</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {(!player.college || player.college === "NA") ? "—" : player.college}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Height</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{heightDisplay}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Weight</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {player.weight_lbs ? `${player.weight_lbs} lbs` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Career Stats */}
      <h2 className="text-xl font-bold text-gray-900 mb-3">Career Stats</h2>
      {seasons.length === 0 ? (
        <p className="text-gray-500">No season data available.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Season</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Lg</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Team</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">GP</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">PPG</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">RPG</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">APG</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">SPG</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">BPG</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">TOV</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">FG%</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">3P%</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">FT%</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">PER</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">TS%</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">WS</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">BPM</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">VORP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {seasons.map((season) => (
                <tr key={season.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900">{season.season_year}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      season.league === "NBA"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {season.league}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{season.team.abbreviation}</td>
                  <td className="px-4 py-3 text-gray-600">{season.games_played}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.points_per_game)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.rebounds_per_game)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.assists_per_game)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.steals_per_game)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.blocks_per_game)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.turnovers_per_game)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.field_goal_percentage, 3)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.three_point_percentage, 3)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.free_throw_percentage, 3)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.player_efficiency_rating)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.true_shooting_percentage, 3)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.win_shares)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.box_plus_minus)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(season.value_over_replacement)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}