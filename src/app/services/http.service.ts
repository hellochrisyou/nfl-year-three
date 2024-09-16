import { EventEmitter, Injectable, Output } from '@angular/core';
import * as XLSX from 'xlsx';

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

  constructor(private apiService: ApiService) {
    this.allTeams = INITIALIZE_TEAMS(this.allTeams);
  }

  getLastYearStats(year: string) {
    this.allTeams.forEach(team => {
      const tmpHttpAddy = 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/' + year + '/teams/' + team.teamId + '/events';
      this.apiService.httpGet(tmpHttpAddy).subscribe((payload: any) => {
        payload.items.forEach(element => {
          let tmpGame = this.initializeTmpGame();
          const tmpEventAddy = element.$ref;
          this.apiService.httpGet(tmpEventAddy).subscribe((payload2: any) => {
            tmpGame.gameId = payload2.id;
            tmpGame.date = payload2.date;
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
                team.games.push(tmpGame);
                this.downloadedGamesNum++;
                this.updateDownloadStatus.emit(this.downloadedGamesNum);
              });
            });
          });
        });
      });
    })
  }

  executeDataHydration() {
    this.getLastYearStats('2023');
    this.getLastYearStats('2024');
  }

  public crunchTotals() {
    this.allTeams.forEach(team => {
      team.games.forEach(game => {
        team.pointsTotal += game.points;
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
        team.pointsTotal += game.points;
        team.pointsGivenTotal += game.pointsGiven;
        team.passingAttemptsGivenTotal += game.passingAttemptsGiven;
        team.passingYardsGivenTotal += game.passingYardsGiven;
        team.passingTdsGivenTotal += game.passingTdsGiven;
        team.rushingAttemptsGivenTotal += game.rushingAttemptsGiven;
        team.rushingYardsGivenTotal += game.rushingYardsGiven;
        team.rushingTdsGivenTotal += game.rushingTdsGiven;
        team.sacksGivenTotal += game.sacksGiven;
        team.interceptionsGivenTotal += game.interceptionsGiven;
        team.firstDownsGivenTotal += game.firstDownsGiven;
        team.thirdDownConvPctGivenTotal.push(game.thirdDownConvPctGiven);
        team.redzoneScoringPctGivenTotal.push(game.redzoneScoringPctGiven);
      });
    });
    this.allTeams.forEach(team => {
      team.thirdDownPctAvg = this.returnSum(team.thirdDownPctTotal);
      team.redzoneScoringPctAvg = this.returnSum(team.redzoneScoringPctTotal);
      team.thirdDownConvPctGivenAvg = this.returnSum(team.thirdDownConvPctGivenTotal);
      team.redzoneScoringPctGivenAvg = this.returnSum(team.redzoneScoringPctGivenTotal);
    });
    this.updateTotalData.emit(true);
  }

  returnSum(val: number[]): number {
    let tmpTotal = 0;
    val.forEach(element => {
      tmpTotal += element;
    });
    tmpTotal /= val.length;
    return tmpTotal;
  }

  public crunchGivenStats() {
    this.allTeams.forEach(team => {
      team.games.forEach(game => {
        let tmpOppTeamIndex = this.allTeams.findIndex(team2 => team2.teamId === game.opponentId);
        let tmpGameIndex = this.allTeams[tmpOppTeamIndex].games.findIndex(game2 => game2.gameId === game.gameId);
        if (tmpGameIndex === -1) {
          console.log('here');
        }
        this.allTeams[tmpOppTeamIndex].games[tmpGameIndex].passingAttemptsGiven = game.passingAttempts;
        this.allTeams[tmpOppTeamIndex].games[tmpGameIndex].passingYardsGiven = game.passingYards;
        this.allTeams[tmpOppTeamIndex].games[tmpGameIndex].passingTdsGiven = game.passingTds;
        this.allTeams[tmpOppTeamIndex].games[tmpGameIndex].rushingAttemptsGiven = game.rushingAttempts;
        this.allTeams[tmpOppTeamIndex].games[tmpGameIndex].rushingYardsGiven = game.rushingYards;
        this.allTeams[tmpOppTeamIndex].games[tmpGameIndex].rushingTdsGiven = game.rushingTds;
        this.allTeams[tmpOppTeamIndex].games[tmpGameIndex].sacksGiven = game.sacks;
        this.allTeams[tmpOppTeamIndex].games[tmpGameIndex].interceptionsGiven = game.interceptions;
        this.allTeams[tmpOppTeamIndex].games[tmpGameIndex].firstDownsGiven = game.firstDowns;
        this.allTeams[tmpOppTeamIndex].games[tmpGameIndex].thirdDownConvPctGiven = game.thirdDownConvPct;
        this.allTeams[tmpOppTeamIndex].games[tmpGameIndex].redzoneScoringPctGiven = game.redzoneScoringPct;
      });
    });
    this.updateAggregatingData.emit(true);
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
}
