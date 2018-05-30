import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';

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
  }

  getSegments(type: any){
    return this.segments[type];
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
