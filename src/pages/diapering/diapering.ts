import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertController } from 'ionic-angular';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';
import { LifoHistoryProvider } from '../../providers/lifo-history/lifo-history';
import { DiaperingModalPage } from '../diapering-modal/diapering-modal';
import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';


@Component({
  selector: 'page-diapering',
  templateUrl: 'diapering.html',
})
export class DiaperingPage {
  diaperNote: any;
  lastDiapering: any;
  lastDiaperType: any;
  diaperingModal: any;
  diaper: any = {
    type: 'pee',
    date: '',
  };

  // MOMENTS
  momentsAgoTime: any;
  momentsAgoSubscription: any;
  momentsAgo: any;
  date: any = moment().format();
  time: any = moment().format();

  nAlert: any;

  DiaperingMomentsAgoSubscription: any;
  DiaperingMomentsAgoTime: any;
  DiaperingMomentsAgo: any;

  todayHistoryArray: any;
  yesterdayHistoryArray: any;
  moreHistoryArray: any;

  hasToday: boolean;
  hasYesterday: boolean;
  hasMore: boolean;

  constructor( private ft: FormattedTodayProvider,
    private db: DatabaseProvider,
    private alertCtrl: AlertController,
    private modal: ModalController,
    private noteAlertProvider: NoteAlertProvider,
    private lifoHistory: LifoHistoryProvider,
    private navParams: NavParams) {
    this.diaper.date = moment().format();
    this.diaper.time = moment().format();
    this.DiaperingMomentsAgo = '';
    this.diaperNote = null;
    this.lastDiaperType = null;
    this.getLastDiapering();
  }

  ionViewWillLeave(){
    if(this.momentsAgoSubscription){
      this.momentsAgoSubscription.unsubscribe();
    } else if(this.DiaperingMomentsAgoSubscription){
      this.DiaperingMomentsAgoSubscription.unsubscribe();
    }

    if((this.navParams.get("parentPage")) != undefined){
      this.navParams.get("parentPage").init();
    }
  }

  saveDiapering(){
    console.log("saving diaper activity");
    let today = this.ft.getTodayMonthFirstWithTime();

    // Split today with time to get time
    let splitTimeArray = today.split(' ');
    let splitTimeOnly = splitTimeArray[1];

    this.checkIfDiaperNoteExist(today, splitTimeOnly).then(object => {
      this.db.saveBabyActivity("diapering", object).then(() => {
        this.diaperNote = null;
        this.getLastDiapering();
      });
    });
  }

  checkIfDiaperNoteExist(today: any, splitTimeOnly: any){
    return new Promise(resolve => {
      let object = {};

      if(this.diaperNote){
        object = {
          activity: 'diapering',
          type: this.diaper.type,
          dateTime: today,
          note: this.diaperNote,
          time: splitTimeOnly
        }
      }else {
        object = {
          activity: 'diapering',
          type: this.diaper.type,
          dateTime: today,
          time: splitTimeOnly
        }
      };
      resolve(object);
    });
  }

  async getLastDiapering(){
    console.log("Getting last diapering");
    this.DiaperingMomentsAgo = '';
    let count = 0;
    let activityRef;
    await this.db.getActivityReference("diapering").then(_activityRef => {
        activityRef = _activityRef;
    });

    // Use orderBy in firebase and create the Indexes within the firebase console
    // to enable query by ascending or descending order. The error log will help you
    // create this following the link.
    await activityRef.get().then((latestSnapshot) => {
        latestSnapshot.forEach(doc => {
          count = count + 1;
          // console.log("Feeding::getLastBreastFeed(): lastest breastfeed:", doc.data());
        });
    });

    await activityRef.orderBy("dateTime", "asc").get().then((latestSnapshot) => {
      latestSnapshot.forEach(doc => {
        count = count - 1;
        if(count == 0){
          // If last breastfeeding exists
          if(this.lastDiapering){
            this.DiaperingMomentsAgoSubscription.unsubscribe();
          };

          // NOTE: MOMENTS AGO HACK...
          this.DiaperingMomentsAgoTime = moment(doc.data().dateTime, 'YYYY-MM-DD HH:mm:ss');
          this.createMomentObservable(this.DiaperingMomentsAgoTime);

          this.lastDiapering = this.ft.formatDateTimeStandard(doc.data().dateTime);
          this.lastDiaperType = doc.data().type;
        };
      });
    }).then(() => {
      this.updateDiaperingSummary();
    });
  }

  createMomentObservable(momentsAgoTime : any){
    this.DiaperingMomentsAgoSubscription = Observable.interval(1000).subscribe(x => {
        this.DiaperingMomentsAgo = momentsAgoTime.startOf('seconds').fromNow();
    });
  }

  updateDiaperingSummary(){
    console.log("Updating diaper summary");
    this.lifoHistory.init().then(() => {
      this.lifoHistory.lifoHistory('diapering').then(() => {
        this.hasToday = this.lifoHistory.hasToday;
        this.hasYesterday = this.lifoHistory.hasYesterday;
        this.hasMore = this.lifoHistory.hasMore;
        if(this.hasToday == true){
          this.todayHistoryArray = this.lifoHistory.todayHistoryArray;
          // console.log("THIS TDOAY HISTORY ARRAY:", this.todayHistoryArray);
        }
        // console.log("THIS TDOAY HISTORY ARRAY:", this.todayHistoryArray);
        this.yesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
        this.moreHistoryArray = this.lifoHistory.moreHistoryArray;
      });
    })
  }

  manuallyAddDiaper(){
    this.openDiaperingModal().then((diapering) => {
      if (diapering == undefined){
        console.log("Diapering::manualAdd(): user canceled modal");
      } else {
        // Extract only the date
        let dateTemp = new Date(diapering.date);
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
        let timeTemp = new Date(diapering.time);

        let time = this.addZeroToTime(timeTemp.getHours()) + ':' + this.addZeroToTime(timeTemp.getMinutes()) + ':' +
        this.addZeroToTime(timeTemp.getSeconds());

        // String up date and time and call the method to standardize the time
        let dateTime = date + " " + time;
        /////////////////////////////////////////////////////////////////

        let manualObject = {};

        if(diapering.note){
          manualObject = {
            activity: 'diapering',
            type: diapering.type,
            dateTime: dateTime,
            time: time,
            note: diapering.note
          }
        } else {
          manualObject = {
            activity: 'diapering',
            type: diapering.type,
            dateTime: dateTime,
            time: time,
          }
        };

        // Call method to store into Database
        this.db.saveBabyActivity('diapering', manualObject).then((retVal) => {
          if(retVal = true){
            console.log("Manual diapering saved successfully");
          } else {
            console.log("Manual diapering was not saved succesfully. Something happend");
          };
          this.getLastDiapering();
        });
      };
    });
  }

  openDiaperingModal() : any {
    return new Promise(resolve =>{
      this.diaperingModal = this.modal.create(DiaperingModalPage);
      this.diaperingModal.present();
      resolve(this.waitForModalReturn());
    })
  }

  waitForModalReturn() : any{
    return new Promise(resolve => {
      this.diaperingModal.onDidDismiss( data => {
        console.log("WAIT FOR RETURN DATA IS:", data);
        let babyObject = data;
        resolve(babyObject);
      });
    });
  }

  noteAlert(){
    if(this.diaperNote){
      this.nAlert = this.noteAlertProvider.alert(this.diaperNote);
      this.nAlert.present();
    } else {
      this.nAlert = this.noteAlertProvider.alert();
      this.nAlert.present();
    }

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
          this.diaperNote = data;
          resolve(true);
        } else {
          this.diaperNote = null;
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

}
