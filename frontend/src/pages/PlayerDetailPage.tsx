import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlayer, getPlayerSeasons } from "../api";
import type { Player, PlayerSeasonList } from "../types";

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!player) return <p>Player not found.</p>;

  return (
    <div>
      <h1>{player.first_name} {player.last_name}</h1>
      <p>Position: {player.position}</p>
      <p>Country: {player.country}</p>
      <p>College: {player.college || "N/A"}</p>
      <p>Status: {player.is_active ? "Active" : "Retired"}</p>

      <h2>Career Stats</h2>
      {seasons.length === 0 ? (
        <p>No season data available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Season</th>
              <th>League</th>
              <th>Team</th>
              <th>GP</th>
              <th>PPG</th>
              <th>RPG</th>
              <th>APG</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((season) => (
              <tr key={season.id}>
                <td>{season.season_year}</td>
                <td>{season.league}</td>
                <td>{season.team.abbreviation}</td>
                <td>{season.games_played}</td>
                <td>{season.points_per_game ?? "N/A"}</td>
                <td>{season.rebounds_per_game ?? "N/A"}</td>
                <td>{season.assists_per_game ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}