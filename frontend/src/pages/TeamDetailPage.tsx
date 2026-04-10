import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTeam, getTeamRoster } from "../api";
import type { Team, PlayerSeasonList } from "../types";

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [roster, setRoster] = useState<PlayerSeasonList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getTeam(Number(id)), getTeamRoster(Number(id))])
      .then(([teamData, rosterData]) => {
        setTeam(teamData);
        setRoster(rosterData);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load team.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!team) return <p>Team not found.</p>;

  return (
    <div>
      <h1>{team.city} {team.name}</h1>
      <p>League: {team.league}</p>
      <p>Founded: {team.founded ?? "N/A"}</p>
      <p>Status: {team.is_active ? "Active" : "Disbanded"}</p>
      {team.previous_name && (
        <p>Previously: {team.previous_city} {team.previous_name}</p>
      )}

      <h2>Roster</h2>
      {roster.length === 0 ? (
        <p>No roster data available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Season</th>
              <th>League</th>
              <th>GP</th>
              <th>PPG</th>
              <th>RPG</th>
              <th>APG</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.player.first_name} {entry.player.last_name}</td>
                <td>{entry.season_year}</td>
                <td>{entry.league}</td>
                <td>{entry.games_played}</td>
                <td>{entry.points_per_game ?? "N/A"}</td>
                <td>{entry.rebounds_per_game ?? "N/A"}</td>
                <td>{entry.assists_per_game ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}