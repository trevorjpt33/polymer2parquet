import { useEffect, useState } from "react";
import { getPlayers, getPlayer, getPlayerSeasons, getPlayerAwards } from "../api";
import type { Player, PlayerList, PlayerSeasonList, Award } from "../types";

interface PlayerData {
  player: Player;
  seasons: PlayerSeasonList[];
  awards: Award[];
}

function weightedAvg(seasons: PlayerSeasonList[], key: keyof PlayerSeasonList): number | null {
  const valid = seasons.filter((s) => s[key] !== null && s[key] !== undefined && s.games_played > 0);
  if (valid.length === 0) return null;
  const totalGames = valid.reduce((sum, s) => sum + s.games_played, 0);
  const weighted = valid.reduce((sum, s) => sum + (parseFloat(s[key] as string)) * s.games_played, 0);
  return weighted / totalGames;
}

function sumStat(seasons: PlayerSeasonList[], key: keyof PlayerSeasonList): number {
  return seasons.reduce((sum, s) => sum + (parseFloat(s[key] as string) || 0), 0);
}

function fmt(val: number | null, decimals = 1): string {
  if (val === null) return "—";
  return val.toFixed(decimals);
}

function countAwardsOrDash(awards: Award[], types: string[]): string {
  const count = awards.filter((a) => types.includes(a.award_type)).length;
  return count > 0 ? String(count) : "—";
}

const STAT_ROWS: { label: string; getValue: (d: PlayerData) => string }[] = [
  // Per game
  { label: "Games Played", getValue: (d) => String(sumStat(d.seasons, "games_played")) },
  { label: "PPG", getValue: (d) => fmt(weightedAvg(d.seasons, "points_per_game")) },
  { label: "RPG", getValue: (d) => fmt(weightedAvg(d.seasons, "rebounds_per_game")) },
  { label: "APG", getValue: (d) => fmt(weightedAvg(d.seasons, "assists_per_game")) },
  { label: "SPG", getValue: (d) => fmt(weightedAvg(d.seasons, "steals_per_game")) },
  { label: "BPG", getValue: (d) => fmt(weightedAvg(d.seasons, "blocks_per_game")) },
  { label: "TOV", getValue: (d) => fmt(weightedAvg(d.seasons, "turnovers_per_game")) },
  // Shooting
  { label: "FG%", getValue: (d) => fmt(weightedAvg(d.seasons, "field_goal_percentage"), 3) },
  { label: "3P%", getValue: (d) => fmt(weightedAvg(d.seasons, "three_point_percentage"), 3) },
  { label: "FT%", getValue: (d) => fmt(weightedAvg(d.seasons, "free_throw_percentage"), 3) },
  // Advanced
  { label: "PER", getValue: (d) => fmt(weightedAvg(d.seasons, "player_efficiency_rating")) },
  { label: "TS%", getValue: (d) => fmt(weightedAvg(d.seasons, "true_shooting_percentage"), 3) },
  { label: "WS", getValue: (d) => fmt(sumStat(d.seasons, "win_shares") || null) },
  { label: "BPM", getValue: (d) => fmt(weightedAvg(d.seasons, "box_plus_minus")) },
  { label: "VORP", getValue: (d) => fmt(sumStat(d.seasons, "value_over_replacement") || null) },
  // Accolades
  { label: "All-Star", getValue: (d) => countAwardsOrDash(d.awards, ["ALL_STAR"]) },
  { label: "All-NBA/ABA", getValue: (d) => countAwardsOrDash(d.awards, ["ALL_NBA_1", "ALL_NBA_2", "ALL_NBA_3", "ALL_ABA_1", "ALL_ABA_2"]) },
  { label: "MVP", getValue: (d) => countAwardsOrDash(d.awards, ["MVP", "ABA_MVP"]) },
  { label: "DPOY", getValue: (d) => countAwardsOrDash(d.awards, ["DPOY"]) },
  { label: "ROY", getValue: (d) => countAwardsOrDash(d.awards, ["ROY", "ABA_ROY"]) },
];

const SECTION_HEADERS: Record<number, string> = {
  0: "Per Game",
  7: "Shooting",
  10: "Advanced",
  15: "Accolades",
};

