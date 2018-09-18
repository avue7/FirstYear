import { Injectable } from '@angular/core';
import { AlertController, ModalController, NavParams } from 'ionic-angular';
import { BabyModalPage } from '../../pages/baby-modal/baby-modal';

// Testing firestore
import firebase from 'firebase';
import 'firebase/firestore';

@Injectable()
export class DatabaseProvider {
  myModal: any;

  constructor(private alertCtrl: AlertController,
    private modal: ModalController) {

  }

  setNewUserNewBaby(userId : any, babyObject?: any){
    let db = firebase.firestore();

    db.settings({
      timestampsInSnapshots: true
    });

    let currentUserRef = db.collection('users').doc(userId).collection('babies');

    // First check if user exists
    this.checkIfBabyExists(currentUserRef).then((retVal) => {
      if(retVal == true){
        console.log("Database:: user already exists in the users collection.");
      } else if(retVal == "later"){
        console.log("Database:: user decides to do baby info later");
      } else {
        console.log("Database:: Successfully created new user in users collection.");
      }
    });
  }

  checkIfBabyExists(currentUserRef : any, babyObject?: any){
    return new Promise(resolve => {
      currentUserRef.get().then((docSnapShot) => {
        if (!docSnapShot.empty){
          console.log("Database::checkIfBabyExists(): baby doc(s) exists.")
          resolve(true);
        } else {
          console.log("Database::checkIfBabyExists: no baby doc(s) exists.")
          this.openModal().then((baby) => {
            let babyObject = baby;
            if (babyObject == undefined){
              resolve("later");
            } else {
              currentUserRef.doc(babyObject.firstName).set(babyObject);
              resolve(false);
            };
          });
        };
      });
    });
  }

  setNewBaby(userId: any){
    let db = firebase.firestore();
    let currentUserRef = db.collection("users").doc(userId);
  }

  openModal() : any{
    return new Promise(resolve => {
      this.myModal = this.modal.create(BabyModalPage);
      this.myModal.present();
      resolve(this.waitForReturn());
    });
  }

  // This method serves as a condition while loop and waits for the
  // modal to dismiss before it goes to the next line of the caller.
  waitForReturn() : any{
    return new Promise(resolve => {
      this.myModal.onDidDismiss( data => {
        let babyObject = data;
        // console.log("This babyObject_", babyObject);
        resolve(babyObject);
      });
    });
  }
}
