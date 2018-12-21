import { Component } from '@angular/core';
import { ViewController, NavParams} from 'ionic-angular';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';

import * as moment from 'moment';

@Component({
  selector: 'page-diapering-modal',
  templateUrl: 'diapering-modal.html',
})
export class DiaperingModalPage {
  diaperingModal: any;
  diaperNote: any;
  nAlert: any;
  diaper: any = {
    type: 'pee',
    date: '',
    time: ''
  };

  edit: boolean;

  constructor(private view: ViewController,
    private noteAlertProvider: NoteAlertProvider,
    private params: NavParams) {
      let object = this.params.get('object');
      if(object){
        this.edit = true;
        this.diaper.type = object.type;
        let splitDateTime = object.dateTime.split(' ');
        this.diaper.date = splitDateTime[0];
        this.diaper.time = splitDateTime[1];
        if(object.note){
          this.diaperNote = object.note;
        };
      } else {
        this.edit = false;
        this.diaper.date = moment().format();
        this.diaper.time = moment().format();
      };
  }

  manualAddDiaper(){
    let manualObject = {};

    if(this.diaperNote){
      manualObject = {
        type: this.diaper.type,
        date: this.diaper.date,
        time: this.diaper.time,
        note: this.diaperNote
      }
    } else {
      manualObject = {
        type: this.diaper.type,
        date: this.diaper.date,
        time: this.diaper.time,
      }
    };

    console.log("Manual add diaper data:", manualObject);
    this.view.dismiss(manualObject);
  }

  cancelBottleModal(){
    this.view.dismiss();
  }

  noteAlert(){
    if(this.diaperNote){
      this.nAlert = this.noteAlertProvider.alert(this.diaperNote);
      this.nAlert.present();
    } else {
      this.nAlert = this.noteAlertProvider.alert();
      this.nAlert.present();
    }

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
          this.diaperNote = data;
          resolve(true);
        } else {
          this.diaperNote = null;
          resolve(false);
        };
      }, (error) =>{
        console.log("Alert on dismiss error:", error);
      });
    })
  }
}
