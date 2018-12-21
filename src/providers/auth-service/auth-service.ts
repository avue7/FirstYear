import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import AuthProvider = firebase.auth.AuthProvider;
import { GooglePlus } from '@ionic-native/google-plus';

@Injectable()
export class AuthServiceProvider {
	private user: firebase.User;

	constructor(public afAuth: AngularFireAuth,
		private googlePlus: GooglePlus) {
		afAuth.authState.subscribe(user => {
			this.user = user;
		});
	}

	signInWithEmail(credentials) {
		console.log('Auth-Service::signInWithEmail(): Sign in with email');
		return this.afAuth.auth.signInWithEmailAndPassword(credentials.email, credentials.password).then(() => {
		}, error => {
			console.log("Auth-service::signInWithEmail(): error:", error);
			return error.code;
		});
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
    return this.afAuth.auth.signOut().then(() => {
			console.log("Successfully signed out");
		}).catch((error) => {
			console.log("Cannot Sign out:", error);
		})
  }

  signInWithGoogle() {
		console.log('Auth-Service::signInWithGoogle(): Sign in with google');
		return this.googlePlus.login({
			'webClientId': '396313115996-fsp0t0q7co5gqmrg1o1ek8udjqn82rl0.apps.googleusercontent.com'
    }).then((res) => {
      console.log("REs", res);
			let googleCredential = firebase.auth.GoogleAuthProvider.credential(res.idToken)
			this.afAuth.auth.signInAndRetrieveDataWithCredential(googleCredential).then((response) => {
				console.log("Successfully signed in with google plus", response);
			}, error => {
        console.log("Error validating credentials,", error);
      });
		}, error => {
			console.log("Auth-Service::signInWithGoogle(): cannot sign in:", error);
		});

		// THis method for in app...
		// return this.afAuth.auth.setPersistence(firebase.auth.Auth.Persistence.NONE).then(() => {
		// 	return this.oauthSignIn(new firebase.auth.GoogleAuthProvider());
		// });
    // return this.oauthSignIn(new firebase.auth.GoogleAuthProvider());
  }

  private oauthSignIn(provider: AuthProvider) {
		return this.afAuth.auth.signInWithRedirect(provider).then(() => {
			return this.afAuth.auth.getRedirectResult().then( result => {
				// This gives you a Google Access Token.
				// You can use it to access the Google API.
        let myProp = 'accessToken';
        let token: any;
        if(result.credential.hasOwnProperty(myProp)){
          token = result.credential[myProp];
        }
				// let token = result.credential.accessToken;
			 	let user = result.user;
			  console.log(token, user);
			}).catch(function(error) {
				// Handle Errors here.
				alert(error.message);
			});
		});
  }

	signInWithFacebook() {
		console.log('Auth-Service::signInWithFacebook: Sign in with Facebook');
		return this.oauthSignIn(new firebase.auth.FacebookAuthProvider().setCustomParameters({
			auth_type: 'reauthenticate'
		}));
	}

	signInWithTwitter() {
		console.log("Auth-Service::signInWithTwitter(): Sign in with Twitter");
		return this.oauthSignIn(new firebase.auth.TwitterAuthProvider().setCustomParameters({
			force_login: 'true',
			screen_name: 'true'
		}));
	}

	resetPassword(emailAddress: any) {
		this.afAuth.auth.sendPasswordResetEmail(emailAddress).then(() => {
			console.log("Auth-Service::forgotPassword(): sent password reset to:", emailAddress);
		}).catch((error) => {
			console.log("Auth-Service::forgotPassword(): error while trying to send password reset:", error);
		});
	}
}
