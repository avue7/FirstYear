import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Platform, ViewController} from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import * as moment from 'moment';

@Component({
  selector: 'page-alarms-modal',
  templateUrl: 'alarms-modal.html',
})
export class AlarmsModalPage {
  notifyTime: any;
  notifications: any[] = [];
  days: any[];
  chosenHours: number;
  chosenMinutes: number;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private localNotifications: LocalNotifications,
    private platform: Platform,
    private view: ViewController) {
      this.notifyTime = moment(new Date()).format();

      this.chosenHours = new Date().getHours();
      this.chosenMinutes = new Date().getMinutes();

      this.days = [
          {title: 'Monday', dayCode: 1, checked: false},
          {title: 'Tuesday', dayCode: 2, checked: false},
          {title: 'Wednesday', dayCode: 3, checked: false},
          {title: 'Thursday', dayCode: 4, checked: false},
          {title: 'Friday', dayCode: 5, checked: false},
          {title: 'Saturday', dayCode: 6, checked: false},
          {title: 'Sunday', dayCode: 0, checked: false}
      ];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AlarmsModalPage');
  }

  timeChange(time){
    this.chosenHours = time.hour.value;
    this.chosenMinutes = time.minute.value;
  }




  addNotifications(){
    this.localNotifications.schedule({
      title: "testing",
      // text: "testing",
      trigger: { in: 10 }
    });
    // console.log("CHOSENhours=",this.chosenHours);
    // console.log("ChosenMINUTES",this.chosenMinutes);
    // console.log("Notify time=",this.notifyTime);
    // let currentDate = new Date();
    // let currentDay = currentDate.getDay(); // Sunday = 0, Monday = 1, etc.
    //
    // for(let day of this.days){
    //   if(day.checked){
    //
    //     let firstNotificationTime = new Date();
    //     let dayDifference = day.dayCode - currentDay;
    //
    //     if(dayDifference < 0){
    //         dayDifference = dayDifference + 7; // for cases where the day is in the following week
    //     }
    //
    //     firstNotificationTime.setHours(firstNotificationTime.getHours() + (24 * (dayDifference)));
    //     firstNotificationTime.setHours(this.chosenHours);
    //     firstNotificationTime.setMinutes(this.chosenMinutes);
    //     console.log("Fist notification time=",firstNotificationTime);
    //
    //    let notification = {
    //         id: day.dayCode,
    //         title: 'ALARM',
    //         text: 'Its time to get Up:)',
    //         trigger: { every: 'day', in: 3, unit: 'second'}
    //     };
    //     this.notifications.push(notification);
    //
    //   }
    //
    // }
    //
    // console.log("Notifications to be scheduled: ", this.notifications);
    //
    // if(this.platform.is('cordova')){
    //
    //   // Cancel any existing notifications
    //   this.localNotifications.cancelAll().then(() => {
    //
    //     // Schedule the new notifications
    //     this.localNotifications.schedule(this.notifications);
    //
    //     this.notifications = [];
    //
    //     let alert = this.alertCtrl.create({
    //         title: 'Alarm Set',
    //         buttons: ['Ok']
    //     });
    //     alert.present();
    // });
    // }
  }

  cancelAll(){
    this.localNotifications.cancelAll();

    let alert = this.alertCtrl.create({
      title: 'Alarm cancelled',
      buttons: ['Ok']
    });
    alert.present();

  }

  cancel(){
    this.view.dismiss();
  }

}
