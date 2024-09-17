import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RouterOutlet } from '@angular/router';

import { DateService } from './const/date';
import { MaterialModule } from './material.module';
import { Team } from './model/interface';
import { HttpService } from './services/http.service';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule, ReactiveFormsModule, MaterialModule, HttpClientModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'nfl-year-three';
  currentDownloadCounter = 0;
  currentDownloadCounterPostMsg = ' - DOWNLOAD REQUIRED';
  crunchStatus = 'Initial';
  currentWeek: number = 0;
  totalAvgToggle = 'Total';
  displayedColumns = ['teamName', 'games', 'passingAttempts', 'passingYards', 'passingTds', 'rushingAttempts', 'rushingYards',
    'rushingTds',
    'sacks', 'interceptions', 'firstDowns', 'thirdDownPct', 'redzoneScoringPct', 'points'];
  dataSource: MatTableDataSource<Team>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(
    private dateService: DateService,
    private httpService: HttpService
  ) {
    // this.dataSource = new MatTableDataSource(this.httpService.allTeams);
  }

  ngOnInit(): void {
    this.dateService.initializeStaticDates();
    this.currentWeek = this.dateService.currentWeek;
    console.log("🚀 ~ this.currentWeek:", this.currentWeek);
    this.httpService.updateDownloadStatus.subscribe(payload => {
      this.currentDownloadCounter = payload;
      this.currentDownloadCounterPostMsg = '';
    });
    this.httpService.updateAggregatingData.subscribe(payload => {
      this.crunchStatus = 'Processed';
    });
    this.httpService.updateTotalData.subscribe(payload => {
      this.dataSource = new MatTableDataSource(this.httpService.allTeams);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  ngOnDestroy(): void {
  }

  ngAfterViewInit(): void {
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
    if (this.crunchStatus === 'Processed' || this.currentDownloadCounterPostMsg === ' - DOWNLOAD REQUIRED') {
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
  sortColumn(event: any) {
    switch (event.active) {
      case 'teamName': {
        if (event.direction === "asc") {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.teamName < b.teamName ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.teamName > b.teamName ? -1 : 1)));
        }
        break;
      }
      case 'passingAttempts': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsTotal/a.games.length < b.passingAttemptsTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsTotal/a.games.length > b.passingAttemptsTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsTotal/a.games.length < b.passingYardsTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsTotal/a.games.length > b.passingYardsTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsTotal/a.games.length < b.passingTdsTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsTotal/a.games.length > b.passingTdsTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsTotal/a.games.length < b.rushingAttemptsTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsTotal/a.games.length > b.rushingAttemptsTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsTotal/a.games.length < b.rushingYardsTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsTotal/a.games.length > b.rushingYardsTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsTotal/a.games.length < b.rushingTdsTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsTotal/a.games.length > b.rushingTdsTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksTotal/a.games.length < b.sacksTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksTotal/a.games.length > b.sacksTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsTotal/a.games.length < b.interceptionsTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsTotal/a.games.length > b.interceptionsTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsTotal/a.games.length < b.firstDownsTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsTotal/a.games.length > b.firstDownsTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsTotal/a.games.length < b.pointsTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsTotal/a.games.length > b.pointsTotal/b.games.length ? -1 : 1)));
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
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.teamName < b.teamName ? -1 : 1)));
        } else if (event.direction === 'desc') {
          this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.teamName > b.teamName ? -1 : 1)));
        }
        break;
      }
      case 'passingAttempts': {
        if (this.totalAvgToggle === 'Average') {
          if (event.direction === "asc") {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsGivenTotal/a.games.length < b.passingAttemptsGivenTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingAttemptsGivenTotal/a.games.length > b.passingAttemptsGivenTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsGivenTotal/a.games.length < b.passingYardsGivenTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingYardsGivenTotal/a.games.length > b.passingYardsGivenTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsGivenTotal/a.games.length < b.passingTdsGivenTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.passingTdsGivenTotal/a.games.length > b.passingTdsGivenTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsGivenTotal/a.games.length < b.rushingAttemptsGivenTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingAttemptsGivenTotal/a.games.length > b.rushingAttemptsGivenTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsGivenTotal/a.games.length < b.rushingYardsGivenTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingYardsGivenTotal/a.games.length > b.rushingYardsGivenTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsGivenTotal/a.games.length < b.rushingTdsGivenTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.rushingTdsGivenTotal/a.games.length > b.rushingTdsGivenTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksGivenTotal/a.games.length < b.sacksGivenTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.sacksGivenTotal/a.games.length > b.sacksGivenTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsGivenTotal/a.games.length < b.interceptionsGivenTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.interceptionsGivenTotal/a.games.length > b.interceptionsGivenTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsGivenTotal/a.games.length < b.firstDownsGivenTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.firstDownsGivenTotal/a.games.length > b.firstDownsGivenTotal/b.games.length ? -1 : 1)));
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
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsGivenTotal/a.games.length < b.pointsGivenTotal/b.games.length ? -1 : 1)));
          } else if (event.direction === 'desc') {
            this.dataSource = new MatTableDataSource(this.httpService.allTeams.sort((a, b) => (a.pointsGivenTotal/a.games.length > b.pointsGivenTotal/b.games.length ? -1 : 1)));
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
    this.httpService.crunchGivenStats();
    this.httpService.crunchTotals();
  }

  downloadLastYear() {
    this.currentDownloadCounter++;
    this.currentDownloadCounterPostMsg = ' ...Currently Downloading...';
    this.httpService.executeDataHydration();
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  returnCellColor(inputVal: number, inputType: string) {
    let tmpTotalArr: number[] = [];
    let tmpQuartiles;
    switch(inputType) {
      case 'passingAttemptsTotal': {
        this.httpService.allTeams.forEach( team => {
          tmpTotalArr.push(team.passingAttemptsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingYardsTotal': {
        this.httpService.allTeams.forEach( team => {
          tmpTotalArr.push(team.passingYardsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'passingTdsTotal': {
        this.httpService.allTeams.forEach( team => {
          tmpTotalArr.push(team.passingTdsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingAttemptsTotal': {
        this.httpService.allTeams.forEach( team => {
          tmpTotalArr.push(team.rushingAttemptsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingYardsTotal': {
        this.httpService.allTeams.forEach( team => {
          tmpTotalArr.push(team.rushingYardsTotal);
        })
        tmpQuartiles = this.calculateQuartiles(tmpTotalArr);
        break;
      }
      case 'rushingTdsTotal': {
        this.httpService.allTeams.forEach( team => {
          tmpTotalArr.push(team.rushingTdsTotal);
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
}
