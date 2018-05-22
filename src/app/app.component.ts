import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Subscription} from 'rxjs/Subscription';
import { UserProvider } from '../providers/user/user';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  userSubscription: Subscription;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private auth: AuthServiceProvider,
    private menu: MenuController,
    private user: UserProvider) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'List', component: ListPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    // Logic to check if users are logged in or not.
    this.userSubscription = this.auth.afAuth.authState.subscribe( user => {
      if(user){
        console.log("User exist, already logged in. User:", user);
        this.rootPage = HomePage;
      } else {
        console.log("No user exists...going to LoginPage.");
        this.rootPage = LoginPage;
      };
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.menu.close();
    this.nav.setRoot(page.component);
  }

  login() {
    this.menu.close();
	  this.nav.setRoot(LoginPage);
  }

  logout() {
	  this.menu.close();
	  this.auth.signOut();
    this.userSubscription.unsubscribe();
	  this.nav.setRoot(HomePage);
  }

}
