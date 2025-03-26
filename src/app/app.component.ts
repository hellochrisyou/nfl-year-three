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
import { NbaTeam, NhlTeam, Team } from './model/interface';
import { HttpService } from './services/http.service';

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
  weekCtrl = new FormControl(6);

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
  displayedColumns2 = ['teamName', 'passAttempts', 'passYards', 'passTds', 'rushAttempts', 'rushYards', 'rushTds', 'firstDowns', 'thirdDown', 'redzone', 'points'
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

  constructor(
    private fb: FormBuilder,
    private dateService: DateService,
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
          this.firstDownsChange(tmpEvent, team0.teamName);

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

  defaultFormControlsNcaaf() {
    // this.applyFilter(row.teamName);
    // this.selectedTeam = row.teamName;
    console.log("🚀 ~ this.httpService.allTeamsNcaaf:", this.httpService.allTeamsNcaaf)
    let tmpVal = '';
    let tmpEvent = {
      value: ''
    }

    this.httpService.allTeamsNcaaf.forEach(team0 => {
      this.httpService.allTeamsNcaaf.forEach(team => {
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
          this.passAttemptChangeNcaaf(tmpEvent, team0.teamName);

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
          this.passYardsChangeNcaaf(tmpEvent, team0.teamName);

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
          this.passTdsChangeNcaaf(tmpEvent, team0.teamName);

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
          this.rushAttemptsChangeNcaaf(tmpEvent, team0.teamName);

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
          this.rushYardsChangeNcaaf(tmpEvent, team0.teamName);

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
          this.rushTdsChangeNcaaf(tmpEvent, team0.teamName);

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
          this.firstDownsChangeNcaaf(tmpEvent, team0.teamName);

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
          this.thirdDownChangeNcaaf(tmpEvent, team0.teamName);

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
          this.redzoneChangeNcaaf(tmpEvent, team0.teamName);

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
          this.pointsChangeNcaaf(tmpEvent, team0.teamName);
        }
      })
    })
    // this.applyFilter(this.currentFilter);
    // this.calculateStd();
    let tmpAllTeam: Team[] = [];
    this.httpService.allTeamsNcaaf.forEach(team1 => {
      this.httpService.allTeamsNcaaf.forEach(team2 => {
        console.log("🚀 ~ team1.nextOpponent:", team1.nextOpponent)

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
    this.dataSourceNcaaf = new MatTableDataSource(tmpAllTeam);
    this.dataSourceNcaaf.sort = this.sort;
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
  passAttemptChangeNcaaf(event: any, teamName: string) {
    this.httpService.allTeamsNcaaf.forEach(team => {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.passingAttemptsGiven < this.passAttemptsQuartileNcaaf[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passAttempts.wins++;
                } else {
                  team.filterStats.passAttempts.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passAttempts.wins++;
                    team.filterAtsFavoritesStats.passAttempts.wins++;
                  } else {
                    team.filterAtsStats.passAttempts.losses++;
                    team.filterAtsFavoritesStats.passAttempts.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passAttempts.wins++;
                    team.filterAtsUnderdogStats.passAttempts.wins++;
                  } else {
                    team.filterAtsStats.passAttempts.losses++;
                    team.filterAtsUnderdogStats.passAttempts.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.passAttemptsPanelColor = 'orange';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.passingAttemptsGiven >= this.passAttemptsQuartileNcaaf[0]) && (game.passingAttemptsGiven <= this.passAttemptsQuartileNcaaf[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passAttempts.wins++;
                } else {
                  team.filterStats.passAttempts.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passAttempts.wins++;
                    team.filterAtsFavoritesStats.passAttempts.wins++;
                  } else {
                    team.filterAtsStats.passAttempts.losses++;
                    team.filterAtsFavoritesStats.passAttempts.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passAttempts.wins++;
                    team.filterAtsUnderdogStats.passAttempts.wins++;
                  } else {
                    team.filterAtsStats.passAttempts.losses++;
                    team.filterAtsUnderdogStats.passAttempts.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.passAttemptsPanelColor = 'blueviolet';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.passingAttemptsGiven > this.passAttemptsQuartileNcaaf[1] && game.passingAttemptsGiven <= this.passAttemptsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passAttempts.wins++;
                } else {
                  team.filterStats.passAttempts.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passAttempts.wins++;
                    team.filterAtsFavoritesStats.passAttempts.wins++;
                  } else {
                    team.filterAtsStats.passAttempts.losses++;
                    team.filterAtsFavoritesStats.passAttempts.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passAttempts.wins++;
                    team.filterAtsUnderdogStats.passAttempts.wins++;
                  } else {
                    team.filterAtsStats.passAttempts.losses++;
                    team.filterAtsUnderdogStats.passAttempts.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.passAttemptsPanelColor = 'green';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.passingAttemptsGiven > this.passAttemptsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passAttempts.wins++;
                } else {
                  team.filterStats.passAttempts.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passAttempts.wins++;
                    team.filterAtsFavoritesStats.passAttempts.wins++;
                  } else {
                    team.filterAtsStats.passAttempts.losses++;
                    team.filterAtsFavoritesStats.passAttempts.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passAttempts.wins++;
                    team.filterAtsUnderdogStats.passAttempts.wins++;
                  } else {
                    team.filterAtsStats.passAttempts.losses++;
                    team.filterAtsUnderdogStats.passAttempts.losses++;
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
                if (game.passingAttemptsGiven < this.passAttemptsQuartile[0]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passAttempts.wins++;
                  } else {
                    team.filterStats.passAttempts.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passAttempts.wins++;
                      team.filterAtsFavoritesStats.passAttempts.wins++;
                    } else {
                      team.filterAtsStats.passAttempts.losses++;
                      team.filterAtsFavoritesStats.passAttempts.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passAttempts.wins++;
                      team.filterAtsUnderdogStats.passAttempts.wins++;
                    } else {
                      team.filterAtsStats.passAttempts.losses++;
                      team.filterAtsUnderdogStats.passAttempts.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
        case 'quart2': {
          this.passAttemptsPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if ((game.passingAttemptsGiven >= this.passAttemptsQuartile[0]) && (game.passingAttemptsGiven <= this.passAttemptsQuartile[1])) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passAttempts.wins++;
                  } else {
                    team.filterStats.passAttempts.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passAttempts.wins++;
                      team.filterAtsFavoritesStats.passAttempts.wins++;
                    } else {
                      team.filterAtsStats.passAttempts.losses++;
                      team.filterAtsFavoritesStats.passAttempts.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passAttempts.wins++;
                      team.filterAtsUnderdogStats.passAttempts.wins++;
                    } else {
                      team.filterAtsStats.passAttempts.losses++;
                      team.filterAtsUnderdogStats.passAttempts.losses++;
                    }
                  }
                }
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
                if (game.passingAttemptsGiven > this.passAttemptsQuartile[1] && game.passingAttemptsGiven <= this.passAttemptsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passAttempts.wins++;
                  } else {
                    team.filterStats.passAttempts.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passAttempts.wins++;
                      team.filterAtsFavoritesStats.passAttempts.wins++;
                    } else {
                      team.filterAtsStats.passAttempts.losses++;
                      team.filterAtsFavoritesStats.passAttempts.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passAttempts.wins++;
                      team.filterAtsUnderdogStats.passAttempts.wins++;
                    } else {
                      team.filterAtsStats.passAttempts.losses++;
                      team.filterAtsUnderdogStats.passAttempts.losses++;
                    }
                  }
                }
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
                if (game.passingAttemptsGiven > this.passAttemptsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passAttempts.wins++;
                  } else {
                    team.filterStats.passAttempts.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passAttempts.wins++;
                      team.filterAtsFavoritesStats.passAttempts.wins++;
                    } else {
                      team.filterAtsStats.passAttempts.losses++;
                      team.filterAtsFavoritesStats.passAttempts.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passAttempts.wins++;
                      team.filterAtsUnderdogStats.passAttempts.wins++;
                    } else {
                      team.filterAtsStats.passAttempts.losses++;
                      team.filterAtsUnderdogStats.passAttempts.losses++;
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
  passYardsChangeNcaaf(event: any, teamName: string) {
    this.httpService.allTeamsNcaaf.forEach(team => {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.passingYardsGiven < this.passYardsQuartileNcaaf[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passYards.wins++;
                } else {
                  team.filterStats.passYards.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passYards.wins++;
                    team.filterAtsFavoritesStats.passYards.wins++;
                  } else {
                    team.filterAtsStats.passYards.losses++;
                    team.filterAtsFavoritesStats.passYards.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passYards.wins++;
                    team.filterAtsUnderdogStats.passYards.wins++;
                  } else {
                    team.filterAtsStats.passYards.losses++;
                    team.filterAtsUnderdogStats.passYards.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.passYardsPanelColor = 'orange';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.passingYardsGiven >= this.passYardsQuartileNcaaf[0]) && (game.passingYardsGiven <= this.passYardsQuartileNcaaf[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passYards.wins++;
                } else {
                  team.filterStats.passYards.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passYards.wins++;
                    team.filterAtsFavoritesStats.passYards.wins++;
                  } else {
                    team.filterAtsStats.passYards.losses++;
                    team.filterAtsFavoritesStats.passYards.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passYards.wins++;
                    team.filterAtsUnderdogStats.passYards.wins++;
                  } else {
                    team.filterAtsStats.passYards.losses++;
                    team.filterAtsUnderdogStats.passYards.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.passYardsPanelColor = 'blueviolet';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.passingYardsGiven > this.passYardsQuartileNcaaf[1] && game.passingYardsGiven <= this.passYardsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passYards.wins++;
                } else {
                  team.filterStats.passYards.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passYards.wins++;
                    team.filterAtsFavoritesStats.passYards.wins++;
                  } else {
                    team.filterAtsStats.passYards.losses++;
                    team.filterAtsFavoritesStats.passYards.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passYards.wins++;
                    team.filterAtsUnderdogStats.passYards.wins++;
                  } else {
                    team.filterAtsStats.passYards.losses++;
                    team.filterAtsUnderdogStats.passYards.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.passYardsPanelColor = 'green';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.passingYardsGiven > this.passYardsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passYards.wins++;
                } else {
                  team.filterStats.passYards.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passYards.wins++;
                    team.filterAtsFavoritesStats.passYards.wins++;
                  } else {
                    team.filterAtsStats.passYards.losses++;
                    team.filterAtsFavoritesStats.passYards.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passYards.wins++;
                    team.filterAtsUnderdogStats.passYards.wins++;
                  } else {
                    team.filterAtsStats.passYards.losses++;
                    team.filterAtsUnderdogStats.passYards.losses++;
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
                if (game.passingYardsGiven < this.passYardsQuartile[0]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passYards.wins++;
                  } else {
                    team.filterStats.passYards.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passYards.wins++;
                      team.filterAtsFavoritesStats.passYards.wins++;
                    } else {
                      team.filterAtsStats.passYards.losses++;
                      team.filterAtsFavoritesStats.passYards.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passYards.wins++;
                      team.filterAtsUnderdogStats.passYards.wins++;
                    } else {
                      team.filterAtsStats.passYards.losses++;
                      team.filterAtsUnderdogStats.passYards.losses++;
                    }
                  }
                }
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
                if ((game.passingYardsGiven >= this.passYardsQuartile[0]) && (game.passingYardsGiven <= this.passYardsQuartile[1])) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passYards.wins++;
                  } else {
                    team.filterStats.passYards.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passYards.wins++;
                      team.filterAtsFavoritesStats.passYards.wins++;
                    } else {
                      team.filterAtsStats.passYards.losses++;
                      team.filterAtsFavoritesStats.passYards.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passYards.wins++;
                      team.filterAtsUnderdogStats.passYards.wins++;
                    } else {
                      team.filterAtsStats.passYards.losses++;
                      team.filterAtsUnderdogStats.passYards.losses++;
                    }
                  }
                }
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
                if (game.passingYardsGiven > this.passYardsQuartile[1] && game.passingYardsGiven <= this.passYardsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passYards.wins++;
                  } else {
                    team.filterStats.passYards.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passYards.wins++;
                      team.filterAtsFavoritesStats.passYards.wins++;
                    } else {
                      team.filterAtsStats.passYards.losses++;
                      team.filterAtsFavoritesStats.passYards.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passYards.wins++;
                      team.filterAtsUnderdogStats.passYards.wins++;
                    } else {
                      team.filterAtsStats.passYards.losses++;
                      team.filterAtsUnderdogStats.passYards.losses++;
                    }
                  }
                }
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
                if (game.passingYardsGiven > this.passYardsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passYards.wins++;
                  } else {
                    team.filterStats.passYards.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passYards.wins++;
                      team.filterAtsFavoritesStats.passYards.wins++;
                    } else {
                      team.filterAtsStats.passYards.losses++;
                      team.filterAtsFavoritesStats.passYards.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passYards.wins++;
                      team.filterAtsUnderdogStats.passYards.wins++;
                    } else {
                      team.filterAtsStats.passYards.losses++;
                      team.filterAtsUnderdogStats.passYards.losses++;
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
  passTdsChangeNcaaf(event: any, teamName: string) {
    this.httpService.allTeamsNcaaf.forEach(team => {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.passingTdsGiven < this.passTdsQuartileNcaaf[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passTds.wins++;
                } else {
                  team.filterStats.passTds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passTds.wins++;
                    team.filterAtsFavoritesStats.passTds.wins++;
                  } else {
                    team.filterAtsStats.passTds.losses++;
                    team.filterAtsFavoritesStats.passTds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passTds.wins++;
                    team.filterAtsUnderdogStats.passTds.wins++;
                  } else {
                    team.filterAtsStats.passTds.losses++;
                    team.filterAtsUnderdogStats.passTds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.passTdsPanelColor = 'orange';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.passingTdsGiven >= this.passTdsQuartileNcaaf[0]) && (game.passingTdsGiven <= this.passTdsQuartileNcaaf[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passTds.wins++;
                } else {
                  team.filterStats.passTds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passTds.wins++;
                    team.filterAtsFavoritesStats.passTds.wins++;
                  } else {
                    team.filterAtsStats.passTds.losses++;
                    team.filterAtsFavoritesStats.passTds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passTds.wins++;
                    team.filterAtsUnderdogStats.passTds.wins++;
                  } else {
                    team.filterAtsStats.passTds.losses++;
                    team.filterAtsUnderdogStats.passTds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.passTdsPanelColor = 'blueviolet';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.passingTdsGiven > this.passTdsQuartileNcaaf[1] && game.passingTdsGiven <= this.passTdsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passTds.wins++;
                } else {
                  team.filterStats.passTds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passTds.wins++;
                    team.filterAtsFavoritesStats.passTds.wins++;
                  } else {
                    team.filterAtsStats.passTds.losses++;
                    team.filterAtsFavoritesStats.passTds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passTds.wins++;
                    team.filterAtsUnderdogStats.passTds.wins++;
                  } else {
                    team.filterAtsStats.passTds.losses++;
                    team.filterAtsUnderdogStats.passTds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.passTdsPanelColor = 'green';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.passingTdsGiven > this.passTdsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.passTds.wins++;
                } else {
                  team.filterStats.passTds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passTds.wins++;
                    team.filterAtsFavoritesStats.passTds.wins++;
                  } else {
                    team.filterAtsStats.passTds.losses++;
                    team.filterAtsFavoritesStats.passTds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.passTds.wins++;
                    team.filterAtsUnderdogStats.passTds.wins++;
                  } else {
                    team.filterAtsStats.passTds.losses++;
                    team.filterAtsUnderdogStats.passTds.losses++;
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
                if (game.passingTdsGiven < this.passTdsQuartile[0]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passTds.wins++;
                  } else {
                    team.filterStats.passTds.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passTds.wins++;
                      team.filterAtsFavoritesStats.passTds.wins++;
                    } else {
                      team.filterAtsStats.passTds.losses++;
                      team.filterAtsFavoritesStats.passTds.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passTds.wins++;
                      team.filterAtsUnderdogStats.passTds.wins++;
                    } else {
                      team.filterAtsStats.passTds.losses++;
                      team.filterAtsUnderdogStats.passTds.losses++;
                    }
                  }
                }
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
                if ((game.passingTdsGiven >= this.passTdsQuartile[0]) && (game.passingTdsGiven <= this.passTdsQuartile[1])) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passTds.wins++;
                  } else {
                    team.filterStats.passTds.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passTds.wins++;
                      team.filterAtsFavoritesStats.passTds.wins++;
                    } else {
                      team.filterAtsStats.passTds.losses++;
                      team.filterAtsFavoritesStats.passTds.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passTds.wins++;
                      team.filterAtsUnderdogStats.passTds.wins++;
                    } else {
                      team.filterAtsStats.passTds.losses++;
                      team.filterAtsUnderdogStats.passTds.losses++;
                    }
                  }
                }
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
                if (game.passingTdsGiven > this.passTdsQuartile[1] && game.passingTdsGiven <= this.passTdsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passTds.wins++;
                  } else {
                    team.filterStats.passTds.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passTds.wins++;
                      team.filterAtsFavoritesStats.passTds.wins++;
                    } else {
                      team.filterAtsStats.passTds.losses++;
                      team.filterAtsFavoritesStats.passTds.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passTds.wins++;
                      team.filterAtsUnderdogStats.passTds.wins++;
                    } else {
                      team.filterAtsStats.passTds.losses++;
                      team.filterAtsUnderdogStats.passTds.losses++;
                    }
                  }
                }
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
                if (game.passingTdsGiven > this.passTdsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.passTds.wins++;
                  } else {
                    team.filterStats.passTds.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passTds.wins++;
                      team.filterAtsFavoritesStats.passTds.wins++;
                    } else {
                      team.filterAtsStats.passTds.losses++;
                      team.filterAtsFavoritesStats.passTds.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.passTds.wins++;
                      team.filterAtsUnderdogStats.passTds.wins++;
                    } else {
                      team.filterAtsStats.passTds.losses++;
                      team.filterAtsUnderdogStats.passTds.losses++;
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
  rushAttemptsChangeNcaaf(event: any, teamName) {
    this.httpService.allTeamsNcaaf.forEach(team => {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.rushingAttemptsGiven < this.rushAttemptsQuartileNcaaf[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushAttempts.wins++;
                } else {
                  team.filterStats.rushAttempts.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushAttempts.wins++;
                    team.filterAtsFavoritesStats.rushAttempts.wins++;
                  } else {
                    team.filterAtsStats.rushAttempts.losses++;
                    team.filterAtsFavoritesStats.rushAttempts.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushAttempts.wins++;
                    team.filterAtsUnderdogStats.rushAttempts.wins++;
                  } else {
                    team.filterAtsStats.rushAttempts.losses++;
                    team.filterAtsUnderdogStats.rushAttempts.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.rushAttemptsPanelColor = 'orange';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.rushingAttemptsGiven >= this.rushAttemptsQuartileNcaaf[0]) && (game.rushingAttemptsGiven <= this.rushAttemptsQuartileNcaaf[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushAttempts.wins++;
                } else {
                  team.filterStats.rushAttempts.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushAttempts.wins++;
                    team.filterAtsFavoritesStats.rushAttempts.wins++;
                  } else {
                    team.filterAtsStats.rushAttempts.losses++;
                    team.filterAtsFavoritesStats.rushAttempts.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushAttempts.wins++;
                    team.filterAtsUnderdogStats.rushAttempts.wins++;
                  } else {
                    team.filterAtsStats.rushAttempts.losses++;
                    team.filterAtsUnderdogStats.rushAttempts.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.rushAttemptsPanelColor = 'blueviolet';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.rushingAttemptsGiven > this.rushAttemptsQuartileNcaaf[1] && game.rushingAttemptsGiven <= this.rushAttemptsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushAttempts.wins++;
                } else {
                  team.filterStats.rushAttempts.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushAttempts.wins++;
                    team.filterAtsFavoritesStats.rushAttempts.wins++;
                  } else {
                    team.filterAtsStats.rushAttempts.losses++;
                    team.filterAtsFavoritesStats.rushAttempts.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushAttempts.wins++;
                    team.filterAtsUnderdogStats.rushAttempts.wins++;
                  } else {
                    team.filterAtsStats.rushAttempts.losses++;
                    team.filterAtsUnderdogStats.rushAttempts.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.rushAttemptsPanelColor = 'green';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.rushingAttemptsGiven > this.rushAttemptsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushAttempts.wins++;
                } else {
                  team.filterStats.rushAttempts.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushAttempts.wins++;
                    team.filterAtsFavoritesStats.rushAttempts.wins++;
                  } else {
                    team.filterAtsStats.rushAttempts.losses++;
                    team.filterAtsFavoritesStats.rushAttempts.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushAttempts.wins++;
                    team.filterAtsUnderdogStats.rushAttempts.wins++;
                  } else {
                    team.filterAtsStats.rushAttempts.losses++;
                    team.filterAtsUnderdogStats.rushAttempts.losses++;
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
                if (game.rushingAttemptsGiven < this.rushAttemptsQuartile[0]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushAttempts.wins++;
                  } else {
                    team.filterStats.rushAttempts.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushAttempts.wins++;
                      team.filterAtsFavoritesStats.rushAttempts.wins++;
                    } else {
                      team.filterAtsStats.rushAttempts.losses++;
                      team.filterAtsFavoritesStats.rushAttempts.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushAttempts.wins++;
                      team.filterAtsUnderdogStats.rushAttempts.wins++;
                    } else {
                      team.filterAtsStats.rushAttempts.losses++;
                      team.filterAtsUnderdogStats.rushAttempts.losses++;
                    }
                  }
                }
              })
            }
          })
          break;
        }
        case 'quart2': {
          this.rushAttemptsPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if ((game.rushingAttemptsGiven >= this.rushAttemptsQuartile[0]) && (game.rushingAttemptsGiven <= this.rushAttemptsQuartile[1])) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushAttempts.wins++;
                  } else {
                    team.filterStats.rushAttempts.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushAttempts.wins++;
                      team.filterAtsFavoritesStats.rushAttempts.wins++;
                    } else {
                      team.filterAtsStats.rushAttempts.losses++;
                      team.filterAtsFavoritesStats.rushAttempts.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushAttempts.wins++;
                      team.filterAtsUnderdogStats.rushAttempts.wins++;
                    } else {
                      team.filterAtsStats.rushAttempts.losses++;
                      team.filterAtsUnderdogStats.rushAttempts.losses++;
                    }
                  }
                }
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
                if (game.rushingAttemptsGiven > this.rushAttemptsQuartile[1] && game.rushingAttemptsGiven <= this.rushAttemptsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushAttempts.wins++;
                  } else {
                    team.filterStats.rushAttempts.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushAttempts.wins++;
                      team.filterAtsFavoritesStats.rushAttempts.wins++;
                    } else {
                      team.filterAtsStats.rushAttempts.losses++;
                      team.filterAtsFavoritesStats.rushAttempts.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushAttempts.wins++;
                      team.filterAtsUnderdogStats.rushAttempts.wins++;
                    } else {
                      team.filterAtsStats.rushAttempts.losses++;
                      team.filterAtsUnderdogStats.rushAttempts.losses++;
                    }
                  }
                }
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
                if (game.rushingAttemptsGiven > this.rushAttemptsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushAttempts.wins++;
                  } else {
                    team.filterStats.rushAttempts.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushAttempts.wins++;
                      team.filterAtsFavoritesStats.rushAttempts.wins++;
                    } else {
                      team.filterAtsStats.rushAttempts.losses++;
                      team.filterAtsFavoritesStats.rushAttempts.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushAttempts.wins++;
                      team.filterAtsUnderdogStats.rushAttempts.wins++;
                    } else {
                      team.filterAtsStats.rushAttempts.losses++;
                      team.filterAtsUnderdogStats.rushAttempts.losses++;
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
  rushYardsChangeNcaaf(event: any, teamName: string) {
    this.httpService.allTeamsNcaaf.forEach(team => {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.rushingYardsGiven < this.rushYardsQuartileNcaaf[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushYards.wins++;
                } else {
                  team.filterStats.rushYards.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushYards.wins++;
                    team.filterAtsFavoritesStats.rushYards.wins++;
                  } else {
                    team.filterAtsStats.rushYards.losses++;
                    team.filterAtsFavoritesStats.rushYards.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushYards.wins++;
                    team.filterAtsUnderdogStats.rushYards.wins++;
                  } else {
                    team.filterAtsStats.rushYards.losses++;
                    team.filterAtsUnderdogStats.rushYards.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.rushYardsPanelColor = 'orange';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.rushingYardsGiven >= this.rushYardsQuartileNcaaf[0]) && (game.rushingYardsGiven <= this.rushYardsQuartileNcaaf[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushYards.wins++;
                } else {
                  team.filterStats.rushYards.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushYards.wins++;
                    team.filterAtsFavoritesStats.rushYards.wins++;
                  } else {
                    team.filterAtsStats.rushYards.losses++;
                    team.filterAtsFavoritesStats.rushYards.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushYards.wins++;
                    team.filterAtsUnderdogStats.rushYards.wins++;
                  } else {
                    team.filterAtsStats.rushYards.losses++;
                    team.filterAtsUnderdogStats.rushYards.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.rushYardsPanelColor = 'blueviolet';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.rushingYardsGiven > this.rushYardsQuartileNcaaf[1] && game.rushingYardsGiven <= this.rushYardsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushYards.wins++;
                } else {
                  team.filterStats.rushYards.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushYards.wins++;
                    team.filterAtsFavoritesStats.rushYards.wins++;
                  } else {
                    team.filterAtsStats.rushYards.losses++;
                    team.filterAtsFavoritesStats.rushYards.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushYards.wins++;
                    team.filterAtsUnderdogStats.rushYards.wins++;
                  } else {
                    team.filterAtsStats.rushYards.losses++;
                    team.filterAtsUnderdogStats.rushYards.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.rushYardsPanelColor = 'green';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.rushingYardsGiven > this.rushYardsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushYards.wins++;
                } else {
                  team.filterStats.rushYards.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushYards.wins++;
                    team.filterAtsFavoritesStats.rushYards.wins++;
                  } else {
                    team.filterAtsStats.rushYards.losses++;
                    team.filterAtsFavoritesStats.rushYards.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushYards.wins++;
                    team.filterAtsUnderdogStats.rushYards.wins++;
                  } else {
                    team.filterAtsStats.rushYards.losses++;
                    team.filterAtsUnderdogStats.rushYards.losses++;
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
                if (game.rushingYardsGiven < this.rushYardsQuartile[0]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushYards.wins++;
                  } else {
                    team.filterStats.rushYards.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushYards.wins++;
                      team.filterAtsFavoritesStats.rushYards.wins++;
                    } else {
                      team.filterAtsStats.rushYards.losses++;
                      team.filterAtsFavoritesStats.rushYards.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushYards.wins++;
                      team.filterAtsUnderdogStats.rushYards.wins++;
                    } else {
                      team.filterAtsStats.rushYards.losses++;
                      team.filterAtsUnderdogStats.rushYards.losses++;
                    }
                  }
                }
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
                if ((game.rushingYardsGiven >= this.rushYardsQuartile[0]) && (game.rushingYardsGiven <= this.rushYardsQuartile[1])) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushYards.wins++;
                  } else {
                    team.filterStats.rushYards.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushYards.wins++;
                      team.filterAtsFavoritesStats.rushYards.wins++;
                    } else {
                      team.filterAtsStats.rushYards.losses++;
                      team.filterAtsFavoritesStats.rushYards.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushYards.wins++;
                      team.filterAtsUnderdogStats.rushYards.wins++;
                    } else {
                      team.filterAtsStats.rushYards.losses++;
                      team.filterAtsUnderdogStats.rushYards.losses++;
                    }
                  }
                }
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
                if (game.rushingYardsGiven > this.rushYardsQuartile[1] && game.rushingYardsGiven <= this.rushYardsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushYards.wins++;
                  } else {
                    team.filterStats.rushYards.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushYards.wins++;
                      team.filterAtsFavoritesStats.rushYards.wins++;
                    } else {
                      team.filterAtsStats.rushYards.losses++;
                      team.filterAtsFavoritesStats.rushYards.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushYards.wins++;
                      team.filterAtsUnderdogStats.rushYards.wins++;
                    } else {
                      team.filterAtsStats.rushYards.losses++;
                      team.filterAtsUnderdogStats.rushYards.losses++;
                    }
                  }
                }
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
                if (game.rushingYardsGiven > this.rushYardsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushYards.wins++;
                  } else {
                    team.filterStats.rushYards.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushYards.wins++;
                      team.filterAtsFavoritesStats.rushYards.wins++;
                    } else {
                      team.filterAtsStats.rushYards.losses++;
                      team.filterAtsFavoritesStats.rushYards.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushYards.wins++;
                      team.filterAtsUnderdogStats.rushYards.wins++;
                    } else {
                      team.filterAtsStats.rushYards.losses++;
                      team.filterAtsUnderdogStats.rushYards.losses++;
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
  rushTdsChangeNcaaf(event: any, teamName: string) {
    this.httpService.allTeamsNcaaf.forEach(team => {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.rushingTdsGiven < this.rushTdsQuartileNcaaf[0]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushTds.wins++;
                } else {
                  team.filterStats.rushTds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushTds.wins++;
                    team.filterAtsFavoritesStats.rushTds.wins++;
                  } else {
                    team.filterAtsStats.rushTds.losses++;
                    team.filterAtsFavoritesStats.rushTds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushTds.wins++;
                    team.filterAtsUnderdogStats.rushTds.wins++;
                  } else {
                    team.filterAtsStats.rushTds.losses++;
                    team.filterAtsUnderdogStats.rushTds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart2': {
        this.rushTdsPanelColor = 'orange';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.rushingTdsGiven >= this.rushTdsQuartileNcaaf[0]) && (game.rushingTdsGiven <= this.rushTdsQuartileNcaaf[1])) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushTds.wins++;
                } else {
                  team.filterStats.rushTds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushTds.wins++;
                    team.filterAtsFavoritesStats.rushTds.wins++;
                  } else {
                    team.filterAtsStats.rushTds.losses++;
                    team.filterAtsFavoritesStats.rushTds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushTds.wins++;
                    team.filterAtsUnderdogStats.rushTds.wins++;
                  } else {
                    team.filterAtsStats.rushTds.losses++;
                    team.filterAtsUnderdogStats.rushTds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart3': {
        this.rushTdsPanelColor = 'blueviolet';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.rushingTdsGiven > this.rushTdsQuartileNcaaf[1] && game.rushingTdsGiven <= this.rushTdsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushTds.wins++;
                } else {
                  team.filterStats.rushTds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushTds.wins++;
                    team.filterAtsFavoritesStats.rushTds.wins++;
                  } else {
                    team.filterAtsStats.rushTds.losses++;
                    team.filterAtsFavoritesStats.rushTds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushTds.wins++;
                    team.filterAtsUnderdogStats.rushTds.wins++;
                  } else {
                    team.filterAtsStats.rushTds.losses++;
                    team.filterAtsUnderdogStats.rushTds.losses++;
                  }
                }
              }
            })
          }
        })
        break;
      }
      case 'quart4': {
        this.rushTdsPanelColor = 'green';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.rushingTdsGiven > this.rushTdsQuartileNcaaf[2]) {
                if (game.points > game.pointsGiven) {
                  team.filterStats.rushTds.wins++;
                } else {
                  team.filterStats.rushTds.losses++;
                }
                if (game.isFavorite) {
                  if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushTds.wins++;
                    team.filterAtsFavoritesStats.rushTds.wins++;
                  } else {
                    team.filterAtsStats.rushTds.losses++;
                    team.filterAtsFavoritesStats.rushTds.losses++;
                  }
                } else {
                  if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                    team.filterAtsStats.rushTds.wins++;
                    team.filterAtsUnderdogStats.rushTds.wins++;
                  } else {
                    team.filterAtsStats.rushTds.losses++;
                    team.filterAtsUnderdogStats.rushTds.losses++;
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
                if (game.rushingTdsGiven < this.rushTdsQuartile[0]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushTds.wins++;
                  } else {
                    team.filterStats.rushTds.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushTds.wins++;
                      team.filterAtsFavoritesStats.rushTds.wins++;
                    } else {
                      team.filterAtsStats.rushTds.losses++;
                      team.filterAtsFavoritesStats.rushTds.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushTds.wins++;
                      team.filterAtsUnderdogStats.rushTds.wins++;
                    } else {
                      team.filterAtsStats.rushTds.losses++;
                      team.filterAtsUnderdogStats.rushTds.losses++;
                    }
                  }
                }
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
                if ((game.rushingTdsGiven >= this.rushTdsQuartile[0]) && (game.rushingTdsGiven <= this.rushTdsQuartile[1])) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushTds.wins++;
                  } else {
                    team.filterStats.rushTds.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushTds.wins++;
                      team.filterAtsFavoritesStats.rushTds.wins++;
                    } else {
                      team.filterAtsStats.rushTds.losses++;
                      team.filterAtsFavoritesStats.rushTds.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushTds.wins++;
                      team.filterAtsUnderdogStats.rushTds.wins++;
                    } else {
                      team.filterAtsStats.rushTds.losses++;
                      team.filterAtsUnderdogStats.rushTds.losses++;
                    }
                  }
                }
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
                if (game.rushingTdsGiven > this.rushTdsQuartile[1] && game.rushingTdsGiven <= this.rushTdsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushTds.wins++;
                  } else {
                    team.filterStats.rushTds.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushTds.wins++;
                      team.filterAtsFavoritesStats.rushTds.wins++;
                    } else {
                      team.filterAtsStats.rushTds.losses++;
                      team.filterAtsFavoritesStats.rushTds.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushTds.wins++;
                      team.filterAtsUnderdogStats.rushTds.wins++;
                    } else {
                      team.filterAtsStats.rushTds.losses++;
                      team.filterAtsUnderdogStats.rushTds.losses++;
                    }
                  }
                }
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
                if (game.rushingTdsGiven > this.rushTdsQuartile[2]) {
                  if (game.points > game.pointsGiven) {
                    team.filterStats.rushTds.wins++;
                  } else {
                    team.filterStats.rushTds.losses++;
                  }
                  if (game.isFavorite) {
                    if ((game.points - game.pointsGiven - Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushTds.wins++;
                      team.filterAtsFavoritesStats.rushTds.wins++;
                    } else {
                      team.filterAtsStats.rushTds.losses++;
                      team.filterAtsFavoritesStats.rushTds.losses++;
                    }
                  } else {
                    if ((game.points - game.pointsGiven + Math.abs(game.spread) > 0)) {
                      team.filterAtsStats.rushTds.wins++;
                      team.filterAtsUnderdogStats.rushTds.wins++;
                    } else {
                      team.filterAtsStats.rushTds.losses++;
                      team.filterAtsUnderdogStats.rushTds.losses++;
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
  thirdDownChangeNcaaf(event: any, teamName: string) {
    this.httpService.allTeamsNcaaf.forEach(team => {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.thirdDownConvPctGiven < this.thirdDownQuartileNcaaf[0]) {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.thirdDownConvPctGiven >= this.thirdDownQuartileNcaaf[0]) && (game.thirdDownConvPctGiven <= this.thirdDownQuartileNcaaf[1])) {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.thirdDownConvPctGiven > this.thirdDownQuartileNcaaf[1] && game.thirdDownConvPctGiven <= this.thirdDownQuartileNcaaf[2]) {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.thirdDownConvPctGiven > this.thirdDownQuartileNcaaf[2]) {
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
  redzoneChangeNcaaf(event: any, teamName: string) {
    this.httpService.allTeamsNcaaf.forEach(team => {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.redzoneScoringPctGiven < this.redzoneQuartileNcaaf[0]) {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.redzoneScoringPctGiven >= this.redzoneQuartileNcaaf[0]) && (game.redzoneScoringPctGiven <= this.redzoneQuartileNcaaf[1])) {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.redzoneScoringPctGiven > this.redzoneQuartileNcaaf[1] && game.redzoneScoringPctGiven <= this.redzoneQuartileNcaaf[2]) {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.redzoneScoringPctGiven > this.redzoneQuartileNcaaf[2]) {
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
  pointsChangeNcaaf(event: any, teamName: string) {
    this.httpService.allTeamsNcaaf.forEach(team => {
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
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.pointsGiven < this.pointsQuartileNcaaf[0]) {
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
        this.pointsPanelColor = 'orange';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if ((game.pointsGiven >= this.pointsQuartileNcaaf[0]) && (game.pointsGiven <= this.pointsQuartileNcaaf[1])) {
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
        this.pointsPanelColor = 'blueviolet';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.pointsGiven > this.pointsQuartileNcaaf[1] && game.pointsGiven <= this.pointsQuartileNcaaf[2]) {
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
        this.pointsPanelColor = 'green';
        this.httpService.allTeamsNcaaf.forEach(team => {
          if (team.teamName === teamName) {
            team.games.forEach(game => {
              if (game.pointsGiven > this.pointsQuartileNcaaf[2]) {
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
                if (game.pointsGiven < this.pointsQuartile[0]) {
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
          this.pointsPanelColor = 'orange';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if ((game.pointsGiven >= this.pointsQuartile[0]) && (game.pointsGiven <= this.pointsQuartile[1])) {
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
          this.pointsPanelColor = 'blueviolet';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if (game.pointsGiven > this.pointsQuartile[1] && game.pointsGiven <= this.pointsQuartile[2]) {
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
          this.pointsPanelColor = 'green';
          this.httpService.allTeams.forEach(team => {
            if (team.teamName === teamName) {
              team.games.forEach(game => {
                if (game.pointsGiven > this.pointsQuartile[2]) {
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

  sortColumn3(event: any) {
    switch (event.active) {
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
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.passAttempts.wins < b.filterStats.passAttempts.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.passAttempts.wins > b.filterStats.passAttempts.wins ? -1 : 1)));
        }
        break;
      }
      case 'passYards': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.passYards.wins < b.filterStats.passYards.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.passYards.wins > b.filterStats.passYards.wins ? -1 : 1)));
        }
        break;
      }
      case 'passTds': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.passTds.wins < b.filterStats.passTds.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.passTds.wins > b.filterStats.passTds.wins ? -1 : 1)));
        }
        break;
      }
      case 'rushAttempts': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.rushAttempts.wins < b.filterStats.rushAttempts.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.rushAttempts.wins > b.filterStats.rushAttempts.wins ? -1 : 1)));
        }
        break;
      }
      case 'rushYards': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.rushYards.wins < b.filterStats.rushYards.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.rushYards.wins > b.filterStats.rushYards.wins ? -1 : 1)));
        }
        break;
      }
      case 'rushTds': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.rushTds.wins < b.filterStats.rushTds.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.rushTds.wins > b.filterStats.rushTds.wins ? -1 : 1)));
        }
        break;
      }
      case 'firstDowns': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.firstDowns.wins < b.filterStats.firstDowns.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.firstDowns.wins > b.filterStats.firstDowns.wins ? -1 : 1)));
        }
        break;
      }

      case 'sacks': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.sacks.wins < b.filterStats.sacks.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.sacks.wins > b.filterStats.sacks.wins ? -1 : 1)));
        }
        break;
      }
      case 'interceptions': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.interceptions.wins < b.filterStats.interceptions.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.interceptions.wins > b.filterStats.interceptions.wins ? -1 : 1)));
        }
        break;
      }
      case 'thirdDown': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.thirdDown.wins < b.filterStats.thirdDown.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.thirdDown.wins > b.filterStats.thirdDown.wins ? -1 : 1)));
        }
        break;
      }
      case 'redzone': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.redzone.wins < b.filterStats.redzone.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.redzone.wins > b.filterStats.redzone.wins ? -1 : 1)));
        }
        break;
      }
      case 'points': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.points.wins < b.filterStats.points.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.filterStats.points.wins > b.filterStats.points.wins ? -1 : 1)));
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

  downloadLastYear() {
    this.currentDownloadCounter++;
    this.currentDownloadCounterPostMsg = ' ...Currently Downloading...';
    this.httpService.executeDataHydrationLastYear();
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
