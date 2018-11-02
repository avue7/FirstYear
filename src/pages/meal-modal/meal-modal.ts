import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';

import * as moment from 'moment';

@Component({
  selector: 'page-meal-modal',
  templateUrl: 'meal-modal.html',
})
export class MealModalPage {
  mealModal: any;
  mealNote: string;
  meal: any = {
    date: '',
    time: '',
  }

  edit: boolean;

  constructor(private view: ViewController,
    private noteAlertProvider: NoteAlertProvider,
    private params: NavParams) {

    let object = this.params.get('object');
    if(object){
      this.edit = true;
      let splitDateTime = object.dateTime.split(' ');
      this.meal.date = splitDateTime[0];
      this.meal.time = splitDateTime[1];
      if(object.note){
        this.mealNote = object.note.note;
      };
    } else {
      this.edit = false;
      this.meal.date = moment().format();
      this.meal.time = moment().format();
    };
  }

  manuallyAddMeal(){
    let manualObject = {};

    if(this.mealNote){
      manualObject = {
        date: this.meal.date,
        time: this.meal.time,
        note: {note: this.mealNote}
      }
    } else {
        manualObject = {
          date: this.meal.date,
          time: this.meal.time,
        }
    };

    console.log("Manual add meal data:", manualObject);
    this.view.dismiss(manualObject);
  }

  cancelModal(){
    this.view.dismiss();
  }
}
