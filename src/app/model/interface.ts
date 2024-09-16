export interface Team {
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
