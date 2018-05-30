import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';

@Component({
  selector: 'page-my-profile',
  templateUrl: 'my-profile.html',
})
export class MyProfilePage {
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private user: UserProvider) {
  }

  doesUserHavePicture(){

  }

}
