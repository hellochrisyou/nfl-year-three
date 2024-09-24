export interface FilterStats {
  passAttempts: WinLoss;
  passYards: WinLoss;
  passTds: WinLoss;
  rushAttempts: WinLoss;
  rushYards: WinLoss;
  rushTds: WinLoss;
  firstDowns: WinLoss;
  interceptions: WinLoss;
  sacks: WinLoss;
  thirdDown: WinLoss;
  redzone: WinLoss;
  points: WinLoss;
}

export interface WinLoss {
  wins: number;
  losses: number;
}


export interface Team {
  filterStats: FilterStats;
  filterAtsStats: FilterStats;
  filterAtsFavoritesStats: FilterStats;
  filterAtsUnderdogStats: FilterStats;
  nextGameSpread: string;
  nextGameDetails: string;
  teamInitials: string;
  isNextGameFavorite: boolean;
  nextOpponent: string;
  nextOpponentWins: number;
  nextOpponentLosses: number;
  nextOpponentAtsWins: number;
  nextOpponentAtsLosses: number;
  teamIndex: number;
  teamId: string;
  teamName: string;
  games: Game[]
  passingAttemptsTotal: number;
  passingYardsTotal: number;
  passingTdsTotal: number;
  rushingAttemptsTotal: number;
  rushingYardsTotal: number;
  rushingTdsTotal: number;
  sacksTotal: number;
  interceptionsTotal: number;
  firstDownsTotal: number
  thirdDownPctTotal: number[];
  thirdDownPctAvg: number;
  redzoneScoringPctTotal: number[];
  redzoneScoringPctAvg: number;
  pointsTotal: number;
  pointsGivenTotal: number;
  passingAttemptsGivenTotal: number;
  passingYardsGivenTotal: number;
  passingTdsGivenTotal: number;
  rushingAttemptsGivenTotal: number;
  rushingYardsGivenTotal: number;
  rushingTdsGivenTotal: number;
  sacksGivenTotal: number;
  interceptionsGivenTotal: number;
  firstDownsGivenTotal: number
  thirdDownConvPctGivenTotal: number[];
  thirdDownConvPctGivenAvg: number;
  redzoneScoringPctGivenTotal: number[];
  redzoneScoringPctGivenAvg: number;
  wins: number;
  losses: number;
  atsWins: number;
  atsLosses: number;
  customAtsWins: number;
  customAtsLosses: number;
}

export interface Game {
  date: any;
  opponentId: string;
  homeOrAway: string;
  isFavorite?: boolean;
  gameId: number;
  points: number;
  passingAttempts: number;
  passingYards: number;
  passingTds: number;
  rushingAttempts: number;
  rushingYards: number;
  rushingTds: number;
  sacks: number;
  interceptions: number;
  firstDowns: number
  thirdDownConvPct: number;
  redzoneScoringPct: number;
  //
  spread: number;

  //
  pointsGiven: number;
  passingAttemptsGiven: number;
  passingYardsGiven: number;
  passingTdsGiven: number;
  rushingAttemptsGiven: number;
  rushingYardsGiven: number;
  rushingTdsGiven: number;
  sacksGiven: number;
  interceptionsGiven: number;
  firstDownsGiven: number
  thirdDownConvPctGiven: number;
  redzoneScoringPctGiven: number;
}
