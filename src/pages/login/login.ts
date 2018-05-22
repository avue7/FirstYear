import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HomePage } from '../home/home';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { SignupPage } from '../signup/signup';
import { GooglePlus } from '@ionic-native/google-plus';
import firebase from 'firebase';
import { UserProvider } from '../../providers/user/user';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  userLoggedIn: any = null;
	loginForm: FormGroup;
	loginError: string;

	constructor(
		private navCtrl: NavController,
		private auth: AuthServiceProvider,
		fb: FormBuilder,
    private googlePlus: GooglePlus,
    private user: UserProvider,
    private menu: MenuController
	) {
		this.loginForm = fb.group({
			email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
		});

    // this.createGoogleAuthObservable();

    // Diable the menu
    this.disableMenu();
	}

  // createGoogleAuthObservable(){
  //   firebase.auth().onAuthStateChanged( user => {
  //     if (user){
  //       this.user.setLoggedInStatus(true);
  //     } else {
  //       console.log("No users logged in");
  //     }
  //   });
  // }

  login() {
  	let data = this.loginForm.value;

  	if (!data.email) {
  		return;
  	}

  	let credentials = {
  		email: data.email,
  		password: data.password
  	};
  	this.auth.signInWithEmail(credentials).then(
  		() => this.navCtrl.setRoot(HomePage),
  		error => this.loginError = error.message
  	);
  }

  loginWithGoogle() {
    this.auth.signInWithGoogle();
    //this.navCtrl.setRoot(HomePage);
  }

  signup(){
    this.navCtrl.push(SignupPage);
  }

  disableMenu(){
    this.menu.enable(false);
  }
}
