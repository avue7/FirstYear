import { Component } from '@angular/core';
import { ViewController, NavParams} from 'ionic-angular';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';


import * as moment from 'moment';

@Component({
  selector: 'page-growth-modal',
  templateUrl: 'growth-modal.html',
})
export class GrowthModalPage {
  growthNote: string;
  nAlert: any;
  edit: boolean;
  growth: any = {
    date: '',
    time: '',
    weight: '',
    height: '',
    head: '',
    weightUnit: '',
    heightUnit: '',
    headUnit: ''
  }

  constructor(public params: NavParams,
    private noteAlertProvider: NoteAlertProvider,
    private view: ViewController) {
    let object = this.params.get('object');
    if(object){
      this.edit = true;
      let splitDateTime = object.dateTime.split(' ');
      this.growth.date = splitDateTime[0];
      this.growth.time = splitDateTime[1];
      this.growth.weight = object.weight;
      this.growth.height = object.height;
      this.growth.head = object.head;
      this.growth.weightUnit = object.weightUnit;
      this.growth.heightUnit = object.heightUnit;
      this.growth.headUnit = object.headUnit;
      if(object.note){
        this.growthNote = object.note;
      }
    } else {
      this.edit = false;
      this.growth.date = moment().format();
      this.growth.time = moment().format();
      this.growth.weight = '';
      this.growth.height = '';
      this.growth.head = '';
      this.growth.weightUnit = 'lb';
      this.growth.heightUnit = 'ft';
      this.growth.headUnit = 'in';
    };
  }

  addGrowth(){
    let growthObject = {};

    if(this.growthNote){
      growthObject = {
        date: this.growth.date,
        time: this.growth.time,
        weight: this.growth.weight,
        height: this.growth.height,
        head: this.growth.head,
        weightUnit: this.growth.weightUnit,
        heightUnit: this.growth.heightUnit,
        headUnit: this.growth.headUnit,
        note: this.growthNote
      }
    } else {
      growthObject = {
        date: this.growth.date,
        time: this.growth.time,
        weight: this.growth.weight,
        height: this.growth.height,
        head: this.growth.head,
        weightUnit: this.growth.weightUnit,
        heightUnit: this.growth.heightUnit,
        headUnit: this.growth.headUnit,
      }
    }

    console.log("Adding growth to db:", growthObject);
    this.view.dismiss(growthObject);
  }

  cancelGrowthModal(){
    this.view.dismiss();
  }

  noteAlert(){
    if(this.growthNote){
      this.nAlert = this.noteAlertProvider.alert(this.growthNote);
      this.nAlert.present();
    } else {
      this.nAlert = this.noteAlertProvider.alert();
      this.nAlert.present();
    }

    this.waitForAlertReturn().then((val) => {
      if(val == true){
        console.log("THIS growthNote is true: ", val);
      } else {
        console.log("THIS growthNote is false: ", val);
      };
    });
  }

  waitForAlertReturn() : any{
    return new Promise(resolve => {
      this.nAlert.onDidDismiss(data => {
        if(data != undefined){
          this.growthNote = data;
          resolve(true);
        } else {
          this.growthNote = null;
          resolve(false);
        };
      }, (error) =>{
        console.log("Alert on dismiss error:", error);
      });
    })
  }

}
