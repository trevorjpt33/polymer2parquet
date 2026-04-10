import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTeams } from "../api";
import type { TeamList } from "../types";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getTeams()
      .then((data) => {
        setTeams(data.results);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load teams.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading teams...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Teams</h1>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>League</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr
              key={team.id}
              onClick={() => navigate(`/teams/${team.id}`)}
              style={{ cursor: "pointer" }}
            >
              <td>{team.city} {team.name}</td>
              <td>{team.league}</td>
              <td>{team.is_active ? "Active" : "Disbanded"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}