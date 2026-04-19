import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlayer, getPlayerSeasons } from "../api";
import type { Player, PlayerSeasonList } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type StatKey = keyof PlayerSeasonList;

interface StatOption {
  label: string;
  key: StatKey;
  decimals: number;
}

const STAT_GROUPS: { group: string; stats: StatOption[] }[] = [
  {
    group: "Per Game",
    stats: [
      { label: "PPG", key: "points_per_game", decimals: 1 },
      { label: "RPG", key: "rebounds_per_game", decimals: 1 },
      { label: "APG", key: "assists_per_game", decimals: 1 },
      { label: "SPG", key: "steals_per_game", decimals: 1 },
      { label: "BPG", key: "blocks_per_game", decimals: 1 },
      { label: "TOV", key: "turnovers_per_game", decimals: 1 },
    ],
  },
  {
    group: "Shooting",
    stats: [
      { label: "FG%", key: "field_goal_percentage", decimals: 3 },
      { label: "3P%", key: "three_point_percentage", decimals: 3 },
      { label: "FT%", key: "free_throw_percentage", decimals: 3 },
    ],
  },
  {
    group: "Advanced",
    stats: [
      { label: "PER", key: "player_efficiency_rating", decimals: 1 },
      { label: "TS%", key: "true_shooting_percentage", decimals: 3 },
      { label: "WS", key: "win_shares", decimals: 1 },
      { label: "BPM", key: "box_plus_minus", decimals: 1 },
      { label: "VORP", key: "value_over_replacement", decimals: 1 },
    ],
  },
];

interface TooltipPayloadItem {
  payload: PlayerSeasonList & { statValue: number | null };
}

function CustomTooltip({
  active,
  payload,
  selectedStat,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  selectedStat: StatOption;
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-sm">
      <p className="font-semibold text-gray-900">{d.season_year} — {d.team.abbreviation}</p>
      <p className="text-gray-600">
        {selectedStat.label}: {d.statValue !== null ? Number(d.statValue).toFixed(selectedStat.decimals) : "—"}
      </p>
    </div>
  );
}

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [seasons, setSeasons] = useState<PlayerSeasonList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chart" | "table">("table");
  const [selectedStat, setSelectedStat] = useState<StatOption>(STAT_GROUPS[0].stats[0]);

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

  const chartData = seasons.reduce<{ season_year: number; statValue: number | null; team: { abbreviation: string } }[]>((acc, s) => {
    const existing = acc.find((d) => d.season_year === s.season_year);
    const val = s[selectedStat.key] as number | null;
    if (existing) {
      if (existing.statValue !== null && val !== null) {
        existing.statValue = parseFloat(
          (((existing.statValue as number) + val) / 2).toFixed(10)
        );
      }
      existing.team = { abbreviation: "TOT" };
    } else {
      acc.push({ season_year: s.season_year, statValue: val, team: s.team });
    }
    return acc;
  }, []);

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

      {/* Tab toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Career Stats</h2>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setActiveTab("table")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "table"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setActiveTab("chart")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "chart"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Chart
          </button>
        </div>
      </div>

      {seasons.length === 0 ? (
        <p className="text-gray-500">No season data available.</p>
      ) : activeTab === "chart" ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {/* Stat selector */}
          <div className="space-y-3 mb-6">
            {STAT_GROUPS.map((group) => (
              <div key={group.group} className="flex items-center gap-4">
                <span className="text-xs text-gray-400 uppercase tracking-wide w-16">{group.group}</span>
                <div className="flex flex-wrap gap-2">
                  {group.stats.map((stat) => (
                    <button
                      key={stat.key as string}
                      onClick={() => setSelectedStat(stat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selectedStat.key === stat.key
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {stat.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="season_year"
                type="number"
                domain={["dataMin", "dataMax"]}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickLine={false}
              />
              <YAxis
                type="number"
                domain={["auto", "auto"]}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => Number(v).toFixed(selectedStat.decimals === 3 ? 2 : 0)}
              />
              <Tooltip content={<CustomTooltip selectedStat={selectedStat} />} />
              <Line
                type="monotone"
                dataKey="statValue"
                stroke="#111827"
                strokeWidth={2}
                dot={{ r: 3, fill: "#111827" }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
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