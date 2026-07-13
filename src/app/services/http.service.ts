import { EventEmitter, Injectable, Output } from '@angular/core';
import * as XLSX from 'xlsx';

import { DateService } from '../const/date';
import { INITIALIZE_TEAMS } from '../const/global_var';
import { Game, Team } from '../model/interface';
import { ApiService } from './api.service';

const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  allTeams: Team[] = [];

  downloadedGamesNum = 0;
  @Output() updateDownloadStatus = new EventEmitter<number>()
  @Output() updateAggregatingData = new EventEmitter<boolean>()
  @Output() updateTotalData = new EventEmitter<boolean>()

  constructor(private apiService: ApiService, private dateService: DateService) {
    this.allTeams = INITIALIZE_TEAMS(this.allTeams);
  }

  getLastYearStats(year: string, lastYearWeek?: number) {
    this.allTeams.forEach(team => {
      const tmpHttpAddy = 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/' + year + '/teams/' + team.teamId + '/events';
      this.apiService.httpGet(tmpHttpAddy).subscribe((payload: any) => payload.items.forEach(element => {
        let tmpGame = this.initializeTmpGame();
        const tmpEventAddy = element.$ref;
        this.apiService.httpGet(tmpEventAddy).subscribe((payload2: any) => {
          tmpGame.gameId = payload2.id;
          tmpGame.date = payload2.date;
          let tmpDate: Date = new Date();
          if (year === '2023') {
            tmpDate = new Date('08/25/2023');
          } else if (year === '2024') {
            tmpDate = new Date('08/25/2024');
          } else if (year === '2025') {
            tmpDate = new Date('08/25/2025');
          } else if (year === '2026') {
            tmpDate = new Date('08/25/2026');
          }
          var date1: any = new Date(payload2.date);
          var date2: any = new Date(this.dateService.currentLastYearWeek);
          var diffDays: any = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
            if (new Date(payload2.date) > new Date(this.dateService.currentLastYearWeek) && new Date(payload2.date) < this.dateService.currentLastYearWeek2 && diffDays <= 7) {
              team.nextGameDate = payload2.date;
              let tmpCompetitorIndex = 0;
              if (payload2.competitions[0].competitors[0].id === team.teamId) {
                tmpCompetitorIndex = 0;
              } else {
                tmpCompetitorIndex = 1;
              }
              const tmpStatsAddy = payload2.competitions[0].competitors[tmpCompetitorIndex].statistics.$ref;
              const tmpOddsAddy = payload2.competitions[0].odds.$ref;
              this.apiService.httpGet(tmpOddsAddy).subscribe((payload3: any) => {
                // Spread
                payload3.items[0].spread;
                this.apiService.httpGet(tmpStatsAddy).subscribe((payload4: any) => {
                  if (lastYearWeek === 12 && team.teamName === 'Washington Commanders') {
                    console.log('hhhh', team.teamName);
                  }
                  let tmpAwayHome = '';
                  let tmpIsFav = false;
                  if (payload2.competitions[0].competitors[tmpCompetitorIndex].homeAway === 'home') {
                    tmpAwayHome = 'home';
                  } else {
                    tmpAwayHome = 'away';
                  }
                  if (tmpAwayHome === 'home') {
                    tmpIsFav = payload3.items[0].homeTeamOdds.favorite;
                  } else {
                    tmpIsFav = payload3.items[0].awayTeamOdds.favorite;
                  }
                  // Points
                  team.currentWeekPoints = payload4.splits.categories[9].stats[9].value;
                  // Points Given
                  team.currentWeekPointsAgainst = payload4.splits.categories[4].stats[28].value;
                  if ((Math.abs(payload4.splits.categories[9].stats[9].value) - Math.abs(payload4.splits.categories[4].stats[28].value)) > 0) {
                    team.currentWeekWinLoss = 'Win';
                  } else {
                    team.currentWeekWinLoss = 'Loss';
                  }
                  if (tmpIsFav) {
                    if (team.currentWeekWinLoss === 'Loss') {
                      team.currentWeekAts = 'Loss'
                    } else {
                      if ((Math.abs(payload4.splits.categories[9].stats[9].value) - Math.abs(payload4.splits.categories[4].stats[28].value) - Math.abs(payload3.items[0].spread)) > 0) {
                        team.currentWeekAts = 'Win';
                      } else {
                        team.currentWeekAts = 'Loss';
                      }
                    }
                  }
                  else {
                    if ((Math.abs(payload4.splits.categories[9].stats[9].value) - Math.abs(payload4.splits.categories[4].stats[28].value) + Math.abs(payload3.items[0].spread)) > 0) {
                      team.currentWeekAts = 'Win';
                    } else {
                      team.currentWeekAts = 'Loss';
                    }
                  }
                  this.updateDownloadStatus.emit(this.downloadedGamesNum);
                });
              });
          } else if (new Date(payload2.date) > tmpDate && new Date(payload2.date) < new Date(this.dateService.currentLastYearWeek2)) {
            console.log('year', year);
            let tmpCompetitorIndex = 0;
            if (payload2.competitions[0].competitors[0].id === team.teamId) {
              tmpGame.opponentId = payload2.competitions[0].competitors[1].id;
              if (payload2.competitions[0].competitors[tmpCompetitorIndex].homeAway === 'home') {
                tmpGame.homeOrAway = 'home';
              } else {
                tmpGame.homeOrAway = 'away';
              }
            } else {
              tmpCompetitorIndex = 1;
              tmpGame.opponentId = payload2.competitions[0].competitors[0].id;
              if (payload2.competitions[0].competitors[tmpCompetitorIndex].homeAway === 'home') {
                tmpGame.homeOrAway = 'home';
              } else {
                tmpGame.homeOrAway = 'away';
              }
            }

            const tmpStatsAddy = payload2.competitions[0].competitors[tmpCompetitorIndex].statistics.$ref;
            const tmpOddsAddy = payload2.competitions[0].odds.$ref;
            this.apiService.httpGet(tmpOddsAddy).subscribe((payload3: any) => {
              tmpGame.spread = payload3.items[0].spread;
              if (tmpGame.homeOrAway === 'home') {
                tmpGame.isFavorite = payload3.items[0].homeTeamOdds.favorite;
              } else {
                tmpGame.isFavorite = payload3.items[0].awayTeamOdds.favorite;
              }
              this.apiService.httpGet(tmpStatsAddy).subscribe((payload4: any) => {
                tmpGame.turnoverDiff = payload4.splits.categories[10].stats[39].value;
                tmpGame.points = payload4.splits.categories[9].stats[9].value;
                tmpGame.passingAttempts = payload4.splits.categories[1].stats[12].value;
                tmpGame.pointsGiven = payload4.splits.categories[4].stats[28].value;
                tmpGame.passingYards = payload4.splits.categories[1].stats[19].value;
                tmpGame.passingTds = payload4.splits.categories[1].stats[18].value;
                tmpGame.rushingAttempts = payload4.splits.categories[2].stats[6].value;
                tmpGame.rushingYards = payload4.splits.categories[2].stats[12].value;
                tmpGame.rushingTds = payload4.splits.categories[2].stats[11].value;
                tmpGame.sacks = payload4.splits.categories[4].stats[15].value;
                tmpGame.interceptions = payload4.splits.categories[5].stats[0].value;
                tmpGame.firstDowns = payload4.splits.categories[10].stats[0].value;
                tmpGame.thirdDownConvPct = payload4.splits.categories[10].stats[30].value;
                tmpGame.redzoneScoringPct = payload4.splits.categories[10].stats[22].value;

                this.allTeams.forEach(team2 => {
                  if (team2.teamId === tmpGame.opponentId) {
                    team2.pointsGivenTotal += tmpGame.points;
                    team2.passingAttemptsGivenTotal += tmpGame.passingAttempts;
                    team2.passingYardsGivenTotal += tmpGame.passingYards;
                    team2.passingTdsGivenTotal += tmpGame.passingTds;
                    team2.rushingAttemptsGivenTotal += tmpGame.rushingAttempts;
                    team2.rushingYardsGivenTotal += tmpGame.rushingYards;
                    team2.rushingTdsGivenTotal += tmpGame.rushingTds;
                    team2.sacksGivenTotal += tmpGame.sacks;
                    team2.interceptionsGivenTotal += tmpGame.interceptions;
                    team2.firstDownsGivenTotal += tmpGame.firstDowns;
                    team2.thirdDownConvPctGivenTotal.push(tmpGame.thirdDownConvPct);
                    team2.redzoneScoringPctGivenTotal.push(tmpGame.redzoneScoringPct);
                  }
                });
                team.games.push(tmpGame);
                this.downloadedGamesNum++;
                this.updateDownloadStatus.emit(this.downloadedGamesNum);
              });
            });
          }
        });
      }));
    })
  }

  setupGivenData() {
    this.allTeams.forEach(team => team.games.forEach(game => {
      this.allTeams.forEach(team2 => {
        if (game.opponentId === team2.teamId) {
          team2.games.forEach(game2 => {
            if (game.gameId === game2.gameId) {
              game.passingAttemptsGiven = game2.passingAttempts;
              game.passingYardsGiven = game2.passingYards;
              game.passingTdsGiven = game2.passingTds;
              game.rushingAttemptsGiven = game2.rushingAttempts;
              game.rushingYardsGiven = game2.rushingYards;
              game.rushingTdsGiven = game2.rushingTds;
              game.sacksGiven = game2.sacks;
              game.interceptionsGiven = game2.interceptions;
              game.firstDownsGiven = game2.firstDowns;
              game.thirdDownConvPctGiven = game2.thirdDownConvPct;
              game.redzoneScoringPctGiven = game2.redzoneScoringPct;
              game.pointsGiven = game2.points;
            }
          })
        }
      });
    }));
  }

  executeDataHydrationLastYearJoe() {
    this.getLastYearStats('2024');
  }

  executeDataHydrationLastYear(lastYearWeek?: number) {
    if (!lastYearWeek) {
      this.getLastYearStats('2025');
    } else {
      this.getLastYearStats('2025', lastYearWeek);
    }
  }

  executeDataHydrationThisYear() {
    this.dateService.setLastYearWeek(this.dateService.currentWeek);
    this.dateService.setLastYearWeekNext(this.dateService.currentWeek + 1);
    this.getLastYearStats('2026', this.dateService.currentWeek);
    console.log("🚀 ~ this.dateService.currentWeek:", this.dateService.currentWeek)
  }

  public crunchTotals() {
    this.allTeams.forEach(team => team.games.forEach(game => {
      team.pointsTotal += game.points;
      team.turnoverDiffTotal += game.turnoverDiff;
      team.passingAttemptsTotal += game.passingAttempts;
      team.passingYardsTotal += game.passingYards;
      team.passingTdsTotal += game.passingTds;
      team.rushingAttemptsTotal += game.rushingAttempts;
      team.rushingYardsTotal += game.rushingYards;
      team.rushingTdsTotal += game.rushingTds;
      team.sacksTotal += game.sacks;
      team.interceptionsTotal += game.interceptions;
      team.firstDownsTotal += game.firstDowns;
      team.thirdDownPctTotal.push(game.thirdDownConvPct);
      team.redzoneScoringPctTotal.push(game.redzoneScoringPct);
    }));
    this.updateTotalData.emit(true);
    this.updateAggregatingData.emit(true);
  }

  returnSumAvg(val: number[]): number {
    let tmpTotal = 0;
    val.forEach(element => tmpTotal += element);
    tmpTotal /= val.length;
    return tmpTotal;
  }

  public exportToExcel(element: any, fileName?: string): void {
    // generate workbook and add the worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(element);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    // save to file
    XLSX.utils.book_append_sheet(workbook, ws, 'Sheet1');
    XLSX.writeFile(workbook, EXCEL_EXTENSION);
  }

  public initializeTmpGame(): Game {
    let tmpGame: Game = {
      turnoverDiff: 0,
      date: null,
      opponentId: '',
      gameId: 0,
      homeOrAway: '',
      passingYards: 0,
      passingTds: 0,
      rushingYards: 0,
      rushingTds: 0,
      sacks: 0,
      interceptions: 0,
      firstDowns: 0,
      thirdDownConvPct: 0,
      passingAttempts: 0,
      passingAttemptsGiven: 0,
      rushingAttempts: 0,
      rushingAttemptsGiven: 0,
      redzoneScoringPct: 0,
      points: 0,
      pointsGiven: 0,
      spread: 0,
      passingYardsGiven: 0,
      passingTdsGiven: 0,
      rushingYardsGiven: 0,
      rushingTdsGiven: 0,
      sacksGiven: 0,
      interceptionsGiven: 0,
      firstDownsGiven: 0,
      thirdDownConvPctGiven: 0,
      redzoneScoringPctGiven: 0,
    };
    return tmpGame;
  }

  calculateWinLossRecord() {
    this.allTeams.forEach(team => team.games.forEach(game => {
      // console.log("🚀 ~ game.pointsGiven:", game.pointsGiven)
      // console.log("🚀 ~ game.points:", game.points)
      if ((game.points - game.pointsGiven) >= 0) {
        team.wins++;
      } else {
        team.losses++;
      }
      if (game.isFavorite) {
        team.netSpread += (game.points - game.pointsGiven - Math.abs(game.spread));
        if ((game.points - game.pointsGiven - Math.abs(game.spread) >= 0)) {
          team.atsWins++;
        } else {
          team.atsLosses++;
        }
      } else {
        team.netSpread += (game.points - game.pointsGiven + Math.abs(game.spread));
        if ((game.points - game.pointsGiven + Math.abs(game.spread) >= 0)) {
          team.atsWins++;
        } else {
          team.atsLosses++;
        }
      }
    }));
  }

  setOpponentStats() {
    this.allTeams.forEach(team => team.thirdDownPctAvg = this.returnSumAvg(team.thirdDownPctTotal));
    this.allTeams.forEach(team => team.thirdDownConvPctGivenAvg = this.returnSumAvg(team.thirdDownConvPctGivenTotal));
    this.allTeams.forEach(team => team.redzoneScoringPctAvg = this.returnSumAvg(team.redzoneScoringPctTotal));
    this.allTeams.forEach(team => team.redzoneScoringPctGivenAvg = this.returnSumAvg(team.redzoneScoringPctGivenTotal));
  }


  getNextOpponentInfo(year?: string) {
    let tmpHttpAddy = 'http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2026/types/2/weeks/' + (this.dateService.currentWeek) + '/events?lang=en&region=us';
    console.log("🚀 ~ this.dateService.currentWeek:", this.dateService.currentWeek)
    if (year) {
      tmpHttpAddy = 'http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2025/types/2/weeks/' + (this.dateService.currentLastYearWeekNum) + '/events?lang=en&region=us';
    }
    this.apiService.httpGet(tmpHttpAddy).subscribe((payload: any) => payload.items.forEach(element => {
      // console.log("🚀 ~ element:", element)
      const tmpHttpAddy2 = element.$ref;
      this.apiService.httpGet(tmpHttpAddy2).subscribe((payload2: any) => {
        const tmpHttpAddy3 = payload2.competitions[0].odds.$ref;
        this.apiService.httpGet(tmpHttpAddy3).subscribe((payload3: any) => {
          // console.log("🚀 ~ payload3:", payload3)
          this.allTeams.forEach(team => {
            if (team.teamId === payload2.competitions[0].competitors[0].id) {
              this.allTeams.forEach(team2 => {
                if (team2.teamId === payload2.competitions[0].competitors[1].id) {
                  team.nextGameSpread = payload3.items[0].spread;
                  team.nextOpponent = team2.teamName;
                  team.nextOpponentWins = team2.wins;
                  team.nextOpponentLosses = team2.losses;
                  team.nextOpponentAtsWins = team2.atsWins;
                  team.nextOpponentAtsLosses = team2.atsLosses;
                  team.nextGameDetails = payload3.items[0].details;
                  team2.nextGameSpread = payload3.items[0].spread;
                  team2.nextOpponent = team.teamName;
                  team2.nextOpponentWins = team.wins;
                  team2.nextOpponentLosses = team.losses;
                  team2.nextOpponentAtsWins = team.atsWins;
                  team2.nextOpponentAtsLosses = team.atsLosses;
                  team2.nextGameDetails = payload3.items[0].details;
                  if (team.teamId === '22' && team.nextGameDetails === 'EVEN') {
                    team.isNextGameFavorite = true;
                  } else if (team.teamId === '20' && team.nextGameDetails === 'EVEN') {
                    team.isNextGameFavorite = false;
                  }
                  if (team.teamInitials === this.determineFavoriteTeam(team.nextGameDetails).trim() && team.nextGameDetails !== 'EVEN') {
                    team.isNextGameFavorite = true;
                  } else if (team.teamInitials !== this.determineFavoriteTeam(team.nextGameDetails).trim() && team.nextGameDetails !== 'EVEN') {
                    team.isNextGameFavorite = false;
                  }
                }
              })
            }
            if (team.teamId === payload2.competitions[0].competitors[1].id) {
              this.allTeams.forEach(team2 => {
                if (team2.teamId === payload2.competitions[0].competitors[0].id) {
                  team.nextGameSpread = payload3.items[0].spread;
                  team.nextOpponent = team2.teamName;
                  team.nextOpponentWins = team2.wins;
                  team.nextOpponentLosses = team2.losses;
                  team.nextOpponentAtsWins = team2.atsWins;
                  team.nextOpponentAtsLosses = team2.atsLosses;
                  team.nextGameDetails = payload3.items[0].details;
                  if (team.teamInitials === this.determineFavoriteTeam(team.nextGameDetails).trim()) {
                    team.isNextGameFavorite = true;
                  } else {
                    team.isNextGameFavorite = false;
                  }
                }
              })
            }
          });
        });
      });
    }))
  }
  determineFavoriteTeam(inputVal: string) {
    let tmpStr = '';
    let gotStrTeam = false;
    const tmpStrArray = [...inputVal];
    tmpStrArray.forEach((charVal, charIndex) => {
      if (charVal !== '-' && !gotStrTeam) {
        tmpStr += charVal;
      }
      if (charVal === ' ') {
        gotStrTeam = true;
      }
    });
    return tmpStr.trim();
  }
}
