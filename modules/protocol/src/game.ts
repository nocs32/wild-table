// The game's phases, settings and limits (spec §4, §5.8).

// Only the lobby for now: rounds, the round's end and the podium come with the game itself
// (spec §10.3: lobby → round → round end → next round | podium → lobby).
export const gamePhases = ['lobby'] as const;

export type GamePhase = (typeof gamePhases)[number];

export interface GameSettings {
  // The round's winner scores the cards left in the other hands; first to this wins the match (D10).
  targetScore: number;
  // How long a turn lasts before the fuse runs out (D11).
  turnSeconds: number;
}

export type GameSettingKey = keyof GameSettings;

export const gameLimits = {
  targetScore: { min: 100, max: 500, step: 50 },
  turnSeconds: { min: 10, max: 40, step: 5 },
  // Made for 3 or 4, room for 6 (D8). Start will need two seats filled, people or bots (§4.2).
  minPlayers: 2,
  maxPlayers: 6,
} as const;

export const defaultGameSettings: GameSettings = {
  targetScore: 300,
  turnSeconds: 20,
};
