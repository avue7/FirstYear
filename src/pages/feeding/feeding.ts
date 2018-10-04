import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { TimerProvider } from '../../providers/timer/timer';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertController } from 'ionic-angular';
import { BreastfeedingModalPage } from '../breastfeeding-modal/breastfeeding-modal';
import { BfHistoryModalPage } from '../bf-history-modal/bf-history-modal';
import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'page-feeding',
  templateUrl: 'feeding.html',
})
export class FeedingPage {
  leftBreast: any = null;
  rightBreast: any = null;
  activeBreast: any;
  breastfeedingModal: any;
  bfHistoryModal: any;

  lastBreastFeed: any = null;
  lastBreastSide: any = null;
  lastDuration: any = null;

  momentsAgoTime: any;
  momentsAgoSubscription: any;
  momentsAgo: any;




  // Default value for breastfeeding radio left or right
  breastfeeding = "leftBreast";

  segmentType = 'Breast';

  segments: any = {
    'Breast':[

    ],
    'Bottle':[

    ],
    'Meal':[

    ]
  }

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private timer: TimerProvider,
    private ft: FormattedTodayProvider,
    private db: DatabaseProvider,
    private alertCtrl: AlertController,
    private modal: ModalController) {
    this.momentsAgoTime = '';
    this.setLeftBreast();
    this.getLastBreastFeed();
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
    console.log("Feeding::setLeftBreast: leftBreast is", this.leftBreast);
    console.log("Feeding::setLeftBreast: rightBreast is", this.rightBreast);
  }

  setRightBreast(){
    this.rightBreast = true;
    this.leftBreast = false;
    console.log("Feeding::setRightBreast: rightBreast is", this.rightBreast);
    console.log("Feeding::setRightBreast: leftBreast is", this.leftBreast);
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
      console.log("Feeding::save(): feed on the left breast");
    } else{
      breast_ = "right breast";
      console.log("Feeding::save(): feed on the right breast");
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

    console.log("Feeding::save(): object is:", object);
    console.log("Feeding::save(): today is:", today);
    console.log("Feeding::save(): tick is:", this.timer.tick);

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
          // console.log("Feeding::getLastBreastFeed(): count is:", count);
          console.log("Feeding::getLastBreastFeed(): last date retrieved is:", doc.data().date);

          // If last breastfeeding exists
          if(this.lastBreastFeed){
            this.momentsAgoSubscription.unsubscribe();
          };

          // NOTE: MOMENTS AGO HACK...
          this.momentsAgoTime = moment(doc.data().date, 'MM-DD-YYYY HH:mm:ss');
          console.log("SHIT::::", doc.data().date);
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
      this.momentsAgo = momentsAgoTime.startOf().fromNow();
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
        console.log("totalTime is:", totalDuration);

        // Extract only the date
        let dateTemp = new Date(breastFeeding.date);

        // Have to add plus one to getUTCMonth because Jan=0, Feb=1, etc..
        let monthNumber = (Number(dateTemp.getMonth()) + 1);
        let monthString: string;

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

        let date = monthString + '-' + dayString + '-' + dateTemp.getFullYear();
        console.log("date is:", date);
        ///////////////////////////////////////////////////////////////

        // Extract only the time
        let timeTemp = new Date(breastFeeding.time);
        let mins = Number(timeTemp.getMinutes());
        let secs = Number(timeTemp.getSeconds());
        let minString: any;
        let secString: any;

        if(mins < 10){
          minString = mins.toString();
          minString = '0' + minString;
        };

        if(secs < 10){
          secString = secs.toString();
          secString = '0' + secString;
        };

        let time = timeTemp.getHours() + ':' + minString + ':' + secString;
        console.log("time is:", time);

        // String up date and time and call the method to standardize the time
        let dateTime = date + " " + time;
        console.log("dateTime is:", dateTime);
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
      console.log("BF history is", history);
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


}
