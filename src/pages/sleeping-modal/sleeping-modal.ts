import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';

import * as moment from 'moment';

@Component({
  selector: 'page-sleeping-modal',
  templateUrl: 'sleeping-modal.html',
})
export class SleepingModalPage {
  sleepingModal: any;
  sleepingNote: any;
  nAlert: any;
  sleeping: any = {
    date: '',
    timeStart: '',
    dateEnd: '',
    timeEnd: '',
  };
  constructor(private view: ViewController,
    private noteAlertProvider: NoteAlertProvider) {
      this.sleeping.date = moment().format();
      this.sleeping.timeStart = moment().format();
      this.sleeping.dateEnd = moment().format();
      this.sleeping.timeEnd = moment().format();
  }

  manuallyAddSleeping(){
    let manualObject = {};

    if(this.sleepingNote){
      manualObject = {
        date: this.sleeping.date,
        note: this.sleeping.note,
        timeStart: this.sleeping.timeStart,
        dateEnd: this.sleeping.dateEnd,
        timeEnd:  this.sleeping.timeEnd,
        //duration: this.sleeping.duration
      }
    }else {
      manualObject = {
        date: this.sleeping.date,
        timeStart: this.sleeping.timeStart,
        dateEnd: this.sleeping.dateEnd,
        timeEnd:  this.sleeping.timeEnd,
        //duration: this.sleeping.duration
      }
    };

    console.log("Manual add diaper data:", manualObject);
    this.view.dismiss(manualObject);
  }

  cancelSleepingModal(){
    this.view.dismiss();
  }

  noteAlert(){
    this.nAlert = this.noteAlertProvider.alert();
    this.nAlert.present();

    this.waitForAlertReturn().then((val) => {
      if(val == true){
        console.log("THIS Sleepingnote is true: ", val);
      } else {
        console.log("THIS Sleepingnote is false: ", val);
      };
    });
  }

  waitForAlertReturn() : any{
    return new Promise(resolve => {
      this.nAlert.onDidDismiss(data => {
        if(data != undefined){
          this.sleepingNote = data;
          resolve(true);
        } else {
          this.sleepingNote = null;
          resolve(false);
        };
      }, (error) =>{
        console.log("Alert on dismiss error:", error);
      });
    })
  }
}
