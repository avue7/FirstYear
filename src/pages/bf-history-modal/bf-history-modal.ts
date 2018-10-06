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

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private view: ViewController,
    private db: DatabaseProvider,
    private ft: FormattedTodayProvider) {
    this.init().then(() => {
      this.lifoHistory();
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
      resolve(true);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BfHistoryModalPage');
  }

  ionViewWillLeave(){
    //this.init();
  }

  lifoHistory(){
    let todayTemp = this.ft.getToday();
    let today = this.ft.getTodayMonthFirst(todayTemp);
    let todayMoment = moment(today);

    this.historyArray = this.db.bfHistoryArray;
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
  }

  cancelModal(){
    this.view.dismiss();
  }

}
