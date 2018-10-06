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

      console.log("xSplitTimeArray", xSplitTimeArray);

      console.log("Number split:", Number(xSplitTimeArray[0]));

      let splitHour = Number(xSplitTimeArray[0]);
      // Check if pm
      if(splitHour >= 12){
        pm = true;
        console.log("PM IS SET")
      } else {
        am = true;
        console.log("AM IS SET");
      };

      let timeString: any;
      if(pm == true){
        let hour = this.ft.convertToStandardTime(xSplitTimeArray);
        timeString = hour + ':' + xSplitTimeArray[1] + ':' + xSplitTimeArray[2] + ' PM';
      } else {
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
        }
        else {
          let outputStringWithDate = entryDate + outputString;

          let temp = {
            date: entryDate,
            output: outputString
          };

          this.moreHistoryArray.push(temp);
          this.hasMore = true;
          // this.groupHistory(entryDate, outputString).then(() => {
          //   this.hasMore = true;
          // });
        };
      } //else {
        // let outputStringWithDate = entryDate + outputString;
        // this.moreHistoryArray.push(outputStringWithDate);
        // this.hasMore = true;
      //};
    };
    //Testing
    for(let x of this.moreHistoryArray){
      console.log("DADADSADAS: ", x);//Object.keys(x));
    }
    console.log("DADADSADAS: ", this.moreHistoryArray);

    // this.groupHistory().then(() => {
    //   console.log("Group history is:", this.groupedMoreDateArray);
    // });
  }

  groupHistory(){
    return new Promise(resolve => {
      let curIndex = 0;

      while(curIndex < this.moreHistoryArray.length){
        let nextIndex = curIndex + 1;
        let curObj = this.moreHistoryArray[curIndex];

        while(nextIndex < this.moreHistoryArray.length){
          let nextObj = this.moreHistoryArray[nextIndex];

          // If dates are the same append next object to first object
          if(curObj.date == nextObj.date){
            let tempOutput = curObj.output;
            curObj.output = tempOutput + nextObj.output;
            nextIndex += 1;
          }
        };
        this.groupedMoreDateArray.push(curObj);
        curIndex += 1;
      };
      resolve(true);
    });
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
      // console.log("EntryDate:", entryDate);
      // console.log("SplittedToday:", today);
      // console.log("Found distance month:", monthDistance);
      // console.log("Found distance day:", dayDistance);
      // console.log("Found distance year:", yearDistance);
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
