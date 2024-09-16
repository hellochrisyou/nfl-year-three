import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  week1 = new Date('2024-09-5');
  week2 = new Date('2024-09-11');
  week3 = new Date('2024-09-18');
  week4 = new Date('2024-09-25');
  week5 = new Date('2024-10-02');
  week6 = new Date('2024-10-09');
  week7 = new Date('2024-10-16');
  week8 = new Date('2024-10-23');
  week9 = new Date('2024-10-30');
  week10 = new Date('2024-11-06');
  week11 = new Date('2024-11-13');
  week12 = new Date('2024-11-20');
  week13 = new Date('2024-11-27');
  week14 = new Date('2024-12-04');
  week15 = new Date('2024-12-11');
  week16 = new Date('2024-12-18');
  week17 = new Date('2024-12-25');
  week18 = new Date('2024-01-01');
  endOfSeason = new Date('2024-01-08');

  private _currentWeek = 1;

  public get currentWeek() {
    return this._currentWeek;
  }
  public set currentWeek(value) {
    this._currentWeek = value;
  }
  constructor(
  ) {
  }
  isCurrentWeek(weekInput: Date): boolean {
    if (this.currentWeek === 5) {
      if (weekInput > this.week5 && weekInput < this.week6) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek === 6) {
      if (weekInput >= this.week6 && weekInput < this.week7) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek <= 7) {
      if (weekInput >= this.week7 && weekInput < this.week8) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek <= 8) {
      if (weekInput >= this.week8 && weekInput < this.week9) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek <= 9) {
      if (weekInput >= this.week9 && weekInput < this.week10) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek <= 10) {
      if (weekInput > this.week10 && weekInput < this.week11) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek <= 11) {
      if (weekInput > this.week11 && weekInput < this.week12) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek <= 12) {
      if (weekInput >= this.week12 && weekInput < this.week13) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek <= 13) {
      if (weekInput >= this.week13 && weekInput < this.week14) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek <= 14) {
      if (weekInput >= this.week14 && weekInput < this.week15) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek <= 15) {
      if (weekInput >= this.week15 && weekInput < this.week16) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek <= 16) {
      if (weekInput >= this.week16 && weekInput < this.week17) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek <= 17) {
      if (weekInput >= this.week17 && weekInput < this.week18) {
        return true;
      } else {
        return false;
      }
    }else if (this.currentWeek === 18) {
      if (weekInput >= this.week18) {
        return true;
      } else {
        return false;
      }
    }
    return false;;
  }

  initializeStaticDates(): void {
    const todayDate = new Date();
    if (todayDate >= this.week1 && todayDate < this.week2) {
      this.currentWeek = 1;
    } else if (todayDate >= this.week2 && todayDate < this.week3) {
      this.currentWeek = 2;
    } else if (todayDate >= this.week3 && todayDate < this.week4) {
      this.currentWeek = 3;
    } else if (todayDate >= this.week4 && todayDate < this.week5) {
      this.currentWeek = 4;
    } else if (todayDate >= this.week5 && todayDate < this.week6) {
      this.currentWeek = 5;
    } else if (todayDate >= this.week6 && todayDate < this.week7) {
      this.currentWeek = 6;
    } else if (todayDate >= this.week7 && todayDate < this.week8) {
      this.currentWeek = 7;
    } else if (todayDate >= this.week8 && todayDate < this.week9) {
      this.currentWeek = 8;
    } else if (todayDate >= this.week9 && todayDate < this.week10) {
      this.currentWeek = 9;
    } else if (todayDate >= this.week10 && todayDate < this.week11) {
      this.currentWeek = 10;
    } else if (todayDate >= this.week11 && todayDate < this.week12) {
      this.currentWeek = 11;
    } else if (todayDate >= this.week12 && todayDate < this.week13) {
      this.currentWeek = 12;
    } else if (todayDate >= this.week13 && todayDate < this.week14) {
      this.currentWeek = 13;
    } else if (todayDate >= this.week14 && todayDate < this.week15) {
      this.currentWeek = 14;
    } else if (todayDate >= this.week15 && todayDate < this.week16) {
      this.currentWeek = 15;
    } else if (todayDate >= this.week16 && todayDate < this.week17) {
      this.currentWeek = 16;
    } else if (todayDate >= this.week17 && todayDate < this.week18) {
      this.currentWeek = 17;
    } else if (todayDate >= this.week18 && todayDate < this.endOfSeason) {
      this.currentWeek = 18;
    }
  }
}
