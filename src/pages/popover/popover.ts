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
  }

  switchBaby(){
    console.log("Switching baby");
  }

  addNewBaby(){
    console.log("Adding new baby");
    this.db.addNewBaby();
  }

  openAlarmModal(){
    console.log("Opening alarm modal");
  }
}
