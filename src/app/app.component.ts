import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RouterOutlet } from '@angular/router';
import * as stats from 'simple-statistics';

import { DateService } from './const/date';
import { MaterialModule } from './material.module';
import { KeyModalComponent } from './modal/key-modal/key-modal.component';
import { AggregateStats, NbaTeam, NhlTeam, Team } from './model/interface';
import { HttpService } from './services/http.service';
import { INITIALIZE_TEAMS } from './const/global_var';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule, ReactiveFormsModule, MaterialModule, HttpClientModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  weeks: any[] = [
    { value: '6' },
    { value: '7' },
    { value: '8' },
    { value: '9' },
    { value: '10' },
    { value: '11' },
    { value: '12' },
    { value: '13' },
    { value: '14' },
    { value: '15' },
    { value: '16' },
    { value: '17' },
  ];
  localMlDiffVal = 0.8;
  localMlHighVal = 0.9;
  localMlOppLowVal = 0.21;
  localAtsDiffVal = 0.3;
  localAtsHighVal = 0.85;
  localAtsOppLowVal = 0.21;
  localFavDiffVal = 0.6;
  localFavHighVal = 0.79;
  localFavOppLowVal = 0.21;
  localUnderDiffVal = 0.5;
  localUnderHighVal = 0.85;
  localUnderOppLowVal = 0.21;
  bestMlDiffVal = 0;
  bestMlHighVal = 0;
  bestMlOppLowVal = 0;
  bestAtsDiffVal = 0;
  bestAtsHighVal = 0;
  bestAtsOppLowVal = 0;
  bestFavDiffVal = 0;
  bestFavHighVal = 0;
  bestFavOppLowVal = 0;
  bestUnderDiffVal = 0;
  bestUnderHighVal = 0;
  bestUnderOppLowVal = 0;
  weekCtrl = new FormControl(6);
  lastYearWeeks = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18
  ];
  lastYearWeekControl = new FormControl(1);

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) nbaSort: MatSort;
  @ViewChild(MatSort) nhlSort: MatSort;


  currentFilter = '';
  currentNbaFilter = '';
  currentNhlFilter = '';
  currentNbaDownloadCounter = 0;
  currentNhlDownloadCounter = 0;
  currentNbaDownloadCounterPostMsg = ' - DOWNLOAD REQUIRED';
  currentNhlDownloadCounterPostMsg = ' - DOWNLOAD REQUIRED';
  isActiveTab = 0;
  isActiveTab2 = 2;
  passAttemptsPanelColor = 'grey';
  passYardsPanelColor = 'grey';
  passTdsPanelColor = 'grey';
  rushAttemptsPanelColor = 'grey';
  rushYardsPanelColor = 'grey';
  rushTdsPanelColor = 'grey';
  firstDownsPanelColor = 'grey';
  thirdDownPanelColor = 'grey';
  redzonePanelColor = 'grey';
  pointsPanelColor = 'grey';
  toggleInterUnionMsg = 'Standalone Logic';
  title = 'nfl-year-three';
  displayedColumns = ['teamName', 'ats', 'nextOpponent', 'nextOpponentAts', 'passingAttempts', 'passingYards', 'passingTds', 'rushingAttempts', 'rushingYards',
    'rushingTds',
    'sacks', 'interceptions', 'firstDowns', 'thirdDownPct', 'redzoneScoringPct', 'points'];
  displayedColumns2 = ['teamName', 'passAttempts', 'passYards', 'passTds', 'rushAttempts', 'rushYards', 'rushTds', 'points', 'sumValues'
    // 'nextOpponent',
    // 'sacks',
    // 'interceptions',
  ];
  // displayedColumns3 = ['teamName', 'blocks', 'defensiveRebounds', 'steals', 'assists', 'fieldGoals', 'offensiveRebounds', 'turnovers', 'threePoints', 'points']
  displayedColumns3 = ['teamName', 'fieldGoals', 'assists', 'threePoints', 'points'
  ];
  displayedColumns4 = ['teamName', 'goals', 'assists', 'shooting',
  ];
  basicStatsForm: FormGroup;
  currentDownloadCounter = 0;
  currentDownloadCounterPostMsg = ' - DOWNLOAD REQUIRED';
  currentWeek: number = 19;
  nbaDataSource: MatTableDataSource<NbaTeam>;
  nhlDataSource: MatTableDataSource<NhlTeam>;
  dataSource: MatTableDataSource<Team>;
  dataSourceNcaaf: MatTableDataSource<Team>;
  firstDownsQuartile: number[] = [];
  interceptionsQuartile: number[] = [];
  blocksQuartile: number[] = [];
  defensiveReboundsQuartile: number[] = [];
  stealsQuartile: number[] = [];
  assistsQuartile: number[] = [];
  fieldGoalsQuartile: number[] = [];
  offensiveReboundsQuartile: number[] = [];
  nbaPointsQuartile: number[] = [];
  turnoversQuartile: number[] = [];
  threePointsQuartile: number[] = [];
  passAttemptsQuartile: number[] = [];
  passTdsQuartile: number[] = [];
  passYardsQuartile: number[] = [];
  redzoneQuartile: number[] = [];
  rushAttemptsQuartile: number[] = [];
  rushTdsQuartile: number[] = [];
  rushYardsQuartile: number[] = [];
  sacksQuartile: number[] = [];
  pointsQuartile: number[] = [];
  passAttemptsQuartileNcaaf: number[] = [];
  passTdsQuartileNcaaf: number[] = [];
  passYardsQuartileNcaaf: number[] = [];
  redzoneQuartileNcaaf: number[] = [];
  rushAttemptsQuartileNcaaf: number[] = [];
  rushTdsQuartileNcaaf: number[] = [];
  rushYardsQuartileNcaaf: number[] = [];
  interceptionsQuartileNcaaf: number[] = [];
  sacksQuartileNcaaf: number[] = [];
  thirdDownQuartileNcaaf: number[] = [];
  firstDownsQuartileNcaaf: number[] = [];
  pointsQuartileNcaaf: number[] = [];
  goalsQuartile: number[] = [];
  nhlAssistsQuartile: number[] = [];
  shootingPctQuartile: number[] = [];
  selectedTeam = '';
  thirdDownQuartile: number[] = [];
  totalAvgToggle = 'Total';
  isNhlSetupFinished = false;
  readonly dialog = inject(MatDialog);
  currentSortState = 0;
  aggregateStats: AggregateStats = {
    mlDiffWins: 0,
    mlDiffLosses: 0,
    mlHighWins: 0,
    mlHighLosses: 0,
    mlOppLowWins: 0,
    mlOppLowLosses: 0,
    atsDiffWins: 0,
    atsDiffLosses: 0,
    atsHighWins: 0,
    atsHighLosses: 0,
    atsOppLowWins: 0,
    atsOppLowLosses: 0,
    favDiffWins: 0,
    favDiffLosses: 0,
    favHighWins: 0,
    favHighLosses: 0,
    favOppLowWins: 0,
    favOppLowLosses: 0,
    underDiffWins: 0,
    underDiffLosses: 0,
    underHighWins: 0,
    underHighLosses: 0,
    underOppLowWins: 0,
    underOppLowLosses: 0,
  }
  constructor(
    private fb: FormBuilder,
    public dateService: DateService,
    private httpService: HttpService,
  ) {
    this.basicStatsForm = this.fb.group({
      passAttemptsCtrl: ['', []],
      passYardsCtrl: ['', []],
      passTdsCtrl: ['', []],
      rushAttemptsCtrl: ['', []],
      rushYardsCtrl: ['', []],
      rushTdCtrl: ['', []],
      firstDownsCtrl: ['', []],
      // sacksCtrl: ['', []],
      // interceptionsCtrl: ['', []],
      thirdDownPctCtrl: ['', []],
      redzoneScoringCtrl: ['', []],
      pointsCtrl: ['', []],
    });

  }

  ngOnInit(): void {
    this.dateService.initializeStaticDates();
    // this.currentWeek = this.dateService.currentWeek;
    this.currentWeek = 1;
    console.log("🚀 ~ this.currentWeek:", this.currentWeek);
    this.httpService.updateDownloadStatus.subscribe(payload => {
      this.currentDownloadCounter = payload;
      this.currentNbaDownloadCounter = payload;
      this.currentNhlDownloadCounter = payload;
      this.currentDownloadCounterPostMsg = '';
      this.currentNbaDownloadCounterPostMsg = '';
      this.currentNhlDownloadCounterPostMsg = '';
    });
    this.httpService.updateAggregatingData.subscribe(payload => {
    });
    this.httpService.updateTotalData.subscribe(payload => {
    });
  }

  downloadNbaLastYear() {
    this.currentNbaDownloadCounter++;
    this.currentNbaDownloadCounterPostMsg = ' ...Currently Downloading...';
    this.httpService.executeNbaDataHydrationLastYear();
  }

  downloadNbaLastYear2() {
    this.currentNbaDownloadCounter++;
    this.currentNbaDownloadCounterPostMsg = ' ...Currently Downloading...';
    this.httpService.executeNbaDataHydrationThisYear();
  }
  downloadNhlLastYear() {
    this.currentNhlDownloadCounter++;
    this.currentNhlDownloadCounterPostMsg = ' ...Currently Downloading...';
    this.httpService.executeNhlDataHydrationLastYear();
  }

  downloadNhlLastYear2() {
    this.currentNhlDownloadCounter++;
    this.currentNhlDownloadCounterPostMsg = ' ...Currently Downloading...';
    this.httpService.executeNhlDataHydrationThisYear();
  }
  setWeek() {
    this.dateService.currentWeek = +this.weekCtrl.value!;
  }

  calculateStd() {
    this.httpService.allTeams.forEach(team => {
      let tmpPassAttempts: number[] = [];
      let tmpPassYards: number[] = [];
      let tmpPassTds: number[] = [];
      let tmpRushAttempts: number[] = [];
      let tmpRushYards: number[] = [];
      let tmpRushTds: number[] = [];
      let tmpFirstDowns: number[] = [];
      let tmpThirdDown: number[] = [];
      let tmpRedzone: number[] = [];
      let tmpPoints: number[] = [];
      this.httpService.allTeams.forEach(team2 => {
        if (team.nextOpponent === team2.teamName) {
          team2.games.forEach(game => {
            tmpPassAttempts.push(game.passingAttempts);
            tmpPassYards.push(game.passingYards);
            tmpPassTds.push(game.passingTds);
            tmpRushAttempts.push(game.rushingAttempts);
            tmpRushYards.push(game.rushingYards);
            tmpRushTds.push(game.rushingTds);
            tmpFirstDowns.push(game.firstDowns);
            tmpThirdDown.push(game.thirdDownConvPct);
            tmpRedzone.push(game.redzoneScoringPct);
            tmpPoints.push(game.points);
          })
        }
      });
      team.passAttemptsStd = stats.standardDeviation(tmpPassAttempts);
      team.passYardsStd = stats.standardDeviation(tmpPassYards);
      team.passTdsStd = stats.standardDeviation(tmpPassTds);
      team.rushAttemptsStd = stats.standardDeviation(tmpRushAttempts);
      team.rushYardsStd = stats.standardDeviation(tmpRushYards);
      team.rushTdsStd = stats.standardDeviation(tmpRushTds);
      team.firstDownsStd = stats.standardDeviation(tmpFirstDowns);
      team.thirdDownStd = stats.standardDeviation(tmpThirdDown);
      team.redzoneStd = stats.standardDeviation(tmpRedzone);
      team.pointsStd = stats.standardDeviation(tmpPoints);
    })
  }

  ngOnDestroy(): void {
  }

  ngAfterViewInit(): void {
  }

  returnFilterColorPassAttempts(): string {
    if (this.basicStatsForm.get('passAttemptsCtrl')) {
      switch (this.basicStatsForm.get('passAttemptsCtrl')?.value) {
        case 'quart1': {
          return 'border-red';
        }
        case 'quart2': {
          return 'border-orange';
        }
        case 'quart3': {
          return 'border-blueViolet';
        }
        case 'quart4': {
          return 'border-green';
        }
      };
    }
    return '';
  };
  returnFilterColorPassYards(): string {
    if (this.basicStatsForm.get('passYardsCtrl')) {
      switch (this.basicStatsForm.get('passYardsCtrl')?.value) {
        case 'quart1': {
          return 'border-red';
        }
        case 'quart2': {
          return 'border-orange';
        }
        case 'quart3': {
          return 'border-blueViolet';
        }
        case 'quart4': {
          return 'border-green';
        }
      }
    }
    return '';
  };
  returnFilterColorPassTds(): string {
    if (this.basicStatsForm.get('passTdsCtrl')) {
      switch (this.basicStatsForm.get('passTdsCtrl')?.value) {
        case 'quart1': {
          return 'border-red';
        }
        case 'quart2': {
          return 'border-orange';
        }
        case 'quart3': {
          return 'border-blueViolet';
        }
        case 'quart4': {
          return 'border-green';
        }
      }
    }
    return '';
  };
  returnFilterColorRushAttempts(): string {
    if (this.basicStatsForm.get('rushAttemptsCtrl')) {
      switch (this.basicStatsForm.get('rushAttemptsCtrl')?.value) {
        case 'quart1': {
          return 'border-red';
        }
        case 'quart2': {
          return 'border-orange';
        }
        case 'quart3': {
          return 'border-blueViolet';
        }
        case 'quart4': {
          return 'border-green';
        }
      }
    }
    return '';
  };
  returnFilterColorRushYards(): string {
    if (this.basicStatsForm.get('rushYardsCtrl')) {
      switch (this.basicStatsForm.get('rushYardsCtrl')?.value) {
        case 'quart1': {
          return 'border-red';
        }
        case 'quart2': {
          return 'border-orange';
        }
        case 'quart3': {
          return 'border-blueViolet';
        }
        case 'quart4': {
          return 'border-green';
        }
      }
    }
    return '';
  };
  returnFilterColorRushTds(): string {
    if (this.basicStatsForm.get('rushTdCtrl')) {
      switch (this.basicStatsForm.get('rushTdCtrl')?.value) {
        case 'quart1': {
          return 'border-red';
        }
        case 'quart2': {
          return 'border-orange';
        }
        case 'quart3': {
          return 'border-blueViolet';
        }
        case 'quart4': {
          return 'border-green';
        }
      }
    }
    return '';
  };
  returnFilterColorFirstDowns(): string {
    if (this.basicStatsForm.get('firstDownsCtrl')) {
      switch (this.basicStatsForm.get('firstDownsCtrl')?.value) {
        case 'quart1': {
          return 'border-red';
        }
        case 'quart2': {
          return 'border-orange';
        }
        case 'quart3': {
          return 'border-blueViolet';
        }
        case 'quart4': {
          return 'border-green';
        }
      }
    }
    return '';
  };
  returnFilterColorThirdDown(): string {
    if (this.basicStatsForm.get('thirdDownPctCtrl')) {
      switch (this.basicStatsForm.get('thirdDownPctCtrl')?.value) {
        case 'quart1': {
          return 'border-red';
        }
        case 'quart2': {
          return 'border-orange';
        }
        case 'quart3': {
          return 'border-blueViolet';
        }
        case 'quart4': {
          return 'border-green';
        }
      }
    }
    return '';
  };
  returnFilterColorRedzone(): string {
    if (this.basicStatsForm.get('redzoneScoringCtrl')) {
      switch (this.basicStatsForm.get('redzoneScoringCtrl')?.value) {
        case 'quart1': {
          return 'border-red';
        }
        case 'quart2': {
          return 'border-orange';
        }
        case 'quart3': {
          return 'border-blueViolet';
        }
        case 'quart4': {
          return 'border-green';
        }
      }
    }
    return '';
  };
  returnFilterColorPoints(): string {
    if (this.basicStatsForm.get('pointsCtrl')) {
      switch (this.basicStatsForm.get('pointsCtrl')?.value) {
        case 'quart1': {
          return 'border-red';
        }
        case 'quart2': {
          return 'border-orange';
        }
        case 'quart3': {
          return 'border-blueViolet';
        }
        case 'quart4': {
          return 'border-green';
        }
      }
    }
    return '';
  }
  defaultNbaFormControls() {
    // this.applyFilter(row.teamName);
    // this.selectedTeam = row.teamName;
    let tmpEvent = {
      value: ''
    }
    this.httpService.nbaAllTeams.forEach(team0 => {
      this.httpService.nbaAllTeams.forEach(team => {
        if (team.teamName === team0.nextOpponent) {
          if ((team.blocksTotal / team.games.length) < this.blocksQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (((team.blocksTotal / team.games.length) >= this.blocksQuartile[0] && (team.blocksTotal / team.games.length) < this.blocksQuartile[1])) {
            tmpEvent.value = 'quart2';
          } else if (((team.blocksTotal / team.games.length) >= this.blocksQuartile[1] && (team.blocksTotal / team.games.length) < this.blocksQuartile[2])) {
            tmpEvent.value = 'quart3';
          } else if ((team.blocksTotal / team.games.length) >= this.blocksQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          this.blocksChange(tmpEvent, team0.teamName);
          tmpEvent.value = '';
          if ((team.defensiveReboundsTotal / team.games.length) < this.defensiveReboundsQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (((team.defensiveReboundsTotal / team.games.length) >= this.defensiveReboundsQuartile[0] && (team.defensiveReboundsTotal / team.games.length) < this.defensiveReboundsQuartile[1])) {
            tmpEvent.value = 'quart2';
          } else if (((team.defensiveReboundsTotal / team.games.length) >= this.defensiveReboundsQuartile[1] && (team.defensiveReboundsTotal / team.games.length) < this.defensiveReboundsQuartile[2])) {
            tmpEvent.value = 'quart3';
          } else if ((team.defensiveReboundsTotal / team.games.length) >= this.defensiveReboundsQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          if (tmpEvent.value !== '') {
            this.defensiveReboundsChange(tmpEvent, team0.teamName);
          }
          tmpEvent.value = '';
          if ((team.stealsTotal / team.games.length) < this.stealsQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (((team.stealsTotal / team.games.length) >= this.stealsQuartile[0] && (team.stealsTotal / team.games.length) < this.stealsQuartile[1])) {
            tmpEvent.value = 'quart2';
          } else if (((team.stealsTotal / team.games.length) >= this.stealsQuartile[1] && (team.stealsTotal / team.games.length) < this.stealsQuartile[2])) {
            tmpEvent.value = 'quart3';
          } else if ((team.stealsTotal / team.games.length) >= this.stealsQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          if (tmpEvent.value !== '') {
            this.stealsChange(tmpEvent, team0.teamName);
          }
          tmpEvent.value = '';
          if ((team.assistsTotal / team.games.length) < this.assistsQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (((team.assistsTotal / team.games.length) >= this.assistsQuartile[0] && (team.assistsTotal / team.games.length) < this.assistsQuartile[1])) {
            tmpEvent.value = 'quart2';
          } else if (((team.assistsTotal / team.games.length) >= this.assistsQuartile[1] && (team.assistsTotal / team.games.length) < this.assistsQuartile[2])) {
            tmpEvent.value = 'quart3';
          } else if ((team.assistsTotal / team.games.length) >= this.assistsQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          if (tmpEvent.value !== '') {
            this.assistsChange(tmpEvent, team0.teamName);
          }
          tmpEvent.value = '';
          if ((team.fieldGoalsTotal / team.games.length) < this.fieldGoalsQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (((team.fieldGoalsTotal / team.games.length) >= this.fieldGoalsQuartile[0] && (team.fieldGoalsTotal / team.games.length) < this.fieldGoalsQuartile[1])) {
            tmpEvent.value = 'quart2';
          } else if (((team.fieldGoalsTotal / team.games.length) >= this.fieldGoalsQuartile[1] && (team.fieldGoalsTotal / team.games.length) < this.fieldGoalsQuartile[2])) {
            tmpEvent.value = 'quart3';
          } else if ((team.fieldGoalsTotal / team.games.length) >= this.fieldGoalsQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          if (tmpEvent.value !== '') {
            this.fieldGoalsChange(tmpEvent, team0.teamName);
          }
          tmpEvent.value = '';
          if ((team.offensiveReboundsTotal / team.games.length) < this.offensiveReboundsQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (((team.offensiveReboundsTotal / team.games.length) >= this.offensiveReboundsQuartile[0] && (team.offensiveReboundsTotal / team.games.length) < this.offensiveReboundsQuartile[1])) {
            tmpEvent.value = 'quart2';
          } else if (((team.offensiveReboundsTotal / team.games.length) >= this.offensiveReboundsQuartile[1] && (team.offensiveReboundsTotal / team.games.length) < this.offensiveReboundsQuartile[2])) {
            tmpEvent.value = 'quart3';
          } else if ((team.offensiveReboundsTotal / team.games.length) >= this.offensiveReboundsQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          if (tmpEvent.value !== '') {
            this.offensiveReboundsChange(tmpEvent, team0.teamName);
          }
          tmpEvent.value = '';
          if ((team.turnoversTotal / team.games.length) < this.turnoversQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (((team.turnoversTotal / team.games.length) >= this.turnoversQuartile[0] && (team.turnoversTotal / team.games.length) < this.turnoversQuartile[1])) {
            tmpEvent.value = 'quart2';
          } else if (((team.turnoversTotal / team.games.length) >= this.turnoversQuartile[1] && (team.turnoversTotal / team.games.length) < this.turnoversQuartile[2])) {
            tmpEvent.value = 'quart3';
          } else if ((team.turnoversTotal / team.games.length) >= this.turnoversQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          if (tmpEvent.value !== '') {
            this.turnoversChange(tmpEvent, team0.teamName);
          }
          tmpEvent.value = '';
          if ((team.threePointsTotal / team.games.length) < this.threePointsQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (((team.threePointsTotal / team.games.length) >= this.threePointsQuartile[0] && (team.threePointsTotal / team.games.length) < this.threePointsQuartile[1])) {
            tmpEvent.value = 'quart2';
          } else if (((team.threePointsTotal / team.games.length) >= this.threePointsQuartile[1] && (team.threePointsTotal / team.games.length) < this.threePointsQuartile[2])) {
            tmpEvent.value = 'quart3';
          } else if ((team.threePointsTotal / team.games.length) >= this.threePointsQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          if (tmpEvent.value !== '') {
            this.threePointsChange(tmpEvent, team0.teamName);
          }
          tmpEvent.value = '';
          if ((team.pointsTotal / team.games.length) < this.nbaPointsQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (((team.pointsTotal / team.games.length) >= this.nbaPointsQuartile[0] && (team.pointsTotal / team.games.length) < this.nbaPointsQuartile[1])) {
            tmpEvent.value = 'quart2';
          } else if (((team.pointsTotal / team.games.length) >= this.nbaPointsQuartile[1] && (team.pointsTotal / team.games.length) < this.nbaPointsQuartile[2])) {
            tmpEvent.value = 'quart3';
          } else if ((team.pointsTotal / team.games.length) >= this.nbaPointsQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          if (tmpEvent.value !== '') {
            this.nbaPointsChange(tmpEvent, team0.teamName);
          }
        }
      });
    });
    let tmpNbaAllTeam: NbaTeam[] = [];
    this.httpService.nbaAllTeams.forEach(team1 => {
      if (team1.nextGameDate.getTime() != new Date('01/01/2999').getTime()) {
        this.httpService.nbaAllTeams.forEach(team2 => {
          if (team2.teamName === team1.nextOpponent) {
            if (!tmpNbaAllTeam.includes(team1)) {
              tmpNbaAllTeam.push(team1);
            }
            if (!tmpNbaAllTeam.includes(team2)) {
              tmpNbaAllTeam.push(team2);
            }
          }
        });
      }
    });
    this.nbaDataSource = new MatTableDataSource(tmpNbaAllTeam);
    this.nbaDataSource.sort = this.nbaSort;
  }

  defaultNhlFormControls() {
    // this.applyFilter(row.teamName);
    // this.selectedTeam = row.teamName;
    let tmpEvent = {
      value: ''
    }
    console.log('nhl teams: ', this.httpService.nhlAllTeams);
    this.httpService.nhlAllTeams.forEach(team0 => {
      this.httpService.nhlAllTeams.forEach(team => {
        if (team.teamName === team0.nextOpponent) {
          tmpEvent.value = '';
          if ((team.goalsTotal / team.games.length) < this.goalsQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (((team.goalsTotal / team.games.length) >= this.goalsQuartile[0] && (team.goalsTotal / team.games.length) < this.goalsQuartile[1])) {
            tmpEvent.value = 'quart2';
          } else if (((team.goalsTotal / team.games.length) >= this.goalsQuartile[1] && (team.goalsTotal / team.games.length) < this.goalsQuartile[2])) {
            tmpEvent.value = 'quart3';
          } else if ((team.goalsTotal / team.games.length) >= this.goalsQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          if (tmpEvent.value !== '') {
            this.goalsChange(tmpEvent, team0.teamName);
          }
          tmpEvent.value = '';
          if ((team.assistsTotal / team.games.length) < this.nhlAssistsQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (((team.assistsTotal / team.games.length) >= this.nhlAssistsQuartile[0] && (team.assistsTotal / team.games.length) < this.nhlAssistsQuartile[1])) {
            tmpEvent.value = 'quart2';
          } else if (((team.assistsTotal / team.games.length) >= this.nhlAssistsQuartile[1] && (team.assistsTotal / team.games.length) < this.nhlAssistsQuartile[2])) {
            tmpEvent.value = 'quart3';
          } else if ((team.assistsTotal / team.games.length) >= this.nhlAssistsQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          if (tmpEvent.value !== '') {
            this.nhlAssistsChange(tmpEvent, team0.teamName);
          }
          tmpEvent.value = '';
          if ((team.shootingPctAvg) < this.shootingPctQuartile[0]) {
            tmpEvent.value = 'quart1';
          } else if (team.shootingPctAvg >= this.shootingPctQuartile[0] && team.shootingPctAvg < this.shootingPctQuartile[1]) {
            tmpEvent.value = 'quart2';
          } else if (team.shootingPctAvg >= this.shootingPctQuartile[1] && team.shootingPctAvg < this.shootingPctQuartile[2]) {
            tmpEvent.value = 'quart3';
          } else if (team.shootingPctAvg >= this.shootingPctQuartile[2]) {
            tmpEvent.value = 'quart4';
          }
          if (tmpEvent.value !== '') {
            this.shootingChange(tmpEvent, team0.teamName);
          }
        }
      });
    });
    let tmpNhlAllTeam: NhlTeam[] = [];
    this.httpService.nhlAllTeams.forEach(team1 => {
      if (team1.nextGameDate.getTime() != new Date('01/01/2999').getTime()) {
        this.httpService.nhlAllTeams.forEach(team2 => {
          if (team2.teamName === team1.nextOpponent) {
            if (!tmpNhlAllTeam.includes(team1)) {
              tmpNhlAllTeam.push(team1);
            }
            if (!tmpNhlAllTeam.includes(team2)) {
              tmpNhlAllTeam.push(team2);
            }
          }
        });
      }
    });
    this.nhlDataSource = new MatTableDataSource(tmpNhlAllTeam);
    this.nhlDataSource.sort = this.nhlSort;
  }

  goalsChange(event: any, teamName: string) {
    this.httpService.nhlAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.goals.wins = 0;
        team.filterStats.goals.losses = 0;
        team.filterAtsStats.goals.wins = 0;
        team.filterAtsStats.goals.losses = 0;
        team.filterAtsFavoritesStats.goals.wins = 0;
        team.filterAtsFavoritesStats.goals.losses = 0;
        team.filterAtsUnderdogStats.goals.wins = 0;
        team.filterAtsUnderdogStats.goals.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.goalsGiven <= this.goalsQuartile[0]) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.goals.wins++;
                } else {
                  team.filterStats.goals.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.goals.wins++;
                    team.filterAtsFavoritesStats.goals.wins++;
                  } else {
                    team.filterAtsStats.goals.losses++;
                    team.filterAtsFavoritesStats.goals.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.goals.wins++;
                    team.filterAtsUnderdogStats.goals.wins++;
                  } else {
                    team.filterAtsStats.goals.losses++;
                    team.filterAtsUnderdogStats.goals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.goalsGiven > this.goalsQuartile[0]) && (game.goalsGiven <= this.goalsQuartile[1])) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.goals.wins++;
                } else {
                  team.filterStats.goals.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.goals.wins++;
                    team.filterAtsFavoritesStats.goals.wins++;
                  } else {
                    team.filterAtsStats.goals.losses++;
                    team.filterAtsFavoritesStats.goals.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.goals.wins++;
                    team.filterAtsUnderdogStats.goals.wins++;
                  } else {
                    team.filterAtsStats.goals.losses++;
                    team.filterAtsUnderdogStats.goals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.goalsGiven > this.goalsQuartile[1] && game.goalsGiven <= this.goalsQuartile[2]) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.goals.wins++;
                } else {
                  team.filterStats.goals.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.goals.wins++;
                    team.filterAtsFavoritesStats.goals.wins++;
                  } else {
                    team.filterAtsStats.goals.losses++;
                    team.filterAtsFavoritesStats.goals.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.goals.wins++;
                    team.filterAtsUnderdogStats.goals.wins++;
                  } else {
                    team.filterAtsStats.goals.losses++;
                    team.filterAtsUnderdogStats.goals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.goalsGiven > this.goalsQuartile[2]) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.goals.wins++;
                } else {
                  team.filterStats.goals.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.goals.wins++;
                    team.filterAtsFavoritesStats.goals.wins++;
                  } else {
                    team.filterAtsStats.goals.losses++;
                    team.filterAtsFavoritesStats.goals.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.goals.wins++;
                    team.filterAtsUnderdogStats.goals.wins++;
                  } else {
                    team.filterAtsStats.goals.losses++;
                    team.filterAtsUnderdogStats.goals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }

  nhlAssistsChange(event: any, teamName: string) {
    this.httpService.nhlAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.assists.wins = 0;
        team.filterStats.assists.losses = 0;
        team.filterAtsStats.assists.wins = 0;
        team.filterAtsStats.assists.losses = 0;
        team.filterAtsFavoritesStats.assists.wins = 0;
        team.filterAtsFavoritesStats.assists.losses = 0;
        team.filterAtsUnderdogStats.assists.wins = 0;
        team.filterAtsUnderdogStats.assists.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.assistsGiven <= this.nhlAssistsQuartile[0]) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.assists.wins++;
                } else {
                  team.filterStats.assists.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsFavoritesStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsFavoritesStats.assists.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsUnderdogStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsUnderdogStats.assists.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.assistsGiven > this.nhlAssistsQuartile[0]) && (game.assistsGiven <= this.nhlAssistsQuartile[1])) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.assists.wins++;
                } else {
                  team.filterStats.assists.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsFavoritesStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsFavoritesStats.assists.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsUnderdogStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsUnderdogStats.assists.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.assistsGiven > this.nhlAssistsQuartile[1] && game.assistsGiven <= this.nhlAssistsQuartile[2]) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.assists.wins++;
                } else {
                  team.filterStats.assists.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsFavoritesStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsFavoritesStats.assists.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsUnderdogStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsUnderdogStats.assists.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.assistsGiven > this.nhlAssistsQuartile[2]) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.assists.wins++;
                } else {
                  team.filterStats.assists.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsFavoritesStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsFavoritesStats.assists.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsUnderdogStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsUnderdogStats.assists.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }

  shootingChange(event: any, teamName: string) {
    this.httpService.nhlAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.shootingPct.wins = 0;
        team.filterStats.shootingPct.losses = 0;
        team.filterAtsStats.shootingPct.wins = 0;
        team.filterAtsStats.shootingPct.losses = 0;
        team.filterAtsFavoritesStats.shootingPct.wins = 0;
        team.filterAtsFavoritesStats.shootingPct.losses = 0;
        team.filterAtsUnderdogStats.shootingPct.wins = 0;
        team.filterAtsUnderdogStats.shootingPct.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.shootingPctGiven <= this.shootingPctQuartile[0]) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.shootingPct.wins++;
                } else {
                  team.filterStats.shootingPct.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.shootingPct.wins++;
                    team.filterAtsFavoritesStats.shootingPct.wins++;
                  } else {
                    team.filterAtsStats.shootingPct.losses++;
                    team.filterAtsFavoritesStats.shootingPct.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.shootingPct.wins++;
                    team.filterAtsUnderdogStats.shootingPct.wins++;
                  } else {
                    team.filterAtsStats.shootingPct.losses++;
                    team.filterAtsUnderdogStats.shootingPct.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.shootingPctGiven > this.shootingPctQuartile[0]) && (game.shootingPctGiven <= this.shootingPctQuartile[1])) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.shootingPct.wins++;
                } else {
                  team.filterStats.shootingPct.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.shootingPct.wins++;
                    team.filterAtsFavoritesStats.shootingPct.wins++;
                  } else {
                    team.filterAtsStats.shootingPct.losses++;
                    team.filterAtsFavoritesStats.shootingPct.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.shootingPct.wins++;
                    team.filterAtsUnderdogStats.shootingPct.wins++;
                  } else {
                    team.filterAtsStats.shootingPct.losses++;
                    team.filterAtsUnderdogStats.shootingPct.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.shootingPctGiven > this.shootingPctQuartile[1] && game.shootingPctGiven <= this.shootingPctQuartile[2]) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.shootingPct.wins++;
                } else {
                  team.filterStats.shootingPct.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.shootingPct.wins++;
                    team.filterAtsFavoritesStats.shootingPct.wins++;
                  } else {
                    team.filterAtsStats.shootingPct.losses++;
                    team.filterAtsFavoritesStats.shootingPct.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.shootingPct.wins++;
                    team.filterAtsUnderdogStats.shootingPct.wins++;
                  } else {
                    team.filterAtsStats.shootingPct.losses++;
                    team.filterAtsUnderdogStats.shootingPct.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nhlAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.shootingPctGiven > this.shootingPctQuartile[2]) {
                if (game.goals >= game.goalsGiven) {
                  team.filterStats.shootingPct.wins++;
                } else {
                  team.filterStats.shootingPct.losses++;
                }
                if (game.isFavorite) {
                  if (((game.goals - game.goalsGiven - 1.5) > 0)) {
                    team.filterAtsStats.shootingPct.wins++;
                    team.filterAtsFavoritesStats.shootingPct.wins++;
                  } else {
                    team.filterAtsStats.shootingPct.losses++;
                    team.filterAtsFavoritesStats.shootingPct.losses++;
                  }
                } else {
                  if (((game.goals - game.goalsGiven + 1.5) > 0)) {
                    team.filterAtsStats.shootingPct.wins++;
                    team.filterAtsUnderdogStats.shootingPct.wins++;
                  } else {
                    team.filterAtsStats.shootingPct.losses++;
                    team.filterAtsUnderdogStats.shootingPct.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }


  defaultFormControls() {
    // this.applyFilter(row.teamName);
    // this.selectedTeam = row.teamName;
    let tmpVal = '';
    let tmpEvent = {
      value: ''
    }
    console.log("🚀 ~ this.httpService.allTeams:", this.httpService.allTeams)

    this.httpService.allTeams.forEach(team0 => {
      this.httpService.allTeams.forEach(team => {
        if (team.teamName === team0.nextOpponent) {
          if ((team.passingAttemptsTotal / team.games.length) < this.passAttemptsQuartile[0]) {
            tmpVal = 'quart1';
            tmpEvent.value = 'quart1';
            this.passAttemptsPanelColor = 'crimson';
          } else if (((team.passingAttemptsTotal / team.games.length) >= this.passAttemptsQuartile[0] && (team.passingAttemptsTotal / team.games.length) < this.passAttemptsQuartile[1])) {
            tmpVal = 'quart2'; tmpEvent.value = 'quart2';
            this.passAttemptsPanelColor = 'orange';
          } else if (((team.passingAttemptsTotal / team.games.length) >= this.passAttemptsQuartile[1] && (team.passingAttemptsTotal / team.games.length) < this.passAttemptsQuartile[2])) {
            tmpVal = 'quart3'; tmpEvent.value = 'quart3';
            this.passAttemptsPanelColor = 'blueviolet';
          } else {
            tmpVal = 'quart4'; tmpEvent.value = 'quart4';
            this.passAttemptsPanelColor = 'green';
          }
          this.basicStatsForm.get('passAttemptsCtrl')?.patchValue(tmpVal);
          this.passAttemptChange(tmpEvent, team0.teamName);

          if ((team.passingYardsTotal / team.games.length) < this.passYardsQuartile[0]) {
            tmpVal = 'quart1'; tmpEvent.value = 'quart1';
            this.passYardsPanelColor = 'crimson';
          } else if (((team.passingYardsTotal / team.games.length) >= this.passYardsQuartile[0] && (team.passingYardsTotal / team.games.length) < this.passYardsQuartile[1])) {
            tmpVal = 'quart2'; tmpEvent.value = 'quart2';
            this.passYardsPanelColor = 'orange';
          } else if (((team.passingYardsTotal / team.games.length) >= this.passYardsQuartile[1] && (team.passingYardsTotal / team.games.length) < this.passYardsQuartile[2])) {
            tmpVal = 'quart3'; tmpEvent.value = 'quart3';
            this.passYardsPanelColor = 'blueviolet';
          } else {
            tmpVal = 'quart4'; tmpEvent.value = 'quart4';
            this.passYardsPanelColor = 'green';
          }
          this.basicStatsForm.get('passYardsCtrl')?.patchValue(tmpVal);
          this.passYardsChange(tmpEvent, team0.teamName);

          if ((team.passingTdsTotal / team.games.length) < this.passTdsQuartile[0]) {
            tmpVal = 'quart1'; tmpEvent.value = 'quart1';
            this.passTdsPanelColor = 'crimson';
          } else if (((team.passingTdsTotal / team.games.length) >= this.passTdsQuartile[0] && (team.passingTdsTotal / team.games.length) < this.passTdsQuartile[1])) {
            tmpVal = 'quart2'; tmpEvent.value = 'quart2';
            this.passTdsPanelColor = 'orange';
          } else if (((team.passingTdsTotal / team.games.length) >= this.passTdsQuartile[1] && (team.passingTdsTotal / team.games.length) < this.passTdsQuartile[2])) {
            tmpVal = 'quart3'; tmpEvent.value = 'quart3';
            this.passTdsPanelColor = 'blueviolet';
          } else {
            tmpVal = 'quart4'; tmpEvent.value = 'quart4';
            this.passTdsPanelColor = 'green';
          }
          this.basicStatsForm.get('passTdsCtrl')?.patchValue(tmpVal);
          this.passTdsChange(tmpEvent, team0.teamName);

          if ((team.rushingAttemptsTotal / team.games.length) < this.rushAttemptsQuartile[0]) {
            tmpVal = 'quart1'; tmpEvent.value = 'quart1';
            this.rushAttemptsPanelColor = 'crimson';
          } else if (((team.rushingAttemptsTotal / team.games.length) >= this.rushAttemptsQuartile[0] && (team.rushingAttemptsTotal / team.games.length) < this.rushAttemptsQuartile[1])) {
            tmpVal = 'quart2'; tmpEvent.value = 'quart2';
            this.rushAttemptsPanelColor = 'orange';
          } else if (((team.rushingAttemptsTotal / team.games.length) >= this.rushAttemptsQuartile[1] && (team.rushingAttemptsTotal / team.games.length) < this.rushAttemptsQuartile[2])) {
            tmpVal = 'quart3'; tmpEvent.value = 'quart3';
            this.rushAttemptsPanelColor = 'blueviolet';
          } else {
            tmpVal = 'quart4'; tmpEvent.value = 'quart4';
            this.rushAttemptsPanelColor = 'green';
          }
          // this.basicStatsForm.get('rushAttemptsCtrl')?.patchValue(tmpVal);
          this.rushAttemptsChange(tmpEvent, team0.teamName);

          if ((team.rushingYardsTotal / team.games.length) < this.rushYardsQuartile[0]) {
            tmpVal = 'quart1'; tmpEvent.value = 'quart1';
            this.rushYardsPanelColor = 'crimson';
          } else if (((team.rushingYardsTotal / team.games.length) >= this.rushYardsQuartile[0] && (team.rushingYardsTotal / team.games.length) < this.rushYardsQuartile[1])) {
            tmpVal = 'quart2'; tmpEvent.value = 'quart2';
            this.rushYardsPanelColor = 'orange';
          } else if (((team.rushingYardsTotal / team.games.length) >= this.rushYardsQuartile[1] && (team.rushingYardsTotal / team.games.length) < this.rushYardsQuartile[2])) {
            tmpVal = 'quart3'; tmpEvent.value = 'quart3';
            this.rushYardsPanelColor = 'blueviolet';
          } else {
            tmpVal = 'quart4'; tmpEvent.value = 'quart4';
            this.rushYardsPanelColor = 'green';
          }
          this.basicStatsForm.get('rushYardsCtrl')?.patchValue(tmpVal);
          this.rushYardsChange(tmpEvent, team0.teamName);

          if ((team.rushingTdsTotal / team.games.length) < this.rushTdsQuartile[0]) {
            tmpVal = 'quart1'; tmpEvent.value = 'quart1';
            this.rushTdsPanelColor = 'crimson';
          } else if (((team.rushingTdsTotal / team.games.length) >= this.rushTdsQuartile[0] && (team.rushingTdsTotal / team.games.length) < this.rushTdsQuartile[1])) {
            tmpVal = 'quart2'; tmpEvent.value = 'quart2';
            this.rushTdsPanelColor = 'orange';
          } else if (((team.rushingTdsTotal / team.games.length) >= this.rushTdsQuartile[1] && (team.rushingTdsTotal / team.games.length) < this.rushTdsQuartile[2])) {
            tmpVal = 'quart3'; tmpEvent.value = 'quart3';
            this.rushTdsPanelColor = 'blueviolet';
          } else {
            tmpVal = 'quart4'; tmpEvent.value = 'quart4';
            this.rushTdsPanelColor = 'green';
          }
          this.basicStatsForm.get('rushTdCtrl')?.patchValue(tmpVal);
          this.rushTdsChange(tmpEvent, team0.teamName);

          if ((team.firstDownsTotal / team.games.length) < this.firstDownsQuartile[0]) {
            tmpVal = 'quart1'; tmpEvent.value = 'quart1';
            this.firstDownsPanelColor = 'crimson';
          } else if (((team.firstDownsTotal / team.games.length) >= this.firstDownsQuartile[0] && (team.firstDownsTotal / team.games.length) < this.firstDownsQuartile[1])) {
            tmpVal = 'quart2'; tmpEvent.value = 'quart2';
            this.firstDownsPanelColor = 'orange';
          } else if (((team.firstDownsTotal / team.games.length) >= this.firstDownsQuartile[1] && (team.firstDownsTotal / team.games.length) < this.firstDownsQuartile[2])) {
            tmpVal = 'quart3'; tmpEvent.value = 'quart3';
            this.firstDownsPanelColor = 'blueviolet';
          } else {
            tmpVal = 'quart4'; tmpEvent.value = 'quart4';
            this.firstDownsPanelColor = 'green';
          }
          this.basicStatsForm.get('firstDownsCtrl')?.patchValue(tmpVal);
          this.firstDownsChange(tmpEvent, team.teamName);

          if (team.thirdDownPctAvg < this.thirdDownQuartile[0]) {
            tmpVal = 'quart1'; tmpEvent.value = 'quart1';
            this.thirdDownPanelColor = 'crimson';
          } else if (team.thirdDownPctAvg >= this.thirdDownQuartile[0] && team.thirdDownPctAvg < this.thirdDownQuartile[1]) {
            tmpVal = 'quart2'; tmpEvent.value = 'quart2';
            this.thirdDownPanelColor = 'orange';
          } else if (team.thirdDownPctAvg >= this.thirdDownQuartile[1] && team.thirdDownPctAvg < this.thirdDownQuartile[2]) {
            tmpVal = 'quart3'; tmpEvent.value = 'quart3';
            this.thirdDownPanelColor = 'blueviolet';
          } else {
            tmpVal = 'quart4'; tmpEvent.value = 'quart4';
            this.thirdDownPanelColor = 'green';
          }
          this.basicStatsForm.get('thirdDownPctCtrl')?.patchValue(tmpVal);
          this.thirdDownChange(tmpEvent, team0.teamName);

          if (team.redzoneScoringPctAvg < this.redzoneQuartile[0]) {
            tmpVal = 'quart1'; tmpEvent.value = 'quart1';
            this.redzonePanelColor = 'crimson';
          } else if (team.redzoneScoringPctAvg >= this.redzoneQuartile[0] && team.redzoneScoringPctAvg < this.redzoneQuartile[1]) {
            tmpVal = 'quart2'; tmpEvent.value = 'quart2';
            this.redzonePanelColor = 'orange';
          } else if (team.redzoneScoringPctAvg >= this.redzoneQuartile[1] && team.redzoneScoringPctAvg < this.redzoneQuartile[2]) {
            tmpVal = 'quart3'; tmpEvent.value = 'quart3';
            this.redzonePanelColor = 'blueviolet';
          } else {
            tmpVal = 'quart4'; tmpEvent.value = 'quart4';
            this.redzonePanelColor = 'green';
          }
          this.basicStatsForm.get('redzoneScoringCtrl')?.patchValue(tmpVal);
          this.redzoneChange(tmpEvent, team0.teamName);

          if ((team.pointsTotal / team.games.length) < this.pointsQuartile[0]) {
            tmpVal = 'quart1'; tmpEvent.value = 'quart1';
            this.pointsPanelColor = 'crimson';
          } else if (((team.pointsTotal / team.games.length) >= this.pointsQuartile[0] && (team.pointsTotal / team.games.length) < this.pointsQuartile[1])) {
            tmpVal = 'quart2'; tmpEvent.value = 'quart2';
            this.pointsPanelColor = 'orange';
          } else if (((team.pointsTotal / team.games.length) >= this.pointsQuartile[1] && (team.pointsTotal / team.games.length) < this.pointsQuartile[2])) {
            tmpVal = 'quart3'; tmpEvent.value = 'quart3';
            this.pointsPanelColor = 'blueviolet';
          } else {
            tmpVal = 'quart4'; tmpEvent.value = 'quart4';
            this.pointsPanelColor = 'green';
          }
          this.basicStatsForm.get('pointsCtrl')?.patchValue(tmpVal);
          this.pointsChange(tmpEvent, team0.teamName);
        }
      })
    })
    // this.applyFilter(this.currentFilter);
    // this.calculateStd();
    let tmpAllTeam: Team[] = [];
    this.httpService.allTeams.forEach(team1 => {
      this.httpService.allTeams.forEach(team2 => {
        if (team2.teamName === team1.nextOpponent) {
          if (!tmpAllTeam.includes(team1)) {
            tmpAllTeam.push(team1);
          }
          if (!tmpAllTeam.includes(team2)) {
            tmpAllTeam.push(team2);
          }
        }
      });
    });
    this.dataSource = new MatTableDataSource(tmpAllTeam);
    this.dataSource.sort = this.sort;
  }

  openKeyDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(KeyModalComponent, {
      width: '300px',
      height: '300px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  returnOpponentAvgPassAttempts(opponentName: string): number {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.passingAttemptsTotal / team.games.length);
      }
    })
    return tmpVal;
  }

  checkPassAttempts(opponentName: string): string {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.passingAttemptsTotal / team.games.length) < this.passAttemptsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.passingAttemptsTotal / team.games.length) >= this.passAttemptsQuartile[0] && (team.passingAttemptsTotal / team.games.length) < this.passAttemptsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.passingAttemptsTotal / team.games.length) >= this.passAttemptsQuartile[1] && (team.passingAttemptsTotal / team.games.length) < this.passAttemptsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }
  checkBlocks(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.blocksTotal / team.games.length) < this.blocksQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.blocksTotal / team.games.length) >= this.blocksQuartile[0] && (team.blocksTotal / team.games.length) < this.blocksQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.blocksTotal / team.games.length) >= this.blocksQuartile[1] && (team.blocksTotal / team.games.length) < this.blocksQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkGoals(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nhlAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.goalsTotal / team.games.length) < this.goalsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.goalsTotal / team.games.length) >= this.goalsQuartile[0] && (team.goalsTotal / team.games.length) < this.goalsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.goalsTotal / team.games.length) >= this.goalsQuartile[1] && (team.goalsTotal / team.games.length) < this.goalsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkNhlAssists(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nhlAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.assistsTotal / team.games.length) < this.nhlAssistsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.assistsTotal / team.games.length) >= this.nhlAssistsQuartile[0] && (team.assistsTotal / team.games.length) < this.nhlAssistsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.assistsTotal / team.games.length) >= this.nhlAssistsQuartile[1] && (team.assistsTotal / team.games.length) < this.nhlAssistsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkShootingPct(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nhlAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if (team.shootingPctAvg < this.shootingPctQuartile[0]) {
          tmpVal = 'crimson';
        } else if (team.shootingPctAvg >= this.shootingPctQuartile[0] && team.shootingPctAvg < this.shootingPctQuartile[1]) {
          tmpVal = 'orange';
        } else if (team.shootingPctAvg >= this.shootingPctQuartile[1] && team.shootingPctAvg < this.shootingPctQuartile[2]) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkDefensiveRebounds(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.defensiveReboundsTotal / team.games.length) < this.defensiveReboundsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.defensiveReboundsTotal / team.games.length) >= this.defensiveReboundsQuartile[0] && (team.defensiveReboundsTotal / team.games.length) < this.defensiveReboundsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.defensiveReboundsTotal / team.games.length) >= this.defensiveReboundsQuartile[1] && (team.defensiveReboundsTotal / team.games.length) < this.defensiveReboundsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }
  checkSteals(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.stealsTotal / team.games.length) < this.stealsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.stealsTotal / team.games.length) >= this.stealsQuartile[0] && (team.stealsTotal / team.games.length) < this.stealsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.stealsTotal / team.games.length) >= this.stealsQuartile[1] && (team.stealsTotal / team.games.length) < this.stealsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }
  checkAssists(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.assistsTotal / team.games.length) < this.assistsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.assistsTotal / team.games.length) >= this.assistsQuartile[0] && (team.assistsTotal / team.games.length) < this.assistsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.assistsTotal / team.games.length) >= this.assistsQuartile[1] && (team.assistsTotal / team.games.length) < this.assistsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }
  checkFieldGoals(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.fieldGoalsTotal / team.games.length) < this.fieldGoalsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.fieldGoalsTotal / team.games.length) >= this.fieldGoalsQuartile[0] && (team.fieldGoalsTotal / team.games.length) < this.fieldGoalsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.fieldGoalsTotal / team.games.length) >= this.fieldGoalsQuartile[1] && (team.fieldGoalsTotal / team.games.length) < this.fieldGoalsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }
  checkOffensiveRebounds(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.offensiveReboundsTotal / team.games.length) < this.offensiveReboundsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.offensiveReboundsTotal / team.games.length) >= this.offensiveReboundsQuartile[0] && (team.offensiveReboundsTotal / team.games.length) < this.offensiveReboundsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.offensiveReboundsTotal / team.games.length) >= this.offensiveReboundsQuartile[1] && (team.offensiveReboundsTotal / team.games.length) < this.offensiveReboundsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }
  checkTurnovers(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.turnoversTotal / team.games.length) < this.turnoversQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.turnoversTotal / team.games.length) >= this.turnoversQuartile[0] && (team.turnoversTotal / team.games.length) < this.turnoversQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.turnoversTotal / team.games.length) >= this.turnoversQuartile[1] && (team.turnoversTotal / team.games.length) < this.turnoversQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }
  checkThreePoints(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.threePointsTotal / team.games.length) < this.threePointsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.threePointsTotal / team.games.length) >= this.threePointsQuartile[0] && (team.threePointsTotal / team.games.length) < this.threePointsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.threePointsTotal / team.games.length) >= this.threePointsQuartile[1] && (team.threePointsTotal / team.games.length) < this.threePointsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }
  checkNbaPoints(opponentName: string): string {
    let tmpVal = '';
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.pointsTotal / team.games.length) < this.nbaPointsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.pointsTotal / team.games.length) >= this.nbaPointsQuartile[0] && (team.pointsTotal / team.games.length) < this.nbaPointsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.pointsTotal / team.games.length) >= this.nbaPointsQuartile[1] && (team.pointsTotal / team.games.length) < this.nbaPointsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkPassYards(opponentName: string) {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.passingYardsTotal / team.games.length) < this.passYardsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.passingYardsTotal / team.games.length) >= this.passYardsQuartile[0] && (team.passingYardsTotal / team.games.length) < this.passYardsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.passingYardsTotal / team.games.length) >= this.passYardsQuartile[1] && (team.passingYardsTotal / team.games.length) < this.passYardsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkPassTds(opponentName: string) {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.passingTdsTotal / team.games.length) < this.passTdsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.passingTdsTotal / team.games.length) >= this.passTdsQuartile[0] && (team.passingTdsTotal / team.games.length) < this.passTdsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.passingTdsTotal / team.games.length) >= this.passTdsQuartile[1] && (team.passingTdsTotal / team.games.length) < this.passTdsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }


  checkRushAttempts(opponentName: string) {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.rushingAttemptsTotal / team.games.length) < this.rushAttemptsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.rushingAttemptsTotal / team.games.length) >= this.rushAttemptsQuartile[0] && (team.rushingAttemptsTotal / team.games.length) < this.rushAttemptsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.rushingAttemptsTotal / team.games.length) >= this.rushAttemptsQuartile[1] && (team.rushingAttemptsTotal / team.games.length) < this.rushAttemptsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkRushYards(opponentName: string) {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.rushingYardsTotal / team.games.length) < this.rushYardsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.rushingYardsTotal / team.games.length) >= this.rushYardsQuartile[0] && (team.rushingYardsTotal / team.games.length) < this.rushYardsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.rushingYardsTotal / team.games.length) >= this.rushYardsQuartile[1] && (team.rushingYardsTotal / team.games.length) < this.rushYardsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkRushTds(opponentName: string) {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.rushingTdsTotal / team.games.length) < this.rushTdsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.rushingTdsTotal / team.games.length) >= this.rushTdsQuartile[0] && (team.rushingTdsTotal / team.games.length) < this.rushTdsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.rushingTdsTotal / team.games.length) >= this.rushTdsQuartile[1] && (team.rushingTdsTotal / team.games.length) < this.rushTdsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkFirstDowns(opponentName: string) {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.firstDownsTotal / team.games.length) < this.firstDownsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.firstDownsTotal / team.games.length) >= this.firstDownsQuartile[0] && (team.firstDownsTotal / team.games.length) < this.firstDownsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.firstDownsTotal / team.games.length) >= this.firstDownsQuartile[1] && (team.firstDownsTotal / team.games.length) < this.firstDownsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkSacks(opponentName: string) {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.sacksTotal / team.games.length) < this.sacksQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.sacksTotal / team.games.length) >= this.sacksQuartile[0] && (team.sacksTotal / team.games.length) < this.sacksQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.sacksTotal / team.games.length) >= this.sacksQuartile[1] && (team.sacksTotal / team.games.length) < this.sacksQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkInterceptions(opponentName: string) {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.interceptionsTotal / team.games.length) < this.interceptionsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.interceptionsTotal / team.games.length) >= this.interceptionsQuartile[0] && (team.interceptionsTotal / team.games.length) < this.interceptionsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.interceptionsTotal / team.games.length) >= this.interceptionsQuartile[1] && (team.interceptionsTotal / team.games.length) < this.interceptionsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkThirdDown(opponentName: string) {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.thirdDownPctAvg) < this.thirdDownQuartile[0]) {
          tmpVal = 'crimson';
        } else if (team.thirdDownPctAvg >= this.thirdDownQuartile[0] && team.thirdDownPctAvg < this.thirdDownQuartile[1]) {
          tmpVal = 'orange';
        } else if (team.thirdDownPctAvg >= this.thirdDownQuartile[1] && team.thirdDownPctAvg < this.thirdDownQuartile[2]) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkRedzone(opponentName: string) {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.redzoneScoringPctAvg) < this.redzoneQuartile[0]) {
          tmpVal = 'crimson';
        } else if (team.redzoneScoringPctAvg >= this.redzoneQuartile[0] && team.redzoneScoringPctAvg < this.redzoneQuartile[1]) {
          tmpVal = 'orange';
        } else if (team.redzoneScoringPctAvg >= this.redzoneQuartile[1] && team.redzoneScoringPctAvg < this.redzoneQuartile[2]) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  checkPoints(opponentName: string) {
    let tmpVal = '';
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        if ((team.pointsTotal / team.games.length) < this.pointsQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.pointsTotal / team.games.length) >= this.pointsQuartile[0] && (team.pointsTotal / team.games.length) < this.pointsQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.pointsTotal / team.games.length) >= this.pointsQuartile[1] && (team.pointsTotal / team.games.length) < this.pointsQuartile[2])) {
          tmpVal = 'blueviolet';
        } else {
          tmpVal = 'green';
        }
      }
    });
    return tmpVal;
  }

  returnOpponentAvgPassYards(opponentName: string) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.passingYardsTotal / team.games.length);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgGoals(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nhlAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.goalsTotal / team.games.length);
      }
    })
    return tmpVal;
  }
  returnNhlOpponentAvgAssists(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nhlAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.assistsTotal / team.games.length);
      }
    })
    return tmpVal;
  }
  returnOpponentAvgShootingPct(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nhlAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.shootingPctAvg);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgBlocks(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.blocksTotal / team.games.length);
      }
    })
    return tmpVal;
  }
  returnOpponentAvgDefensiveRebounds(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.defensiveReboundsTotal / team.games.length);
      }
    })
    return tmpVal;
  }
  returnOpponentAvgSteals(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.stealsTotal / team.games.length);
      }
    })
    return tmpVal;
  }
  returnOpponentAvgAssists(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.assistsTotal / team.games.length);
      }
    })
    return tmpVal;
  }
  returnOpponentAvgFieldGoals(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.fieldGoalsTotal / team.games.length);
      }
    })
    return tmpVal;
  }
  returnOpponentAvgOffensiveRebounds(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.offensiveReboundsTotal / team.games.length);
      }
    })
    return tmpVal;
  }
  returnOpponentAvgTurnovers(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.turnoversTotal / team.games.length);
      }
    })
    return tmpVal;
  }
  returnOpponentAvgThreePoints(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.threePointsTotal / team.games.length);
      }
    })
    return tmpVal;
  }
  returnOpponentAvgNbaPoints(opponentName: string) {
    let tmpVal = 0;
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.pointsTotal / team.games.length);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgPassTds(opponentName: string) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.passingTdsTotal / team.games.length);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgRushAttempts(opponentName: string) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.rushingAttemptsTotal / team.games.length);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgRushYards(opponentName: string) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.rushingYardsTotal / team.games.length);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgRushTds(opponentName: string) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.rushingTdsTotal / team.games.length);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgFirstDowns(opponentName: string) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.firstDownsTotal / team.games.length);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgSacks(opponentName: string) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.sacksTotal / team.games.length);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgInterceptions(opponentName: string) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.interceptionsTotal / team.games.length);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgThirdDowns(opponentName: string) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.thirdDownPctAvg);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgRedzone(opponentName: string) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.redzoneScoringPctAvg);
      }
    })
    return tmpVal;
  }

  returnOpponentAvgPoints(opponentName: string): number {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === opponentName) {
        tmpVal = (team.pointsTotal / team.games.length);
      }
    })
    return tmpVal;
  }

  passAttemptChange(event: any, teamName: string) {
    if (this.toggleInterUnionMsg !== 'Intersection Logic') {
      this.httpService.allTeams.forEach(team => {
        if (team.teamName === teamName) {
          team.filterStats.passAttempts.wins = 0;
          team.filterStats.passAttempts.losses = 0;
          team.filterAtsStats.passAttempts.wins = 0;
          team.filterAtsStats.passAttempts.losses = 0;
          team.filterAtsFavoritesStats.passAttempts.wins = 0;
          team.filterAtsFavoritesStats.passAttempts.losses = 0;
          team.filterAtsUnderdogStats.passAttempts.wins = 0;
          team.filterAtsUnderdogStats.passAttempts.losses = 0;
        }
      });
      switch (event.value) {
        case 'quart1': {
          this.passAttemptsPanelColor = 'crimson';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.passingAttemptsGiven < this.passAttemptsQuartile[0]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) - (team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses))) > 0.67) {
                          team.filterStats.passAttempts.winsArr.push(true);
                        }
                        if ((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) > 0.79) {
                          team.filterStats.passAttempts.winsArr2.push(true);
                        }
                        if ((team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses) > 0.67) {
                          team.filterStats.passAttempts.winsArr3.push(true);
                        }
                        team.filterStats.passAttempts.wins++;
                      } else {
                        if ((((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) - (team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses))) > 0.67) {
                          team.filterStats.passAttempts.winsArr.push(false);
                        }
                        if ((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) > 0.79) {
                          team.filterStats.passAttempts.winsArr2.push(false);
                        }
                        if ((team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses) > 0.67) {
                          team.filterStats.passAttempts.winsArr3.push(false);
                        }
                        team.filterStats.passAttempts.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) - (team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.passAttempts.wins++;
                          team.filterAtsFavoritesStats.passAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) - (team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.passAttempts.losses++;
                          team.filterAtsFavoritesStats.passAttempts.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) - (team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.passAttempts.wins++;
                          team.filterAtsUnderdogStats.passAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) - (team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.passAttempts.losses++;
                          team.filterAtsUnderdogStats.passAttempts.losses++;
                        }
                      }
                    }
                  }
                });
              });
            }
          });
          break;
        }
        case 'quart2': {
          this.passAttemptsPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if ((game.passingAttemptsGiven >= this.passAttemptsQuartile[0]) && (game.passingAttemptsGiven <= this.passAttemptsQuartile[1])) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) - (team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses))) > 0.67) {
                          team.filterStats.passAttempts.winsArr.push(true);
                        }
                        if ((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) > 0.79) {
                          team.filterStats.passAttempts.winsArr2.push(true);
                        }
                        if ((team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses) > 0.67) {
                          team.filterStats.passAttempts.winsArr3.push(true);
                        }
                        team.filterStats.passAttempts.wins++;
                      } else {
                        if ((((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) - (team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses))) > 0.67) {
                          team.filterStats.passAttempts.winsArr.push(false);
                        }
                        if ((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) > 0.79) {
                          team.filterStats.passAttempts.winsArr2.push(false);
                        }
                        if ((team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses) > 0.67) {
                          team.filterStats.passAttempts.winsArr3.push(false);
                        }
                        team.filterStats.passAttempts.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) - (team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.passAttempts.wins++;
                          team.filterAtsFavoritesStats.passAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) - (team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.passAttempts.losses++;
                          team.filterAtsFavoritesStats.passAttempts.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) - (team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.passAttempts.wins++;
                          team.filterAtsUnderdogStats.passAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) - (team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.passAttempts.losses++;
                          team.filterAtsUnderdogStats.passAttempts.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart3': {
          this.passAttemptsPanelColor = 'blueviolet';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.passingAttemptsGiven > this.passAttemptsQuartile[1] && game.passingAttemptsGiven <= this.passAttemptsQuartile[2]) {
                      if (team.teamName === teamName) {
                        team.games.forEach(game => {
                          this.httpService.allTeams.forEach(team2 => {
                            if (team2.teamId === game.opponentId) {
                              if ((game.passingAttemptsGiven >= this.passAttemptsQuartile[0]) && (game.passingAttemptsGiven <= this.passAttemptsQuartile[1])) {
                                if (game.points > game.pointsGiven) {
                                  if ((((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) - (team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses))) > 0.67) {
                                    team.filterStats.passAttempts.winsArr.push(true);
                                  }
                                  if ((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) > 0.79) {
                                    team.filterStats.passAttempts.winsArr2.push(true);
                                  }
                                  if ((team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses) > 0.67) {
                                    team.filterStats.passAttempts.winsArr3.push(true);
                                  }
                                  team.filterStats.passAttempts.wins++;
                                } else {
                                  if ((((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) - (team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses))) > 0.67) {
                                    team.filterStats.passAttempts.winsArr.push(false);
                                  }
                                  if ((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) > 0.79) {
                                    team.filterStats.passAttempts.winsArr2.push(false);
                                  }
                                  if ((team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses) > 0.67) {
                                    team.filterStats.passAttempts.winsArr3.push(false);
                                  }
                                  team.filterStats.passAttempts.losses++;
                                }
                                if (game.isFavorite) {
                                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                                    if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                                      team.filterAtsStats.passAttempts.winsArr.push(true);
                                    }
                                    if ((((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) - (team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses))) > 0.67) {
                                      team.filterAtsFavoritesStats.passAttempts.winsArr.push(true);
                                    }
                                    if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                                      team.filterAtsStats.passAttempts.winsArr2.push(true);
                                    }
                                    if ((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) > 0.79) {
                                      team.filterAtsFavoritesStats.passAttempts.winsArr2.push(true);
                                    }
                                    if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                                      team.filterAtsStats.passAttempts.winsArr3.push(true);
                                    }
                                    if ((team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses) > 0.67) {
                                      team.filterAtsFavoritesStats.passAttempts.winsArr3.push(true);
                                    }
                                    team.filterAtsStats.passAttempts.wins++;
                                    team.filterAtsFavoritesStats.passAttempts.wins++;
                                  } else {
                                    if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                                      team.filterAtsStats.passAttempts.winsArr.push(false);
                                    }
                                    if ((((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) - (team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses))) > 0.67) {
                                      team.filterAtsFavoritesStats.passAttempts.winsArr.push(false);
                                    }
                                    if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                                      team.filterAtsStats.passAttempts.winsArr2.push(false);
                                    }
                                    if ((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) > 0.79) {
                                      team.filterAtsFavoritesStats.passAttempts.winsArr2.push(false);
                                    }
                                    if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                                      team.filterAtsStats.passAttempts.winsArr3.push(false);
                                    }
                                    if ((team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses) > 0.67) {
                                      team.filterAtsFavoritesStats.passAttempts.winsArr3.push(false);
                                    }
                                    team.filterAtsStats.passAttempts.losses++;
                                    team.filterAtsFavoritesStats.passAttempts.losses++;
                                  }
                                } else {
                                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                                    if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                                      team.filterAtsStats.passAttempts.winsArr.push(true);
                                    }
                                    if ((((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) - (team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses))) > 0.67) {
                                      team.filterAtsUnderdogStats.passAttempts.winsArr.push(true);
                                    }
                                    if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                                      team.filterAtsStats.passAttempts.winsArr2.push(true);
                                    }
                                    if ((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) > 0.79) {
                                      team.filterAtsUnderdogStats.passAttempts.winsArr2.push(true);
                                    }
                                    if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                                      team.filterAtsStats.passAttempts.winsArr3.push(true);
                                    }
                                    if ((team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses) > 0.67) {
                                      team.filterAtsUnderdogStats.passAttempts.winsArr3.push(true);
                                    }
                                    team.filterAtsStats.passAttempts.wins++;
                                    team.filterAtsUnderdogStats.passAttempts.wins++;
                                  } else {
                                    if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                                      team.filterAtsStats.passAttempts.winsArr.push(false);
                                    }
                                    if ((((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) - (team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses))) > 0.67) {
                                      team.filterAtsUnderdogStats.passAttempts.winsArr.push(false);
                                    }
                                    if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                                      team.filterAtsStats.passAttempts.winsArr2.push(false);
                                    }
                                    if ((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) > 0.79) {
                                      team.filterAtsUnderdogStats.passAttempts.winsArr2.push(false);
                                    }
                                    if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                                      team.filterAtsStats.passAttempts.winsArr3.push(false);
                                    }
                                    if ((team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses) > 0.67) {
                                      team.filterAtsUnderdogStats.passAttempts.winsArr3.push(false);
                                    }
                                    team.filterAtsStats.passAttempts.losses++;
                                    team.filterAtsUnderdogStats.passAttempts.losses++;
                                  }
                                }
                              }
                            }
                          })
                        })
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart4': {
          this.passAttemptsPanelColor = 'green';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.passingAttemptsGiven > this.passAttemptsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) - (team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses))) > 0.67) {
                          team.filterStats.passAttempts.winsArr.push(true);
                        }
                        if ((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) > 0.79) {
                          team.filterStats.passAttempts.winsArr2.push(true);
                        }
                        if ((team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses) > 0.67) {
                          team.filterStats.passAttempts.winsArr3.push(true);
                        }
                        team.filterStats.passAttempts.wins++;
                      } else {
                        if ((((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) - (team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses))) > 0.67) {
                          team.filterStats.passAttempts.winsArr.push(false);
                        }
                        if ((team.filterStats.passAttempts.wins) / (team.filterStats.passAttempts.wins + team.filterStats.passAttempts.losses) > 0.79) {
                          team.filterStats.passAttempts.winsArr2.push(false);
                        }
                        if ((team2.filterStats.passAttempts.wins) / (team2.filterStats.passAttempts.wins + team2.filterStats.passAttempts.losses) > 0.67) {
                          team.filterStats.passAttempts.winsArr3.push(false);
                        }
                        team.filterStats.passAttempts.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) - (team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.passAttempts.wins++;
                          team.filterAtsFavoritesStats.passAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) - (team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.passAttempts.wins) / (team.filterAtsFavoritesStats.passAttempts.wins + team.filterAtsFavoritesStats.passAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.passAttempts.wins) / (team2.filterAtsFavoritesStats.passAttempts.wins + team2.filterAtsFavoritesStats.passAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.passAttempts.losses++;
                          team.filterAtsFavoritesStats.passAttempts.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) - (team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.passAttempts.wins++;
                          team.filterAtsUnderdogStats.passAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) - (team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) - (team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passAttempts.wins) / (team.filterAtsStats.passAttempts.wins + team.filterAtsStats.passAttempts.losses) > 0.79) {
                            team.filterAtsStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.passAttempts.wins) / (team.filterAtsUnderdogStats.passAttempts.wins + team.filterAtsUnderdogStats.passAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passAttempts.wins) / (team2.filterAtsStats.passAttempts.wins + team2.filterAtsStats.passAttempts.losses) > 0.67) {
                            team.filterAtsStats.passAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.passAttempts.wins) / (team2.filterAtsUnderdogStats.passAttempts.wins + team2.filterAtsUnderdogStats.passAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.passAttempts.losses++;
                          team.filterAtsUnderdogStats.passAttempts.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
        }
      }
    }
  }
  passYardsChange(event: any, teamName: string) {
    if (this.toggleInterUnionMsg !== 'Intersection Logic') {
      this.httpService.allTeams.forEach(team => {
        if (team.teamName === teamName) {
          team.filterStats.passYards.wins = 0;
          team.filterStats.passYards.losses = 0;
          team.filterAtsStats.passYards.wins = 0;
          team.filterAtsStats.passYards.losses = 0;
          team.filterAtsFavoritesStats.passYards.wins = 0;
          team.filterAtsFavoritesStats.passYards.losses = 0;
          team.filterAtsUnderdogStats.passYards.wins = 0;
          team.filterAtsUnderdogStats.passYards.losses = 0;
        }
      });
      switch (event.value) {
        case 'quart1': {
          this.passYardsPanelColor = 'crimson';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if ((game.passingYardsGiven >= this.passYardsQuartile[0]) && (game.passingYardsGiven <= this.passYardsQuartile[1])) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) - (team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses))) > 0.67) {
                          team.filterStats.passYards.winsArr.push(true);
                        }
                        if ((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) > 0.79) {
                          team.filterStats.passYards.winsArr2.push(true);
                        }
                        if ((team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses) > 0.67) {
                          team.filterStats.passYards.winsArr3.push(true);
                        }
                        team.filterStats.passYards.wins++;
                      } else {
                        if ((((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) - (team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses))) > 0.67) {
                          team.filterStats.passYards.winsArr.push(false);
                        }
                        if ((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) > 0.79) {
                          team.filterStats.passYards.winsArr2.push(false);
                        }
                        if ((team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses) > 0.67) {
                          team.filterStats.passYards.winsArr3.push(false);
                        }
                        team.filterStats.passYards.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) - (team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.passYards.wins++;
                          team.filterAtsFavoritesStats.passYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) - (team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.passYards.losses++;
                          team.filterAtsFavoritesStats.passYards.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) - (team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.passYards.wins++;
                          team.filterAtsUnderdogStats.passYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) - (team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.passYards.losses++;
                          team.filterAtsUnderdogStats.passYards.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart2': {
          this.passYardsPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if ((game.passingYardsGiven >= this.passYardsQuartile[0]) && (game.passingYardsGiven <= this.passYardsQuartile[1])) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) - (team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses))) > 0.67) {
                          team.filterStats.passYards.winsArr.push(true);
                        }
                        if ((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) > 0.79) {
                          team.filterStats.passYards.winsArr2.push(true);
                        }
                        if ((team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses) > 0.67) {
                          team.filterStats.passYards.winsArr3.push(true);
                        }
                        team.filterStats.passYards.wins++;
                      } else {
                        if ((((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) - (team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses))) > 0.67) {
                          team.filterStats.passYards.winsArr.push(false);
                        }
                        if ((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) > 0.79) {
                          team.filterStats.passYards.winsArr2.push(false);
                        }
                        if ((team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses) > 0.67) {
                          team.filterStats.passYards.winsArr3.push(false);
                        }
                        team.filterStats.passYards.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) - (team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.passYards.wins++;
                          team.filterAtsFavoritesStats.passYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) - (team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.passYards.losses++;
                          team.filterAtsFavoritesStats.passYards.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) - (team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.passYards.wins++;
                          team.filterAtsUnderdogStats.passYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) - (team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.passYards.losses++;
                          team.filterAtsUnderdogStats.passYards.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart3': {
          this.passYardsPanelColor = 'blueviolet';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.passingYardsGiven > this.passYardsQuartile[1] && game.passingYardsGiven <= this.passYardsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) - (team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses))) > 0.67) {
                          team.filterStats.passYards.winsArr.push(true);
                        }
                        if ((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) > 0.79) {
                          team.filterStats.passYards.winsArr2.push(true);
                        }
                        if ((team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses) > 0.67) {
                          team.filterStats.passYards.winsArr3.push(true);
                        }
                        team.filterStats.passYards.wins++;
                      } else {
                        if ((((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) - (team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses))) > 0.67) {
                          team.filterStats.passYards.winsArr.push(false);
                        }
                        if ((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) > 0.79) {
                          team.filterStats.passYards.winsArr2.push(false);
                        }
                        if ((team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses) > 0.67) {
                          team.filterStats.passYards.winsArr3.push(false);
                        }
                        team.filterStats.passYards.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) - (team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.passYards.wins++;
                          team.filterAtsFavoritesStats.passYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) - (team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.passYards.losses++;
                          team.filterAtsFavoritesStats.passYards.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) - (team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.passYards.wins++;
                          team.filterAtsUnderdogStats.passYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) - (team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.passYards.losses++;
                          team.filterAtsUnderdogStats.passYards.losses++;
                        }
                      }
                    }
                  }
                })
              })

            }
          })
          break;
        }
        case 'quart4': {
          this.passYardsPanelColor = 'green';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.passingYardsGiven > this.passYardsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) - (team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses))) > 0.67) {
                          team.filterStats.passYards.winsArr.push(true);
                        }
                        if ((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) > 0.79) {
                          team.filterStats.passYards.winsArr2.push(true);
                        }
                        if ((team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses) > 0.67) {
                          team.filterStats.passYards.winsArr3.push(true);
                        }
                        team.filterStats.passYards.wins++;
                      } else {
                        if ((((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) - (team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses))) > 0.67) {
                          team.filterStats.passYards.winsArr.push(false);
                        }
                        if ((team.filterStats.passYards.wins) / (team.filterStats.passYards.wins + team.filterStats.passYards.losses) > 0.79) {
                          team.filterStats.passYards.winsArr2.push(false);
                        }
                        if ((team2.filterStats.passYards.wins) / (team2.filterStats.passYards.wins + team2.filterStats.passYards.losses) > 0.67) {
                          team.filterStats.passYards.winsArr3.push(false);
                        }
                        team.filterStats.passYards.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) - (team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.passYards.wins++;
                          team.filterAtsFavoritesStats.passYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) - (team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.passYards.wins) / (team.filterAtsFavoritesStats.passYards.wins + team.filterAtsFavoritesStats.passYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.passYards.wins) / (team2.filterAtsFavoritesStats.passYards.wins + team2.filterAtsFavoritesStats.passYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.passYards.losses++;
                          team.filterAtsFavoritesStats.passYards.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) - (team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.passYards.wins++;
                          team.filterAtsUnderdogStats.passYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) - (team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses))) > 0.67) {
                            team.filterAtsStats.passYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) - (team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passYards.wins) / (team.filterAtsStats.passYards.wins + team.filterAtsStats.passYards.losses) > 0.79) {
                            team.filterAtsStats.passYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.passYards.wins) / (team.filterAtsUnderdogStats.passYards.wins + team.filterAtsUnderdogStats.passYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passYards.wins) / (team2.filterAtsStats.passYards.wins + team2.filterAtsStats.passYards.losses) > 0.67) {
                            team.filterAtsStats.passYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.passYards.wins) / (team2.filterAtsUnderdogStats.passYards.wins + team2.filterAtsUnderdogStats.passYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.passYards.losses++;
                          team.filterAtsUnderdogStats.passYards.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
        }
      }
    }
  }

  passTdsChange(event: any, teamName: string) {
    if (this.toggleInterUnionMsg !== 'Intersection Logic') {
      this.httpService.allTeams.forEach(team => {
        if (team.teamName === teamName) {
          team.filterStats.passTds.wins = 0;
          team.filterStats.passTds.losses = 0;
          team.filterAtsStats.passTds.wins = 0;
          team.filterAtsStats.passTds.losses = 0;
          team.filterAtsFavoritesStats.passTds.wins = 0;
          team.filterAtsFavoritesStats.passTds.losses = 0;
          team.filterAtsUnderdogStats.passTds.wins = 0;
          team.filterAtsUnderdogStats.passTds.losses = 0;
        }
      });
      switch (event.value) {
        case 'quart1': {
          this.passTdsPanelColor = 'crimson';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.passingTdsGiven < this.passTdsQuartile[0]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) - (team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses))) > 0.67) {
                          team.filterStats.passTds.winsArr.push(true);
                        }
                        if ((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) > 0.79) {
                          team.filterStats.passTds.winsArr2.push(true);
                        }
                        if ((team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses) > 0.67) {
                          team.filterStats.passTds.winsArr3.push(true);
                        }
                        team.filterStats.passTds.wins++;
                      } else {
                        if ((((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) - (team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses))) > 0.67) {
                          team.filterStats.passTds.winsArr.push(false);
                        }
                        if ((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) > 0.79) {
                          team.filterStats.passTds.winsArr2.push(false);
                        }
                        if ((team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses) > 0.67) {
                          team.filterStats.passTds.winsArr3.push(false);
                        }
                        team.filterStats.passTds.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) - (team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.passTds.wins++;
                          team.filterAtsFavoritesStats.passTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) - (team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.passTds.losses++;
                          team.filterAtsFavoritesStats.passTds.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) - (team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.passTds.wins++;
                          team.filterAtsUnderdogStats.passTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) - (team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.passTds.losses++;
                          team.filterAtsUnderdogStats.passTds.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart2': {
          this.passTdsPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if ((game.passingTdsGiven >= this.passTdsQuartile[0]) && (game.passingTdsGiven <= this.passTdsQuartile[1])) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) - (team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses))) > 0.67) {
                          team.filterStats.passTds.winsArr.push(true);
                        }
                        if ((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) > 0.79) {
                          team.filterStats.passTds.winsArr2.push(true);
                        }
                        if ((team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses) > 0.67) {
                          team.filterStats.passTds.winsArr3.push(true);
                        }
                        team.filterStats.passTds.wins++;
                      } else {
                        if ((((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) - (team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses))) > 0.67) {
                          team.filterStats.passTds.winsArr.push(false);
                        }
                        if ((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) > 0.79) {
                          team.filterStats.passTds.winsArr2.push(false);
                        }
                        if ((team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses) > 0.67) {
                          team.filterStats.passTds.winsArr3.push(false);
                        }
                        team.filterStats.passTds.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) - (team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.passTds.wins++;
                          team.filterAtsFavoritesStats.passTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) - (team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.passTds.losses++;
                          team.filterAtsFavoritesStats.passTds.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) - (team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.passTds.wins++;
                          team.filterAtsUnderdogStats.passTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) - (team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.passTds.losses++;
                          team.filterAtsUnderdogStats.passTds.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart3': {
          this.passTdsPanelColor = 'blueviolet';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.passingTdsGiven > this.passTdsQuartile[1] && game.passingTdsGiven <= this.passTdsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) - (team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses))) > 0.67) {
                          team.filterStats.passTds.winsArr.push(true);
                        }
                        if ((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) > 0.79) {
                          team.filterStats.passTds.winsArr2.push(true);
                        }
                        if ((team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses) > 0.67) {
                          team.filterStats.passTds.winsArr3.push(true);
                        }
                        team.filterStats.passTds.wins++;
                      } else {
                        if ((((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) - (team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses))) > 0.67) {
                          team.filterStats.passTds.winsArr.push(false);
                        }
                        if ((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) > 0.79) {
                          team.filterStats.passTds.winsArr2.push(false);
                        }
                        if ((team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses) > 0.67) {
                          team.filterStats.passTds.winsArr3.push(false);
                        }
                        team.filterStats.passTds.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) - (team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.passTds.wins++;
                          team.filterAtsFavoritesStats.passTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) - (team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.passTds.losses++;
                          team.filterAtsFavoritesStats.passTds.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) - (team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.passTds.wins++;
                          team.filterAtsUnderdogStats.passTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) - (team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.passTds.losses++;
                          team.filterAtsUnderdogStats.passTds.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart4': {
          this.passTdsPanelColor = 'green';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.passingTdsGiven > this.passTdsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) - (team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses))) > 0.67) {
                          team.filterStats.passTds.winsArr.push(true);
                        }
                        if ((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) > 0.79) {
                          team.filterStats.passTds.winsArr2.push(true);
                        }
                        if ((team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses) > 0.67) {
                          team.filterStats.passTds.winsArr3.push(true);
                        }
                        team.filterStats.passTds.wins++;
                      } else {
                        if ((((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) - (team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses))) > 0.67) {
                          team.filterStats.passTds.winsArr.push(false);
                        }
                        if ((team.filterStats.passTds.wins) / (team.filterStats.passTds.wins + team.filterStats.passTds.losses) > 0.79) {
                          team.filterStats.passTds.winsArr2.push(false);
                        }
                        if ((team2.filterStats.passTds.wins) / (team2.filterStats.passTds.wins + team2.filterStats.passTds.losses) > 0.67) {
                          team.filterStats.passTds.winsArr3.push(false);
                        }
                        team.filterStats.passTds.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) - (team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.passTds.wins++;
                          team.filterAtsFavoritesStats.passTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) - (team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.passTds.wins) / (team.filterAtsFavoritesStats.passTds.wins + team.filterAtsFavoritesStats.passTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.passTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.passTds.wins) / (team2.filterAtsFavoritesStats.passTds.wins + team2.filterAtsFavoritesStats.passTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.passTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.passTds.losses++;
                          team.filterAtsFavoritesStats.passTds.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) - (team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.passTds.wins++;
                          team.filterAtsUnderdogStats.passTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) - (team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses))) > 0.67) {
                            team.filterAtsStats.passTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) - (team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.passTds.wins) / (team.filterAtsStats.passTds.wins + team.filterAtsStats.passTds.losses) > 0.79) {
                            team.filterAtsStats.passTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.passTds.wins) / (team.filterAtsUnderdogStats.passTds.wins + team.filterAtsUnderdogStats.passTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.passTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.passTds.wins) / (team2.filterAtsStats.passTds.wins + team2.filterAtsStats.passTds.losses) > 0.67) {
                            team.filterAtsStats.passTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.passTds.wins) / (team2.filterAtsUnderdogStats.passTds.wins + team2.filterAtsUnderdogStats.passTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.passTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.passTds.losses++;
                          team.filterAtsUnderdogStats.passTds.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
      }
    }
  }

  rushAttemptsChange(event: any, teamName) {
    if (this.toggleInterUnionMsg !== 'Intersection Logic') {
      this.httpService.allTeams.forEach(team => {
        if (team.teamName === teamName) {
          team.filterStats.rushAttempts.wins = 0;
          team.filterStats.rushAttempts.losses = 0;
          team.filterAtsStats.rushAttempts.wins = 0;
          team.filterAtsStats.rushAttempts.losses = 0;
          team.filterAtsFavoritesStats.rushAttempts.wins = 0;
          team.filterAtsFavoritesStats.rushAttempts.losses = 0;
          team.filterAtsUnderdogStats.rushAttempts.wins = 0;
          team.filterAtsUnderdogStats.rushAttempts.losses = 0;
        }
      });
      switch (event.value) {
        case 'quart1': {
          this.rushAttemptsPanelColor = 'crimson';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.rushingAttemptsGiven < this.rushAttemptsQuartile[0]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) - (team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses))) > 0.67) {
                          team.filterStats.rushAttempts.winsArr.push(true);
                        }
                        if ((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) > 0.79) {
                          team.filterStats.rushAttempts.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses) > 0.67) {
                          team.filterStats.rushAttempts.winsArr3.push(true);
                        }
                        team.filterStats.rushAttempts.wins++;
                      } else {
                        if ((((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) - (team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses))) > 0.67) {
                          team.filterStats.rushAttempts.winsArr.push(false);
                        }
                        if ((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) > 0.79) {
                          team.filterStats.rushAttempts.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses) > 0.67) {
                          team.filterStats.rushAttempts.winsArr3.push(false);
                        }
                        team.filterStats.rushAttempts.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) - (team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushAttempts.wins++;
                          team.filterAtsFavoritesStats.rushAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) - (team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushAttempts.losses++;
                          team.filterAtsFavoritesStats.rushAttempts.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) - (team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushAttempts.wins++;
                          team.filterAtsUnderdogStats.rushAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) - (team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushAttempts.losses++;
                          team.filterAtsUnderdogStats.rushAttempts.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          });
          break;
        }
        case 'quart2': {
          this.rushAttemptsPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if ((game.rushingAttemptsGiven >= this.rushAttemptsQuartile[0]) && (game.rushingAttemptsGiven <= this.rushAttemptsQuartile[1])) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) - (team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses))) > 0.67) {
                          team.filterStats.rushAttempts.winsArr.push(true);
                        }
                        if ((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) > 0.79) {
                          team.filterStats.rushAttempts.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses) > 0.67) {
                          team.filterStats.rushAttempts.winsArr3.push(true);
                        }
                        team.filterStats.rushAttempts.wins++;
                      } else {
                        if ((((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) - (team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses))) > 0.67) {
                          team.filterStats.rushAttempts.winsArr.push(false);
                        }
                        if ((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) > 0.79) {
                          team.filterStats.rushAttempts.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses) > 0.67) {
                          team.filterStats.rushAttempts.winsArr3.push(false);
                        }
                        team.filterStats.rushAttempts.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) - (team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushAttempts.wins++;
                          team.filterAtsFavoritesStats.rushAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) - (team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushAttempts.losses++;
                          team.filterAtsFavoritesStats.rushAttempts.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) - (team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushAttempts.wins++;
                          team.filterAtsUnderdogStats.rushAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) - (team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushAttempts.losses++;
                          team.filterAtsUnderdogStats.rushAttempts.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart3': {
          this.rushAttemptsPanelColor = 'blueviolet';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.rushingAttemptsGiven > this.rushAttemptsQuartile[1] && game.rushingAttemptsGiven <= this.rushAttemptsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) - (team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses))) > 0.67) {
                          team.filterStats.rushAttempts.winsArr.push(true);
                        }
                        if ((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) > 0.79) {
                          team.filterStats.rushAttempts.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses) > 0.67) {
                          team.filterStats.rushAttempts.winsArr3.push(true);
                        }
                        team.filterStats.rushAttempts.wins++;
                      } else {
                        if ((((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) - (team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses))) > 0.67) {
                          team.filterStats.rushAttempts.winsArr.push(false);
                        }
                        if ((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) > 0.79) {
                          team.filterStats.rushAttempts.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses) > 0.67) {
                          team.filterStats.rushAttempts.winsArr3.push(false);
                        }
                        team.filterStats.rushAttempts.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) - (team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushAttempts.wins++;
                          team.filterAtsFavoritesStats.rushAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) - (team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushAttempts.losses++;
                          team.filterAtsFavoritesStats.rushAttempts.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) - (team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushAttempts.wins++;
                          team.filterAtsUnderdogStats.rushAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) - (team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushAttempts.losses++;
                          team.filterAtsUnderdogStats.rushAttempts.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart4': {
          this.rushAttemptsPanelColor = 'green';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.rushingAttemptsGiven > this.rushAttemptsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) - (team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses))) > 0.67) {
                          team.filterStats.rushAttempts.winsArr.push(true);
                        }
                        if ((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) > 0.79) {
                          team.filterStats.rushAttempts.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses) > 0.67) {
                          team.filterStats.rushAttempts.winsArr3.push(true);
                        }
                        team.filterStats.rushAttempts.wins++;
                      } else {
                        if ((((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) - (team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses))) > 0.67) {
                          team.filterStats.rushAttempts.winsArr.push(false);
                        }
                        if ((team.filterStats.rushAttempts.wins) / (team.filterStats.rushAttempts.wins + team.filterStats.rushAttempts.losses) > 0.79) {
                          team.filterStats.rushAttempts.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushAttempts.wins) / (team2.filterStats.rushAttempts.wins + team2.filterStats.rushAttempts.losses) > 0.67) {
                          team.filterStats.rushAttempts.winsArr3.push(false);
                        }
                        team.filterStats.rushAttempts.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) - (team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushAttempts.wins++;
                          team.filterAtsFavoritesStats.rushAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) - (team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushAttempts.wins) / (team.filterAtsFavoritesStats.rushAttempts.wins + team.filterAtsFavoritesStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushAttempts.wins) / (team2.filterAtsFavoritesStats.rushAttempts.wins + team2.filterAtsFavoritesStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushAttempts.losses++;
                          team.filterAtsFavoritesStats.rushAttempts.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) - (team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushAttempts.wins++;
                          team.filterAtsUnderdogStats.rushAttempts.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) - (team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) - (team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushAttempts.wins) / (team.filterAtsStats.rushAttempts.wins + team.filterAtsStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushAttempts.wins) / (team.filterAtsUnderdogStats.rushAttempts.wins + team.filterAtsUnderdogStats.rushAttempts.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushAttempts.wins) / (team2.filterAtsStats.rushAttempts.wins + team2.filterAtsStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsStats.rushAttempts.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushAttempts.wins) / (team2.filterAtsUnderdogStats.rushAttempts.wins + team2.filterAtsUnderdogStats.rushAttempts.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushAttempts.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushAttempts.losses++;
                          team.filterAtsUnderdogStats.rushAttempts.losses++;
                          team.filterAtsUnderdogStats.rushAttempts.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
      }
    }
  }

  rushYardsChange(event: any, teamName: string) {
    if (this.toggleInterUnionMsg !== 'Intersection Logic') {
      this.httpService.allTeams.forEach(team => {
        if (team.teamName === teamName) {
          team.filterStats.rushYards.wins = 0;
          team.filterStats.rushYards.losses = 0;
          team.filterAtsStats.rushYards.wins = 0;
          team.filterAtsStats.rushYards.losses = 0;
          team.filterAtsFavoritesStats.rushYards.wins = 0;
          team.filterAtsFavoritesStats.rushYards.losses = 0;
          team.filterAtsUnderdogStats.rushYards.wins = 0;
          team.filterAtsUnderdogStats.rushYards.losses = 0;
        }
      });
      switch (event.value) {
        case 'quart1': {
          this.rushYardsPanelColor = 'crimson';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.rushingYardsGiven < this.rushYardsQuartile[0]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) - (team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses))) > 0.67) {
                          team.filterStats.rushYards.winsArr.push(true);
                        }
                        if ((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) > 0.79) {
                          team.filterStats.rushYards.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses) > 0.67) {
                          team.filterStats.rushYards.winsArr3.push(true);
                        }
                        team.filterStats.rushYards.wins++;
                      } else {
                        if ((((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) - (team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses))) > 0.67) {
                          team.filterStats.rushYards.winsArr.push(false);
                        }
                        if ((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) > 0.79) {
                          team.filterStats.rushYards.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses) > 0.67) {
                          team.filterStats.rushYards.winsArr3.push(false);
                        }
                        team.filterStats.rushYards.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) - (team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushYards.wins++;
                          team.filterAtsFavoritesStats.rushYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) - (team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushYards.losses++;
                          team.filterAtsFavoritesStats.rushYards.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) - (team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushYards.wins++;
                          team.filterAtsUnderdogStats.rushYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) - (team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushYards.losses++;
                          team.filterAtsUnderdogStats.rushYards.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart2': {
          this.rushYardsPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if ((game.rushingYardsGiven >= this.rushYardsQuartile[0]) && (game.rushingYardsGiven <= this.rushYardsQuartile[1])) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) - (team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses))) > 0.67) {
                          team.filterStats.rushYards.winsArr.push(true);
                        }
                        if ((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) > 0.79) {
                          team.filterStats.rushYards.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses) > 0.67) {
                          team.filterStats.rushYards.winsArr3.push(true);
                        }
                        team.filterStats.rushYards.wins++;
                      } else {
                        if ((((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) - (team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses))) > 0.67) {
                          team.filterStats.rushYards.winsArr.push(false);
                        }
                        if ((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) > 0.79) {
                          team.filterStats.rushYards.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses) > 0.67) {
                          team.filterStats.rushYards.winsArr3.push(false);
                        }
                        team.filterStats.rushYards.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) - (team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushYards.wins++;
                          team.filterAtsFavoritesStats.rushYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) - (team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushYards.losses++;
                          team.filterAtsFavoritesStats.rushYards.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) - (team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushYards.wins++;
                          team.filterAtsUnderdogStats.rushYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) - (team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushYards.losses++;
                          team.filterAtsUnderdogStats.rushYards.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart3': {
          this.rushYardsPanelColor = 'blueviolet';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.rushingYardsGiven > this.rushYardsQuartile[1] && game.rushingYardsGiven <= this.rushYardsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) - (team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses))) > 0.67) {
                          team.filterStats.rushYards.winsArr.push(true);
                        }
                        if ((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) > 0.79) {
                          team.filterStats.rushYards.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses) > 0.67) {
                          team.filterStats.rushYards.winsArr3.push(true);
                        }
                        team.filterStats.rushYards.wins++;
                      } else {
                        if ((((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) - (team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses))) > 0.67) {
                          team.filterStats.rushYards.winsArr.push(false);
                        }
                        if ((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) > 0.79) {
                          team.filterStats.rushYards.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses) > 0.67) {
                          team.filterStats.rushYards.winsArr3.push(false);
                        }
                        team.filterStats.rushYards.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) - (team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushYards.wins++;
                          team.filterAtsFavoritesStats.rushYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) - (team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushYards.losses++;
                          team.filterAtsFavoritesStats.rushYards.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) - (team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushYards.wins++;
                          team.filterAtsUnderdogStats.rushYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) - (team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushYards.losses++;
                          team.filterAtsUnderdogStats.rushYards.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart4': {
          this.rushYardsPanelColor = 'green';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.rushingYardsGiven > this.rushYardsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) - (team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses))) > 0.67) {
                          team.filterStats.rushYards.winsArr.push(true);
                        }
                        if ((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) > 0.79) {
                          team.filterStats.rushYards.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses) > 0.67) {
                          team.filterStats.rushYards.winsArr3.push(true);
                        }
                        team.filterStats.rushYards.wins++;
                      } else {
                        if ((((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) - (team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses))) > 0.67) {
                          team.filterStats.rushYards.winsArr.push(false);
                        }
                        if ((team.filterStats.rushYards.wins) / (team.filterStats.rushYards.wins + team.filterStats.rushYards.losses) > 0.79) {
                          team.filterStats.rushYards.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushYards.wins) / (team2.filterStats.rushYards.wins + team2.filterStats.rushYards.losses) > 0.67) {
                          team.filterStats.rushYards.winsArr3.push(false);
                        }
                        team.filterStats.rushYards.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) - (team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushYards.wins++;
                          team.filterAtsFavoritesStats.rushYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) - (team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushYards.wins) / (team.filterAtsFavoritesStats.rushYards.wins + team.filterAtsFavoritesStats.rushYards.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushYards.wins) / (team2.filterAtsFavoritesStats.rushYards.wins + team2.filterAtsFavoritesStats.rushYards.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushYards.losses++;
                          team.filterAtsFavoritesStats.rushYards.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) - (team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushYards.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushYards.wins++;
                          team.filterAtsUnderdogStats.rushYards.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) - (team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses))) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) - (team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushYards.wins) / (team.filterAtsStats.rushYards.wins + team.filterAtsStats.rushYards.losses) > 0.79) {
                            team.filterAtsStats.rushYards.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushYards.wins) / (team.filterAtsUnderdogStats.rushYards.wins + team.filterAtsUnderdogStats.rushYards.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushYards.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushYards.wins) / (team2.filterAtsStats.rushYards.wins + team2.filterAtsStats.rushYards.losses) > 0.67) {
                            team.filterAtsStats.rushYards.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushYards.wins) / (team2.filterAtsUnderdogStats.rushYards.wins + team2.filterAtsUnderdogStats.rushYards.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushYards.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushYards.losses++;
                          team.filterAtsUnderdogStats.rushYards.losses++;
                          team.filterAtsUnderdogStats.rushYards.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
      }
    }
  }

  rushTdsChange(event: any, teamName: string) {
    if (this.toggleInterUnionMsg !== 'Intersection Logic') {
      this.httpService.allTeams.forEach(team => {
        if (team.teamName === teamName) {
          team.filterStats.rushTds.wins = 0;
          team.filterStats.rushTds.losses = 0;
          team.filterAtsStats.rushTds.wins = 0;
          team.filterAtsStats.rushTds.losses = 0;
          team.filterAtsFavoritesStats.rushTds.wins = 0;
          team.filterAtsFavoritesStats.rushTds.losses = 0;
          team.filterAtsUnderdogStats.rushTds.wins = 0;
          team.filterAtsUnderdogStats.rushTds.losses = 0;
        }
      });
      switch (event.value) {
        case 'quart1': {
          this.rushTdsPanelColor = 'crimson';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.rushingTdsGiven < this.rushTdsQuartile[0]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) - (team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses))) > 0.67) {
                          team.filterStats.rushTds.winsArr.push(true);
                        }
                        if ((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) > 0.79) {
                          team.filterStats.rushTds.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses) > 0.67) {
                          team.filterStats.rushTds.winsArr3.push(true);
                        }
                        team.filterStats.rushTds.wins++;
                      } else {
                        if ((((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) - (team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses))) > 0.67) {
                          team.filterStats.rushTds.winsArr.push(false);
                        }
                        if ((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) > 0.79) {
                          team.filterStats.rushTds.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses) > 0.67) {
                          team.filterStats.rushTds.winsArr3.push(false);
                        }
                        team.filterStats.rushTds.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) - (team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushTds.wins++;
                          team.filterAtsFavoritesStats.rushTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) - (team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushTds.losses++;
                          team.filterAtsFavoritesStats.rushTds.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) - (team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushTds.wins++;
                          team.filterAtsUnderdogStats.rushTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) - (team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushTds.losses++;
                          team.filterAtsUnderdogStats.rushTds.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart2': {
          this.rushTdsPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if ((game.rushingTdsGiven >= this.rushTdsQuartile[0]) && (game.rushingTdsGiven <= this.rushTdsQuartile[1])) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) - (team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses))) > 0.67) {
                          team.filterStats.rushTds.winsArr.push(true);
                        }
                        if ((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) > 0.79) {
                          team.filterStats.rushTds.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses) > 0.67) {
                          team.filterStats.rushTds.winsArr3.push(true);
                        }
                        team.filterStats.rushTds.wins++;
                      } else {
                        if ((((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) - (team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses))) > 0.67) {
                          team.filterStats.rushTds.winsArr.push(false);
                        }
                        if ((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) > 0.79) {
                          team.filterStats.rushTds.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses) > 0.67) {
                          team.filterStats.rushTds.winsArr3.push(false);
                        }
                        team.filterStats.rushTds.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) - (team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushTds.wins++;
                          team.filterAtsFavoritesStats.rushTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) - (team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushTds.losses++;
                          team.filterAtsFavoritesStats.rushTds.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) - (team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushTds.wins++;
                          team.filterAtsUnderdogStats.rushTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) - (team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushTds.losses++;
                          team.filterAtsUnderdogStats.rushTds.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart3': {
          this.rushTdsPanelColor = 'blueviolet';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.rushingTdsGiven > this.rushTdsQuartile[1] && game.rushingTdsGiven <= this.rushTdsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) - (team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses))) > 0.67) {
                          team.filterStats.rushTds.winsArr.push(true);
                        }
                        if ((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) > 0.79) {
                          team.filterStats.rushTds.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses) > 0.67) {
                          team.filterStats.rushTds.winsArr3.push(true);
                        }
                        team.filterStats.rushTds.wins++;
                      } else {
                        if ((((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) - (team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses))) > 0.67) {
                          team.filterStats.rushTds.winsArr.push(false);
                        }
                        if ((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) > 0.79) {
                          team.filterStats.rushTds.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses) > 0.67) {
                          team.filterStats.rushTds.winsArr3.push(false);
                        }
                        team.filterStats.rushTds.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) - (team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushTds.wins++;
                          team.filterAtsFavoritesStats.rushTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) - (team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushTds.losses++;
                          team.filterAtsFavoritesStats.rushTds.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) - (team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushTds.wins++;
                          team.filterAtsUnderdogStats.rushTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) - (team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushTds.losses++;
                          team.filterAtsUnderdogStats.rushTds.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart4': {
          this.rushTdsPanelColor = 'green';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.rushingTdsGiven > this.rushTdsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) - (team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses))) > 0.67) {
                          team.filterStats.rushTds.winsArr.push(true);
                        }
                        if ((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) > 0.79) {
                          team.filterStats.rushTds.winsArr2.push(true);
                        }
                        if ((team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses) > 0.67) {
                          team.filterStats.rushTds.winsArr3.push(true);
                        }
                        team.filterStats.rushTds.wins++;
                      } else {
                        if ((((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) - (team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses))) > 0.67) {
                          team.filterStats.rushTds.winsArr.push(false);
                        }
                        if ((team.filterStats.rushTds.wins) / (team.filterStats.rushTds.wins + team.filterStats.rushTds.losses) > 0.79) {
                          team.filterStats.rushTds.winsArr2.push(false);
                        }
                        if ((team2.filterStats.rushTds.wins) / (team2.filterStats.rushTds.wins + team2.filterStats.rushTds.losses) > 0.67) {
                          team.filterStats.rushTds.winsArr3.push(false);
                        }
                        team.filterStats.rushTds.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) - (team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushTds.wins++;
                          team.filterAtsFavoritesStats.rushTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) - (team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.rushTds.wins) / (team.filterAtsFavoritesStats.rushTds.wins + team.filterAtsFavoritesStats.rushTds.losses) > 0.79) {
                            team.filterAtsFavoritesStats.rushTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.rushTds.wins) / (team2.filterAtsFavoritesStats.rushTds.wins + team2.filterAtsFavoritesStats.rushTds.losses) > 0.67) {
                            team.filterAtsFavoritesStats.rushTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushTds.losses++;
                          team.filterAtsFavoritesStats.rushTds.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) - (team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushTds.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr3.push(true);
                          }
                          team.filterAtsStats.rushTds.wins++;
                          team.filterAtsUnderdogStats.rushTds.wins++;
                        } else {
                          if ((((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) - (team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses))) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) - (team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.rushTds.wins) / (team.filterAtsStats.rushTds.wins + team.filterAtsStats.rushTds.losses) > 0.79) {
                            team.filterAtsStats.rushTds.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.rushTds.wins) / (team.filterAtsUnderdogStats.rushTds.wins + team.filterAtsUnderdogStats.rushTds.losses) > 0.79) {
                            team.filterAtsUnderdogStats.rushTds.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.rushTds.wins) / (team2.filterAtsStats.rushTds.wins + team2.filterAtsStats.rushTds.losses) > 0.67) {
                            team.filterAtsStats.rushTds.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.rushTds.wins) / (team2.filterAtsUnderdogStats.rushTds.wins + team2.filterAtsUnderdogStats.rushTds.losses) > 0.67) {
                            team.filterAtsUnderdogStats.rushTds.winsArr3.push(false);
                          }
                          team.filterAtsStats.rushTds.losses++;
                          team.filterAtsUnderdogStats.rushTds.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
      }
    }
  }
  sacksChange(event: any, teamName: string) {
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.sacks.wins = 0;
        team.filterStats.sacks.losses = 0;
        team.filterAtsStats.sacks.wins = 0;
        team.filterAtsStats.sacks.losses = 0;
        team.filterAtsFavoritesStats.sacks.wins = 0;
        team.filterAtsFavoritesStats.sacks.losses = 0;
        team.filterAtsUnderdogStats.sacks.wins = 0;
        team.filterAtsUnderdogStats.sacks.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.sacksGiven < this.sacksQuartile[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.sacks.wins++;
                } else {
                  team.filterStats.sacks.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.sacks.wins++;
                    team.filterAtsFavoritesStats.sacks.wins++;
                  } else {
                    team.filterAtsStats.sacks.losses++;
                    team.filterAtsFavoritesStats.sacks.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.sacks.wins++;
                    team.filterAtsUnderdogStats.sacks.wins++;
                  } else {
                    team.filterAtsStats.sacks.losses++;
                    team.filterAtsUnderdogStats.sacks.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.sacksGiven >= this.sacksQuartile[0]) && (game.sacksGiven <= this.sacksQuartile[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.sacks.wins++;
                } else {
                  team.filterStats.sacks.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.sacks.wins++;
                    team.filterAtsFavoritesStats.sacks.wins++;
                  } else {
                    team.filterAtsStats.sacks.losses++;
                    team.filterAtsFavoritesStats.sacks.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.sacks.wins++;
                    team.filterAtsUnderdogStats.sacks.wins++;
                  } else {
                    team.filterAtsStats.sacks.losses++;
                    team.filterAtsUnderdogStats.sacks.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.sacksGiven > this.sacksQuartile[1] && game.sacksGiven <= this.sacksQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.sacks.wins++;
                } else {
                  team.filterStats.sacks.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.sacks.wins++;
                    team.filterAtsFavoritesStats.sacks.wins++;
                  } else {
                    team.filterAtsStats.sacks.losses++;
                    team.filterAtsFavoritesStats.sacks.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.sacks.wins++;
                    team.filterAtsUnderdogStats.sacks.wins++;
                  } else {
                    team.filterAtsStats.sacks.losses++;
                    team.filterAtsUnderdogStats.sacks.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.sacksGiven > this.sacksQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.sacks.wins++;
                } else {
                  team.filterStats.sacks.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.sacks.wins++;
                    team.filterAtsFavoritesStats.sacks.wins++;
                  } else {
                    team.filterAtsStats.sacks.losses++;
                    team.filterAtsFavoritesStats.sacks.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.sacks.wins++;
                    team.filterAtsUnderdogStats.sacks.wins++;
                  } else {
                    team.filterAtsStats.sacks.losses++;
                    team.filterAtsUnderdogStats.sacks.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }
  interceptionsChange(event: any, teamName: string) {
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.interceptions.wins = 0;
        team.filterStats.interceptions.losses = 0;
        team.filterAtsStats.interceptions.wins = 0;
        team.filterAtsStats.interceptions.losses = 0;
        team.filterAtsFavoritesStats.interceptions.wins = 0;
        team.filterAtsFavoritesStats.interceptions.losses = 0;
        team.filterAtsUnderdogStats.interceptions.wins = 0;
        team.filterAtsUnderdogStats.interceptions.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.interceptionsGiven < this.interceptionsQuartile[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.interceptions.wins++;
                } else {
                  team.filterStats.interceptions.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.interceptions.wins++;
                    team.filterAtsFavoritesStats.interceptions.wins++;
                  } else {
                    team.filterAtsStats.interceptions.losses++;
                    team.filterAtsFavoritesStats.interceptions.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.interceptions.wins++;
                    team.filterAtsUnderdogStats.interceptions.wins++;
                  } else {
                    team.filterAtsStats.interceptions.losses++;
                    team.filterAtsUnderdogStats.interceptions.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.interceptionsGiven >= this.interceptionsQuartile[0]) && (game.interceptionsGiven <= this.interceptionsQuartile[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.interceptions.wins++;
                } else {
                  team.filterStats.interceptions.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.interceptions.wins++;
                    team.filterAtsFavoritesStats.interceptions.wins++;
                  } else {
                    team.filterAtsStats.interceptions.losses++;
                    team.filterAtsFavoritesStats.interceptions.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.interceptions.wins++;
                    team.filterAtsUnderdogStats.interceptions.wins++;
                  } else {
                    team.filterAtsStats.interceptions.losses++;
                    team.filterAtsUnderdogStats.interceptions.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.interceptionsGiven > this.interceptionsQuartile[1] && game.interceptionsGiven <= this.interceptionsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.interceptions.wins++;
                } else {
                  team.filterStats.interceptions.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.interceptions.wins++;
                    team.filterAtsFavoritesStats.interceptions.wins++;
                  } else {
                    team.filterAtsStats.interceptions.losses++;
                    team.filterAtsFavoritesStats.interceptions.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.interceptions.wins++;
                    team.filterAtsUnderdogStats.interceptions.wins++;
                  } else {
                    team.filterAtsStats.interceptions.losses++;
                    team.filterAtsUnderdogStats.interceptions.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.interceptionsGiven > this.interceptionsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.interceptions.wins++;
                } else {
                  team.filterStats.interceptions.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.interceptions.wins++;
                    team.filterAtsFavoritesStats.interceptions.wins++;
                  } else {
                    team.filterAtsStats.interceptions.losses++;
                    team.filterAtsFavoritesStats.interceptions.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.interceptions.wins++;
                    team.filterAtsUnderdogStats.interceptions.wins++;
                  } else {
                    team.filterAtsStats.interceptions.losses++;
                    team.filterAtsUnderdogStats.interceptions.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }
  firstDownsChangeNcaaf(event: any, teamName: string) {
    this.httpService.allTeamsNcaaf.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.firstDowns.wins = 0;
        team.filterStats.firstDowns.losses = 0;
        team.filterAtsStats.firstDowns.wins = 0;
        team.filterAtsStats.firstDowns.losses = 0;
        team.filterAtsFavoritesStats.firstDowns.wins = 0;
        team.filterAtsFavoritesStats.firstDowns.losses = 0;
        team.filterAtsUnderdogStats.firstDowns.wins = 0;
        team.filterAtsUnderdogStats.firstDowns.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.firstDownsPanelColor = 'crimson';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.firstDownsGiven < this.firstDownsQuartileNcaaf[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.firstDowns.wins++;
                } else {
                  team.filterStats.firstDowns.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.firstDowns.wins++;
                    team.filterAtsFavoritesStats.firstDowns.wins++;
                  } else {
                    team.filterAtsStats.firstDowns.losses++;
                    team.filterAtsFavoritesStats.firstDowns.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.firstDowns.wins++;
                    team.filterAtsUnderdogStats.firstDowns.wins++;
                  } else {
                    team.filterAtsStats.firstDowns.losses++;
                    team.filterAtsUnderdogStats.firstDowns.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.firstDownsPanelColor = 'orange';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.firstDownsGiven >= this.firstDownsQuartileNcaaf[0]) && (game.firstDownsGiven <= this.firstDownsQuartileNcaaf[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.firstDowns.wins++;
                } else {
                  team.filterStats.firstDowns.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.firstDowns.wins++;
                    team.filterAtsFavoritesStats.firstDowns.wins++;
                  } else {
                    team.filterAtsStats.firstDowns.losses++;
                    team.filterAtsFavoritesStats.firstDowns.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.firstDowns.wins++;
                    team.filterAtsUnderdogStats.firstDowns.wins++;
                  } else {
                    team.filterAtsStats.firstDowns.losses++;
                    team.filterAtsUnderdogStats.firstDowns.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.firstDownsPanelColor = 'blueviolet';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.firstDownsGiven > this.firstDownsQuartileNcaaf[1] && game.firstDownsGiven <= this.firstDownsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.firstDowns.wins++;
                } else {
                  team.filterStats.firstDowns.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.firstDowns.wins++;
                    team.filterAtsFavoritesStats.firstDowns.wins++;
                  } else {
                    team.filterAtsStats.firstDowns.losses++;
                    team.filterAtsFavoritesStats.firstDowns.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.firstDowns.wins++;
                    team.filterAtsUnderdogStats.firstDowns.wins++;
                  } else {
                    team.filterAtsStats.firstDowns.losses++;
                    team.filterAtsUnderdogStats.firstDowns.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.firstDownsPanelColor = 'green';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.firstDownsGiven > this.firstDownsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.firstDowns.wins++;
                } else {
                  team.filterStats.firstDowns.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.firstDowns.wins++;
                    team.filterAtsFavoritesStats.firstDowns.wins++;
                  } else {
                    team.filterAtsStats.firstDowns.losses++;
                    team.filterAtsFavoritesStats.firstDowns.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.firstDowns.wins++;
                    team.filterAtsUnderdogStats.firstDowns.wins++;
                  } else {
                    team.filterAtsStats.firstDowns.losses++;
                    team.filterAtsUnderdogStats.firstDowns.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }
  firstDownsChange(event: any, teamName: string) {
    if (this.toggleInterUnionMsg !== 'Intersection Logic') {
      this.httpService.allTeams.forEach(team => {
        if (team.teamName === teamName) {
          team.filterStats.firstDowns.wins = 0;
          team.filterStats.firstDowns.losses = 0;
          team.filterAtsStats.firstDowns.wins = 0;
          team.filterAtsStats.firstDowns.losses = 0;
          team.filterAtsFavoritesStats.firstDowns.wins = 0;
          team.filterAtsFavoritesStats.firstDowns.losses = 0;
          team.filterAtsUnderdogStats.firstDowns.wins = 0;
          team.filterAtsUnderdogStats.firstDowns.losses = 0;
        }
      });
      switch (event.value) {
        case 'quart1': {
          this.firstDownsPanelColor = 'crimson';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if (game.firstDownsGiven < this.firstDownsQuartile[0]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.firstDowns.wins++;
                  } else {
                    team.filterStats.firstDowns.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.firstDowns.wins++;
                      team.filterAtsFavoritesStats.firstDowns.wins++;
                    } else {
                      team.filterAtsStats.firstDowns.losses++;
                      team.filterAtsFavoritesStats.firstDowns.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.firstDowns.wins++;
                      team.filterAtsUnderdogStats.firstDowns.wins++;
                    } else {
                      team.filterAtsStats.firstDowns.losses++;
                      team.filterAtsUnderdogStats.firstDowns.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
        case 'quart2': {
          this.firstDownsPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if ((game.firstDownsGiven >= this.firstDownsQuartile[0]) && (game.firstDownsGiven <= this.firstDownsQuartile[1])) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.firstDowns.wins++;
                  } else {
                    team.filterStats.firstDowns.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.firstDowns.wins++;
                      team.filterAtsFavoritesStats.firstDowns.wins++;
                    } else {
                      team.filterAtsStats.firstDowns.losses++;
                      team.filterAtsFavoritesStats.firstDowns.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.firstDowns.wins++;
                      team.filterAtsUnderdogStats.firstDowns.wins++;
                    } else {
                      team.filterAtsStats.firstDowns.losses++;
                      team.filterAtsUnderdogStats.firstDowns.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
        case 'quart3': {
          this.firstDownsPanelColor = 'blueviolet';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if (game.firstDownsGiven > this.firstDownsQuartile[1] && game.firstDownsGiven <= this.firstDownsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.firstDowns.wins++;
                  } else {
                    team.filterStats.firstDowns.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.firstDowns.wins++;
                      team.filterAtsFavoritesStats.firstDowns.wins++;
                    } else {
                      team.filterAtsStats.firstDowns.losses++;
                      team.filterAtsFavoritesStats.firstDowns.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.firstDowns.wins++;
                      team.filterAtsUnderdogStats.firstDowns.wins++;
                    } else {
                      team.filterAtsStats.firstDowns.losses++;
                      team.filterAtsUnderdogStats.firstDowns.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
        case 'quart4': {
          this.firstDownsPanelColor = 'green';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if (game.firstDownsGiven > this.firstDownsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.firstDowns.wins++;
                  } else {
                    team.filterStats.firstDowns.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.firstDowns.wins++;
                      team.filterAtsFavoritesStats.firstDowns.wins++;
                    } else {
                      team.filterAtsStats.firstDowns.losses++;
                      team.filterAtsFavoritesStats.firstDowns.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.firstDowns.wins++;
                      team.filterAtsUnderdogStats.firstDowns.wins++;
                    } else {
                      team.filterAtsStats.firstDowns.losses++;
                      team.filterAtsUnderdogStats.firstDowns.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
      }
    }
  }

  thirdDownChange(event: any, teamName: string) {
    if (this.toggleInterUnionMsg !== 'Intersection Logic') {
      this.httpService.allTeams.forEach(team => {
        if (team.teamName === teamName) {
          team.filterStats.thirdDown.wins = 0;
          team.filterStats.thirdDown.losses = 0;
          team.filterAtsStats.thirdDown.wins = 0;
          team.filterAtsStats.thirdDown.losses = 0;
          team.filterAtsFavoritesStats.thirdDown.wins = 0;
          team.filterAtsFavoritesStats.thirdDown.losses = 0;
          team.filterAtsUnderdogStats.thirdDown.wins = 0;
          team.filterAtsUnderdogStats.thirdDown.losses = 0;
        }
      });
      switch (event.value) {
        case 'quart1': {
          this.thirdDownPanelColor = 'crimson';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if (game.thirdDownConvPctGiven < this.thirdDownQuartile[0]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.thirdDown.wins++;
                  } else {
                    team.filterStats.thirdDown.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.thirdDown.wins++;
                      team.filterAtsFavoritesStats.thirdDown.wins++;
                    } else {
                      team.filterAtsStats.thirdDown.losses++;
                      team.filterAtsFavoritesStats.thirdDown.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.thirdDown.wins++;
                      team.filterAtsUnderdogStats.thirdDown.wins++;
                    } else {
                      team.filterAtsStats.thirdDown.losses++;
                      team.filterAtsUnderdogStats.thirdDown.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
        case 'quart2': {
          this.thirdDownPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if ((game.thirdDownConvPctGiven >= this.thirdDownQuartile[0]) && (game.thirdDownConvPctGiven <= this.thirdDownQuartile[1])) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.thirdDown.wins++;
                  } else {
                    team.filterStats.thirdDown.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.thirdDown.wins++;
                      team.filterAtsFavoritesStats.thirdDown.wins++;
                    } else {
                      team.filterAtsStats.thirdDown.losses++;
                      team.filterAtsFavoritesStats.thirdDown.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.thirdDown.wins++;
                      team.filterAtsUnderdogStats.thirdDown.wins++;
                    } else {
                      team.filterAtsStats.thirdDown.losses++;
                      team.filterAtsUnderdogStats.thirdDown.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
        case 'quart3': {
          this.thirdDownPanelColor = 'blueviolet';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if (game.thirdDownConvPctGiven > this.thirdDownQuartile[1] && game.thirdDownConvPctGiven <= this.thirdDownQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.thirdDown.wins++;
                  } else {
                    team.filterStats.thirdDown.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.thirdDown.wins++;
                      team.filterAtsFavoritesStats.thirdDown.wins++;
                    } else {
                      team.filterAtsStats.thirdDown.losses++;
                      team.filterAtsFavoritesStats.thirdDown.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.thirdDown.wins++;
                      team.filterAtsUnderdogStats.thirdDown.wins++;
                    } else {
                      team.filterAtsStats.thirdDown.losses++;
                      team.filterAtsUnderdogStats.thirdDown.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
        case 'quart4': {
          this.thirdDownPanelColor = 'green';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if (game.thirdDownConvPctGiven > this.thirdDownQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.thirdDown.wins++;
                  } else {
                    team.filterStats.thirdDown.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.thirdDown.wins++;
                      team.filterAtsFavoritesStats.thirdDown.wins++;
                    } else {
                      team.filterAtsStats.thirdDown.losses++;
                      team.filterAtsFavoritesStats.thirdDown.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.thirdDown.wins++;
                      team.filterAtsUnderdogStats.thirdDown.wins++;
                    } else {
                      team.filterAtsStats.thirdDown.losses++;
                      team.filterAtsUnderdogStats.thirdDown.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
      }
    }
  }

  redzoneChange(event: any, teamName: string) {
    if (this.toggleInterUnionMsg !== 'Intersection Logic') {
      this.httpService.allTeams.forEach(team => {
        if (team.teamName === teamName) {
          team.filterStats.redzone.wins = 0;
          team.filterStats.redzone.losses = 0;
          team.filterAtsStats.redzone.wins = 0;
          team.filterAtsStats.redzone.losses = 0;
          team.filterAtsFavoritesStats.redzone.wins = 0;
          team.filterAtsFavoritesStats.redzone.losses = 0;
          team.filterAtsUnderdogStats.redzone.wins = 0;
          team.filterAtsUnderdogStats.redzone.losses = 0;
        }
      });
      switch (event.value) {
        case 'quart1': {
          this.redzonePanelColor = 'crimson';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if (game.redzoneScoringPctGiven < this.redzoneQuartile[0]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.redzone.wins++;
                  } else {
                    team.filterStats.redzone.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.redzone.wins++;
                      team.filterAtsFavoritesStats.redzone.wins++;
                    } else {
                      team.filterAtsStats.redzone.losses++;
                      team.filterAtsFavoritesStats.redzone.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.redzone.wins++;
                      team.filterAtsUnderdogStats.redzone.wins++;
                    } else {
                      team.filterAtsStats.redzone.losses++;
                      team.filterAtsUnderdogStats.redzone.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
        case 'quart2': {
          this.redzonePanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if ((game.redzoneScoringPctGiven >= this.redzoneQuartile[0]) && (game.redzoneScoringPctGiven <= this.redzoneQuartile[1])) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.redzone.wins++;
                  } else {
                    team.filterStats.redzone.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.redzone.wins++;
                      team.filterAtsFavoritesStats.redzone.wins++;
                    } else {
                      team.filterAtsStats.redzone.losses++;
                      team.filterAtsFavoritesStats.redzone.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.redzone.wins++;
                      team.filterAtsUnderdogStats.redzone.wins++;
                    } else {
                      team.filterAtsStats.redzone.losses++;
                      team.filterAtsUnderdogStats.redzone.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
        case 'quart3': {
          this.redzonePanelColor = 'blueviolet';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if (game.redzoneScoringPctGiven > this.redzoneQuartile[1] && game.redzoneScoringPctGiven <= this.redzoneQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.redzone.wins++;
                  } else {
                    team.filterStats.redzone.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.redzone.wins++;
                      team.filterAtsFavoritesStats.redzone.wins++;
                    } else {
                      team.filterAtsStats.redzone.losses++;
                      team.filterAtsFavoritesStats.redzone.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.redzone.wins++;
                      team.filterAtsUnderdogStats.redzone.wins++;
                    } else {
                      team.filterAtsStats.redzone.losses++;
                      team.filterAtsUnderdogStats.redzone.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
        case 'quart4': {
          this.redzonePanelColor = 'green';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if (game.redzoneScoringPctGiven > this.redzoneQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.redzone.wins++;
                  } else {
                    team.filterStats.redzone.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.redzone.wins++;
                      team.filterAtsFavoritesStats.redzone.wins++;
                    } else {
                      team.filterAtsStats.redzone.losses++;
                      team.filterAtsFavoritesStats.redzone.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.redzone.wins++;
                      team.filterAtsUnderdogStats.redzone.wins++;
                    } else {
                      team.filterAtsStats.redzone.losses++;
                      team.filterAtsUnderdogStats.redzone.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
      }
    }
  }

  pointsChange(event: any, teamName: string) {
    if (this.toggleInterUnionMsg !== 'Intersection Logic') {
      this.httpService.allTeams.forEach(team => {
        if (team.teamName === teamName) {
          team.filterStats.points.wins = 0;
          team.filterStats.points.losses = 0;
          team.filterAtsStats.points.wins = 0;
          team.filterAtsStats.points.losses = 0;
          team.filterAtsFavoritesStats.points.wins = 0;
          team.filterAtsFavoritesStats.points.losses = 0;
          team.filterAtsUnderdogStats.points.wins = 0;
          team.filterAtsUnderdogStats.points.losses = 0;
        }
      });
      switch (event.value) {
        case 'quart1': {
          this.pointsPanelColor = 'crimson';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.pointsGiven < this.pointsQuartile[0]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) - (team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses))) > 0.67) {
                          team.filterStats.points.winsArr.push(true);
                        }
                        if ((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) > 0.79) {
                          team.filterStats.points.winsArr2.push(true);
                        }
                        if ((team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses) > 0.67) {
                          team.filterStats.points.winsArr3.push(true);
                        }
                        team.filterStats.points.wins++;
                      } else {
                        if ((((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) - (team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses))) > 0.67) {
                          team.filterStats.points.winsArr.push(false);
                        }
                        if ((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) > 0.79) {
                          team.filterStats.points.winsArr2.push(false);
                        }
                        if ((team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses) > 0.67) {
                          team.filterStats.points.winsArr3.push(false);
                        }
                        team.filterStats.points.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) - (team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) > 0.79) {
                            team.filterAtsFavoritesStats.points.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr3.push(true);
                          }
                          team.filterAtsStats.points.wins++;
                          team.filterAtsFavoritesStats.points.wins++;
                        } else {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) - (team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) > 0.79) {
                            team.filterAtsFavoritesStats.points.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr3.push(false);
                          }
                          team.filterAtsStats.points.losses++;
                          team.filterAtsFavoritesStats.points.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) - (team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) > 0.79) {
                            team.filterAtsUnderdogStats.points.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr3.push(true);
                          }
                          team.filterAtsStats.points.wins++;
                          team.filterAtsUnderdogStats.points.wins++;
                        } else {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) - (team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) > 0.79) {
                            team.filterAtsUnderdogStats.points.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr3.push(false);
                          }
                          team.filterAtsStats.points.losses++;
                          team.filterAtsUnderdogStats.points.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart2': {
          this.pointsPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if ((game.pointsGiven >= this.pointsQuartile[0]) && (game.pointsGiven <= this.pointsQuartile[1])) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) - (team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses))) > 0.67) {
                          team.filterStats.points.winsArr.push(true);
                        }
                        if ((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) > 0.79) {
                          team.filterStats.points.winsArr2.push(true);
                        }
                        if ((team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses) > 0.67) {
                          team.filterStats.points.winsArr3.push(true);
                        }
                        team.filterStats.points.wins++;
                      } else {
                        if ((((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) - (team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses))) > 0.67) {
                          team.filterStats.points.winsArr.push(false);
                        }
                        if ((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) > 0.79) {
                          team.filterStats.points.winsArr2.push(false);
                        }
                        if ((team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses) > 0.67) {
                          team.filterStats.points.winsArr3.push(false);
                        }
                        team.filterStats.points.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) - (team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) > 0.79) {
                            team.filterAtsFavoritesStats.points.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr3.push(true);
                          }
                          team.filterAtsStats.points.wins++;
                          team.filterAtsFavoritesStats.points.wins++;
                        } else {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) - (team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) > 0.79) {
                            team.filterAtsFavoritesStats.points.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr3.push(false);
                          }
                          team.filterAtsStats.points.losses++;
                          team.filterAtsFavoritesStats.points.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) - (team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) > 0.79) {
                            team.filterAtsUnderdogStats.points.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr3.push(true);
                          }
                          team.filterAtsStats.points.wins++;
                          team.filterAtsUnderdogStats.points.wins++;
                        } else {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) - (team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) > 0.79) {
                            team.filterAtsUnderdogStats.points.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr3.push(false);
                          }
                          team.filterAtsStats.points.losses++;
                          team.filterAtsUnderdogStats.points.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart3': {
          this.pointsPanelColor = 'blueviolet';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.pointsGiven > this.pointsQuartile[1] && game.pointsGiven <= this.pointsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) - (team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses))) > 0.67) {
                          team.filterStats.points.winsArr.push(true);
                        }
                        if ((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) > 0.79) {
                          team.filterStats.points.winsArr2.push(true);
                        }
                        if ((team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses) > 0.67) {
                          team.filterStats.points.winsArr3.push(true);
                        }
                        team.filterStats.points.wins++;
                      } else {
                        if ((((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) - (team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses))) > 0.67) {
                          team.filterStats.points.winsArr.push(false);
                        }
                        if ((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) > 0.79) {
                          team.filterStats.points.winsArr2.push(false);
                        }
                        if ((team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses) > 0.67) {
                          team.filterStats.points.winsArr3.push(false);
                        }
                        team.filterStats.points.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) - (team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) > 0.79) {
                            team.filterAtsFavoritesStats.points.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr3.push(true);
                          }
                          team.filterAtsStats.points.wins++;
                          team.filterAtsFavoritesStats.points.wins++;
                        } else {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) - (team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) > 0.79) {
                            team.filterAtsFavoritesStats.points.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr3.push(false);
                          }
                          team.filterAtsStats.points.losses++;
                          team.filterAtsFavoritesStats.points.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) - (team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) > 0.79) {
                            team.filterAtsUnderdogStats.points.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr3.push(true);
                          }
                          team.filterAtsStats.points.wins++;
                          team.filterAtsUnderdogStats.points.wins++;
                        } else {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) - (team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) > 0.79) {
                            team.filterAtsUnderdogStats.points.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr3.push(false);
                          }
                          team.filterAtsStats.points.losses++;
                          team.filterAtsUnderdogStats.points.losses++;
                          team.filterAtsUnderdogStats.points.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
        case 'quart4': {
          this.pointsPanelColor = 'green';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                this.httpService.allTeams.forEach(team2 => {
                  if (team2.teamId === game.opponentId) {
                    if (game.pointsGiven > this.pointsQuartile[2]) {
                      if (game.points > game.pointsGiven) {
                        if ((((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) - (team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses))) > 0.67) {
                          team.filterStats.points.winsArr.push(true);
                        }
                        if ((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) > 0.79) {
                          team.filterStats.points.winsArr2.push(true);
                        }
                        if ((team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses) > 0.67) {
                          team.filterStats.points.winsArr3.push(true);
                        }
                        team.filterStats.points.wins++;
                      } else {
                        if ((((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) - (team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses))) > 0.67) {
                          team.filterStats.points.winsArr.push(false);
                        }
                        if ((team.filterStats.points.wins) / (team.filterStats.points.wins + team.filterStats.points.losses) > 0.79) {
                          team.filterStats.points.winsArr2.push(false);
                        }
                        if ((team2.filterStats.points.wins) / (team2.filterStats.points.wins + team2.filterStats.points.losses) > 0.67) {
                          team.filterStats.points.winsArr3.push(false);
                        }
                        team.filterStats.points.losses++;
                      }
                      if (game.isFavorite) {
                        if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(true);
                          }
                          if ((((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) - (team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(true);
                          }
                          if ((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) > 0.79) {
                            team.filterAtsFavoritesStats.points.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(true);
                          }
                          if ((team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr3.push(true);
                          }
                          team.filterAtsStats.points.wins++;
                          team.filterAtsFavoritesStats.points.wins++;
                        } else {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(false);
                          }
                          if ((((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) - (team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses))) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(false);
                          }
                          if ((team.filterAtsFavoritesStats.points.wins) / (team.filterAtsFavoritesStats.points.wins + team.filterAtsFavoritesStats.points.losses) > 0.79) {
                            team.filterAtsFavoritesStats.points.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(false);
                          }
                          if ((team2.filterAtsFavoritesStats.points.wins) / (team2.filterAtsFavoritesStats.points.wins + team2.filterAtsFavoritesStats.points.losses) > 0.67) {
                            team.filterAtsFavoritesStats.points.winsArr3.push(false);
                          }
                          team.filterAtsStats.points.losses++;
                          team.filterAtsFavoritesStats.points.losses++;
                        }
                      } else {
                        if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(true);
                          }
                          if ((((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) - (team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr.push(true);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(true);
                          }
                          if ((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) > 0.79) {
                            team.filterAtsUnderdogStats.points.winsArr2.push(true);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(true);
                          }
                          if ((team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr3.push(true);
                          }
                          team.filterAtsStats.points.wins++;
                          team.filterAtsUnderdogStats.points.wins++;
                        } else {
                          if ((((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) - (team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses))) > 0.67) {
                            team.filterAtsStats.points.winsArr.push(false);
                          }
                          if ((((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) - (team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses))) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr.push(false);
                          }
                          if ((team.filterAtsStats.points.wins) / (team.filterAtsStats.points.wins + team.filterAtsStats.points.losses) > 0.79) {
                            team.filterAtsStats.points.winsArr2.push(false);
                          }
                          if ((team.filterAtsUnderdogStats.points.wins) / (team.filterAtsUnderdogStats.points.wins + team.filterAtsUnderdogStats.points.losses) > 0.79) {
                            team.filterAtsUnderdogStats.points.winsArr2.push(false);
                          }
                          if ((team2.filterAtsStats.points.wins) / (team2.filterAtsStats.points.wins + team2.filterAtsStats.points.losses) > 0.67) {
                            team.filterAtsStats.points.winsArr3.push(false);
                          }
                          if ((team2.filterAtsUnderdogStats.points.wins) / (team2.filterAtsUnderdogStats.points.wins + team2.filterAtsUnderdogStats.points.losses) > 0.67) {
                            team.filterAtsUnderdogStats.points.winsArr3.push(false);
                          }
                          team.filterAtsStats.points.losses++;
                          team.filterAtsUnderdogStats.points.losses++;
                        }
                      }
                    }
                  }
                })
              })
            }
          })
          break;
        }
      }
    }
  }

  blocksChange(event: any, teamName: string) {
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.blocks.wins = 0;
        team.filterStats.blocks.losses = 0;
        team.filterAtsStats.blocks.wins = 0;
        team.filterAtsStats.blocks.losses = 0;
        team.filterAtsFavoritesStats.blocks.wins = 0;
        team.filterAtsFavoritesStats.blocks.losses = 0;
        team.filterAtsUnderdogStats.blocks.wins = 0;
        team.filterAtsUnderdogStats.blocks.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.blocksGiven <= this.blocksQuartile[0]) {
                if (game.points >= game.pointsGiven) {
                  team.filterStats.blocks.wins++;
                } else {
                  team.filterStats.blocks.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.blocks.wins++;
                    team.filterAtsFavoritesStats.blocks.wins++;
                  } else {
                    team.filterAtsStats.blocks.losses++;
                    team.filterAtsFavoritesStats.blocks.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.blocks.wins++;
                    team.filterAtsUnderdogStats.blocks.wins++;
                  } else {
                    team.filterAtsStats.blocks.losses++;
                    team.filterAtsUnderdogStats.blocks.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.blocksGiven > this.blocksQuartile[0]) && (game.blocksGiven <= this.blocksQuartile[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.blocks.wins++;
                } else {
                  team.filterStats.blocks.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.blocks.wins++;
                    team.filterAtsFavoritesStats.blocks.wins++;
                  } else {
                    team.filterAtsStats.blocks.losses++;
                    team.filterAtsFavoritesStats.blocks.losses++;
                  }
                } else {
                  if ((game.points - game.blocksGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.blocks.wins++;
                    team.filterAtsUnderdogStats.blocks.wins++;
                  } else {
                    team.filterAtsStats.blocks.losses++;
                    team.filterAtsUnderdogStats.blocks.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.blocksGiven > this.blocksQuartile[1] && game.blocksGiven <= this.blocksQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.blocks.wins++;
                } else {
                  team.filterStats.blocks.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.blocks.wins++;
                    team.filterAtsFavoritesStats.blocks.wins++;
                  } else {
                    team.filterAtsStats.blocks.losses++;
                    team.filterAtsFavoritesStats.blocks.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.blocks.wins++;
                    team.filterAtsUnderdogStats.blocks.wins++;
                  } else {
                    team.filterAtsStats.blocks.losses++;
                    team.filterAtsUnderdogStats.blocks.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.blocksGiven > this.blocksQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.blocks.wins++;
                } else {
                  team.filterStats.blocks.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.blocks.wins++;
                    team.filterAtsFavoritesStats.blocks.wins++;
                  } else {
                    team.filterAtsStats.blocks.losses++;
                    team.filterAtsFavoritesStats.blocks.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.blocks.wins++;
                    team.filterAtsUnderdogStats.blocks.wins++;
                  } else {
                    team.filterAtsStats.blocks.losses++;
                    team.filterAtsUnderdogStats.blocks.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }
  defensiveReboundsChange(event: any, teamName: string) {
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.defensiveRebounds.wins = 0;
        team.filterStats.defensiveRebounds.losses = 0;
        team.filterAtsStats.defensiveRebounds.wins = 0;
        team.filterAtsStats.defensiveRebounds.losses = 0;
        team.filterAtsFavoritesStats.defensiveRebounds.wins = 0;
        team.filterAtsFavoritesStats.defensiveRebounds.losses = 0;
        team.filterAtsUnderdogStats.defensiveRebounds.wins = 0;
        team.filterAtsUnderdogStats.defensiveRebounds.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.defensiveReboundsGiven <= this.defensiveReboundsQuartile[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.defensiveRebounds.wins++;
                } else {
                  team.filterStats.defensiveRebounds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.defensiveRebounds.wins++;
                    team.filterAtsFavoritesStats.defensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.defensiveRebounds.losses++;
                    team.filterAtsFavoritesStats.defensiveRebounds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.defensiveRebounds.wins++;
                    team.filterAtsUnderdogStats.defensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.defensiveRebounds.losses++;
                    team.filterAtsUnderdogStats.defensiveRebounds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.defensiveReboundsGiven > this.defensiveReboundsQuartile[0]) && (game.defensiveReboundsGiven <= this.defensiveReboundsQuartile[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.defensiveRebounds.wins++;
                } else {
                  team.filterStats.defensiveRebounds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.defensiveRebounds.wins++;
                    team.filterAtsFavoritesStats.defensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.defensiveRebounds.losses++;
                    team.filterAtsFavoritesStats.defensiveRebounds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.defensiveRebounds.wins++;
                    team.filterAtsUnderdogStats.defensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.defensiveRebounds.losses++;
                    team.filterAtsUnderdogStats.defensiveRebounds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.defensiveReboundsGiven > this.defensiveReboundsQuartile[1] && game.defensiveReboundsGiven <= this.defensiveReboundsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.defensiveRebounds.wins++;
                } else {
                  team.filterStats.defensiveRebounds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.defensiveRebounds.wins++;
                    team.filterAtsFavoritesStats.defensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.defensiveRebounds.losses++;
                    team.filterAtsFavoritesStats.defensiveRebounds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.defensiveRebounds.wins++;
                    team.filterAtsUnderdogStats.defensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.defensiveRebounds.losses++;
                    team.filterAtsUnderdogStats.defensiveRebounds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.defensiveReboundsGiven > this.defensiveReboundsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.defensiveRebounds.wins++;
                } else {
                  team.filterStats.defensiveRebounds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.defensiveRebounds.wins++;
                    team.filterAtsFavoritesStats.defensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.defensiveRebounds.losses++;
                    team.filterAtsFavoritesStats.defensiveRebounds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.defensiveRebounds.wins++;
                    team.filterAtsUnderdogStats.defensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.defensiveRebounds.losses++;
                    team.filterAtsUnderdogStats.defensiveRebounds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }
  stealsChange(event: any, teamName: string) {
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.steals.wins = 0;
        team.filterStats.steals.losses = 0;
        team.filterAtsStats.steals.wins = 0;
        team.filterAtsStats.steals.losses = 0;
        team.filterAtsFavoritesStats.steals.wins = 0;
        team.filterAtsFavoritesStats.steals.losses = 0;
        team.filterAtsUnderdogStats.steals.wins = 0;
        team.filterAtsUnderdogStats.steals.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.stealsGiven <= this.stealsQuartile[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.steals.wins++;
                } else {
                  team.filterStats.steals.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.steals.wins++;
                    team.filterAtsFavoritesStats.steals.wins++;
                  } else {
                    team.filterAtsStats.steals.losses++;
                    team.filterAtsFavoritesStats.steals.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.steals.wins++;
                    team.filterAtsUnderdogStats.steals.wins++;
                  } else {
                    team.filterAtsStats.steals.losses++;
                    team.filterAtsUnderdogStats.steals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.stealsGiven > this.stealsQuartile[0]) && (game.stealsGiven <= this.stealsQuartile[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.steals.wins++;
                } else {
                  team.filterStats.steals.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.steals.wins++;
                    team.filterAtsFavoritesStats.steals.wins++;
                  } else {
                    team.filterAtsStats.steals.losses++;
                    team.filterAtsFavoritesStats.steals.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.steals.wins++;
                    team.filterAtsUnderdogStats.steals.wins++;
                  } else {
                    team.filterAtsStats.steals.losses++;
                    team.filterAtsUnderdogStats.steals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.stealsGiven > this.stealsQuartile[1] && game.stealsGiven <= this.stealsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.steals.wins++;
                } else {
                  team.filterStats.steals.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.steals.wins++;
                    team.filterAtsFavoritesStats.steals.wins++;
                  } else {
                    team.filterAtsStats.steals.losses++;
                    team.filterAtsFavoritesStats.steals.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.steals.wins++;
                    team.filterAtsUnderdogStats.steals.wins++;
                  } else {
                    team.filterAtsStats.steals.losses++;
                    team.filterAtsUnderdogStats.steals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.stealsGiven > this.stealsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.steals.wins++;
                } else {
                  team.filterStats.steals.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.steals.wins++;
                    team.filterAtsFavoritesStats.steals.wins++;
                  } else {
                    team.filterAtsStats.steals.losses++;
                    team.filterAtsFavoritesStats.steals.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.steals.wins++;
                    team.filterAtsUnderdogStats.steals.wins++;
                  } else {
                    team.filterAtsStats.steals.losses++;
                    team.filterAtsUnderdogStats.steals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }
  assistsChange(event: any, teamName: string) {
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.assists.wins = 0;
        team.filterStats.assists.losses = 0;
        team.filterAtsStats.assists.wins = 0;
        team.filterAtsStats.assists.losses = 0;
        team.filterAtsFavoritesStats.assists.wins = 0;
        team.filterAtsFavoritesStats.assists.losses = 0;
        team.filterAtsUnderdogStats.assists.wins = 0;
        team.filterAtsUnderdogStats.assists.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.assistsGiven <= this.assistsQuartile[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.assists.wins++;
                } else {
                  team.filterStats.assists.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsFavoritesStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsFavoritesStats.assists.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsUnderdogStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsUnderdogStats.assists.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.assistsGiven > this.assistsQuartile[0]) && (game.assistsGiven <= this.assistsQuartile[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.assists.wins++;
                } else {
                  team.filterStats.assists.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsFavoritesStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsFavoritesStats.assists.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsUnderdogStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsUnderdogStats.assists.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.assistsGiven > this.assistsQuartile[1] && game.assistsGiven <= this.assistsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.assists.wins++;
                } else {
                  team.filterStats.assists.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsFavoritesStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsFavoritesStats.assists.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsUnderdogStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsUnderdogStats.assists.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.assistsGiven > this.assistsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.assists.wins++;
                } else {
                  team.filterStats.assists.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsFavoritesStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsFavoritesStats.assists.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.assists.wins++;
                    team.filterAtsUnderdogStats.assists.wins++;
                  } else {
                    team.filterAtsStats.assists.losses++;
                    team.filterAtsUnderdogStats.assists.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }
  fieldGoalsChange(event: any, teamName: string) {
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.fieldGoals.wins = 0;
        team.filterStats.fieldGoals.losses = 0;
        team.filterAtsStats.fieldGoals.wins = 0;
        team.filterAtsStats.fieldGoals.losses = 0;
        team.filterAtsFavoritesStats.fieldGoals.wins = 0;
        team.filterAtsFavoritesStats.fieldGoals.losses = 0;
        team.filterAtsUnderdogStats.fieldGoals.wins = 0;
        team.filterAtsUnderdogStats.fieldGoals.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.fieldGoalsGiven <= this.fieldGoalsQuartile[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.fieldGoals.wins++;
                } else {
                  team.filterStats.fieldGoals.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.fieldGoals.wins++;
                    team.filterAtsFavoritesStats.fieldGoals.wins++;
                  } else {
                    team.filterAtsStats.fieldGoals.losses++;
                    team.filterAtsFavoritesStats.fieldGoals.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.fieldGoals.wins++;
                    team.filterAtsUnderdogStats.fieldGoals.wins++;
                  } else {
                    team.filterAtsStats.fieldGoals.losses++;
                    team.filterAtsUnderdogStats.fieldGoals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.fieldGoalsGiven > this.fieldGoalsQuartile[0]) && (game.fieldGoalsGiven <= this.fieldGoalsQuartile[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.fieldGoals.wins++;
                } else {
                  team.filterStats.fieldGoals.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.fieldGoals.wins++;
                    team.filterAtsFavoritesStats.fieldGoals.wins++;
                  } else {
                    team.filterAtsStats.fieldGoals.losses++;
                    team.filterAtsFavoritesStats.fieldGoals.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.fieldGoals.wins++;
                    team.filterAtsUnderdogStats.fieldGoals.wins++;
                  } else {
                    team.filterAtsStats.fieldGoals.losses++;
                    team.filterAtsUnderdogStats.fieldGoals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.fieldGoalsGiven > this.fieldGoalsQuartile[1] && game.fieldGoalsGiven <= this.fieldGoalsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.fieldGoals.wins++;
                } else {
                  team.filterStats.fieldGoals.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.fieldGoals.wins++;
                    team.filterAtsFavoritesStats.fieldGoals.wins++;
                  } else {
                    team.filterAtsStats.fieldGoals.losses++;
                    team.filterAtsFavoritesStats.fieldGoals.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.fieldGoals.wins++;
                    team.filterAtsUnderdogStats.fieldGoals.wins++;
                  } else {
                    team.filterAtsStats.fieldGoals.losses++;
                    team.filterAtsUnderdogStats.fieldGoals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.fieldGoalsGiven > this.fieldGoalsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.fieldGoals.wins++;
                } else {
                  team.filterStats.fieldGoals.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.fieldGoals.wins++;
                    team.filterAtsFavoritesStats.fieldGoals.wins++;
                  } else {
                    team.filterAtsStats.fieldGoals.losses++;
                    team.filterAtsFavoritesStats.fieldGoals.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.fieldGoals.wins++;
                    team.filterAtsUnderdogStats.fieldGoals.wins++;
                  } else {
                    team.filterAtsStats.fieldGoals.losses++;
                    team.filterAtsUnderdogStats.fieldGoals.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }
  offensiveReboundsChange(event: any, teamName: string) {
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.offensiveRebounds.wins = 0;
        team.filterStats.offensiveRebounds.losses = 0;
        team.filterAtsStats.offensiveRebounds.wins = 0;
        team.filterAtsStats.offensiveRebounds.losses = 0;
        team.filterAtsFavoritesStats.offensiveRebounds.wins = 0;
        team.filterAtsFavoritesStats.offensiveRebounds.losses = 0;
        team.filterAtsUnderdogStats.offensiveRebounds.wins = 0;
        team.filterAtsUnderdogStats.offensiveRebounds.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.offensiveReboundsGiven <= this.offensiveReboundsQuartile[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.offensiveRebounds.wins++;
                } else {
                  team.filterStats.offensiveRebounds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.offensiveRebounds.wins++;
                    team.filterAtsFavoritesStats.offensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.offensiveRebounds.losses++;
                    team.filterAtsFavoritesStats.offensiveRebounds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.offensiveRebounds.wins++;
                    team.filterAtsUnderdogStats.offensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.offensiveRebounds.losses++;
                    team.filterAtsUnderdogStats.offensiveRebounds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.offensiveReboundsGiven > this.offensiveReboundsQuartile[0]) && (game.offensiveReboundsGiven <= this.offensiveReboundsQuartile[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.offensiveRebounds.wins++;
                } else {
                  team.filterStats.offensiveRebounds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.offensiveRebounds.wins++;
                    team.filterAtsFavoritesStats.offensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.offensiveRebounds.losses++;
                    team.filterAtsFavoritesStats.offensiveRebounds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.offensiveRebounds.wins++;
                    team.filterAtsUnderdogStats.offensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.offensiveRebounds.losses++;
                    team.filterAtsUnderdogStats.offensiveRebounds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.offensiveReboundsGiven > this.offensiveReboundsQuartile[1] && game.offensiveReboundsGiven <= this.offensiveReboundsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.offensiveRebounds.wins++;
                } else {
                  team.filterStats.offensiveRebounds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.offensiveRebounds.wins++;
                    team.filterAtsFavoritesStats.offensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.offensiveRebounds.losses++;
                    team.filterAtsFavoritesStats.offensiveRebounds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.offensiveRebounds.wins++;
                    team.filterAtsUnderdogStats.offensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.offensiveRebounds.losses++;
                    team.filterAtsUnderdogStats.offensiveRebounds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.offensiveReboundsGiven > this.offensiveReboundsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.offensiveRebounds.wins++;
                } else {
                  team.filterStats.offensiveRebounds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.offensiveRebounds.wins++;
                    team.filterAtsFavoritesStats.offensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.offensiveRebounds.losses++;
                    team.filterAtsFavoritesStats.offensiveRebounds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.offensiveRebounds.wins++;
                    team.filterAtsUnderdogStats.offensiveRebounds.wins++;
                  } else {
                    team.filterAtsStats.offensiveRebounds.losses++;
                    team.filterAtsUnderdogStats.offensiveRebounds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }
  turnoversChange(event: any, teamName: string) {
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.turnovers.wins = 0;
        team.filterStats.turnovers.losses = 0;
        team.filterAtsStats.turnovers.wins = 0;
        team.filterAtsStats.turnovers.losses = 0;
        team.filterAtsFavoritesStats.turnovers.wins = 0;
        team.filterAtsFavoritesStats.turnovers.losses = 0;
        team.filterAtsUnderdogStats.turnovers.wins = 0;
        team.filterAtsUnderdogStats.turnovers.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.turnoversGiven <= this.turnoversQuartile[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.turnovers.wins++;
                } else {
                  team.filterStats.turnovers.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.turnovers.wins++;
                    team.filterAtsFavoritesStats.turnovers.wins++;
                  } else {
                    team.filterAtsStats.turnovers.losses++;
                    team.filterAtsFavoritesStats.turnovers.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.turnovers.wins++;
                    team.filterAtsUnderdogStats.turnovers.wins++;
                  } else {
                    team.filterAtsStats.turnovers.losses++;
                    team.filterAtsUnderdogStats.turnovers.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.turnoversGiven > this.turnoversQuartile[0]) && (game.turnoversGiven <= this.turnoversQuartile[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.turnovers.wins++;
                } else {
                  team.filterStats.turnovers.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.turnovers.wins++;
                    team.filterAtsFavoritesStats.turnovers.wins++;
                  } else {
                    team.filterAtsStats.turnovers.losses++;
                    team.filterAtsFavoritesStats.turnovers.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.turnovers.wins++;
                    team.filterAtsUnderdogStats.turnovers.wins++;
                  } else {
                    team.filterAtsStats.turnovers.losses++;
                    team.filterAtsUnderdogStats.turnovers.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.turnoversGiven > this.turnoversQuartile[1] && game.turnoversGiven <= this.turnoversQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.turnovers.wins++;
                } else {
                  team.filterStats.turnovers.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.turnovers.wins++;
                    team.filterAtsFavoritesStats.turnovers.wins++;
                  } else {
                    team.filterAtsStats.turnovers.losses++;
                    team.filterAtsFavoritesStats.turnovers.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.turnovers.wins++;
                    team.filterAtsUnderdogStats.turnovers.wins++;
                  } else {
                    team.filterAtsStats.turnovers.losses++;
                    team.filterAtsUnderdogStats.turnovers.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.turnoversGiven > this.turnoversQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.turnovers.wins++;
                } else {
                  team.filterStats.turnovers.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.turnovers.wins++;
                    team.filterAtsFavoritesStats.turnovers.wins++;
                  } else {
                    team.filterAtsStats.turnovers.losses++;
                    team.filterAtsFavoritesStats.turnovers.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.turnovers.wins++;
                    team.filterAtsUnderdogStats.turnovers.wins++;
                  } else {
                    team.filterAtsStats.turnovers.losses++;
                    team.filterAtsUnderdogStats.turnovers.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }
  threePointsChange(event: any, teamName: string) {
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.threePoints.wins = 0;
        team.filterStats.threePoints.losses = 0;
        team.filterAtsStats.threePoints.wins = 0;
        team.filterAtsStats.threePoints.losses = 0;
        team.filterAtsFavoritesStats.threePoints.wins = 0;
        team.filterAtsFavoritesStats.threePoints.losses = 0;
        team.filterAtsUnderdogStats.threePoints.wins = 0;
        team.filterAtsUnderdogStats.threePoints.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.threePointsGiven <= this.threePointsQuartile[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.threePoints.wins++;
                } else {
                  team.filterStats.threePoints.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.threePoints.wins++;
                    team.filterAtsFavoritesStats.threePoints.wins++;
                  } else {
                    team.filterAtsStats.threePoints.losses++;
                    team.filterAtsFavoritesStats.threePoints.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.threePoints.wins++;
                    team.filterAtsUnderdogStats.threePoints.wins++;
                  } else {
                    team.filterAtsStats.threePoints.losses++;
                    team.filterAtsUnderdogStats.threePoints.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.threePointsGiven > this.threePointsQuartile[0]) && (game.threePointsGiven <= this.threePointsQuartile[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.threePoints.wins++;
                } else {
                  team.filterStats.threePoints.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.threePoints.wins++;
                    team.filterAtsFavoritesStats.threePoints.wins++;
                  } else {
                    team.filterAtsStats.threePoints.losses++;
                    team.filterAtsFavoritesStats.threePoints.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.threePoints.wins++;
                    team.filterAtsUnderdogStats.threePoints.wins++;
                  } else {
                    team.filterAtsStats.threePoints.losses++;
                    team.filterAtsUnderdogStats.threePoints.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.threePointsGiven > this.threePointsQuartile[1] && game.threePointsGiven <= this.threePointsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.threePoints.wins++;
                } else {
                  team.filterStats.threePoints.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.threePoints.wins++;
                    team.filterAtsFavoritesStats.threePoints.wins++;
                  } else {
                    team.filterAtsStats.threePoints.losses++;
                    team.filterAtsFavoritesStats.threePoints.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.threePoints.wins++;
                    team.filterAtsUnderdogStats.threePoints.wins++;
                  } else {
                    team.filterAtsStats.threePoints.losses++;
                    team.filterAtsUnderdogStats.threePoints.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.threePointsGiven > this.threePointsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.threePoints.wins++;
                } else {
                  team.filterStats.threePoints.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.threePoints.wins++;
                    team.filterAtsFavoritesStats.threePoints.wins++;
                  } else {
                    team.filterAtsStats.threePoints.losses++;
                    team.filterAtsFavoritesStats.threePoints.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.threePoints.wins++;
                    team.filterAtsUnderdogStats.threePoints.wins++;
                  } else {
                    team.filterAtsStats.threePoints.losses++;
                    team.filterAtsUnderdogStats.threePoints.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }
  nbaPointsChange(event: any, teamName: string) {
    this.httpService.nbaAllTeams.forEach(team => {
      if (team.teamName === teamName) {
        team.filterStats.points.wins = 0;
        team.filterStats.points.losses = 0;
        team.filterAtsStats.points.wins = 0;
        team.filterAtsStats.points.losses = 0;
        team.filterAtsFavoritesStats.points.wins = 0;
        team.filterAtsFavoritesStats.points.losses = 0;
        team.filterAtsUnderdogStats.points.wins = 0;
        team.filterAtsUnderdogStats.points.losses = 0;
      }
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.pointsGiven <= this.nbaPointsQuartile[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.points.wins++;
                } else {
                  team.filterStats.points.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.points.wins++;
                    team.filterAtsFavoritesStats.points.wins++;
                  } else {
                    team.filterAtsStats.points.losses++;
                    team.filterAtsFavoritesStats.points.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.points.wins++;
                    team.filterAtsUnderdogStats.points.wins++;
                  } else {
                    team.filterAtsStats.points.losses++;
                    team.filterAtsUnderdogStats.points.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.pointsGiven > this.nbaPointsQuartile[0]) && (game.pointsGiven <= this.nbaPointsQuartile[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.points.wins++;
                } else {
                  team.filterStats.points.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.points.wins++;
                    team.filterAtsFavoritesStats.points.wins++;
                  } else {
                    team.filterAtsStats.points.losses++;
                    team.filterAtsFavoritesStats.points.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.points.wins++;
                    team.filterAtsUnderdogStats.points.wins++;
                  } else {
                    team.filterAtsStats.points.losses++;
                    team.filterAtsUnderdogStats.points.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.pointsGiven > this.nbaPointsQuartile[1] && game.pointsGiven <= this.nbaPointsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.points.wins++;
                } else {
                  team.filterStats.points.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.points.wins++;
                    team.filterAtsFavoritesStats.points.wins++;
                  } else {
                    team.filterAtsStats.points.losses++;
                    team.filterAtsFavoritesStats.points.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.points.wins++;
                    team.filterAtsUnderdogStats.points.wins++;
                  } else {
                    team.filterAtsStats.points.losses++;
                    team.filterAtsUnderdogStats.points.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.httpService.nbaAllTeams.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.pointsGiven > this.nbaPointsQuartile[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.points.wins++;
                } else {
                  team.filterStats.points.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.points.wins++;
                    team.filterAtsFavoritesStats.points.wins++;
                  } else {
                    team.filterAtsStats.points.losses++;
                    team.filterAtsFavoritesStats.points.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.points.wins++;
                    team.filterAtsUnderdogStats.points.wins++;
                  } else {
                    team.filterAtsStats.points.losses++;
                    team.filterAtsUnderdogStats.points.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
    }
  }

  checkTabStatus2(): boolean {
    if (this.currentDownloadCounterPostMsg === ' - DOWNLOAD REQUIRED') {
      return true;
    } else {
      return false;
    }
  }

  toggleAvgTotalStatus(event: any) {
    if (event.checked) {
      this.totalAvgToggle = 'Average';
    } else {
      this.totalAvgToggle = 'Total';
    }
  }

  checkAvgTotalToggle() {
    if (this.totalAvgToggle === 'Total') {
      return true;
    } else {
      return false;
    }
  }

  returnSortStatusStr(num: number) {
    switch (num) {
      case 3: {
        return 'ATS Losses';
      }
      case 2: {
        return 'Wins';
      }
      case 1: {
        return 'Losses';
      }
      case 0: {
        return 'ATS Wins';
      }
    }
  }

  sortColumn3(event: any) {
    switch (event.active) {
      case 'sumValues': {
        if (this.currentSortState === 3) {
          this.currentSortState = 0;
        } else {
          this.currentSortState++;
        }
        if (this.currentSortState === 1) {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (this.calculateAverageWins(a) / (this.calculateAverageWins(a) + this.calculateAverageLosses(a)) < this.calculateAverageWins(b) / (this.calculateAverageWins(b) + this.calculateAverageLosses(b)) ? -1 : 1)));
        } else if (this.currentSortState === 2) {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (this.calculateAverageWins(a) / (this.calculateAverageWins(a) + this.calculateAverageLosses(a)) > this.calculateAverageWins(b) / (this.calculateAverageWins(b) + this.calculateAverageLosses(b)) ? -1 : 1)));
        } else if (this.currentSortState === 3) {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (this.calculateAverageAtsWins(a) / (this.calculateAverageAtsWins(a) + this.calculateAverageAtsLosses(a)) < this.calculateAverageAtsWins(b) / (this.calculateAverageAtsWins(b) + this.calculateAverageAtsLosses(b)) ? -1 : 1)));
        } else if (this.currentSortState === 0) {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (this.calculateAverageAtsWins(a) / (this.calculateAverageAtsWins(a) + this.calculateAverageAtsLosses(a)) > this.calculateAverageAtsWins(b) / (this.calculateAverageAtsWins(b) + this.calculateAverageAtsLosses(b)) ? -1 : 1)));
        }
        break;
      }
      case 'teamName': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.netSpread < b.netSpread ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.netSpread > b.netSpread ? -1 : 1)));
        }
        break;
      }
      case 'passAttempts': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.passAttempts.wins < b.filterAtsStats.passAttempts.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.passAttempts.wins > b.filterAtsStats.passAttempts.wins ? -1 : 1)));
        }
        break;
      }
      case 'passYards': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.passYards.wins < b.filterAtsStats.passYards.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.passYards.wins > b.filterAtsStats.passYards.wins ? -1 : 1)));
        }
        break;
      }
      case 'passTds': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.passTds.wins < b.filterAtsStats.passTds.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.passTds.wins > b.filterAtsStats.passTds.wins ? -1 : 1)));
        }
        break;
      }
      case 'rushAttempts': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.rushAttempts.wins < b.filterAtsStats.rushAttempts.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.rushAttempts.wins > b.filterAtsStats.rushAttempts.wins ? -1 : 1)));
        }
        break;
      }
      case 'rushYards': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.rushYards.wins < b.filterAtsStats.rushYards.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.rushYards.wins > b.filterAtsStats.rushYards.wins ? -1 : 1)));
        }
        break;
      }
      case 'rushTds': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.rushTds.wins < b.filterAtsStats.rushTds.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.rushTds.wins > b.filterAtsStats.rushTds.wins ? -1 : 1)));
        }
        break;
      }
      case 'firstDowns': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.firstDowns.wins < b.filterAtsStats.firstDowns.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.firstDowns.wins > b.filterAtsStats.firstDowns.wins ? -1 : 1)));
        }
        break;
      }

      case 'sacks': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.sacks.wins < b.filterAtsStats.sacks.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.sacks.wins > b.filterAtsStats.sacks.wins ? -1 : 1)));
        }
        break;
      }
      case 'interceptions': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.interceptions.wins < b.filterAtsStats.interceptions.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.interceptions.wins > b.filterAtsStats.interceptions.wins ? -1 : 1)));
        }
        break;
      }
      case 'thirdDown': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.thirdDown.wins < b.filterAtsStats.thirdDown.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.thirdDown.wins > b.filterAtsStats.thirdDown.wins ? -1 : 1)));
        }
        break;
      }
      case 'redzone': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.redzone.wins < b.filterAtsStats.redzone.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.redzone.wins > b.filterAtsStats.redzone.wins ? -1 : 1)));
        }
        break;
      }
      case 'points': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.points.wins < b.filterAtsStats.points.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterAtsStats.points.wins > b.filterAtsStats.points.wins ? -1 : 1)));
        }
        break;
      }
    }
  }

  sortColumn(event: any) {
    switch (event.active) {
      case 'teamName': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.wins < b.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.wins > b.wins ? -1 : 1)));
        }
        break;
      }
      case 'ats': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.atsWins < b.atsWins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.atsWins > b.atsWins ? -1 : 1)));
        }
        break;
      }
      case 'nextOpponent': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.nextOpponentWins < b.nextOpponentWins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.nextOpponentWins > b.nextOpponentWins ? -1 : 1)));
        }
        break;
      }
      case 'nextOpponentAts': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.nextOpponentAtsWins < b.nextOpponentAtsWins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.nextOpponentAtsWins > b.nextOpponentAtsWins ? -1 : 1)));
        }
        break;
      }
      case 'passingAttempts': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsTotal / a.games.length < b.passingAttemptsTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsTotal / a.games.length > b.passingAttemptsTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsTotal < b.passingAttemptsTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsTotal > b.passingAttemptsTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'passingYards': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsTotal / a.games.length < b.passingYardsTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsTotal / a.games.length > b.passingYardsTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsTotal < b.passingYardsTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsTotal > b.passingYardsTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'passingTds': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsTotal / a.games.length < b.passingTdsTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsTotal / a.games.length > b.passingTdsTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsTotal < b.passingTdsTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsTotal > b.passingTdsTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'rushingAttempts': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsTotal / a.games.length < b.rushingAttemptsTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsTotal / a.games.length > b.rushingAttemptsTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsTotal < b.rushingAttemptsTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsTotal > b.rushingAttemptsTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'rushingYards': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsTotal / a.games.length < b.rushingYardsTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsTotal / a.games.length > b.rushingYardsTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsTotal < b.rushingYardsTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsTotal > b.rushingYardsTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'rushingTds': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsTotal / a.games.length < b.rushingTdsTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsTotal / a.games.length > b.rushingTdsTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsTotal < b.rushingTdsTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsTotal > b.rushingTdsTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'sacks': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksTotal / a.games.length < b.sacksTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksTotal / a.games.length > b.sacksTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksTotal < b.sacksTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksTotal > b.sacksTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'interceptions': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsTotal / a.games.length < b.interceptionsTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsTotal / a.games.length > b.interceptionsTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsTotal < b.interceptionsTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsTotal > b.interceptionsTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'firstDowns': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsTotal / a.games.length < b.firstDownsTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsTotal / a.games.length > b.firstDownsTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsTotal < b.firstDownsTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsTotal > b.firstDownsTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'thirdDownPct': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.thirdDownPctAvg < b.thirdDownPctAvg ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.thirdDownPctAvg > b.thirdDownPctAvg ? -1 : 1)));
        }
        break;
      }
      case 'redzoneScoringPct': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.redzoneScoringPctAvg < b.redzoneScoringPctAvg ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.redzoneScoringPctAvg > b.redzoneScoringPctAvg ? -1 : 1)));
        }
        break;
      }
      case 'points': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsTotal / a.games.length < b.pointsTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsTotal / a.games.length > b.pointsTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsTotal < b.pointsTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsTotal > b.pointsTotal ? -1 : 1)));
          }
        }
        break;
      }
    };
  }

  sortOpponentColumn(event: any) {
    switch (event.active) {
      case 'teamName': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.wins < b.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.wins > b.wins ? -1 : 1)));
        }
        break;
      }
      case 'ats': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.atsWins < b.atsWins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.atsWins > b.atsWins ? -1 : 1)));
        }
        break;
      }
      case 'nextOpponent': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.nextOpponentWins < b.nextOpponentWins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.nextOpponentWins > b.nextOpponentWins ? -1 : 1)));
        }
        break;
      }
      case 'nextOpponentAts': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.nextOpponentAtsWins < b.nextOpponentAtsWins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.nextOpponentAtsWins > b.nextOpponentAtsWins ? -1 : 1)));
        }
        break;
      }
      case 'passingAttempts': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsGivenTotal / a.games.length < b.passingAttemptsGivenTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsGivenTotal / a.games.length > b.passingAttemptsGivenTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsGivenTotal < b.passingAttemptsGivenTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsGivenTotal > b.passingAttemptsGivenTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'passingYards': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsGivenTotal / a.games.length < b.passingYardsGivenTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsGivenTotal / a.games.length > b.passingYardsGivenTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsGivenTotal < b.passingYardsGivenTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsGivenTotal > b.passingYardsGivenTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'passingTds': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsGivenTotal / a.games.length < b.passingTdsGivenTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsGivenTotal / a.games.length > b.passingTdsGivenTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsGivenTotal < b.passingTdsGivenTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsGivenTotal > b.passingTdsGivenTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'rushingAttempts': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsGivenTotal / a.games.length < b.rushingAttemptsGivenTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsGivenTotal / a.games.length > b.rushingAttemptsGivenTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsGivenTotal < b.rushingAttemptsGivenTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsGivenTotal > b.rushingAttemptsGivenTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'rushingYards': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsGivenTotal / a.games.length < b.rushingYardsGivenTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsGivenTotal / a.games.length > b.rushingYardsGivenTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsGivenTotal < b.rushingYardsGivenTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsGivenTotal > b.rushingYardsGivenTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'rushingTds': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsGivenTotal / a.games.length < b.rushingTdsGivenTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsGivenTotal / a.games.length > b.rushingTdsGivenTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsGivenTotal < b.rushingTdsGivenTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsGivenTotal > b.rushingTdsGivenTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'sacks': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksGivenTotal / a.games.length < b.sacksGivenTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksGivenTotal / a.games.length > b.sacksGivenTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksGivenTotal < b.sacksGivenTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksGivenTotal > b.sacksGivenTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'interceptions': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsGivenTotal / a.games.length < b.interceptionsGivenTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsGivenTotal / a.games.length > b.interceptionsGivenTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsGivenTotal < b.interceptionsGivenTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsGivenTotal > b.interceptionsGivenTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'firstDowns': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsGivenTotal / a.games.length < b.firstDownsGivenTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsGivenTotal / a.games.length > b.firstDownsGivenTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsGivenTotal < b.firstDownsGivenTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsGivenTotal > b.firstDownsGivenTotal ? -1 : 1)));
          }
        }
        break;
      }
      case 'thirdDownPct': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.thirdDownConvPctGivenAvg < b.thirdDownConvPctGivenAvg ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.thirdDownConvPctGivenAvg > b.thirdDownConvPctGivenAvg ? -1 : 1)));
        }
        break;
      }
      case 'redzoneScoringPct': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.redzoneScoringPctGivenAvg < b.redzoneScoringPctGivenAvg ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.redzoneScoringPctGivenAvg > b.redzoneScoringPctGivenAvg ? -1 : 1)));
        }
        break;
      }
      case 'points': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsGivenTotal / a.games.length < b.pointsGivenTotal / b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsGivenTotal / a.games.length > b.pointsGivenTotal / b.games.length ? -1 : 1)));
          }
        } else {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsGivenTotal < b.pointsGivenTotal ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsGivenTotal > b.pointsGivenTotal ? -1 : 1)));
          }
        }
        break;
      }
    }
  }

  calculateQuartiles(data: number[]): number[] {
    // Sort the data in ascending order
    data.sort((a, b) => a - b);

    const n = data.length;

    // Calculate Q1 (first quartile)
    const q1Index = Math.floor((n + 1) / 4);
    const q1 = data[q1Index - 1] + (data[q1Index] - data[q1Index - 1]) * ((n + 1) / 4 - q1Index);

    // Calculate Q2 (second quartile, which is the median)
    const q2Index = Math.floor((n + 1) / 2);
    const q2 = data[q2Index - 1] + (data[q2Index] - data[q2Index - 1]) * ((n + 1) / 2 - q2Index);

    // Calculate Q3 (third quartile)
    const q3Index = Math.floor(3 * (n + 1) / 4);
    const q3 = data[q3Index - 1] + (data[q3Index] - data[q3Index - 1]) * (3 * (n + 1) / 4 - q3Index);

    return [q1, q2, q3];
  }

  sortColumn4(event: any) {
    switch (event.active) {
      case 'teamName': {
        if (event.direction === "asc") {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.netSpread < b.netSpread ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.netSpread > b.netSpread ? -1 : 1)));
        }
        break;
      }
      case 'blocks': {
        if (event.direction === "asc") {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.blocks.wins < b.filterStats.blocks.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.blocks.wins > b.filterStats.blocks.wins ? -1 : 1)));
        }
        break;
      }
      case 'defensiveRebounds': {
        if (event.direction === "asc") {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.defensiveRebounds.wins < b.filterStats.defensiveRebounds.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.defensiveRebounds.wins > b.filterStats.defensiveRebounds.wins ? -1 : 1)));
        }
        break;
      }
      case 'steals': {
        if (event.direction === "asc") {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.steals.wins < b.filterStats.steals.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.steals.wins > b.filterStats.steals.wins ? -1 : 1)));
        }
        break;
      }
      case 'assists': {
        if (event.direction === "asc") {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.assists.wins < b.filterStats.assists.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.assists.wins > b.filterStats.assists.wins ? -1 : 1)));
        }
        break;
      }
      case 'fieldGoals': {
        if (event.direction === "asc") {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.fieldGoals.wins < b.filterStats.fieldGoals.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.fieldGoals.wins > b.filterStats.fieldGoals.wins ? -1 : 1)));
        }
        break;
      }
      case 'offensiveRebounds': {
        if (event.direction === "asc") {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.offensiveRebounds.wins < b.filterStats.offensiveRebounds.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.offensiveRebounds.wins > b.filterStats.offensiveRebounds.wins ? -1 : 1)));
        }
        break;
      }
      case 'points': {
        if (event.direction === "asc") {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.points.wins < b.filterStats.points.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.points.wins > b.filterStats.points.wins ? -1 : 1)));
        }
        break;
      }
      case 'turnovers': {
        if (event.direction === "asc") {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.turnovers.wins < b.filterStats.turnovers.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.turnovers.wins > b.filterStats.turnovers.wins ? -1 : 1)));
        }
        break;
      }
      case 'threePoints': {
        if (event.direction === "asc") {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.threePoints.wins < b.filterStats.threePoints.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nbaDataSource = new MatTableDataSource(this.httpService.nbaAllTeams.sort((a, b) => (a.filterStats.threePoints.wins > b.filterStats.threePoints.wins ? -1 : 1)));
        }
        break;
      }
    }
  }

  sortColumn5(event: any) {
    switch (event.active) {
      case 'teamName': {
        if (event.direction === "asc") {
          this.nhlDataSource = new MatTableDataSource(this.httpService.nhlAllTeams.sort((a, b) => (a.netSpread < b.netSpread ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nhlDataSource = new MatTableDataSource(this.httpService.nhlAllTeams.sort((a, b) => (a.netSpread > b.netSpread ? -1 : 1)));
        }
        break;
      }
      case 'goals': {
        if (event.direction === "asc") {
          this.nhlDataSource = new MatTableDataSource(this.httpService.nhlAllTeams.sort((a, b) => (a.filterStats.goals.wins < b.filterStats.goals.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nhlDataSource = new MatTableDataSource(this.httpService.nhlAllTeams.sort((a, b) => (a.filterStats.goals.wins > b.filterStats.goals.wins ? -1 : 1)));
        }
        break;
      }
      case 'assists': {
        if (event.direction === "asc") {
          this.nhlDataSource = new MatTableDataSource(this.httpService.nhlAllTeams.sort((a, b) => (a.filterStats.assists.wins < b.filterStats.assists.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nhlDataSource = new MatTableDataSource(this.httpService.nhlAllTeams.sort((a, b) => (a.filterStats.assists.wins > b.filterStats.assists.wins ? -1 : 1)));
        }
        break;
      }
      case 'shooting': {
        if (event.direction === "asc") {
          this.nhlDataSource = new MatTableDataSource(this.httpService.nhlAllTeams.sort((a, b) => (a.filterStats.shootingPct.wins < b.filterStats.shootingPct.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.nhlDataSource = new MatTableDataSource(this.httpService.nhlAllTeams.sort((a, b) => (a.filterStats.shootingPct.wins > b.filterStats.shootingPct.wins ? -1 : 1)));
        }
        break;
      }
    }
  }
  crunchNumbers() {
    this.httpService.getNextOpponentInfo();
    this.httpService.crunchTotals();
    this.httpService.calculateWinLossRecord();
    this.httpService.setOpponentStats();
    this.httpService.setupGivenData();
    this.runQuartiles();
    setTimeout(() => this.isActiveTab = 1, 2500);
  }

  crunchNumbers2014() {
    this.httpService.getNextOpponentInfo('2014');
    this.httpService.crunchTotals();
    this.httpService.calculateWinLossRecord();
    this.httpService.setOpponentStats();
    this.httpService.setupGivenData();
    this.runQuartiles();
    setTimeout(() => this.isActiveTab = 1, 2500);
  }

  crunchNumbersNcaaf() {
    this.httpService.getNextOpponentInfoNcaaf();
    this.httpService.crunchTotalsNcaaf();
    this.httpService.calculateWinLossRecordNcaaf();
    this.httpService.setOpponentStatsNcaaf();
    this.httpService.setupGivenDataNcaaf();
    this.runQuartilesNcaaf();
  }
  crunchNbaNumbers() {
    this.httpService.getNbaNextOpponentInfo();
    this.httpService.crunchNbaTotals();
    this.httpService.calculateNbaWinLossRecord();
    this.httpService.setupNbaGivenData();
    this.runNbaQuartiles();
    this.isActiveTab = 3;
  }

  crunchNhlNumbers() {
    this.httpService.getNhlNextOpponentInfo();
    this.httpService.crunchNhlTotals();
    this.httpService.calculateNhlWinLossRecord();
    this.httpService.setNhlOpponentStats();
    this.httpService.setupNhlGivenData();
    this.runNhlQuartiles();
    this.isNhlSetupFinished = true;
    this.isActiveTab = 1;
  }

  downloadLastYear(lastYearWeek: number | any) {
    this.currentDownloadCounter++;
    this.currentDownloadCounterPostMsg = ' ...Currently Downloading...';
    this.dateService.setLastYearWeek(lastYearWeek);
    this.dateService.setLastYearWeekNext(lastYearWeek + 1);
    this.dateService.currentLastYearWeekNum = lastYearWeek;
    this.httpService.executeDataHydrationLastYear(lastYearWeek);
  }

  returnByeBgColor(row: Team) {
    if (row.currentWeekWinLoss === 'BYE') {
      return 'bye-bg';
    }
  }

  calculateStats() {
    this.httpService.allTeams = INITIALIZE_TEAMS(this.httpService.allTeams);
    this.downloadLastYear(18);
  }

  calculateStats2() {
    this.crunchNumbers2014();
  }

  automate() {
    let tmpVal = 0.3;
    for (
      this.localMlDiffVal = 0.3, this.localMlHighVal = 0.7, this.localMlOppLowVal = 0.3, this.localAtsDiffVal = 0.3, this.localAtsHighVal = 0.7, this.localAtsOppLowVal = 0.3, this.localFavDiffVal = 0.3, this.localFavHighVal = 0.7, this.localFavOppLowVal = 0.3, this.localUnderDiffVal = 0.3, this.localUnderHighVal = 0.7, this.localUnderOppLowVal = 0.3;
      this.localMlDiffVal < 0.9; this.localMlDiffVal = tmpVal
      ) {
        console.log(this.localMlDiffVal);
      this.processStats();
      tmpVal += 0.1;
      if (this.localMlHighVal < 1) {
        this.localMlHighVal += 0.05;
      }
      if (this.localMlOppLowVal > 0) {
        this.localMlOppLowVal -= 0.05;
      }
      if (this.localAtsDiffVal < 0.9) {
        this.localAtsDiffVal += 0.05;
      }
      if (this.localAtsHighVal < 1) {
        this.localAtsHighVal += 0.05;
      }
      if (this.localAtsOppLowVal > 0) {
        this.localAtsOppLowVal -= 0.05;
      }
      if (this.localFavDiffVal < 0.9) {
        this.localFavDiffVal += 0.05;
      }
      if (this.localFavHighVal < 1) {
        this.localFavHighVal += 0.05;
      }
      if (this.localFavOppLowVal > 0) {
        this.localFavOppLowVal -= 0.05;
      }
      if (this.localUnderDiffVal < 0.9) {
        this.localUnderDiffVal += 0.05;
      }
      if (this.localUnderHighVal < 1) {
        this.localUnderHighVal += 0.05;
      }
      if (this.localUnderOppLowVal > 0) {
        this.localMlDiffVal -= 0.05;
      }
    }
    this.localMlDiffVal = this.bestMlDiffVal;
    this.localMlHighVal = this.bestMlHighVal;
    this.localMlOppLowVal = this.bestMlOppLowVal;
    this.localAtsDiffVal = this.bestAtsDiffVal;
    this.localAtsHighVal = this.bestAtsHighVal;
    this.localAtsOppLowVal = this.bestAtsOppLowVal;
    this.localFavDiffVal = this.bestFavDiffVal;
    this.localFavHighVal = this.bestFavHighVal;
    this.localFavOppLowVal = this.bestFavOppLowVal;
    this.localUnderDiffVal = this.bestUnderDiffVal;
    this.localUnderHighVal = this.bestUnderHighVal;
    this.localUnderOppLowVal = this.bestUnderOppLowVal;
    this.processStats();
  }

  processStats() {
    this.aggregateStats = {
      mlDiffWins: 0,
      mlDiffLosses: 0,
      mlHighWins: 0,
      mlHighLosses: 0,
      mlOppLowWins: 0,
      mlOppLowLosses: 0,
      atsDiffWins: 0,
      atsDiffLosses: 0,
      atsHighWins: 0,
      atsHighLosses: 0,
      atsOppLowWins: 0,
      atsOppLowLosses: 0,
      favDiffWins: 0,
      favDiffLosses: 0,
      favHighWins: 0,
      favHighLosses: 0,
      favOppLowWins: 0,
      favOppLowLosses: 0,
      underDiffWins: 0,
      underDiffLosses: 0,
      underHighWins: 0,
      underHighLosses: 0,
      underOppLowWins: 0,
      underOppLowLosses: 0,
    };
    this.httpService.allTeams.forEach(team => {
      for (let statCounter = 0; statCounter < team.games.length; statCounter++) {
        this.httpService.allTeams.forEach(team2 => {
          if (team2.teamName === team.nextOpponent) {
            // ML
            if (((this.calculateTotalWinsPercDiff(team) / (this.calculateTotalWinsPercDiff(team) + this.calculateTotalLossesPercDiff(team))) - ((this.calculateTotalWinsPercDiff(team2)) / (this.calculateTotalWinsPercDiff(team2) + this.calculateTotalLossesPercDiff(team2)))) > this.localMlDiffVal) {
              if (team.games[statCounter].points - team.games[statCounter].pointsGiven > 0) {
                this.aggregateStats.mlDiffWins++;
              } else {
                this.aggregateStats.mlDiffLosses++;
              }
            }
            if (((this.calculateTotalWinsOver80(team) / (this.calculateTotalWinsOver80(team) + this.calculateTotalLossesOver80(team)))) > this.localMlHighVal) {
              if (team.games[statCounter].points - team.games[statCounter].pointsGiven > 0) {
                this.aggregateStats.mlHighWins++;
              } else {
                this.aggregateStats.mlHighLosses++;
              }
            }
            if ((this.calculateTotalWinsOppUnder20(team)) / (this.calculateTotalWinsOppUnder20(team) + this.calculateTotalLossesOppUnder20(team)) < this.localMlOppLowVal) {
              if (team.games[statCounter].points - team.games[statCounter].pointsGiven > 0) {
                this.aggregateStats.mlOppLowWins++;
              } else {
                this.aggregateStats.mlOppLowLosses++;
              }
            }

            // ATS
            if (((this.calculateTotalAtsPercDiff(team) / (this.calculateTotalAtsPercDiff(team) + this.calculateTotalAtsLossesPercDiff(team))) - ((this.calculateTotalAtsPercDiff(team2)) / (this.calculateTotalAtsPercDiff(team2) + this.calculateTotalAtsLossesPercDiff(team2)))) > this.localAtsDiffVal) {
              if (team.games[statCounter].isFavorite) {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven - Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.atsDiffWins++;
                } else {
                  this.aggregateStats.atsDiffLosses++;
                }
              } else {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven + Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.atsDiffWins++;
                } else {
                  this.aggregateStats.atsDiffLosses++;
                }
              }
            }
            if (((this.calculateTotalAtsOver80(team) / (this.calculateTotalAtsOver80(team) + this.calculateTotalAtsLossesOver80(team)))) > this.localAtsHighVal) {
              if (team.games[statCounter].isFavorite) {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven - Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.atsHighWins++;
                } else {
                  this.aggregateStats.atsHighLosses++;
                }
              } else {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven + Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.atsHighWins++;
                } else {
                  this.aggregateStats.atsHighLosses++;
                }
              }
            }
            if ((this.calculateTotalAtsOppUnder20(team)) / (this.calculateTotalAtsOppUnder20(team) + this.calculateTotalAtsLossesOppUnder20(team)) < this.localAtsOppLowVal) {
              if (team.games[statCounter].isFavorite) {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven - Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.atsOppLowWins++;
                } else {
                  this.aggregateStats.atsOppLowLosses++;
                }
              } else {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven + Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.atsOppLowWins++;
                } else {
                  this.aggregateStats.atsOppLowLosses++;
                }
              }
            }
            // Fav
            if (((this.calculateFavWinsPercDiff(team) / (this.calculateFavWinsPercDiff(team) + this.calculateFavLossesPercDiff(team))) - ((this.calculateFavWinsPercDiff(team2)) / (this.calculateFavWinsPercDiff(team2) + this.calculateFavLossesPercDiff(team2)))) > this.localFavDiffVal) {
              if (team.games[statCounter].isFavorite) {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven - Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.favDiffWins++;
                } else {
                  this.aggregateStats.favDiffLosses++;
                }
              } else {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven + Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.favDiffWins++;
                } else {
                  this.aggregateStats.favDiffLosses++;
                }
              }
            }
            if (((this.calculateFavAtsOver80(team) / (this.calculateFavAtsOver80(team) + this.calculateFavAtsLossesOver80(team)))) > this.localFavHighVal) {
              if (team.games[statCounter].isFavorite) {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven - Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.favHighWins++;
                } else {
                  this.aggregateStats.favHighLosses++;
                }
              } else {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven + Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.favHighWins++;
                } else {
                  this.aggregateStats.favHighLosses++;
                }
              }
            }
            if ((this.calculateFavAtsOppUnder20(team)) / (this.calculateFavAtsOppUnder20(team) + this.calculateFavAtsLossesOppUnder20(team)) < this.localFavOppLowVal) {
              if (team.games[statCounter].isFavorite) {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven - Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.favOppLowWins++;
                } else {
                  this.aggregateStats.favOppLowLosses++;
                }
              } else {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven + Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.favOppLowWins++;
                } else {
                  this.aggregateStats.favOppLowLosses++;
                }
              }
            }
            // Under
            if (((this.calculateUnderAtsPercDiff(team) / (this.calculateUnderAtsPercDiff(team) + this.calculateUnderAtsLossesPercDiff(team))) - ((this.calculateTotalAtsPercDiff(team2)) / (this.calculateTotalAtsPercDiff(team2) + this.calculateTotalAtsLossesPercDiff(team2)))) > this.localUnderDiffVal) {
              if (team.games[statCounter].isFavorite) {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven - Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.underDiffWins++;
                } else {
                  this.aggregateStats.underDiffLosses++;
                }
              } else {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven + Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.underDiffWins++;
                } else {
                  this.aggregateStats.underDiffLosses++;
                }
              }
            }
            if (((this.calculateUnderAtsOver80(team) / (this.calculateUnderAtsOver80(team) + this.calculateUnderAtsLossesOver80(team)))) > this.localUnderHighVal) {
              if (team.games[statCounter].isFavorite) {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven - Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.underHighWins++;
                } else {
                  this.aggregateStats.underHighLosses++;
                }
              } else {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven + Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.underHighWins++;
                } else {
                  this.aggregateStats.underHighLosses++;
                }
              }
            }
            if ((this.calculateUnderAtsOppUnder20(team)) / (this.calculateUnderAtsOppUnder20(team) + this.calculateUnderAtsLossesOppUnder20(team)) < this.localUnderOppLowVal) {
              if (team.games[statCounter].isFavorite) {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven - Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.underOppLowWins++;
                } else {
                  this.aggregateStats.underOppLowLosses++;
                }
              } else {
                if (team.games[statCounter].points - team.games[statCounter].pointsGiven + Math.abs(team.games[statCounter].spread) > 0) {
                  this.aggregateStats.underOppLowWins++;
                } else {
                  this.aggregateStats.underOppLowLosses++;
                }
              }
            }
          }
        })
      }
    })
    if ((this.aggregateStats.mlDiffWins / (this.aggregateStats.mlDiffWins + this.aggregateStats.mlDiffLosses)) > this.bestMlDiffVal) {
      this.bestMlDiffVal = this.localMlDiffVal;
    }
    if ((this.aggregateStats.mlHighWins / (this.aggregateStats.mlHighWins + this.aggregateStats.mlHighLosses)) > this.bestMlHighVal) {
      this.bestMlHighVal = this.localMlHighVal;
    }
    if ((this.aggregateStats.mlOppLowWins / (this.aggregateStats.mlOppLowWins + this.aggregateStats.mlOppLowLosses)) > this.bestMlOppLowVal) {
      this.bestMlOppLowVal = this.localMlOppLowVal;
    }
    if ((this.aggregateStats.atsDiffWins / (this.aggregateStats.atsDiffWins + this.aggregateStats.atsDiffLosses)) > this.bestAtsDiffVal) {
      this.bestAtsDiffVal = this.localAtsDiffVal;
    }
    if ((this.aggregateStats.atsHighWins / (this.aggregateStats.atsHighWins + this.aggregateStats.atsHighLosses)) > this.bestAtsHighVal) {
      this.bestAtsHighVal = this.localAtsHighVal;
    }
    if ((this.aggregateStats.atsOppLowWins / (this.aggregateStats.atsOppLowWins + this.aggregateStats.atsOppLowLosses)) > this.bestAtsOppLowVal) {
      this.bestAtsOppLowVal = this.localAtsOppLowVal;
    }
    if ((this.aggregateStats.favDiffWins / (this.aggregateStats.favDiffWins + this.aggregateStats.favDiffLosses)) > this.bestFavDiffVal) {
      this.bestFavDiffVal = this.localFavDiffVal;
    }
    if ((this.aggregateStats.favHighWins / (this.aggregateStats.favHighWins + this.aggregateStats.favHighLosses)) > this.bestFavHighVal) {
      this.bestFavHighVal = this.localFavHighVal;
    }
    if ((this.aggregateStats.favOppLowWins / (this.aggregateStats.favOppLowWins + this.aggregateStats.favOppLowLosses)) > this.bestFavOppLowVal) {
      this.bestFavOppLowVal = this.localFavOppLowVal;
    }
    if ((this.aggregateStats.underDiffWins / (this.aggregateStats.underDiffWins + this.aggregateStats.underDiffLosses)) > this.bestUnderDiffVal) {
      this.bestUnderDiffVal = this.localUnderDiffVal;
    }
    if ((this.aggregateStats.underHighWins / (this.aggregateStats.underHighWins + this.aggregateStats.underHighLosses)) > this.bestUnderHighVal) {
      this.bestUnderHighVal = this.localUnderHighVal;
    }
    if ((this.aggregateStats.underOppLowWins / (this.aggregateStats.underOppLowWins + this.aggregateStats.underOppLowLosses)) > this.bestUnderOppLowVal) {
      this.bestUnderOppLowVal = this.localUnderOppLowVal;
    }
  }

  returnWinLossColor(val: string) {
    if (val === 'Win') {
      return 'win-bg';
    } else if (val === 'Loss') {
      return 'loss-bg';
    } else {
      return 'bye-bg';
    }
  }

  returnGameSpread(row: Team) {
    let val = Math.abs(+row.nextGameSpread);
    if (row.isNextGameFavorite) {
      return (val * -1);
    } else {
      return val;
    }
  }

  downloadThisYearNCAAF() {
    this.currentDownloadCounter++;
    this.currentDownloadCounterPostMsg = ' ...Currently Downloading...';
    this.httpService.executeDataHydrationLastYearNcaaf();
  }

  downloadLastYear2() {
    this.currentDownloadCounter++;
    this.currentDownloadCounterPostMsg = ' ...Currently Downloading...';
    this.httpService.executeDataHydrationThisYear();
  }

  applyFilter(filterValue: string) {
    this.currentFilter = filterValue;
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  applyNbaFilter(filterValue: string) {
    this.currentNbaFilter = filterValue;
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.nbaDataSource.filter = filterValue;
  }

  applyNhlFilter(filterValue: string) {
    this.currentNhlFilter = filterValue;
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.nhlDataSource.filter = filterValue;
  }

  runNbaQuartiles() {
    let tmpTotalArr: number[] = [];
    this.httpService.nbaAllTeams.forEach(team => {
      tmpTotalArr.push(team.pointsTotal / team.games.length);
    })
    this.nbaPointsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.nbaAllTeams.forEach(team => {
      tmpTotalArr.push(team.blocksTotal / team.games.length);
    });
    this.blocksQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.nbaAllTeams.forEach(team => {
      tmpTotalArr.push(team.defensiveReboundsTotal / team.games.length);
    });
    this.defensiveReboundsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.nbaAllTeams.forEach(team => {
      tmpTotalArr.push(team.stealsTotal / team.games.length);
    });
    this.stealsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.nbaAllTeams.forEach(team => {
      tmpTotalArr.push(team.assistsTotal / team.games.length);
    });
    this.assistsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.nbaAllTeams.forEach(team => {
      tmpTotalArr.push(team.fieldGoalsTotal / team.games.length);
    });
    this.fieldGoalsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.nbaAllTeams.forEach(team => {
      tmpTotalArr.push(team.offensiveReboundsTotal / team.games.length);
    });
    this.offensiveReboundsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.nbaAllTeams.forEach(team => {
      tmpTotalArr.push(team.turnoversTotal / team.games.length);
    });
    this.turnoversQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.nbaAllTeams.forEach(team => {
      tmpTotalArr.push(team.threePointsTotal / team.games.length);
    });
    this.threePointsQuartile = this.calculateQuartiles(tmpTotalArr);
  }

  runQuartilesNcaaf() {
    let tmpTotalArr: number[] = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.pointsTotal / team.games.length);
    })
    this.pointsQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.passingAttemptsTotal / team.games.length);
    })
    this.passAttemptsQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.passingYardsTotal / team.games.length);
    })
    this.passYardsQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.passingTdsTotal / team.games.length);
    })
    this.passTdsQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.rushingAttemptsTotal / team.games.length);
    })
    this.rushAttemptsQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.rushingYardsTotal / team.games.length);
    })
    this.rushYardsQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.rushingTdsTotal / team.games.length);
    })
    this.rushTdsQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.interceptionsTotal / team.games.length);
    })
    this.interceptionsQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.sacksTotal / team.games.length);
    })
    this.sacksQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.firstDownsTotal / team.games.length);
    })
    this.firstDownsQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.thirdDownPctAvg);
    })
    this.thirdDownQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeamsNcaaf.forEach(team => {
      tmpTotalArr.push(team.redzoneScoringPctAvg);
    })
    this.redzoneQuartileNcaaf = this.calculateQuartiles(tmpTotalArr);
  }
  runQuartiles() {
    let tmpTotalArr: number[] = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.pointsTotal / team.games.length);
    })
    this.pointsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.passingAttemptsTotal / team.games.length);
    })
    this.passAttemptsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.passingYardsTotal / team.games.length);
    })
    this.passYardsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.passingTdsTotal / team.games.length);
    })
    this.passTdsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.rushingAttemptsTotal / team.games.length);
    })
    this.rushAttemptsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.rushingYardsTotal / team.games.length);
    })
    this.rushYardsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.rushingTdsTotal / team.games.length);
    })
    this.rushTdsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.interceptionsTotal / team.games.length);
    })
    this.interceptionsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.sacksTotal / team.games.length);
    })
    this.sacksQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.firstDownsTotal / team.games.length);
    })
    this.firstDownsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.thirdDownPctAvg);
    })
    this.thirdDownQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.redzoneScoringPctAvg);
    })
    this.redzoneQuartile = this.calculateQuartiles(tmpTotalArr);
  }

  runNhlQuartiles() {
    let tmpTotalArr: number[] = [];
    this.httpService.nhlAllTeams.forEach(team => {
      tmpTotalArr.push(team.goalsTotal / team.games.length);
    })
    this.goalsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.nhlAllTeams.forEach(team => {
      tmpTotalArr.push(team.assistsTotal / team.games.length);
    })
    this.nhlAssistsQuartile = this.calculateQuartiles(tmpTotalArr);
    tmpTotalArr = [];
    this.httpService.nhlAllTeams.forEach(team => {
      tmpTotalArr.push(team.shootingPctAvg);
    })
    this.shootingPctQuartile = this.calculateQuartiles(tmpTotalArr);
  }

  returnCellColor(inputVal: number, inputType: string) {
    let tmpTotalArr: number[] = [];
    let tmpQuartiles;
    switch (inputType) {
      case 'score': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.wins);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'ats': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.atsWins);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'nextOpponent': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.nextOpponentWins);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'nextOpponentAts': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.nextOpponentAtsWins);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingAttemptsTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.passingAttemptsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingAttemptsAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push((team.passingAttemptsTotal / team.games.length));
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingYardsTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.passingYardsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingYardsAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.passingAttemptsTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingTdsTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.passingTdsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingTdsAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.passingTdsTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingAttemptsTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingAttemptsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingAttemptsAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingAttemptsTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingYardsTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingYardsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingYardsAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingYardsTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingTdsTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingTdsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingTdsAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingTdsTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'sacksTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.sacksTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'sacksAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.sacksTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'interceptionsTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.interceptionsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'interceptionsAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.interceptionsTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'firstDownsTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.firstDownsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'firstDownsAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.firstDownsTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'thirdDownPct': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.thirdDownPctAvg);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'redzoneScoringPct': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.redzoneScoringPctAvg);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'pointsTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.pointsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'pointsAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.pointsTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
    }
    if (inputVal < tmpQuartiles[1]) {
      return 'crimson';
    } else if (inputVal > tmpQuartiles[1] && inputVal <= tmpQuartiles[2]) {
      return 'orange';
    } else {
      return 'green';
    }
  }
  returnCellColorGiven(inputVal: number, inputType: string) {
    let tmpTotalArr: number[] = [];
    let tmpQuartiles;
    switch (inputType) {
      case 'passingAttemptsGivenTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.passingAttemptsGivenTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingAttemptsGivenAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push((team.passingAttemptsGivenTotal / team.games.length));
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingYardsGivenTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.passingYardsGivenTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingYardsAvgGiven': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.passingYardsGivenTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingTdsGivenTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.passingTdsGivenTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingTdsGivenAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.passingTdsGivenTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingAttemptsGivenTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingAttemptsGivenTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingAttemptsGivenAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingAttemptsGivenTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingYardsGivenTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingYardsGivenTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingYardsGivenAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingYardsGivenTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingTdsGivenTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingTdsGivenTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingTdsGivenAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.rushingTdsGivenTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'sacksGivenTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.sacksGivenTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'sacksGivenAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.sacksGivenTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'interceptionsGivenTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.interceptionsGivenTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'interceptionsGivenAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.interceptionsGivenTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'firstDownsGivenTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.firstDownsGivenTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'firstDownsGivenAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.firstDownsGivenTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'thirdDownPctGiven': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.thirdDownConvPctGivenAvg);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'redzoneScoringPctGiven': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.redzoneScoringPctGivenAvg);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'pointsGivenTotal': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.pointsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'pointsGivenAvg': {
        this.httpService.allTeams.forEach(team => {
          tmpTotalArr.push(team.pointsTotal / team.games.length);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
    }
    if (inputVal < tmpQuartiles[1]) {
      return 'green';
    } else if (inputVal > tmpQuartiles[1] && inputVal <= tmpQuartiles[2]) {
      return 'orange';
    } else {
      return 'crimson';
    }
  }

  processSumColor(value1: number, value2: number) {
    if ((value1 / (value1 + value2)) >= 0.75) {
      return 'bg-green';
    } else if ((value1 / (value1 + value2)) >= 0.5) {
      return 'bg-blueViolet';
    } else if ((value1 / (value1 + value2)) >= 0.25) {
      return 'bg-orange';
    } else if ((value1 / (value1 + value2)) < 0.25) {
      return 'bg-red';
    } else {
      return '';
    }
  }

  calculateAverageWins(row: Team) {
    let tmpVal = 0;
    tmpVal += row.filterStats.passAttempts.wins;
    tmpVal += row.filterStats.passYards.wins;
    tmpVal += row.filterStats.passTds.wins;
    tmpVal += row.filterStats.rushAttempts.wins;
    tmpVal += row.filterStats.rushYards.wins;
    tmpVal += row.filterStats.rushTds.wins;
    // tmpVal += row.filterStats.firstDowns.wins;
    // tmpVal += row.filterStats.thirdDown.wins;
    // tmpVal += row.filterStats.redzone.wins;
    tmpVal += row.filterStats.points.wins;
    return tmpVal;
  }

  calculateFavWinsPercDiff(row: Team) {
    let tmpVal = 0;
    row.filterAtsFavoritesStats.passAttempts.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passYards.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passTds.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushAttempts.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushYards.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushTds.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.points.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateFavAtsOver80(row: Team) {
    let tmpVal = 0;
    row.filterAtsFavoritesStats.passAttempts.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passYards.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passTds.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushAttempts.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushYards.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushTds.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.points.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateFavAtsOppUnder20(row: Team) {
    let tmpVal = 0;
    row.filterAtsFavoritesStats.passAttempts.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passYards.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passTds.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushAttempts.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushYards.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushTds.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.points.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateFavLossesPercDiff(row: Team) {
    let tmpVal = 0;
    row.filterAtsFavoritesStats.passAttempts.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passYards.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passTds.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushAttempts.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushYards.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushTds.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.points.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateFavAtsLossesOver80(row: Team) {
    let tmpVal = 0;
    row.filterAtsFavoritesStats.passAttempts.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passYards.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passTds.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushAttempts.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushYards.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushTds.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.points.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateFavAtsLossesOppUnder20(row: Team) {
    let tmpVal = 0;
    row.filterAtsFavoritesStats.passAttempts.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passYards.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.passTds.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushAttempts.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushYards.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.rushTds.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsFavoritesStats.points.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateUnderAtsPercDiff(row: Team) {
    let tmpVal = 0;
    row.filterAtsUnderdogStats.passAttempts.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passYards.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passTds.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushAttempts.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushYards.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushTds.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.points.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateUnderAtsOver80(row: Team) {
    let tmpVal = 0;
    row.filterAtsUnderdogStats.passAttempts.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passYards.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passTds.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushAttempts.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushYards.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushTds.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.points.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateUnderAtsOppUnder20(row: Team) {
    let tmpVal = 0;
    row.filterAtsUnderdogStats.passAttempts.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passYards.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passTds.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushAttempts.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushYards.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushTds.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.points.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateUnderAtsLossesPercDiff(row: Team) {
    let tmpVal = 0;
    row.filterAtsUnderdogStats.passAttempts.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passYards.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passTds.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushAttempts.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushYards.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushTds.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.points.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateUnderAtsLossesOver80(row: Team) {
    let tmpVal = 0;
    row.filterAtsUnderdogStats.passAttempts.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passYards.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passTds.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushAttempts.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushYards.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushTds.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.points.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateUnderAtsLossesOppUnder20(row: Team) {
    let tmpVal = 0;
    row.filterAtsUnderdogStats.passAttempts.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passYards.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.passTds.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushAttempts.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushYards.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.rushTds.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsUnderdogStats.points.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }

  calculateTotalWinsPercDiff(row: Team) {
    let tmpVal = 0;
    row.filterStats.passAttempts.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.passYards.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.passTds.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.rushAttempts.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.rushYards.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.rushTds.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.points.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateTotalWinsOver80(row: Team) {
    let tmpVal = 0;
    row.filterStats.passAttempts.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.passYards.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.passTds.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.rushAttempts.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.rushYards.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.rushTds.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.points.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateTotalWinsOppUnder20(row: Team) {
    let tmpVal = 0;
    row.filterStats.passAttempts.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.passYards.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.passTds.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.rushAttempts.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.rushYards.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.rushTds.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterStats.points.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateTotalAtsPercDiff(row: Team) {
    let tmpVal = 0;
    row.filterAtsStats.passAttempts.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passYards.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passTds.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushAttempts.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushYards.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushTds.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.points.winsArr.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateTotalAtsOver80(row: Team) {
    let tmpVal = 0;
    row.filterAtsStats.passAttempts.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passYards.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passTds.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushAttempts.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushYards.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushTds.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.points.winsArr2.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateTotalAtsOppUnder20(row: Team) {
    let tmpVal = 0;
    row.filterAtsStats.passAttempts.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passYards.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passTds.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushAttempts.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushYards.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushTds.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.points.winsArr3.forEach(item => {
      if (item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }


  calculateTotalLossesPercDiff(row: Team) {
    let tmpVal = 0;
    row.filterStats.passAttempts.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.passYards.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.passTds.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.rushAttempts.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.rushYards.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.rushTds.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.points.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateTotalLossesOver80(row: Team) {
    let tmpVal = 0;
    row.filterStats.passAttempts.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.passYards.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.passTds.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.rushAttempts.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.rushYards.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.rushTds.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.points.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateTotalLossesOppUnder20(row: Team) {
    let tmpVal = 0;
    row.filterStats.passAttempts.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.passYards.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.passTds.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.rushAttempts.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.rushYards.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.rushTds.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterStats.points.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateTotalAtsLossesPercDiff(row: Team) {
    let tmpVal = 0;
    row.filterAtsStats.passAttempts.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passYards.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passTds.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushAttempts.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushYards.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushTds.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.points.winsArr.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateTotalAtsLossesOver80(row: Team) {
    let tmpVal = 0;
    row.filterAtsStats.passAttempts.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passYards.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passTds.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushAttempts.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushYards.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushTds.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.points.winsArr2.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }
  calculateTotalAtsLossesOppUnder20(row: Team) {
    let tmpVal = 0;
    row.filterAtsStats.passAttempts.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passYards.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.passTds.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushAttempts.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushYards.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.rushTds.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    row.filterAtsStats.points.winsArr3.forEach(item => {
      if (!item) {
        tmpVal++;
      }
    });
    return tmpVal;
  }

  calculateOppAverageWins(row: Team) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === row.nextOpponent) {
        tmpVal += team.filterStats.passAttempts.wins;
        tmpVal += team.filterStats.passYards.wins;
        tmpVal += team.filterStats.passTds.wins;
        tmpVal += team.filterStats.rushAttempts.wins;
        tmpVal += team.filterStats.rushYards.wins;
        tmpVal += team.filterStats.rushTds.wins;
        tmpVal += team.filterStats.points.wins;
      }
    });
    return tmpVal;
  }

  calculateAverageLosses(row: Team) {
    let tmpVal = 0;
    tmpVal += row.filterStats.passAttempts.losses;
    tmpVal += row.filterStats.passYards.losses;
    tmpVal += row.filterStats.passTds.losses;
    tmpVal += row.filterStats.rushAttempts.losses;
    tmpVal += row.filterStats.rushYards.losses;
    tmpVal += row.filterStats.rushTds.losses;
    // tmpVal += row.filterStats.firstDowns.losses;
    // tmpVal += row.filterStats.thirdDown.losses;
    // tmpVal += row.filterStats.redzone.losses;
    tmpVal += row.filterStats.points.losses;
    return tmpVal;
  }

  calculateOppAverageLosses(row: Team) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === row.nextOpponent) {
        tmpVal += team.filterStats.passAttempts.losses;
        tmpVal += team.filterStats.passYards.losses;
        tmpVal += team.filterStats.passTds.losses;
        tmpVal += team.filterStats.rushAttempts.losses;
        tmpVal += team.filterStats.rushYards.losses;
        tmpVal += team.filterStats.rushTds.losses;
        tmpVal += team.filterStats.points.losses;
      }
    });
    return tmpVal;
  }
  calculateAverageAtsWins(row: Team) {
    let tmpVal = 0;
    tmpVal += row.filterAtsStats.passAttempts.wins;
    tmpVal += row.filterAtsStats.passYards.wins;
    tmpVal += row.filterAtsStats.passTds.wins;
    tmpVal += row.filterAtsStats.rushAttempts.wins;
    tmpVal += row.filterAtsStats.rushYards.wins;
    tmpVal += row.filterAtsStats.rushTds.wins;
    // tmpVal += row.filterAtsStats.firstDowns.wins;
    // tmpVal += row.filterAtsStats.thirdDown.wins;
    // tmpVal += row.filterAtsStats.redzone.wins;
    tmpVal += row.filterAtsStats.points.wins;
    return tmpVal;
  }

  calculateOppAverageAtsWins(row: Team) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === row.nextOpponent) {
        tmpVal += team.filterAtsStats.passAttempts.wins;
        tmpVal += team.filterAtsStats.passYards.wins;
        tmpVal += team.filterAtsStats.passTds.wins;
        tmpVal += team.filterAtsStats.rushAttempts.wins;
        tmpVal += team.filterAtsStats.rushYards.wins;
        tmpVal += team.filterAtsStats.rushTds.wins;
        tmpVal += team.filterAtsStats.points.wins;
      }
    });
    return tmpVal;
  }
  returnNextOpponent(row: Team): Team {
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === row.nextOpponent) {
        return team;
      }
    });
    return row;
  }
  calculateAverageAtsLosses(row: Team) {
    let tmpVal = 0;
    tmpVal += row.filterAtsStats.passAttempts.losses;
    tmpVal += row.filterAtsStats.passYards.losses;
    tmpVal += row.filterAtsStats.passTds.losses;
    tmpVal += row.filterAtsStats.rushAttempts.losses;
    tmpVal += row.filterAtsStats.rushYards.losses;
    tmpVal += row.filterAtsStats.rushTds.losses;
    // tmpVal += row.filterAtsStats.firstDowns.losses;
    // tmpVal += row.filterAtsStats.thirdDown.losses;
    // tmpVal += row.filterAtsStats.redzone.losses;
    tmpVal += row.filterAtsStats.points.losses;
    return tmpVal;
  }
  calculateOppAverageAtsLosses(row: Team) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === row.nextOpponent) {
        tmpVal += team.filterAtsStats.passAttempts.losses;
        tmpVal += team.filterAtsStats.passYards.losses;
        tmpVal += team.filterAtsStats.passTds.losses;
        tmpVal += team.filterAtsStats.rushAttempts.losses;
        tmpVal += team.filterAtsStats.rushYards.losses;
        tmpVal += team.filterAtsStats.rushTds.losses;
        tmpVal += team.filterAtsStats.points.losses;
      }
    });
    return tmpVal;
  }
  calculateAverageFavAtsWins(row: Team) {
    let tmpVal = 0;
    tmpVal += row.filterAtsFavoritesStats.passAttempts.wins;
    tmpVal += row.filterAtsFavoritesStats.passYards.wins;
    tmpVal += row.filterAtsFavoritesStats.passTds.wins;
    tmpVal += row.filterAtsFavoritesStats.rushAttempts.wins;
    tmpVal += row.filterAtsFavoritesStats.rushYards.wins;
    tmpVal += row.filterAtsFavoritesStats.rushTds.wins;
    // tmpVal += row.filterAtsFavoritesStats.firstDowns.wins;
    // tmpVal += row.filterAtsFavoritesStats.thirdDown.wins;
    // tmpVal += row.filterAtsFavoritesStats.redzone.wins;
    tmpVal += row.filterAtsFavoritesStats.points.wins;
    return tmpVal;
  }
  calculateOppAverageFavAtsWins(row: Team) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === row.nextOpponent) {
        tmpVal += team.filterAtsFavoritesStats.passAttempts.wins;
        tmpVal += team.filterAtsFavoritesStats.passYards.wins;
        tmpVal += team.filterAtsFavoritesStats.passTds.wins;
        tmpVal += team.filterAtsFavoritesStats.rushAttempts.wins;
        tmpVal += team.filterAtsFavoritesStats.rushYards.wins;
        tmpVal += team.filterAtsFavoritesStats.rushTds.wins;
        tmpVal += team.filterAtsFavoritesStats.points.wins;
      }
    });
    return tmpVal;
  }
  calculateAverageFavAtsLosses(row: Team) {
    let tmpVal = 0;
    tmpVal += row.filterAtsFavoritesStats.passAttempts.losses;
    tmpVal += row.filterAtsFavoritesStats.passYards.losses;
    tmpVal += row.filterAtsFavoritesStats.passTds.losses;
    tmpVal += row.filterAtsFavoritesStats.rushAttempts.losses;
    tmpVal += row.filterAtsFavoritesStats.rushYards.losses;
    tmpVal += row.filterAtsFavoritesStats.rushTds.losses;
    // tmpVal += row.filterAtsFavoritesStats.firstDowns.losses;
    // tmpVal += row.filterAtsFavoritesStats.thirdDown.losses;
    // tmpVal += row.filterAtsFavoritesStats.redzone.losses;
    tmpVal += row.filterAtsFavoritesStats.points.losses;
    return tmpVal;
  }
  calculateOppAverageFavAtsLosses(row: Team) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === row.nextOpponent) {
        tmpVal += team.filterAtsFavoritesStats.passAttempts.losses;
        tmpVal += team.filterAtsFavoritesStats.passYards.losses;
        tmpVal += team.filterAtsFavoritesStats.passTds.losses;
        tmpVal += team.filterAtsFavoritesStats.rushAttempts.losses;
        tmpVal += team.filterAtsFavoritesStats.rushYards.losses;
        tmpVal += team.filterAtsFavoritesStats.rushTds.losses;
        tmpVal += team.filterAtsFavoritesStats.points.losses;
      }
    });
    return tmpVal;
  }
  calculateAverageUnderAtsWins(row: Team) {
    let tmpVal = 0;
    tmpVal += row.filterAtsUnderdogStats.passAttempts.wins;
    tmpVal += row.filterAtsUnderdogStats.passYards.wins;
    tmpVal += row.filterAtsUnderdogStats.passTds.wins;
    tmpVal += row.filterAtsUnderdogStats.rushAttempts.wins;
    tmpVal += row.filterAtsUnderdogStats.rushYards.wins;
    tmpVal += row.filterAtsUnderdogStats.rushTds.wins;
    // tmpVal += row.filterAtsUnderdogStats.firstDowns.wins;
    // tmpVal += row.filterAtsUnderdogStats.thirdDown.wins;
    // tmpVal += row.filterAtsUnderdogStats.redzone.wins;
    tmpVal += row.filterAtsUnderdogStats.points.wins;
    return tmpVal;
  }

  calculateOppAverageUnderAtsWins(row: Team) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === row.nextOpponent) {
        tmpVal += team.filterAtsUnderdogStats.passAttempts.wins;
        tmpVal += team.filterAtsUnderdogStats.passYards.wins;
        tmpVal += team.filterAtsUnderdogStats.passTds.wins;
        tmpVal += team.filterAtsUnderdogStats.rushAttempts.wins;
        tmpVal += team.filterAtsUnderdogStats.rushYards.wins;
        tmpVal += team.filterAtsUnderdogStats.rushTds.wins;
        tmpVal += team.filterAtsUnderdogStats.points.wins;
      }
    });
    return tmpVal;
  }

  calculateAverageUnderAtsLosses(row: Team) {
    let tmpVal = 0;
    tmpVal += row.filterAtsUnderdogStats.passAttempts.losses;
    tmpVal += row.filterAtsUnderdogStats.passYards.losses;
    tmpVal += row.filterAtsUnderdogStats.passTds.losses;
    tmpVal += row.filterAtsUnderdogStats.rushAttempts.losses;
    tmpVal += row.filterAtsUnderdogStats.rushYards.losses;
    tmpVal += row.filterAtsUnderdogStats.rushTds.losses;
    // tmpVal += row.filterAtsUnderdogStats.firstDowns.losses;
    // tmpVal += row.filterAtsUnderdogStats.thirdDown.losses;
    // tmpVal += row.filterAtsUnderdogStats.redzone.losses;
    tmpVal += row.filterAtsUnderdogStats.points.losses;
    return tmpVal;
  }

  calculateOppAverageUnderAtsLosses(row: Team) {
    let tmpVal = 0;
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === row.nextOpponent) {
        tmpVal += team.filterAtsUnderdogStats.passAttempts.losses;
        tmpVal += team.filterAtsUnderdogStats.passYards.losses;
        tmpVal += team.filterAtsUnderdogStats.passTds.losses;
        tmpVal += team.filterAtsUnderdogStats.rushAttempts.losses;
        tmpVal += team.filterAtsUnderdogStats.rushYards.losses;
        tmpVal += team.filterAtsUnderdogStats.rushTds.losses;
        tmpVal += team.filterAtsUnderdogStats.points.losses;
      }
    });
    return tmpVal;
  }

  processMatCellColor(value1: number, value2: number) {
    if ((value1 / (value1 + value2)) >= 0.75) {
      return 'bg-green';
    } else if ((value1 / (value1 + value2)) >= 0.5) {
      return 'bg-blueViolet';
    } else if ((value1 / (value1 + value2)) >= 0.25) {
      return 'bg-orange';
    } else if ((value1 / (value1 + value2)) < 0.25) {
      return 'bg-red';
    } else {
      return '';
    }
  }

  returnIfFavorite(inputVal: boolean): string {
    if (inputVal) {
      return 'Favorite';
    } else {
      return 'Underdog';
    }
  }
}
