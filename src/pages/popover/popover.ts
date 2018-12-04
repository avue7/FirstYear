import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';

@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html',
})
export class PopoverPage {

  constructor(private navParams: NavParams,
    private viewCtrl: ViewController,
    private db: DatabaseProvider) {
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

  openAlarmModal(){
    console.log("Opening alarm modal");
    this.viewCtrl.dismiss();

  }
}
