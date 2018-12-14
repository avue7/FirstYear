import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';

@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html',
})
export class PopoverPage {
  showDelete: boolean;

  constructor(private navParams: NavParams,
    private viewCtrl: ViewController,
    private db: DatabaseProvider) {
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
    console.log("Opening alarm modal");
    this.viewCtrl.dismiss();

  }
}
