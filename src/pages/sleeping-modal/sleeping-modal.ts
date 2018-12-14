import { Component } from '@angular/core';
import { ViewController, NavParams} from 'ionic-angular';
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
    dateStart: '',
    timeStart: '',
    dateEnd: '',
    timeEnd: '',
  };

  edit: boolean;
  constructor(private view: ViewController,
    private noteAlertProvider: NoteAlertProvider,
    private params: NavParams) {
      let object = this.params.get('object');
      if(object){
        this.edit = true;
        console.log("Sleeping object is", object);
        let splitDateTime = object.dateTime.split(' ');
        let tempDate = splitDateTime[0].split('-');
        // let newDateBeg = tempDate[1] + "-" + tempDate[2] + "-" + tempDate[0];
        // this.sleeping.dateStart = newDateBeg;
        console.log("Sleeping date is", object.dateStart)
        let splitDateBeg = object.dateStart.split('-');
        let newDateBeg = splitDateBeg[2] + "-" + splitDateBeg[0] + "-" + splitDateBeg[1];
        this.sleeping.dateStart = newDateBeg;
        this.sleeping.timeStart = object.time;
        let splitDateEnd = object.dateEnd.split('-');
        let newDateEnd = splitDateEnd[2] + "-" + splitDateEnd[0] + "-" + splitDateEnd[1];
        console.log("New date end", newDateEnd)
        this.sleeping.dateEnd = newDateEnd;
        this.sleeping.timeEnd = object.timeEnd;
        if(object.note){
          this.sleepingNote = object.note;
        };
      } else {
        this.edit = false;
        this.sleeping.dateStart = moment().format();
        this.sleeping.timeStart = moment().format();
        this.sleeping.dateEnd = moment().format();
        this.sleeping.timeEnd = moment().format();
      };
  }

  manuallyAddSleeping(){
    let manualObject = {};

    if(this.sleepingNote){
      manualObject = {
        dateStart: this.sleeping.dateStart,
        note: this.sleepingNote,
        timeStart: this.sleeping.timeStart,
        dateEnd: this.sleeping.dateEnd,
        timeEnd:  this.sleeping.timeEnd,
        //duration: this.sleeping.duration
      }
    } else {
      manualObject = {
        dateStart: this.sleeping.dateStart,
        timeStart: this.sleeping.timeStart,
        dateEnd: this.sleeping.dateEnd,
        timeEnd:  this.sleeping.timeEnd,
        //duration: this.sleeping.duration
      }
    };

    console.log("Manual add sleeping data:", manualObject);
    this.view.dismiss(manualObject);
  }

  cancelSleepingModal(){
    this.view.dismiss();
  }

  noteAlert(){
    if(this.sleepingNote){
      this.nAlert = this.noteAlertProvider.alert(this.sleepingNote);
      this.nAlert.present();
    } else {
      this.nAlert = this.noteAlertProvider.alert();
      this.nAlert.present();
    }

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
          console.log("sleeping note is", this.sleepingNote);
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
