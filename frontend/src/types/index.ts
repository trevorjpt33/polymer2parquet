export interface Player {
  id: number;
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  birth_date: string | null;
  country: string;
  college: string;
  height_inches: number | null;
  weight_lbs: number | null;
  is_active: boolean;
  awards?: Award[];
}

export interface PlayerList {
  id: number;
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  country: string;
  is_active: boolean;
}

export interface Award {
  id: number;
  award_type: string;
  season_year: number;
  league: "NBA" | "ABA";
  notes: string;
}

export interface Team {
  id: number;
  name: string;
  city: string;
  abbreviation: string;
  league: "NBA" | "ABA";
  founded: number | null;
  disbanded: number | null;
  is_active: boolean;
  previous_name: string;
  previous_city: string;
}

export interface TeamList {
  id: number;
  name: string;
  city: string;
  abbreviation: string;
  league: "NBA" | "ABA";
  is_active: boolean;
}

export interface PlayerSeason {
  id: number;
  player: PlayerList;
  team: TeamList;
  season_year: number;
  league: "NBA" | "ABA";
  age: number | null;
  games_played: number;
  games_started: number;
  minutes_per_game: number | null;
  points_per_game: number | null;
  rebounds_per_game: number | null;
  assists_per_game: number | null;
  steals_per_game: number | null;
  blocks_per_game: number | null;
  turnovers_per_game: number | null;
  field_goal_percentage: number | null;
  three_point_percentage: number | null;
  free_throw_percentage: number | null;
  player_efficiency_rating: number | null;
  true_shooting_percentage: number | null;
  win_shares: number | null;
  box_plus_minus: number | null;
  value_over_replacement: number | null;
}

export interface PlayerSeasonList {
  id: number;
  player: PlayerList;
  team: TeamList;
  season_year: number;
  league: "NBA" | "ABA";
  games_played: number;
  points_per_game: number | null;
  rebounds_per_game: number | null;
  assists_per_game: number | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}