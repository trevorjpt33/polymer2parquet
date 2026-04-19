import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayers } from "../api";
import type { PlayerList } from "../types";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];
const LEAGUES = ["NBA", "ABA"];
const STATUSES = [{ label: "Active", value: "true" }, { label: "Retired", value: "false" }];
const ERAS = [
  { label: "1940s", value: "1946" },
  { label: "1950s", value: "1950" },
  { label: "1960s", value: "1960" },
  { label: "1970s", value: "1970" },
  { label: "1980s", value: "1980" },
  { label: "1990s", value: "1990" },
  { label: "2000s", value: "2000" },
  { label: "2010s", value: "2010" },
  { label: "2020s", value: "2020" },
];

function PillGroup<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { label: string; value: T }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              active
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState("1");
  const [pageTimer, setPageTimer] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const navigate = useNavigate();
  const PAGE_SIZE = 100;

  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  useEffect(() => {
    setLoading(true);
    getPlayers({
      search: search || undefined,
      page,
      position: selectedPositions.length ? selectedPositions.join(",") : undefined,
      is_active: selectedStatuses.length === 1 ? selectedStatuses[0] : undefined,
      league: selectedLeagues.length ? selectedLeagues.join(",") : undefined,
      era: selectedEras.length ? selectedEras.join(",") : undefined,
    })
      .then((data) => {
        setPlayers(data.results);
        setTotalCount(data.count);
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load players.");
        setLoading(false);
      });
  }, [search, page, selectedPositions, selectedLeagues, selectedStatuses, selectedEras]);

  useEffect(() => {
    setInputPage(String(page));
  }, [page]);

  const resetFilters = () => {
    setSearch("");
    setSelectedPositions([]);
    setSelectedLeagues([]);
    setSelectedStatuses([]);
    setSelectedEras([]);
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    selectedPositions.length ||
    selectedLeagues.length ||
    selectedStatuses.length ||
    selectedEras.length;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Players</h1>
            <p className="text-sm text-gray-500 mt-1">{totalCount.toLocaleString()} players</p>
          </div>
          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4"
        />

        {/* Filter pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 uppercase tracking-wide w-16">Position</span>
            <PillGroup
              options={POSITIONS.map((p) => ({ label: p, value: p }))}
              selected={selectedPositions}
              onToggle={(v) => { setSelectedPositions(toggle(selectedPositions, v)); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 uppercase tracking-wide w-16">League</span>
            <PillGroup
              options={LEAGUES.map((l) => ({ label: l, value: l }))}
              selected={selectedLeagues}
              onToggle={(v) => { setSelectedLeagues(toggle(selectedLeagues, v)); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 uppercase tracking-wide w-16">Status</span>
            <PillGroup
              options={STATUSES}
              selected={selectedStatuses}
              onToggle={(v) => { setSelectedStatuses(toggle(selectedStatuses, v)); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 uppercase tracking-wide w-16">Era</span>
            <PillGroup
              options={ERAS}
              selected={selectedEras}
              onToggle={(v) => { setSelectedEras(toggle(selectedEras, v)); setPage(1); }}
            />
          </div>
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
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Position</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Country</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Loading players...
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    No players found matching your filters.
                  </td>
                </tr>
              ) : players.map((player) => (
                <tr
                  key={player.id}
                  onClick={() => navigate(`/players/${player.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {player.first_name} {player.last_name}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {player.position ? (
                      <>
                        <span className="font-semibold text-gray-900">{player.position.split(",")[0]}</span>
                        {player.position.split(",").slice(1).join(",") && (
                          <span className="text-gray-400">{","}{player.position.split(",").slice(1).join(",")}</span>
                        )}
                      </>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{player.country || "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      player.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {player.is_active ? "Active" : "Retired"}
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