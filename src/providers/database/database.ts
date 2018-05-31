import { Injectable } from '@angular/core';

// Testing firestore
import firebase from 'firebase';
import 'firebase/firestore';

@Injectable()
export class DatabaseProvider {
  db = firebase.firestore();
  currentUserRef: any;

  constructor() {
  }

  setNewUser(userId : any){

    // Create an entry in the database for the current user
    this.currentUserRef = this.db.collection("users").doc(userId).set({});
  }

  checkIfUserExists(userId : any){

  }

}
