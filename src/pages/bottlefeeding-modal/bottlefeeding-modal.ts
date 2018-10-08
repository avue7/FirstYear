import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';

import * as moment from 'moment';

@Component({
  selector: 'page-bottlefeeding-modal',
  templateUrl: 'bottlefeeding-modal.html',
})
export class BottlefeedingModalPage {
  bottlefeedingModal: any;
  bottleNote: string;
  durationIsSet: boolean = false;
  nAlert: any;
  bottle: any = {
    type: 'Formula',
    duration: '00:00:00',
    volume: 6,
    unit: 'oz',
    date: '',
    time: ''
  };

  constructor(private view: ViewController,
    private noteAlertProvider: NoteAlertProvider) {
    this.bottle.date = moment().format();
    this.bottle.time = moment().format();
  }

  ionViewDidLoad() {
  }

  manualAddBottle(){
    let manualObject = {};

    if(this.bottleNote){
      manualObject = {
        type: this.bottle.type,
        date: this.bottle.date,
        volume: this.bottle.volume,
        time: this.bottle.time,
        duration: this.bottle.duration,
        unit: this.bottle.unit,
        note: this.bottleNote
      }
    } else {
      manualObject = {
        type: this.bottle.type,
        date: this.bottle.date,
        volume: this.bottle.volume,
        time: this.bottle.time,
        duration: this.bottle.duration,
        unit: this.bottle.unit
      }
    };

    console.log("Manual add bottle data:", manualObject);
    this.view.dismiss(manualObject);
  }

  cancelBottleModal(){
    this.view.dismiss();
  }

  noteAlert(){
    this.nAlert = this.noteAlertProvider.alert();
    this.nAlert.present();

    this.waitForAlertReturn().then((val) => {
      if(val == true){
        console.log("THIS bottlenote is true: ", val);
      } else {
        console.log("THIS bottlenote is false: ", val);
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
}
