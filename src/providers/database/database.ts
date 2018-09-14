import { Injectable } from '@angular/core';
import { AlertController, ModalController, NavParams } from 'ionic-angular';
import { BabyModalPage } from '../../pages/baby-modal/baby-modal';

// Testing firestore
import firebase from 'firebase';
import 'firebase/firestore';

@Injectable()
export class DatabaseProvider {
  // currentUserRef: any;
  babyObject_ = {
    firstName: '',
    lastName: '',
    birthday: ''
  };

  myModal: any;

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
          // this.openModal().then((baby) => {
          //   //currentUserRef.collection("babies").doc("babyFirstName").set({});
          //   console.log("Baby is ", baby);
            resolve(this.openModal());
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

  waitForReturn(){
    return new Promise(resolve => {
      this.myModal.onDidDismiss( data => {
        // this.babyObject_.firstName = data.firstName,
        // this.babyObject_.lastName = data.lastName,
        // this.babyObject_.birthday = data.birthday
        this.babyObject_ = data;
        console.log("This babyObject_", this.babyObject_);
        console.log("Database::modal_onDidDismiss: baby info =", data);
        resolve(false);
      });
    });
  }
}
