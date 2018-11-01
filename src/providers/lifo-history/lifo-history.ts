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

    // NOTE: new activities need to be added here!!!!

    if(activity == 'bottlefeeding'){
      this.historyArray = this.db.bottleHistoryArray;
    } else if(activity == 'diapering'){
      this.historyArray = this.db.diaperingHistoryArray;
    } else if(activity == 'meal'){
      this.historyArray = this.db.mealHistoryArray;
    } else if(activity == 'sleeping'){
      this.historyArray = this.db.sleepingHistoryArray;
    } else if(activity == 'breastfeeding'){
      this.historyArray = this.db.bfHistoryArray;
    }


    // DEBUG: Leave this for debugging
    console.log("DEBUGGING: this history array for <", activity, "> in lifo is:", this.historyArray);

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

      // IF activity is bottlefeeding
      let outputString: any;
      let durationString = this.convertDuration(x.duration);

      if(activity == 'bottlefeeding'){
        if(x.duration) {
          outputString = timeString + ', ' + x.type + ', ' + x.volume + ' ' + x.unit + ', ' + durationString;
        } else {
          outputString = timeString + ', ' + x.type + ', ' + x.volume + ' ' + x.unit;
        };
      } else if(activity == 'diapering'){
        outputString = timeString + ', ' + x.type
      } else if(activity == 'meal'){
        outputString = timeString;
      } else if(activity == 'sleeping'){
        if(typeof x.duration == "string"){
          outputString = timeString + ', for ' + x.duration;
        } else {
          outputString = timeString + ', for ' + durationString;
        };
      } else if(activity == 'breastfeeding'){
        outputString = timeString + ', '+ x.breast + ', for ' + durationString;
      }


      // Group the activity by days
      if(todayMoment.diff(entryDateMoment, 'years') == 0){
        if(todayMoment.diff(entryDateMoment, 'months') == 0){
          // Todays
          if(todayMoment.diff(entryDateMoment, 'days') == 0){
            let tempToday: any;
            if(x.note){
              if((x.activity == "bottlefeeding") || (x.activity == "sleeping") || (x.activity == "diapering")){
                tempToday = {
                  note: x.note.note,
                  time: timeString,
                  activity: x.activity,
                  output: outputString
                }
              } else {
                tempToday = {
                  note: x.note,
                  time: timeString,
                  activity: x.activity,
                  output: outputString
                }
              };
            } else {
              tempToday = {
                activity: x.activity,
                time: timeString,
                output: outputString
              };
            };

            this.todayHistoryArray.push(tempToday);
            this.hasToday = true;
          }
          // Yesterdays
          else if(todayMoment.diff(entryDateMoment, 'days') == 1){
            let tempYesterday = {
              activity: x.activity,
              time: timeString,
              output: outputString
            };
            this.yesterdayHistoryArray.push(tempYesterday);
            this.hasYesterday = true;
          }
          else {
            let outputStringWithDate = entryDate + outputString;

            let temp = {
              date: entryDate,
              dateTime: x.date,
              activity: x.activity,
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
            dateTime: x.date,
            activity: x.activity,
            output: outputString
          };

          this.moreHistoryArray.push(temp);
          this.hasMore = true;
        };
      } else {
        let outputStringWithDate = entryDate + outputString;

        let temp = {
          date: entryDate,
          dateTime: x.date,
          activity: x.activity,
          output: outputString
        };

        this.moreHistoryArray.push(temp);
        this.hasMore = true;
      }
    };
    resolve(true);
    });
  }

  convertDuration(duration: any){
    // Convert duration
    let seconds = duration;
    let days = Math.floor(seconds / (3600*24));
    seconds -= days*3600*24;
    let hours = Math.floor(seconds / 3600);
    seconds -= hours*3600;
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes*60;

    let durationString: any = "";

    if (days > 0){
      if (days <= 1){
        durationString += days + ' day' + ' ';
      } else {
        durationString += days + ' days' + ' ';
      };
    }
    if (hours > 0){
      if (hours <= 1){
        durationString += hours + ' hr' + ' ';
      } else {
        durationString += hours + ' hrs' + ' ';
      };
    }
    if(minutes > 0){
      if (hours <= 1){
        durationString += minutes + ' min' + ' ';
      } else {
        durationString += minutes + ' mins' + ' ';
      };
    }
    if(seconds > 0) {
      if (seconds <= 1){
        durationString += seconds + ' sec' + ' ';
      } else {
        durationString += seconds + ' secs' + ' ';
      };
    };
    return durationString;
  }
}
