import axios from "axios";
import type {
  Player,
  PlayerList,
  Team,
  TeamList,
  // PlayerSeason,
  PlayerSeasonList,
  Award,
  PaginatedResponse,
} from "../types";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Players
export const getPlayers = async (params?: {
  search?: string;
  ordering?: string;
  page?: number;
}): Promise<PaginatedResponse<PlayerList>> => {
  const response = await api.get("/players/", { params });
  return response.data;
};

export const getPlayer = async (id: number): Promise<Player> => {
  const response = await api.get(`/players/${id}/`);
  return response.data;
};

export const getPlayerAwards = async (id: number): Promise<Award[]> => {
  const response = await api.get(`/players/${id}/awards/`);
  return response.data;
};

export const getPlayerSeasons = async (
  id: number
): Promise<PlayerSeasonList[]> => {
  const response = await api.get(`/players/${id}/seasons/`);
  return response.data;
};

// Teams
export const getTeams = async (params?: {
  search?: string;
  league?: "NBA" | "ABA";
  is_active?: boolean;
}): Promise<PaginatedResponse<TeamList>> => {
  const response = await api.get("/teams/", { params });
  return response.data;
};

export const getTeam = async (id: number): Promise<Team> => {
  const response = await api.get(`/teams/${id}/`);
  return response.data;
};

export const getTeamRoster = async (
  id: number,
  season_year?: number
): Promise<PlayerSeasonList[]> => {
  const response = await api.get(`/teams/${id}/roster/`, {
    params: { season_year },
  });
  return response.data;
};

// Stats
export const getPlayerSeasonStats = async (params?: {
  league?: "NBA" | "ABA";
  season_year?: number;
  position?: string;
  min_ppg?: number;
}): Promise<PaginatedResponse<PlayerSeasonList>> => {
  const response = await api.get("/stats/", { params });
  return response.data;
};

export const getStatLeaders = async (params?: {
  stat?: string;
  league?: "NBA" | "ABA";
  season_year?: number;
}): Promise<PlayerSeasonList[]> => {
  const response = await api.get("/stats/leaders/", { params });
  return response.data;
};