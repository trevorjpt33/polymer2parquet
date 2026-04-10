import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayers } from "../api";
import type { PlayerList } from "../types";

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getPlayers()
      .then((data) => {
        setPlayers(data.results);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load players.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading players...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Players</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Country</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr
              key={player.id}
              onClick={() => navigate(`/players/${player.id}`)}
              style={{ cursor: "pointer" }}
            >
              <td>{player.first_name} {player.last_name}</td>
              <td>{player.position}</td>
              <td>{player.country}</td>
              <td>{player.is_active ? "Active" : "Retired"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}