import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController, ModalController, ToastController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Subscription} from 'rxjs/Subscription';
import { UserProvider } from '../providers/user/user';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { GooglePlus } from '@ionic-native/google-plus';
import { DatabaseProvider } from '../providers/database/database';
import { FcmProvider } from '../providers/fcm/fcm';
import { BabyProvider } from '../providers/baby/baby';

// Pages:
import { HomePage } from '../pages/home/home';
import { WelcomePage } from '../pages/welcome/welcome';
import { FeedingPage } from '../pages/feeding/feeding';
import { DiaperingPage } from '../pages/diapering/diapering';
import { SleepingPage } from '../pages/sleeping/sleeping';
import { GrowthPage } from '../pages/growth/growth';
import { CreditsPage } from '../pages/credits/credits';
import { CameraPage } from '../pages/camera/camera';
import { EditBabyModalPage } from '../pages/edit-baby-modal/edit-baby-modal';
import { AlarmsPage } from '../pages/alarms/alarms';

import firebase from 'firebase';
import 'firebase/firestore';
import { async } from '@firebase/util';

declare var cordova;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
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

  myModal: any;
  babyArray: any;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private auth: AuthServiceProvider,
    private menu: MenuController,
    private user: UserProvider,
    private googlePlus: GooglePlus,
    private db: DatabaseProvider,
    private modal: ModalController,
    private fcm: FcmProvider,
    private baby: BabyProvider,
    private toastCtrl: ToastController
    ) {
    this.initializeApp();

    this.pages = [
      { title: 'Home', component: HomePage, icon: 'home' },
      { title: 'Feeding', component: FeedingPage, icon: 'custom-bottle' },
      { title: 'Diapering', component: DiaperingPage, icon: 'custom-diaper' },
      { title: 'Sleeping', component: SleepingPage, icon: 'custom-sleeping-baby' },
      { title: 'Growth', component: GrowthPage, icon: 'custom-growth' },
      { title: 'PhotoShoot', component: CameraPage, icon: 'custom-camera' },
      { title: 'Alarms', component: AlarmsPage, icon: 'alarm' },
      { title: 'Credits', component: CreditsPage, icon: 'custom-cited'},
    ];

    this.activePage = this.pages[0];
  }

  async initializeApp() {
    await this.platform.ready().then(async () => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //this.statusBar.styleDefault();
      this.splashScreen.hide();
      // if(this.summaryArray.length != 0){
      //   this.summaryArray.splice(0, this.summaryArray.length);
      // };
    }).then(() => {
      this.createUserAuthObservable()
      // this.createBabyObservable();
    }).then(() => {
      // For alarms
      cordova.plugins.notification.local.on("cancel", notification => {
        console.log("Local notification canceled: " + notification.id);

        if(notification.id == 1){
          cordova.plugins.notification.local.isScheduled(1, scheduled => {
            console.log("Is id:", notification.id, "scheduled? ", scheduled ? 'Yes' : 'No');
          });
        } else if(notification.id == 2){
          cordova.plugins.notification.local.isScheduled(2, scheduled => {
            console.log("Is id:", notification.id, "scheduled? ", scheduled ? 'Yes' : 'No');
          });
        }

        this.alarmCancelAlert(notification.id);
      });

      cordova.plugins.notification.local.on('clear', () => {
        cordova.plugins.notification.local.clear(1);
      });
    });

  }

  alarmCancelAlert(id: any){
    let message: any;
    let babyFirstName = this.baby.getBabyFirstName();

    if(id === 1){
      // BottleFeeding
      message = babyFirstName + " recurring alarm for bottle-feeding was turned off.";
    } else if(id === 2){
      message = babyFirstName + " recurring alarm for breast-feeding was turned off.";
    };

    let toast = this.toastCtrl.create({
      message: message,
      duration: 4000,
      position: "bottom"
    });
    toast.present();
  }

  async createUserAuthObservable(){
    return new Promise(async resolve => {
      // Logic to check if users are logged in or not.
      this.userSubscription = this.auth.afAuth.authState.subscribe( user => {
        if(user){
          if(user.email){
            this.user.setUserEmail(user.email);
          };
          if(user.uid){
            this.user.setUserId(user.uid).then(async () =>{
              await this.db.setNewUser(user).then( async retVal => {
                console.log("Set new user finished")
                resolve(this.createBabyObservable());
              });
            });
          }
        } else {
          console.log("App::initializeApp(): No user exists...going to WelcomePage.");
          resolve(this.nav.setRoot(WelcomePage));
        };
      }, error => {
        console.log("Error while subscribing to authstate", error);
      });
    });
  }

  createBabyObservable(){
    return new Promise(async resolve => {
      console.log("Creating baby observable");
      let currentBabyRef = await this.db.getCurrentBabyRef();
      await currentBabyRef.onSnapshot(async (snapShot) => {
        let count: number = 0;
        let skip: boolean = false;
        let babyArray = [];

        await snapShot.forEach(async (doc) => {
          count = count + 1;
          let babyObject = doc.data();
          babyArray.push(babyObject);

          if(babyObject.current == true){
            console.log("Found baby to use");
            this.baby.setBabyObject(babyObject);
            await this.db.calculateAge();
            this.bdayYear = this.db.bdayYear;
            this.bdayMonth = this.db.bdayMonth;
            this.babyName = this.baby.getBabyFirstName();
            skip = true;
          }
        });
        // Update the babies array in the db
        console.log("Setting babies in db");
        this.db.setBabiesArray(babyArray);
        // If we have only one baby use that baby, else ask user which
        // baby to use.
        if (count == 0 && skip == false){
          console.log("Creating first baby file");
          this.db.createNewBaby().then(async () => {
            await this.db.calculateAge();
            this.bdayYear = this.db.bdayYear
            this.bdayMonth = this.db.bdayMonth;
            this.babyName = this.baby.getBabyFirstName();
            this.db.setCurrentBabyFlag(this.babyName);
            resolve(this.nav.setRoot(HomePage));
          });
        };
        console.log("Done with baby observable going to home page");
        resolve(this.nav.setRoot(HomePage));
      });
    });
  }

  setYearMonth(year: any, month: any){
    this.bdayYear = year;
    this.bdayMonth = month;
    this.babyName = this.baby.getBabyFirstName();
  }

  // NOTE: working on this...settings are lagging away by one set
  async editBabyProfile(){
    console.log("Editing baby profile");
    this.db.editBabyProfile().then(() => {
      this.bdayYear - this.db.bdayYear;
      this.bdayMonth = this.db.bdayMonth;
      this.babyName = this.db.babyName;
    });
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
    //this.userSubscription.unsubscribe();
    //this.db.removeSubs();
    console.log("App::logOut(): User logged out");
  }

}
