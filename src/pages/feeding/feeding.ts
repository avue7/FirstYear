import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { TimerProvider } from '../../providers/timer/timer';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertController } from 'ionic-angular';
import { BreastfeedingModalPage } from '../breastfeeding-modal/breastfeeding-modal';
import { BfHistoryModalPage } from '../bf-history-modal/bf-history-modal';
import { BottlefeedingModalPage } from '../bottlefeeding-modal/bottlefeeding-modal';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';
import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'page-feeding',
  templateUrl: 'feeding.html',
})
export class FeedingPage {
  // Segments
  segmentType = 'Bottle';
  segments: any = {
    'Breast':[

    ],
    'Bottle':[

    ],
    'Meal':[

    ]
  }

  // MOMENTS
  momentsAgoTime: any;
  momentsAgoSubscription: any;
  momentsAgo: any;
  date: any = moment().format();
  time: any = moment().format();

  nAlert: any;

  // Breastfeeding Declarations
  leftBreast: any = null;
  rightBreast: any = null;
  activeBreast: any;
  breastfeedingModal: any;
  bfHistoryModal: any;
  lastBreastFeed: any = null;
  lastBreastSide: any = null;
  lastDuration: any = null;
  breastfeeding = "leftBreast";

  // Bottlefeeding Declarations
  bottlefeedingModal: any;
  bottleNote: string;
  durationIsSet: boolean = false;
  bottle: any = {
    type: 'Formula',
    duration: '00:00:00',
    volume: 0,
    unit: 'oz'
  };



  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private timer: TimerProvider,
    private ft: FormattedTodayProvider,
    private db: DatabaseProvider,
    private alertCtrl: AlertController,
    private modal: ModalController,
    private noteAlertProvider: NoteAlertProvider) {
    this.momentsAgoTime = '';
    this.setLeftBreast();
    this.getLastBreastFeed();
    this.bottleNote = null;
    this.bottle.volume = 6;
  }

  ionViewWillLeave(){
    this.momentsAgoSubscription.unsubscribe();
  }
  // ionViewDidLoad() {
  //   console.log('ionViewDidLoad FeedingPage');
  //   this.getLastBreastFeed();
  // }

  ///////////////////// NOTE: BREAST FEEDING ACTIVITY /////////////////
  setLeftBreast(){
    this.leftBreast = true;
    this.rightBreast = false;
  }

  setRightBreast(){
    this.rightBreast = true;
    this.leftBreast = false;
  }

  startPauseTimer(){
    this.timer.startPauseTimer();
  }

  refreshTimer(){
    if(this.timer.timerSubscription != undefined){
      this.timer.refreshTimer();
    } else{
      console.log("Feedings::refreshTimer(): timerSubscription is undefined");
    };
  }

  saveBreastFeeding(){
    let today = this.ft.getTodayMonthFirstWithTime();

    let breast_: any;

    if(this.leftBreast){
      breast_ = "left breast";
    } else{
      breast_ = "right breast";
    }

    // Split today with time to get time
    let splitTimeArray = today.split(' ');
    let splitTimeOnly = splitTimeArray[1];

    let object = {
      breast: breast_,
      date: today,
      time: splitTimeOnly,
      duration: this.timer.tick
    }

    // console.log("Feeding::save(): object is:", object);

    this.db.saveBabyActivity("breastfeeding", object).then(() => {
      this.getLastBreastFeed();
      this.timer.refreshTimer();
    });
  }

  getLastBreastFeed(){
    this.momentsAgo = '';
    let count = 0;
    let babyRef = this.db.getBabyReference();
    babyRef.collection('breastfeeding')
      // .where('date', '==', 'date')
      .get().then((latestSnapshot) => {
        latestSnapshot.forEach(doc => {
          count = count + 1;
          // console.log("Feeding::getLastBreastFeed(): lastest breastfeed:", doc.data());
        });
    });

    babyRef.collection('breastfeeding').get().then((latestSnapshot) => {
      latestSnapshot.forEach(doc => {
        count = count - 1;
        if(count == 0){
          console.log("Feeding::getLastBreastFeed(): last date retrieved is:", doc.data().date);

          // If last breastfeeding exists
          if(this.lastBreastFeed){
            this.momentsAgoSubscription.unsubscribe();
          };

          // NOTE: MOMENTS AGO HACK...
          this.momentsAgoTime = moment(doc.data().date, 'MM-DD-YYYY HH:mm:ss');
          this.createMomentObservable(this.momentsAgoTime);

          this.lastBreastFeed = this.ft.formatDateTimeStandard(doc.data().date);
          this.lastBreastSide = doc.data().breast;
          this.lastDuration = doc.data().duration;
        };
      });
    });
  }

  createMomentObservable(momentsAgoTime : any){
    this.momentsAgoSubscription = Observable.interval(1000).subscribe(x => {
      this.momentsAgo = momentsAgoTime.startOf('seconds').fromNow();
      // console.log("moments ago is:", this.momentsAgo);
    });
  }

  manualAddBreastFeed(){
    this.openModal().then((breastFeeding) => {
      //console.log("manual breastfeeding object is", breastFeeding);
      if (breastFeeding == undefined){
        console.log("Feeding::manualAdd(): user canceled modal");
      } else {
        let durationTemp = breastFeeding.duration;
        let splitDurationArray = durationTemp.split(':');

        splitDurationArray[1] = Number(splitDurationArray[1]);
        splitDurationArray[2] = Number(splitDurationArray[2]);

        // This will be the value of time (duration for database)
        let totalDuration = (splitDurationArray[1] * 60) + (splitDurationArray[2]);

        // Extract only the date
        let dateTemp = new Date(breastFeeding.date);

        // Have to add plus one to getUTCMonth because Jan=0, Feb=1, etc..
        let monthNumber = (Number(dateTemp.getMonth()) + 1);
        let monthString: string;

        // Add a 0 to month and days < 10
        if (monthNumber < 10){
          monthString = '0' + monthNumber.toString();
        } else {
          monthString = monthNumber.toString();
        };
        let dayNumber = (Number(dateTemp.getDay()));
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
        let timeTemp = new Date(breastFeeding.time);

        let time = this.addZeroToTime(timeTemp.getHours()) + ':' + this.addZeroToTime(timeTemp.getMinutes()) + ':' +
        this.addZeroToTime(timeTemp.getSeconds());

        // String up date and time and call the method to standardize the time
        let dateTime = date + " " + time;
        /////////////////////////////////////////////////////////////////

        let bfManualObject = {
          breast: breastFeeding.breast + ' breast',
          date: dateTime,
          time: time,
          duration: totalDuration
        };

        // Call method to store into Database
        this.db.saveBabyActivity('breastfeeding', bfManualObject).then((retVal) => {
          if(retVal = true){
            console.log("Manual breastfeeding saved successfully");
          } else {
            console.log("Manual breastfeeding was not saved succesfully. Something happend");
          };
          this.getLastBreastFeed();
        });
      };
    });
  }

  addZeroToTime(time : any) : any{
    if(time < 10){
      time = "0" + time;
    };
    return time;
  }

  openModal() : any {
    return new Promise(resolve =>{
      this.breastfeedingModal = this.modal.create(BreastfeedingModalPage);
      this.breastfeedingModal.present();
      resolve(this.waitForReturn());
    })
  }

  waitForReturn() : any{
    return new Promise(resolve => {
      this.breastfeedingModal.onDidDismiss( data => {
        let babyObject = data;
        resolve(babyObject);
      });
    });
  }

  getBfHistory() {
    this.openBfHistoryModal().then((history) => {
      this.getLastBreastFeed();
    });
  }

  openBfHistoryModal(){
    return new Promise(resolve => {
      this.bfHistoryModal = this.modal.create(BfHistoryModalPage);
      this.bfHistoryModal.present();
      resolve(this.waitForBfReturn());
    });
  }

  waitForBfReturn(){
    return new Promise(resolve => {
      this.bfHistoryModal.onDidDismiss( data => {
        let history = data;
        resolve(history);
      });
    })
  }
  /////////////////////////// BREASTFEEDING ACTIVITY ENDS /////////////////////////////

  /////////////////////////// NOTE: BOTTLE FEEDING BEGINS HERE /////////////////////////////
  saveBottleFeeding(){
    console.log("YAY, you are tring to save bottle feeding");
    let today = this.ft.getTodayMonthFirstWithTime();

    // Split today with time to get time
    let splitTimeArray = today.split(' ');
    let splitTimeOnly = splitTimeArray[1];

    this.checkIfBottleNoteExist(today, splitTimeOnly).then(object => {
      this.db.saveBabyActivity("bottlefeeding", object).then(() => {
        // this.getLastBreastFeed();

        // Reset the duration counter and bottle note after saving
        this.bottle.duration = "00:00:00";
        this.bottleNote = null;

        // Set the app to remember the new

        if(this.timer.tick != 0){
          this.timer.refreshTimer();
        };
      });
    });
  }

  manuallyAddBottle(){
    this.openBottleModal().then((bottleFeeding) => {
      console.log("Manually adding bottle returned from modal");
      if (bottleFeeding == undefined){
        console.log("Feeding::manualAdd(): user canceled modal");
      } else {
        let durationTemp = bottleFeeding.duration;
        let splitDurationArray = durationTemp.split(':');

        splitDurationArray[1] = Number(splitDurationArray[1]);
        splitDurationArray[2] = Number(splitDurationArray[2]);

        // This will be the value of time (duration for database)
        let totalDuration = (splitDurationArray[1] * 60) + (splitDurationArray[2]);

        // Extract only the date
        let dateTemp = new Date(bottleFeeding.date);

        // Have to add plus one to getUTCMonth because Jan=0, Feb=1, etc..
        let monthNumber = (Number(dateTemp.getMonth()) + 1);
        let monthString: string;

        // Add a 0 to month and days < 10
        if (monthNumber < 10){
          monthString = '0' + monthNumber.toString();
        } else {
          monthString = monthNumber.toString();
        };
        let dayNumber = (Number(dateTemp.getDay()));
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
        let timeTemp = new Date(bottleFeeding.time);

        let time = this.addZeroToTime(timeTemp.getHours()) + ':' + this.addZeroToTime(timeTemp.getMinutes()) + ':' +
        this.addZeroToTime(timeTemp.getSeconds());

        // String up date and time and call the method to standardize the time
        let dateTime = date + " " + time;
        /////////////////////////////////////////////////////////////////

        let manualObject = {};

        if(bottleFeeding.note){
          manualObject = {
            type: bottleFeeding.type,
            date: dateTime,
            volume: bottleFeeding.volume,
            time: time,
            duration: totalDuration,
            unit: bottleFeeding.unit,
            note: bottleFeeding.note
          }
        } else {
          manualObject = {
            type: bottleFeeding.type,
            date: dateTime,
            volume: bottleFeeding.volume,
            time: time,
            duration: totalDuration,
            unit: bottleFeeding.unit
          }
        };

        // Call method to store into Database
        this.db.saveBabyActivity('breastfeeding', manualObject).then((retVal) => {
          if(retVal = true){
            console.log("Manual bottleFeeding saved successfully");
          } else {
            console.log("Manual bottleFeeding was not saved succesfully. Something happend");
          };
          //this.getLastBreastFeed();
        });
      };
    });
  }

  checkIfBottleNoteExist(today: any, splitTimeOnly: any){
    return new Promise(resolve => {
      let object = {};

      if(this.bottleNote){
        if(this.timer.tick != 0){
          object = {
            type: this.bottle.type,
            date: today,
            volume: this.bottle.volume,
            time: splitTimeOnly,
            duration: this.timer.tick,
            unit: this.bottle.unit,
            note: this.bottleNote
          }
        } else {
          let duration = this.convertDurationToseconds();
          object = {
            type: this.bottle.type,
            date: today,
            volume: this.bottle.volume,
            time: splitTimeOnly,
            duration: duration,
            unit: this.bottle.unit,
            note: this.bottleNote
          }
        };
      }else {
        if(this.timer.tick != 0){
          object = {
            type: this.bottle.type,
            date: today,
            volume: this.bottle.volume,
            time: splitTimeOnly,
            duration: this.timer.tick,
            unit: this.bottle.unit,
          }
        } else {
          let duration = this.convertDurationToseconds();
          object = {
            type: this.bottle.type,
            date: today,
            volume: this.bottle.volume,
            time: splitTimeOnly,
            unit: this.bottle.unit,
            duration: duration
          }
        };
      };
      resolve(object);
    });
  }

  openBottleModal() : any {
    return new Promise(resolve =>{
      this.bottlefeedingModal = this.modal.create(BottlefeedingModalPage);
      this.bottlefeedingModal.present();
      resolve(this.waitForBottleReturn());
    })
  }

  waitForBottleReturn() : any{
    return new Promise(resolve => {
      this.bottlefeedingModal.onDidDismiss( data => {
        console.log("WAIT FOR RETURN DATA IS:", data);
        let babyObject = data;
        resolve(babyObject);
      });
    });
  }

  convertDurationToseconds():any{
    let durationTemp = this.bottle.duration;
    let splitDurationArray = durationTemp.split(':');

    splitDurationArray[1] = Number(splitDurationArray[1]);
    splitDurationArray[2] = Number(splitDurationArray[2]);

    // This will be the value of time (duration for database)
    let totalDuration = (splitDurationArray[1] * 60) + (splitDurationArray[2]);
    return totalDuration;
  }

  noteAlert(){
    this.nAlert = this.noteAlertProvider.alert();
    this.nAlert.present();

    this.waitForAlertReturn().then((val) => {
      if(val == true){
        console.log("THIS bottlenote is true: ", val);
      } else {
        console.log("THIS bottlenote is false: ", val);
      };
    });
  }

  waitForAlertReturn() : any{
    return new Promise(resolve => {
      this.nAlert.onDidDismiss(data => {
        console.log("DATA IS:", data);
        if(data != undefined){
          this.bottleNote = data;
          resolve(true);
        } else {
          this.bottleNote = null;
          resolve(false);
        };
      }, (error) =>{
        console.log("Alert on dismiss error:", error);
      });
    })
  }

}
