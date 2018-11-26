import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { TimerProvider } from '../../providers/timer/timer';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertController } from 'ionic-angular';
import { BreastfeedingModalPage } from '../breastfeeding-modal/breastfeeding-modal';
import { BfHistoryModalPage } from '../bf-history-modal/bf-history-modal';
import { BottlefeedingModalPage } from '../bottlefeeding-modal/bottlefeeding-modal';
import { MealModalPage } from '../meal-modal/meal-modal';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';
import { LifoHistoryProvider } from '../../providers/lifo-history/lifo-history';
import { HomePage } from '../home/home';
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
  lastBottleFeed: any;
  bottle: any = {
    type: 'Formula',
    duration: '00:00:00',
    //volume: 0,
    unit: 'oz'
  };

  // BottleFeeding history declarations
  todayHistoryArray: any;
  yesterdayHistoryArray: any;
  moreHistoryArray: any;

  bottleHasToday: boolean;
  bottleHasYesterday: boolean;
  bottleHasMore: boolean;

  BottleMomentsAgoSubscription: any;
  BottleMomentsAgoTime: any;
  BottleMomentsAgo: any;
  lastBottleDuration: any;
  bottleLastAmount: any;

  // MEALS
  meal: any = {};
  mealDetail: any;
  lastMeal: string;
  lastMealDetail: string;
  mealModal: any;

  // Meals history declarations
  mealTodayHistoryArray: any;
  mealYesterdayHistoryArray: any;
  mealMoreHistoryArray: any;

  mealHasToday: boolean;
  mealHasYesterday: boolean;
  mealHasMore: boolean;

  MealMomentsAgoSubscription: any;
  MealMomentsAgoTime: any;
  MealMomentsAgo: any;



  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private timer: TimerProvider,
    private ft: FormattedTodayProvider,
    private db: DatabaseProvider,
    private alertCtrl: AlertController,
    private modal: ModalController,
    private noteAlertProvider: NoteAlertProvider,
    private lifoHistory: LifoHistoryProvider,
    private viewCtrl: ViewController) {
    this.momentsAgoTime = '';
    this.BottleMomentsAgo = '';
    this.MealMomentsAgo = '';
    this.mealDetail = null;
    this.lastMealDetail = null;
    // this.setLeftBreast();
    // this.getLastBreastFeed();
    this.bottleNote = null;
    this.bottle.volume = undefined;
    this.getLastBottleFeed();
    // this.getLastMeal();
  }

  // NOTE: Need to add this to other pages so that it wont break the init()
  //       method that is inside of the home page.
  ionViewDidLeave(){
    this.navCtrl.popToRoot();
    if((this.navParams.get("parentPage")) != undefined){
      this.navParams.get("parentPage").init();
    }
  }

  ionViewWillLeave(){
    if(this.momentsAgoSubscription){
      this.momentsAgoSubscription.unsubscribe();
    } else if(this.BottleMomentsAgoSubscription){
      this.BottleMomentsAgoSubscription.unsubscribe();
    }

    // Need to call this to reload the home page when this child page is popped.
    // this.navParams.get("parentPage").hello();//init();
    // // this.navParams.get();
    // console.log("Parent page is:", this.navParams.get("parentPage"));
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
      //console.log("Feedings::refreshTimer(): timerSubscription is undefined");
    };
  }

  saveBreastFeeding(){
    let todayWithTime = this.ft.getTodayMonthFirstWithTime();

    let breast_: any;

    if(this.leftBreast){
      breast_ = "left";
    } else{
      breast_ = "right";
    }

    // Split today with time to get time
    let splitTimeArray = todayWithTime.split(' ');
    let splitTimeOnly = splitTimeArray[1];

    let object = {
      activity: 'breastfeeding',
      breast: breast_,
      dateTime: todayWithTime,
      time: splitTimeOnly,
      duration: this.timer.tick
    }

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
          // console.log("Feeding::getLastBreastFeed(): last date retrieved is:", doc.data().date);

          // If last breastfeeding exists
          if(this.lastBreastFeed){
            this.momentsAgoSubscription.unsubscribe();
          };

          // NOTE: MOMENTS AGO HACK...
          this.momentsAgoTime = moment(doc.data().dateTIme, 'YYYY-MM-DD HH:mm:ss');
          this.createMomentObservable(this.momentsAgoTime, 'breastfeeding');

          this.lastBreastFeed = this.ft.formatDateTimeStandard(doc.data().dateTime);
          this.lastBreastSide = doc.data().breast;
          this.lastDuration = doc.data().duration;
        };
      });
    });
  }

  createMomentObservable(momentsAgoTime : any, activity: any){
    if(activity == "bottlefeeding"){
      this.BottleMomentsAgoSubscription = Observable.interval(1000).subscribe(x => {
        this.BottleMomentsAgo = momentsAgoTime.startOf('seconds').fromNow();
        // console.log("moments ago is:", this.momentsAgo);
      });
    } else if(activity == "meal"){
      this.MealMomentsAgoSubscription = Observable.interval(1000).subscribe(x => {
        this.MealMomentsAgo = momentsAgoTime.startOf('seconds').fromNow();
        // console.log("moments ago is:", this.momentsAgo);
      });
    } else {
      this.momentsAgoSubscription = Observable.interval(1000).subscribe(x => {
        this.momentsAgo = momentsAgoTime.startOf('seconds').fromNow();
        // console.log("moments ago is:", this.momentsAgo);
      });
    };
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
        let timeTemp = new Date(breastFeeding.time);

        let time = this.addZeroToTime(timeTemp.getHours()) + ':' + this.addZeroToTime(timeTemp.getMinutes()) + ':' +
        this.addZeroToTime(timeTemp.getSeconds());

        // String up date and time and call the method to standardize the time
        let dateTime = date + " " + time;
        /////////////////////////////////////////////////////////////////

        let bfManualObject = {
          activity: 'breastfeeding',
          breast: breastFeeding.breast + ' breast',
          dateTime: dateTime,
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
    let todayWithTime = this.ft.getTodayMonthFirstWithTime();

    // Split today with time to get time
    let splitTimeArray = todayWithTime.split(' ');
    let splitTimeOnly = splitTimeArray[1];

    this.checkIfBottleNoteExist(todayWithTime, splitTimeOnly).then(object => {
      this.db.saveBabyActivity("bottlefeeding", object).then(() => {
        // this.getLastBreastFeed();

        // Reset the duration counter and bottle note after saving
        this.bottle.duration = "00:00:00";
        this.bottleNote = null;

        // Set the app to remember the new
        this.getLastBottleFeed();

        if(this.timer.tick != 0){
          this.timer.refreshTimer();
        };
      });
    });
  }

  checkIfBottleNoteExist(todayWithTime: any, splitTimeOnly: any){
    return new Promise(resolve => {
      let object = {};

      if(this.bottle.volume == undefined){
        this.bottle.volume = 6;
      };

      if(this.bottleNote){
        if(this.timer.tick != 0){
          object = {
            activity: 'bottlefeeding',
            type: this.bottle.type,
            dateTime: todayWithTime,
            volume: this.bottle.volume,
            time: splitTimeOnly,
            duration: this.timer.tick,
            unit: this.bottle.unit,
            note: this.bottleNote
          }
        } else {
          let duration = this.convertDurationToseconds();
          object = {
            activity: 'bottlefeeding',
            type: this.bottle.type,
            dateTime: todayWithTime,
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
            activity: 'bottlefeeding',
            type: this.bottle.type,
            dateTime: todayWithTime,
            volume: this.bottle.volume,
            time: splitTimeOnly,
            duration: this.timer.tick,
            unit: this.bottle.unit,
          }
        } else {
          let duration = this.convertDurationToseconds();
          object = {
            activity: 'bottlefeeding',
            type: this.bottle.type,
            dateTime: todayWithTime,
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

  manuallyAddBottle(){
    this.openBottleModal().then((bottleFeeding) => {
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
        // console.log("bottlefeeding.date is:", bottleFeeding.date);
        // console.log("datetemp is:", dateTemp);
        // Have to add plus one to getUTCMonth because Jan=0, Feb=1, etc..
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
        let timeTemp = new Date(bottleFeeding.time);

        let time = this.addZeroToTime(timeTemp.getHours()) + ':' + this.addZeroToTime(timeTemp.getMinutes()) + ':' +
        this.addZeroToTime(timeTemp.getSeconds());

        // String up date and time and call the method to standardize the time
        let dateTime = date + " " + time;
        /////////////////////////////////////////////////////////////////

        if(bottleFeeding.volume == undefined){
          bottleFeeding.volume = 6;
        };

        let manualObject = {};

        if(bottleFeeding.note){
          manualObject = {
            activity: 'bottlefeeding',
            type: bottleFeeding.type,
            dateTime: dateTime,
            volume: bottleFeeding.volume,
            time: time,
            duration: totalDuration,
            unit: bottleFeeding.unit,
            note: bottleFeeding.note
          }
        } else {
          manualObject = {
            activity: 'bottlefeeding',
            type: bottleFeeding.type,
            dateTime: dateTime,
            volume: bottleFeeding.volume,
            time: time,
            duration: totalDuration,
            unit: bottleFeeding.unit
          }
        };

        // Call method to store into Database
        this.db.saveBabyActivity('bottlefeeding', manualObject).then((retVal) => {
          if(retVal = true){
            console.log("Manual bottleFeeding saved successfully");
          } else {
            console.log("Manual bottleFeeding was not saved succesfully. Something happend");
          };
          this.getLastBottleFeed();
        });
      };
    });
  }

  getLastBottleFeed(){
    this.BottleMomentsAgo = '';
    let count = 0;
    let babyRef = this.db.getCurrentBabyRef();
    babyRef.get().then((latestSnapshot) => {
        latestSnapshot.forEach(doc => {
          count = count + 1;
          // console.log("Feeding::getLastBreastFeed(): lastest breastfeed:", doc.data());
        });
    });

    babyRef.get().then((latestSnapshot) => {
      latestSnapshot.forEach(doc => {
        count = count - 1;
        if(count == 0){
          // If last breastfeeding exists
          if(this.lastBottleFeed){
            this.BottleMomentsAgoSubscription.unsubscribe();
          };

          // NOTE: MOMENTS AGO HACK...
          this.BottleMomentsAgoTime = moment(doc.data().dateTime, 'YYYY-MM-DD HH:mm:ss');
          this.createMomentObservable(this.BottleMomentsAgoTime, "bottlefeeding");

          this.lastBottleFeed = this.ft.formatDateTimeStandard(doc.data().dateTime);
          this.lastBottleDuration = doc.data().duration;
          this.bottleLastAmount = doc.data().volume + " " + doc.data().unit;
        };
      });
      this.updateBottleSummary();
    });
  }

  updateBottleSummary(){
    this.lifoHistory.init().then(() => {
      this.lifoHistory.lifoHistory('bottlefeeding').then(() => {
        this.bottleHasToday = this.lifoHistory.hasToday;
        this.bottleHasYesterday = this.lifoHistory.hasYesterday;
        this.bottleHasMore = this.lifoHistory.hasMore;
        if(this.bottleHasToday == true){
          this.todayHistoryArray = this.lifoHistory.todayHistoryArray;
          // console.log("THIS TDOAY HISTORY ARRAY:", this.todayHistoryArray);
        }
        this.yesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
        this.moreHistoryArray = this.lifoHistory.moreHistoryArray;
      });
    })
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
        // console.log("THIS bottlenote is true: ", val);
      } else {
        // console.log("THIS bottlenote is false: ", val);
      };
    });
  }

  waitForAlertReturn() : any{
    return new Promise(resolve => {
      this.nAlert.onDidDismiss(data => {
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

  ///// MEALS BEGIN HERE //////////////////
  saveMeal(){
    let todayWithTime = this.ft.getTodayMonthFirstWithTime();

    // Split today with time to get time
    let splitTimeArray = todayWithTime.split(' ');
    let splitTimeOnly = splitTimeArray[1];
    let object = {};

    if(this.mealDetail != undefined){
      object = {
        activity: 'meal',
        dateTime: todayWithTime,
        time: splitTimeOnly,
        note: {note: this.mealDetail}
      }
    } else {
      object = {
        activity: 'meal',
        dateTime: todayWithTime,
        time: splitTimeOnly
      }
    };

    this.db.saveBabyActivity("meal", object).then(() => {
      this.mealDetail = null;
      // Set the app to remember the new
      this.getLastMeal();
    });
  }

  getLastMeal(){
    this.MealMomentsAgo = '';
    let count = 0;
    let babyRef = this.db.getBabyReference();
    babyRef.collection('meal')
      // .where('date', '==', 'date')
      .get().then((latestSnapshot) => {
        latestSnapshot.forEach(doc => {
          count = count + 1;
          // console.log("Feeding::getLastBreastFeed(): lastest breastfeed:", doc.data());
        });
    });

    babyRef.collection('meal').get().then((latestSnapshot) => {
      latestSnapshot.forEach(doc => {
        count = count - 1;
        if(count == 0){
          // If last breastfeeding exists
          if(this.lastMeal){
            this.MealMomentsAgoSubscription.unsubscribe();
            this.lastMealDetail = null;
          };

          // NOTE: MOMENTS AGO HACK...
          this.MealMomentsAgoTime = moment(doc.data().dateTime, 'YYYY-MM-DD HH:mm:ss');
          this.createMomentObservable(this.MealMomentsAgoTime, "meal");

          this.lastMeal = this.ft.formatDateTimeStandard(doc.data().dateTime);
          if(doc.data().detail){
            this.lastMealDetail = doc.data().detail;
          };
        };
      });
      this.updateMealSummary();
    });
  }

  updateMealSummary(){
    this.lifoHistory.init().then(() => {
      this.lifoHistory.lifoHistory('meal').then(() => {
        this.mealHasToday = this.lifoHistory.hasToday;
        // console.log("update meal has today is", this.mealHasToday);
        this.mealHasYesterday = this.lifoHistory.hasYesterday;
        this.mealHasMore = this.lifoHistory.hasMore;
        if(this.mealHasToday == true){
          this.mealTodayHistoryArray = this.lifoHistory.todayHistoryArray;
        }
        this.mealYesterdayHistoryArray = this.lifoHistory.yesterdayHistoryArray;
        this.mealMoreHistoryArray = this.lifoHistory.moreHistoryArray;
      });
    })
  }

  manuallyAddMeal(){
    this.openMealModal().then((meal) => {
      if (meal == undefined){
        console.log("Feeding::manualAdd(): user canceled modal");
      } else {

        let dateTemp = new Date(meal.date);
        // console.log("bottlefeeding.date is:", bottleFeeding.date);
        // console.log("datetemp is:", dateTemp);
        // Have to add plus one to getUTCMonth because Jan=0, Feb=1, etc..
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
        let timeTemp = new Date(meal.time);

        let time = this.addZeroToTime(timeTemp.getHours()) + ':' + this.addZeroToTime(timeTemp.getMinutes()) + ':' +
        this.addZeroToTime(timeTemp.getSeconds());

        // String up date and time and call the method to standardize the time
        let dateTime = date + " " + time;
        /////////////////////////////////////////////////////////////////

        let manualObject = {};

        if(meal.detail){
          manualObject = {
            activity: 'meal',
            dateTime: dateTime,
            time: time,
            note: meal.detail
          }
        } else {
          manualObject = {
            activity: 'meal',
            dateTime: dateTime,
            time: time
          }
        };

        // Call method to store into Database
        this.db.saveBabyActivity('meal', manualObject).then((retVal) => {
          if(retVal = true){
            console.log("Manual bottleFeeding saved successfully");
          } else {
            console.log("Manual bottleFeeding was not saved succesfully. Something happend");
          };
          this.getLastMeal();
        });
      };
    });
  }

  openMealModal() : any {
    return new Promise(resolve =>{
      this.mealModal = this.modal.create(MealModalPage);
      this.mealModal.present();
      resolve(this.waitForMealReturn());
    })
  }

  waitForMealReturn() : any{
    return new Promise(resolve => {
      this.mealModal.onDidDismiss( data => {
        // console.log("WAIT FOR RETURN DATA IS:", data);
        let babyObject = data;
        resolve(babyObject);
      });
    });
  }
}
