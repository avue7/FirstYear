import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import AuthProvider = firebase.auth.AuthProvider;
import { UserProvider } from '../user/user';

@Injectable()
export class AuthServiceProvider {
	private user: firebase.User;

	constructor(public afAuth: AngularFireAuth) {
		afAuth.authState.subscribe(user => {
			this.user = user;
		});
	}

	signInWithEmail(credentials) {
		console.log('Auth-Service::signInWithEmail(): Sign in with email');
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
    return this.afAuth.auth.signOut().then(() => {
			console.log("Successfully signed out");
		}).catch((error) => {
			console.log("Cannot Sign out:", error);
		})
  }

  signInWithGoogle() {
		console.log('Auth-Service::signInWithGoogle(): Sign in with google');
		return this.oauthSignIn(new firebase.auth.GoogleAuthProvider());
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

  private oauthSignIn(provider: AuthProvider) {
		return this.afAuth.auth.signInWithRedirect(provider).then(() => {
			return this.afAuth.auth.getRedirectResult().then( result => {
				// This gives you a Google Access Token.
				// You can use it to access the Google API.
				let token = result.credential.accessToken;
			 	let user = result.user;
			  console.log(token, user);
			}).catch(function(error) {
				// Handle Errors here.
				alert(error.message);
			});
		});
  }

}
