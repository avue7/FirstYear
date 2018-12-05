import { Component } from '@angular/core';
import { ViewController, NavParams, ModalController, ToastController} from 'ionic-angular';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';
import { GrowthModalPage } from '../growth-modal/growth-modal';
import { DatabaseProvider } from '../../providers/database/database';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';

import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'page-growth',
  templateUrl: 'growth.html',
})
export class GrowthPage {
  growthModal: any;
  // noHistoryYet: boolean;

  GrowthMomentsAgo: any;
  GrowthMomentsAgoSubscription: any;
  GrowthMomentsAgoTime: any;
  lastGrowth: any;
  lastGrowthOutput: any;

  lifoHistoryArray:any;
  historyArray: any;
  todayHistoryArray: any;
  yesterdayHistoryArray: any;
  moreHistoryArray: any;
  hasToday: boolean;
  hasYesterday: boolean;
  hasMore: boolean;

  constructor(public navParams: NavParams,
    private noteAlertProvider: NoteAlertProvider,
    private modal: ModalController,
    private db: DatabaseProvider,
    private toastCtrl: ToastController,
    private ft: FormattedTodayProvider ) {
    this.lastGrowth = null;
    this.lastGrowthOutput = null;
    // this.noHistoryYet = true;
    this.init();
  }

  async init(){
    await this.initArray();

    this.getLastGrowth();

    this.createHistoryObservable().then(async () => {
      await this.updateGrowthSummary();
    }).then(async() => {
      if(this.hasToday){
        this.todayHistoryArray = await this.todayHistoryArray.sort((a,b) => {
          return (a.time > b.time ? -1 : a.time < b.time ? 1 : 0);
        });
        // console.log("This todayHistoryArray: ", this.todayHistoryArray);
      };
      // console.log("SORTY TODAY ARRAY IS", this.todayHistoryArray);
    }).then(async() => {
      if(this.hasYesterday){
        this.yesterdayHistoryArray = await this.yesterdayHistoryArray.sort((a,b) => {
          return (a.time > b.time ? -1 : a.time < b.time ? 1 : 0);
        });
      };
    }).then(async() => {
      if(this.hasMore){
        this.moreHistoryArray = await this.moreHistoryArray.sort((a,b) => {
          return (a.dateTime > b.dateTime ? -1 : a.dateTime < b.dateTime ? 1 : 0);
        });
      };
    });

  }

  initArray(){
    return new Promise(resolve => {
      this.historyArray = [];
      this.lifoHistoryArray = [];
      this.todayHistoryArray = [];
      this.yesterdayHistoryArray = [];
      this.moreHistoryArray = [];
      this.hasToday = false;
      this.hasYesterday = false;
      this.hasMore = false;
      resolve();
    });
  }

  async createHistoryObservable(){
    console.log("Creating growth history observable")
    let activityRef: any;
    await this.db.getActivityReference("growth").then(async(_activityRef) => {
      activityRef = _activityRef;
    }).then(async () => {
      await this.db.createGrowthObservable(activityRef).then(retVal => {
      });
    });
  }

  addGrowth(){
    this.openGrowthModal().then(growth => {
      if(growth == undefined){
        console.log("User canceled Growth modal");
      } else if(growth.weight == '' && growth.height == '' && growth.head == ''){
        console.log("growth weight is", growth.weight);
        let toast = this.toastCtrl.create({
          message: 'Growth not saved. Must have weight, height, or head measurement. Please try again.',
          duration: 5000,
          position: 'bottom'
        });

        toast.present();
      } else {
        let dateTemp = new Date(growth.date);
        let monthNumber = (Number(dateTemp.getMonth()) + 1);
        let monthString: string;

        // Add a 0 to month and days < 10
        if (monthNumber < 10){
          monthString = '0' + monthNumber.toString();
        } else {
          monthString = monthNumber.toString();
        };
        let dayNumber = (Number(dateTemp.getDate()));

        let dayString: string;
        if (dayNumber < 10){
          dayString = '0' + dayNumber.toString();
        } else {
          dayString = dayNumber.toString();
        };

        // Concentanate the strings
        let date = monthString + '-' + dayString + '-' + dateTemp.getFullYear();
        ///////////////////////////////////////////////////////////////
        // Extract only the time
        let timeTemp = new Date(growth.time);

        let time = this.addZeroToTime(timeTemp.getHours()) + ':' + this.addZeroToTime(timeTemp.getMinutes()) + ':' +
        this.addZeroToTime(timeTemp.getSeconds());

        // String up date and time and call the method to standardize the time
        let dateTime = date + " " + time;
        /////////////////////////////////////////////////////////////////
        delete growth.date;
        delete growth.time;
        growth.activity = 'growth';
        growth.dateTime = dateTime;
        growth.time = time;

        this.db.saveBabyActivity('growth', growth).then((retVal) => {
          if(retVal = true){
            console.log("Growth object successfully");
          } else {
            console.log("Growth object was not saved succesfully. Something happend");
          };
          this.getLastGrowth();
        });
      }
    })
  }

