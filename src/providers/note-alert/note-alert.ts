import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';



@Injectable()
export class NoteAlertProvider {

  constructor(
    private alertCtrl: AlertController) {

  }

  alert(){
    let alert = this.alertCtrl.create({
      title: 'Note',
      inputs: [
        {
          name: 'note'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log("Cancel Clicked");
            alert.dismiss();
            return false;
          }
        },
        {
          text: 'Add Note',
          handler: (data) => {
            alert.dismiss(data);
            return false;
          }
        }
      ]
    });
    return alert;
  }
}
