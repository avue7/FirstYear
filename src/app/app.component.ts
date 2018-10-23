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

import firebase from 'firebase';
import 'firebase/firestore';
import { async } from '@firebase/util';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  userSubscription: Subscription;
  summaryArray: string[] = new Array();

  pages: Array<{title: string, component: any, icon: string}>;
  activePage: any;

  babyName: any;
  babyAge: any;
  babyPicture: any;
  babyBirthday: any;
  bdayYear: number;
  bdayMonth: number;

  // Observable flags
  babyObservableDone: boolean = false;

  // Has history Flags
  hasHistoryFlagsArray: string[] = new Array();

  // NOTE: Add to this damn list as activities grows.
  activitiesArray: string[] = new Array("bottlefeeding", "breastfeeding", "meal", "diapering", "sleeping");

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private auth: AuthServiceProvider,
    private menu: MenuController,
    private user: UserProvider,
    private googlePlus: GooglePlus,
    private db: DatabaseProvider) {
    this.initializeApp();

    this.pages = [
      { title: 'Home', component: HomePage, icon: 'home' },
      { title: 'Feeding', component: FeedingPage, icon: 'custom-bottle' },
      { title: 'Diapering', component: DiaperingPage, icon: 'custom-diaper' },
      { title: 'Sleeping', component: SleepingPage, icon: 'custom-sleeping-baby' },
      { title: 'Playing', component: PlayingPage, icon: 'custom-cubes' },
      { title: 'Growth', component: GrowthPage, icon: 'custom-growth' },
      { title: 'PhotoShoot', component: CameraPage, icon: 'custom-camera' },
      { title: 'Credits', component: CreditsPage, icon: 'custom-cited'},
    ];

    this.activePage = this.pages[0];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //this.statusBar.styleDefault();
      this.splashScreen.hide();
      // if(this.summaryArray.length != 0){
      //   this.summaryArray.splice(0, this.summaryArray.length);
      // };
      this.createAuthObservable();
    });
  }

  createAuthObservable(){
    return new Promise(resolve => {
      // Logic to check if users are logged in or not.
      this.userSubscription = this.auth.afAuth.authState.subscribe( user => {
        if(user){
          if(user.email){
            this.user.setUserEmail(user.email);
          };
          if(user.uid){
            this.user.setUserId(user.uid).then(() =>{
              this.db.setNewUserNewBaby(user.uid).then(retVal => {
                // User decided to add baby later
                if(retVal == "later"){
                  this.bdayYear = 0;
                  this.bdayMonth = 0;
                  this.babyName = "No baby added yet!";
                  resolve();
                }
                // No baby file found but user added baby
                else {
                  // Create a baby observable as soon as the user adds him or her
                  console.log("App:: Creating baby observable...");
                  this.db.createBabyObservable(user.uid).then((retVal) => {
                    this.bdayYear = this.db.bdayYear;
                    this.bdayMonth = this.db.bdayMonth;
                    this.babyName = this.db.babyName;
                    this.babyObservableDone = true;
                    // this.db.createBottleFeedingHistoryObservable(user.uid).then(() => {
                    //   console.log("APPS:: BottleFeedingHistoryObservable updated");
                    console.log("App:: done creating baby observable!");
                    this.createHistoryObservables(user).then(() => {
                      console.log("6. App:: done with history observable creation: history array :", this.summaryArray);
                      resolve(this.nav.setRoot(HomePage, {flags: this.summaryArray}));
                    });
                  });
                }
              });
            });
          } else {
            console.log("App::initializeApp(): No user exists...going to WelcomePage.");
            this.nav.setRoot(WelcomePage);
            resolve();
          };
        };
      });
    });
  }

  updateSummaryArray(activity: any){
    return new Promise(resolve => {
      this.summaryArray.push(activity);
      resolve(true);
    });
  }

  async createHistoryObservables(user: any){
      for (let activity of this.activitiesArray){
        let activityRef: any;
        await this.db.getActivityReference(activity).then( async(_activityRef) => {
          console.log("1....database:: getActivityReference returned");
          activityRef = _activityRef;
        }).then(async() => {
          // await activityRef.get().then( async(query) => {
          //   console.log("2....database:: query size is", query.size, "for <", activity, ">");
          //   let collectionExists: any;
          //   if(query.size == 0){
          //     console.log("3. no history exists for <", activity, ">");
          //     //return false;
          //   } else {
              console.log("2. Creating observable for <", activity, "> ....");
              if(activity == "bottlefeeding"){
                console.log("3b) activity is bottlefeeding");
                await this.db.createBottleFeedingHistoryObservable(user.uid, activityRef).then(async() => {
                  await this.updateSummaryArray("bottlefeeding");
                });
              } else if(activity == "meal"){
                await this.db.createMealHistoryObservable(user.uid, activityRef).then(async() => {
                  await this.updateSummaryArray("meal");
                });
              };
              //return true;
          //   };
          // });
        });
        console.log("-----Done creating history observable-----");
      };
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
    this.summaryArray.splice(0, this.summaryArray.length);
    console.log("App::logOut(): User logged out");
  }

}
