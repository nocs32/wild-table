// The game's phases, settings and limits (spec §4, §5.7, §5.8).

// lobby → round → roundOver → round … → podium → lobby (spec §10.3).
export const gamePhases = ['lobby', 'round', 'roundOver', 'podium'] as const;

export type GamePhase = (typeof gamePhases)[number];

// The house rules (spec §5.7): lobby switches, all off by default (the official rules, D6).
export const houseRules = ['stacking', 'jumpIn', 'sevenZero', 'drawUntilPlayable', 'wild4AnyTime'] as const;

export type HouseRule = (typeof houseRules)[number];

export type HouseRules = Record<HouseRule, boolean>;

export interface GameSettings {
  // The round's winner scores the cards left in the other hands; first to this wins the match (D10).
  targetScore: number;
  // How long a turn lasts before the fuse runs out (D11).
  turnSeconds: number;
  // Cards dealt to each player at the start of a round. The official rules deal 7.
  handSize: number;
  houseRules: HouseRules;
}

// The settings that are numbers, each set with a slider.
export type GameSettingKey = 'targetScore' | 'turnSeconds' | 'handSize';

// A change from someone at the table: any of the numbers, and any of the switches.
export type GameSettingsPatch = Partial<Pick<GameSettings, GameSettingKey>> & { houseRules?: Partial<HouseRules> };

export const gameLimits = {
  targetScore: { min: 100, max: 500, step: 50 },
  turnSeconds: { min: 10, max: 40, step: 5 },
  handSize: { min: 5, max: 10, step: 1 },
  // Made for 3 or 4, room for 6 (D8). Start needs two seats filled, people or bots (§4.2).
  minPlayers: 2,
  maxPlayers: 6,
} as const;

export const defaultGameSettings: GameSettings = {
  targetScore: 300,
  turnSeconds: 20,
  handSize: 7,
  houseRules: { stacking: false, jumpIn: false, sevenZero: false, drawUntilPlayable: false, wild4AnyTime: false },
};
