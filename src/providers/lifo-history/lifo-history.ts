import { Injectable } from '@angular/core';
import { DatabaseProvider } from '../database/database';
import { FormattedTodayProvider} from '../formatted-today/formatted-today';

import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';


@Injectable()
export class LifoHistoryProvider {
  historyArray: any;
  lifoHistoryArray:any;

  todayHistoryArray: any;
  yesterdayHistoryArray: any;
  moreHistoryArray: any;
  lastweekHistoryArray: any;
  moreDateArray: any;
  groupedMoreDateArray: any;
  lastMonthHistoryArray: any;

  // boolean flags
  hasToday: boolean;
  hasYesterday: boolean;
  hasLastWeek: boolean;
  hasLastMonth: boolean;
  hasMore: boolean;

  dateDistanceArray: any = [];
  indexCounter: number;
  lastWeekCounter: number;

  constructor(
    private db: DatabaseProvider,
    private ft: FormattedTodayProvider) {
    this.init().then(() => {
    });
  }

  init(){
    return new Promise(resolve => {
      this.historyArray = [];
      this.lifoHistoryArray = [];

      this.todayHistoryArray = [];
      this.yesterdayHistoryArray = [];
      this.moreHistoryArray = [];
      this.lastweekHistoryArray = [];
      this.moreDateArray = [];
      this.lastMonthHistoryArray = [];
      this.groupedMoreDateArray = [];

      this.indexCounter = 0;
      this.hasToday = false;
      this.hasYesterday = false;
      this.hasLastWeek = false;
      this.hasLastMonth = false;
      this.hasMore = false;
    //this.laskWeekCounter = 0;
      //resolve(this.lifoHistory());
      resolve(true);
    });
  }

  lifoHistory(activity : any){
    return new Promise(resolve => {
    let todayTemp = this.ft.getToday();
    let today = this.ft.getTodayMonthFirst(todayTemp);
    let todayMoment = moment(today);

    if(activity == 'bottlefeeding'){
      this.historyArray = this.db.bottleHistoryArray;
    } else if(activity == 'diapering'){
      this.historyArray = this.db.diaperingHistoryArray;
    }

    for(let v of this.historyArray){
      this.lifoHistoryArray.unshift(v);
    };

    for(let x of this.lifoHistoryArray){
      let entryDate = this.ft.getDateFromDateTime(x.date);
      let entryDateMoment = moment(entryDate);

      // Check for am pm and convert if necessary
      let pm = false;
      let am = false;
      let xSplitTimeArray = x.time.split(':');

      let splitHour = Number(xSplitTimeArray[0]);
      // Check if pm
      if(splitHour >= 12){
        pm = true;
      } else {
        am = true;
      };

      let timeString: any;
      if(pm == true){
        let hour = this.ft.convertToStandardTime(xSplitTimeArray);
        timeString = hour + ':' + xSplitTimeArray[1] + ':' + xSplitTimeArray[2] + ' PM';
      } else {
        if(xSplitTimeArray[0] == '00'){
          xSplitTimeArray[0] = this.ft.convertToStandardTime(xSplitTimeArray);
        };
        timeString = xSplitTimeArray[0] + ':' + xSplitTimeArray[1] + ':' + xSplitTimeArray[2] + ' AM';
      };

      // Convert duration
      let minutes = Math.floor(x.duration / 60);
      let seconds =  x.duration % 60;

      let durationString: any;

      if(minutes == 0){
        durationString = seconds + ' secs';
      } else {
        durationString = minutes + ' mins ' + seconds + ' secs';
      };

      let outputString: any;

      // IF activity is bottlefeeding
      if(activity == 'bottlefeeding'){
        if(x.note){
          outputString = '@' + timeString + ', ' + x.type + ', ' + x.volume + ' ' + x.unit + ', ' + durationString + ', Note: ' + x.note.note;
        } else {
          outputString = '@' + timeString + ', ' + x.type + ', ' + x.volume + ' ' + x.unit + ', ' + durationString;
        };
      } else if(activity == 'diapering'){
          if(x.note){
            outputString = '@' + timeString + ', ' + x.type + ', ' + 'Note: ' + x.note.note;
          } else {
            outputString = '@' + timeString + ', ' + x.type
         };
      }


      // Group the activity by days
      if(todayMoment.diff(entryDateMoment, 'years') == 0){
        if(todayMoment.diff(entryDateMoment, 'months') == 0){
          // Todays
          if(todayMoment.diff(entryDateMoment, 'days') == 0){
            this.todayHistoryArray.push(outputString);
            this.hasToday = true;
          }
          // Yesterdays
          else if(todayMoment.diff(entryDateMoment, 'days') == 1){
            this.yesterdayHistoryArray.push(outputString);
            this.hasYesterday = true;
          }
          else {
            let outputStringWithDate = entryDate + outputString;

            let temp = {
              date: entryDate,
              output: outputString
            };

            this.moreHistoryArray.push(temp);
            this.hasMore = true;
          };
        }
        else {
          let outputStringWithDate = entryDate + outputString;

          let temp = {
            date: entryDate,
            output: outputString
          };

          this.moreHistoryArray.push(temp);
          this.hasMore = true;
        };
      } else {
        let outputStringWithDate = entryDate + outputString;

        let temp = {
          date: entryDate,
          output: outputString
        };

        this.moreHistoryArray.push(temp);
        this.hasMore = true;
      }
    };
    resolve(true);
    });
  }

}