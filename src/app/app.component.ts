import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Subscription} from 'rxjs/Subscription';
import { UserProvider } from '../providers/user/user';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { GooglePlus } from '@ionic-native/google-plus';
import { DatabaseProvider } from '../providers/database/database';

// Pages:
import { HomePage } from '../pages/home/home';
import { WelcomePage } from '../pages/welcome/welcome';
import { FeedingPage } from '../pages/feeding/feeding';
import { DiaperingPage } from '../pages/diapering/diapering';
import { SleepingPage } from '../pages/sleeping/sleeping';
import { GrowthPage } from '../pages/growth/growth';
import { PlayingPage } from '../pages/playing/playing';
import { CreditsPage } from '../pages/credits/credits';
import { CameraPage } from '../pages/camera/camera';
import { DatePipe } from '@angular/common';

import firebase from 'firebase';
import 'firebase/firestore';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  userSubscription: Subscription;

  pages: Array<{title: string, component: any, icon: string}>;
  activePage: any;

  babyName: any;
  babyAge: any;
  babyPicture: any;
  babyBirthday: any;
  bdayYear: number;
  bdayMonth: number;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private auth: AuthServiceProvider,
    private menu: MenuController,
    private user: UserProvider,
    private googlePlus: GooglePlus,
    private db: DatabaseProvider,
    private datePipe: DatePipe) {
    this.initializeApp();

    this.pages = [
      { title: 'Home', component: HomePage, icon: 'home' },
      { title: 'Feeding', component: FeedingPage, icon: 'custom-bottle' },
      { title: 'Diapering', component: DiaperingPage, icon: 'custom-diaper' },
      { title: 'Sleeping', component: SleepingPage, icon: 'custom-sleeping-baby' },
      { title: 'Playing', component: PlayingPage, icon: 'custom-cubes' },
      { title: 'Growth', component: GrowthPage, icon: 'custom-growth' },
      { title: 'PhotoShoot', component: CameraPage, icon: 'custom-camera' },
      { title: 'Credits', component: CreditsPage, icon: 'custom-cited'}
    ];

    this.activePage = this.pages[0];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.createAuthObservable();
  }

  createAuthObservable(){
    // Logic to check if users are logged in or not.
    this.userSubscription = this.auth.afAuth.authState.subscribe( user => {
      if(user){
        // if(user.displayName){
        //   this.user.setUserName(user.name);
        // };
        // if(user.photoURL){
        //   this.user.setUserPicture(user.photoURL);
        // }
        if(user.email){
          this.user.setUserEmail(user.email);
        };
        if(user.uid){
          this.user.setUserId(user.uid);
          this.db.setNewUserNewBaby(user.uid);
          this.createBabyObservable(user.uid);
        };

        console.log("App::initializeApp(): User logged in: ", user);
        console.log("Subscription: ", this.userSubscription);
        this.nav.setRoot(HomePage);
      } else {
        console.log("App::initializeApp(): No user exists...going to WelcomePage.");
        this.nav.setRoot(WelcomePage);
      };
    });
  }

  createBabyObservable(userId: any){
    let db = firebase.firestore();

    db.settings({
      timestampsInSnapshots: true
    });

    let currentUserRef = db.collection('users').doc(userId).collection('babies');
    currentUserRef.onSnapshot((snapShot) => {
      snapShot.docChanges().forEach((change) => {
        let baby = change.doc.data();
        this.babyName = baby.firstName;
        this.babyBirthday = baby.birthday;
        this.calculateAge(this.babyBirthday);
        console.log("Apps.component::createBabyObservable: babyFirstname:", this.babyName);
        console.log("Apps.component::createBabyObservable: babyBirthday:", this.babyBirthday);
      });
    });
  }

  calculateAge(birthday : any){
    let todayUnformatted = new Date();
    let today = this.datePipe.transform(todayUnformatted, 'yyyy-MM-dd');
    // console.log("today ", today);
    let splitToday = today.split('-');
    // console.log("split today", splitToday);
    let splitBirthday = birthday.split('-');
    // console.log("split birthday", splitBirthday);

    // Calculate the year, month, day by taking the difference
    this.bdayYear = Number(splitToday[0]) - Number(splitBirthday[0]);
    console.log("Year difference:", this.bdayYear);
    this.bdayMonth = Number(splitToday[1]) - Number(splitBirthday[1]);
    console.log("Month difference:", this.bdayMonth);
    // let day = Number(splitToday[2]) - Number(splitBirthday[2]);
    // console.log("Year difference:", day);
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.menu.close();
    this.nav.setRoot(page.component);
    this.activePage = page;
  }

  checkActive(page){
    return page == this.activePage;
  }

  logout() {
	  this.menu.close();
	  this.auth.signOut();
    this.googlePlus.logout().then(() => {
    }, error => {
      console.log("App::logout(): error: ", error);
    });
    this.user.deleteUser();
	  this.nav.setRoot(WelcomePage);
    this.activePage = this.pages[0];
    console.log("App::logOut(): User logged out");
  }

}