function PlayerSearch({
  slot,
  onSelect,
  selected,
  onClear,
}: {
  slot: number;
  onSelect: (player: Player) => void;
  selected: Player | null;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    setSearching(true);
    const timer = setTimeout(() => {
      getPlayers({ search: query, page: 1 })
        .then((data) => setResults(data.results as unknown as Player[]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  if (selected) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-gray-900 text-lg">
              {selected.first_name} {selected.last_name}
            </p>
            <p className="text-sm text-gray-500">
              {selected.position ? (
                <>
                  <span className="font-semibold text-gray-900">{selected.position.split(",")[0]}</span>
                  {selected.position.split(",").slice(1).join(",") && (
                    <span className="text-gray-400">{","}{selected.position.split(",").slice(1).join(",")}</span>
                  )}
                </>
              ) : "—"}
            </p>
          </div>
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            ✕ Remove
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-400 uppercase tracking-wide">Height</p>
            <p className="font-medium text-gray-800">
              {selected.height_inches
                ? `${Math.floor(selected.height_inches / 12)}'${selected.height_inches % 12}"`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-wide">Weight</p>
            <p className="font-medium text-gray-800">
              {selected.weight_lbs ? `${selected.weight_lbs} lbs` : "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-wide">College</p>
            <p className="font-medium text-gray-800">
              {(!selected.college || selected.college === "NA") ? "—" : selected.college}
            </p>
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-wide">Status</p>
            <p className="font-medium text-gray-800">
              {selected.is_active ? "Active" : "Retired"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={`Search player ${slot}...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      {searching && (
        <p className="absolute top-full mt-1 text-xs text-gray-400 px-2">Searching...</p>
      )}
      {results.length > 0 && (
        <ul className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((p) => (
            <li
              key={p.id}
              onClick={() => { onSelect(p); setQuery(""); setResults([]); }}
              className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between"
            >
              <span>{p.first_name} {p.last_name}</span>
              <span className="ml-2 text-xs">
                {p.position ? (
                  <>
                    <span className="font-semibold text-gray-700">{p.position.split(",")[0]}</span>
                    {p.position.split(",").slice(1).join(",") && (
                      <span className="text-gray-400">{","}{p.position.split(",").slice(1).join(",")}</span>
                    )}
                  </>
                ) : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [slots, setSlots] = useState<(Player | null)[]>([null, null, null]);
  const [playerData, setPlayerData] = useState<(PlayerData | null)[]>([null, null, null]);

  const handleSelect = async (index: number, player: PlayerList) => {
    const newSlots = [...slots];
    newSlots[index] = player as unknown as Player;
    setSlots(newSlots);

    const [fullPlayer, seasons, awards] = await Promise.all([
      getPlayer(player.id),
      getPlayerSeasons(player.id),
      getPlayerAwards(player.id),
    ]);
    const newData = [...playerData];
    newData[index] = { player: fullPlayer, seasons, awards };
    setPlayerData(newData);

    const updatedSlots = [...newSlots];
    updatedSlots[index] = fullPlayer;
    setSlots(updatedSlots);
  };

  const handleClear = (index: number) => {
    const newSlots = [...slots];
    const newData = [...playerData];
    newSlots[index] = null;
    newData[index] = null;
    setSlots(newSlots);
    setPlayerData(newData);
  };

  const activeCount = slots.filter(Boolean).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compare Players</h1>
        <p className="text-sm text-gray-500 mt-1">Select up to 3 players to compare</p>
      </div>

      {/* Player selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {slots.map((slot, i) => (
          <PlayerSearch
            key={i}
            slot={i + 1}
            selected={slot}
            onSelect={(p) => handleSelect(i, p)}
            onClear={() => handleClear(i)}
          />
        ))}
      </div>

      {/* Comparison table */}
      {activeCount >= 2 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 font-semibold text-gray-600 w-40">Stat</th>
                {slots.map((slot, i) =>
                  slot ? (
                    <th key={i} className="text-left px-6 py-3 font-semibold text-gray-900">
                      {slot.first_name} {slot.last_name}
                    </th>
                  ) : null
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {STAT_ROWS.map((row, i) => (
                <>
                  {SECTION_HEADERS[i] && (
                    <tr key={`header-${i}`} className="bg-gray-50">
                      <td
                        colSpan={activeCount + 1}
                        className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide"
                      >
                        {SECTION_HEADERS[i]}
                      </td>
                    </tr>
                  )}
                  <tr key={row.label} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-600">{row.label}</td>
                    {playerData.map((data, j) =>
                      slots[j] ? (
                        <td key={j} className="px-6 py-3 text-gray-900">
                          {data ? row.getValue(data) : "—"}
                        </td>
                      ) : null
                    )}
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeCount < 2 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Select at least 2 players to see a comparison</p>
        </div>
      )}
    </div>
  );
}