export interface EnemyPlatform {
  id: string;
  name: string;
  type: 'Archer' | 'Barracks' | 'TwoLines';
  arenaCorpsPower: number;
  counterCastleId: string; // From Server Info
  counterCastleName: string;
  capsCastleId: string; // From Server Info
  capsCastleName: string;
  superCounterCastleId: string; // From Server Info
  superCounterCastleName: string;
  notes: string;
}

export interface EnemyTile {
  id: string;
  name: string;
  type: 'Barracks' | 'Archer';
  archerArmorCount: number;
  barracksArmorCount: number;
  zeroingResponsible: string;
}

export interface Super {
  id: string;
  platformName: string; // Selected from Server Info platforms
  time: string; // 1 to 8
  location: 'Defense' | 'Attack';
}

export interface WarSchedule {
  warId: string;
  enemyPlatforms: EnemyPlatform[];
  enemyTiles: EnemyTile[];
  supers: Super[];
}
