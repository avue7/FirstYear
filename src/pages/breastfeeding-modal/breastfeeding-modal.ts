import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';
import { FormattedTodayProvider } from '../../providers/formatted-today/formatted-today';
import * as moment from 'moment';

@Component({
  selector: 'page-breastfeeding-modal',
  templateUrl: 'breastfeeding-modal.html',
})
export class BreastfeedingModalPage {
  // breastForm: FormGroup;
  // breast: any;
  // today: any;
  // timeNow: any;
  // zeros: string;
  breastFeedNote: any;
  nAlert: any;

  breastFeed: any = {
    breast: '',
    date: '',
    time: '',
    duration: ''
  };

  edit: boolean;


  constructor( private view: ViewController,
    private ft: FormattedTodayProvider,
    private noteAlertProvider: NoteAlertProvider,
    private params: NavParams) {

    let object = this.params.get('object');
    if(object){
      this.edit = true;
      this.breastFeed.breast = object.breast;
      let splitDateTime = object.dateTime.split(' ');
      this.breastFeed.date = splitDateTime[0];
      this.breastFeed.time = splitDateTime[1];
      if (object.duration){
        let durationString = this.convertDuration(object.duration);
        this.breastFeed.duration = durationString;
      } else {
        this.breastFeed.duration = '00:00:00';
      }
      if(object.note){
          this.breastFeedNote = object.note;
      }
    } else {
      this.edit = false;
      this.breastFeed.breast = "left";
      this.breastFeed.date = moment().format();
      this.breastFeed.time = moment().format();
      this.breastFeed.duration = '00:00:00';
    }
  }

  convertDuration(duration: any){
    // Convert duration
    let seconds = duration;
    let days = Math.floor(seconds / (3600*24));
    seconds -= days*3600*24;
    let hours = Math.floor(seconds / 3600);
    seconds -= hours*3600;
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes*60;

    let durationString: any = "";

    if(this.edit){
      if(hours > 0){
        if (hours < 10){
          durationString += "0" + hours + ":";
        } else {
          durationString += hours + ':';
        };
      } else {
        durationString += "00:";
      }
      if(minutes > 0){
        if (minutes < 10){
          durationString += "0" + minutes + ':';
        } else {
          durationString += minutes + ':';
        };
      } else {
        durationString += "00:";
      }
      if(seconds > 0) {
        if (seconds < 10){
          durationString += "0" + seconds;
        } else {
          durationString += seconds;
        };
      } else {
        durationString += "00";
      }

      return durationString;
    }
  }

  manualAddBreast() {
    // let data = this.breastForm.value;
    // console.log("Manual add data", data);
    // this.view.dismiss(data);
    let manualObject = {};

    if(this.breastFeedNote){
      manualObject = {
        breast: this.breastFeed.breast,
        date: this.breastFeed.date,
        time: this.breastFeed.time,
        duration: this.breastFeed.duration,
        note: this.breastFeedNote,
        edit: this.edit
      }
    } else {
      manualObject = {
        breast: this.breastFeed.breast,
        date: this.breastFeed.date,
        time: this.breastFeed.time,
        duration: this.breastFeed.duration,
        edit: this.edit
      }
    };

    console.log("Manual add breastFeed data:", manualObject);
    this.view.dismiss(manualObject);
  }

  cancelModal(){
    this.view.dismiss();
  }

  noteAlert(){
    if (this.breastFeedNote){
      this.nAlert = this.noteAlertProvider.alert(this.breastFeedNote);
      this.nAlert.present();
    } else {
      this.nAlert = this.noteAlertProvider.alert();
      this.nAlert.present();
    }

    this.waitForAlertReturn().then((val) => {
      if(val == true){
        console.log("THIS breastFeedNote is true: ", val);
      } else {
        console.log("THIS breastFeedNote is false: ", val);
      };
    });
  }

  waitForAlertReturn() : any{
    return new Promise(resolve => {
      this.nAlert.onDidDismiss(data => {
        if(data != undefined){
          this.breastFeedNote = data;
          console.log("Alert returned", this.breastFeedNote);
          resolve(true);
        } else {
          this.breastFeedNote = null;
          resolve(false);
        };
      }, (error) =>{
        console.log("Alert on dismiss error:", error);
      });
    })
  }


}
