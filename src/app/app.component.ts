import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RouterOutlet } from '@angular/router';

import { DateService } from './const/date';
import { MaterialModule } from './material.module';
import { Team } from './model/interface';
import { HttpService } from './services/http.service';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { KeyModalComponent } from './modal/key-modal/key-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule, ReactiveFormsModule, MaterialModule, HttpClientModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;

  title = 'nfl-year-three';
  displayedColumns = ['teamName', 'ats', 'nextOpponent', 'nextOpponentAts', 'passingAttempts', 'passingYards', 'passingTds', 'rushingAttempts', 'rushingYards',
    'rushingTds',
    'sacks', 'interceptions', 'firstDowns', 'thirdDownPct', 'redzoneScoringPct', 'points'];
  displayedColumns2 = ['teamName', 'passAttempts', 'passYards', 'passTds', 'rushAttempts', 'rushYards', 'rushTds', 'firstDowns', 'thirdDown', 'redzone', 'points'
    // 'nextOpponent',
    // 'sacks',
    // 'interceptions',
  ];
  basicStatsForm: FormGroup;
  crunchStatus = 'Initial';
  currentDownloadCounter = 0;
  currentDownloadCounterPostMsg = ' - DOWNLOAD REQUIRED';
  currentWeek: number = 0;
  dataSource: MatTableDataSource<Team>;
  firstDownsQuartile: number[] = [];
  interceptionsQuartile: number[] = [];
  passAttemptsQuartile: number[] = [];
  passTdsQuartile: number[] = [];
  passYardsQuartile: number[] = [];
  redzoneQuartile: number[] = [];
  rushAttemptsQuartile: number[] = [];
  rushTdsQuartile: number[] = [];
  rushYardsQuartile: number[] = [];
  sacksQuartile: number[] = [];
  scoreQuartile: number[] = [];
  selectedTeam = '';
  thirdDownQuartile: number[] = [];
  totalAvgToggle = 'Total';

  readonly dialog = inject(MatDialog);

  constructor(
    private dateService: DateService,
    private httpService: HttpService,
    private fb: FormBuilder
  ) {
    // this.dataSource = new MatTableDataSource(this.httpService.allTeams);
  }

  ngOnInit(): void {
    this.dateService.initializeStaticDates();
    // this.currentWeek = this.dateService.currentWeek;
    this.currentWeek = 3;
    console.log("🚀 ~ this.currentWeek:", this.currentWeek);
    this.httpService.updateDownloadStatus.subscribe(payload => {
      this.currentDownloadCounter = payload;
      this.currentDownloadCounterPostMsg = '';
    });
    this.httpService.updateAggregatingData.subscribe(payload => {
      this.crunchStatus = 'Processed';
    });
    this.httpService.updateTotalData.subscribe(payload => {
    });
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

  ngOnDestroy(): void {
  }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }

  defaultFormControls(row: Team) {
    this.selectedTeam = row.teamName;
    let tmpVal = '';
    let tmpEvent = {
      value: ''
    }
    this.httpService.allTeams.forEach(team => {
      if (team.teamName === row.nextOpponent) {
        if ((team.passingAttemptsTotal / team.games.length) < this.passAttemptsQuartile[0]) {
          tmpVal = 'quart1';
          tmpEvent.value = 'quart1';
        } else if (((team.passingAttemptsTotal / team.games.length) >= this.passAttemptsQuartile[0] && (team.passingAttemptsTotal / team.games.length) < this.passAttemptsQuartile[1])) {
          tmpVal = 'quart2'; tmpEvent.value = 'quart2';
        } else if (((team.passingAttemptsTotal / team.games.length) >= this.passAttemptsQuartile[1] && (team.passingAttemptsTotal / team.games.length) < this.passAttemptsQuartile[2])) {
          tmpVal = 'quart3'; tmpEvent.value = 'quart3';
        } else {
          tmpVal = 'quart4'; tmpEvent.value = 'quart4';
        }
        this.basicStatsForm.get('passAttemptsCtrl')?.patchValue(tmpVal);
        this.passAttemptChange(tmpEvent);

        if ((team.passingYardsTotal / team.games.length) < this.passYardsQuartile[0]) {
          tmpVal = 'quart1'; tmpEvent.value = 'quart1';
        } else if (((team.passingYardsTotal / team.games.length) >= this.passYardsQuartile[0] && (team.passingYardsTotal / team.games.length) < this.passYardsQuartile[1])) {
          tmpVal = 'quart2'; tmpEvent.value = 'quart2';
        } else if (((team.passingYardsTotal / team.games.length) >= this.passYardsQuartile[1] && (team.passingYardsTotal / team.games.length) < this.passYardsQuartile[2])) {
          tmpVal = 'quart3'; tmpEvent.value = 'quart3';
        } else {
          tmpVal = 'quart4'; tmpEvent.value = 'quart4';
        }
        this.basicStatsForm.get('passYardsCtrl')?.patchValue(tmpVal);
        this.passYardsChange(tmpEvent);

        if ((team.passingTdsTotal / team.games.length) < this.passTdsQuartile[0]) {
          tmpVal = 'quart1'; tmpEvent.value = 'quart1';
        } else if (((team.passingTdsTotal / team.games.length) >= this.passTdsQuartile[0] && (team.passingTdsTotal / team.games.length) < this.passTdsQuartile[1])) {
          tmpVal = 'quart2'; tmpEvent.value = 'quart2';
        } else if (((team.passingTdsTotal / team.games.length) >= this.passTdsQuartile[1] && (team.passingTdsTotal / team.games.length) < this.passTdsQuartile[2])) {
          tmpVal = 'quart3'; tmpEvent.value = 'quart3';
        } else {
          tmpVal = 'quart4'; tmpEvent.value = 'quart4';
        }
        this.basicStatsForm.get('passTdsCtrl')?.patchValue(tmpVal);
        this.passTdsChange(tmpEvent);

        if ((team.rushingAttemptsTotal / team.games.length) < this.rushAttemptsQuartile[0]) {
          tmpVal = 'quart1'; tmpEvent.value = 'quart1';
        } else if (((team.rushingAttemptsTotal / team.games.length) >= this.rushAttemptsQuartile[0] && (team.rushingAttemptsTotal / team.games.length) < this.rushAttemptsQuartile[1])) {
          tmpVal = 'quart2'; tmpEvent.value = 'quart2';
        } else if (((team.rushingAttemptsTotal / team.games.length) >= this.rushAttemptsQuartile[1] && (team.rushingAttemptsTotal / team.games.length) < this.rushAttemptsQuartile[2])) {
          tmpVal = 'quart3'; tmpEvent.value = 'quart3';
        } else {
          tmpVal = 'quart4'; tmpEvent.value = 'quart4';
        }
        this.basicStatsForm.get('rushAttemptsCtrl')?.patchValue(tmpVal);
        this.rushAttemptsChange(tmpEvent);

        if ((team.rushingYardsTotal / team.games.length) < this.rushYardsQuartile[0]) {
          tmpVal = 'quart1'; tmpEvent.value = 'quart1';
        } else if (((team.rushingYardsTotal / team.games.length) >= this.rushYardsQuartile[0] && (team.rushingYardsTotal / team.games.length) < this.rushYardsQuartile[1])) {
          tmpVal = 'quart2'; tmpEvent.value = 'quart2';
        } else if (((team.rushingYardsTotal / team.games.length) >= this.rushYardsQuartile[1] && (team.rushingYardsTotal / team.games.length) < this.rushYardsQuartile[2])) {
          tmpVal = 'quart3'; tmpEvent.value = 'quart3';
        } else {
          tmpVal = 'quart4'; tmpEvent.value = 'quart4';
        }
        this.basicStatsForm.get('rushYardsCtrl')?.patchValue(tmpVal);
        this.rushYardsChange(tmpEvent);

        if ((team.rushingTdsTotal / team.games.length) < this.rushTdsQuartile[0]) {
          tmpVal = 'quart1'; tmpEvent.value = 'quart1';
        } else if (((team.rushingTdsTotal / team.games.length) >= this.rushTdsQuartile[0] && (team.rushingTdsTotal / team.games.length) < this.rushTdsQuartile[1])) {
          tmpVal = 'quart2'; tmpEvent.value = 'quart2';
        } else if (((team.rushingTdsTotal / team.games.length) >= this.rushTdsQuartile[1] && (team.rushingTdsTotal / team.games.length) < this.rushTdsQuartile[2])) {
          tmpVal = 'quart3'; tmpEvent.value = 'quart3';
        } else {
          tmpVal = 'quart4'; tmpEvent.value = 'quart4';
        }
        this.basicStatsForm.get('rushTdCtrl')?.patchValue(tmpVal);
        this.rushTdsChange(tmpEvent);

        if ((team.firstDownsTotal / team.games.length) < this.firstDownsQuartile[0]) {
          tmpVal = 'quart1'; tmpEvent.value = 'quart1';
        } else if (((team.firstDownsTotal / team.games.length) >= this.firstDownsQuartile[0] && (team.firstDownsTotal / team.games.length) < this.firstDownsQuartile[1])) {
          tmpVal = 'quart2'; tmpEvent.value = 'quart2';
        } else if (((team.firstDownsTotal / team.games.length) >= this.firstDownsQuartile[1] && (team.firstDownsTotal / team.games.length) < this.firstDownsQuartile[2])) {
          tmpVal = 'quart3'; tmpEvent.value = 'quart3';
        } else {
          tmpVal = 'quart4'; tmpEvent.value = 'quart4';
        }
        this.basicStatsForm.get('firstDownsCtrl')?.patchValue(tmpVal);
        this.firstDownsChange(tmpEvent);

        if (team.thirdDownPctAvg < this.thirdDownQuartile[0]) {
          tmpVal = 'quart1'; tmpEvent.value = 'quart1';
        } else if (team.thirdDownPctAvg >= this.thirdDownQuartile[0] && team.thirdDownPctAvg < this.thirdDownQuartile[1]) {
          tmpVal = 'quart2'; tmpEvent.value = 'quart2';
        } else if (team.thirdDownPctAvg >= this.thirdDownQuartile[1] && team.thirdDownPctAvg < this.thirdDownQuartile[2]) {
          tmpVal = 'quart3'; tmpEvent.value = 'quart3';
        } else {
          tmpVal = 'quart4'; tmpEvent.value = 'quart4';
        }
        this.basicStatsForm.get('thirdDownPctCtrl')?.patchValue(tmpVal);
        this.thirdDownChange(tmpEvent);

        if (team.redzoneScoringPctAvg < this.redzoneQuartile[0]) {
          tmpVal = 'quart1'; tmpEvent.value = 'quart1';
        } else if (team.redzoneScoringPctAvg >= this.redzoneQuartile[0] && team.redzoneScoringPctAvg < this.redzoneQuartile[1]) {
          tmpVal = 'quart2'; tmpEvent.value = 'quart2';
        } else if (team.redzoneScoringPctAvg >= this.redzoneQuartile[1] && team.redzoneScoringPctAvg < this.redzoneQuartile[2]) {
          tmpVal = 'quart3'; tmpEvent.value = 'quart3';
        } else {
          tmpVal = 'quart4'; tmpEvent.value = 'quart4';
        }
        this.basicStatsForm.get('redzoneScoringCtrl')?.patchValue(tmpVal);
        this.redzoneChange(tmpEvent);

        if ((team.pointsTotal / team.games.length) < this.scoreQuartile[0]) {
          tmpVal = 'quart1'; tmpEvent.value = 'quart1';
        } else if (((team.pointsTotal / team.games.length) >= this.scoreQuartile[0] && (team.pointsTotal / team.games.length) < this.scoreQuartile[1])) {
          tmpVal = 'quart2'; tmpEvent.value = 'quart2';
        } else if (((team.pointsTotal / team.games.length) >= this.scoreQuartile[1] && (team.pointsTotal / team.games.length) < this.scoreQuartile[2])) {
          tmpVal = 'quart3'; tmpEvent.value = 'quart3';
        } else {
          tmpVal = 'quart4'; tmpEvent.value = 'quart4';
        }
        this.basicStatsForm.get('pointsCtrl')?.patchValue(tmpVal);
        this.pointsChange(tmpEvent);
      }
    })
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
        if ((team.pointsTotal / team.games.length) < this.scoreQuartile[0]) {
          tmpVal = 'crimson';
        } else if (((team.pointsTotal / team.games.length) >= this.scoreQuartile[0] && (team.pointsTotal / team.games.length) < this.scoreQuartile[1])) {
          tmpVal = 'orange';
        } else if (((team.pointsTotal / team.games.length) >= this.scoreQuartile[1] && (team.pointsTotal / team.games.length) < this.scoreQuartile[2])) {
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

  passAttemptChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.passAttempts.wins = 0;
      team.filterStats.passAttempts.losses = 0;
      team.filterAtsStats.passAttempts.wins = 0;
      team.filterAtsStats.passAttempts.losses = 0;
      team.filterAtsFavoritesStats.passAttempts.wins = 0;
      team.filterAtsFavoritesStats.passAttempts.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }
  passYardsChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.passYards.wins = 0;
      team.filterStats.passYards.losses = 0;
      team.filterAtsStats.passYards.wins = 0;
      team.filterAtsStats.passYards.losses = 0;
      team.filterAtsFavoritesStats.passYards.wins = 0;
      team.filterAtsFavoritesStats.passYards.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }
  passTdsChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.passTds.wins = 0;
      team.filterStats.passTds.losses = 0;
      team.filterAtsStats.passTds.wins = 0;
      team.filterAtsStats.passTds.losses = 0;
      team.filterAtsFavoritesStats.passTds.wins = 0;
      team.filterAtsFavoritesStats.passTds.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }
  rushAttemptsChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.rushAttempts.wins = 0;
      team.filterStats.rushAttempts.losses = 0;
      team.filterAtsStats.rushAttempts.wins = 0;
      team.filterAtsStats.rushAttempts.losses = 0;
      team.filterAtsFavoritesStats.rushAttempts.wins = 0;
      team.filterAtsFavoritesStats.rushAttempts.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }
  rushYardsChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.rushYards.wins = 0;
      team.filterStats.rushYards.losses = 0;
      team.filterAtsStats.rushYards.wins = 0;
      team.filterAtsStats.rushYards.losses = 0;
      team.filterAtsFavoritesStats.rushYards.wins = 0;
      team.filterAtsFavoritesStats.rushYards.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }
  rushTdsChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.rushTds.wins = 0;
      team.filterStats.rushTds.losses = 0;
      team.filterAtsStats.rushTds.wins = 0;
      team.filterAtsStats.rushTds.losses = 0;
      team.filterAtsFavoritesStats.rushTds.wins = 0;
      team.filterAtsFavoritesStats.rushTds.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }
  sacksChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.sacks.wins = 0;
      team.filterStats.sacks.losses = 0;
      team.filterAtsStats.sacks.wins = 0;
      team.filterAtsStats.sacks.losses = 0;
      team.filterAtsFavoritesStats.sacks.wins = 0;
      team.filterAtsFavoritesStats.sacks.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }
  interceptionsChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.interceptions.wins = 0;
      team.filterStats.interceptions.losses = 0;
      team.filterAtsStats.interceptions.wins = 0;
      team.filterAtsStats.interceptions.losses = 0;
      team.filterAtsFavoritesStats.interceptions.wins = 0;
      team.filterAtsFavoritesStats.interceptions.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }
  firstDownsChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.firstDowns.wins = 0;
      team.filterStats.firstDowns.losses = 0;
      team.filterAtsStats.firstDowns.wins = 0;
      team.filterAtsStats.firstDowns.losses = 0;
      team.filterAtsFavoritesStats.firstDowns.wins = 0;
      team.filterAtsFavoritesStats.firstDowns.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }

  thirdDownChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.thirdDown.wins = 0;
      team.filterStats.thirdDown.losses = 0;
      team.filterAtsStats.thirdDown.wins = 0;
      team.filterAtsStats.thirdDown.losses = 0;
      team.filterAtsFavoritesStats.thirdDown.wins = 0;
      team.filterAtsFavoritesStats.thirdDown.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }
  redzoneChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.redzone.wins = 0;
      team.filterStats.redzone.losses = 0;
      team.filterAtsStats.redzone.wins = 0;
      team.filterAtsStats.redzone.losses = 0;
      team.filterAtsFavoritesStats.redzone.wins = 0;
      team.filterAtsFavoritesStats.redzone.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }
  pointsChange(event: any) {
    this.httpService.allTeams.forEach(team => {
      team.filterStats.points.wins = 0;
      team.filterStats.points.losses = 0;
      team.filterAtsStats.points.wins = 0;
      team.filterAtsStats.points.losses = 0;
      team.filterAtsFavoritesStats.points.wins = 0;
      team.filterAtsFavoritesStats.points.losses = 0;
    });
    switch (event.value) {
      case 'quart1': {
        this.httpService.allTeams.forEach(team => {
          team.games.forEach(game => {
            if (game.pointsGiven < this.scoreQuartile[0]) {
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
        })
        break;
      }
      case 'quart2': {
        this.httpService.allTeams.forEach(team => {
          team.games.forEach(game => {
            if ((game.pointsGiven >= this.scoreQuartile[0]) && (game.pointsGiven <= this.scoreQuartile[1])) {
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
        })
        break;
      }
      case 'quart3': {
        this.httpService.allTeams.forEach(team => {
          team.games.forEach(game => {
            if (game.pointsGiven > this.scoreQuartile[1] && game.pointsGiven <= this.scoreQuartile[2]) {
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
        })
        break;
      }
      case 'quart4': {
        this.httpService.allTeams.forEach(team => {
          team.games.forEach(game => {
            if (game.pointsGiven > this.scoreQuartile[2]) {
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
        })
        break;
      }
    }
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }

  checkTabStatus(): boolean {
    if (this.crunchStatus === 'Processed' && this.currentDownloadCounterPostMsg === '') {
      return false;
    } else {
      return true;
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
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.wins < b.wins ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.wins > b.wins ? -1 : 1)));
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

  crunchNumbers() {
    this.crunchStatus = 'Pending';
    this.httpService.getNextOpponentInfo();
    this.httpService.crunchTotals();
    this.httpService.calculateWinLossRecord();
    this.httpService.setOpponentStats();
    this.httpService.setupGivenData();
    this.runQuartiles();
    this.dataSource = new MatTableDataSource(this.httpService.allTeams);
    this.dataSource.sort = this.sort;
  }

  downloadLastYear() {
    this.currentDownloadCounter++;
    this.currentDownloadCounterPostMsg = ' ...Currently Downloading...';
    this.httpService.executeDataHydrationLastYear();
  }

  downloadLastYear2() {
    this.currentDownloadCounter++;
    this.currentDownloadCounterPostMsg = ' ...Currently Downloading...';
    this.httpService.executeDataHydrationThisYear();
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  runQuartiles() {
    let tmpTotalArr: number[] = [];
    this.httpService.allTeams.forEach(team => {
      tmpTotalArr.push(team.pointsTotal / team.games.length);
    })
    this.scoreQuartile = this.calculateQuartiles(tmpTotalArr);
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
}
