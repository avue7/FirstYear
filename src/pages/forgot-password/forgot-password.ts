import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController} from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
  requestForm: FormGroup;
	requestError: string;
  emailExists: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
  	private fb: FormBuilder,
    private auth: AuthServiceProvider,
    private alertCtrl: AlertController) {
    this.requestForm = fb.group({
			email: ['', Validators.compose([Validators.required, Validators.email])]
		});

    this.emailExists = false;
  }

  sendRequest() {
    let data = this.requestForm.value;

    if (!data.email) {
      return;
    }

    let dummyPassword = "123456";
    let credentials = {
      email: data.email,
      password: dummyPassword
    };

    // Exception codes return from firebase...
    let emailDoesNotExistCode = "auth/user-not-found";
    let wrongPasswordCode = "auth/wrong-password";
    let invalidEmailCode = "auth/invalid-email";

    this.auth.signInWithEmail(credentials).then((code) => {
      if(code == emailDoesNotExistCode){
        this.requestError = "Email is not registered. Please go back and signup or try again.";
        return;
      }
      if(code == invalidEmailCode){
        this.requestError = "Email is badly formatted. Try again.";
        return;
      }

      this.auth.resetPassword(credentials.email);
      this.alert(credentials.email);
    });
  }

  alert(email : any){
    let alert = this.alertCtrl.create({
      title: 'A Password reset link has been sent to \'' + email + '.\'',
      message: 'Please check your email for instructions on resetting your password.',
      buttons: [
        {
          text: 'Resend password reset',
          cssClass: 'alertButtonCss',
        },
        {
          text: 'Go back to Login Page',
          cssClass: 'alertButtonCss',
          handler: data => {
            this.navCtrl.pop();
          }
        }
      ],
      cssClass: 'alertCustomCss',
    });
    alert.present();
  }


}
