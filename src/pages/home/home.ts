import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';

// Pages:
import { FeedingPage } from '../feeding/feeding';
import { DiaperingPage } from '../diapering/diapering';

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
  pages: Array<{component: any, icon: string}>;

  segmentType = 'Activities';

  segments: any = {
    'Activities': [
      { component: FeedingPage, icon: 'custom-bottle' },
      { component: DiaperingPage, icon: 'custom-diaper' }
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

    this.pages = [
      { component: FeedingPage, icon: 'custom-bottle' },
      { component: DiaperingPage, icon: 'custom-diaper' }
    ];
  }

  openPage(page: any) {
    this.navCtrl.push(page.component);
  }

  getSegments(type: any){
    return this.segments[type];
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
