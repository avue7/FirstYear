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

    this.createGoogleAuthObservable();

    // Diable the menu
    this.disableMenu();
	}

  createGoogleAuthObservable(){
    firebase.auth().onAuthStateChanged( user => {
      if (user){
        this.user.setLoggedInStatus(true);
      } else {
        this.user.setLoggedInStatus(false);
      }
    });
  }

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
    // this.googlePlus.login({
    //   'scopes' : 'profile email',
    //   'webClientId' : '396313115996-fsp0t0q7co5gqmrg1o1ek8udjqn82rl0.apps.googleusercontent.com',
    //   // 'webClientId': '777105251727-414douar978036vcr6u4st5oo3jdvtue.apps.googleusercontent.com',
    //   'offline': true
    // }).then((user) => {
    //   console.log("Successfully logged in...", user);
    //   this.user.setUserName(user.name);
    //   this.user.setUserEmail(user.email);
    //   this.navCtrl.setRoot(HomePage);
    // }, err => console.log("Login with google failed...", err));
    this.auth.signInWithGoogle();
  }

  signup(){
    this.navCtrl.push(SignupPage);
  }

  disableMenu(){
    this.menu.enable(false);
  }
}
