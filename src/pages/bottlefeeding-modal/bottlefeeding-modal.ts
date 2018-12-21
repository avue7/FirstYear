import { Component } from '@angular/core';
import { ViewController, NavParams} from 'ionic-angular';
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
    type: '',
    duration: '',
    volume: 0,
    unit: '',
    date: '',
    time: ''
  };

  edit: boolean;

  constructor(private view: ViewController,
    private noteAlertProvider: NoteAlertProvider,
    private params: NavParams){
    //private lifo: LifoHistoryProvider) {
    let object = this.params.get('object');
    if(object){
      this.edit = true;
      this.bottle.type = object.type;
      this.bottle.volume = object.volume;
      this.bottle.unit = object.unit;
      let splitDateTime = object.dateTime.split(' ');
      this.bottle.date = splitDateTime[0];
      this.bottle.time = splitDateTime[1];
      //this.bottle.duration = object.duration;
      if(object.duration){
        let durationString = this.convertDuration(object.duration);
        console.log("Duration string is", durationString);
        this.bottle.duration = durationString;
      }else {
        this.bottle.duration = '00:00:00';
      }
      if(object.note){
        this.bottleNote = object.note;
      };
    } else {
      this.edit = false;
      this.bottle.type = 'Formula';
      this.bottle.duration = '00:00:00';
      this.bottle.volume = 6;
      this.bottle.unit = 'oz';
      this.bottle.date = moment().format();
      this.bottle.time = moment().format();
    };
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
        note: this.bottleNote,
        edit: this.edit
      }
    } else {
      manualObject = {
        type: this.bottle.type,
        date: this.bottle.date,
        volume: this.bottle.volume,
        time: this.bottle.time,
        duration: this.bottle.duration,
        unit: this.bottle.unit,
        edit: this.edit
      }
    };

    console.log("Manual add bottle data:", manualObject);
    this.view.dismiss(manualObject);
  }

  cancelBottleModal(){
    this.view.dismiss();
  }

  noteAlert(){
    if(this.bottleNote){
      this.nAlert = this.noteAlertProvider.alert(this.bottleNote);
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
}
