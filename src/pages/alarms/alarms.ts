import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';
import { UserProvider } from '../../providers/user/user';
import { BabyProvider } from '../../providers/baby/baby';
// import { NativeStorage } from '@ionic-native/native-storage';
import { AlarmsModalPage } from '../alarms-modal/alarms-modal';


@Component({
  selector: 'page-alarms',
  templateUrl: 'alarms.html',
})
export class AlarmsPage {
  // feedingAlarm: boolean;
  bottleFeedingAlarmIsOn: boolean;
  lastBottleFeed: any;
  lastBottleDuration: any;
  initFlag: boolean;
  bottleAlarmModal: any;

  hrs: any;
  mins: any;

  // only for testing purpose
  secs: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private db: DatabaseProvider,
    private ft: FormattedTodayProvider,
    private user: UserProvider,
    private baby: BabyProvider,
    // private nativeStorage: NativeStorage,
    private modal: ModalController) {
    this.init();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AlarmsPage');
    console.log("bottle feeding alarm is on", this.bottleFeedingAlarmIsOn);
  }

  init(){
    // Default every 2 hrs
    // this.hrs = "2";

    this.checkIfAlarmExist("bottlefeeding").then(retVal => {
      if(retVal === false){
        this.bottleFeedingAlarmIsOn = false;
      } else  {
        this.bottleFeedingAlarmIsOn = true;
      }
    }).then(async () => {
      await this.getLastBottleFeeding();
    });
  }

  async getLastBottleFeeding(){
    // this.BottleMomentsAgo = '';
    let count = 0;
    let activityRef;
    await this.db.getActivityReference("bottlefeeding").then(_activityRef => {
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
      latestSnapshot.forEach(async doc => {
        count = count - 1;
        if(count == 0){
          // If last breastfeeding exists
          // if(this.lastBottleFeed){
          //   this.BottleMomentsAgoSubscription.unsubscribe();
          // };
          //
          // // NOTE: MOMENTS AGO HACK...
          // this.BottleMomentsAgoTime = moment(doc.data().dateTime, 'YYYY-MM-DD HH:mm:ss');
          // // console.log("bootle moments ago time ", this.BottleMomentsAgoTime)
          // this.createMomentObservable(this.BottleMomentsAgoTime, "bottlefeeding");

          this.lastBottleFeed = doc.data().dateTime;
          this.lastBottleDuration = doc.data().duration;
          // console.log("last bottlefeed", this.lastBottleFeed);
          // console.log("last bottlefeed duration", this.lastBottleDuration);
          // await this.nativeStorage.setItem('lastBottleFeed', doc.data());
        };
      });
    });
  }

  editBottleFeedingAlarm(){
    console.log("Editing feeding alarm");
    this.openBottleAlarmModal().then(bottleAlarm => {
      let object: any;
      object = bottleAlarm;
      if(bottleAlarm != undefined){
        console.log("bottleAlarm is", bottleAlarm);
        this.hrs = object._hrs;
        if(object._mins != "00"){
          this.mins = object._mins;
        } else {
          this.mins = undefined;
        }
      } else {
        console.log("User cancel bottle feed alarm modal");
      }
    });
  }

  addZeroToTime(time : any) : any{
    if(time < 10){
      time = "0" + time;
    };
    return time;
  }

  openBottleAlarmModal(){
    return new Promise(resolve => {
      let time: string;

      let checkHrs = this.addZeroToTime(this.hrs);

      if(this.hrs == undefined && this.mins == undefined){
        time = "02:00";
      } else if (this.hrs != undefined && this.mins == undefined){
        time = checkHrs + ":00";
      } else if (this.hrs == undefined && this.mins != undefined){
        time = "00:" + this.mins;
      } else if (this.hrs != undefined && this.mins != undefined){
        time = checkHrs + ':' + this.mins;
      };

      console.log("TIme to pass to alarm modal is", time);

      let object = {
        time: time
      };

      this.bottleAlarmModal = this.modal.create(AlarmsModalPage, {object: object});
      this.bottleAlarmModal.present();
      resolve(this.waitForBottleAlarmModalReturn());
    });
  }

  waitForBottleAlarmModalReturn() : any{
    return new Promise(resolve => {
      this.bottleAlarmModal.onDidDismiss( data => {
        console.log("WAIT FOR RETURN DATA IS:", data);
        let alarm = data;
        resolve(alarm);
      });
    });
  }

  toggleBottleFeedingAlarm($event?){
    console.log("1. Feeding alarm is on", this.bottleFeedingAlarmIsOn);
    if(this.bottleFeedingAlarmIsOn){
      this.turnOffOn();
      console.log("2. Turning bottle feeding alarm off", this.bottleFeedingAlarmIsOn)
    } else {
      this.turnOffOn();
      console.log("2. Turning bottle feeding alarm on", this.bottleFeedingAlarmIsOn)
      this.getAlarmReference().then(alarmRef => {
        this.saveAlarm(alarmRef);
      });
    }
  }

  turnOffOn(){
    this.bottleFeedingAlarmIsOn = !this.bottleFeedingAlarmIsOn;
  }

  async checkIfAlarmExist(activity: any){
    return new Promise(async resolve => {
      // if(activity == "bottlefeeding"){
      //   await this.getLastBottleFeeding();
      //   await this.nativeStorage.getItem('lastBottleFeed').then(data => {
      //     console.log("Found last bottlefeed in native storage", data);
      //     resolve(true);
      //   }, error => {
      //     console.log("Error:: no last bottlefeed in native storage", error);
      //     resolve(false);
      //   });
      // }
      let alarmRef = await this.getAlarmReference();

      if(alarmRef.exists){
        resolve(true);
      } else {
        resolve(false);
      };
    });
  }

  async getAlarmReference(){
    let alarmRef: any;
    await this.db.getAlarmReference("bottlefeeding").then(_alarmRef => {
      alarmRef = _alarmRef;
    });
    return alarmRef;
  }

  saveAlarm(alarmRef: any){
    console.log("last bottlefeed is", this.lastBottleFeed);
    console.log("last bottlefeed duration is", this.lastBottleDuration);
    console.log("alarm reference is:", alarmRef);
  }

}
