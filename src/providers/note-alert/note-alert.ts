import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';



@Injectable()
export class NoteAlertProvider {

  constructor(
    private alertCtrl: AlertController) {
  }

  alert(data_p?: any){
    if (data_p){
      let alert = this.alertCtrl.create({
        title: 'Note',
        inputs: [
          {
            name: 'note',
            value: data_p.note
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
              console.log("Cancel Clicked");
              alert.dismiss(data_p);
              return false;
            }
          },
          {
            text: 'Add Note',
            handler: (data) => {
              console.log("Data in note is", data)
              if(data.note == ''){
                data = undefined;
                alert.dismiss(data);
                return false;
              } else {
                alert.dismiss(data);
                return false;
              };
            }
          }
        ]
      });
      return alert;
    } else {
      let alert = this.alertCtrl.create({
        title: 'Note',
        inputs: [
          {
            name: 'note',
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
              console.log("2 Cancel Clicked");
              alert.dismiss();
              return false;
            }
          },
          {
            text: 'Add Note',
            handler: (data) => {
              if(data.note == ''){
                console.log("2 Data in note is", data)
                data = undefined;
                alert.dismiss(data);
                return false;
              } else {
                alert.dismiss(data);
                return false;
              };
            }
          }
        ]
      });
      return alert;
    }
  }
}
