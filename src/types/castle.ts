export type CastleRank = 'row1' | 'row2' | 'row3';
export type CastleType = 'archers' | 'barracks' | 'mixed';

export interface Castle {
  id: string;
  name: string;
  rank: CastleRank;
  type: CastleType;
  giant: number;
  barracksArmor: number;
  archersArmor: number;
  barracksPiercing: number;
  archersPiercing: number;
  normalRally: number;
  superRally: number;
  drops: number;
  accountEmail?: string;
  accountPassword?: string;
  readiness: {
    speedups50: number;
    speedups25: number;
    freeHours: number;
    healingHours: number;
    goldHeroFragments: number;
    redHeroFragments: number;
  };
  createdAt: number;
}

export const CASTLE_RANKS: Record<CastleRank, string> = {
  row1: 'صف أول',
  row2: 'صف ثاني',
  row3: 'صف ثالث',
};

export const CASTLE_TYPES: Record<CastleType, string> = {
  archers: 'رماة',
  barracks: 'ثكنة',
  mixed: 'خطين',
};
