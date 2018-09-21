import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';


@Injectable()
export class FormattedTodayProvider {

  constructor(private datePipe: DatePipe) {

  }

  getToday() : any{
    let todayUnformatted = new Date();
    let today = this.datePipe.transform(todayUnformatted, 'yyyy-MM-dd');
    // console.log("today ", today);
    let splitToday = today.split('-');
    // console.log("FormattedToday::getToday(): today is :", splitToday);
    return splitToday;
  }

  getTodayMonthFirst(today : any) : any {
    let todayString = today[1] + "-" + today[2] + "-" + today[0];
    console.log("FormattedToday::getTodayMonthFirst(): today is:", todayString);
    return todayString;
  }
}
