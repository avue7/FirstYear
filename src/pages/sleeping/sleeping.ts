import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { TimerProvider } from '../../providers/timer/timer';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertController } from 'ionic-angular';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';
import { LifoHistoryProvider } from '../../providers/lifo-history/lifo-history';
import { DiaperingModalPage } from '../diapering-modal/diapering-modal';
import { SleepingModalPage } from '../sleeping-modal/sleeping-modal';

import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'page-sleeping',
  templateUrl: 'sleeping.html',
})
export class SleepingPage {
  sleepingNote: any;
  lastSleeping: any;
  lastSleepDuration: any = null;
  sleepingModal: any;
  dateTimeStart: any;
  dateTimeEnd: any;
  timerStarted: boolean;
  sleeping: any = {
    date: '',
    time: '',
    dateEnd: '',
    timeEnd: '',
    duration: ''
  };

  // MOMENTS
  momentsAgoTime: any;
  momentsAgoSubscription: any;
  momentsAgo: any;
  date: any = moment().format();
  time: any = moment().format();

  nAlert: any;

  SleepingMomentsAgoSubscription: any;
  SleepingMomentsAgoTime: any;
  SleepingMomentsAgo: any;

  todayHistoryArray: any;
  yesterdayHistoryArray: any;
  moreHistoryArray: any;

  hasToday: boolean;
  hasYesterday: boolean;
  hasMore: boolean;

  constructor( private ft: FormattedTodayProvider,
    private db: DatabaseProvider,
    private alertCtrl: AlertController,
    private timer: TimerProvider,
    private modal: ModalController,
    private noteAlertProvider: NoteAlertProvider,
    private lifoHistory: LifoHistoryProvider) {
    this.sleeping.date = moment().format();
    this.sleeping.time = moment().format();
    this.SleepingMomentsAgo = '';
    this.sleepingNote = null;
    this.getLastSleeping();
    this.timerStarted = false;
  }

  ionViewWillLeave(){
    this.timerStarted = false;

    if(this.momentsAgoSubscription){
      this.momentsAgoSubscription.unsubscribe();
    } else if(this.SleepingMomentsAgoSubscription){
      this.SleepingMomentsAgoSubscription.unsubscribe();
    }
  }

  saveSleeping(){
    console.log("saving sleeping activity");
    let today: any;

    // Check if timer started, get the dateTime at timer started
    if(this.timerStarted == true){
      today = this.dateTimeStart;
    } else {
      console.log('Sleeping::saveSleeping(): error: dateTimeStart is incorrect');
    }

    // Split today with time to get time
    let splitTimeArray = today.split(' ');
    let splitTimeOnly = splitTimeArray[1];

    this.checkIfSleepingNoteExist(splitTimeOnly).then(object => {
      this.db.saveBabyActivity("sleeping", object).then(() => {
        this.sleepingNote = null;
        this.getLastSleeping();

        if(this.timer.tick != 0){
          this.timer.refreshTimer();
          this.timerStarted = false;
        };
      });
    });
  }

  checkIfSleepingNoteExist(splitTimeOnly: any){
    return new Promise(resolve => {
      let object = {};
      let pausedDateTime: any;
      let endDateTime: any;
      let splitDate: any;
      let splitTime: any;

      if(this.timerStarted == true || this.timer.isPaused == true){
        pausedDateTime = this.timer.isPausedDateTime;
        endDateTime = pausedDateTime.split(' ');
        splitDate = endDateTime[0];
        splitTime = endDateTime[1];
        console.log("This timer is paused:", this.timer.isPaused, "isPausedDateTime:", this.timer.isPausedDateTime);
      } else {
        // EndDateTime
        pausedDateTime = this.ft.getTodayMonthFirstWithTime();
        endDateTime = pausedDateTime.split(' ');
        splitDate = endDateTime[0];
        splitTime = endDateTime[1];
      };

      if(this.sleepingNote){
        object = {
          date: this.dateTimeStart,
          note: this.sleepingNote,
          time: splitTimeOnly,
          dateEnd: splitDate,
          timeEnd:  splitTime,
          duration: this.timer.tick
        }
      }else {
        object = {
          date: this.dateTimeStart,
          time: splitTimeOnly,
          dateEnd: splitDate,
          timeEnd:  splitTime,
          duration: this.timer.tick
        }
      };
      resolve(object);
    });
  }

  getLastSleeping(){
    console.log("Getting last sleeping");
    this.SleepingMomentsAgo = '';
    let count = 0;
    let babyRef = this.db.getBabyReference();
    babyRef.collection('sleeping')
      // .where('date', '==', 'date')
      .get().then((latestSnapshot) => {
        latestSnapshot.forEach(doc => {
          count = count + 1;
          // console.log("Feeding::getLastBreastFeed(): lastest breastfeed:", doc.data());
        });
    });

    babyRef.collection('sleeping').get().then((latestSnapshot) => {
      latestSnapshot.forEach(doc => {
        count = count - 1;
        if(count == 0){
          // If last breastfeeding exists
          if(this.lastSleeping){
            this.SleepingMomentsAgoSubscription.unsubscribe();
          };

          // NOTE: MOMENTS AGO HACK...
          this.SleepingMomentsAgoTime = moment(doc.data().date, 'YYYY-MM-DD HH:mm:ss');
          this.createMomentObservable(this.SleepingMomentsAgoTime);

          this.lastSleeping = this.ft.formatDateTimeStandard(doc.data().date);

          let duration = doc.data().duration;

          // Convert duration
          let hours = Math.floor(duration / 60);
          let minutes = Math.floor(duration / 60);
          let seconds =  duration % 60;
          let durationString: any;

          if (hours >= 1){
            durationString = hours + ' hours ' + minutes + ' mins ' + seconds + ' secs';
          } else if(minutes >= 1){
            durationString = minutes + ' mins ' + seconds + ' secs';
          } else {
            durationString = seconds + ' secs';
          };

          this.lastSleepDuration = durationString;

        };
      });
      this.updateSleepingSummary();
    });
  }

