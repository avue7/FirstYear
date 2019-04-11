import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController, ToastController, Platform} from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';
import { UserProvider } from '../../providers/user/user';
import { BabyProvider } from '../../providers/baby/baby';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { FeedingPage } from '../feeding/feeding';

// import { NativeStorage } from '@ionic-native/native-storage';
import { AlarmsModalPage } from '../alarms-modal/alarms-modal';
import * as moment from 'moment';
import * as firebase from 'firebase/app';

declare var cordova;

@Component({
  selector: 'page-alarms',
  templateUrl: 'alarms.html',
})
export class AlarmsPage {
  // @ViewChild(Nav) nav: Nav;
  // feedingAlarm: boolean;
  // lastBottleFeed: any;
  // lastBottleDuration: any;
  initFlag: boolean;


  hrs: any;
  mins: any;

  bottleAlarm: any = {};
  bottleAlarmExists: boolean;
  bottleAlarmModal: any;
  bottleAlarmDisable: boolean;
  bottleFeedingAlarmIsOn: boolean;


  breastHours: any;
  breastMinutes: any;
  breastAlarm: any = {};
  breastAlarmExists: boolean;
  breastAlarmModal: any;
  breastAlarmDisable: boolean;
  breastAlarmIsOn: boolean;


  // only for testing purpose
  secs: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private db: DatabaseProvider,
    private ft: FormattedTodayProvider,
    private user: UserProvider,
    private baby: BabyProvider,
    private nav: NavController,
    // private nativeStorage: NativeStorage,
    private platform: Platform,
    private modal: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private localNotifications: LocalNotifications) {

    cordova.plugins.notification.local.on('turnoff', async () => {
      // cordova.plugins.notification.local.cancel(1);
      await this.toggleBottleFeedingAlarm();
    });

    cordova.plugins.notification.local.on('turnoff2', async () => {
      // cordova.plugins.notification.local.cancel(1);
      await this.toggleBreastFeedingAlarm();
    });

    this.init();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AlarmsPage');
    console.log("ION:: just loaded bottle feeding alarm is on", this.bottleFeedingAlarmIsOn);
  }

  init(){
    this.hrs = null;
    this.mins = null;

    this.bottleAlarm = null;
    this.bottleAlarmExists = false;
    this.bottleFeedingAlarmIsOn = false;

    this.breastHours;
    this.breastMinutes;
    this.breastAlarm = null;
    this.breastAlarmExists = false;
    this.breastAlarmIsOn = false;

    this.checkIfAlarmExist("bottlefeeding").then(retVal => {
      if(retVal === false){
        if(this.hrs == undefined && this.mins == undefined){
          this.bottleAlarmDisable = true;
        }
      };
    }).then(() => {
      this.checkIfAlarmExist("breastfeeding").then(retVal => {
        if(retVal === false){
          if(this.breastHours == undefined && this.breastMinutes == undefined){
            this.breastAlarmDisable = true;
          };
        };
      })
    })
  }

  async checkIfAlarmExist(activity: any){
    return new Promise(async resolve => {
      if(activity == "bottlefeeding"){
        let alarmRef = await this.getAlarmReference("bottlefeeding");

        alarmRef.get().then(querySnapshot => {
          if(!querySnapshot.empty){
            console.log("Alarm exists");
            querySnapshot.forEach((doc) => {
              this.bottleAlarm = doc.data().alarm;

              let status = doc.data().status;
              if(status == 'on'){
                this.bottleFeedingAlarmIsOn = true;
              } else {
                this.bottleFeedingAlarmIsOn = false;
              }
              console.log("Bottle alarm is on", this.bottleFeedingAlarmIsOn);

              this.bottleAlarmExists = true;
              console.log("Bottle alarm from database is", this.bottleAlarm);

              this.getMinsHrs();

              resolve(true);
            });
          } else {
            console.log("Alarm does not exists");
            this.bottleAlarmExists = false;
            this.bottleFeedingAlarmIsOn = false;
            resolve(false);
          };
        });
      } else if(activity == "breastfeeding"){
        let alarmRef = await this.getAlarmReference("breastfeeding");

        alarmRef.get().then(querySnapshot => {
          if(!querySnapshot.empty){
            console.log("Breast Alarm exists");
            querySnapshot.forEach((doc) => {
              this.breastAlarm = doc.data().alarm;

              let status = doc.data().status;
              if(status == 'on'){
                this.breastAlarmIsOn = true;
              } else {
                this.breastAlarmIsOn = false;
              }
              console.log("Breast alarm is on", this.breastAlarmIsOn);

              this.breastAlarmExists = true;
              console.log("Breast alarm from database is", this.breastAlarm);

              this.getBreastMinsHrs();

              resolve(true);
            });
          } else {
            console.log("Breast Alarm does not exists");
            this.breastAlarmExists = false;
            this.breastAlarmIsOn = false;
            resolve(false);
          };
        });
      }
    });
  }

  editBottleFeedingAlarm(){
    console.log("====== Editing feeding alarm =====");
    this.openBottleAlarmModal().then(async bottleAlarm => {
      let object: any;
      object = bottleAlarm;
      if(bottleAlarm != undefined){
        console.log("bottleAlarm is", bottleAlarm);

        if(this.hrs != undefined || this.mins != undefined){
          // IF hrs and mins from modal is different then we need to update
          // alarm in the database and also need to cancel alarm and restart it.
          if(this.hrs != object._hrs || this.mins != object._mins){
            console.log("HRS and MINS returned from modal are different.")

            if(object._hrs != "0"){
              this.hrs = object._hrs;
            } else {
              this.hrs = undefined;
            }

            if(object._mins != "0"){
              this.mins = object._mins;
            } else {
              this.mins = undefined;
            }

            let additionalTime: number = 0;

            if(this.hrs != undefined){
              additionalTime += ((parseInt(this.hrs, 10)) * 60);
            }

            if(this.mins != undefined){
              additionalTime += parseInt(this.mins, 10);
            }

            let alarmRef: any;

            await this.getAlarmReference('bottlefeeding').then((ref) => {
              alarmRef = ref;
            });

            let triggerObject: any = {
              every: additionalTime,
              unit: "minute"
            };

            await alarmRef.get().then(querySnapshot => {
              querySnapshot.forEach((doc) => {
                doc.ref.update({
                  "alarm.trigger": triggerObject
                }).then((suc) =>{
                  console.log("Done updating trigger in database");
                });
              });
            });

            this.scheduleNotification(additionalTime, "bottlefeeding");
          }
        } else {
          if(object._hrs != "0"){
            this.hrs = object._hrs;
          } else {
            this.hrs = undefined;
          }

          if(object._mins != "0"){
            this.mins = object._mins;
          } else {
            this.mins = undefined;
          }

          let additionalTime: number = 0;

          if(this.hrs != undefined){
            additionalTime += ((parseInt(this.hrs, 10)) * 60);
          }

          if(this.mins != undefined){
            additionalTime += parseInt(this.mins, 10);
          }
        }

        this.bottleAlarmDisable = false;

        if(this.bottleFeedingAlarmIsOn === false){
          this.toggleBottleFeedingAlarm();
        };

      } else {
        console.log("User cancel bottle feed alarm modal");
      }
    });
  }

  editBreastFeedingAlarm(){
    console.log("====== Editing breast alarm ======");
    this.openBreastAlarmModal().then(async breastAlarm => {
      let object: any;
      object = breastAlarm;
      if(breastAlarm != undefined){
        console.log("breastAlarm is", breastAlarm);

        if(this.breastHours != undefined || this.breastMinutes != undefined){
          // IF hrs and mins from modal is different then we need to update
          // alarm in the database and also need to cancel alarm and restart it.
          if(this.breastHours != object._hrs || this.breastMinutes != object._mins){
            console.log("HRS and MINS returned from modal are different.")

            if(object._hrs != "0"){
              this.breastHours = object._hrs;
            } else {
              this.breastHours = undefined;
            }

            if(object._mins != "0"){
              this.breastMinutes = object._mins;
            } else {
              this.breastMinutes = undefined;
            }

            let additionalTime: number = 0;

            if(this.breastHours != undefined){
              additionalTime += ((parseInt(this.breastHours, 10)) * 60);
            }

            if(this.breastMinutes != undefined){
              additionalTime += parseInt(this.breastMinutes, 10);
            }

            let alarmRef: any;

            await this.getAlarmReference('breastfeeding').then((ref) => {
              alarmRef = ref;
            });

            let triggerObject: any = {
              every: additionalTime,
              unit: "minute"
            };

            await alarmRef.get().then(querySnapshot => {
              querySnapshot.forEach((doc) => {
                doc.ref.update({
                  "alarm.trigger": triggerObject
                }).then((suc) =>{
                  console.log("Done updating trigger in database");
                });
              });
            });

            this.scheduleNotification(additionalTime, "breastfeeding");
          }
        } else {
          if(object._hrs != "0"){
            this.breastHours = object._hrs;
          } else {
            this.breastHours = undefined;
          }

          if(object._mins != "0"){
            this.breastMinutes = object._mins;
          } else {
            this.breastMinutes = undefined;
          }

          let additionalTime: number = 0;

          if(this.breastHours != undefined){
            additionalTime += ((parseInt(this.breastHours, 10)) * 60);
          }

          if(this.breastMinutes != undefined){
            additionalTime += parseInt(this.breastMinutes, 10);
          }
        }

        this.breastAlarmDisable = false;

        if(this.breastAlarmIsOn === false){
          this.toggleBreastFeedingAlarm();
        };

      } else {
        console.log("User cancel breast feed alarm modal");
      }
    });
  }

  async scheduleNotification(triggerMins: any, activity: any){
    if(this.platform.is('cordova')){
      if(activity == "bottlefeeding"){
        this.localNotifications.cancel(1).then(() =>{
          console.log("2. Scheduling ....")

          if(this.bottleAlarmExists){
            this.bottleAlarm.trigger = {
              every: triggerMins, unit: 'minute'
            };
          } else {
            this.bottleAlarm = {
              id: 1,
              title: "Bottle-Feeding Alarm",
              text: "It's time to feed your baby",
              sound: "res://ic_popup_reminder",
              // sound: 'file://sound.mp3',
              vibrate: true,
              launch: true,
              wakeup: true,
              autoClear: true,
              led: true,
              priority: 2,
              trigger: {every: triggerMins, unit: 'minute'},
              actions: [
                { id: 'turnoff', title: 'Turn-off Alarm'},
                { id: 'clear', title: 'Clear'}
              ]
            };

            this.saveAlarm(activity, this.bottleAlarm);
          };

          cordova.plugins.notification.local.schedule(this.bottleAlarm, suc => {
            console.log("Done scheduling", suc);

            cordova.plugins.notification.local.isScheduled(1, scheduled => {
              console.log("Is it scheduled? ", scheduled ? 'Yes' : 'No');
            });

            let babyFirstName = this.baby.getBabyFirstName();

            if(suc){
              let toast = this.toastCtrl.create({
                message: babyFirstName + "'s recurring alarm for bottle-feeding was turned on.",
                duration: 3000
              });
              toast.present();
            };
          })
        });
      } else if(activity == "breastfeeding"){
        this.localNotifications.cancel(2).then(() =>{
          console.log("2. Scheduling ....")

          if(this.breastAlarmExists){
            this.breastAlarm.trigger = {
              every: triggerMins, unit: 'minute'
            };
          } else {
            this.breastAlarm = {
              id: 2,
              title: "Breast-Feeding Alarm",
              text: "It's time to feed your baby",
              sound: "res://ic_popup_reminder",
              // sound: 'file://sound.mp3',
              vibrate: true,
              launch: true,
              wakeup: true,
              autoClear: true,
              led: true,
              priority: 2,
              trigger: {every: triggerMins, unit: 'minute'},
              actions: [
                { id: 'turnoff2', title: 'Turn-off Alarm'},
                { id: 'clear', title: 'Clear'}
              ]
            };

            this.saveAlarm(activity, this.breastAlarm);
          };

          cordova.plugins.notification.local.schedule(this.breastAlarm, suc => {
            console.log("Done scheduling", suc);

            cordova.plugins.notification.local.isScheduled(2, scheduled => {
              console.log("Is it scheduled? ", scheduled ? 'Yes' : 'No');
            });

            let babyFirstName = this.baby.getBabyFirstName();

            if(suc){
              let toast = this.toastCtrl.create({
                message: babyFirstName + "'s recurring alarm for breast-feeding was turned on.",
                duration: 3000
              });
              toast.present();
            };
          })
        });
      };
    };
  }

  async toggleBottleFeedingAlarm($event?){
    console.log("1. Feeding alarm is on", this.bottleFeedingAlarmIsOn);
    if(this.bottleFeedingAlarmIsOn){
      // Turn alarm off
      await this.turnOff("bottlefeeding");
      console.log("2. Turning bottle feeding alarm off", this.bottleFeedingAlarmIsOn)
    } else {
      if(this.hrs == undefined && this.mins == undefined){
        this.bottleAlarmDisable = true;
        // this.mustSpecifyTimeAlert();
      } else {
        await this.turnOn("bottlefeeding");
        console.log("2. Turning bottle feeding alarm on", this.bottleFeedingAlarmIsOn)
      };
    };
  }

  async toggleBreastFeedingAlarm($event?){
    console.log("1. Feeding alarm is on", this.breastAlarmIsOn);
    if(this.breastAlarmIsOn){
      // Turn alarm off
      await this.turnOff("breastfeeding");
      console.log("2. Turning breast feeding alarm off", this.breastAlarmIsOn)
    } else {
      if(this.breastHours == undefined && this.breastMinutes == undefined){
        this.breastAlarmDisable = true;
        // this.mustSpecifyTimeAlert();
      } else {
        await this.turnOn("breastfeeding");
        console.log("2. Turning breast feeding alarm on", this.breastAlarmIsOn)
      };
    };
  }

  async turnOff(activity: any){
    return new Promise(async resolve => {
      let alarmRef: any;

      await this.getAlarmReference(activity).then((ref) => {
        alarmRef = ref;
      });

      await alarmRef.get().then(querySnapshot => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({
            "status": "off"
          });
        });
      });

      if(activity == "bottlefeeding"){
        cordova.plugins.notification.local.cancel(1);
        resolve(this.bottleFeedingAlarmIsOn = false);
      } else if (activity == "breastfeeding"){
        cordova.plugins.notification.local.cancel(2);
        resolve(this.breastAlarmIsOn = false);
      }
    });
  }

  async turnOn(activity: any){
    return new Promise(async resolve => {
      let alarmRef: any;

      await this.getAlarmReference(activity).then((ref) => {
        alarmRef = ref;
      });

      await alarmRef.get().then(querySnapshot => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({
            "status": "on"
          });
        });
      });

      if(activity == "bottlefeeding"){
        let additionalTime: number = 0;

        if(this.hrs != undefined){
          additionalTime += ((parseInt(this.hrs, 10)) * 60);
        }

        if(this.mins != undefined){
          additionalTime += parseInt(this.mins, 10);
        }

        this.scheduleNotification(additionalTime, "bottlefeeding");

        resolve(this.bottleFeedingAlarmIsOn = true);
      } else if (activity == "breastfeeding"){
        let additionalTime: number = 0;

        if(this.breastHours != undefined){
          additionalTime += ((parseInt(this.breastHours, 10)) * 60);
        }

        if(this.breastMinutes != undefined){
          additionalTime += parseInt(this.breastMinutes, 10);
        }

        this.scheduleNotification(additionalTime, "breastfeeding");

        resolve(this.breastAlarmIsOn = true);
      }
    });
  }

  saveAlarm(activity: any, alarmObject: any){
    // console.log("last bottlefeed is", this.lastBottleFeed);
    // console.log("last bottlefeed duration is", this.lastBottleDuration);
    let db = firebase.firestore();
    db.settings({
      timestampsInSnapshots: true
    });


    let object: any = {};

    let babyFirstName = this.baby.getBabyFirstName();
    let userId = this.user.getUserId();

    object.activity = activity;
    object.babyFirstName = babyFirstName;
    object.userId = userId;
    object.alarm = alarmObject;
    object.status = "on";


    db.collection('alarms').doc().set(object).then((error) => {
      if(error){
        console.log("Error, could not save alarm", error);
      } else {
        if(activity == "bottlefeeding"){
          this.bottleAlarmExists = true;
        } else if(activity == "breastfeeding"){
          this.breastAlarmExists = true;
        }

        this.onToast(activity, babyFirstName);
        console.log("Successfully saved alarm");
      }
    });
  }

  openBottleAlarmModal(){
    return new Promise(resolve => {
      let time: string;

      let checkHrs = this.addZeroToTime(this.hrs);
      let checkMins = this.addZeroToTime(this.mins);

      if(this.hrs == undefined && this.mins == undefined){
        time = "02:00";
      } else if (this.hrs != undefined && this.mins == undefined){
        time = checkHrs + ":00";
      } else if (this.hrs == undefined && this.mins != undefined){
        time = "00:" + checkMins;
      } else if (this.hrs != undefined && this.mins != undefined){
        time = checkHrs + ':' + checkMins;
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

  openBreastAlarmModal(){
    return new Promise(resolve => {
      let time: string;

      let checkHrs = this.addZeroToTime(this.breastHours);
      let checkMins = this.addZeroToTime(this.breastMinutes);

      if(this.breastHours == undefined && this.breastMinutes == undefined){
        time = "02:00";
      } else if (this.breastHours != undefined && this.breastMinutes == undefined){
        time = checkHrs + ":00";
      } else if (this.breastHours == undefined && this.breastMinutes != undefined){
        time = "00:" + checkMins;
      } else if (this.breastHours != undefined && this.breastMinutes != undefined){
        time = checkHrs + ':' + checkMins;
      };

      console.log("TIme to pass to alarm modal is", time);

      let object = {
        time: time
      };

      this.breastAlarmModal = this.modal.create(AlarmsModalPage, {object: object});
      this.breastAlarmModal.present();
      resolve(this.waitForBreastAlarmModalReturn());
    });
  }

  waitForBreastAlarmModalReturn() : any{
    return new Promise(resolve => {
      this.breastAlarmModal.onDidDismiss( data => {
        console.log("WAIT FOR RETURN DATA IS:", data);
        let alarm = data;
        resolve(alarm);
      });
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

  async getAlarmReference(activity: any){
    let alarmRef: any;
    console.log("Get alarm ref activity is", activity);
    await this.db.getAlarmReference(activity).then(_alarmRef => {
      alarmRef = _alarmRef;
    });

    return alarmRef;
  }

  getBreastMinsHrs(){
    let n = this.breastAlarm.trigger.every;
    let hours = ((parseInt(n, 10))/60);
    let rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);

    if(rhours != 0){
      this.breastHours = rhours;
    }
    if(rminutes != 0){
      this.breastMinutes = rminutes;
    }
  }

  getMinsHrs(){
    let n = this.bottleAlarm.trigger.every;
    let hours = ((parseInt(n, 10))/60);
    let rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);

    if(rhours != 0){
      this.hrs = rhours;
    }
    if(rminutes != 0){
      this.mins = rminutes;
    }
  }

  addZeroToTime(time : any) : any{
    if(time < 10){
      time = "0" + time;
    };
    return time;
  }

  turnOffOn(){
    this.bottleFeedingAlarmIsOn = !this.bottleFeedingAlarmIsOn;
  }


  failureToast(){
    let toast = this.toastCtrl.create({
      message: "Error: failed to save alarm",
      duration: 3000,
      position: "bottom"
    });
    toast.present();
  }

  onToast(activity: any, babyFirstName: any){
    let toast = this.toastCtrl.create({
      message: babyFirstName + "'s reccuring alarm for " + activity + " was turned on.",
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  offToast(activity: any, babyFirstName: any){
    let toast = this.toastCtrl.create({
      message: babyFirstName + "'s reccuring alarm for " + activity + " was turned off.",
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  addAlarm(){
    let toast = this.toastCtrl.create({
      message: "FUCK DUDE....YOU RAN OUT OF TIME TO IMPLEMENT THIS!!!!",
      duration: 5000,
      position: "bottom"
    });
    toast.present();
  }
  // mustSpecifyTimeAlert(){
  //   let toast = this.toastCtrl.create({
  //     message: "Please specify the recurring time first!",
  //     duration: 3000,
  //     position: 'bottom'
  //   });
  //   toast.present();
  // }




    // async getLastBottleFeeding(){
    //   // this.BottleMomentsAgo = '';
    //   let count = 0;
    //   let activityRef;
    //   await this.db.getActivityReference("bottlefeeding").then(_activityRef => {
    //       activityRef = _activityRef;
    //   });
    //
    //   // Use orderBy in firebase and create the Indexes within the firebase console
    //   // to enable query by ascending or descending order. The error log will help you
    //   // create this following the link.
    //   await activityRef.get().then((latestSnapshot) => {
    //       latestSnapshot.forEach(doc => {
    //         count = count + 1;
    //         // console.log("Feeding::getLastBreastFeed(): lastest breastfeed:", doc.data());
    //       });
    //   });
    //
    //   await activityRef.orderBy("dateTime", "asc").get().then((latestSnapshot) => {
    //     latestSnapshot.forEach(async doc => {
    //       count = count - 1;
    //       if(count == 0){
    //         // If last breastfeeding exists
    //         // if(this.lastBottleFeed){
    //         //   this.BottleMomentsAgoSubscription.unsubscribe();
    //         // };
    //         //
    //         // // NOTE: MOMENTS AGO HACK...
    //         // this.BottleMomentsAgoTime = moment(doc.data().dateTime, 'YYYY-MM-DD HH:mm:ss');
    //         // // console.log("bootle moments ago time ", this.BottleMomentsAgoTime)
    //         // this.createMomentObservable(this.BottleMomentsAgoTime, "bottlefeeding");
    //
    //         this.lastBottleFeed = doc.data().dateTime;
    //         console.log("1. last bottlefeed", this.lastBottleFeed);
    //
    //         // NOTE: NEED TO ADD THIS TOO ALL OF THE ACTIVITIES THAT HAVE DURATION IN LAST
    //         if(doc.data().duration){
    //           let startDateTime = moment(this.lastBottleFeed);
    //           this.lastBottleDuration = doc.data().duration;
    //           console.log("2. last bottlefeed duration", this.lastBottleDuration);
    //           let newLastBottleFeed = await moment(startDateTime).add(parseInt(this.lastBottleDuration, 10), 'seconds').format("YYYY-MM-DD HH:mm:ss");
    //           this.lastBottleFeed = newLastBottleFeed;
    //           console.log("3. New last feed date time", this.lastBottleFeed);
    //         }
    //         // console.log("last bottlefeed", this.lastBottleFeed);
    //         // console.log("last bottlefeed duration", this.lastBottleDuration);
    //         // await this.nativeStorage.setItem('lastBottleFeed', doc.data());
    //       };
    //     });
    //   });
    // }
}
