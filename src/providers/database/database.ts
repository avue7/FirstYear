import { Injectable } from '@angular/core';
import { AlertController, ModalController, NavParams } from 'ionic-angular';
import { BabyModalPage } from '../../pages/baby-modal/baby-modal';

// Testing firestore
import firebase from 'firebase';
import 'firebase/firestore';

@Injectable()
export class DatabaseProvider {
  // currentUserRef: any;
  babyObject_: { firstName: string, lastName: string, birthday: string }

  constructor(private alertCtrl: AlertController,
    private modal: ModalController) {

  }

  setNewUserNewBaby(userId : any, babyObject?: any){
    let db = firebase.firestore();
    let currentUserRef = db.collection("users").doc(userId);

    // First check if user exists
    this.checkIfUserExists(currentUserRef).then((retVal) => {
      if(retVal){
        console.log("Database:: user already exists in the users collection.");
      } else {
        console.log("Database:: Successfully created new user in users collection.");
      }
    });
  }

  checkIfUserExists(currentUserRef : any, babyObject?: any){
    return new Promise(resolve => {
      currentUserRef.get().then((docSnapShot) => {
        if(docSnapShot.exists) {
          // currentUserRef.onSnapShot((doc) => {
          // do stuff here if exists
          // });
          resolve(true);
        } else {
          // Create the document
          this.openModal().then((baby) => {
            //currentUserRef.collection("babies").doc("babyFirstName").set({});
            resolve(false);
          });
        };
      });
    });
  }

  setNewBaby(userId: any){
    let db = firebase.firestore();
    let currentUserRef = db.collection("users").doc(userId);
  }

  openModal(){
    return new Promise(resolve => {
      // Data to be passed to the modal
      const myData = {
        firstName: 'first',
        lastName: 'last',
        birthday: 'blabla'
      }

      const myModal = this.modal.create(BabyModalPage, { data: myData});

      // myModal.onDidDismiss( data => {
      //   this.babyObject_['firstname'] = data.firstName,
      //
      // })
      myModal.present();
      resolve(true);
    });
  }

}