  updateGrowthSummary(){
    return new Promise(async resolve => {
      await this.initArray().then(() => {
      let todayTemp = this.ft.getToday();
      let today = this.ft.getTodayMonthFirst(todayTemp);
      let todayMoment = moment(today);

      this.historyArray = this.db.growthHistoryArray;

      for(let v of this.historyArray){
        this.lifoHistoryArray.unshift(v);
      };

      for(let x of this.lifoHistoryArray){
        let entryDate = this.ft.getDateFromDateTime(x.dateTime);
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

        let outputString: any;
        let weightOutput: any;
        let heightOutput: any;
        let headOutput: any;

        if(x.weight != ''){
          outputString = 'weight: ' + x.weight + " " + x.weightUnit;
          if(x.height != ''){
            outputString += ', height: ' + x.height + " " + x.heightUnit;
          }
          if(x.head != ''){
            outputString += ', head: ' + x.head + ' ' + x.headUnit;
          }
        } else if(x.height != ''){
          outputString = 'height: ' + x.height + " " + x.heightUnit;
          if(x.head != ''){
            outputString += ', head: ' + x.head + ' ' + x.headUnit;
          }
        } else if(x.head != ''){
          outputString = 'head: ' + x.head + ' ' + x.headUnit;
        }

        // Group the activity by days
        if(todayMoment.diff(entryDateMoment, 'years') == 0){
          if(todayMoment.diff(entryDateMoment, 'months') == 0){
            // Todays
            if(todayMoment.diff(entryDateMoment, 'days') == 0){
              let tempToday: any;
              if(x.note){
                tempToday = {
                  note: x.note.note,
                  dateTime: x.dateTime,
                  time: timeString,
                  activity: x.activity,
                  output: outputString
                }
              } else {
                tempToday = {
                  activity: x.activity,
                  dateTime: x.dateTime,
                  time: timeString,
                  output: outputString
                };
              };

              this.todayHistoryArray.push(tempToday);
              this.hasToday = true;
            }
            // Yesterdays
            else if(todayMoment.diff(entryDateMoment, 'days') == 1){
              let tempYesterday: any;
              if(x.note){
                tempYesterday = {
                  note: x.note.note,
                  dateTime: x.dateTime,
                  time: timeString,
                  activity: x.activity,
                  output: outputString
                }
              } else {
                tempYesterday = {
                  activity: x.activity,
                  dateTime: x.dateTime,
                  time: timeString,
                  output: outputString
                };
              };

              this.yesterdayHistoryArray.push(tempYesterday);
              this.hasYesterday = true;
            }
            else {
              let outputStringWithDate = entryDate + outputString;

              let temp: any;
              if(x.note){
                temp = {
                  note: x.note.note,
                  time: timeString,
                  date: entryDate,
                  dateTime: x.dateTime,
                  activity: x.activity,
                  output: outputString
                }
              } else {
                temp = {
                  activity: x.activity,
                  dateTime: x.dateTime,
                  time: timeString,
                  date: entryDate,
                  output: outputString
                };
              };

              this.moreHistoryArray.push(temp);
              this.hasMore = true;
            };
          }
          else {
            let outputStringWithDate = entryDate + outputString;

            let temp: any;
            if(x.note){
              temp = {
                note: x.note.note,
                time: timeString,
                date: entryDate,
                dateTime: x.dateTime,
                activity: x.activity,
                output: outputString
              }
            } else {
              temp = {
                activity: x.activity,
                dateTime: x.dateTime,
                time: timeString,
                date: entryDate,
                output: outputString
              };
            };

            this.moreHistoryArray.push(temp);
            this.hasMore = true;
          };
        } else {
          let outputStringWithDate = entryDate + outputString;

          let temp: any;
          if(x.note){
            temp = {
              note: x.note.note,
              time: timeString,
              date: entryDate,
              dateTime: x.dateTime,
              activity: x.activity,
              output: outputString
            }
          } else {
            temp = {
              activity: x.activity,
              dateTime: x.dateTime,
              time: timeString,
              date: entryDate,
              output: outputString
            };
          };

          this.moreHistoryArray.push(temp);
          this.hasMore = true;
        }
      };
      resolve(true);
    });
    });
  }

