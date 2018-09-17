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

          //%$$$## Problem lies here where babyObject.firstname is undefined
          this.openModal().then((baby) => {
            let babyObject = baby;
            // let firstName = baby.firstName;
            // let lastName = baby.lastName;
            // let birthday = baby.birthday;
            console.log("Baby is ", baby);
            //console.log("Debugging this: ", Object.getOwnPropertyNames(babyObject));
            currentUserRef.doc(babyObject.firstName).set(babyObject);
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

  openModal() : any{
    return new Promise(resolve => {
      // Data to be passed to the modal
      // const myData = {
      //   firstName: '',
      //   lastName: '',
      //   birthday: ''
      // }

      this.myModal = this.modal.create(BabyModalPage /*, { data: myData} */);
      this.myModal.present();
      resolve(this.waitForReturn());
    });
  }

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
