import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import AuthProvider = firebase.auth.AuthProvider;
import { UserProvider } from '../user/user';
import { Platform } from 'ionic-angular';

@Injectable()
export class AuthServiceProvider {
	private user: firebase.User;

	constructor(public afAuth: AngularFireAuth,
		private platform: Platform) {
		afAuth.authState.subscribe(user => {
			this.user = user;
		});
	}

	signInWithEmail(credentials) {
		console.log('Sign in with email');
		return this.afAuth.auth.signInWithEmailAndPassword(credentials.email,
			 credentials.password);
	}

  signUp(credentials) {
	  return this.afAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
  }

  get authenticated(): boolean {
    return this.user !== null;
  }

  getEmail() {
    return this.user && this.user.email;
  }


  signOut(): Promise<void> {
    return this.afAuth.auth.signOut();
  }

  signInWithGoogle() {
		console.log('Sign in with google');
		return this.oauthSignIn(new firebase.auth.GoogleAuthProvider());
  }


  private oauthSignIn(provider: AuthProvider) {
		// // if(this.platform.is('android')){
		// 	console.log("this platform is android ran");
		// if (!(<any>window).cordova) {
		  // return this.afAuth.auth.signInWithPopup(provider).then(result => {
			// 	let user = result.user;
			// 	console.log("This is the user from google signin", user);
			// }, error => {
			// 	let errorCode = error.code;
			// 	let errorMessage = error.message;
			// 	let email = error.email;
			// 	let credential = error.credential;
			// 	console.log("Error responded with: ", error);
			// });
	  // } else {
		  return this.afAuth.auth.signInWithRedirect(provider).then(() => {
			  return this.afAuth.auth.getRedirectResult().then( result => {
				  // This gives you a Google Access Token.
				  // You can use it to access the Google API.
				  let token = result.credential.accessToken;
				  // The signed-in user info.396313115996-fsp0t0q7co5gqmrg1o1ek8udjqn82rl0.apps.googleusercontent.com
			 	  let user = result.user;
			   	console.log(token, user);
			  }).catch(function(error) {
				  // Handle Errors here.
				  alert(error.message);
			  });
		  });
	  // };
  }

}
