import { Component } from '@angular/core';
import { IonicPage, NavController, MenuController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HomePage } from '../home/home';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
//import { SignupPage } from '../signup/signup';
//import { GooglePlus } from '@ionic-native/google-plus';
//import firebase from 'firebase';
// import { UserProvider } from '../../providers/user/user';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';

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
    //private googlePlus: GooglePlus,
    // private user: UserProvider,
    private menu: MenuController) {
		this.loginForm = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]

		});
    // Diable the menu
    this.disableMenu();
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

    // Exception codes return from firebase...
    let emailDoesNotExistCode = "auth/user-not-found";
    let wrongPasswordCode = "auth/wrong-password";
    let invalidEmailCode = "auth/invalid-email";

    this.auth.signInWithEmail(credentials).then((code) => {
      console.log("Login::login(): code recieved back is:", code);

      if(code == emailDoesNotExistCode){
        this.loginError = "Email entered is not registered. Please go back and signup or try again.";
        return;
      }
      if(code == invalidEmailCode){
        this.loginError = "Email entered is badly formatted.";
        return;
      }
      if(code == wrongPasswordCode){
        this.loginError = "Incorrect password. Maybe this email is associated with another log-in provider.";
        return;
      }

      this.navCtrl.setRoot(HomePage);
    });
  }

  forgotPassword() {
    this.navCtrl.push(ForgotPasswordPage);
  }

  disableMenu(){
    this.menu.enable(false);
  }
}