  createMomentObservable(momentsAgoTime : any){
    this.SleepingMomentsAgoSubscription = Observable.interval(1000).subscribe(x => {
        this.SleepingMomentsAgo = momentsAgoTime.startOf('seconds').fromNow();
    });
  }

  updateSleepingSummary(){
    console.log("Updating sleeping summary");
    this.lifoHistory.init().then(() => {
      this.lifoHistory.lifoHistory('sleeping').then(() => {
        this.hasToday = this.lifoHistory.hasToday;
        this.hasYesterday = this.lifoHistory.hasYesterday;
        this.hasMore = this.lifoHistory.hasMore;
        if(this.hasToday == true){
          this.todayHistoryArray = this.lifoHistory.todayHistoryArray;
          console.log("THIS TDOAY HISTORY ARRAY:", this.todayHistoryArray);
        }
        // console.log("THIS TDOAY HISTORY ARRAY:", this.todayHistoryArray);
        this.yesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
        this.moreHistoryArray = this.lifoHistory.moreHistoryArray;
      });
    })
  }

  manuallyAddSleeping(){
    this.openSleepingModal().then((sleeping) => {
      if (sleeping == undefined){
        console.log("Sleeping::manualAdd(): user canceled modal");
      } else {
        // Extract only the date
        let dateTemp = new Date(sleeping.date);
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
        let timeTemp = new Date(sleeping.time);

        let time = this.addZeroToTime(timeTemp.getHours()) + ':' + this.addZeroToTime(timeTemp.getMinutes()) + ':' +
        this.addZeroToTime(timeTemp.getSeconds());

        // String up date and time and call the method to standardize the time
        let dateTime = date + " " + time;
        /////////////////////////////////////////////////////////////////

        let manualObject = {}

        if(this.sleepingNote){
          manualObject = {
            date: sleeping.date,
            note: sleeping.note,
            time: sleeping.timeStart,
            dateEnd: sleeping.dateEnd,
            timeEnd:  sleeping.timeEnd,
            duration: sleeping.duration
          }
        }else {
          manualObject = {
            date: sleeping.date,
            time: sleeping.timeStart,
            dateEnd: sleeping.dateEnd,
            timeEnd:  sleeping.timeEnd,
            duration: sleeping.duration
          }
        };

        // Call method to store into Database
        this.db.saveBabyActivity('sleeping', manualObject).then((retVal) => {
          if(retVal = true){
            console.log("Manual sleeping saved successfully");
          } else {
            console.log("Manual sleeping was not saved succesfully. Something happend");
          };
          this.getLastSleeping();
        });
      };
    });
  }

  openSleepingModal() : any {
    return new Promise(resolve =>{
      this.sleepingModal = this.modal.create(SleepingModalPage);
      this.sleepingModal.present();
      resolve(this.waitForModalReturn());
    })
  }

  waitForModalReturn() : any{
    return new Promise(resolve => {
      this.sleepingModal.onDidDismiss( data => {
        console.log("WAIT FOR RETURN DATA IS:", data);
        let babyObject = data;
        resolve(babyObject);
      });
    });
  }

  noteAlert(){
    this.nAlert = this.noteAlertProvider.alert();
    this.nAlert.present();

    this.waitForAlertReturn().then((val) => {
      if(val == true){
        console.log("THIS sleepNote is true: ", val);
      } else {
        console.log("THIS sleepNote is false: ", val);
      };
    });
  }

  waitForAlertReturn() : any{
    return new Promise(resolve => {
      this.nAlert.onDidDismiss(data => {
        console.log("DATA IS:", data);
        if(data != undefined){
          this.sleepingNote = data;
          resolve(true);
        } else {
          this.sleepingNote = null;
          resolve(false);
        };
      }, (error) =>{
        console.log("Alert on dismiss error:", error);
      });
    })
  }

  addZeroToTime(time : any) : any{
    if(time < 10){
      time = "0" + time;
    };
    return time;
  }

  startPauseTimer(){
    if(this.timerStarted == false){
      this.dateTimeStart = this.ft.getTodayMonthFirstWithTime();
      this.timerStarted = true;
      console.log('TImer started, dateTimeStart is:', this.dateTimeStart);
    }
    this.timer.startPauseTimer();
  }

  refreshTimer(){
    if(this.timer.timerSubscription != undefined){
      this.timer.refreshTimer();
      this.timerStarted = false;
    } else{
      console.log("Feedings::refreshTimer(): timerSubscription is undefined");
    };
  }
}
