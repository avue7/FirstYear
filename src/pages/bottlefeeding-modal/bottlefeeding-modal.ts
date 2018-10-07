import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import * as moment from 'moment';

@Component({
  selector: 'page-bottlefeeding-modal',
  templateUrl: 'bottlefeeding-modal.html',
})
export class BottlefeedingModalPage {
  bottlefeedingModal: any;
  bottleNote: string;
  durationIsSet: boolean = false;
  bottle: any = {
    type: 'Formula',
    duration: '00:00:00',
    volume: 6,
    unit: 'oz',
    date: '',
    time: ''
  };

  constructor(private view: ViewController) {
    this.bottle.date = moment().format();
    this.bottle.time = moment().format();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BottlefeedingModalPage');
  }

  manualAddBottle(){
    let obj = this.bottle;
    console.log("Manual add bottle data:", obj);
    this.view.dismiss(obj);
  }

  cancelBottleModal(){
    this.view.dismiss();
  }

  noteAlert(){
    console.log("CAlling note alert() in feeding.ts");
    //this.feeding.noteAlert();
  }
}
