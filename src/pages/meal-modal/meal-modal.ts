import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { NoteAlertProvider } from '../../providers/note-alert/note-alert';

import * as moment from 'moment';

@Component({
  selector: 'page-meal-modal',
  templateUrl: 'meal-modal.html',
})
export class MealModalPage {
  mealModal: any;
  detail: string;
  meal: any = {
    date: '',
    time: '',
  }

  constructor(private view: ViewController,
    private noteAlertProvider: NoteAlertProvider) {
    this.meal.date = moment().format();
    this.meal.time = moment().format();
  }

  manuallyAddMeal(){
    let manualObject = {};

    if(this.detail){
      manualObject = {
        date: this.meal.date,
        time: this.meal.time,
        detail: this.detail
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
