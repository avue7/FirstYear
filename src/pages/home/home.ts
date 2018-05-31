import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';

// Testing out firestore
// import { AngularFirestore } from 'angularfire2/firestore';
// import firebase from 'firebase';
// import 'firebase/firestore';
// import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  segmentType = 'Activities';
  segments: any = {
    'Activities': [
      {
        name: 'Diaper',
      },
      {
        name: 'Bottle',
      },
      {
        name: 'Sleep'
      }
    ],
    'Charts': [
      {
        name: 'Diaper chart'
      }
    ],
    'Chats': [
      {
        name: 'Main Chat'
      }
    ]
  }

  constructor(public navCtrl: NavController,
    private menu: MenuController,
    private user: UserProvider) {
    this.enableMenu();

    // let db = firebase.firestore();
    //
    // db.collection('users').add({
    //   first: "Test",
    //   last: "last",
    //   born: "now"
    // })
    // .then( (docRef) => {
    //   console.log("Home::constructor(): Document written with id: ", docRef.id);
    // }, (error) => {
    //   console.log("Home::constructor(): Error adding document: ", error);
    // });
  }

  getSegments(type: any){
    return this.segments[type];
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
