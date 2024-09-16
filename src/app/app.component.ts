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
  displayedColumns = ['teamName', 'games', 'passingAttempts', 'passingYards', 'passingTds', 'rushingAttempts', 'rushingYards', 'rushingTDs', 'sacks', 'interceptions', 'firstDowns', 'thirdDownPct', 'redzoneScoringPct', 'points'];
  dataSource: MatTableDataSource<Team>;
  // @ViewChild(MatPaginator) paginator: MatPaginator;
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
      // this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  ngOnDestroy(): void {
  }

  ngAfterViewInit(): void {
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
      return false;
    } else {
      return true;
    }
  }

  toggleAvgTotalStatus(event: any) {
    if (event.checked) {
      this.totalAvgToggle = 'Average';
    } else {
      this.totalAvgToggle = 'Total';
    }
  }

  calculateAverage(numVal: number, teamId: string): number {
    this.httpService.allTeams.find(team => {
      if (team.teamId === teamId) {
        return numVal / team.games.length;
      }
    });
    return -1;
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
}
