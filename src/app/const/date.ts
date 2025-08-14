import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  week1 = new Date('2025-09-4');
  week2 = new Date('2025-09-9');
  week3 = new Date('2025-09-16');
  week4 = new Date('2025-09-23');
  week5 = new Date('2025-09-30');
  week6 = new Date('2025-10-07');
  week7 = new Date('2025-10-14');
  week8 = new Date('2025-10-21');
  week9 = new Date('2025-10-28');
  week10 = new Date('2025-11-04');
  week11 = new Date('2025-11-11');
  week12 = new Date('2025-11-18');
  week13 = new Date('2025-11-25');
  week14 = new Date('2025-12-02');
  week15 = new Date('2025-12-09');
  week16 = new Date('2025-12-16');
  week17 = new Date('2025-12-23');
  week18 = new Date('2026-01-01');
  week19 = new Date('2026-01-06');
  endOfSeason = new Date('2026-02-08');
  lastYearWeek1 = new Date('2024-09-4');
  lastYearWeek2 = new Date('2024-09-11');
  lastYearWeek3 = new Date('2024-09-18');
  lastYearWeek4 = new Date('2024-09-25');
  lastYearWeek5 = new Date('2024-10-02');
  lastYearWeek6 = new Date('2024-10-09');
  lastYearWeek7 = new Date('2024-10-16');
  lastYearWeek8 = new Date('2024-10-23');
  lastYearWeek9 = new Date('2024-10-30');
  lastYearWeek10 = new Date('2024-11-06');
  lastYearWeek11 = new Date('2024-11-13');
  lastYearWeek12 = new Date('2024-11-20');
  lastYearWeek13 = new Date('2024-11-27');
  lastYearWeek14 = new Date('2024-12-04');
  lastYearWeek15 = new Date('2024-12-11');
  lastYearWeek16 = new Date('2024-12-18');
  lastYearWeek17 = new Date('2024-12-25');
  lastYearWeek18 = new Date('2025-01-01');
  lastYearEndOfSeason = new Date('2025-02-08');

  private _currentWeek = 1;
  private _currentLastYearWeek = new Date();
  private _currentLastYearWeek2 = new Date();
  private _currentLastYearWeekNum = new Date();

  public get currentLastYearWeek2() {
    return this._currentLastYearWeek2;
  }
  public set currentLastYearWeek2(value) {
    this._currentLastYearWeek2 = value;
  }

  public get currentLastYearWeekNum() {
    return this._currentLastYearWeekNum;
  }
  public set currentLastYearWeekNum(value) {
    this._currentLastYearWeekNum = value;
  }

  public get currentLastYearWeek() {
    return this._currentLastYearWeek;
  }
  public set currentLastYearWeek(value) {
    this._currentLastYearWeek = value;
  }

  public get currentWeek() {
    return this._currentWeek;
  }
  public set currentWeek(value) {
    this._currentWeek = value;
  }
  constructor(
  ) {
  }

  setLastYearWeek(lastYearWeek: number) {
    switch (lastYearWeek) {
      case 1: {
        this.currentLastYearWeek = this.lastYearWeek1;
        return;
      }
      case 2: {
        this.currentLastYearWeek = this.lastYearWeek2;
        return;
      }
      case 3: {
        this.currentLastYearWeek = this.lastYearWeek3;
        return;
      }
      case 4: {
        this.currentLastYearWeek = this.lastYearWeek4;
        return;
      }
      case 5: {
        this.currentLastYearWeek = this.lastYearWeek5;
        return;
      }
      case 6: {
        this.currentLastYearWeek = this.lastYearWeek6;
        return;
      }
      case 7: {
        this.currentLastYearWeek = this.lastYearWeek7;
        return;
      }
      case 8: {
        this.currentLastYearWeek = this.lastYearWeek8;
        return;
      }
      case 9: {
        this.currentLastYearWeek = this.lastYearWeek9;
        return;
      }
      case 10: {
        this.currentLastYearWeek = this.lastYearWeek10;
        return;
      }
      case 11: {
        this.currentLastYearWeek = this.lastYearWeek11;
        return;
      }
      case 12: {
        this.currentLastYearWeek = this.lastYearWeek12;
        return;
      }
      case 13: {
        this.currentLastYearWeek = this.lastYearWeek13;
        return;
      }
      case 14: {
        this.currentLastYearWeek = this.lastYearWeek14;
        return;
      }
      case 15: {
        this.currentLastYearWeek = this.lastYearWeek15;
        return;
      }
      case 16: {
        this.currentLastYearWeek = this.lastYearWeek16;
        return;
      }
      case 17: {
        this.currentLastYearWeek = this.lastYearWeek17;
        return;
      }
      case 18: {
        this.currentLastYearWeek = this.lastYearWeek18;
        return;
      }
    }
  }

   setLastYearWeekNext(lastYearWeek: number) {
    switch (lastYearWeek) {
      case 1: {
        this.currentLastYearWeek2 = this.lastYearWeek1;
        return;
      }
      case 2: {
        this.currentLastYearWeek2 = this.lastYearWeek2;
        return;
      }
      case 3: {
        this.currentLastYearWeek2 = this.lastYearWeek3;
        return;
      }
      case 4: {
        this.currentLastYearWeek2 = this.lastYearWeek4;
        return;
      }
      case 5: {
        this.currentLastYearWeek2 = this.lastYearWeek5;
        return;
      }
      case 6: {
        this.currentLastYearWeek2 = this.lastYearWeek6;
        return;
      }
      case 7: {
        this.currentLastYearWeek2 = this.lastYearWeek7;
        return;
      }
      case 8: {
        this.currentLastYearWeek2 = this.lastYearWeek8;
        return;
      }
      case 9: {
        this.currentLastYearWeek2 = this.lastYearWeek9;
        return;
      }
      case 10: {
        this.currentLastYearWeek2 = this.lastYearWeek10;
        return;
      }
      case 11: {
        this.currentLastYearWeek2 = this.lastYearWeek11;
        return;
      }
      case 12: {
        this.currentLastYearWeek2 = this.lastYearWeek12;
        return;
      }
      case 13: {
        this.currentLastYearWeek2 = this.lastYearWeek13;
        return;
      }
      case 14: {
        this.currentLastYearWeek2 = this.lastYearWeek14;
        return;
      }
      case 15: {
        this.currentLastYearWeek2 = this.lastYearWeek15;
        return;
      }
      case 16: {
        this.currentLastYearWeek2 = this.lastYearWeek16;
        return;
      }
      case 17: {
        this.currentLastYearWeek2 = this.lastYearWeek17;
        return;
      }
      case 18: {
        this.currentLastYearWeek2 = this.lastYearWeek18;
        return;
      }
    }
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
    } else if (todayDate >= this.week18 && todayDate < this.week19) {
      this.currentWeek = 18;
    } else if (todayDate >= this.week19 && todayDate < this.endOfSeason) {
      this.currentWeek = 19;
    }
  }
}
