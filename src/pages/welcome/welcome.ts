import { Component } from '@angular/core';
import { IonicPage, NavController, MenuController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';

import { SignupPage } from '../signup/signup';
//import { UserProvider } from '../../providers/user/user';
import { LoginPage } from '../login/login';
//import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {
	constructor(
		private navCtrl: NavController,
		private auth: AuthServiceProvider,
    private menu: MenuController) {
    // Diable the menu
    this.disableMenu();
	}

  login() {
    this.navCtrl.push(LoginPage);
  }

  loginWithGoogle() {
    this.auth.signInWithGoogle();
  }

  loginWithFacebook(){
    this.auth.signInWithFacebook();
  }

  loginWithTwitter(){
    this.auth.signInWithTwitter();
  }

  signup(){
    this.navCtrl.push(SignupPage);
  }

  disableMenu(){
    this.menu.enable(false);
  }
}
