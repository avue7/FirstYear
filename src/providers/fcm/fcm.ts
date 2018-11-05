import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
// import firebase from 'firebase';
// import 'firebase/firestore';
// import 'firebase/firebase';

@Injectable()
export class FcmProvider {

  constructor(private platform: Platform) {
    console.log('Hello FcmProvider Provider');
  }

  async getToken(){
    let token;

    if(this.platform.is('android')) {
      //token = await this.firebase.getToken()
      // .then(token => console.log(`The token is ${token}`)) // save the token server-side and use it to push notifications to this device
      // .catch(error => console.error('Error getting token', error));
      // console.log("Token from firebase is:", token);
    }

  }

}
