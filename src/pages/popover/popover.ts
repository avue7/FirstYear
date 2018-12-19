import { Component } from '@angular/core';
import { ViewController, NavParams, ModalController} from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlarmsModalPage } from '../alarms-modal/alarms-modal';

@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html',
})
export class PopoverPage {
  showDelete: boolean;
  alarmModal: any;

  constructor(private navParams: NavParams,
    private viewCtrl: ViewController,
    private db: DatabaseProvider,
    private modal: ModalController) {
    this.showDelete = false;
    this.checkNumberOfBabies();
  }

  checkNumberOfBabies(){
    let babyArray = this.db.babiesArray;
    let count: number = 0;

    for(let baby of babyArray){
      count = count + 1;
    }

    if(count > 1){
      this.showDelete = true;
    };

    console.log("Number of babies is", count);
  }

  editBabyProfile(){
    console.log("Editing baby profile");
    this.db.editBabyProfile();
    this.viewCtrl.dismiss();
  }

  switchBaby(){
    console.log("Switching baby");
    this.db.switchBaby();
    this.viewCtrl.dismiss();

  }

  addNewBaby(){
    console.log("Adding new baby");
    this.db.addNewBaby();
    this.viewCtrl.dismiss();

  }

  deleteBaby(){
    console.log("Delete baby")
    this.db.deleteBaby();
    this.viewCtrl.dismiss();
  }

  openAlarmModal(){
    return new Promise(async resolve => {
      console.log("Opening alarm modal");
      this.alarmModal = this.modal.create(AlarmsModalPage);
      this.alarmModal.present();
      await this.waitForModalReturn();
      this.viewCtrl.dismiss();
    });
  }

  waitForModalReturn() : any{
    return new Promise(resolve => {
      this.alarmModal.onDidDismiss( data => {
        console.log("WAIT FOR RETURN DATA IS:", data);
        let babyObject = data;
        resolve(babyObject);
      });
    });
  }
}
