import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';

import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';


@Component({
  selector: 'page-bf-history-modal',
  templateUrl: 'bf-history-modal.html',
})
export class BfHistoryModalPage {
  historyArray: any = [];
  lifoHistoryArray: any = [];

  todayHistoryArray: any = [];
  yesterdayHistoryArray: any = [];
  moreHistoryArray: any = [];
  lastweekHistoryArray: any = [];
  moreDateArray: any = [];
  lastMonthHistoryArray: any = [];

  // boolean flags
  hasToday: boolean;
  hasYesterday: boolean;
  hasLastWeek: boolean;
  hasLastMonth: boolean;
  hasMore: boolean;

  dateDistanceArray: any = [];
  indexCounter: number;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private view: ViewController,
    private db: DatabaseProvider,
    private ft: FormattedTodayProvider) {
    this.historyArray = this.db.bfHistoryArray;
    this.indexCounter = 0;
    this.hasToday = false;
    this.hasYesterday = false;
    this.hasLastWeek = false;
    this.hasLastMonth = false;
    this.hasMore = false;
    this.lifoHistory();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BfHistoryModalPage');
  }

  lifoHistory(){
    let todayTemp = this.ft.getToday();
    let today = this.ft.getTodayMonthFirst(todayTemp);
    let todayMoment = moment(today);

    console.log("BF: TODAY IS:", today);
    console.log("BF: TODAY MOMENT IS:", todayMoment);

    for(let v of this.historyArray){
      this.lifoHistoryArray.unshift(v);
    };

    for(let x of this.lifoHistoryArray){
      console.log("X is:", x);
      let entryDate = this.ft.getDateFromDateTime(x.date);
      //let entryTime = this.ft.getTimeFromDateTime(x.time);
      let entryDateMoment = moment(entryDate);

      // Check for am pm and convert if necessary
      let pm = false;
      let am = false;
      let xSplitTimeArray = x.time.split(':');

      // Check if pm
      if(xSplitTimeArray[0] < 12){
        am = true;
      } else {
        pm = true;
      };

      let timeString: any;
      if(pm = true){
        let hour = this.ft.convertToStandardTime(xSplitTimeArray);
        timeString = hour + ':' + xSplitTimeArray[1] + ':' + xSplitTimeArray[2] + ' PM';
      } else {
        timeString = xSplitTimeArray[0] + ':' + xSplitTimeArray[1] + ':' + xSplitTimeArray[2] + ' AM';
      };

      // Convert duration
      console.log("Duration is:", x.duration);
      let minutes = Math.floor(x.duration / 60);
      let seconds =  x.duration % 60;

      let durationString: any;

      if(minutes == 0){
        durationString = seconds + ' secs';
      } else {
        durationString = minutes + ' mins ' + seconds + ' secs';
      };

      // Combine date, time, breast, duration
      let outputString = '@' + timeString + ', '+ x.breast + ', for ' + durationString;

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
          };
          // Last 7 days
          if(todayMoment.diff(entryDateMoment, 'days') <= 7){
            let outputStringWithDate = entryDate + outputString;
            this.lastweekHistoryArray.push(outputStringWithDate);
            this.hasLastWeek = true;
          };
        }
        if(todayMoment.diff(entryDateMoment, 'months') <= 1){
          let outputStringWithDate = entryDate + outputString;
          this.lastMonthHistoryArray.push(outputStringWithDate);
          this.hasLastMonth = true;
        };
        let outputStringWithDate = entryDate + outputString;
        this.moreHistoryArray.push(outputStringWithDate);
        this.hasMore = true;
      }
    };
  }

  splitAndCheckDate(entry : string, index : number){
    // Split the string using space as delimiter
    let splittedEntry = entry.split(' ');
    // Split the date: elements => 0: date, 2: time, 5: left or right breast
    let entryDate = splittedEntry[0].split('-');

    // Get todays date
    let todayYearFirst = this.ft.getToday();
    let todayMonthFirst = this.ft.getTodayMonthFirst(todayYearFirst);
    let splittedToday = todayMonthFirst.split('-');

    // Calculate the entries' date distance. Once done then store the distance
    // in reference to its index number.
    this.calculateDateDistance(entryDate, splittedToday).then((days) => {
      console.log("Days return after calculations:", days);
    });

  }

  calculateDateDistance(entryDate : any, today : any) : any {
    return new Promise(resolve => {
      // Calculate distance of each date and store into array
      let monthDistance = Math.abs(Number(entryDate[0]) - Number(today[0]));
      let dayDistance = Math.abs(Number(entryDate[1]) - Number(today[1]));
      let yearDistance = Math.abs(Number(entryDate[2]) - Number(today[2]));

      // DEBUG: checking the dates distance for correctness
      console.log("EntryDate:", entryDate);
      console.log("SplittedToday:", today);
      console.log("Found distance month:", monthDistance);
      console.log("Found distance day:", dayDistance);
      console.log("Found distance year:", yearDistance);
      //resolve(days);

      // let daysDistance = Math.abs(
      //   Math(monthDistance *) +
      // );
      resolve(true);
    });
  }

  cancelModal(){
    this.view.dismiss();
  }

}