  async getLastGrowth(){
    this.GrowthMomentsAgo = null;
    let count = 0;
    let activityRef;
    await this.db.getActivityReference("growth").then(_activityRef => {
        activityRef = _activityRef;
    });

    await activityRef.get().then((latestSnapshot) => {
        latestSnapshot.forEach(doc => {
          count = count + 1;
          // console.log("Feeding::getLastBreastFeed(): lastest breastfeed:", doc.data());
        });
    });

    if(count == 0){
      this.lastGrowth = null;
      this.lastGrowthOutput = null;
    } else {
      await activityRef.orderBy("dateTime", "asc").get().then((latestSnapshot) => {
        latestSnapshot.forEach(doc => {
          count = count - 1;
          if(count == 0){
            // If last breastfeeding exists
            if(this.lastGrowth){
              this.GrowthMomentsAgoSubscription.unsubscribe();
            };

            // NOTE: MOMENTS AGO HACK...
            this.GrowthMomentsAgoTime = moment(doc.data().dateTime, 'YYYY-MM-DD HH:mm:ss');
            this.createMomentObservable(this.GrowthMomentsAgoTime);

            this.lastGrowth = this.ft.formatDateTimeStandard(doc.data().dateTime);

            // Find output string for lastGrowth
            let x = doc.data();
            let outputString: any;
            if(x.weight != ''){
              outputString = 'weight: ' + x.weight + " " + x.weightUnit;
              if(x.height != ''){
                outputString += ', height: ' + x.height + " " + x.heightUnit;
              }
              if(x.head != ''){
                outputString += ', head: ' + x.head + ' ' + x.headUnit;
              }
            } else if(x.height != ''){
              outputString = 'height: ' + x.height + " " + x.heightUnit;
              if(x.head != ''){
                outputString += ', head: ' + x.head + ' ' + x.headUnit;
              }
            } else if(x.head != ''){
              outputString = 'head: ' + x.head + ' ' + x.headUnit;
            }

            this.lastGrowthOutput = outputString;

          };
        });
      }).then(() => {
        this.updateGrowthSummary();
      });
    };
  }

  createMomentObservable(momentsAgoTime : any){
    this.GrowthMomentsAgoSubscription = Observable.interval(1000).subscribe(x => {
      this.GrowthMomentsAgo = momentsAgoTime.startOf('seconds').fromNow();
        // console.log("moments ago is:", this.momentsAgo);
    });
  }

  openGrowthModal(): any {
    return new Promise(resolve => {
      this.growthModal = this.modal.create(GrowthModalPage);
      this.growthModal.present();
      resolve(this.waitForGrowthReturn());
    });
  }

  waitForGrowthReturn() : any {
    return new Promise(resolve => {
      this.growthModal.onDidDismiss(data => {
        let growthObject = data;
        resolve(growthObject);
      });
    });
  }

  addZeroToTime(time : any) : any{
    if(time < 10){
      time = "0" + time;
    };
    return time;
  }

  async editEvent(slidingItem: any, event: any){
    console.log("CLICKED ON EVENT");
    await this.db.editEvent(event).then(async() => {
      this.GrowthMomentsAgoSubscription.unsubscribe();
      this.init();
    });
    slidingItem.close();
  }

  async deleteEvent(slidingItem: any, event: any){
    console.log("CLICKED ON DELETE EVENT", event);
    slidingItem.close();
    await this.db.deleteEvent(event).then(() => {
      this.GrowthMomentsAgoSubscription.unsubscribe();
      this.init();
    });
  }

}
