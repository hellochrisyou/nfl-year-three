export interface FilterNbaStats {
  blocks: WinLoss;
  defensiveRebounds: WinLoss;
  steals: WinLoss;
  assists: WinLoss;
  fieldGoals: WinLoss;
  offensiveRebounds: WinLoss;
  points: WinLoss;
  turnovers: WinLoss;
  threePoints: WinLoss;
}

export interface FilterNhlStats {
  goals: WinLoss;
  assists: WinLoss;
  saves: WinLoss;
  shootingPct: WinLoss;
}

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
  netSpread: number;
  passAttemptsStd: number;
  passYardsStd: number;
  passTdsStd: number;
  rushAttemptsStd: number;
  rushYardsStd: number;
  rushTdsStd: number;
  firstDownsStd: number;
  thirdDownStd: number;
  redzoneStd: number;
  pointsStd: number;
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

export interface NbaTeam {
  netSpread: number;
  filterStats: FilterNbaStats;
  filterAtsStats: FilterNbaStats;
  filterAtsFavoritesStats: FilterNbaStats;
  filterAtsUnderdogStats: FilterNbaStats;
  nextGameDate: Date;
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
  games: NbaGame[];
  blocksTotal: number;
  defensiveReboundsTotal: number;
  stealsTotal: number;
  assistsTotal: number;
  fieldGoalsTotal: number;
  offensiveReboundsTotal: number;
  pointsTotal: number;
  turnoversTotal: number;
  threePointsTotal: number;
  blocksGivenTotal: number;
  defensiveReboundsGivenTotal: number;
  stealsGivenTotal: number;
  assistsGivenTotal: number;
  fieldGoalsGivenTotal: number;
  offensiveReboundsGivenTotal: number;
  pointsGivenTotal: number;
  turnoversGivenTotal: number;
  threePointsGivenTotal: number;
  wins: number;
  losses: number;
  atsWins: number;
  atsLosses: number;
  customAtsWins: number;
  customAtsLosses: number;
}

export interface NhlTeam {
  netSpread: number;
  filterStats: FilterNhlStats;
  filterAtsStats: FilterNhlStats;
  filterAtsFavoritesStats: FilterNhlStats;
  filterAtsUnderdogStats: FilterNhlStats;
  nextGameDate: Date;
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
  games: NhlGame[];
  pointsTotal: number;
  pointsGivenTotal: number;
  goalsTotal: number;
  goalsGivenTotal: number;
  savesPctAvg: number;
  savesPctTotal: number[];
  savesPctGivenPctAvg: number;
  savesPctGivenTotal: number[];
  assistsTotal: number;
  assistsGivenTotal: number;
  shootingPctAvg: number;
  shootingPctTotal: number[];
  shootingPctGivenAvg: number;
  shootingPctGivenTotal: number[];
  wins: number;
  losses: number;
  atsWins: number;
  atsLosses: number;
  customAtsWins: number;
  customAtsLosses: number;
}
export interface NhlGame {
  date: any;
  opponentId: string;
  homeOrAway: string;
  isFavorite?: boolean;
  gameId: number;
  points: number;
  goals: number;
  assists: number;
  savesPct: number;
  shootingPct: number;
  goalsGiven: number;
  assistsGiven: number;
  savesPctGiven: number;
  shootingPctGiven: number;
  pointsGiven: number;
  spread: number;
}
export interface NbaGame {
  date: any;
  opponentId: string;
  homeOrAway: string;
  isFavorite?: boolean;
  gameId: number;
  blocks: number;
  defensiveRebounds: number;
  steals: number;
  assists: number;
  fieldGoals: number;
  offensiveRebounds: number;
  points: number;
  turnovers: number;
  threePoints: number;
  blocksGiven: number;
  defensiveReboundsGiven: number;
  stealsGiven: number;
  assistsGiven: number;
  fieldGoalsGiven: number;
  offensiveReboundsGiven: number;
  turnoversGiven: number;
  threePointsGiven: number;
  //
  spread: number;

  //
  pointsGiven: number;
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
