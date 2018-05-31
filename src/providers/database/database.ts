import { Injectable } from '@angular/core';

// Testing firestore
import firebase from 'firebase';
import 'firebase/firestore';

@Injectable()
export class DatabaseProvider {
  // currentUserRef: any;

  constructor() {
  }

  setNewUser(userId : any){
    let db = firebase.firestore();
    let currentUserRef = db.collection("users").doc(userId);

    // First check if user exists
    this.checkIfUserExists(currentUserRef).then((retVal) => {
      if(retVal){
        console.log("Database:: Successfully created new user in users collection.");
      } else {
        console.log("Database:: user already exists in the users collection.");
      }
    });
  }

  checkIfUserExists(currentUserRef : any){
    return new Promise(resolve => {
      currentUserRef.get().then((docSnapShot) => {
        if(docSnapShot.exists) {
          // currentUserRef.onSnapShot((doc) => {
          // do stuff here if exists
          // });
          resolve(false);
        } else {
          // Create the document
          currentUserRef.set({});
          resolve(true);
        };
      });
    });
  }

}
