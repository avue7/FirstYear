import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';
import { UserProvider } from '../user/user';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

// import 'firebase/firestore';
// import 'firebase/firebase';

@Injectable()
export class FcmProvider {

  constructor(private platform: Platform,
    private firebase: Firebase,
    private user: UserProvider) {
    console.log('Hello FcmProvider Provider');
  }

  async getToken(){
    let token;

    if(this.platform.is('android')) {
      await this.firebase.getToken().then(token_ => {
        token = token_;
        console.log(`The token is ${token}`);
      }).catch(error => {
        console.error('Error getting token', error);
      });
    }

    console.log("Token from firebase is:", token);
    return this.saveTokenToFirestore(token);
  }

  saveTokenToFirestore(token: any){
    let db = firebase.firestore();
    if(!token) return;

    db.settings({
      timestampsInSnapshots: true
    });

    const devicesRef = db.collection('devices');
    let userId = this.user.getUserId();

    const docData = {
      token,
      userId: userId
    };

    return devicesRef.doc(token).set(docData);
  }

  // Designed to work only when app is in the background. WHen app in use
  // it is up to the developer to notify user.
  listenToNotifications(){
    return this.firebase.onNotificationOpen();
  }

}
